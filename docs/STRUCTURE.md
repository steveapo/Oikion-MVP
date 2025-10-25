# Documentation Structure Guide

## Overview

This document describes the organization and conventions for the `/docs` directory. All project documentation (except root-level `README.md` and `LICENSE.md`) is consolidated here for easy navigation and maintenance.

## Directory Tree

```
/docs
├── README.md                           # Main documentation index
├── STRUCTURE.md                        # This file - structure conventions
├── cleanup/                            # Cleanup execution artifacts
│   ├── README.md                       # Cleanup execution guide
│   └── plan.csv                        # Complete file action manifest
│
├── getting-started/                    # New user onboarding
│   └── environment-setup.md           # Development environment setup
│
├── architecture/                       # System architecture documentation
│   └── backend/                       # Backend architecture details
│       ├── index.md                   # Backend overview
│       ├── database.md                # Database design & Prisma
│       ├── api-routes.md              # API routes structure
│       ├── server-actions.md          # Server actions pattern
│       └── auth-and-integrations.md   # Auth & third-party integrations
│
├── features/                          # Feature-specific documentation
│   ├── members/                       # Member management
│   │   └── quickstart-members.md     # Members feature quickstart
│   ├── invitations/                   # Invitation system
│   │   └── invitation-flow.md        # Invitation flow documentation
│   └── personal-workspace.md         # Personal workspace feature
│
├── guides/                            # How-to guides and tutorials
│   ├── agency-rename-guide.md        # Guide to white-labeling
│   ├── skeleton-components.md        # Using skeleton components
│   └── dev-email-testing.md          # Email testing in development
│
├── operations/                        # Operations & maintenance
│   └── troubleshooting/              # Troubleshooting guides
│       ├── webpack-fix.md            # Webpack configuration fixes
│       └── role-filtering-fix.md     # Role filtering issues
│
├── content-library/                   # Contentlayer documentation source
│   ├── index.mdx                     # Content library index
│   ├── installation.mdx              # Installation documentation
│   ├── in-progress.mdx               # Work in progress docs
│   └── configuration/                # Configuration documentation
│       ├── authentification.mdx      # Auth configuration
│       ├── blog.mdx                  # Blog configuration
│       ├── components.mdx            # Components configuration
│       ├── config-files.mdx          # Configuration files
│       ├── database.mdx              # Database configuration
│       ├── email.mdx                 # Email configuration
│       ├── layouts.mdx               # Layout configuration
│       ├── markdown-files.mdx        # Markdown file handling
│       └── subscriptions.mdx         # Subscriptions configuration
│
├── development/                       # Developer documentation
│   └── cursor-agent-rules.md         # Cursor AI agent rules
│
└── implementation/                    # Implementation details (existing)
    ├── DELETED_ORG_SAFETY.md
    ├── EMAIL_SETUP_COMPLETE.md
    ├── IMPLEMENTATION_COMPLETE.md
    ├── MIGRATION_SUMMARY.md
    ├── ORG_INVITATIONS_IMPLEMENTATION.md
    ├── PERSONAL_ORG_PROTECTION.md
    ├── PHASE1_RLS_STATUS.md
    ├── PHASE1_SUMMARY.md
    ├── RLS_ORG_MANAGEMENT_COMPLETE.md
    ├── SECURITY_MULTI_TENANCY_PLAN.md
    ├── SPEED_SECURITY_IMPLEMENTATION_LOG.md
    ├── SPEED_SECURITY_QUICK_REFERENCE.md
    ├── SPEED_SECURITY_SPRINT_README.md
    └── SPEED_SECURITY_SPRINT_SUMMARY.md
```

## Category Descriptions

### `/getting-started`
Documentation for new developers setting up the project. Includes environment setup, prerequisites, and initial configuration.

**Audience:** New team members, contributors
**Format:** Step-by-step guides, checklists

### `/architecture`
High-level system architecture, design decisions, and technical specifications. Organized by system layer (backend, frontend, infrastructure).

**Audience:** Architects, senior developers, technical leads
**Format:** Architecture diagrams, design docs, technical specifications

### `/features`
Feature-specific documentation organized by product capability. Each major feature gets its own subdirectory.

**Audience:** All developers, product managers
**Format:** Feature overviews, API references, usage guides

### `/guides`
Task-oriented how-to guides for common operations. More practical and step-by-step than architecture docs.

**Audience:** All developers
**Format:** Step-by-step tutorials, best practices, recipes

### `/operations`
Deployment, monitoring, troubleshooting, and operational runbooks.

**Audience:** DevOps, operations team, support engineers
**Format:** Runbooks, checklists, troubleshooting guides

### `/content-library`
Documentation sourced from Contentlayer MDX files. These may be used for public-facing documentation or marketing site content.

**Audience:** Technical writers, documentation team
**Format:** MDX files (JSX + Markdown)

### `/development`
Developer tooling, coding standards, contribution guidelines, and development workflow documentation.

**Audience:** All developers
**Format:** Guidelines, rules, conventions

### `/implementation`
Historical implementation notes, migration summaries, and sprint completion documents. Preserved for reference.

**Audience:** Project historians, auditors
**Format:** Implementation logs, summaries, status reports

### `/cleanup`
Artifacts from the documentation reorganization effort. Can be archived after successful completion.

**Audience:** Documentation maintainers
**Format:** Execution plans, manifests

## Naming Conventions

### File Naming
- Use lowercase with hyphens: `feature-name-guide.md`
- Be descriptive but concise: `environment-setup.md` not `setup.md`
- Avoid dates in filenames (use git history for versioning)
- Avoid status prefixes like `COMPLETE_`, `WIP_`, `DRAFT_`

### Directory Naming
- Use lowercase with hyphens for multi-word names
- Use singular for category names: `guide/` not `guides/` (exception made for existing structure)
- Keep directory depth reasonable (max 3-4 levels)

### Document Headers
Each documentation file should start with:
```markdown
# Document Title

**Last Updated:** YYYY-MM-DD
**Audience:** [Developers/DevOps/All]
**Status:** [Active/Draft/Deprecated]

Brief description of what this document covers.
```

## Content Guidelines

### What Goes in `/docs`
✅ Architecture documentation
✅ Feature specifications
✅ How-to guides and tutorials
✅ Troubleshooting guides
✅ Development setup instructions
✅ API documentation
✅ Migration guides

### What Stays at Root
✅ `README.md` - Project overview and quick start
✅ `LICENSE.md` - License information
✅ `CHANGELOG.md` - Version history (if exists)
✅ `CONTRIBUTING.md` - Contribution guidelines (if exists)

### What Stays in `/content`
✅ `content/blog/` - Blog posts (Contentlayer source)
✅ `content/guides/` - Public guides (Contentlayer source)
✅ `content/pages/` - Marketing pages (Contentlayer source)

### What Should Be Deleted
❌ Task completion files (`*_COMPLETE.md`, `*_SUMMARY.md`)
❌ Quick test files (`QUICK_TEST_*.md`)
❌ Temporary fix documentation (`*_FIX.md`)
❌ Outdated implementation logs
❌ Duplicate documentation

## Maintenance

### Adding New Documentation
1. Determine the appropriate category (getting-started, architecture, features, etc.)
2. Follow naming conventions
3. Include proper front matter/headers
4. Update category index if it exists
5. Update `/docs/README.md` if adding a new major document

### Updating Documentation
1. Update the "Last Updated" date in the document header
2. Keep git commit messages descriptive
3. If making major changes, consider creating a changelog section in the doc

### Deprecating Documentation
1. Add `**Status:** Deprecated` to the header
2. Add a note pointing to the replacement documentation
3. After 2+ release cycles, move to `/docs/archive/` or delete

### Quarterly Review
Every quarter, review documentation for:
- Accuracy and relevance
- Broken links
- Outdated screenshots/examples
- Documents that should be archived or deleted

## Index Files

Each major category should have an index file (`README.md` or `index.md`) that:
- Lists all documents in the category
- Provides brief descriptions
- Indicates audience and status
- Links to related categories

## References and Links

### Internal Links
Use relative links within docs:
```markdown
See the [database architecture](../architecture/backend/database.md) for details.
```

### External Links
Keep a reference list of external dependencies/resources at the end of documents:
```markdown
## References
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
```

## Diagram Conventions

- Use Mermaid for diagrams when possible (renders in GitHub)
- Store image-based diagrams in `/docs/assets/images/`
- Name diagrams descriptively: `auth-flow-diagram.png`
- Include alt text for accessibility

## Version Control

- Documentation is version-controlled alongside code
- Major documentation updates should be part of feature PRs
- Standalone documentation improvements can be separate PRs
- Use conventional commit messages: `docs: update database architecture`

## Search and Discovery

To improve documentation discoverability:
1. Use clear, searchable headings
2. Include keywords in the first paragraph
3. Cross-reference related documents
4. Maintain the `/docs/README.md` index
5. Use consistent terminology across documents

## Archive Strategy

When documentation becomes obsolete but should be retained for historical purposes:
1. Create `/docs/archive/YYYY/` directory for the year
2. Move outdated docs there
3. Update any links pointing to archived docs
4. Consider adding a redirect or tombstone notice

---

**Last Updated:** 2025-10-25
**Maintained By:** Documentation Team
**Related:** `/docs/cleanup/README.md`, `/docs/README.md`
