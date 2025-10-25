# Backend Overview

Last updated: 2025-10-25

## Versions in this repository
- Next.js: 14.2.5 (App Router)
- React: 18.3.1
- TypeScript: 5.5.3
- Prisma: 6.17.1
- Auth.js (next-auth): 5.0.0-beta.19
- Stripe API: 2024-04-10

Note: Verify upstream releases periodically and plan upgrades accordingly.

## Directory structure
- `docs/backend/index.md` (this file)
- `docs/backend/database.md` (schema, RLS, Prisma clients)
- `docs/backend/api-routes.md` (HTTP endpoints)
- `docs/backend/server-actions.md` (server action patterns)
- `docs/backend/auth-and-integrations.md` (Auth.js, Resend, Stripe, env)

## Key usage notes
- Tenant data access must go through the org-scoped Prisma client. See `lib/org-prisma.ts` and `docs/backend/server-actions.md`.
- Auth runs on Auth.js v5 with JWT sessions and Prisma adapter. Email magic links via Resend and Google OAuth are configured.
- Stripe webhooks update user subscription fields; see `app/api/webhooks/stripe/route.ts`.
- Environment variables are validated via `@t3-oss/env-nextjs` in `env.mjs`.

## Change log
- 2025-10-25: Initial backend docs authored; aligned with current codebase.

