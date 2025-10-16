import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";
import Resend from "next-auth/providers/resend";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { sendVerificationRequest } from "@/lib/email";
import { getUserById } from "@/lib/user";

// More info: https://authjs.dev/getting-started/typescript#module-augmentation
declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
      organizationId?: string;
      organizationName?: string;
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    // error: "/auth/error",
  },
  providers: [
    // Spread edge-compatible providers from auth.config.ts (Google)
    ...authConfig.providers,
    // Add the Resend email provider here (not in auth.config.ts)
    // This keeps it out of the Edge Runtime middleware bundle
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
  events: {
    async createUser({ user }) {
      // Every new user gets a personal organization + any invitations they accept
      if (user.id && user.email) {
        try {
          // Check if user already has a personal organization (edge case prevention)
          const existingPersonalOrg = await prisma.organizationMember.findFirst({
            where: {
              userId: user.id,
              organization: {
                isPersonal: true,
              },
            },
            include: {
              organization: true,
            },
          });

          let personalOrg;
          
          if (existingPersonalOrg) {
            // User already has a personal workspace, use it
            personalOrg = existingPersonalOrg.organization;
            console.log(`[AUTH] User ${user.email} already has personal workspace: ${personalOrg.id}`);
          } else {
            // ALWAYS create a personal organization for the new user
            personalOrg = await prisma.organization.create({
              data: {
                name: "Private Workspace",
                isPersonal: true,
                plan: "FREE",
              },
            });

            // Create membership for personal organization
            await prisma.organizationMember.create({
              data: {
                userId: user.id,
                organizationId: personalOrg.id,
                role: UserRole.ORG_OWNER,
              },
            });
          }

          // Check for pending invitation (by email OR by token if provided)
          // Note: Token would be passed during registration flow from invitation link
          const invitation = await prisma.invitation.findFirst({
            where: {
              email: user.email.toLowerCase(),
              status: "PENDING",
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
          });

          if (invitation) {
            // User was invited - create membership for invited organization
            await prisma.organizationMember.create({
              data: {
                userId: user.id,
                organizationId: invitation.organizationId,
                role: invitation.role,
              },
            });

            // Switch user to the invited organization as active
            await prisma.user.update({
              where: { id: user.id },
              data: {
                organizationId: invitation.organizationId,
                role: invitation.role,
              },
            });

            // Mark invitation as accepted
            await prisma.invitation.update({
              where: { id: invitation.id },
              data: { status: "ACCEPTED" },
            });

            // Log activity
            await prisma.activity.create({
              data: {
                actionType: "MEMBER_INVITED",
                entityType: "USER",
                entityId: user.id,
                payload: { email: user.email, role: invitation.role },
                organizationId: invitation.organizationId,
                actorId: user.id,
              },
            });
          } else {
            // No invitation - use personal organization as default
            await prisma.user.update({
              where: { id: user.id },
              data: {
                organizationId: personalOrg.id,
                role: UserRole.ORG_OWNER,
              },
            });
          }
        } catch (error) {
          console.error("Failed to setup user organization:", error);
        }
      }
    },
  },
  callbacks: {
    async session({ token, session }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }

        if (token.email) {
          session.user.email = token.email;
        }

        if (token.role) {
          session.user.role = token.role;
        }

        if (token.organizationId) {
          (session.user as any).organizationId = token.organizationId;
        }

        if (token.organizationName) {
          (session.user as any).organizationName = token.organizationName;
        }

        session.user.name = token.name;
        session.user.image = token.picture;
      }

      return session;
    },

    async jwt({ token }) {
      if (!token.sub) return token;

      const dbUser = await getUserById(token.sub);

      if (!dbUser) {
        console.error(`[AUTH] User ${token.sub} not found in database - invalidating session`);
        return null;
      }

      token.name = dbUser.name;
      token.email = dbUser.email;
      token.picture = dbUser.image;
      token.role = dbUser.role;
      token.organizationId = dbUser.organizationId || undefined;
      token.organizationName = dbUser.organization?.name;

      return token;
    },
  },
  // debug: process.env.NODE_ENV !== "production"
});
