# Oikion Documentation

Complete documentation for the Oikion real estate agency operating system, built on Next.js SaaS Stripe Starter.

> **📖 Documentation Structure**: See [STRUCTURE.md](STRUCTURE.md) for the complete folder organization and conventions.

---

## 📚 Table of Contents

### 🚀 Getting Started
- [Main README](../README.md) - Project overview and quick start
- [License](../LICENSE.md) - MIT License information
- [Environment Setup Guide](getting-started/environment-setup.md) - Complete environment configuration

### 🏗️ Architecture
- **[Backend Architecture](architecture/backend/index.md)**
  - [Database Design](architecture/backend/database.md) - PostgreSQL, Prisma, and schema design
  - [API Routes](architecture/backend/api-routes.md) - API endpoint structure
  - [Server Actions](architecture/backend/server-actions.md) - Server-side actions pattern
  - [Auth & Integrations](architecture/backend/auth-and-integrations.md) - Authentication and third-party services

### ✨ Features
- **Members**
  - [Quick Start: Members](features/members/quickstart-members.md) - Member management guide
- **Personal Workspace**
  - [Personal Workspace Guide](features/personal-workspace.md) - Personal organization functionality
- **Invitations**
  - [Invitation Flow](features/invitations/) - Token-based invitation system (placeholder for future content)

### 📘 Guides
- [Agency Rename Guide](guides/agency-rename-guide.md) - How to white-label and rebrand
- [Skeleton Components](guides/skeleton-components.md) - Using loading skeletons
- [Dev Email Testing](guides/dev-email-testing.md) - Testing email flows in development
- [Resend Dev Mode](guides/resend-dev-mode.md) - Email service configuration

### 🔧 Operations
- **Troubleshooting**
  - [Webpack Fix](operations/troubleshooting/webpack-fix.md) - Solving webpack module loading errors
  - [Role Filtering Fix](operations/troubleshooting/role-filtering-fix.md) - Role dropdown and filtering issues

### 📚 Content Library
- [Content Library Index](content-library/index.mdx) - Contentlayer documentation source
- [Installation Guide](content-library/installation.mdx) - Installation documentation
- **Configuration Guides**
  - [Authentication](content-library/configuration/authentification.mdx)
  - [Blog](content-library/configuration/blog.mdx)
  - [Components](content-library/configuration/components.mdx)
  - [Config Files](content-library/configuration/config-files.mdx)
  - [Database](content-library/configuration/database.mdx)
  - [Email](content-library/configuration/email.mdx)
  - [Layouts](content-library/configuration/layouts.mdx)
  - [Markdown Files](content-library/configuration/markdown-files.mdx)
  - [Subscriptions](content-library/configuration/subscriptions.mdx)

### 👨‍💻 Development
- [Cursor Agent Rules](development/cursor-agent-rules.md) - AI agent development guidelines

### 📋 Implementation Details
Historical implementation notes and migration summaries:
- [Implementation Complete](implementation/IMPLEMENTATION_COMPLETE.md) - Full system implementation overview
- [Organization Invitations](implementation/ORG_INVITATIONS_IMPLEMENTATION.md) - Invitation system details
- [Migration Summary](implementation/MIGRATION_SUMMARY.md) - Database migration documentation
- [RLS & Org Management](implementation/RLS_ORG_MANAGEMENT_COMPLETE.md) - Row-level security implementation
- [Phase 1 RLS Status](implementation/PHASE1_RLS_STATUS.md) - RLS implementation status
- [Phase 1 Summary](implementation/PHASE1_SUMMARY.md) - Phase 1 completion summary
- [Email Setup](implementation/EMAIL_SETUP_COMPLETE.md) - Email integration implementation
- [Security Multi-Tenancy Plan](implementation/SECURITY_MULTI_TENANCY_PLAN.md) - Multi-tenant security architecture
- [Personal Org Protection](implementation/PERSONAL_ORG_PROTECTION.md) - Personal organization safeguards
- [Deleted Org Safety](implementation/DELETED_ORG_SAFETY.md) - Deleted organization handling
- [Speed Security Sprint Summary](implementation/SPEED_SECURITY_SPRINT_SUMMARY.md) - Sprint completion summary
- [Speed Security Sprint README](implementation/SPEED_SECURITY_SPRINT_README.md) - Sprint documentation
- [Speed Security Quick Reference](implementation/SPEED_SECURITY_QUICK_REFERENCE.md) - Quick reference guide
- [Speed Security Implementation Log](implementation/SPEED_SECURITY_IMPLEMENTATION_LOG.md) - Implementation log

### 🗂️ Cleanup
- [Cleanup Execution Guide](cleanup/README.md) - Documentation reorganization details
- [Action Plan Manifest](cleanup/plan.csv) - Complete file action log

---

## 🏗️ System Architecture Overview

### Core Technologies
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon) + Prisma
- **Auth**: Auth.js v5
- **Payments**: Stripe
- **Email**: Resend
- **UI**: Tailwind CSS + shadcn/ui

### Key Features
- **MLS**: Internal property listings management
- **CRM**: Client and activity management
- **Socials**: Organization-wide activity feed
- **Multi-tenancy**: Row-level security with organization isolation
- **RBAC**: Role-based access control (ORG_OWNER, ADMIN, AGENT, VIEWER)
- **Invitations**: Token-based member invitation system

---

## 🚀 Quick Navigation

### For New Developers
1. 📝 Start here: [Environment Setup Guide](getting-started/environment-setup.md)
2. 🏗️ Understand the architecture: [Backend Overview](architecture/backend/index.md)
3. 🔒 Learn about security: [RLS & Org Management](implementation/RLS_ORG_MANAGEMENT_COMPLETE.md)
4. 👥 Explore features: [Members Guide](features/members/quickstart-members.md)

### For Troubleshooting
- 🔨 Build issues? → [Webpack Fix](operations/troubleshooting/webpack-fix.md)
- 👤 Role issues? → [Role Filtering Fix](operations/troubleshooting/role-filtering-fix.md)
- 📧 Email issues? → [Dev Email Testing](guides/dev-email-testing.md)

### For Feature Development
- 🤖 Adding features? → [Cursor Agent Rules](development/cursor-agent-rules.md)
- 🗄️ Database changes? → [Migration Summary](implementation/MIGRATION_SUMMARY.md)
- 🔐 Security concerns? → [Security Multi-Tenancy Plan](implementation/SECURITY_MULTI_TENANCY_PLAN.md)

### For Customization
- 🏢 Rebranding? → [Agency Rename Guide](guides/agency-rename-guide.md)
- 🎨 UI components? → [Skeleton Components](guides/skeleton-components.md)

---

## 📝 Documentation Standards

All documentation follows these principles:
- **Clear headings** with emoji for visual scanning
- **Code examples** with syntax highlighting
- **Step-by-step instructions** for complex processes
- **Troubleshooting sections** for common issues
- **Status indicators**: ✅ Complete, ⏳ In Progress, ⚠️ Known Issues
- **Consistent naming**: lowercase-with-hyphens.md

For detailed documentation conventions, see [STRUCTURE.md](STRUCTURE.md).

---

## 🤝 Contributing

When adding new features or making changes:
1. **Update relevant documentation** in the appropriate category folder
2. **Add troubleshooting sections** for known issues
3. **Include implementation details** and code examples
4. **Update this index** if adding new major documents
5. **Follow naming conventions** outlined in [STRUCTURE.md](STRUCTURE.md)

### Adding New Documentation
- Determine the appropriate category (getting-started, architecture, features, guides, operations)
- Follow the file naming conventions (lowercase-with-hyphens.md)
- Include proper headers with last updated date and status
- Cross-reference related documents
- Update category index if it exists

---

## 📊 Documentation Statistics

- **Architecture docs**: 5 files
- **Feature guides**: 2+ files
- **How-to guides**: 4 files
- **Operations**: 2 troubleshooting guides
- **Implementation notes**: 14 historical documents
- **Content library**: 12 MDX configuration guides

---

**Last Updated**: October 25, 2025 (Documentation restructured)
**Maintainer**: Development Team
**Structure Version**: 2.0
