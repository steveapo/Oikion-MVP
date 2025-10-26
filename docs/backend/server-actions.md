# Server Actions

Server actions implement most mutations and reads for the dashboard. They run on the server and can access the database directly.

## Org-scoped Prisma
- Use `prismaForOrg(orgId)` to set `app.current_organization` per query
- Use `withOrgContext(orgId, fn)` to batch multiple queries in one transaction
- Files: `lib/org-prisma.ts`, `lib/db.ts`

## Patterns
- Authenticate with `auth()` and require `session.user.organizationId`
- Authorize with `lib/roles.ts` helpers (e.g., `canCreateContent`)
- Validate inputs with Zod schemas from `lib/validations/*`
- Revalidate cache via `revalidateTag`/`revalidatePath` and optionally broadcast live updates

## Confirmed usage
- Tenant-scoped actions (e.g., `actions/clients.ts`, `actions/properties.ts`, `actions/interactions.ts`) use `prismaForOrg`
- User/org management actions may use base `prisma` for cross-tenant ops where appropriate (e.g., switching org, user role updates)

## Safety checklist
- Never query tenant tables with base `prisma` unless absolutely required and guarded by `organizationId` filters
- Prefer `withOrgContext` for multi-step org mutations
- Always include `organizationId` in where clauses when relevant