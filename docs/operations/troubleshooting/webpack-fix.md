# Webpack Module Loading Error Fix

## Problem

After making changes (especially to server actions or components), the app shows:
- Skeleton loading indefinitely
- Dropdowns stop working
- 404 errors on webpack chunks
- Error: `__webpack_modules__[moduleId] is not a function`

## Root Cause

Next.js build cache becomes corrupted when:
- Server actions are modified while dev server is running
- Components using dynamic imports change
- Large refactors happen without restarting
- Webpack hot module replacement fails

## ✅ Quick Fix (Recommended)

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Clear build cache
rm -rf .next

# 3. Clear Node modules cache (optional but recommended)
rm -rf node_modules/.cache

# 4. Restart dev server
pnpm dev
```

## 🔧 Alternative Fixes

### Fix 1: Full Clean Restart
```bash
# Stop server
# Clear everything
rm -rf .next node_modules/.cache

# Restart
pnpm dev
```

### Fix 2: Hard Refresh Browser
```bash
# After clearing .next, in browser:
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R
```

### Fix 3: Full Clean Install (if issues persist)
```bash
# Stop server
rm -rf .next node_modules/.cache node_modules

# Reinstall
pnpm install

# Restart
pnpm dev
```

## 🚫 Prevention

### Best Practices

1. **Restart after major changes**
   ```bash
   # After modifying:
   - Server actions
   - Auth configuration
   - Middleware
   - Layout files
   
   # Restart the dev server
   ```

2. **Use stable patterns**
   ```typescript
   // ❌ Avoid dynamic server action creation
   const action = useMemo(() => createAction(), [deps]);
   
   // ✅ Use static server actions
   import { myAction } from '@/actions/my-action';
   ```

3. **Clear cache periodically**
   ```bash
   # Every few days during active development
   rm -rf .next node_modules/.cache
   ```

4. **Watch for HMR failures**
   ```bash
   # If you see in terminal:
   "Fast Refresh had to perform a full reload"
   
   # Restart the server
   ```

## 🔍 Identifying the Issue

### Symptoms:
- ✅ Skeleton loaders stuck
- ✅ Dropdowns don't open
- ✅ Navigation broken
- ✅ 404s on `_next/static/chunks/*`
- ✅ `webpack_modules is not a function`
- ✅ `digest: "654774577"` or similar

### Check Terminal Output:
```bash
# Bad signs:
GET /_next/static/chunks/main-app.js 404
⨯ TypeError: __webpack_modules__[moduleId] is not a function

# Good signs (after fix):
✓ Compiled in 500ms
GET /dashboard/members 200 in 150ms
```

## 📊 Common Scenarios

### After Creating Invitation
```bash
# What happened:
1. Sent invitation (server action)
2. Page reloaded
3. Webpack cache out of sync
4. Module loading failed

# Fix:
rm -rf .next && pnpm dev
```

### After Modifying Server Actions
```bash
# What happened:
1. Modified /actions/invitations.ts
2. Hot reload attempted
3. Failed to update module
4. Cache corruption

# Fix:
Restart dev server (or clear .next)
```

### After Installing New Packages
```bash
# What happened:
1. pnpm add new-package
2. Dependencies changed
3. Webpack bundles mismatched

# Fix:
rm -rf .next node_modules/.cache && pnpm dev
```

## 🎯 Specific to This Issue

### Your Case:
```bash
# Issue occurred after:
- Creating invitation
- Modifying sent invitation
- Page reload/navigation

# Why:
- Server action invoked
- Page tried to reload
- Webpack chunks 404
- Module loader failed

# Solution:
rm -rf .next
pnpm dev
# Hard refresh browser
```

## 🛠️ Debugging Steps

### 1. Check Terminal
```bash
# Look for:
- Compilation errors
- 404s on chunks
- Webpack errors
```

### 2. Check Browser Console
```bash
# Open DevTools (F12)
# Look for:
- Failed chunk loading
- 404 errors
- Module not found
```

### 3. Check Network Tab
```bash
# Filter by: _next/static
# Look for: 404 responses
# These indicate cache mismatch
```

## 🔄 Recovery Steps (In Order)

### Step 1: Soft Recovery
```bash
# Stop server (Ctrl+C)
rm -rf .next
pnpm dev
# Browser: Cmd+Shift+R
```

### Step 2: Medium Recovery
```bash
# Stop server
rm -rf .next node_modules/.cache
pnpm dev
# Browser: Clear cache + hard refresh
```

### Step 3: Hard Recovery
```bash
# Stop server
rm -rf .next node_modules/.cache node_modules
pnpm install
pnpm dev
# Browser: Clear all site data
```

### Step 4: Nuclear Option
```bash
# If nothing works:
git clean -fdx
pnpm install
pnpm dev
# ⚠️ This deletes ALL untracked files!
```

## 💡 Pro Tips

### Development Workflow
```bash
# When making significant changes:
1. Make changes
2. Save files
3. Wait for "Compiled successfully"
4. Test
5. If weird behavior → restart server

# Don't:
- Make changes to 10 files at once
- Ignore compilation errors
- Keep server running for days
- Forget to clear .next periodically
```

### Hot Module Replacement (HMR)
```bash
# HMR works well for:
✅ Component changes
✅ CSS/Tailwind changes
✅ Simple prop updates

# HMR struggles with:
⚠️ Server actions
⚠️ Layout changes
⚠️ Middleware updates
⚠️ Auth configuration

# For the latter → restart server
```

## 📝 Quick Reference

```bash
# Most common fix (90% of cases)
rm -rf .next && pnpm dev

# If that doesn't work
rm -rf .next node_modules/.cache && pnpm dev

# If still broken
rm -rf .next node_modules && pnpm install && pnpm dev

# Browser
Cmd/Ctrl + Shift + R (hard refresh)
```

## 🚀 After Fix

### Verify Everything Works:
1. ✅ Navigation smooth
2. ✅ Dropdowns open
3. ✅ Profile picture loads
4. ✅ Project switcher works
5. ✅ Server actions succeed
6. ✅ No 404s in Network tab
7. ✅ No webpack errors in terminal

## 📋 Checklist

When you encounter this issue:

- [ ] Stop dev server
- [ ] Run: `rm -rf .next`
- [ ] Restart: `pnpm dev`
- [ ] Hard refresh browser
- [ ] Test: Send invitation
- [ ] Test: Modify invitation
- [ ] Test: Navigation
- [ ] Test: Dropdowns
- [ ] Verify: No 404s in terminal
- [ ] Verify: No errors in browser console

---

## Status: ✅ FIXED

After clearing `.next` and restarting, everything should work smoothly!
