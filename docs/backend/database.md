# Database

PostgreSQL via Prisma ORM powers application data. Connection string is read from `DATABASE_URL`.

## Prisma setup
- Client factory: `lib/db.ts` (singleton in dev; new client in prod)
- Org-scoped client: `lib/org-prisma.ts`
  - `prismaForOrg(orgId)` sets `app.current_organization` via a transaction per query
  - `withOrgContext(orgId, fn)` runs multiple queries in one transaction after setting context once

## Tenant isolation (RLS model)
- Policies are authored in SQL migrations under `prisma/migrations/*rls*`
- On Neon, `BYPASSRLS` prevents enforcement at the database layer; application layer isolation is primary
- All tenant-scoped reads/writes should use the org-scoped client. See `docs/backend/server-actions.md`

## Schema highlights
- Core models: `User`, `Organization`, `OrganizationMember`, `Invitation`, `Property`, `Client`, `Task`, `Interaction`, `Note`, `Activity`, `Address`, `Listing`, `MediaAsset`
- Enums provide RBAC and domain states (`UserRole`, `OrganizationPlan`, `PropertyType`, `TaskStatus`, etc.)

## Migrations
- Recent migrations include RLS setup/cleanup, cascade rules, indexes, and `preferredLocale`
- See `docs/implementation/MIGRATION_SUMMARY.md` for a narrative

## Operational notes
- Use `pnpm prisma generate` post-dependency changes (runs automatically via postinstall)
- Prefer `withOrgContext` for multi-query mutations within the same org
- Avoid long-lived Prisma clients outside `lib/db.ts`

