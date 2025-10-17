"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode,
  type ActionResponse 
} from "@/lib/action-response";
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
export async function getMembers(): Promise<ActionResponse<{
  members: Array<{
    id: string;
    name: string | null;
    email: string | null;
    role: UserRole;
    image: string | null;
    createdAt: Date;
  }>;
}>> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  try {
    const members = await prisma.user.findMany({
      where: { organizationId: user.organizationId },
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

    return createSuccessResponse({ members });
  } catch (error) {
    console.error("Failed to get members:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to load members. Please try again."
    );
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
): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Validation
  const validation = updateRoleSchema.safeParse({ userId, role: newRole });
  if (!validation.success) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      validation.error.errors[0].message
    );
  }

  // Check if user can manage members
  if (!canManageMembers(user.role)) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You don't have permission to update member roles."
    );
  }

  // Check if user can change this specific user's role to the target role
  if (!canChangeUserRole(user.role, userId, user.id, newRole)) {
    if (userId === user.id) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        "You cannot change your own role. ORG_OWNERs can transfer ownership instead."
      );
    }
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      `You cannot assign the ${newRole} role.`
    );
  }

  try {
    // Find target user
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: user.organizationId,
      },
    });

    if (!targetUser) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "User not found in your organization."
      );
    }

    // Additional check: ADMIN cannot change ORG_OWNER or other ADMIN roles
    if (user.role === UserRole.ADMIN) {
      if (targetUser.role === UserRole.ORG_OWNER || targetUser.role === UserRole.ADMIN) {
        return createErrorResponse(
          ErrorCode.INSUFFICIENT_PERMISSIONS,
          "You cannot change the role of owners or other administrators."
        );
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
        organizationId: user.organizationId,
        actorId: user.id,
      },
    });

    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to update member role:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to update member role. Please try again."
    );
  }
}

/**
 * Remove a user from the organization
 * Sets their organizationId to NULL
 * Only ORG_OWNER and ADMIN can remove members
 */
export async function removeMember(
  userId: string
): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Check permissions
  if (!canManageMembers(user.role)) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You don't have permission to remove members."
    );
  }

  // Prevent self-removal
  if (userId === user.id) {
    return createErrorResponse(
      ErrorCode.FORBIDDEN,
      "You cannot remove yourself. Use the delete account option instead."
    );
  }

  try {
    // Find target user
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: user.organizationId,
      },
    });

    if (!targetUser) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "User not found in your organization."
      );
    }

    // Prevent removing the last ORG_OWNER
    if (targetUser.role === UserRole.ORG_OWNER) {
      const ownerCount = await prisma.user.count({
        where: {
          organizationId: user.organizationId,
          role: UserRole.ORG_OWNER,
        },
      });

      if (ownerCount <= 1) {
        return createErrorResponse(
          ErrorCode.CONFLICT,
          "Cannot remove the last organization owner."
        );
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
        organizationId: user.organizationId,
        actorId: user.id,
      },
    });

    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to remove member:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to remove member. Please try again."
    );
  }
}

/**
 * Transfer organization ownership to another member
 * Only ORG_OWNER can transfer ownership
 * The current owner becomes an ADMIN
 */
export async function transferOwnership(
  newOwnerId: string
): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Only ORG_OWNER can transfer ownership
  if (user.role !== UserRole.ORG_OWNER) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "Only organization owners can transfer ownership."
    );
  }

  // Cannot transfer to self
  if (newOwnerId === user.id) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      "You are already the owner."
    );
  }

  try {
    // Find target user
    const targetUser = await prisma.user.findFirst({
      where: {
        id: newOwnerId,
        organizationId: user.organizationId,
      },
    });

    if (!targetUser) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "User not found in your organization."
      );
    }

    // Perform ownership transfer in a transaction
    await prisma.$transaction([
      // Demote current owner to ADMIN
      prisma.user.update({
        where: { id: user.id },
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
            oldOwner: user.email,
            newOwner: targetUser.email,
            oldRole: targetUser.role,
            newRole: UserRole.ORG_OWNER,
          },
          organizationId: user.organizationId,
          actorId: user.id,
        },
      }),
    ]);

    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to transfer ownership:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to transfer ownership. Please try again."
    );
  }
}

/**
 * Get member count for the current organization
 */
export async function getMemberCount(): Promise<ActionResponse<{ count: number }>> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  try {
    const count = await prisma.user.count({
      where: { organizationId: user.organizationId },
    });

    return createSuccessResponse({ count });
  } catch (error) {
    console.error("Failed to get member count:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to load member count. Please try again."
    );
  }
}
