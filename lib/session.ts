import "server-only";

import { cache } from "react";
import { auth } from "@/auth";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user) {
    return undefined;
  }

  if (!session.user.id) {
    return undefined;
  }

  // Trust the JWT/session integrity; avoid extra DB lookup here to reduce load
  return session.user;
});