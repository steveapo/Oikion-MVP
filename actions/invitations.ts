"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageMembers } from "@/lib/roles";
import { sendInvitationEmail } from "@/lib/email";
import { UserRole, InvitationStatus } from "@prisma/client";
import { randomBytes } from "crypto";
import { z } from "zod";

// Validation schemas
const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: "Invalid role" }) }),
});

const tokenSchema = z.string().min(32, "Invalid token");

/**
 * Invite a user to the organization
 * Only ORG_OWNER and ADMIN can invite users
 */
export async function inviteUser(
  email: string,
  role: UserRole
): Promise<{ success: boolean; error?: string; invitationId?: string }> {
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
      throw new Error("Insufficient permissions to invite users");
    }

    // Validate input
    const validation = inviteUserSchema.safeParse({ email, role });
    if (!validation.success) {
      throw new Error(validation.error.errors[0].message);
    }

    // Check if user already exists in the organization (via membership)
    const existingMembership = await prisma.organizationMember.findFirst({
      where: {
        user: {
          email: email.toLowerCase(),
        },
        organizationId: orgId,
      },
    });

    if (existingMembership) {
      throw new Error("User is already a member of this organization");
    }

    // Check for pending invitation
    const pendingInvitation = await prisma.invitation.findFirst({
      where: {
        email: email.toLowerCase(),
        organizationId: orgId,
        status: InvitationStatus.PENDING,
      },
    });

    if (pendingInvitation) {
      throw new Error("An invitation has already been sent to this email");
    }

    // Generate secure token
    const token = randomBytes(32).toString("hex");

    // Create invitation (expires in 7 days)
    const invitation = await prisma.invitation.create({
      data: {
        email: email.toLowerCase(),
        role,
        token,
        status: InvitationStatus.PENDING,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        organizationId: orgId,
        invitedBy: session.user.id,
      },
      include: {
        organization: true,
        inviter: { select: { name: true, email: true } },
      },
    });

    // Send invitation email
    try {
      await sendInvitationEmail({
        to: email,
        inviterName: invitation.inviter.name || invitation.inviter.email || "A team member",
        organizationName: invitation.organization.name,
        role,
        token,
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Don't fail the whole operation if email fails
      // The invitation is still created and can be manually shared
    }

    // Log activity
    await prisma.activity.create({
      data: {
        actionType: "MEMBER_INVITED",
        entityType: "USER",
        entityId: invitation.id,
        payload: { email, role },
        organizationId: orgId,
        actorId: session.user.id,
      },
    });

    return { success: true, invitationId: invitation.id };
  } catch (error) {
    console.error("Failed to invite user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to invite user",
    };
  }
}

/**
 * Accept an invitation
 * This is called during the sign-up/sign-in flow
 */
export async function acceptInvite(
  token: string,
  userId: string
): Promise<{ success: boolean; error?: string; organizationId?: string }> {
  try {
    // Validate token
    const validation = tokenSchema.safeParse(token);
    if (!validation.success) {
      throw new Error("Invalid invitation token");
    }

    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Check if expired
    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new Error("Invitation has expired");
    }

    // Check if already accepted
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error(`Invitation is ${invitation.status.toLowerCase()}`);
    }

    // Update user's current organization and role
    await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    });

    // Create organization membership
    await prisma.organizationMember.create({
      data: {
        userId: userId,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    });

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.ACCEPTED },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        actionType: "MEMBER_INVITED",
        entityType: "USER",
        entityId: userId,
        payload: { email: invitation.email, role: invitation.role },
        organizationId: invitation.organizationId,
        actorId: userId,
      },
    });

    return { success: true, organizationId: invitation.organizationId };
  } catch (error) {
    console.error("Failed to accept invitation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept invitation",
    };
  }
}

/**
 * Cancel a pending invitation
 */
export async function cancelInvite(
  invitationId: string
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
      throw new Error("Insufficient permissions to cancel invitations");
    }

    // Find invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId: orgId,
      },
    });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error("Can only cancel pending invitations");
    }

    // Update status
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.CANCELED },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to cancel invitation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel invitation",
    };
  }
}

/**
 * Resend an invitation
 */
export async function resendInvite(
  invitationId: string
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
      throw new Error("Insufficient permissions to resend invitations");
    }

    // Find invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId: orgId,
      },
      include: {
        organization: true,
        inviter: { select: { name: true, email: true } },
      },
    });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error("Can only resend pending invitations");
    }

    // Extend expiration
    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    });

    // Resend invitation email
    try {
      await sendInvitationEmail({
        to: invitation.email,
        inviterName: invitation.inviter.name || invitation.inviter.email || "A team member",
        organizationName: invitation.organization.name,
        role: invitation.role,
        token: invitation.token,
      });
    } catch (emailError) {
      console.error("Failed to resend invitation email:", emailError);
      throw new Error("Failed to send email. Please try again.");
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to resend invitation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resend invitation",
    };
  }
}

/**
 * Get all invitations for the current organization
 */
export async function getInvitations(): Promise<{
  success: boolean;
  invitations?: Array<{
    id: string;
    email: string;
    role: UserRole;
    status: InvitationStatus;
    expiresAt: Date;
    createdAt: Date;
    inviter: { name: string | null; email: string | null };
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

    const invitations = await prisma.invitation.findMany({
      where: { organizationId: orgId },
      include: {
        inviter: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, invitations };
  } catch (error) {
    console.error("Failed to get invitations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get invitations",
    };
  }
}
