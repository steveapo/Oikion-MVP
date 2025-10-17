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
import {
  ActionResponse,
  createSuccessResponse,
  createErrorResponse,
  ErrorCode,
} from "@/lib/action-response";

export type FormData = {
  role: UserRole;
};

export type UpdateUserRoleResult = {
  status: "success" | "error";
  message?: string;
};

export async function updateUserRole(
  userId: string,
  data: FormData
): Promise<ActionResponse> {
  // Authentication
  const session = await auth();

  if (!session?.user || session?.user.id !== userId) {
    return createErrorResponse(
      ErrorCode.UNAUTHORIZED,
      "You are not authorized to update this user's role."
    );
  }

  // Users can no longer change their own roles
  return createErrorResponse(
    ErrorCode.FORBIDDEN,
    "You cannot change your own role. Contact an organization owner to change your role."
  );
}
