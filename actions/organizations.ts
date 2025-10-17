"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode,
  zodErrorsToValidationErrors,
  type ActionResponse 
} from "@/lib/action-response";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Get the current user's organization.
 */
export async function getCurrentOrganization() {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return null; // Return null for consistency with existing behavior
  const { user } = authResult;

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
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
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return []; // Return empty array for consistency
  const { user } = authResult;

  try {
    // Get all organizations where user is a member (via OrganizationMember table)
    const memberships = await prisma.organizationMember.findMany({
      where: {
        userId: user.id,
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
      console.error(`[ERROR] User ${user.id} has ${personalWorkspaces.length} personal workspaces!`);
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
): Promise<ActionResponse<{ organizationId: string }>> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Validation
  const result = createOrganizationSchema.safeParse(data);
  if (!result.success) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      "Please check the form for errors.",
      { validationErrors: zodErrorsToValidationErrors(result.error) }
    );
  }
  const validated = result.data;

  try {
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
        userId: user.id,
        organizationId: organization.id,
        role: UserRole.ORG_OWNER,
      },
    });

    // Switch user to this new organization
    await prisma.user.update({
      where: { id: user.id },
      data: {
        organizationId: organization.id,
        role: UserRole.ORG_OWNER,
      },
    });

    revalidatePath("/dashboard");

    return createSuccessResponse({ organizationId: organization.id });
  } catch (error) {
    console.error("Failed to create organization:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to create organization. Please try again."
    );
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
): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Verify user is ORG_OWNER of this organization
  if (user.organizationId !== organizationId || user.role !== UserRole.ORG_OWNER) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "Only organization owners can update organization settings."
    );
  }

  // Validation
  const result = updateOrganizationSchema.safeParse(data);
  if (!result.success) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      "Please check the form for errors.",
      { validationErrors: zodErrorsToValidationErrors(result.error) }
    );
  }
  const validated = result.data;

  try {
    // Update the organization
    await prisma.organization.update({
      where: { id: organizationId },
      data: validated,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to update organization:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to update organization. Please try again."
    );
  }
}

/**
 * Switch user's active organization.
 * User must be a member of the target organization.
 */
export async function switchOrganization(
  organizationId: string
): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  try {
    // Verify user is a member of the target organization (via OrganizationMember)
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: organizationId,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!membership) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        "You do not have access to this organization."
      );
    }

    // Update user's current organization
    await prisma.user.update({
      where: { id: user.id },
      data: {
        organizationId: organizationId,
        role: membership.role, // Use their role from the membership
      },
    });

    revalidatePath("/dashboard");

    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to switch organization:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to switch organization. Please try again."
    );
  }
}

/**
 * Delete the current user's organization.
 * This will cascade-delete all tenant data (properties, clients, interactions,
 * notes, tasks, activities, listings, addresses, media assets) via FK CASCADE rules.
 * Users are retained with organizationId set to NULL (per FK ON DELETE SET NULL).
 * 
 * Personal organizations cannot be deleted.
 */
export async function deleteOrganization(): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Only ORG_OWNER may delete the organization
  if (user.role !== UserRole.ORG_OWNER) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "Only organization owners can delete organizations."
    );
  }

  try {
    // Fetch the organization to check if it's a personal organization
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { isPersonal: true },
    });

    if (!organization) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Organization not found."
      );
    }

    // Prevent deletion of personal organizations
    if (organization.isPersonal) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        "Cannot delete your personal organization. You can delete other organizations you own."
      );
    }

    // Delete the organization; FK CASCADE will clean up tenant data
    await prisma.organization.delete({
      where: { id: user.organizationId },
    });

    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to delete organization:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to delete organization. Please try again."
    );
  }
}
