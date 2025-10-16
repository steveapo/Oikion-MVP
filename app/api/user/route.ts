import { auth } from "@/auth";

import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

export const DELETE = auth(async (req) => {
  if (!req.auth) {
    return new Response("Not authenticated", { status: 401 });
  }

  const currentUser = req.auth.user;
  if (!currentUser) {
    return new Response("Invalid user", { status: 401 });
  }

  try {
    // Load user to get org and role
    const dbUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, role: true, organizationId: true },
    });

    if (!dbUser) {
      return new Response("Invalid user", { status: 401 });
    }

    // If personal org (only member) and user is ORG_OWNER, delete org first
    if (dbUser.organizationId && dbUser.role === UserRole.ORG_OWNER) {
      const memberCount = await prisma.user.count({
        where: { organizationId: dbUser.organizationId },
      });

      if (memberCount === 1) {
        await prisma.organization.delete({
          where: { id: dbUser.organizationId },
        });
      }
    }

    // Delete user account
    await prisma.user.delete({
      where: { id: currentUser.id },
    });
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }

  return new Response("User deleted successfully!", { status: 200 });
});
