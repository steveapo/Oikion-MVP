# Role Filtering Fix - Members Link Not Showing

## Problem

The "Members" link wasn't appearing in the sidebar even though you have appropriate permissions.

## Root Cause

The sidebar filtering logic in `/app/(protected)/layout.tsx` was using **exact role matching** instead of **role hierarchy**.

```typescript
// ❌ OLD (WRONG) - Exact match only
return user.role === authorizeOnly;

// ✅ NEW (CORRECT) - Hierarchy-aware
return hasRole(user.role, authorizeOnly);
```

## What This Means

### Before (Broken)
- `authorizeOnly: UserRole.ADMIN` → Only shows to users with **exactly** ADMIN role
- ORG_OWNER users couldn't see it (even though they have higher permissions!)

### After (Fixed)
- `authorizeOnly: UserRole.ADMIN` → Shows to ADMIN **and above** (ORG_OWNER, ADMIN)
- Respects the role hierarchy defined in `/lib/roles.ts`:
  - ORG_OWNER (level 4) ✅ Can access everything
  - ADMIN (level 3) ✅ Can access ADMIN, AGENT, VIEWER items
  - AGENT (level 2) ✅ Can access AGENT, VIEWER items
  - VIEWER (level 1) ✅ Can access VIEWER items only

## Fix Applied

Updated `/app/(protected)/layout.tsx` line 32 to use `hasRole()` function.

## Testing

### 1. Check Your Current Role

```bash
# Start dev server
pnpm dev

# Navigate to
http://localhost:3000/dashboard/settings

# Your role should be displayed (likely ORG_OWNER)
```

### 2. Verify Members Link Appears

After the fix, the "Members" link should now appear in the sidebar for:
- ✅ ORG_OWNER users
- ✅ ADMIN users
- ❌ AGENT users (insufficient permissions)
- ❌ VIEWER users (insufficient permissions)

### 3. Test Access

```bash
# Click "Members" in sidebar
# OR navigate directly to:
http://localhost:3000/dashboard/members
```

You should now see:
- Invite member form
- Members list
- Pending invitations (if any)

## Why You Didn't See It Before

Most likely scenario:
1. You signed up as the first user
2. The system auto-assigned you as **ORG_OWNER** (highest role)
3. The broken code was checking `ORG_OWNER === ADMIN` → false
4. Link was hidden even though you have permission

## If Still Not Showing

### Debug Steps

1. **Check your role in database**:
```bash
npx prisma studio
# Navigate to: users table
# Check your role column
```

2. **Force restart dev server**:
```bash
# Stop server (Ctrl+C)
pnpm dev
# Hard refresh browser (Cmd+Shift+R)
```

3. **Verify the fix was applied**:
```bash
cat app/(protected)/layout.tsx | grep -A 2 "hasRole"
# Should show: return hasRole(user.role, authorizeOnly);
```

4. **Check if you have an organization**:
```bash
npx prisma studio
# Navigate to: users table
# Verify: organizationId is NOT null
```

## Expected Sidebar Items by Role

### ORG_OWNER (You)
- ✅ Dashboard
- ✅ Properties
- ✅ Relations
- ✅ Oikosync
- ✅ **Members** ← Should appear now
- ✅ Billing
- ✅ Settings
- ✅ Documentation
- ⚪ Support (disabled)

### ADMIN
- ✅ Dashboard
- ✅ Properties
- ✅ Relations
- ✅ Oikosync
- ✅ **Members**
- ❌ Billing (ORG_OWNER only)
- ✅ Settings
- ✅ Documentation

### AGENT
- ✅ Dashboard
- ✅ Properties
- ✅ Relations
- ✅ Oikosync
- ❌ Members (needs ADMIN+)
- ❌ Billing (needs ORG_OWNER)
- ✅ Settings
- ✅ Documentation

### VIEWER
- ✅ Dashboard
- ✅ Properties (read-only)
- ✅ Relations (read-only)
- ✅ Oikosync (read-only)
- ❌ Members
- ❌ Billing
- ✅ Settings (limited)
- ✅ Documentation

## Related Files

- `/app/(protected)/layout.tsx` - **Fixed** (now uses hasRole)
- `/config/dashboard.ts` - Sidebar configuration (defines authorizeOnly)
- `/lib/roles.ts` - Role hierarchy and permission helpers
- `/components/layout/dashboard-sidebar.tsx` - Sidebar rendering (no changes needed)

## Status

✅ **FIXED** - Members link will now appear for ORG_OWNER and ADMIN users

---

**Applied**: October 16, 2025  
**Issue**: Role hierarchy not respected in sidebar filtering  
**Solution**: Use `hasRole()` instead of exact comparison
