"use server";

import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { prismaForOrg } from "@/lib/org-prisma";
import { ActionType, EntityType, InvitationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Validate and get invitation by token
 */
export async function getInvitationByToken(token: string) {
  try {
    if (!token) {
      throw new Error("Invalid invitation token");
    }

    // Find invitation by token
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: { name: true },
        },
        inviter: {
          select: { name: true, email: true },
        },
      },
    });

    if (!invitation) {
      return { error: "Invitation not found" };
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      return { error: "This invitation has expired" };
    }

    // Check if invitation is still pending
    if (invitation.status !== InvitationStatus.PENDING) {
      return { error: "This invitation is no longer valid" };
    }

    return { invitation };
  } catch (error) {
    console.error("Failed to get invitation:", error);
    return { error: "Failed to validate invitation" };
  }
}

/**
 * Accept invitation and join organization
 * This should be called after user signs in
 */
export async function acceptInvitation(token: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      // Store token in session for post-login processing
      return { 
        error: "Please sign in to accept this invitation",
        requiresAuth: true,
      };
    }

    // Get invitation
    const { invitation, error } = await getInvitationByToken(token);

    if (error || !invitation) {
      return { error: error || "Invalid invitation" };
    }

    // Verify email matches
    if (session.user.email !== invitation.email) {
      return { 
        error: `This invitation was sent to ${invitation.email}. Please sign in with that email address.` 
      };
    }

    // Check if user is already part of an organization
    if (session.user.organizationId && session.user.organizationId !== invitation.organizationId) {
      return { 
        error: "You are already part of another organization. Please contact support to switch organizations." 
      };
    }

    // Update user's organization and role
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    });

    // Update invitation status
    const db = prismaForOrg(invitation.organizationId);
    await db.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.ACCEPTED },
    });

    // Log activity
    await db.activity.create({
      data: {
        actionType: ActionType.MEMBER_JOINED,
        entityType: EntityType.USER,
        entityId: session.user.id,
        actorId: session.user.id,
        organizationId: invitation.organizationId,
        payload: {
          email: session.user.email,
          role: invitation.role,
          userName: session.user.name,
        },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin/members");

    return { 
      success: true, 
      organizationName: invitation.organization.name 
    };
  } catch (error) {
    console.error("Failed to accept invitation:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to accept invitation",
    };
  }
}
