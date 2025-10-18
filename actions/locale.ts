"use server";

/**
 * Server actions for locale management
 * 
 * Provides server-side functions for updating user locale preferences
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isValidLocale, type Locale } from "@/lib/i18n-utils";

/**
 * Update user's preferred locale
 */
export async function updateUserLocale(locale: string, currentPath?: string) {
  try {
    // Validate locale
    if (!isValidLocale(locale)) {
      return {
        success: false,
        error: "Invalid locale"
      };
    }

    // Get current session
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated"
      };
    }

    // Update user's preferred locale in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { preferredLocale: locale }
    });

    // Revalidate the current path
    if (currentPath) {
      revalidatePath(currentPath);
    }

    return {
      success: true,
      locale
    };
  } catch (error) {
    console.error("Failed to update user locale:", error);
    return {
      success: false,
      error: "Failed to update locale"
    };
  }
}

/**
 * Get user's preferred locale from database
 */
export async function getUserPreferredLocale(): Promise<Locale | null> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferredLocale: true }
    });

    if (user?.preferredLocale && isValidLocale(user.preferredLocale)) {
      return user.preferredLocale;
    }

    return null;
  } catch (error) {
    console.error("Failed to get user preferred locale:", error);
    return null;
  }
}
