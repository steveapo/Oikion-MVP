import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

import { env } from "@/env.mjs";

/**
 * Edge-compatible Auth.js configuration.
 * Used by middleware (Edge Runtime) - cannot include:
 * - Email providers with custom sendVerificationRequest
 * - Database adapters
 * - Any code that uses Node.js-specific APIs
 * 
 * Full configuration with all providers is in auth.ts
 */
export default {
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
} satisfies NextAuthConfig;
