# Organization → Agency Rename Guide

**Status**: ⚠️ **PARTIALLY COMPLETE** - Database migrated, code needs comprehensive updates  
**Date**: October 16, 2025

---

## ⚠️ Important Notice

This is a **MAJOR REFACTORING** that affects **100+ files** across the entire codebase. The database migration has been completed, but the codebase still references the old "organization" naming.

---

## ✅ Completed Steps

### 1. Database Migration
- ✅ Prisma schema updated (`Organization` → `Agency`)
- ✅ Migration SQL created and applied
- ✅ Database tables renamed:
  - `organizations` → `agencies`
  - `organizationId` → `agencyId` (all tables)
  - `OrganizationPlan` → `AgencyPlan`
- ✅ All foreign keys and indexes renamed
- ✅ Prisma client regenerated

### 2. Server Actions
- ✅ File renamed: `organizations.ts` → `agencies.ts`
- ✅ Functions renamed:
  - `getCurrentOrganization()` → `getCurrentAgency()`
  - `getUserOrganizations()` → `getUserAgencies()`
  - `createOrganization()` → `createAgency()`
  - `updateOrganization()` → `updateAgency()`
  - `switchOrganization()` → `switchAgency()`
  - `deleteOrganization()` → `deleteAgency()`

---

## 🔄 Remaining Updates Needed

###  1. TypeScript Type Definitions
- [ ] Update [`types/index.d.ts`](./types/index.d.ts)
- [ ] Update [`types/next-auth.d.ts`](./types/next-auth.d.ts)
  - Change `organizationId` → `agencyId`
  - Change `organizationName` → `agencyName`

### 2. Auth System
- [ ] [`auth.ts`](./auth.ts) - Update session callbacks
- [ ] [`auth.config.ts`](./auth.config.ts) - Update any organization references
- [ ] [`middleware.ts`](./middleware.ts) - Update any organization checks

### 3. Server Actions (Import Updates)
- [ ] [`actions/properties.ts`](./actions/properties.ts)
- [ ] [`actions/clients.ts`](./actions/clients.ts)
- [ ] [`actions/activities.ts`](./actions/activities.ts)
- [ ] [`actions/interactions.ts`](./actions/interactions.ts)
- [ ] [`actions/invitations.ts`](./actions/invitations.ts)
- [ ] [`actions/members.ts`](./actions/members.ts)
- [ ] All other action files

### 4. API Routes
- [ ] [`app/api/organization/route.ts`](./app/api/organization/route.ts) → rename to `agency/route.ts`
- [ ] [`app/api/user/route.ts`](./app/api/user/route.ts) - Update organization references
- [ ] All other API routes

### 5. UI Components
- [ ] [`components/dashboard/project-switcher.tsx`](./components/dashboard/project-switcher.tsx)
- [ ] [`components/dashboard/delete-organization.tsx`](./components/dashboard/delete-organization.tsx) → rename to `delete-agency.tsx`
- [ ] [`components/forms/organization-settings-form.tsx`](./components/forms/organization-settings-form.tsx) → rename to `agency-settings-form.tsx`
- [ ] [`components/modals/delete-organization-modal.tsx`](./components/modals/delete-organization-modal.tsx) → rename to `delete-agency-modal.tsx`
- [ ] All other components

### 6. Pages
- [ ] [`app/(protected)/dashboard/settings/page.tsx`](./app/(protected)/dashboard/settings/page.tsx)
- [ ] [`app/(protected)/dashboard/members/page.tsx`](./app/(protected)/dashboard/members/page.tsx)
- [ ] All other pages

### 7. Utility Files
- [ ] [`lib/org-prisma.ts`](./lib/org-prisma.ts) - Rename to `agency-prisma.ts`, update `prismaForOrg` → `prismaForAgency`
- [ ] [`lib/session.ts`](./lib/session.ts)
- [ ] [`lib/user.ts`](./lib/user.ts)

### 8. Configuration
- [ ] [`config/dashboard.ts`](./config/dashboard.ts)
- [ ] [`config/site.ts`](./config/site.ts)

### 9. Scripts
- [ ] [`scripts/ensure-personal-orgs.ts`](./scripts/ensure-personal-orgs.ts) → rename to `ensure-personal-agencies.ts`
- [ ] [`scripts/verify-personal-org-protection.ts`](./scripts/verify-personal-org-protection.ts) → rename to `verify-personal-agency-protection.ts`
- [ ] All other scripts

### 10. Documentation
- [ ] [`docs/implementation/PERSONAL_ORG_PROTECTION.md`](./docs/implementation/PERSONAL_ORG_PROTECTION.md)
- [ ] [`docs/implementation/ORG_INVITATIONS_IMPLEMENTATION.md`](./docs/implementation/ORG_INVITATIONS_IMPLEMENTATION.md)
- [ ] [`docs/implementation/RLS_ORG_MANAGEMENT_COMPLETE.md`](./docs/implementation/RLS_ORG_MANAGEMENT_COMPLETE.md)
- [ ] [`PERSONAL_ORG_SUMMARY.md`](./PERSONAL_ORG_SUMMARY.md)
- [ ] All other documentation files

---

## 📋 Systematic Replacement Checklist

For each file, replace the following (in order):

### Step 1: Function/Variable Names (PascalCase/camelCase)
```typescript
// Function names
getCurrentOrganization → getCurrentAgency
getUserOrganizations → getUserAgencies
createOrganization → createAgency
updateOrganization → updateAgency
switchOrganization → switchAgency
deleteOrganization → deleteAgency

// Variables
organizationId → agencyId
organizationName → agencyName
currentOrganization → currentAgency
organization → agency (when variable name)
```

### Step 2: Types & Interfaces
```typescript
Organization → Agency
OrganizationType → AgencyType
OrganizationPlan → AgencyPlan
OrganizationSettingsFormProps → AgencySettingsFormProps
```

### Step 3: Prisma Model References
```typescript
prisma.organization → prisma.agency
```

### Step 4: User Strings & Messages
```
"organization" → "agency"
"Organization" → "Agency"
"organizations" → "agencies"
"Organizations" → "Agencies"
```

### Step 5: File & Directory Names
```
organization/ → agency/
organizations.ts → agencies.ts
organization-settings-form.tsx → agency-settings-form.tsx
delete-organization.tsx → delete-agency.tsx
```

---

## 🚨 Critical Areas to Update First

1. **auth.ts** - Session must use `agencyId` instead of `organizationId`
2. **types/next-auth.d.ts** - Type definitions for session
3. **lib/org-prisma.ts** - Core Prisma wrapper (rename to `agency-prisma.ts`)
4. **All server actions** - Import from `./agencies` instead of `./organizations`
5. **API routes** - Update endpoints

---

## ⚡ Quick Find & Replace Patterns

You can use these regex patterns for bulk find/replace in your IDE:

### Pattern 1: Variable Names
```
Find: \borganizationId\b
Replace: agencyId

Find: \borganizationName\b
Replace: agencyName
```

### Pattern 2: Function Names
```
Find: getCurrentOrganization
Replace: getCurrentAgency

Find: getUserOrganizations
Replace: getUserAgencies
```

### Pattern 3: Prisma Queries
```
Find: prisma\.organization
Replace: prisma.agency
```

### Pattern 4: Types
```
Find: \bOrganization(?!al)\b
Replace: Agency

Find: OrganizationPlan
Replace: AgencyPlan
```

---

## 🧪 Testing After Updates

After completing all updates, run these tests:

### 1. TypeScript Compilation
```bash
pnpm build
# Should complete without errors
```

### 2. Database Verification
```bash
npx tsx scripts/check-database.ts
# Verify all agencies are accessible
```

### 3. Manual Testing
- [ ] Sign in
- [ ] View agency switcher
- [ ] Switch between agencies
- [ ] Create new agency
- [ ] Update agency settings
- [ ] View members page
- [ ] Delete account (verify personal agency preserved)

---

## 📊 Estimated Impact

| Category | Files Affected |
|----------|---------------|
| Prisma Schema | 1 (✅ Done) |
| Database Migration | 1 (✅ Done) |
| Server Actions | ~15 files |
| API Routes | ~5 files |
| Components | ~30 files |
| Pages | ~10 files |
| Utilities | ~5 files |
| Types | ~2 files |
| Documentation | ~10 files |
| **Total** | **~80-100 files** |

---

## ⚠️ Risks & Considerations

1. **Breaking Change**: This is a major breaking change
2. **Session Invalidation**: All active user sessions will likely need to be refreshed
3. **Type Safety**: Must ensure all TypeScript types are updated
4. **Testing Required**: Comprehensive testing needed before deployment

---

## 🔧 Recommended Approach

Given the scale of this refactoring, I recommend:

1. **Complete in Development First**: Don't push to production until fully tested
2. **Use IDE's Refactoring Tools**: Use VSCode/Qoder's "Rename Symbol" feature
3. **Update Incrementally**: Update one category at a time (e.g., all server actions, then all components)
4. **Test Frequently**: Run `pnpm build` after each category
5. **Git Commits**: Commit after each successful category update

---

## 📝 Current State

**Database**: ✅ Fully migrated to "Agency"  
**Codebase**: ⚠️ Still references "Organization"  
**Status**: **INCOMPLETE** - Code updates required

---

## Next Steps

1. Update `types/next-auth.d.ts` first
2. Update `auth.ts` and `auth.config.ts`
3. Update `lib/org-prisma.ts` (rename to `agency-prisma.ts`)
4. Update all server actions systematically
5. Update UI components
6. Update API routes
7. Run full test suite
8. Update documentation

---

**Would you like me to continue with the systematic updates, or would you prefer to handle this refactoring yourself using IDE tools?**
