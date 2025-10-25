# Documentation Cleanup Execution Guide

## Overview

This cleanup consolidates 96+ scattered `.md` files across the repository root into a maintainable `/docs` folder structure. The execution follows a phased approach to ensure safety and minimize disruption.

## Execution Phases

### Phase 1: Generate Plan Artifacts ✓
- Generated `plan.csv` with complete file action manifest
- Created this execution guide
- Created `STRUCTURE.md` with new documentation architecture

### Phase 2: Delete i18n Documentation
**Files to delete:** 41 files
- All files matching `I18N_*`, `LOCALE_*`, `SEO_*`
- Translation implementation documents
- i18n-related fix and summary files

**Command reference:**
```bash
# Delete root-level i18n files
rm I18N_*.md LOCALE_*.md SEO_*.md
rm *TRANSLATIONS*.md *_TRANSLATION_*.md
rm BLAZING_FAST_LOCALE_SWITCH.md

# Delete docs i18n files
rm docs/I18N_IMPLEMENTATION.md
```

### Phase 3: Delete Task Completion Files
**Files to delete:** 18 files
- Files ending in `_FIX.md`, `_SUMMARY.md`, `_UPDATE.md`, `_IMPLEMENTATION.md`
- Quick test and verification files
- Task completion status files

**Command reference:**
```bash
# Delete root-level completion files
rm *_FIX.md *_SUMMARY.md *_UPDATE.md
rm *_IMPLEMENTATION.md TESTING_*.md QUICK_TEST_*.md
rm test-invitation-flow.md

# Delete docs completion files
rm docs/AUTH_SIGNOUT_CSRF_FIX.md
```

### Phase 4: Create New Directory Structure
**Directories to create:**
```
docs/
├── getting-started/
├── architecture/
│   └── backend/
├── features/
│   ├── members/
│   ├── invitations/
│   └── (files at root)
├── guides/
├── operations/
│   ├── deployment/
│   └── troubleshooting/
├── content-library/
│   └── configuration/
└── development/
```

### Phase 5: Move Backend Documentation
**Source:** `docs/backend/*`
**Destination:** `docs/architecture/backend/*`

Files:
- `index.md` → Backend overview
- `database.md` → Database architecture
- `api-routes.md` → API routes structure
- `server-actions.md` → Server actions pattern
- `auth-and-integrations.md` → Auth & integrations

### Phase 6: Move Content Library
**Source:** `content/docs/**/*.mdx`
**Destination:** `docs/content-library/**/*.mdx`

Files:
- 3 root files (`index.mdx`, `installation.mdx`, `in-progress.mdx`)
- 9 configuration files in `configuration/` subdirectory

### Phase 7: Move Root Documentation
**Root-level guides to appropriate subdirectories:**
- `AGENCY_RENAME_GUIDE.md` → `docs/guides/agency-rename-guide.md`
- `SKELETON_COMPONENTS_GUIDE.md` → `docs/guides/skeleton-components.md`
- `test-invitation-flow.md` → `docs/features/invitations/invitation-flow.md`

**Existing docs reorganization:**
- `docs/PERSONAL_ORG_QUICK_REF.md` → `docs/features/personal-workspace.md`
- `docs/setup/QUICKSTART_MEMBERS.md` → `docs/features/members/quickstart-members.md`
- `docs/setup/DEV_EMAIL_TESTING.md` → `docs/guides/dev-email-testing.md`
- `docs/setup/ENVIRONMENT_SETUP_GUIDE.md` → `docs/getting-started/environment-setup.md`
- `docs/troubleshooting/WEBPACK_FIX.md` → `docs/operations/troubleshooting/webpack-fix.md`
- `docs/troubleshooting/ROLE_FILTERING_FIX.md` → `docs/operations/troubleshooting/role-filtering-fix.md`
- `docs/QODER_AGENT_RULES.md` → `docs/development/cursor-agent-rules.md`

### Phase 8: Update Documentation Indexes
- Update `docs/README.md` with new structure navigation
- Create category index files where appropriate
- Document folder conventions

### Phase 9: Verification
- Check for broken links in key documentation files
- Verify all moves completed successfully
- Remove empty directories

## Safety Measures

1. **No hard deletions** of files that might be imported or referenced in code
2. **CSV manifest** provides complete audit trail
3. **Phased execution** allows for verification at each step
4. **Preserved files:**
   - `README.md` (root)
   - `LICENSE.md` (root)
   - `content/blog/**` (Contentlayer source)
   - `content/guides/**` (Contentlayer source)
   - `content/pages/**` (Contentlayer source)

## Rollback Strategy

If issues are discovered:
1. Use the `plan.csv` as reference for what was moved/deleted
2. Git can restore deleted files: `git checkout <file>`
3. Moves can be reversed using the CSV source/destination mapping

## Post-Cleanup Actions

1. Update any CI/CD scripts that reference old documentation paths
2. Update README badges/links if they point to moved docs
3. Communicate new documentation structure to team
4. Archive the `docs/cleanup/` folder after successful completion

## Statistics

- **Total files processed:** ~96 markdown files
- **Files deleted:** 59 (41 i18n + 18 task completion)
- **Files moved:** 27
- **Files kept at root:** 2 (README.md, LICENSE.md)
- **New directories created:** 11
- **Preserved Contentlayer sources:** 3 directories

## Completion Checklist

- [ ] Phase 1: Plan artifacts generated
- [ ] Phase 2: i18n documentation deleted
- [ ] Phase 3: Task completion files deleted
- [ ] Phase 4: New directory structure created
- [ ] Phase 5: Backend docs moved
- [ ] Phase 6: Content library moved
- [ ] Phase 7: Root docs reorganized
- [ ] Phase 8: Indexes updated
- [ ] Phase 9: Verification complete

---

**Execution Date:** 2025-10-25
**Executed By:** AI Assistant (Claude Sonnet 4.5)
**Plan Document:** `/documentation-cleanup-plan.plan.md`
