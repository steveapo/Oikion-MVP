"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode,
  type ActionResponse 
} from "@/lib/action-response";
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
): Promise<ActionResponse<{ invitationId: string }>> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Check permissions
  if (!canManageMembers(user.role)) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You don't have permission to invite users."
    );
  }

  // Validate input
  const validation = inviteUserSchema.safeParse({ email, role });
  if (!validation.success) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      validation.error.errors[0].message
    );
  }

  try {
    // Check if user already exists in the organization (via membership)
    const existingMembership = await prisma.organizationMember.findFirst({
      where: {
        user: {
          email: email.toLowerCase(),
        },
        organizationId: user.organizationId,
      },
    });

    if (existingMembership) {
      return createErrorResponse(
        ErrorCode.ALREADY_EXISTS,
        "User is already a member of this organization."
      );
    }

    // Check for pending invitation
    const pendingInvitation = await prisma.invitation.findFirst({
      where: {
        email: email.toLowerCase(),
        organizationId: user.organizationId,
        status: InvitationStatus.PENDING,
      },
    });

    if (pendingInvitation) {
      return createErrorResponse(
        ErrorCode.ALREADY_EXISTS,
        "An invitation has already been sent to this email."
      );
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
        organizationId: user.organizationId,
        invitedBy: user.id,
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
        organizationId: user.organizationId,
        actorId: user.id,
      },
    });

    return createSuccessResponse({ invitationId: invitation.id });
  } catch (error) {
    console.error("Failed to invite user:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to invite user. Please try again."
    );
  }
}

/**
 * Accept an invitation
 * This is called during the sign-up/sign-in flow
 */
export async function acceptInvite(
  token: string,
  userId: string
): Promise<ActionResponse<{ organizationId: string }>> {
  // Validate token
  const validation = tokenSchema.safeParse(token);
  if (!validation.success) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      "Invalid invitation token."
    );
  }

  try {
    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invitation) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Invitation not found."
      );
    }

    // Check if expired
    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Invitation has expired."
      );
    }

    // Check if already accepted
    if (invitation.status !== InvitationStatus.PENDING) {
      return createErrorResponse(
        ErrorCode.CONFLICT,
        `Invitation is ${invitation.status.toLowerCase()}.`
      );
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

    return createSuccessResponse({ organizationId: invitation.organizationId });
  } catch (error) {
    console.error("Failed to accept invitation:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to accept invitation. Please try again."
    );
  }
}

/**
 * Cancel a pending invitation
 */
export async function cancelInvite(
  invitationId: string
): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Check permissions
  if (!canManageMembers(user.role)) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You don't have permission to cancel invitations."
    );
  }

  try {
    // Find invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId: user.organizationId,
      },
    });

    if (!invitation) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Invitation not found."
      );
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      return createErrorResponse(
        ErrorCode.CONFLICT,
        "Can only cancel pending invitations."
      );
    }

    // Update status
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.CANCELED },
    });

    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to cancel invitation:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to cancel invitation. Please try again."
    );
  }
}

/**
 * Resend an invitation
 */
export async function resendInvite(
  invitationId: string
): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Check permissions
  if (!canManageMembers(user.role)) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You don't have permission to resend invitations."
    );
  }

  try {
    // Find invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId: user.organizationId,
      },
      include: {
        organization: true,
        inviter: { select: { name: true, email: true } },
      },
    });

    if (!invitation) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Invitation not found."
      );
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      return createErrorResponse(
        ErrorCode.CONFLICT,
        "Can only resend pending invitations."
      );
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
      return createErrorResponse(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        "Failed to send email. Please try again."
      );
    }

    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to resend invitation:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to resend invitation. Please try again."
    );
  }
}

/**
 * Get all invitations for the current organization
 */
export async function getInvitations(): Promise<ActionResponse<{
  invitations: Array<{
    id: string;
    email: string;
    role: UserRole;
    status: InvitationStatus;
    expiresAt: Date;
    createdAt: Date;
    inviter: { name: string | null; email: string | null };
  }>;
}>> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  try {
    const invitations = await prisma.invitation.findMany({
      where: { organizationId: user.organizationId },
      include: {
        inviter: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return createSuccessResponse({ invitations });
  } catch (error) {
    console.error("Failed to get invitations:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to load invitations. Please try again."
    );
  }
}
