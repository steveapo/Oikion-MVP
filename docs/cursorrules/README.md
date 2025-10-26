# Cursor Rules - Oikion Project

This directory contains comprehensive project rules and conventions for the Oikion real estate agency operating system. These files guide Cursor AI to understand our codebase structure, patterns, and best practices.

## Purpose

These cursor rules files provide:
- Project-specific conventions and patterns
- Technology stack best practices
- Naming conventions and file organization
- Security and performance guidelines
- Multi-tenancy architecture patterns
- Complete understanding of our development standards

## Files Overview

### 00-overview.md
**Project Overview & Core Principles**
- Technology stack summary
- Architecture principles
- File organization philosophy
- Code quality standards
- Development workflow
- Key constraints and considerations

Start here to understand the big picture.

### 01-typescript-conventions.md
**TypeScript Conventions & Patterns**
- TypeScript configuration
- Naming conventions (files, types, variables)
- Type definitions and patterns
- Prisma-generated types usage
- Zod schema patterns
- Server action types
- React component types
- Best practices and common pitfalls

### 02-nextjs-patterns.md
**Next.js App Router Patterns & Conventions**
- App Router architecture
- Server vs Client Components
- Server Actions
- Layouts and templates
- Loading and streaming
- Error handling
- Metadata and SEO
- Caching strategies
- Route handlers
- Performance optimization

### 03-prisma-database.md
**Prisma & Database Conventions**
- Schema organization
- Model and field naming
- Data types and relationships
- Indexes and constraints
- Multi-tenancy patterns
- Query patterns
- Transactions
- Migrations
- Performance optimization
- Type safety

### 04-server-actions.md
**Server Actions Patterns & Conventions**
- Action declaration
- SafeAction wrapper pattern
- ActionResult pattern
- Input validation
- Data mutations (CRUD)
- Activity logging
- Cache invalidation
- Form integration
- Error handling
- Permission patterns

### 05-ui-components.md
**UI Components Architecture & Patterns**
- Component organization
- shadcn/ui components
- Component variants (CVA)
- Server vs Client Components
- Skeleton components
- Form components
- Modal and dialog patterns
- List and grid components
- Responsive design
- Accessibility

### 06-forms-validation.md
**Forms & Validation Patterns**
- React Hook Form usage
- Zod schema validation
- Form structure
- Field types
- Client and server validation
- Form submission
- Error handling
- Complex form patterns
- File uploads
- Accessibility

### 07-auth-security.md
**Authentication & Security Patterns**
- Auth.js v5 configuration
- Authentication providers
- Session management
- Authorization and permissions
- Password security
- CSRF protection
- Multi-tenancy security
- Input validation
- Rate limiting
- Security monitoring

### 08-multi-tenancy.md
**Multi-Tenancy Architecture & Patterns**
- Multi-tenancy model
- Organization structure
- Data isolation patterns
- Personal organizations
- Organization switching
- Invitation system
- Role management
- Activity logging
- Security considerations
- Performance and scalability

### 09-styling-design.md
**Styling & Design System Conventions**
- Tailwind CSS usage
- Design tokens (colors, spacing, typography)
- Responsive design
- Dark mode support
- Component styling
- Layout patterns
- Animation and transitions
- Accessibility styling
- Icons
- Performance

### 10-testing-quality.md
**Testing & Quality Assurance Standards**
- Testing philosophy
- Manual testing checklists
- Code quality tools
- Code review process
- Feature testing guide
- Security testing
- Performance testing
- Accessibility testing
- Bug tracking
- Release process

## How to Use These Files

### For Cursor AI
These files are designed to be read by Cursor to understand:
- How to structure new code
- What conventions to follow
- How to match existing patterns
- What libraries and patterns we use
- Security and performance requirements

### For Developers
Use these files as:
- Reference documentation
- Onboarding material
- Convention guide
- Decision record
- Best practices handbook

### For Code Review
Check against these files:
- Are conventions followed?
- Are patterns used correctly?
- Are security measures in place?
- Are performance considerations addressed?
- Is accessibility maintained?

## Key Principles

### 1. Server-First Architecture
Default to Server Components, use Client Components only when interactivity is required. This improves performance and security.

### 2. Type Safety Everywhere
TypeScript with strict null checks, Prisma for database types, Zod for validation. Single source of truth for types.

### 3. Multi-Tenancy by Default
Every query scoped to organization. Use prismaForOrg helper. Organization isolation is critical.

### 4. Security is Non-Negotiable
Input validation, authentication checks, authorization verification, and audit logging on every operation.

### 5. Accessibility is Required
Keyboard navigation, screen reader support, WCAG AA compliance. Accessibility is not optional.

### 6. Performance Matters
Bundle size, query optimization, caching strategy, loading states. Fast by default.

### 7. Consistency is Key
Follow established patterns, use existing components, maintain conventions. Predictable codebase.

## Quick Reference

### Common Patterns
- Create new feature? See 02-nextjs-patterns.md and 05-ui-components.md
- Add form? See 06-forms-validation.md
- Add server action? See 04-server-actions.md
- Database changes? See 03-prisma-database.md
- Security concern? See 07-auth-security.md
- Multi-tenant feature? See 08-multi-tenancy.md
- Styling question? See 09-styling-design.md

### File Naming
- Components: kebab-case.tsx (user-auth-form.tsx)
- Server actions: camelCase (createProperty)
- Types: PascalCase (PropertyFormData)
- Database models: PascalCase singular (Property)
- CSS classes: Tailwind utilities

### Import Order
1. React imports
2. Next.js imports
3. Third-party modules
4. Types
5. Environment & Config
6. Lib & utilities
7. Hooks
8. UI components
9. Other components
10. Styles
11. Relative imports

### Organization Context
Always use prismaForOrg helper for multi-tenant queries. Organization isolation is critical security boundary.

### Error Handling
Server actions return ActionResult<T>. Never throw errors, always return error result. User-friendly messages.

### Validation
Zod schemas in lib/validations/. Same schema for client and server. Validate on both sides.

## Technology Stack Summary

**Framework**: Next.js 14.2.5 (App Router)  
**Language**: TypeScript 5.5.3  
**Database**: PostgreSQL + Prisma 5.17.0  
**Auth**: Auth.js v5 (NextAuth)  
**UI**: shadcn/ui + Tailwind CSS 3.4.6  
**Forms**: React Hook Form 7.52.1 + Zod 3.23.8  
**Email**: Resend + React Email  
**Payments**: Stripe  
**Package Manager**: pnpm

## Maintenance

### Updating Rules
When project conventions change:
1. Update relevant rules file
2. Document reason for change
3. Communicate to team
4. Update codebase to match
5. Update this README if structure changes

### Adding New Rules
For new domains/patterns:
1. Create new numbered file (11-new-domain.md)
2. Follow existing file structure
3. Add to this README
4. Link from overview.md
5. Communicate to team

## Getting Help

### Questions About Conventions
1. Check relevant rules file
2. Look for examples in codebase
3. Ask team lead
4. Update documentation if unclear

### Proposing Changes
1. Discuss with team
2. Document rationale
3. Update rules file
4. Create pull request
5. Update implementation

## Version Information

**Cursor Rules Version**: 1.0  
**Last Updated**: October 25, 2025  
**Oikion Version**: 0.3.1  
**Next.js**: 14.2.5

---

## Quick Start Checklist

New to the project? Read in order:

- [ ] 00-overview.md - Understand the big picture
- [ ] 01-typescript-conventions.md - Learn TypeScript patterns
- [ ] 02-nextjs-patterns.md - Understand Next.js usage
- [ ] 03-prisma-database.md - Database patterns
- [ ] 08-multi-tenancy.md - Critical for data isolation
- [ ] 07-auth-security.md - Security is paramount

Then reference others as needed for specific tasks.

---

**These rules ensure consistent, secure, performant, and maintainable code across the Oikion project.**

