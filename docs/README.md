# Oikion Documentation

Complete documentation for the Oikion real estate agency operating system, built on Next.js SaaS Stripe Starter.

---

## 📚 Table of Contents

### Getting Started
- [Main README](../README.md) - Project overview and quick start
- [License](../LICENSE.md) - MIT License information

### Setup & Configuration
- **[Environment Setup Guide](setup/ENVIRONMENT_SETUP_GUIDE.md)** - Complete environment configuration
- **[Quick Start: Members](setup/QUICKSTART_MEMBERS.md)** - Quick guide to member management
- **[Dev Email Testing](setup/DEV_EMAIL_TESTING.md)** - Testing email flows in development
- **[Resend Dev Mode](setup/RESEND_DEV_MODE.md)** - Email service configuration

### Implementation Details
- **[Implementation Complete](implementation/IMPLEMENTATION_COMPLETE.md)** - Full system implementation overview
- **[Organization Invitations](implementation/ORG_INVITATIONS_IMPLEMENTATION.md)** - Invitation system details
- **[Migration Summary](implementation/MIGRATION_SUMMARY.md)** - Database migration documentation
- **[RLS & Org Management](implementation/RLS_ORG_MANAGEMENT_COMPLETE.md)** - Row-level security implementation
- **[Phase 1 RLS Status](implementation/PHASE1_RLS_STATUS.md)** - RLS implementation status
- **[Phase 1 Summary](implementation/PHASE1_SUMMARY.md)** - Phase 1 completion summary
- **[Email Setup](implementation/EMAIL_SETUP_COMPLETE.md)** - Email integration implementation
- **[Security Multi-Tenancy Plan](implementation/SECURITY_MULTI_TENANCY_PLAN.md)** - Multi-tenant security architecture

### Troubleshooting
- **[Webpack Fix](troubleshooting/WEBPACK_FIX.md)** - Solving webpack module loading errors
- **[Role Filtering Fix](troubleshooting/ROLE_FILTERING_FIX.md)** - Role dropdown and filtering issues

### Development
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

### For Troubleshooting
- Build issues? → [Webpack Fix](troubleshooting/WEBPACK_FIX.md)
- Role issues? → [Role Filtering Fix](troubleshooting/ROLE_FILTERING_FIX.md)
- Email issues? → [Dev Email Testing](setup/DEV_EMAIL_TESTING.md)

### For Feature Development
- Adding features? → [Qoder Agent Rules](QODER_AGENT_RULES.md)
- Database changes? → [Migration Summary](implementation/MIGRATION_SUMMARY.md)
- Security concerns? → [Security Multi-Tenancy Plan](implementation/SECURITY_MULTI_TENANCY_PLAN.md)

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

**Last Updated**: October 16, 2025
