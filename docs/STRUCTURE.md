# Documentation Structure

**Last Updated**: October 25, 2025  
**Version**: 2.0

---

## Overview

This document describes the organization and structure of the `/docs` directory, providing a clear information architecture for maintaining internal codebase documentation.

---

## Directory Structure

```
docs/
├── README.md                          # Main documentation index
├── STRUCTURE.md                       # This file - structure documentation
├── QODER_AGENT_RULES.md              # AI agent development guidelines
│
├── .archive/                          # Historical/obsolete documentation
│   └── 2025-10-cleanup/              # Timestamped cleanup batch
│       ├── implementation-logs/       # Completed sprint/phase logs
│       └── migration-records/         # Historical migration documents
│
├── getting-started/                   # Onboarding & quickstart guides
│   ├── quickstart.md                 # Quick setup guide
│   └── environment-setup.md          # Detailed environment configuration
│
├── setup/                             # Configuration & setup guides
│   ├── ENVIRONMENT_SETUP_GUIDE.md    # Complete environment setup
│   ├── DEV_EMAIL_TESTING.md          # Email testing in development
│   ├── QUICKSTART_MEMBERS.md         # Member management quickstart
│   └── RESEND_DEV_MODE.md            # Resend email service config
│
├── backend/                           # Backend architecture documentation
│   ├── index.md                      # Backend overview
│   ├── database.md                   # Database architecture & Prisma
│   ├── api-routes.md                 # API route documentation
│   ├── server-actions.md             # Server actions patterns
│   └── auth-and-integrations.md      # Auth.js & third-party integrations
│
├── features/                          # Feature-specific documentation
│   ├── invitations.md                # Invitation system
│   ├── personal-workspaces.md        # Personal workspace/agency feature
│   ├── organizations.md              # Multi-tenancy & organizations
│   └── skeleton-loading.md           # Loading states & skeleton UI
│
├── guides/                            # How-to guides & procedures
│   ├── agency-rename-guide.md        # Organization → Agency refactoring
│   ├── performance-optimization.md    # Performance tuning guide
│   └── bundle-analysis.md            # Bundle size optimization
│
├── implementation/                    # Implementation details & decisions
│   ├── IMPLEMENTATION_COMPLETE.md    # Full system implementation overview
│   ├── SECURITY_MULTI_TENANCY_PLAN.md # Security architecture
│   ├── RLS_ORG_MANAGEMENT_COMPLETE.md # Row-level security details
│   ├── ORG_INVITATIONS_IMPLEMENTATION.md # Invitation system impl
│   ├── PERSONAL_ORG_PROTECTION.md    # Personal workspace protection
│   ├── DELETED_ORG_SAFETY.md         # Org deletion safeguards
│   ├── EMAIL_SETUP_COMPLETE.md       # Email integration
│   └── MIGRATION_SUMMARY.md          # Database migration docs
│
└── troubleshooting/                   # Issue resolution & debugging
    ├── WEBPACK_FIX.md                # Webpack module loading fixes
    ├── ROLE_FILTERING_FIX.md         # Role dropdown issues
    ├── csrf-signout.md               # CSRF token signout issues
    └── vercel-deployment.md          # Vercel deployment problems
```

---

## Category Descriptions

### 📚 `/getting-started`
Quick onboarding materials for new developers joining the project. Focus on getting up and running in < 30 minutes.

**Contents**: Quickstart guides, basic setup, first-time configuration

### ⚙️ `/setup`
Detailed configuration guides for development environment, services, and tooling.

**Contents**: Environment variables, service configurations, development mode setup

### 🏗️ `/backend`
Architecture documentation for backend systems, database design, API patterns, and server-side logic.

**Contents**: Database schemas, API routes, server actions, authentication flows

### ✨ `/features`
Feature-specific documentation describing how major product features work internally.

**Contents**: Feature implementation details, data flows, user stories

### 📖 `/guides`
Step-by-step how-to guides for common development tasks, refactoring procedures, and optimization strategies.

**Contents**: Procedures, checklists, optimization guides, refactoring instructions

### 🔧 `/implementation`
Technical implementation documentation, architectural decisions, and system design details.

**Contents**: Implementation logs, security architecture, migration records, technical decisions

### 🐛 `/troubleshooting`
Solutions to known issues, common problems, debugging guides, and error resolution.

**Contents**: Bug fixes, workarounds, error solutions, debugging procedures

### 📦 `.archive/`
Historical documentation that's no longer actively referenced but preserved for context. Organized by cleanup date.

**Contents**: Completed implementation logs, obsolete guides, superseded documentation

---

## Naming Conventions

### File Naming Patterns

- **Guides**: `kebab-case.md` (e.g., `agency-rename-guide.md`)
- **Technical Docs**: `SCREAMING_SNAKE_CASE.md` (e.g., `ENVIRONMENT_SETUP_GUIDE.md`)
- **Feature Docs**: `kebab-case.md` (e.g., `personal-workspaces.md`)
- **Troubleshooting**: `kebab-case.md` or `ISSUE_FIX.md` format

### Folder Naming

- Use `kebab-case` for all folder names
- Keep folder names concise (1-2 words preferred)
- Use plural forms for content categories (`features/`, `guides/`)

---

## Document Front Matter

While not currently enforced, consider adding YAML front matter for better organization:

```yaml
---
title: Feature Name
category: features
status: active | deprecated | archived
last_updated: 2025-10-25
tags: [tag1, tag2, tag3]
---
```

### Recommended Tags

- **Status**: `active`, `in-progress`, `deprecated`, `archived`, `complete`
- **Category**: `setup`, `backend`, `frontend`, `feature`, `troubleshooting`, `guide`
- **Audience**: `developer`, `architect`, `devops`, `all`
- **Priority**: `critical`, `important`, `reference`, `nice-to-know`

---

## Maintenance Guidelines

### Adding New Documentation

1. **Determine category** based on content type (see Category Descriptions)
2. **Follow naming conventions** for consistency
3. **Update `/docs/README.md`** to add new doc to index
4. **Add cross-references** to related documentation
5. **Include status/date** in document header

### Archiving Documentation

When documentation becomes obsolete:

1. **Move to `.archive/[YYYY-MM-cleanup]/`** subdirectory
2. **Add archival note** at top of document explaining why
3. **Remove from main README.md** index
4. **Update cross-references** in other docs

### Deprecating vs Archiving

- **Deprecate**: Mark as deprecated but keep in place (still somewhat relevant)
- **Archive**: Move to `.archive/` (no longer relevant, historical reference only)

---

## Content Exclusions

The following are **NOT** considered internal documentation:

- `/content/` - Public-facing marketing content (blog, guides, legal pages)
- `/public/_static/docs/` - Documentation page assets (images for public docs)
- Code comments - Not tracked here; use JSDoc/TSDoc in code
- API documentation - Auto-generated from code (if applicable)

---

## Quick Reference

### I need to...

- **Set up my environment** → `/setup/ENVIRONMENT_SETUP_GUIDE.md`
- **Understand the backend** → `/backend/index.md`
- **Fix a specific issue** → `/troubleshooting/`
- **Learn about a feature** → `/features/`
- **Follow a procedure** → `/guides/`
- **Understand a past decision** → `/implementation/`
- **Get started quickly** → `/getting-started/quickstart.md`

---

## Related Files

- **Main Index**: `/docs/README.md`
- **AI Agent Rules**: `/docs/QODER_AGENT_RULES.md`
- **Root README**: `/README.md` (project overview)
- **License**: `/LICENSE.md`

---

**Maintained by**: Development Team  
**Questions?**: See `/docs/README.md` for contact information

