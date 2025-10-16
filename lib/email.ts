import { MagicLinkEmail } from "@/emails/magic-link-email";
import { EmailConfig } from "next-auth/providers/email";
import { Resend } from "resend";
import { UserRole } from "@prisma/client";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";
import { getRoleDisplayName } from "@/lib/roles";

import { getUserByEmail } from "./user";

export const resend = new Resend(env.RESEND_API_KEY);

export const sendVerificationRequest: EmailConfig["sendVerificationRequest"] =
  async ({ identifier, url, provider }) => {
    const user = await getUserByEmail(identifier);
    
    // For new users, we won't have a user record yet
    // Extract a default name from email or use a generic greeting
    const userName = user?.name || identifier.split('@')[0] || 'there';
    const userVerified = user?.emailVerified ? true : false;
    const authSubject = userVerified
      ? `Sign-in link for ${siteConfig.name}`
      : "Activate your account";

    try {
      const { data, error } = await resend.emails.send({
        from: provider.from,
        to:
          process.env.NODE_ENV === "development"
            ? "delivered@resend.dev"
            : identifier,
        subject: authSubject,
        react: MagicLinkEmail({
          firstName: userName,
          actionUrl: url,
          mailType: userVerified ? "login" : "register",
          siteName: siteConfig.name,
        }),
        // Set this to prevent Gmail from threading emails.
        // More info: https://resend.com/changelog/custom-email-headers
        headers: {
          "X-Entity-Ref-ID": new Date().getTime() + "",
        },
      });

      if (error || !data) {
        throw new Error(error?.message);
      }

      // console.log(data)
    } catch (error) {
      throw new Error("Failed to send verification email.");
    }
  };

/**
 * Send invitation email to a new organization member
 * In development, all emails go to your verified email but show the intended recipient
 */
export async function sendInvitationEmail({
  to,
  inviterName,
  organizationName,
  role,
  token,
}: {
  to: string;
  inviterName: string;
  organizationName: string;
  role: UserRole;
  token: string;
}) {
  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?email=${encodeURIComponent(to)}`;
  const roleDisplay = getRoleDisplayName(role);
  
  // In development, send to your own email for testing
  // In production, send to the actual recipient
  const recipientEmail = process.env.NODE_ENV === 'development' 
    ? process.env.DEV_EMAIL_RECIPIENT || 'oikion.parent@gmail.com'
    : to;

  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: recipientEmail,
      subject: process.env.NODE_ENV === 'development'
        ? `[DEV] Invite for ${to} to join ${organizationName}`
        : `You're invited to join ${organizationName} on ${siteConfig.name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
              .role-badge { background: #f3f4f6; padding: 4px 12px; border-radius: 4px; display: inline-block; margin: 10px 0; }
              .dev-notice { background: #fef3c7; border: 2px solid #fbbf24; padding: 16px; border-radius: 8px; margin: 20px 0; color: #92400e; }
              .dev-info { background: #e0f2fe; border: 1px solid #0284c7; padding: 12px; border-radius: 6px; margin: 10px 0; color: #075985; }
            </style>
          </head>
          <body>
            <div class="container">
              ${process.env.NODE_ENV === 'development' ? `
              <div class="dev-notice">
                <strong>🧪 DEVELOPMENT MODE - TESTING EMAIL</strong><br>
                <div class="dev-info" style="margin-top: 10px;">
                  <strong>Intended Recipient:</strong> ${to}<br>
                  <strong>Actual Recipient:</strong> ${recipientEmail}<br>
                  <strong>Organization:</strong> ${organizationName}<br>
                  <strong>Role:</strong> ${roleDisplay}
                </div>
                <p style="margin-top: 10px; font-size: 13px;">
                  In production, this email would be delivered to <strong>${to}</strong>.<br>
                  For testing, use the accept link below with the intended email address.
                </p>
              </div>
              ` : ''}
              <div class="header">
                <h1>${siteConfig.name}</h1>
                <p>You've been invited!</p>
              </div>
              <div class="content">
                <p>Hi ${process.env.NODE_ENV === 'development' ? `(Testing for: ${to})` : 'there'},</p>
                <p><strong>${inviterName}</strong> has invited ${process.env.NODE_ENV === 'development' ? `<strong>${to}</strong>` : 'you'} to join <strong>${organizationName}</strong> on ${siteConfig.name}.</p>
                <p>You've been assigned the role: <span class="role-badge"><strong>${roleDisplay}</strong></span></p>
                <p>Click the button below to accept this invitation and create your account:</p>
                <p style="text-align: center;">
                  <a href="${acceptUrl}" class="button">Accept Invitation</a>
                </p>
                <p style="color: #6b7280; font-size: 14px;">Or copy and paste this URL into your browser:<br>
                <a href="${acceptUrl}">${acceptUrl}</a></p>
                ${process.env.NODE_ENV === 'development' ? `
                <div style="background: #fef3c7; padding: 12px; border-radius: 6px; margin-top: 20px;">
                  <strong>👉 Testing Instructions:</strong><br>
                  1. Open the link above<br>
                  2. Sign up with email: <strong>${to}</strong><br>
                  3. User will be auto-assigned to the organization
                </div>
                ` : ''}
                <p style="color: #ef4444; font-size: 14px; margin-top: 20px;">⚠️ This invitation will expire in 7 days.</p>
              </div>
              <div class="footer">
                <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                <p>© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      headers: {
        "X-Entity-Ref-ID": new Date().getTime() + "",
      },
    });

    if (error) {
      console.error("Failed to send invitation email:", error);
      throw new Error(error.message);
    }

    // Log success with details
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [DEV] Invitation email sent`);
      console.log(`   Intended for: ${to}`);
      console.log(`   Sent to: ${recipientEmail}`);
      console.log(`   Role: ${roleDisplay}`);
      console.log(`   View: Check your inbox at ${recipientEmail}`);
    } else {
      console.log(`✅ Invitation email sent to ${to}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    throw error;
  }
}
