# i18n Deployment Checklist

## Pre-Deployment Steps

### 1. Package Installation ✅
```bash
cd /path/to/Oikion-MVP
pnpm install
```

**Verify**: Check that `next-intl` appears in `node_modules/`

---

### 2. Database Migration ⚠️ REQUIRED
```bash
npx prisma migrate deploy
```

**OR** for development:
```bash
npx prisma migrate dev
```

**This adds the `preferredLocale` column to the `users` table.**

**Verify**:
```bash
npx prisma studio
# Open Users table and verify 'preferredLocale' column exists
```

---

### 3. Generate Prisma Client
```bash
npx prisma generate
```

**Verify**: No errors in console

---

### 4. Validate Translations
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

**If errors appear**: Fix missing translations before proceeding

---

### 5. Test Build
```bash
pnpm build
```

**Expected**: Build completes successfully (validation runs automatically)

**If build fails**:
1. Check validation output for missing translations
2. Verify all configuration files are present
3. Check console for TypeScript errors

---

## Deployment to Vercel

### Environment Variables

No new environment variables are required for i18n!

The existing `DATABASE_URL` and other vars are sufficient.

---

### Build Command

The build command in `package.json` already includes validation:
```json
"build": "pnpm validate:i18n && pnpm contentlayer:fix && next build"
```

**Vercel will automatically**:
1. Run translation validation
2. Build Next.js application
3. Deploy if successful

---

### Database Migration on Vercel

**Option 1**: Run migration manually after deployment
```bash
vercel env pull .env.production
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

**Option 2**: Add to build script (if using Vercel Postgres)
```json
"vercel-build": "prisma migrate deploy && pnpm build"
```

---

## Post-Deployment Verification

### 1. Check URLs Work
- ✅ English (default): `https://your-app.vercel.app/dashboard`
- ✅ Greek: `https://your-app.vercel.app/el/dashboard`

### 2. Test Language Switcher
1. Navigate to any page
2. Click language switcher (Globe icon)
3. Select Greek
4. Verify:
   - URL changes to `/el/...`
   - Content translates
   - Page reloads correctly

### 3. Test User Preference Persistence
1. Switch to Greek
2. Navigate to another page
3. Close browser
4. Reopen and login
5. Verify: Still in Greek

### 4. Test New User Default
1. Invite a new user
2. User accepts and logs in
3. Verify: Defaults to English

---

## Rollback Plan

If issues arise after deployment:

### Quick Rollback (Revert Deployment)
```bash
# Via Vercel dashboard
# Go to Deployments → Select previous deployment → Promote to Production
```

### Partial Rollback (Disable i18n Middleware)

**Temporarily disable i18n** while keeping other changes:

```tsx
// middleware.ts - Comment out i18n integration
export default auth((req) => {
  
  // TEMPORARILY DISABLED
  // if (!isPublicFile && !isApiRoute) {
  //   return intlMiddleware(req);
  // }
  
  return NextResponse.next();
});
```

Then redeploy.

---

## Monitoring

### Key Metrics to Watch

1. **Build Success Rate**
   - Check Vercel build logs for validation errors

2. **Database Queries**
   - Monitor for issues with `preferredLocale` column

3. **User Feedback**
   - Watch for reports of mixed languages or translation issues

4. **Error Tracking**
   - Check Sentry/error logs for i18n-related errors

---

## Common Issues & Solutions

### Issue: Build fails with "Missing translation keys"

**Solution**:
```bash
pnpm validate:i18n  # Locally identify missing keys
# Add missing translations to Greek files
git commit && git push
```

---

### Issue: Database migration fails

**Error**: `Column 'preferredLocale' already exists`

**Solution**:
```bash
# Reset migration state
npx prisma migrate resolve --applied 20251018_add_preferred_locale
```

---

### Issue: Language switcher not visible

**Check**:
1. Component imported correctly
2. Used in a Client Component (with `"use client"`)
3. UI components from shadcn installed

---

### Issue: Translations not loading

**Check**:
1. Translation files exist in `messages/en/` and `messages/el/`
2. i18n.ts imports all translation files
3. No JSON syntax errors in translation files

---

## Testing Checklist

### Manual Tests

- [ ] English homepage loads
- [ ] Greek homepage loads (`/el`)
- [ ] Language switcher appears
- [ ] Switching to Greek updates URL
- [ ] Content translates correctly
- [ ] User preference persists across sessions
- [ ] New users default to English
- [ ] All critical pages accessible in both languages:
  - [ ] Dashboard
  - [ ] Properties
  - [ ] Relations
  - [ ] Oikosync
  - [ ] Members
  - [ ] Billing
  - [ ] Settings
- [ ] Date formatting respects locale
- [ ] Currency formatting respects locale
- [ ] Form validation messages translate
- [ ] Error pages translate (404, 500)

### Automated Tests

- [ ] `pnpm validate:i18n` passes
- [ ] `pnpm build` succeeds
- [ ] TypeScript compilation has no errors
- [ ] All existing tests still pass

---

## Success Criteria

✅ **Ready for Production** when:

1. All translation files validated ✅
2. Database migration applied ✅
3. Build completes successfully ✅
4. Manual testing checklist complete ✅
5. No console errors in browser ✅
6. Language switching works smoothly ✅
7. User preferences persist correctly ✅

---

## Contact & Support

**Documentation**:
- Full Guide: `docs/I18N_IMPLEMENTATION.md`
- Quick Start: `I18N_QUICKSTART.md`
- Setup Summary: `I18N_SETUP_SUMMARY.md`

**Scripts**:
- Validation: `pnpm validate:i18n`
- Build: `pnpm build`

**Files to Monitor**:
- Translation files: `messages/en/*.json`, `messages/el/*.json`
- Configuration: `i18n.ts`, `next.config.js`, `middleware.ts`
- Migration: `prisma/migrations/20251018_add_preferred_locale/`

---

**Last Updated**: 2025-10-18  
**Version**: 1.0.0  
**Status**: Phase 0 Complete - Ready for Content Migration
