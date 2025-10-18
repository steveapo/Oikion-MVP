"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageMembers, canChangeUserRole, getAssignableRolesByUser } from "@/lib/roles";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(UserRole),
});

/**
 * Get all members of the current organization
 */
export async function getMembers(): Promise<{
  success: boolean;
  members?: Array<{
    id: string;
    name: string | null;
    email: string | null;
    role: UserRole;
    image: string | null;
    createdAt: Date;
  }>;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const orgId = session.user.organizationId;
    if (!orgId) {
      throw new Error("User must belong to an organization");
    }

    const members = await prisma.user.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, members };
  } catch (error) {
    console.error("Failed to get members:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get members",
    };
  }
}

/**
 * Update a user's role
 * Rules:
 * - ORG_OWNER can change anyone's role (except their own - use transfer ownership)
 * - ADMIN can change AGENT and VIEWER roles to AGENT or VIEWER
 * - Users cannot change their own role
 */
export async function updateMemberRole(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const orgId = session.user.organizationId;
    if (!orgId) {
      throw new Error("User must belong to an organization");
    }

    // Validate input
    const validation = updateRoleSchema.safeParse({ userId, role: newRole });
    if (!validation.success) {
      throw new Error(validation.error.errors[0].message);
    }

    // Check if user can manage members
    if (!canManageMembers(session.user.role)) {
      throw new Error("Insufficient permissions to update member roles");
    }

    // Check if user can change this specific user's role to the target role
    if (!canChangeUserRole(session.user.role, userId, session.user.id, newRole)) {
      if (userId === session.user.id) {
        throw new Error("You cannot change your own role. ORG_OWNERs can transfer ownership instead.");
      }
      throw new Error(`You cannot assign the ${newRole} role`);
    }

    // Find target user
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: orgId,
      },
    });

    if (!targetUser) {
      throw new Error("User not found in your organization");
    }

    // Additional check: ADMIN cannot change ORG_OWNER or other ADMIN roles
    if (session.user.role === UserRole.ADMIN) {
      if (targetUser.role === UserRole.ORG_OWNER || targetUser.role === UserRole.ADMIN) {
        throw new Error("You cannot change the role of owners or other administrators");
      }
    }

    // Update role
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        actionType: "MEMBER_ROLE_CHANGED",
        entityType: "USER",
        entityId: userId,
        payload: { 
          oldRole: targetUser.role, 
          newRole,
          userEmail: targetUser.email 
        },
        organizationId: orgId,
        actorId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update member role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update member role",
    };
  }
}

/**
 * Remove a user from the organization
 * Sets their organizationId to NULL
 * Only ORG_OWNER and ADMIN can remove members
 */
export async function removeMember(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const orgId = session.user.organizationId;
    if (!orgId) {
      throw new Error("User must belong to an organization");
    }

    // Check permissions
    if (!canManageMembers(session.user.role)) {
      throw new Error("Insufficient permissions to remove members");
    }

    // Prevent self-removal
    if (userId === session.user.id) {
      throw new Error("You cannot remove yourself. Use the delete account option instead.");
    }

    // Find target user
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: orgId,
      },
    });

    if (!targetUser) {
      throw new Error("User not found in your organization");
    }

    // Prevent removing the last ORG_OWNER
    if (targetUser.role === UserRole.ORG_OWNER) {
      const ownerCount = await prisma.user.count({
        where: {
          organizationId: orgId,
          role: UserRole.ORG_OWNER,
        },
      });

      if (ownerCount <= 1) {
        throw new Error("Cannot remove the last organization owner");
      }
    }

    // Remove user from organization
    await prisma.user.update({
      where: { id: userId },
      data: { 
        organizationId: null,
        role: UserRole.AGENT, // Reset to default role
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        actionType: "MEMBER_INVITED", // Using existing enum, should add MEMBER_REMOVED
        entityType: "USER",
        entityId: userId,
        payload: { 
          action: "removed",
          userEmail: targetUser.email,
          role: targetUser.role 
        },
        organizationId: orgId,
        actorId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to remove member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove member",
    };
  }
}

/**
 * Transfer organization ownership to another member
 * Only ORG_OWNER can transfer ownership
 * The current owner becomes an ADMIN
 */
export async function transferOwnership(
  newOwnerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const orgId = session.user.organizationId;
    if (!orgId) {
      throw new Error("User must belong to an organization");
    }

    // Only ORG_OWNER can transfer ownership
    if (session.user.role !== UserRole.ORG_OWNER) {
      throw new Error("Only organization owners can transfer ownership");
    }

    // Cannot transfer to self
    if (newOwnerId === session.user.id) {
      throw new Error("You are already the owner");
    }

    // Find target user
    const targetUser = await prisma.user.findFirst({
      where: {
        id: newOwnerId,
        organizationId: orgId,
      },
    });

    if (!targetUser) {
      throw new Error("User not found in your organization");
    }

    // Perform ownership transfer in a transaction
    await prisma.$transaction([
      // Demote current owner to ADMIN
      prisma.user.update({
        where: { id: session.user.id },
        data: { role: UserRole.ADMIN },
      }),
      // Promote new user to ORG_OWNER
      prisma.user.update({
        where: { id: newOwnerId },
        data: { role: UserRole.ORG_OWNER },
      }),
      // Log activity
      prisma.activity.create({
        data: {
          actionType: "MEMBER_ROLE_CHANGED",
          entityType: "USER",
          entityId: newOwnerId,
          payload: { 
            action: "ownership_transferred",
            oldOwner: session.user.email,
            newOwner: targetUser.email,
            oldRole: targetUser.role,
            newRole: UserRole.ORG_OWNER,
          },
          organizationId: orgId,
          actorId: session.user.id,
        },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Failed to transfer ownership:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to transfer ownership",
    };
  }
}

/**
 * Get member count for the current organization
 */
export async function getMemberCount(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const orgId = session.user.organizationId;
    if (!orgId) {
      throw new Error("User must belong to an organization");
    }

    const count = await prisma.user.count({
      where: { organizationId: orgId },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Failed to get member count:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get member count",
    };
  }
}
