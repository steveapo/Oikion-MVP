"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { prismaForOrg } from "@/lib/org-prisma";
import { canManageMembers, canAssignRole } from "@/lib/roles";
import { ActionType, EntityType, InvitationStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { Resend } from "resend";
import * as z from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

// Validation schema for invitation
const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(UserRole),
});

type InviteUserData = z.infer<typeof inviteUserSchema>;

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
 * Invite a user to join the organization
 */
export async function inviteUser(data: InviteUserData) {
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
      throw new Error("Insufficient permissions to invite members");
    }

    const validatedData = inviteUserSchema.parse(data);

    // Check if user can assign the target role
    if (!canAssignRole(session.user.role, validatedData.role)) {
      throw new Error(`Cannot assign role ${validatedData.role} - insufficient permissions`);
    }

    const db = prismaForOrg(session.user.organizationId!);

    // Check if user with email already exists in organization
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        organizationId: session.user.organizationId,
      },
    });

    if (existingUser) {
      throw new Error("User with this email is already a member of the organization");
    }

    // Check if there's already a pending invitation
    const existingInvitation = await db.invitation.findFirst({
      where: {
        email: validatedData.email,
        organizationId: session.user.organizationId,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      throw new Error("An invitation has already been sent to this email");
    }

    // Generate cryptographically secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = await db.invitation.create({
      data: {
        email: validatedData.email,
        role: validatedData.role,
        token,
        status: InvitationStatus.PENDING,
        organizationId: session.user.organizationId,
        invitedBy: session.user.id,
        expiresAt,
      },
    });

    // Get organization name for email
    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { name: true },
    });

    // Send invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${token}`;
    
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Oikion <onboarding@resend.dev>",
        to: validatedData.email,
        subject: `You're invited to join ${organization?.name || "an organization"} on Oikion`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">You're invited!</h1>
            <p>
              <strong>${session.user.name || session.user.email}</strong> has invited you to join 
              <strong>${organization?.name || "their organization"}</strong> as a <strong>${validatedData.role}</strong> on Oikion.
            </p>
            <p>
              Oikion is the operating system for real-estate agencies, helping teams manage properties, 
              clients, and collaboration in one place.
            </p>
            <p style="margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="background-color: #0070f3; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Accept Invitation
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">
              This invitation expires on ${expiresAt.toLocaleDateString()}.
            </p>
            <p style="color: #666; font-size: 14px;">
              If you have any questions, reply to this email.
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              Thanks,<br>
              The Oikion Team
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Delete the invitation if email fails
      await db.invitation.delete({ where: { id: invitation.id } });
      throw new Error("Failed to send invitation email. Please try again.");
    }

    // Log activity
    await createActivity(
      ActionType.MEMBER_INVITED,
      invitation.id,
      session.user.id,
      session.user.organizationId,
      {
        email: validatedData.email,
        role: validatedData.role,
        invitedBy: session.user.name || session.user.email,
      }
    );

    revalidatePath("/dashboard/admin/members");

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
 * Cancel a pending invitation
 */
export async function cancelInvitation(invitationId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!session.user.organizationId) {
      throw new Error("User must belong to an organization");
    }

    if (!canManageMembers(session.user.role)) {
      throw new Error("Insufficient permissions to cancel invitations");
    }

    const db = prismaForOrg(session.user.organizationId!);

    // Get invitation
    const invitation = await db.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId: session.user.organizationId,
      },
    });

    if (!invitation) {
      throw new Error("Invitation not found or access denied");
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error("Can only cancel pending invitations");
    }

    // Update invitation status
    await db.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.CANCELED },
    });

    // Log activity
    await createActivity(
      ActionType.INVITATION_CANCELED,
      invitationId,
      session.user.id,
      session.user.organizationId,
      {
        email: invitation.email,
        role: invitation.role,
        canceledBy: session.user.name || session.user.email,
      }
    );

    revalidatePath("/dashboard/admin/members");

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
 * Resend an invitation email
 */
export async function resendInvitation(invitationId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!session.user.organizationId) {
      throw new Error("User must belong to an organization");
    }

    if (!canManageMembers(session.user.role)) {
      throw new Error("Insufficient permissions to resend invitations");
    }

    const db = prismaForOrg(session.user.organizationId!);

    // Get invitation
    const invitation = await db.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId: session.user.organizationId,
      },
    });

    if (!invitation) {
      throw new Error("Invitation not found or access denied");
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error("Can only resend pending invitations");
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error("Invitation has expired");
    }

    // Get organization name
    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { name: true },
    });

    // Resend email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${invitation.token}`;
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Oikion <onboarding@resend.dev>",
      to: invitation.email,
      subject: `Reminder: You're invited to join ${organization?.name || "an organization"} on Oikion`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">You're invited!</h1>
          <p>
            <strong>${session.user.name || session.user.email}</strong> has invited you to join 
            <strong>${organization?.name || "their organization"}</strong> as a <strong>${invitation.role}</strong> on Oikion.
          </p>
          <p>
            Oikion is the operating system for real-estate agencies, helping teams manage properties, 
            clients, and collaboration in one place.
          </p>
          <p style="margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background-color: #0070f3; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Accept Invitation
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This invitation expires on ${invitation.expiresAt.toLocaleDateString()}.
          </p>
          <p style="color: #666; font-size: 14px;">
            If you have any questions, reply to this email.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Thanks,<br>
            The Oikion Team
          </p>
        </div>
      `,
    });

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
 * Get pending invitations for organization
 */
export async function getInvitations() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!session.user.organizationId) {
      throw new Error("User must belong to an organization");
    }

    if (!canManageMembers(session.user.role)) {
      throw new Error("Insufficient permissions to view invitations");
    }

    const db = prismaForOrg(session.user.organizationId!);

    const invitations = await db.invitation.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      include: {
        inviter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return invitations;
  } catch (error) {
    console.error("Failed to get invitations:", error);
    throw error;
  }
}

/**
 * Get organization members
 */
export async function getOrganizationMembers() {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.organizationId) {
      throw new Error("Unauthorized");
    }

    // Note: User table does not have RLS, use prisma directly
    const members = await prisma.user.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return members;
  } catch (error) {
    console.error("Failed to get organization members:", error);
    throw error;
  }
}
