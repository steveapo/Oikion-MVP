# Fix: Duplicate Personal Workspace Prevention

## Problem
Users were getting duplicate "Private Workspace" entries in the organization switcher dropdown. This occurred when the invitation acceptance flow created a second personal workspace instead of reusing the existing one.

## Root Cause
The `auth.ts` `createUser` event was **always** creating a new personal workspace without checking if the user already had one. This could happen in edge cases where:
1. User was invited to an organization
2. During sign-up, a personal workspace was created
3. If the flow was interrupted or re-triggered, another personal workspace could be created

## Solution Implemented

### 1. Database Cleanup Script
**File**: `scripts/cleanup-duplicate-workspaces.mjs`

- Scans all users for duplicate personal workspace memberships
- Keeps the oldest personal workspace (first created)
- Deletes duplicate memberships and orphaned workspaces
- Verifies the cleanup was successful

**Run**: `node scripts/cleanup-duplicate-workspaces.mjs`

### 2. Prevention in Auth Flow
**File**: `auth.ts` (lines 47-85)

**Before**:
```typescript
// ALWAYS create a personal organization
const personalOrg = await prisma.organization.create({...});
```

**After**:
```typescript
// Check if user already has a personal organization
const existingPersonalOrg = await prisma.organizationMember.findFirst({
  where: {
    userId: user.id,
    organization: { isPersonal: true },
  },
  include: { organization: true },
});

let personalOrg;
if (existingPersonalOrg) {
  // Reuse existing
  personalOrg = existingPersonalOrg.organization;
} else {
  // Create new
  personalOrg = await prisma.organization.create({...});
  await prisma.organizationMember.create({...});
}
```

### 3. Deduplication in getUserOrganizations()
**File**: `actions/organizations.ts` (lines 44-120)

Added three layers of protection:
1. **Uniqueness filter**: Filters out duplicate organization IDs using `Set`
2. **Warning logging**: Logs any duplicates detected
3. **Personal workspace limit**: Ensures max 1 personal workspace is returned
   - If >1 detected, returns only the first one + logs error

**Code**:
```typescript
// Ensure uniqueness by organization ID
const seen = new Set<string>();
const uniqueOrganizations = organizations.filter(org => {
  if (seen.has(org.id)) {
    console.warn(`[WARN] Duplicate organization detected: ${org.id}`);
    return false;
  }
  seen.add(org.id);
  return true;
});

// Double-check: ensure only ONE personal workspace
const personalWorkspaces = uniqueOrganizations.filter(org => org.isPersonal);
if (personalWorkspaces.length > 1) {
  console.error(`[ERROR] User has ${personalWorkspaces.length} personal workspaces!`);
  return [
    personalWorkspaces[0],
    ...uniqueOrganizations.filter(org => !org.isPersonal),
  ];
}
```

### 4. Updated Migration Script
**File**: `scripts/ensure-personal-orgs.mjs`

- Checks for existing personal workspace membership before creating
- Prevents double-creation during manual data fixes
- Sets user's active organization if missing

## Testing Performed

### 1. Detection
```bash
node scripts/check-duplicate-workspaces.mjs
```
**Result**: Found `agent@oikion.com` with 2 personal workspaces

### 2. Cleanup
```bash
node scripts/cleanup-duplicate-workspaces.mjs
```
**Result**: 
- Removed 1 duplicate workspace
- Deleted orphaned organization
- Verified all users now have exactly 1 personal workspace

### 3. Prevention Verification
- New user registration: ✅ Creates 1 personal workspace
- Invited user registration: ✅ Reuses existing personal workspace
- Organization dropdown: ✅ Shows only 1 "Private Workspace"

## Future Prevention

### Database Constraints
While we can't add a unique constraint directly (many-to-many relationship), the code now enforces:
1. **Check before create**: Always check for existing personal workspace
2. **Deduplication**: Filter duplicates in queries
3. **Logging**: Warn/error on anomalies for monitoring

### Monitoring
The system now logs:
- `[AUTH] User X already has personal workspace: Y` - Reusing existing
- `[WARN] Duplicate organization detected: X` - Found during query
- `[ERROR] User X has N personal workspaces!` - Critical issue

## Commands Reference

### Check for Duplicates
```bash
node scripts/check-duplicate-workspaces.mjs
```

### Clean Up Duplicates
```bash
node scripts/cleanup-duplicate-workspaces.mjs
```

### Ensure All Users Have Personal Workspace
```bash
node scripts/ensure-personal-orgs.mjs
```

## Files Modified

1. `auth.ts` - Added duplicate prevention in createUser event
2. `actions/organizations.ts` - Added deduplication in getUserOrganizations()
3. `scripts/ensure-personal-orgs.mjs` - Added duplicate check
4. `scripts/cleanup-duplicate-workspaces.mjs` - NEW: Cleanup utility
5. `scripts/check-duplicate-workspaces.mjs` - NEW: Detection utility

## Verification

After running cleanup:
```
✅ admin@oikion.com: 1 personal workspace
✅ testit@aaah.gr: 1 personal workspace
✅ demo@gmail.com: 1 personal workspace
✅ agent@oikion.com: 1 personal workspace  // Was 2, now fixed
```

All users now have exactly **1 personal workspace** and the dropdown shows no duplicates.
