import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { sendVerificationRequest } from "@/lib/email";
import { getUserById } from "@/lib/user";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations/auth";

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
    // Google OAuth (from auth.config.ts)
    ...authConfig.providers.filter((p) => p.id === "google"),
    // Add the Resend email provider here (not in auth.config.ts)
    // This keeps it out of the Edge Runtime middleware bundle
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
      sendVerificationRequest,
    }),
    // Credentials provider for email/password authentication
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const { email, password } = loginSchema.parse(credentials);

          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          // Check if user exists and has a password set
          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isValid = await verifyPassword(password, user.password);

          if (!isValid) {
            return null;
          }

          // Return user object for session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Credentials authorization error:", error);
          return null;
        }
      },
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
            // Auto-verify email for invited user (trusted link)
            try {
              await prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() },
              });
            } catch (e) {
              console.warn("[AUTH] Failed to auto-verify invited user email", e);
            }

            // Create membership for invited organization
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

      // Throttle DB lookups: refresh essential user/org data at most once per minute
      const now = Date.now();
      const lastRefresh = (token as any).dbRefreshedAt as number | undefined;
      const hasEssential = !!(token as any).role && typeof (token as any).organizationId === "string";
      const shouldRefresh = !hasEssential || !lastRefresh || now - lastRefresh > 60_000;

      if (!shouldRefresh) {
        return token;
      }

      const dbUser = await getUserById(token.sub);

      if (!dbUser) {
        console.error(`[AUTH] User ${token.sub} not found in database - invalidating session`);
        return null;
      }

      // Onboarding status removed - field doesn't exist in schema

      // SAFETY CHECK: Verify user's current organization exists
      // If it doesn't exist (deleted), auto-switch to Personal workspace
      if (dbUser.organizationId) {
        const orgExists = await prisma.organization.findUnique({
          where: { id: dbUser.organizationId },
          select: { id: true, name: true },
        });

        if (!orgExists) {
          // Organization was deleted! Auto-switch user to their Personal workspace
          console.warn(`[AUTH SAFETY] User ${dbUser.email} is in deleted org ${dbUser.organizationId} - switching to Personal workspace`);
          
          // Find user's personal workspace
          const personalWorkspace = await prisma.organizationMember.findFirst({
            where: {
              userId: dbUser.id,
              organization: {
                isPersonal: true,
              },
            },
            include: {
              organization: true,
            },
          });

          if (personalWorkspace) {
            // Switch user to Personal workspace
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                organizationId: personalWorkspace.organization.id,
                role: personalWorkspace.role,
              },
            });

            // Update token with new org info
            token.organizationId = personalWorkspace.organization.id;
            token.organizationName = personalWorkspace.organization.name;
            token.role = personalWorkspace.role;
          } else {
            // No personal workspace found - critical error
            console.error(`[AUTH CRITICAL] User ${dbUser.email} has no Personal workspace - creating one`);
            
            // Create emergency personal workspace
            const emergencyOrg = await prisma.organization.create({
              data: {
                name: "Private Workspace",
                isPersonal: true,
                plan: "FREE",
              },
            });

            // Create membership
            await prisma.organizationMember.create({
              data: {
                userId: dbUser.id,
                organizationId: emergencyOrg.id,
                role: UserRole.ORG_OWNER,
              },
            });

            // Update user
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                organizationId: emergencyOrg.id,
                role: UserRole.ORG_OWNER,
              },
            });

            // Update token
            token.organizationId = emergencyOrg.id;
            token.organizationName = emergencyOrg.name;
            token.role = UserRole.ORG_OWNER;
          }
        } else {
          // Organization exists - verify user still has membership
          const membership = await prisma.organizationMember.findUnique({
            where: {
              userId_organizationId: {
                userId: dbUser.id,
                organizationId: dbUser.organizationId,
              },
            },
          });

          if (!membership) {
            // User was removed from organization! Switch to Personal workspace
            console.warn(`[AUTH SAFETY] User ${dbUser.email} was removed from org ${dbUser.organizationId} - switching to Personal workspace`);
            
            const personalWorkspace = await prisma.organizationMember.findFirst({
              where: {
                userId: dbUser.id,
                organization: {
                  isPersonal: true,
                },
              },
              include: {
                organization: true,
              },
            });

            if (personalWorkspace) {
              // Switch user to Personal workspace
              await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  organizationId: personalWorkspace.organization.id,
                  role: personalWorkspace.role,
                },
              });

              // Update token with new org info
              token.organizationId = personalWorkspace.organization.id;
              token.organizationName = personalWorkspace.organization.name;
              token.role = personalWorkspace.role;
            }
          } else {
            // Membership exists - normal flow
            token.organizationId = dbUser.organizationId;
            token.organizationName = orgExists.name;
            token.role = dbUser.role;
          }
        }
      } else {
        // User has no organization set - this shouldn't happen, but handle it
        console.warn(`[AUTH SAFETY] User ${dbUser.email} has no organizationId - finding Personal workspace`);
        
        const personalWorkspace = await prisma.organizationMember.findFirst({
          where: {
            userId: dbUser.id,
            organization: {
              isPersonal: true,
            },
          },
          include: {
            organization: true,
          },
        });

        if (personalWorkspace) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              organizationId: personalWorkspace.organization.id,
              role: personalWorkspace.role,
            },
          });

          token.organizationId = personalWorkspace.organization.id;
          token.organizationName = personalWorkspace.organization.name;
          token.role = personalWorkspace.role;
        }
      }

      token.name = dbUser.name;
      token.email = dbUser.email;
      token.picture = dbUser.image;

      // Record refresh timestamp to avoid frequent DB hits
      (token as any).dbRefreshedAt = now;

      return token;
    },
  },
  // debug: process.env.NODE_ENV !== "production"
});
