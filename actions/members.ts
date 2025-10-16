"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { prismaForOrg } from "@/lib/org-prisma";
import { canManageMembers, canAssignRole } from "@/lib/roles";
import { ActionType, EntityType, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import * as z from "zod";

// Validation schema for role update
const updateRoleSchema = z.object({
  targetUserId: z.string().min(1, "User ID is required"),
  newRole: z.nativeEnum(UserRole),
});

type UpdateRoleData = z.infer<typeof updateRoleSchema>;

// Helper function to create activity log
async function createActivity(
  actionType: ActionType,
  entityId: string,
  actorId: string,
  organizationId: string,
  payload?: any
) {
  try {
    const db = prismaForOrg(organizationId);
    await db.activity.create({
      data: {
        actionType,
        entityType: EntityType.USER,
        entityId,
        actorId,
        organizationId,
        payload: payload || {},
      },
    });
  } catch (error) {
    console.error("Failed to create activity log:", error);
  }
}

/**
 * Update a user's role within the organization
 */
export async function updateUserRole(data: UpdateRoleData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!session.user.organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Check if user can manage members
    if (!canManageMembers(session.user.role)) {
      throw new Error("Insufficient permissions to manage members");
    }

    const validatedData = updateRoleSchema.parse(data);

    // Prevent self-role changes
    if (validatedData.targetUserId === session.user.id) {
      throw new Error("You cannot change your own role. Ask another administrator.");
    }

    // Check if user can assign the target role
    if (!canAssignRole(session.user.role, validatedData.newRole)) {
      throw new Error(`Cannot assign role ${validatedData.newRole} - insufficient permissions`);
    }

    // Get target user and verify they're in the same organization
    const targetUser = await prisma.user.findFirst({
      where: {
        id: validatedData.targetUserId,
        organizationId: session.user.organizationId,
      },
    });

    if (!targetUser) {
      throw new Error("User not found or not in your organization");
    }

    // Check if this would remove the last ORG_OWNER
    if (targetUser.role === UserRole.ORG_OWNER && validatedData.newRole !== UserRole.ORG_OWNER) {
      // Count remaining ORG_OWNERs
      const orgOwnerCount = await prisma.user.count({
        where: {
          organizationId: session.user.organizationId,
          role: UserRole.ORG_OWNER,
        },
      });

      if (orgOwnerCount <= 1) {
        throw new Error("Cannot remove the last organization owner. Assign another owner first.");
      }
    }

    const oldRole = targetUser.role;

    // Update user role
    await prisma.user.update({
      where: { id: validatedData.targetUserId },
      data: { role: validatedData.newRole },
    });

    // Log activity
    await createActivity(
      ActionType.MEMBER_ROLE_CHANGED,
      validatedData.targetUserId,
      session.user.id,
      session.user.organizationId,
      {
        targetUserName: targetUser.name || targetUser.email,
        targetUserEmail: targetUser.email,
        oldRole,
        newRole: validatedData.newRole,
        changedBy: session.user.name || session.user.email,
      }
    );

    revalidatePath("/dashboard/admin/members");

    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user role",
    };
  }
}

/**
 * Remove a user from the organization
 */
export async function removeUser(targetUserId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!session.user.organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Check if user can manage members
    if (!canManageMembers(session.user.role)) {
      throw new Error("Insufficient permissions to remove members");
    }

    // Prevent self-removal unless there's another ORG_OWNER
    if (targetUserId === session.user.id) {
      const orgOwnerCount = await prisma.user.count({
        where: {
          organizationId: session.user.organizationId,
          role: UserRole.ORG_OWNER,
        },
      });

      if (orgOwnerCount <= 1) {
        throw new Error("Cannot remove yourself as the last organization owner.");
      }
    }

    // Get target user and verify they're in the same organization
    const targetUser = await prisma.user.findFirst({
      where: {
        id: targetUserId,
        organizationId: session.user.organizationId,
      },
    });

    if (!targetUser) {
      throw new Error("User not found or not in your organization");
    }

    // Check if this would remove the last ORG_OWNER
    if (targetUser.role === UserRole.ORG_OWNER) {
      const orgOwnerCount = await prisma.user.count({
        where: {
          organizationId: session.user.organizationId,
          role: UserRole.ORG_OWNER,
        },
      });

      if (orgOwnerCount <= 1) {
        throw new Error("Cannot remove the last organization owner.");
      }
    }

    // Log activity before removal
    await createActivity(
      ActionType.MEMBER_REMOVED,
      targetUserId,
      session.user.id,
      session.user.organizationId,
      {
        removedUserName: targetUser.name || targetUser.email,
        removedUserEmail: targetUser.email,
        removedUserRole: targetUser.role,
        removedBy: session.user.name || session.user.email,
      }
    );

    // Nullify organization (preserves user account and audit trail)
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        organizationId: null,
        role: UserRole.AGENT, // Reset to default role
      },
    });

    revalidatePath("/dashboard/admin/members");

    return { success: true };
  } catch (error) {
    console.error("Failed to remove user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove user",
    };
  }
}

/**
 * Count organization owners
 */
export async function getOrgOwnerCount() {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.organizationId) {
      throw new Error("Unauthorized");
    }

    const count = await prisma.user.count({
      where: {
        organizationId: session.user.organizationId,
        role: UserRole.ORG_OWNER,
      },
    });

    return count;
  } catch (error) {
    console.error("Failed to get org owner count:", error);
    return 0;
  }
}
