# i18n Installation & Activation Guide

## 🎯 Objective

This guide walks you through activating the internationalization (i18n) system that has been set up for the Oikion MVP application.

---

## ✅ Pre-Flight Checklist

Before starting, verify all files are in place:

```bash
chmod +x scripts/verify-i18n-setup.sh
./scripts/verify-i18n-setup.sh
```

**Expected output**: All checks passed ✅

---

## 📦 Step 1: Install Dependencies

Install the `next-intl` package and all other dependencies:

```bash
cd /path/to/Oikion-MVP
pnpm install
```

**Verification**:
```bash
# Check if next-intl is installed
ls node_modules/ | grep next-intl
```

**Expected**: You should see `next-intl` directory

**Troubleshooting**:
- If pnpm is not installed: `npm install -g pnpm`
- If installation fails: Delete `node_modules/` and `pnpm-lock.yaml`, then retry

---

## 🗄️ Step 2: Apply Database Migration

Add the `preferredLocale` column to the users table:

### Option A: Production/Staging

```bash
npx prisma migrate deploy
```

### Option B: Development

```bash
npx prisma migrate dev
```

**Verification**:
```bash
# Open Prisma Studio to verify column exists
npx prisma studio
```

Navigate to the `User` model and check for `preferredLocale` field.

**Troubleshooting**:
- If migration already applied: You'll see "No pending migrations"
- If error "Column already exists": Run `npx prisma migrate resolve --applied 20251018_add_preferred_locale`

---

## 🔄 Step 3: Generate Prisma Client

Regenerate the Prisma client to include the new field:

```bash
npx prisma generate
```

**Verification**: No errors in console output

---

## ✅ Step 4: Validate Translations

Run the translation validation script:

```bash
pnpm validate:i18n
```

**Expected Output**:
```
🌍 Validating translations...
Checking locale: el
  ✓ common.json
  ✓ dashboard.json
  ✓ properties.json
  ✓ relations.json
  ✓ oikosync.json
  ✓ members.json
  ✓ billing.json
  ✓ settings.json
  ✓ navigation.json
  ✓ validation.json
  ✓ errors.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary:
  • Locales validated: 1 (excluding en)
  • Critical pages: 11
  • Total checks: 11
  • Errors: 0
  • Warnings: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ All translations validated successfully!
```

**Troubleshooting**:
- If errors appear: The script will list missing translation keys
- Fix by adding missing keys to the appropriate `messages/el/*.json` files

---

## 🏗️ Step 5: Test Build

Verify the build process works with validation:

```bash
pnpm build
```

**Expected**: Build completes successfully

The build process will:
1. Run `validate:i18n` (translation validation)
2. Run `contentlayer:fix` (content layer build)
3. Run `next build` (Next.js build)

**Troubleshooting**:
- If validation fails: Fix reported translation errors
- If TypeScript errors: Check imports in i18n-related files
- If build fails: Check console output for specific errors

---

## 🚀 Step 6: Start Development Server

Start the application in development mode:

```bash
pnpm dev
```

**Verification**:
Visit these URLs to test both locales:

1. **English (default)**: http://localhost:3000
2. **Greek**: http://localhost:3000/el

Both should load without errors.

---

## 🧪 Step 7: Manual Testing

### Test Language Switcher

1. Navigate to any page (e.g., dashboard)
2. Look for the Globe icon (🌐) in the navigation
3. Click it to open the language menu
4. Select "Ελληνικά" (Greek)
5. **Verify**:
   - URL changes to `/el/...`
   - Page content translates to Greek
   - Language switcher shows checkmark on Greek

### Test Persistence

1. Switch to Greek
2. Navigate to another page
3. Close the browser tab
4. Reopen and login
5. **Verify**: Still displays in Greek

### Test New User

1. Create a new user account
2. Login
3. **Verify**: Defaults to English

---

## 🔍 Step 8: Verify Database

Check that user preferences are being saved:

```bash
npx prisma studio
```

1. Open the `User` table
2. Find your user record
3. **Verify**: `preferredLocale` column shows "el" after switching to Greek

---

## 📊 Step 9: Integration Verification

### Check TypeScript Types

```bash
npx tsc --noEmit
```

**Expected**: No type errors

### Check for Console Errors

1. Open browser DevTools (F12)
2. Navigate through the app
3. **Verify**: No errors in console related to i18n

### Test URL Routing

Test these URL patterns:

| URL | Expected Behavior |
|-----|-------------------|
| `/dashboard` | Loads in English (or user's preference) |
| `/el/dashboard` | Forces Greek |
| `/fr/dashboard` | Redirects to 404 (unsupported locale) |

---

## 🎉 Step 10: Deployment Preparation

### Environment Check

Verify no new environment variables are required:

```bash
# .env should already have these (no new vars needed)
DATABASE_URL=...
NEXTAUTH_SECRET=...
# etc.
```

### Build for Production

```bash
pnpm build
```

**Expected**: Clean build with no errors

### Deploy

Follow your normal deployment process. The i18n system will work automatically.

**For Vercel**:
- Push to git
- Vercel will automatically run `pnpm build` (includes validation)
- Migration may need to be run manually: `npx prisma migrate deploy`

---

## ✅ Success Criteria

You've successfully activated i18n when:

- [x] `pnpm install` completes without errors
- [x] Database migration applied successfully
- [x] `pnpm validate:i18n` passes with 0 errors
- [x] `pnpm build` completes successfully
- [x] Dev server runs without errors
- [x] English site loads: `http://localhost:3000`
- [x] Greek site loads: `http://localhost:3000/el`
- [x] Language switcher appears and works
- [x] Language preference persists across sessions
- [x] No console errors in browser
- [x] TypeScript compilation succeeds

---

## 🆘 Common Issues & Solutions

### Issue: "Cannot find module 'next-intl'"

**Solution**:
```bash
pnpm install
```

### Issue: "Column 'preferredLocale' does not exist"

**Solution**:
```bash
npx prisma migrate deploy
npx prisma generate
```

### Issue: "Translation validation failed"

**Solution**:
```bash
pnpm validate:i18n  # See specific errors
# Fix missing keys in messages/el/*.json
```

### Issue: "LanguageSwitcher component not rendering"

**Cause**: Component needs to be imported into your layout

**Solution**: See integration guide in `I18N_QUICKSTART.md`

### Issue: Build fails with "Module not found: Can't resolve 'next-intl/plugin'"

**Solution**:
```bash
rm -rf node_modules .next
pnpm install
pnpm build
```

### Issue: Translations not loading on certain pages

**Cause**: Translation keys might not match page namespace

**Solution**: Check that translation file name matches the namespace used in `useTranslations('namespace')`

---

## 📞 Getting Help

| Resource | Location |
|----------|----------|
| Quick Start Guide | `I18N_QUICKSTART.md` |
| Full Documentation | `docs/I18N_IMPLEMENTATION.md` |
| Deployment Guide | `I18N_DEPLOYMENT_CHECKLIST.md` |
| Architecture | `I18N_ARCHITECTURE.md` |
| File Manifest | `I18N_FILES_MANIFEST.md` |

---

## 🔄 Rollback Instructions

If you need to temporarily disable i18n:

### Quick Disable (No File Changes)

Comment out the middleware integration:

```typescript
// middleware.ts
export default auth((req) => {
  
  // TEMPORARILY DISABLED - Uncomment to re-enable
  // if (!isPublicFile && !isApiRoute) {
  //   return intlMiddleware(req);
  // }
  
  return NextResponse.next();
});
```

### Full Rollback

```bash
git revert <commit-hash-of-i18n-implementation>
```

---

## 📈 Next Steps

After successful activation:

1. **Add Language Switcher to UI**
   - Import `<LanguageSwitcher />` into your layout
   - See `I18N_QUICKSTART.md` for examples

2. **Start Content Migration**
   - Begin with Phase 1 (Dashboard)
   - Replace hardcoded text with `t('key')`
   - See `docs/I18N_IMPLEMENTATION.md` for migration workflow

3. **Customize Translations**
   - Edit `messages/en/*.json` and `messages/el/*.json`
   - Run `pnpm validate:i18n` after changes

---

**Installation Guide Version**: 1.0  
**Last Updated**: 2025-10-18  
**Status**: Ready for Activation

Good luck! 🚀
