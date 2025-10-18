"use server";

/**
 * This file is deprecated.
 * Users can no longer change their own roles.
 * 
 * Role changes are handled by:
 * - Organization owners and admins via /actions/members.ts (updateMemberRole)
 * - Ownership transfer via /actions/members.ts (transferOwnership)
 * 
 * @deprecated Use updateMemberRole from /actions/members.ts instead
 */

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

import { prisma } from "@/lib/db";
import { userRoleSchema } from "@/lib/validations/user";

export type FormData = {
  role: UserRole;
};

export type UpdateUserRoleResult = {
  status: "success" | "error";
  message?: string;
};

export async function updateUserRole(userId: string, data: FormData): Promise<UpdateUserRoleResult> {
  try {
    const session = await auth();

    if (!session?.user || session?.user.id !== userId) {
      throw new Error("Unauthorized");
    }

    // Users can no longer change their own roles
    throw new Error("You cannot change your own role. Contact an organization owner to change your role.");

  } catch (error) {
    console.error("Error updating user role:", error);
    return { 
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
