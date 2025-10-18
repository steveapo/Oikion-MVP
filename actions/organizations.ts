"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Get the current user's organization.
 */
export async function getCurrentOrganization() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    const organizationId = (session.user as any).organizationId;
    if (!organizationId) {
      return null;
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        plan: true,
        isPersonal: true,
        createdAt: true,
      },
    });

    return organization;
  } catch (error) {
    console.error("Failed to get current organization:", error);
    return null;
  }
}

/**
 * Get all organizations the user has access to.
 * This includes personal organization and any organizations they're a member of.
 * Ensures no duplicate personal workspaces are returned.
 */
export async function getUserOrganizations() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return [];
    }

    // Get all organizations where user is a member (via OrganizationMember table)
    const memberships = await prisma.organizationMember.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            plan: true,
            isPersonal: true,
            createdAt: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: [
        { organization: { isPersonal: "desc" } }, // Personal organizations first
        { organization: { createdAt: "desc" } },
      ],
    });

    // Extract and format the organizations
    const organizations = memberships.map(membership => ({
      ...membership.organization,
      _count: {
        users: membership.organization._count.members,
      },
    }));

    // Ensure uniqueness by organization ID (防duplicate personal workspaces)
    const seen = new Set<string>();
    const uniqueOrganizations = organizations.filter(org => {
      if (seen.has(org.id)) {
        console.warn(`[WARN] Duplicate organization detected: ${org.id} - ${org.name}`);
        return false;
      }
      seen.add(org.id);
      return true;
    });

    // Double-check: ensure only ONE personal workspace
    const personalWorkspaces = uniqueOrganizations.filter(org => org.isPersonal);
    if (personalWorkspaces.length > 1) {
      console.error(`[ERROR] User ${session.user.id} has ${personalWorkspaces.length} personal workspaces!`);
      // Return only the first personal workspace + all team orgs
      return [
        personalWorkspaces[0],
        ...uniqueOrganizations.filter(org => !org.isPersonal),
      ];
    }

    return uniqueOrganizations;
  } catch (error) {
    console.error("Failed to get user organizations:", error);
    return [];
  }
}

const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100),
  isPersonal: z.boolean().optional().default(false),
});

/**
 * Create a new organization.
 * User becomes a member (ORG_OWNER) of the new organization and it becomes their active org.
 */
export async function createOrganization(
  data: z.infer<typeof createOrganizationSchema>
): Promise<{ success: boolean; organizationId?: string; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const validated = createOrganizationSchema.parse(data);

    // Create the organization
    const organization = await prisma.organization.create({
      data: {
        name: validated.name,
        isPersonal: validated.isPersonal,
        plan: "FREE",
      },
    });

    // Add user as a member with ORG_OWNER role
    await prisma.organizationMember.create({
      data: {
        userId: session.user.id,
        organizationId: organization.id,
        role: UserRole.ORG_OWNER,
      },
    });

    // Switch user to this new organization
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        organizationId: organization.id,
        role: UserRole.ORG_OWNER,
      },
    });

    revalidatePath("/dashboard");

    return { success: true, organizationId: organization.id };
  } catch (error) {
    console.error("Failed to create organization:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create organization",
    };
  }
}

const updateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100).optional(),
  plan: z.enum(["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
});

/**
 * Update organization details.
 * Only ORG_OWNER can update organization.
 */
export async function updateOrganization(
  organizationId: string,
  data: z.infer<typeof updateOrganizationSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Verify user is ORG_OWNER of this agency
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, organizationId: true },
    });

    if (user?.organizationId !== organizationId || user?.role !== UserRole.ORG_OWNER) {
      throw new Error("Only organization owners can update organization settings");
    }

    const validated = updateOrganizationSchema.parse(data);

    // Update the agency
    await prisma.organization.update({
      where: { id: organizationId },
      data: validated,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (error) {
    console.error("Failed to update organization:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update organization",
    };
  }
}

/**
 * Switch user's active organization.
 * User must be a member of the target organization.
 */
export async function switchOrganization(
  organizationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Verify user is a member of the target organization (via OrganizationMember)
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: organizationId,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!membership) {
      throw new Error("You do not have access to this organization");
    }

    // Update user's current organization
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        organizationId: organizationId,
        role: membership.role, // Use their role from the membership
      },
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to switch organization:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to switch organization",
    };
  }
}

/**
 * Delete the current user's organization.
 * This will cascade-delete all tenant data (properties, clients, interactions,
 * notes, tasks, activities, listings, addresses, media assets) via FK CASCADE rules.
 * After deletion, switches the user to their personal workspace.
 * 
 * Personal organizations cannot be deleted.
 */
export async function deleteOrganization(): Promise<{ 
  success: boolean; 
  personalWorkspaceId?: string;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const organizationId = (session.user as any).organizationId;
    if (!organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Only ORG_OWNER may delete the agency
    if (session.user.role !== UserRole.ORG_OWNER) {
      throw new Error("Insufficient permissions to delete organization");
    }

    // Fetch the organization to check if it's a personal agency
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { isPersonal: true },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    // Prevent deletion of personal organizations
    if (organization.isPersonal) {
      throw new Error("Cannot delete your personal organization. You can delete other organizations you own.");
    }

    // Find user's personal workspace to switch to after deletion
    const personalWorkspace = await prisma.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organization: {
          isPersonal: true,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!personalWorkspace) {
      throw new Error("Personal workspace not found. Please contact support.");
    }

    // Delete the organization; FK CASCADE will clean up tenant data
    await prisma.organization.delete({
      where: { id: organizationId },
    });

    // Switch user to their personal workspace
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        organizationId: personalWorkspace.organization.id,
        role: personalWorkspace.role,
      },
    });

    revalidatePath("/dashboard");

    return { 
      success: true,
      personalWorkspaceId: personalWorkspace.organization.id,
    };
  } catch (error) {
    console.error("Failed to delete organization:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete organization",
    };
  }
}
