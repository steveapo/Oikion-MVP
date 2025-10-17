"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { userNameSchema } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";
import {
  ActionResponse,
  createSuccessResponse,
  createErrorResponse,
  ErrorCode,
  zodErrorsToValidationErrors,
} from "@/lib/action-response";
import { TOAST_SUCCESS, TOAST_ERROR } from "@/lib/toast-messages";

export type FormData = {
  name: string;
};

export async function updateUserName(
  userId: string,
  data: FormData
): Promise<ActionResponse> {
  // Authentication
  const session = await auth();

  if (!session?.user || session?.user.id !== userId) {
    return createErrorResponse(
      ErrorCode.UNAUTHORIZED,
      "You are not authorized to update this user's name."
    );
  }

  // Validation
  const result = userNameSchema.safeParse(data);
  if (!result.success) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      TOAST_ERROR.VALIDATION_FAILED,
      { validationErrors: zodErrorsToValidationErrors(result.error) }
    );
  }
  const { name } = result.data;

  try {

    // Update the user name.
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name,
      },
    })

    revalidatePath('/dashboard/settings');
    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to update user name:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to update name. Please try again."
    );
  }
}