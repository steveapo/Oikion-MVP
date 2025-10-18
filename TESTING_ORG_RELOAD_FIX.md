# Quick Testing Guide - Organization Reload Fix

## ✅ What Was Fixed

We've eliminated unnecessary organization data reloads that were happening every time you switched windows, tabs, or applications.

---

## 🧪 How to Test

### **Test 1: Window Focus Changes (The Main Issue)**

1. **Start the dev server** (already running at http://localhost:3000)
2. **Open browser DevTools** → Network tab
3. **Log into the dashboard** (if not already)
4. **Clear Network tab** in DevTools
5. **Switch to another application** (e.g., open Finder, Terminal, etc.)
6. **Switch back to the browser**
7. **Check the Network tab**

**Expected Result**: ✅ **NO new POST requests** should appear  
**Old Behavior**: ❌ Would show 2 POST requests to org endpoints + skeleton UI flash

---

### **Test 2: Browser Tab Changes**

1. **Open DevTools Network tab** and clear it
2. **Open a new browser tab** (Cmd+T)
3. **Go back to the Oikion dashboard tab**
4. **Check Network tab**

**Expected Result**: ✅ **NO new POST requests**  
**Old Behavior**: ❌ Would reload org data

---

### **Test 3: Minimize/Maximize Window**

1. **Clear DevTools Network tab**
2. **Minimize the browser window** (Cmd+M)
3. **Restore the browser window** (click on dock icon)
4. **Check Network tab**

**Expected Result**: ✅ **NO new POST requests**  
**Old Behavior**: ❌ Would reload org data

---

### **Test 4: Org Switch (Should Still Work)**

1. **Clear Network tab**
2. **Click on the organization switcher** (top left)
3. **Switch to a different organization**
4. **Check Network tab**

**Expected Result**: ✅ **POST requests SHOULD appear** (this is intentional)  
**UI should update** to show the new org name immediately

---

### **Test 5: Create New Organization**

1. **Clear Network tab**
2. **Click org switcher** → "New Organization"
3. **Create a new org** with any name
4. **Check that**:
   - ✅ New org appears in the list
   - ✅ You're switched to the new org
   - ✅ POST requests are visible (intentional)

---

### **Test 6: Update Organization Name**

1. **Go to** `/dashboard/settings`
2. **Change the organization name**
3. **Save changes**
4. **Go back to dashboard**
5. **Check org switcher**

**Expected Result**: ✅ Updated org name shows in switcher

---

### **Test 7: Delete Organization**

1. **Go to** `/dashboard/settings`
2. **Scroll to "Delete Organization"** section
3. **Delete the org**
4. **Check that**:
   - ✅ You're switched to Personal workspace
   - ✅ Deleted org is gone from switcher
   - ✅ No errors in console

---

## 🔍 What to Look For

### **Good Signs** ✅
- No skeleton/loading UI when switching windows
- No POST requests in Network tab when switching focus
- Org switcher stays stable (doesn't flash)
- Page doesn't "reload" when you come back to the tab

### **Bad Signs** ❌
- Skeleton UI appears when switching windows (means it's still reloading)
- POST requests to `/api/...` when changing focus
- Org name disappears briefly then reappears
- Console errors about context or providers

---

## 📊 Network Tab - What to Expect

### **On Window Focus Change** (The Fix!)
```
Network Tab: (empty - no new requests) ✅
```

### **On Org Switch**
```
Network Tab:
  POST /api/organizations/switch  ✅ (intentional)
  GET  /api/organizations/current ✅ (intentional)
```

### **On Initial Page Load**
```
Network Tab:
  Various GET requests for page load ✅ (normal)
  GET /api/organizations/current ✅ (normal)
```

---

## 🐛 If Something Breaks

### **Org switcher shows error or skeleton forever**
- Check browser console for errors
- Try refreshing the page (Cmd+R)
- Verify dev server is running

### **Org name doesn't update after changing settings**
- This would indicate the context isn't triggering
- Check console for errors
- File a bug with steps to reproduce

### **Can't switch orgs**
- Clear browser cache
- Hard refresh (Cmd+Shift+R)
- Check if POST request is failing in Network tab

---

## 📝 Report Your Findings

After testing, please note:

1. **Did the window focus issue go away?** (Most important!)
2. **Do org mutations still work?** (switch, create, update, delete)
3. **Any errors in console?**
4. **Any unexpected UI behavior?**

---

## 🎯 Success Criteria

- ✅ **No** org reload when switching windows/tabs
- ✅ **Yes** org reload when switching orgs
- ✅ **Yes** org reload when creating org
- ✅ **Yes** org reload when updating org name
- ✅ **Yes** org reload when deleting org
- ✅ No console errors
- ✅ Smooth UX with no UI flickering

---

## 🔧 Technical Details

If you want to dive deeper, see:
- [ORG_RELOAD_OPTIMIZATION.md](./ORG_RELOAD_OPTIMIZATION.md) - Full technical documentation
- `/lib/organization-context.tsx` - The new context provider
- `/components/dashboard/project-switcher.tsx` - Main changes to switcher logic
