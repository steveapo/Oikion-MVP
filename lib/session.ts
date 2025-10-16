import "server-only";

import { cache } from "react";
import { auth } from "@/auth";
import { getUserById } from "@/lib/user";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user) {
    return undefined;
  }

  if (!session.user.id) {
    return undefined;
  }

  // Double-check that the user actually exists in the database
  const dbUser = await getUserById(session.user.id);
  if (!dbUser) {
    console.error(`[SESSION] User ${session.user.id} has valid session but doesn't exist in database`);
    return undefined;
  }

  return session.user;
});