"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { changePasswordSchema } from "@/lib/validations/auth";

export async function changePassword(formData: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  try {
    // Validate the form data
    const validatedFields = changePasswordSchema.safeParse(formData);
    
    if (!validatedFields.success) {
      return {
        status: "error" as const,
        message: "Invalid form data",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    // Get the current session
    const session = await auth();
    if (!session?.user?.id) {
      return {
        status: "error" as const,
        message: "Not authenticated",
      };
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return {
        status: "error" as const,
        message: "User not found",
      };
    }

    // If user has no password set, they can set one
    if (!user.password) {
      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
      });

      revalidatePath("/dashboard/account");
      return {
        status: "success" as const,
        message: "Password set successfully",
      };
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return {
        status: "error" as const,
        message: "Current password is incorrect",
      };
    }

    // Hash and update the new password
    const hashedNewPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword },
    });

    revalidatePath("/dashboard/account");
    return {
      status: "success" as const,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      status: "error" as const,
      message: "An error occurred while changing password",
    };
  }
}
