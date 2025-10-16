# Migration Guide: Security & Multi-Tenancy Setup

This guide walks you through executing the database migrations and testing the new security and multi-tenancy features.

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (Neon or local)
- `.env` file configured with `DATABASE_URL`
- Resend API key for email invitations

---

## Step 1: Install Dependencies

```bash
cd /data/workspace/Oikion-MVP
npm install
# or
pnpm install
```

---

## Step 2: Run Database Migrations

### Apply RLS Migrations

The following migrations have been created and need to be applied:

1. **Primary Tables RLS** (`20251016_rls_primary_tables`)
   - Enables RLS on: properties, clients, tasks, activities

2. **Dependent Tables RLS** (`20251016_rls_dependent_tables`)
   - Enables RLS on: addresses, listings, media_assets, interactions, notes, client_relationships

### Execute Migrations

```bash
npx prisma migrate dev
```

This will:
- Apply both RLS migration files
- Create the `invitations` table
- Add new enum values to `ActionType` and create `InvitationStatus`
- Generate the updated Prisma client

### Verify Migration Success

Connect to your database and verify RLS is enabled:

```sql
-- Check if RLS is enabled on properties table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('properties', 'clients', 'tasks', 'activities');

-- Should return rowsecurity = true for all tables

-- Check RLS policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Should show 4 policies per table (select, insert, update, delete)
```

---

## Step 3: Generate Prisma Client

```bash
npx prisma generate
```

This updates the TypeScript types to include:
- `Invitation` model
- `InvitationStatus` enum
- Updated `ActionType` enum

---

## Step 4: Configure Environment Variables

Add the following to your `.env` file:

```bash
# Resend API for invitation emails
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM="Oikion <invitations@yourdomain.com>"

# Ensure these are set
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...
AUTH_SECRET=your-secret-here
```

---

## Step 5: Restart Development Server

```bash
npm run dev
# or
pnpm dev
```

The server must restart to pick up:
- New Prisma client types
- Updated server actions
- New UI components

---

## Step 6: Testing Checklist

### 🔒 Database Isolation Testing

#### Create Test Organizations

1. **Create Organization A**
   - Register User A: `user-a@test.com`
   - Verify auto-created organization
   - Create 2 properties for Org A
   - Create 2 clients for Org A

2. **Create Organization B**
   - Register User B: `user-b@test.com`
   - Verify auto-created organization
   - Create 2 properties for Org B
   - Create 2 clients for Org B

#### Verify Cross-Org Isolation

**Test in Database:**

```sql
-- Set session variable for Org A
SELECT set_config('app.current_organization', '<org_a_id>', TRUE);

-- Query properties - should only see Org A properties
SELECT id, "organizationId" FROM properties;

-- Switch to Org B
SELECT set_config('app.current_organization', '<org_b_id>', TRUE);

-- Query properties - should only see Org B properties
SELECT id, "organizationId" FROM properties;

-- Try to query without session variable set
SELECT set_config('app.current_organization', '', TRUE);
SELECT * FROM properties;
-- Should return 0 rows (RLS blocks access)
```

**Test in Application:**

1. Sign in as User A
2. Navigate to `/dashboard/properties`
3. Verify you see only Org A's properties
4. Sign out and sign in as User B
5. Navigate to `/dashboard/properties`
6. Verify you see only Org B's properties

### 👥 Invitation System Testing

#### Send Invitation

1. Sign in as User A (ORG_OWNER or ADMIN)
2. Navigate to `/admin/members`
3. Fill out "Invite New Member" form:
   - Email: `newuser@test.com`
   - Role: `AGENT`
4. Click "Send Invitation"
5. Verify success toast appears
6. Check invitation appears in "Pending Invitations" table

#### Check Email

1. Check Resend dashboard or email inbox for `newuser@test.com`
2. Verify email contains:
   - Organization name
   - Role assignment
   - "Accept Invitation" button
   - Expiration date (7 days from now)

#### Accept Invitation

1. Click invitation link in email (or navigate to `/accept-invite?token=<token>`)
2. If not signed in:
   - Verify redirect to login page
   - Sign in with `newuser@test.com`
3. After sign-in:
   - Verify auto-redirect to invitation acceptance
   - Verify success message
   - Verify redirect to dashboard
4. Check `/admin/members`:
   - New user appears in "Organization Members" list
   - Role is correctly set to `AGENT`
   - Invitation status changed to `ACCEPTED`

#### Activity Feed Verification

1. Navigate to activity feed (e.g., `/dashboard/feed` or activities page)
2. Verify events logged:
   - `MEMBER_INVITED` when invitation sent
   - `MEMBER_JOINED` when invitation accepted

### 🔐 Role Management Testing

#### Change User Role

1. Sign in as User A (ORG_OWNER)
2. Navigate to `/admin/members`
3. Find `newuser@test.com` in members list
4. Change role from `AGENT` to `ADMIN` using dropdown
5. Verify:
   - Success toast appears
   - Role updates immediately in table
   - Activity feed shows `MEMBER_ROLE_CHANGED`

#### Role Permission Boundaries

1. Sign in as User with `ADMIN` role
2. Try to assign `ORG_OWNER` role to another user
3. Verify: Operation blocked with error message
4. Try to change own role
5. Verify: Operation blocked with error message

#### Prevent Last Owner Removal

1. Sign in as only `ORG_OWNER` in organization
2. Try to downgrade self to `ADMIN`
3. Verify: Operation blocked with error "Cannot remove the last organization owner"

### 🗑️ Member Removal Testing

#### Remove Member

1. Sign in as User A (ORG_OWNER or ADMIN)
2. Navigate to `/admin/members`
3. Click "Remove" button next to `newuser@test.com`
4. Verify confirmation modal appears with:
   - User name/email
   - Current role
   - Warning about data attribution
5. Click "Remove Member"
6. Verify:
   - Success toast appears
   - User removed from members list
   - Activity feed shows `MEMBER_REMOVED`

#### Verify Access Revocation

1. Sign out
2. Sign in as removed user (`newuser@test.com`)
3. Navigate to `/dashboard/properties`
4. Verify: User sees empty state or error (no org properties visible)
5. Check user record in database:
   ```sql
   SELECT id, email, "organizationId", role 
   FROM users 
   WHERE email = 'newuser@test.com';
   ```
6. Verify: `organizationId` is `NULL`, role is `AGENT`

#### Verify Audit Trail Preserved

1. Before removing user, have them create a property
2. After removal, check that property still exists
3. Verify `createdBy` field still points to removed user's ID
4. Verify property is still visible to other org members

### 🛡️ Admin Access Control Testing

#### ADMIN Role Access

1. Create user with `ADMIN` role
2. Sign in and navigate to `/admin`
3. Verify: Access granted to admin panel
4. Navigate to `/admin/members`
5. Verify: Can view and manage members

#### Billing Restriction

1. As `ADMIN` user, navigate to billing-related pages
2. Verify: Either hidden or shows "ORG_OWNER only" message
3. Sign in as `ORG_OWNER`
4. Verify: Billing pages accessible

#### AGENT/VIEWER Restriction

1. Create user with `AGENT` role
2. Sign in and try to navigate to `/admin`
3. Verify: Redirected to `/dashboard`
4. Try direct URL access to `/admin/members`
5. Verify: Redirected with no access

---

## Step 7: Performance Validation

### Query Latency Check

Monitor database query performance:

```sql
-- Enable query timing
\timing

-- Test property query with RLS
SELECT set_config('app.current_organization', '<org_id>', TRUE);
SELECT * FROM properties WHERE status = 'AVAILABLE';

-- Check execution time (should be < 500ms for reasonable data sizes)
```

### Index Verification

Ensure indexes exist for RLS performance:

```sql
-- Check indexes on foreign keys
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE '%organization%';
```

If performance is slow, consider:
- Adding indexes on `organizationId` columns (should already exist)
- Analyzing query plans with `EXPLAIN ANALYZE`
- Denormalizing `organizationId` onto dependent tables if needed

---

## Troubleshooting

### Migration Fails

**Error: "relation already exists"**
- Solution: Drop existing tables or reset database
  ```bash
  npx prisma migrate reset
  ```

**Error: "permission denied"**
- Solution: Ensure database user has DDL permissions
  ```sql
  GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
  ```

### RLS Blocks All Queries

**Error: "0 rows returned"**
- Cause: `app.current_organization` session variable not set
- Solution: Ensure all queries use `prismaForOrg()` utility
- Debug:
  ```typescript
  const db = prismaForOrg(orgId);
  console.log("Using org:", orgId);
  ```

### Email Invitations Not Sending

**Error: "Failed to send invitation email"**
- Check `RESEND_API_KEY` is set in `.env`
- Verify API key is valid in Resend dashboard
- Check Resend logs for delivery errors
- Ensure `EMAIL_FROM` domain is verified in Resend

### Session Variable Conflicts

**Error: Seeing wrong organization's data**
- Cause: Session variable not transaction-scoped
- Solution: Verify `prismaForOrg` sets variable with `TRUE` flag:
  ```typescript
  SELECT set_config('app.current_organization', orgId, TRUE);
  //                                                     ^^^^ Must be TRUE
  ```

---

## Rollback Procedure

If critical issues arise, follow this rollback:

### 1. Disable RLS Immediately

```sql
-- Disable RLS on all tables
ALTER TABLE "properties" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "clients" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "activities" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "addresses" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "listings" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "media_assets" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "interactions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "notes" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "client_relationships" DISABLE ROW LEVEL SECURITY;
```

### 2. Revert Server Actions

Comment out `prismaForOrg` usage, use `prisma` directly:

```typescript
// Temporary rollback
// const db = prismaForOrg(session.user.organizationId!);
const db = prisma;
```

### 3. Create Rollback Migration

```bash
npx prisma migrate dev --name rollback_rls
```

Edit migration to drop policies:

```sql
-- Drop all RLS policies
DROP POLICY IF EXISTS "properties_select_policy" ON "properties";
-- ... repeat for all policies
```

---

## Next Steps After Migration

1. **Monitor Production Metrics**
   - Query latency (Datadog, CloudWatch, etc.)
   - Error rates on member management endpoints
   - Email delivery success rate

2. **User Training**
   - Document invitation workflow for admins
   - Create role permission matrix
   - Share member management best practices

3. **Future Enhancements**
   - Automated invitation expiry cleanup (cron job)
   - Bulk member invitation (CSV upload)
   - Field-level encryption for sensitive data
   - Real-time notifications on member actions

---

## Support & Documentation

- **Implementation Status**: `/IMPLEMENTATION_STATUS.md`
- **Design Document**: `/docs/design/security-multi-tenancy.md`
- **Role Utilities**: `/lib/roles.ts`
- **RLS Utilities**: `/lib/org-prisma.ts`
- **Server Actions**: `/actions/invitations.ts`, `/actions/members.ts`

For issues, check logs in:
- Server console (Next.js dev server)
- Database logs (Neon dashboard or `psql` logs)
- Resend dashboard (email delivery)

---

**Migration Completed**: ✅  
**Estimated Total Time**: 30-45 minutes  
**Last Updated**: October 16, 2025
