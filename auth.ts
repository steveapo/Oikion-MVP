import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

import { prisma } from "@/lib/db";
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
  events: {
    async createUser({ user }) {
      // Create an organization for new users
      // Skip if user is accepting an invitation (will be handled in acceptInvitation)
      if (user.id && user.email) {
        try {
          // Check if there's a pending invitation for this email
          const pendingInvitation = await prisma.invitation.findFirst({
            where: {
              email: user.email,
              status: "PENDING",
              expiresAt: {
                gt: new Date(),
              },
            },
          });

          // If there's a pending invitation, don't create an organization
          // User will join the organization when they accept the invitation
          if (pendingInvitation) {
            console.log(`User ${user.email} has pending invitation, skipping org creation`);
            return;
          }

          // No invitation found, create a new organization for the user
          const organization = await prisma.organization.create({
            data: {
              name: `${user.name || user.email}'s Organization`,
            },
          });

          // Update user with organizationId and set role to ORG_OWNER
          await prisma.user.update({
            where: { id: user.id },
            data: {
              organizationId: organization.id,
              role: UserRole.ORG_OWNER,
            },
          });
        } catch (error) {
          console.error("Failed to create organization for new user:", error);
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

      if (!dbUser) return token;

      token.name = dbUser.name;
      token.email = dbUser.email;
      token.picture = dbUser.image;
      token.role = dbUser.role;
      token.organizationId = dbUser.organizationId || undefined;
      token.organizationName = dbUser.organization?.name;

      return token;
    },
  },
  ...authConfig,
  // debug: process.env.NODE_ENV !== "production"
});
