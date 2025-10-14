"use server";

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

    const { role } = userRoleSchema.parse(data);

    // Update the user role.
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: role,
      },
    });

    revalidatePath("/dashboard/settings");
    return { status: "success" };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { 
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
