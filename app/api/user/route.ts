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
      select: { 
        id: true, 
        role: true, 
        organizationId: true,
        organization: {
          select: {
            isPersonal: true,
          },
        },
      },
    });

    if (!dbUser) {
      return new Response("Invalid user", { status: 401 });
    }

    // Check if in a non-personal org with only one member
    // Only delete the org if it's NOT a personal org
    if (dbUser.organizationId && dbUser.role === UserRole.ORG_OWNER) {
      const memberCount = await prisma.user.count({
        where: { organizationId: dbUser.organizationId },
      });

      // Only delete organization if it's not personal and user is the only member
      if (memberCount === 1 && dbUser.organization && !dbUser.organization.isPersonal) {
        await prisma.organization.delete({
          where: { id: dbUser.organizationId },
        });
      }
    }

    // Delete user account
    // Personal orgs will remain (they cannot be deleted)
    await prisma.user.delete({
      where: { id: currentUser.id },
    });
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }

  return new Response("User deleted successfully!", { status: 200 });
});
