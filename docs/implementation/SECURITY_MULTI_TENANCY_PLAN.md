# Oikion Security & Multi‑Tenancy Implementation Plan

Goals
- Secure database isolation across organizations (silos per org).
- Functional organizations: invite, modify role, remove members.
- Data confidentiality via encryption; preserve filters where practical.
- Minimal disruption to existing server actions and UI.

Current State (confirmed)
- Tenancy: `clients`, `properties`, `interactions`, `tasks`, `notes`, `activities` use `organizationId` in queries inside server actions (e.g., `actions/clients.ts`, `actions/properties.ts`).
- Auth & roles: `auth.ts` assigns a new organization to each newly created user and sets role `ORG_OWNER`; helpers in `lib/roles.ts` enforce RBAC; session holds `user.id`, `user.role`, `user.organizationId`.
- Data: stored plaintext; no field encryption.

Phase 1 — Database Isolation with PostgreSQL Row‑Level Security (RLS)
Summary
- Enforce isolation at the database layer so even accidental missing filters cannot cross tenants. Use per‑transaction session variable `app.current_organization` to bind policies.

Tables to protect
- Primary: `properties`, `clients`, `interactions`, `tasks`, `notes`, `activities`.
- Dependent: `addresses`, `listings`, `media_assets` (main access is via their parent `property`; consider policies if direct table access is used).

Policy pattern (for each primary table)
- Enable RLS: ALTER TABLE "<table>" ENABLE ROW LEVEL SECURITY;
- SELECT: CREATE POLICY org_isolation_select ON "<table>" FOR SELECT USING ("organizationId" = current_setting('app.current_organization')::text);
- INSERT: CREATE POLICY org_isolation_insert ON "<table>" FOR INSERT WITH CHECK ("organizationId" = current_setting('app.current_organization')::text);
- UPDATE: CREATE POLICY org_isolation_update ON "<table>" FOR UPDATE USING ("organizationId" = current_setting('app.current_organization')::text) WITH CHECK ("organizationId" = current_setting('app.current_organization')::text);
- DELETE: CREATE POLICY org_isolation_delete ON "<table>" FOR DELETE USING ("organizationId" = current_setting('app.current_organization')::text);

Prisma integration (pooled connections)
- Implement a Prisma Client Extension that wraps every query in a transaction that first sets the session variable:
  - `SELECT set_config('app.current_organization', ${orgId}::text, TRUE)` then executes the original query.
- Helper: `prismaForOrg(orgId)` returns `prisma.$extends(...)` instance.
- Update server actions to use `prismaForOrg(session.user.organizationId)` for all queries (incrementally: start with `actions/clients.ts`, `actions/properties.ts`).

Verification
- Two users → two orgs. Insert rows in each; verify cross‑org reads/writes are blocked by RLS.
- Confirm all existing actions succeed when org variable is set via extension.

References
- Atlas: Using Row‑Level Security in Prisma (transaction‑scoped `set_config` via Client Extensions).
- Prisma discussions: session‑dependent queries w/ pooling (#5128), SET command support (#4303).
- PostgreSQL RLS docs; pgcrypto docs (for Phase 2 below).

Phase 2 — Data Encryption
Two compatible approaches; choose based on confidentiality target and search needs.

Option A — Server‑side field encryption at rest (fastest integration)
- Use `prisma-field-encryption` to transparently encrypt selected fields. Extend the Prisma client and annotate model fields with `/// @encrypted`.
- Key: `PRISMA_FIELD_ENCRYPTION_KEY` in environment (managed securely). Note: operator with server env access can decrypt; improves at‑rest security but not zero‑knowledge.
- Filtering support: add hash side‑car fields via `/// @encryption:hash(fieldName)` for exact matches.

Fields to encrypt (recommendation)
- Clients: `name`, `email`, `phone`, `secondaryEmail`, `secondaryPhone`, `tags` (consider hash side‑car for equality filtering on tags).
- Properties: `description`, `features` (JSONB); optionally `address.street`, `address.number`, `address.locationText`.
- Interactions: `summary`.
- Notes: `content`.

Keep plaintext for filters
- Properties: `status`, `transactionType`, `propertyType`, `price`, `bedrooms`, `address.city`, `address.region`, `listing.listPrice`, `listing.marketingStatus`.
- Clients: avoid encrypting any field needed for partial text search; rely on hash side‑car for exact match where necessary (e.g., `emailHash`).

Option B — Client‑side end‑to‑end encryption (operator cannot decrypt)
- Generate a per‑user (or per‑org) public/private keypair. Store public key in `users`; private key remains client‑side, encrypted using a key derived from the password gate.
- Before submit: encrypt sensitive fields in the browser; store ciphertext server‑side. On read: decrypt on client after unlocking.
- Filtering: plaintext fields above remain filterable; exact‑match supported via client‑computed hashes stored alongside ciphertext. No partial LIKE/contains on encrypted fields.
- Libraries: Web Crypto (AES‑GCM, RSA/ECC) or openpgp.js. Neon supports `pgcrypto` if server‑side public‑key operations are desired (still no server private keys).

Operational considerations (Option B)
- Key management UX: generation, local encrypted storage (e.g., IndexedDB/localStorage), recovery implications.
- Migration: new/edited records encrypted going forward; backfilling existing plaintext requires users to unlock and re‑save (true E2E cannot be mass‑converted server‑side).

Organization Management — Invitations & Roles (multi‑user per org)
Schema addition: `invitations`
- Columns: `id` (PK), `organizationId` (FK → `organizations`), `email`, `role` (`UserRole`), `token` (unique), `status` (`PENDING|ACCEPTED|CANCELED|EXPIRED`), `invitedBy` (FK → `users`), `expiresAt`, `created_at`.

Server actions (new)
- `inviteUser(email, role)`: check `canManageMembers(session.user.role)`, create invitation for `session.user.organizationId`, email token via Resend.
- `acceptInvite(token)`: validate token; on first sign‑in, assign `user.organizationId` and `user.role` from invitation; mark invitation `ACCEPTED`.
- `removeUser(userId)`: check `canManageMembers`; prevent self‑removal unless `ORG_OWNER`; either set `organizationId` to NULL or create a personal org and reassign.
- `updateUserRole(targetUserId, role)`: enforce `canManageMembers` and `canAssignRole`, ensure target user belongs to your org.

Auth integration (`auth.ts`)
- Modify `events.createUser` to detect an invite token and skip creating a new org; assign invited `organizationId` and `role`.
- Pass invite token through the sign‑in flow (query param → cookie/temp storage → consumed during JWT/build or `createUser`).

Admin gating
- Ensure both `ORG_OWNER` and `ADMIN` can access admin tooling via `canAccessAdmin` and update the admin layout check accordingly.

UI (minimal)
- Members screen: invite form (email + role), list of members (role change, remove), pending invitations (resend/cancel).

Secure Forms & Activity Logging
- Continue following the secure form pattern: auth check, org validation, RBAC via `lib/roles.ts`, server‑side Zod validation, activity logs via `prisma.activity.create`.

Implementation Steps & Estimates
Phase 1 — RLS (≈ 2 days)
- Write RLS policies for primary tables; validate on Neon.
- Add Prisma Client Extension (`set_config` per transaction) and `prismaForOrg` helper.
- Integrate in `actions/clients.ts`, `actions/properties.ts` (incremental), verify cross‑org isolation.

Org Management (≈ 3–3.5 days)
- Migration for `invitations` table.
- Implement server actions: `inviteUser`, `acceptInvite`, `removeUser`, `updateUserRole`.
- Integrate invite token in `auth.ts` (`events.createUser` logic) and session/jwt callbacks.
- Fix admin access gating; add minimal UI for members & invitations.

Phase 2 Option A — Field encryption (≈ 2.5 days)
- Add `prisma-field-encryption`, extend Prisma client, annotate schema; adjust field lengths where needed.
- Choose fields (above), run provided migration generator to backfill; test queries (exact match via hash side‑car).

Phase 2 Option B — Client‑side E2E (≈ 4.5–8 days)
- Crypto utilities & key management integrated with password gate.
- Update Clients & Properties forms and detail views for encrypt/decrypt flows.
- Add hash side‑cars for exact matching; adjust server to store ciphertext + hashes.
- Usability, recovery guidance, and QA.

Verification & Rollout
- Staging tests with two orgs: RLS enforcement, member operations, role changes.
- Regression test existing flows: `createClient`, `updateClient`, `deleteClient`, `getClients`, `createProperty`, `updateProperty`, `archiveProperty`, `getProperties`.
- If Option A: confirm encrypted fields decrypt on read and exact match behaves via hash.
- If Option B: confirm encryption/decryption flows work after password gate unlock, and filters operate on plaintext fields.

Risk & Mitigation
- Connection pooling: use transaction‑scoped `set_config` inside the Prisma Client Extension to avoid PgBouncer issues.
- Search limitations on encrypted fields: design filters to rely on plaintext attributes and use hashes for exact matches only.
- Key loss (Option B): provide clear warnings and optional recovery mechanisms (e.g., downloadable encrypted private key with user‑held passphrase).

Source of Truth & Compliance
- Follow `/docs/vendor/*` snapshots, repo README, and official docs (Auth.js v5, Stripe, Neon, Prisma) when altering auth/payments/db.
- Respect RBAC rules: `ORG_OWNER` full operational/billing; `ADMIN` operational + member management; `AGENT` create/edit own; `VIEWER` read‑only.

Appendix — Symbols referenced
- Actions: `createClient`, `updateClient`, `deleteClient`, `getClients`, `createProperty`, `updateProperty`, `archiveProperty`, `getProperties`.
- Helpers: `canManageMembers`, `canAssignRole`, `canAccessAdmin`.
- Auth: `events.createUser` in `auth.ts`.
- DB client: `prisma` in `lib/db.ts`.
