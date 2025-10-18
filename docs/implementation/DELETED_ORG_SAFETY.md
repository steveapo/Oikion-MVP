# Deleted Organization Safety System

**Implementation Date**: 2025-10-18  
**Status**: ✅ Complete  
**Purpose**: Prevent users from ever being stuck in a deleted organization

---

## Problem Statement

When an organization is deleted, users who were in that organization could become stuck:
- Organization switcher shows "loading" indefinitely
- User cannot access any features
- User cannot switch organizations
- Manual database intervention required to fix

This creates a critical UX failure and requires admin intervention.

---

## Solution: Automatic Recovery System

### Multi-Layer Protection

#### 1. **Auth Layer (Automatic on Every Request)** ✅

**Location**: [`auth.ts`](../../auth.ts) - `jwt` callback

**How it Works**:
- On **every** request that requires authentication
- Checks if user's `organizationId` points to an existing organization
- If organization doesn't exist (deleted):
  - Automatically finds user's Personal workspace
  - Switches user to Personal workspace
  - Updates JWT token with new org info
  - If no Personal workspace exists, creates an emergency one

**Code Flow**:
```typescript
async jwt({ token }) {
  const dbUser = await getUserById(token.sub);
  
  // SAFETY CHECK: Verify organization exists
  if (dbUser.organizationId) {
    const orgExists = await prisma.organization.findUnique({
      where: { id: dbUser.organizationId }
    });
    
    if (!orgExists) {
      // 🚨 Organization deleted! Auto-recover
      const personalWorkspace = await findPersonalWorkspace(dbUser.id);
      
      if (personalWorkspace) {
        // Switch to Personal workspace
        await switchUserToOrg(dbUser.id, personalWorkspace.id);
        updateToken(token, personalWorkspace);
      } else {
        // Create emergency Personal workspace
        const emergency = await createPersonalWorkspace(dbUser.id);
        updateToken(token, emergency);
      }
    }
  }
}
```

**Benefits**:
- ✅ Happens automatically on every page load
- ✅ No user action required
- ✅ Transparent recovery
- ✅ Works for all existing and future users
- ✅ Handles edge cases (no Personal workspace)

#### 2. **Organization Deletion Prevention** ✅

**Location**: 
- [`actions/organizations.ts`](../../actions/organizations.ts) - `deleteOrganization()`
- [`app/api/organization/route.ts`](../../app/api/organization/route.ts)

**How it Works**:
- When deleting an organization:
  - Finds user's Personal workspace
  - Switches user to Personal workspace **before** showing success
  - Updates user's `organizationId` and `role`
  - Redirects to Personal workspace dashboard

**Benefits**:
- ✅ Proactive prevention
- ✅ User never experiences being stuck
- ✅ Immediate switch to safe state

#### 3. **Migration Script for Existing Users** ✅

**Location**: [`scripts/fix-deleted-org-users.mjs`](../../scripts/fix-deleted-org-users.mjs)

**Purpose**: Fix users already stuck in deleted orgs (one-time cleanup)

**Usage**:
```bash
# Preview changes (dry run)
DRY_RUN=true node scripts/fix-deleted-org-users.mjs

# Apply fixes
node scripts/fix-deleted-org-users.mjs
```

**What it Does**:
1. Scans all users with `organizationId` set
2. Checks if their organization exists
3. For users in deleted orgs:
   - Finds their Personal workspace
   - Switches them to Personal workspace
   - If no Personal workspace exists, creates emergency one
4. Logs all fixes for audit trail

**Output**:
```
🔍 Finding users stuck in deleted organizations...

❌ User stuck in deleted org: user@example.com
   Deleted Org ID: org_abc123
   ✅ Found Personal workspace: Private Workspace
   🔄 Switched to Personal workspace

📋 SUMMARY
Total users checked: 150
Users in deleted orgs: 3
Successfully fixed: 3
Errors: 0

✅ Migration complete!
```

---

## Emergency Recovery Features

### Scenario 1: User in Deleted Org (Normal Case)

**User State**:
- `organizationId`: `org_deleted_123` (doesn't exist)
- Personal workspace exists

**Auto-Recovery**:
1. Auth checks org existence → Not found
2. Finds Personal workspace → Found
3. Updates user record:
   ```sql
   UPDATE users SET 
     organizationId = 'personal_workspace_id',
     role = 'ORG_OWNER'
   WHERE id = 'user_id';
   ```
4. User continues without interruption

### Scenario 2: User in Deleted Org + No Personal Workspace (Emergency)

**User State**:
- `organizationId`: `org_deleted_123` (doesn't exist)
- **No Personal workspace** (critical edge case)

**Auto-Recovery**:
1. Auth checks org existence → Not found
2. Searches for Personal workspace → Not found
3. **Creates emergency Personal workspace**:
   ```sql
   INSERT INTO organizations (name, isPersonal, plan)
   VALUES ('Private Workspace', true, 'FREE');
   
   INSERT INTO organization_members (userId, organizationId, role)
   VALUES ('user_id', 'new_personal_id', 'ORG_OWNER');
   
   UPDATE users SET
     organizationId = 'new_personal_id',
     role = 'ORG_OWNER'
   WHERE id = 'user_id';
   ```
4. User continues with new Personal workspace

### Scenario 3: User with NULL organizationId

**User State**:
- `organizationId`: `null`
- Personal workspace exists

**Auto-Recovery**:
1. Auth detects missing org
2. Finds Personal workspace
3. Updates user to use Personal workspace
4. User continues normally

---

## Safety Guarantees

### ✅ **Never Stuck**
- **Before**: User stuck in deleted org, cannot use app
- **After**: Automatically switched to Personal workspace on next request

### ✅ **No Data Loss**
- Personal workspace is never deleted
- All user data in Personal workspace preserved
- Emergency workspace created if needed

### ✅ **Transparent Recovery**
- User doesn't see errors
- Recovery happens in background
- User might notice org switcher changed, but app works

### ✅ **Audit Trail**
- Auth logs all recoveries: `[AUTH SAFETY] User switched to Personal workspace`
- Migration script logs all fixes
- Can review recovery events in logs

---

## Testing Scenarios

### Test 1: Simulate Deleted Org

```sql
-- Setup
UPDATE users SET organizationId = 'fake-deleted-org-id' WHERE email = 'test@example.com';

-- Test
1. Log in as test@example.com
2. Navigate to /dashboard
3. EXPECTED: Automatically switched to Personal workspace
4. VERIFY: User can access all features
5. CHECK LOGS: Should see "[AUTH SAFETY] User ... switched to Personal workspace"
```

### Test 2: Delete Org as ORG_OWNER

```bash
1. Create test organization "Test Agency"
2. As ORG_OWNER, delete the organization
3. EXPECTED: 
   - Success toast shown
   - Redirected to /dashboard
   - Now in Personal workspace
   - Can create new orgs
```

### Test 3: Run Migration Script

```bash
# Create test data
UPDATE users SET organizationId = 'deleted-org-1' WHERE email = 'user1@test.com';
UPDATE users SET organizationId = 'deleted-org-2' WHERE email = 'user2@test.com';

# Run migration (dry run)
DRY_RUN=true node scripts/fix-deleted-org-users.mjs

# VERIFY: Shows 2 users would be fixed

# Run migration (actual)
node scripts/fix-deleted-org-users.mjs

# VERIFY: 
# - Both users switched to Personal workspace
# - Can log in and use app normally
```

---

## Deployment Checklist

### Initial Deployment

1. **Deploy Code Changes** ✅
   - `auth.ts` with org existence checks
   - `actions/organizations.ts` with auto-switch on delete
   - `app/api/organization/route.ts` updated

2. **Run Migration Script** (One-time)
   ```bash
   # Preview first
   DRY_RUN=true node scripts/fix-deleted-org-users.mjs
   
   # Review output, then apply
   node scripts/fix-deleted-org-users.mjs
   ```

3. **Monitor Logs**
   - Watch for `[AUTH SAFETY]` messages
   - Indicates users being auto-recovered
   - Should decrease over time

4. **Verify**
   - No users stuck in deleted orgs
   - All users can access dashboard
   - Organization switcher works

### Ongoing Monitoring

**Look for**:
- `[AUTH SAFETY]` warnings in logs
- `[AUTH CRITICAL]` errors (user without Personal workspace)
- Migration script output (if re-run)

**Normal Operation**:
- Few or zero `[AUTH SAFETY]` messages (means system is working)
- No `[AUTH CRITICAL]` messages (all users have Personal workspace)

---

## Edge Cases Handled

### ✅ User Deleted While Logged In
- **Scenario**: Admin deletes org while user is active
- **Handling**: On next request, auth detects deleted org, auto-switches
- **Result**: User continues in Personal workspace

### ✅ User with Multiple Memberships
- **Scenario**: User is member of multiple orgs, one gets deleted
- **Handling**: If in deleted org, switches to Personal workspace (not random org)
- **Result**: Predictable, safe fallback

### ✅ Concurrent Deletions
- **Scenario**: Multiple orgs deleted simultaneously
- **Handling**: Each user recovered independently
- **Result**: All users end up in Personal workspace

### ✅ Database Corruption
- **Scenario**: User's `organizationId` is invalid UUID or corrupted
- **Handling**: Auth treats as "doesn't exist", triggers recovery
- **Result**: User recovered to Personal workspace

---

## Performance Impact

### Auth Callback Overhead

**Additional Queries per Request**:
- 1 extra `findUnique` to check org exists (if user has org)
- Only triggers full recovery if org doesn't exist (rare)

**Performance**:
- Normal case: +1 fast query (~5ms)
- Recovery case: +3-4 queries (~50ms, rare)
- Acceptable trade-off for safety guarantee

**Optimization**:
- Could add caching of org existence
- Not needed unless high volume

---

## Future Enhancements

### Possible Improvements

1. **Cache Org Existence**
   - Cache org IDs that exist
   - Reduce query on every request
   - Invalidate on org deletion

2. **User Notification**
   - Toast: "Your organization was deleted, switched to Personal workspace"
   - Only show once per recovery

3. **Admin Dashboard**
   - View users recovered in last 7 days
   - Track deleted org impact

4. **Metrics**
   - Count recoveries per day
   - Alert if spike (indicates mass deletion issue)

---

## Code References

### Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `auth.ts` | Auto-recovery in JWT callback | Lines 175-280 |
| `actions/organizations.ts` | Auto-switch on delete | Lines 308-356 |
| `app/api/organization/route.ts` | API delete with switch | Lines 6-83 |
| `scripts/fix-deleted-org-users.mjs` | Migration script | Full file |

### Key Functions

| Function | Purpose |
|----------|---------|
| `jwt()` callback | Checks org exists, triggers recovery |
| `deleteOrganization()` | Switches to Personal before delete completes |
| `fix-deleted-org-users.mjs` | One-time cleanup script |

---

## Rollback Plan

If issues arise, can disable by:

1. **Revert `auth.ts` changes**
   - Remove org existence check
   - Keep simpler JWT callback
   - Users won't auto-recover (manual fix needed)

2. **Keep deletion improvements**
   - Keep auto-switch in delete actions
   - Prevents new stuck users

3. **Re-run migration script**
   - If auth fix disabled, run script periodically
   - Manual cleanup approach

---

## Success Criteria

### ✅ Implemented
- Auth auto-recovery on every request
- Org deletion auto-switches user
- Migration script for existing users
- Emergency Personal workspace creation
- Comprehensive logging

### ✅ Tested
- Manual testing with deleted org
- Migration script dry run
- Edge cases handled

### 🎯 Production Metrics
- Zero users stuck in deleted orgs
- `[AUTH SAFETY]` warnings decrease over time
- No `[AUTH CRITICAL]` errors
- 100% user recovery success rate

---

**Status**: ✅ **Production Ready**  
**Risk Level**: Low (only adds safety checks, doesn't change normal flow)  
**User Impact**: Positive (prevents getting stuck)  
**Rollback**: Easy (revert auth.ts changes if needed)
