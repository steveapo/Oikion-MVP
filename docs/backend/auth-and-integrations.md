# Auth and Integrations

## Auth.js (next-auth) v5 (beta)
- File: `auth.ts` (Node runtime) with Prisma adapter and providers
- Edge middleware uses `auth.config.ts` (no adapter, edge-safe providers)
- Session strategy: JWT
- Providers:
  - Google OAuth (env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
  - Resend email magic link (env: `RESEND_API_KEY`, `EMAIL_FROM`)
  - Credentials (email/password) using bcrypt in `lib/password.ts`
- Session/user token enrichment via callbacks; org safety checks ensure users are always in a valid org

## Email (Resend)
- File: `lib/email.ts`
- Functions: `sendVerificationRequest`, `sendInvitationEmail`, `sendEmailAuthCodeEmail`
- In dev, messages are routed to a safe recipient (`delivered@resend.dev` or `DEV_EMAIL_RECIPIENT`)

## Stripe
- Client: `lib/stripe.ts` (API version `2024-04-10`)
- Webhook: `app/api/webhooks/stripe/route.ts`
  - `checkout.session.completed`: set subscription/customer on `User`
  - `invoice.payment_succeeded`: refresh price and period end
- Public plan IDs read from `NEXT_PUBLIC_STRIPE_*` env vars

## Environment variables
- Validated in `env.mjs` via `@t3-oss/env-nextjs`
- Server: `AUTH_URL`, `NEXTAUTH_URL`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_OAUTH_TOKEN`, `DATABASE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, optional `APP_PASSWORD`
- Client: `NEXT_PUBLIC_APP_URL`, public Stripe plan IDs

## Operational notes
- Keep `AUTH_URL` set in production for CSRF validation with Auth.js v5
- Use `pnpm` for dependency operations; Prisma generates on postinstall
- Rotate secrets regularly; never commit .env files