# API Routes (App Router)

All endpoints are implemented under `app/api`. Authentication is enforced via `auth()` middleware on handlers that import from `@/auth`.

## Endpoints

- GET/POST /api/auth/[...nextauth]
  - Delegates to `auth.ts` Auth.js handlers.

- DELETE /api/organization
  - Deletes current organization if not personal; switches user to personal workspace.

- DELETE /api/user
  - Deletes current user. Cascades personal org; reassigns authored content in team orgs before deletion.

- POST /api/verify-password
  - Verifies app-level password gate; sets `app-password-verified` cookie.

- POST /api/webhooks/stripe
  - Verifies Stripe signature and updates user subscription/customer fields on relevant events.

- GET /api/og
  - Generates Open Graph image (server component route).

## Notes
- Prefer server actions for most mutations; keep API routes for webhooks, auth, and cross-origin needs.
- Use `NextResponse.json` with appropriate status codes and avoid leaking internal errors.
- Stripe webhook secret and API key come from `env.mjs`.