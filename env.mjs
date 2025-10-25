import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Auth.js v5 requires AUTH_URL for CSRF token validation
    AUTH_URL: z.string().url().optional(),
    // NEXTAUTH_URL is legacy (Auth.js v4), kept for backward compatibility
    NEXTAUTH_URL: z.string().url().optional(),
    AUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GITHUB_OAUTH_TOKEN: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z.string().min(1),
    STRIPE_API_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    // Optional: Password protect the entire app
    APP_PASSWORD: z.string().optional(),
    // Tolgee (tooling-only)
    TOLGEE_API_URL: z.string().url().optional(),
    TOLGEE_API_KEY_READ: z.string().optional(),
    TOLGEE_API_KEY_WRITE: z.string().optional(),
    TOLGEE_PROJECT_ID: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID: z.string().min(1),
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID: z.string().min(1),
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID: z.string().min(1),
  },
  runtimeEnv: {
    AUTH_URL: process.env.AUTH_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_OAUTH_TOKEN: process.env.GITHUB_OAUTH_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    APP_PASSWORD: process.env.APP_PASSWORD,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    // Stripe
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID:
      process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID:
      process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID:
      process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID:
      process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID,
    // Tolgee (tooling-only)
    TOLGEE_API_URL: process.env.TOLGEE_API_URL,
    TOLGEE_API_KEY_READ: process.env.TOLGEE_API_KEY_READ,
    TOLGEE_API_KEY_WRITE: process.env.TOLGEE_API_KEY_WRITE,
    TOLGEE_PROJECT_ID: process.env.TOLGEE_PROJECT_ID,
  },
});
