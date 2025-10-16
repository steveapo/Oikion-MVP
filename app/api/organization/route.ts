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

    await prisma.organization.delete({
      where: { id: user.organizationId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete organization:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
