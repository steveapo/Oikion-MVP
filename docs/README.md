# Oikion Documentation

Complete documentation for the Oikion real estate agency operating system, built on Next.js SaaS Stripe Starter.

---

## 📚 Table of Contents

### 📖 Documentation Structure
- **[STRUCTURE.md](STRUCTURE.md)** - Complete documentation organization reference

### 🚀 Getting Started
- [Main README](../README.md) - Project overview and quick start
- [License](../LICENSE.md) - MIT License information

### ⚙️ Setup & Configuration
- **[Environment Setup Guide](setup/ENVIRONMENT_SETUP_GUIDE.md)** - Complete environment configuration
- **[Quick Start: Members](setup/QUICKSTART_MEMBERS.md)** - Quick guide to member management
- **[Dev Email Testing](setup/DEV_EMAIL_TESTING.md)** - Testing email flows in development
- **[Resend Dev Mode](setup/RESEND_DEV_MODE.md)** - Email service configuration

### 🏗️ Backend Architecture
- **[Backend Overview](backend/index.md)**
  - [Database](backend/database.md)
  - [API Routes](backend/api-routes.md)
  - [Server Actions](backend/server-actions.md)
  - [Auth and Integrations](backend/auth-and-integrations.md)

### ✨ Features
- **[Invitation System](features/invitations.md)** - How invitations work
- **[Personal Workspaces](features/personal-workspaces.md)** - Personal workspace feature
- **[Personal Workspaces Reference](features/personal-workspaces-reference.md)** - Quick reference
- **[Skeleton Loading](features/skeleton-loading.md)** - Loading states and skeleton components
- **[SEO Implementation](features/seo-implementation.md)** - SEO features

### 📖 Guides
- **[Agency Rename Guide](guides/agency-rename-guide.md)** - Organization → Agency refactoring procedure
- **[Performance Optimization](guides/performance-optimization.md)** - Performance tuning guide
- **[Bundle Analysis](guides/bundle-analysis.md)** - Bundle size optimization
- **[Optimized Imports](guides/optimized-imports.md)** - Import optimization patterns
- **[Quick Performance Test](guides/quick-test-performance.md)** - Quick performance testing
- **[SEO Testing](guides/seo-testing.md)** - SEO testing guide

### 🔧 Implementation Details
- **[Implementation Complete](implementation/IMPLEMENTATION_COMPLETE.md)** - Full system implementation overview
- **[Organization Invitations](implementation/ORG_INVITATIONS_IMPLEMENTATION.md)** - Invitation system implementation
- **[Migration Summary](implementation/MIGRATION_SUMMARY.md)** - Database migration documentation
- **[RLS & Org Management](implementation/RLS_ORG_MANAGEMENT_COMPLETE.md)** - Row-level security implementation
- **[Email Setup](implementation/EMAIL_SETUP_COMPLETE.md)** - Email integration implementation
- **[Security Multi-Tenancy Plan](implementation/SECURITY_MULTI_TENANCY_PLAN.md)** - Multi-tenant security architecture
- **[Personal Org Protection](implementation/PERSONAL_ORG_PROTECTION.md)** - Personal workspace protection
- **[Deleted Org Safety](implementation/DELETED_ORG_SAFETY.md)** - Organization deletion safeguards

### 🐛 Troubleshooting
- **[Webpack Fix](troubleshooting/WEBPACK_FIX.md)** - Webpack module loading errors
- **[Role Filtering Fix](troubleshooting/ROLE_FILTERING_FIX.md)** - Role dropdown and filtering issues
- **[CSRF Signout](troubleshooting/csrf-signout.md)** - CSRF token signout issues
- **[Auth Signout CSRF Fix](troubleshooting/auth-signout-csrf-fix.md)** - Auth signout CSRF resolution
- **[Vercel Deployment](troubleshooting/vercel-deployment.md)** - Vercel deployment problems
- **[Testing Org Reload](troubleshooting/testing-org-reload-fix.md)** - Organization reload issues
- **[Invitation Link Fix](troubleshooting/invitation-link-fix.md)** - Invitation link problems
- **[Duplicate Workspace Fix](troubleshooting/duplicate-workspace-fix.md)** - Duplicate workspace issues
- **[Decimal Serialization Fix](troubleshooting/decimal-serialization-fix.md)** - Decimal serialization issues

### 🤖 Development
- **[Qoder Agent Rules](QODER_AGENT_RULES.md)** - AI agent development guidelines

---

## 🏗️ Architecture Overview

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

## 🚀 Quick Links

### For Developers
1. Start here: [Environment Setup Guide](setup/ENVIRONMENT_SETUP_GUIDE.md)
2. Understand the architecture: [Implementation Complete](implementation/IMPLEMENTATION_COMPLETE.md)
3. Learn about security: [RLS & Org Management](implementation/RLS_ORG_MANAGEMENT_COMPLETE.md)
4. Understand the structure: [Documentation Structure](STRUCTURE.md)

### For Troubleshooting
- Build issues? → [Webpack Fix](troubleshooting/WEBPACK_FIX.md)
- Role issues? → [Role Filtering Fix](troubleshooting/ROLE_FILTERING_FIX.md)
- Email issues? → [Dev Email Testing](setup/DEV_EMAIL_TESTING.md)
- Deployment issues? → [Vercel Deployment](troubleshooting/vercel-deployment.md)
- Invitation issues? → [Invitation Link Fix](troubleshooting/invitation-link-fix.md)

### For Feature Development
- Adding features? → [Qoder Agent Rules](QODER_AGENT_RULES.md)
- Database changes? → [Migration Summary](implementation/MIGRATION_SUMMARY.md)
- Security concerns? → [Security Multi-Tenancy Plan](implementation/SECURITY_MULTI_TENANCY_PLAN.md)

### For Optimization
- Performance tuning? → [Performance Optimization](guides/performance-optimization.md)
- Bundle size? → [Bundle Analysis](guides/bundle-analysis.md)
- Import optimization? → [Optimized Imports](guides/optimized-imports.md)

---

## 📝 Documentation Standards

All documentation follows these principles:
- **Clear headings** with emoji for visual scanning
- **Code examples** with syntax highlighting
- **Step-by-step instructions** for complex processes
- **Troubleshooting sections** for common issues
- **Status indicators**: ✅ Complete, ⏳ In Progress, ⚠️ Known Issues

---

## 🤝 Contributing

When adding new features or making changes:
1. Update relevant documentation in this structure
2. Add troubleshooting sections for known issues
3. Include implementation details and examples
4. Update this index if adding new docs

---

**Last Updated**: October 25, 2025
