import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canAccessAdmin } from "@/lib/roles";
import { NextResponse } from "next/server";

export const DELETE = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = req.auth.user;
  if (!user?.id || !user.organizationId) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  try {
    // Only ADMIN/ORG_OWNER allowed to delete org
    if (!canAccessAdmin(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if organization is personal
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { isPersonal: true },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Prevent deletion of personal organizations
    if (organization.isPersonal) {
      return NextResponse.json(
        { error: "Cannot delete your personal organization" },
        { status: 400 }
      );
    }

    // Find user's personal workspace to switch to after deletion
    const personalWorkspace = await prisma.organizationMember.findFirst({
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

    if (!personalWorkspace) {
      return NextResponse.json(
        { error: "Personal workspace not found" },
        { status: 404 }
      );
    }

    // Delete the organization
    await prisma.organization.delete({
      where: { id: user.organizationId },
    });

    // Switch user to their personal workspace
    await prisma.user.update({
      where: { id: user.id },
      data: {
        organizationId: personalWorkspace.organization.id,
        role: personalWorkspace.role,
      },
    });

    return NextResponse.json({ 
      success: true,
      personalWorkspaceId: personalWorkspace.organization.id 
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete organization:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
