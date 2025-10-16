"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

/**
 * Delete the current user's organization.
 * This will cascade-delete all tenant data (properties, clients, interactions,
 * notes, tasks, activities, listings, addresses, media assets) via FK CASCADE rules.
 * Users are retained with organizationId set to NULL (per FK ON DELETE SET NULL).
 */
export async function deleteOrganization(): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const orgId = session.user.organizationId;
    if (!orgId) {
      throw new Error("User must belong to an organization");
    }

    // Only ORG_OWNER may delete the organization
    if (session.user.role !== UserRole.ORG_OWNER) {
      throw new Error("Insufficient permissions to delete organization");
    }

    // Delete the organization; FK CASCADE will clean up tenant data
    await prisma.organization.delete({
      where: { id: orgId },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete organization:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete organization",
    };
  }
}
