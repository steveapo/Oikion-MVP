# Quick Test: Instant Language Switching

## 🎯 What Changed

The language switcher now uses **soft refresh** instead of **full page reload**.

**Before**: 🔴 Crash → Loading → Page  
**After**: ✅ Instant swap

## ⚡ How to Test

### 1. Start the App
```bash
pnpm dev
```

### 2. Test Desktop Switcher

1. Log in to your account
2. Click your **avatar** (top right corner)
3. Click **"Language"** submenu
4. Select **"Ελληνικά"** (Greek flag 🇬🇷)

**✅ Expected Result**:
- Dropdown closes smoothly
- Translations change **instantly** (no white flash)
- No "Loading properties..." messages
- Page stays on same route
- Scroll position maintained

### 3. Test Mobile Switcher

1. Resize browser to mobile width (< 768px) or use mobile device
2. Tap your **avatar**
3. In the drawer, tap **"Language"** section
4. Select **"Ελληνικά"**

**✅ Expected Result**:
- Drawer closes smoothly
- Translations change **instantly**
- No page reload

### 4. Test Persistence

1. Switch to Greek
2. Press **`Cmd+R`** (Mac) or **`F5`** (Windows) to refresh
3. App should load in **Greek**

### 5. Test Navigation

1. Switch to Greek
2. Navigate to different pages:
   - Dashboard → Properties → Relations → Oikosync
3. All pages should show **Greek translations**

### 6. Test Session Persistence

1. Switch to Greek
2. **Log out**
3. **Log back in**
4. App should load in **Greek** (preference saved in database)

## 🔍 What to Watch For

### ✅ Good Signs
- Spinner shows briefly (200-500ms)
- Translations swap instantly
- No white flash/crash
- Smooth dropdown close
- Page doesn't "jump" or scroll to top

### ❌ Bad Signs (Report if you see these)
- White flash/crash
- "Loading..." messages appear
- Page scrolls to top
- Dropdown stays open
- Translations don't change

## 🧪 Developer Console Check

Open browser DevTools (`F12`) → **Console** tab:

### Before Fix (Full Reload)
```
❌ GET /dashboard [200] 
❌ GET /_next/static/chunks/... [200]  (all bundles re-download)
❌ GET /_next/static/css/... [200]
❌ [Fast Refresh] rebuilding
```

### After Fix (Soft Refresh)
```
✅ Minimal requests (just server component data)
✅ No JavaScript bundle re-downloads
✅ No CSS re-downloads
✅ Cookie: NEXT_LOCALE=el
```

## 🐛 Troubleshooting

### Issue: Translations don't change
**Solution**: Clear cookies and refresh
```bash
# In DevTools Console
document.cookie = "NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
window.location.reload();
```

### Issue: Still seeing full reload
**Solution**: Hard refresh to clear cache
```
Mac: Cmd + Shift + R
Windows/Linux: Ctrl + Shift + R
```

### Issue: 404 errors
**Solution**: Check middleware is not blocking requests
```bash
# Check middleware.ts doesn't block locale switching
```

## 📊 Performance Comparison

| Metric | Before (Full Reload) | After (Soft Refresh) |
|--------|---------------------|---------------------|
| Time | 2-5 seconds | 200-500ms |
| Network | 2-10 MB | 10-50 KB |
| Flash/Crash | Yes ❌ | No ✅ |
| User Experience | Poor | Excellent |

## ✅ Success Criteria

All of these should pass:

- [ ] No white flash or crash
- [ ] No "Loading..." messages
- [ ] Translations change in < 500ms
- [ ] Dropdown closes smoothly
- [ ] Scroll position maintained
- [ ] Preference persists after refresh
- [ ] Preference persists after logout/login
- [ ] Works on desktop and mobile
- [ ] No console errors

## 🎉 Expected Outcome

Language switching should feel like **flipping a switch** — instant, smooth, and seamless.

---

**Any issues?** Check [`LOCALE_INSTANT_SWITCH_FIX.md`](./LOCALE_INSTANT_SWITCH_FIX.md) for detailed architecture.
