"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Get the current user's agency.
 */
export async function getCurrentAgency() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    const agencyId = (session.user as any).agencyId;
    if (!agencyId) {
      return null;
    }

    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      select: {
        id: true,
        name: true,
        plan: true,
        isPersonal: true,
        createdAt: true,
      },
    });

    return agency;
  } catch (error) {
    console.error("Failed to get current agency:", error);
    return null;
  }
}

/**
 * Get all agencies the user has access to.
 * This includes personal agency and any agencies they're a member of.
 */
export async function getUserAgencies() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return [];
    }

    // Get all agencies where user is a member
    const agenciesWithUser = await prisma.agency.findMany({
      where: {
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        plan: true,
        isPersonal: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: [
        { isPersonal: "desc" }, // Personal agencies first
        { createdAt: "desc" },
      ],
    });

    return agenciesWithUser;
  } catch (error) {
    console.error("Failed to get user agencies:", error);
    return [];
  }
}

const createAgencySchema = z.object({
  name: z.string().min(1, "Agency name is required").max(100),
  isPersonal: z.boolean().optional().default(false),
});

/**
 * Create a new agency.
 * User becomes ORG_OWNER of the new agency.
 */
export async function createAgency(
  data: z.infer<typeof createAgencySchema>
): Promise<{ success: boolean; agencyId?: string; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const validated = createAgencySchema.parse(data);

    // Create the agency
    const agency = await prisma.agency.create({
      data: {
        name: validated.name,
        isPersonal: validated.isPersonal,
        plan: "FREE",
      },
    });

    // Add user as ORG_OWNER (note: this doesn't change their current agency)
    // They can switch to it via switchAgency
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        agencyId: agency.id,
        role: UserRole.ORG_OWNER,
      },
    });

    revalidatePath("/dashboard");

    return { success: true, agencyId: agency.id };
  } catch (error) {
    console.error("Failed to create agency:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create agency",
    };
  }
}

const updateAgencySchema = z.object({
  name: z.string().min(1, "Agency name is required").max(100).optional(),
  plan: z.enum(["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
});

/**
 * Update agency details.
 * Only ORG_OWNER can update agency.
 */
export async function updateAgency(
  agencyId: string,
  data: z.infer<typeof updateAgencySchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Verify user is ORG_OWNER of this agency
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, agencyId: true },
    });

    if (user?.agencyId !== agencyId || user?.role !== UserRole.ORG_OWNER) {
      throw new Error("Only agency owners can update agency settings");
    }

    const validated = updateAgencySchema.parse(data);

    // Update the agency
    await prisma.agency.update({
      where: { id: agencyId },
      data: validated,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (error) {
    console.error("Failed to update agency:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update agency",
    };
  }
}

/**
 * Switch user's active agency.
 * User must be a member of the target agency.
 */
export async function switchAgency(
  agencyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Verify user is a member of the target agency
    const agency = await prisma.agency.findFirst({
      where: {
        id: agencyId,
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
      include: {
        users: {
          where: { id: session.user.id },
          select: { role: true },
        },
      },
    });

    if (!agency || agency.users.length === 0) {
      throw new Error("You do not have access to this agency");
    }

    // Update user's current agency
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        agencyId: agencyId,
        role: agency.users[0].role, // Maintain their role in that agency
      },
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to switch agency:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to switch agency",
    };
  }
}

/**
 * Delete the current user's agency.
 * This will cascade-delete all tenant data (properties, clients, interactions,
 * notes, tasks, activities, listings, addresses, media assets) via FK CASCADE rules.
 * Users are retained with agencyId set to NULL (per FK ON DELETE SET NULL).
 * 
 * Personal agencies cannot be deleted.
 */
export async function deleteAgency(): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const agencyId = (session.user as any).agencyId;
    if (!agencyId) {
      throw new Error("User must belong to an agency");
    }

    // Only ORG_OWNER may delete the agency
    if (session.user.role !== UserRole.ORG_OWNER) {
      throw new Error("Insufficient permissions to delete agency");
    }

    // Fetch the agency to check if it's a personal agency
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      select: { isPersonal: true },
    });

    if (!agency) {
      throw new Error("Agency not found");
    }

    // Prevent deletion of personal agencies
    if (agency.isPersonal) {
      throw new Error("Cannot delete your personal agency. You can delete other agencies you own.");
    }

    // Delete the agency; FK CASCADE will clean up tenant data
    await prisma.agency.delete({
      where: { id: agencyId },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete agency:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete agency",
    };
  }
}
