# Oikion Documentation System

Welcome to the Oikion documentation! This folder contains comprehensive rules, glossaries, and quest templates for building and maintaining the Oikion real estate SaaS platform.

## 📁 Documentation Structure

```
docs/
├── rules/           # Core technical rules (MUST follow)
├── glossary/        # Architectural patterns & best practices
├── quests/          # Feature quest templates
└── README.md        # This file
```

---

## 🎯 Quick Start

### For AI Agents

1. **Start here**: Read [`rules/always.md`](./rules/always.md) first
2. **Identify task type**: Map your task to relevant rule document(s)
3. **Follow patterns**: Review specific rule documents for your domain
4. **Check glossary**: Consult glossary for architectural context
5. **Implement**: Follow the patterns consistently

### For Developers

1. **Read `always.md`**: Understand product goals and non-negotiables
2. **Browse rules**: Familiarize yourself with technical standards
3. **Consult as needed**: Reference rules when implementing features
4. **Use quest template**: Plan complex features with quest template
5. **Contribute**: Update docs when patterns evolve

---

## 📚 Core Rule Documents

All rules are located in [`/docs/rules/`](./rules/) and define canonical patterns for the codebase.

### 1. [`always.md`](./rules/always.md) — **Start Here**
**Product vision, domain rules, and documentation system overview**

- Oikion product purpose (MLS, CRM, Socials)
- Non-negotiable technology stack
- Rule system structure and priority
- Quick reference for common patterns

**When to read**: Before starting ANY task

---

### 2. [`typescript.md`](./rules/typescript.md)
**TypeScript standards, type safety, and Zod integration**

- Compiler configuration and strict mode
- Type safety rules (no `any`, explicit types)
- Zod schema patterns for validation
- Generic types and utility types
- Type guards and discriminated unions
- Async/Promise type patterns

**When to consult**:
- TypeScript errors or type issues
- Creating validation schemas
- Defining function signatures
- Working with Prisma types

---

### 3. [`database.md`](./rules/database.md)
**Prisma ORM, Row-Level Security (RLS), and multi-tenancy**

- Prisma client patterns (`prismaForOrg()`)
- Row-Level Security (RLS) implementation
- Multi-tenant data isolation
- Schema design principles
- Migration best practices
- Query optimization patterns

**When to consult**:
- Database operations and queries
- Creating new models or migrations
- RLS policy setup
- Cross-tenant isolation issues
- Performance optimization

---

### 4. [`frontend.md`](./rules/frontend.md)
**Next.js App Router, React Server/Client Components, and UI patterns**

- Server Components (default)
- Client Components ('use client')
- App Router architecture
- Component composition patterns
- Data fetching strategies
- Styling with Tailwind CSS
- Accessibility (a11y) requirements

**When to consult**:
- Creating pages or components
- Server vs Client Component decisions
- Data fetching and streaming
- Form handling
- UI component patterns

---

### 5. [`api-server-actions.md`](./rules/api-server-actions.md)
**Server Actions (preferred) and API routes**

- Server Actions pattern (auth → validation → logic)
- API route patterns (webhooks, public APIs)
- Authentication and authorization checks
- Input validation with Zod
- Error handling strategies
- Cache revalidation

**When to consult**:
- Form submissions and mutations
- Creating API endpoints
- Webhook handlers
- Authentication/authorization
- Data validation

---

### 6. [`authentication.md`](./rules/authentication.md)
**Auth.js v5, role-based access control (RBAC), and session management**

- Auth.js v5 configuration (split for Edge)
- OAuth providers (Google)
- Magic Link authentication (Resend)
- Role hierarchy (ORG_OWNER, ADMIN, AGENT, VIEWER)
- Permission helpers and checks
- Invitation flow
- Session management

**When to consult**:
- Authentication setup or issues
- Role-based permissions
- Protected routes
- User invitation flows
- Session handling

---

### 7. [`stripe-billing.md`](./rules/stripe-billing.md)
**Stripe integration, subscriptions, and billing workflows**

- Stripe Checkout flow
- Customer Portal integration
- Webhook handling (signature verification)
- Subscription status checks
- Feature gating by plan
- Testing with Stripe CLI

**When to consult**:
- Payment integration
- Subscription management
- Webhook setup
- Billing features
- Plan-based feature gating

---

## 📖 Glossary Documents

Located in [`/docs/glossary/`](./glossary/), these provide in-depth explanations of architectural patterns and best practices.

### [`nextjs-app-router.md`](./glossary/nextjs-app-router.md)
**Next.js 14 App Router concepts and patterns**

- Server Components vs Client Components
- Layouts, pages, and route groups
- Loading and error states
- Dynamic routes and search params
- Data fetching patterns
- Navigation patterns

**Purpose**: Deep dive into Next.js App Router architecture with Oikion-specific examples

---

### [`multi-tenancy-rls.md`](./glossary/multi-tenancy-rls.md)
**Multi-tenancy architecture and Row-Level Security**

- Multi-tenancy patterns
- Row-Level Security (RLS) implementation
- Tenant isolation strategies
- Organization scoping
- Session variables
- Testing isolation

**Purpose**: Comprehensive guide to tenant data isolation and security

---

## 🎯 Quest System

### Quest Template: [`quests/QUEST-TEMPLATE.md`](./quests/QUEST-TEMPLATE.md)

**What it is**: Structured format for planning and tracking feature development

**Includes**:
- Quest metadata (ID, status, priority, effort)
- Context and background
- Technical approach and architecture
- Implementation plan (phased tasks)
- Rule references
- Testing strategy
- Acceptance criteria (Definition of Done)
- Progress tracking

**When to use**:
- Complex features (>1 day effort)
- Features requiring multiple components
- Cross-cutting concerns (database + frontend + API)
- Features requiring coordination

**How to use**:
1. Copy template to `quests/QUEST-[YYYYMMDD]-[name].md`
2. Fill in metadata and summary
3. Break down into phases and tasks
4. Link to relevant rule documents
5. Track progress in the file

---

## 🔄 Rule Priority & Conflict Resolution

When there are conflicts, follow this priority order:

1. **[`always.md`](./rules/always.md)** — Product domain rules (highest priority)
2. **Specific rule documents** — Technical patterns for each domain
3. **Glossary** — Architectural patterns and best practices
4. **Vendor documentation** — Official docs (when rules don't cover)
5. **User memory/preferences** — Lowest priority (rules always win)

**Remember**: If rules conflict with user preferences, **ALWAYS follow the rules**.

---

## 🎨 Documentation Philosophy

### Why This System Exists

1. **Consistency**: Everyone follows the same patterns
2. **Onboarding**: New developers/agents have clear guidance
3. **Quality**: Standards prevent common mistakes
4. **Speed**: Less decision-making, more building
5. **Maintainability**: Patterns make code predictable

### Guiding Principles

1. **Opinionated**: One right way to do things
2. **Practical**: Rules based on real codebase patterns
3. **Complete**: Covers all major technical domains
4. **Up-to-date**: Reflects current best practices (2024-2025)
5. **Enforced**: Rules are requirements, not suggestions

---

## 🛠️ How to Use This System

### Scenario 1: Starting a New Feature

1. Read [`always.md`](./rules/always.md) for product context
2. Create a quest from [`QUEST-TEMPLATE.md`](./quests/QUEST-TEMPLATE.md)
3. Identify relevant rule documents:
   - Database changes? → `database.md`
   - New UI? → `frontend.md`
   - Forms/mutations? → `api-server-actions.md`
   - Auth required? → `authentication.md`
   - Billing related? → `stripe-billing.md`
4. Review those specific rule documents
5. Check glossary for architectural patterns
6. Implement following the patterns
7. Update quest with progress

---

### Scenario 2: Debugging an Issue

**TypeScript error**:
1. Check [`typescript.md`](./rules/typescript.md) for type patterns
2. Review type definitions in `types/`

**Data not showing**:
1. Check [`database.md`](./rules/database.md) for RLS patterns
2. Verify `prismaForOrg()` is used
3. Check [`multi-tenancy-rls.md`](./glossary/multi-tenancy-rls.md) for isolation

**Component not rendering**:
1. Check [`frontend.md`](./rules/frontend.md) for Server vs Client
2. Review [`nextjs-app-router.md`](./glossary/nextjs-app-router.md)

**Auth failing**:
1. Check [`authentication.md`](./rules/authentication.md)
2. Verify session and role checks

---

### Scenario 3: Code Review

Use rule documents as checklist:
- [ ] Follows TypeScript standards? (`typescript.md`)
- [ ] Uses `prismaForOrg()` for tenant data? (`database.md`)
- [ ] Server/Client Components correct? (`frontend.md`)
- [ ] Auth/authz checks present? (`authentication.md`)
- [ ] Validation with Zod? (`api-server-actions.md`)
- [ ] RLS policies if new model? (`database.md`)

---

### Scenario 4: Onboarding

**Day 1**:
- Read [`always.md`](./rules/always.md) — Product vision
- Skim all rule documents (understand what exists)

**Week 1**:
- Deep dive into relevant rule documents for your first task
- Reference glossary for architectural context

**Month 1**:
- Internalize patterns through practice
- Contribute improvements to documentation

---

## 📝 Maintaining This Documentation

### When to Update Rules

- **New patterns emerge**: Document and standardize them
- **Best practices evolve**: Update with latest recommendations
- **Stack changes**: Major dependency updates (Next.js, Prisma, etc.)
- **Common mistakes**: Add to "Don't" sections
- **Clarifications needed**: Expand unclear sections

### How to Update

1. **Identify gap**: Missing pattern or outdated info
2. **Research**: Verify best practices (official docs, community)
3. **Draft changes**: Update relevant rule or glossary document
4. **Test patterns**: Verify in actual codebase
5. **Commit**: Update with clear commit message

### Documentation Standards

- **Clear examples**: Always include code examples
- **Complete patterns**: Show full flow, not snippets
- **Explain why**: Rationale behind rules
- **Link related**: Cross-reference related documents
- **Keep updated**: Review quarterly for accuracy

---

## 🔗 Quick Reference Links

### Rules (Technical Standards)
- [always.md](./rules/always.md) — Product & system overview
- [typescript.md](./rules/typescript.md) — Type safety
- [database.md](./rules/database.md) — Prisma & RLS
- [frontend.md](./rules/frontend.md) — Next.js & React
- [api-server-actions.md](./rules/api-server-actions.md) — Server Actions & APIs
- [authentication.md](./rules/authentication.md) — Auth.js & RBAC
- [stripe-billing.md](./rules/stripe-billing.md) — Payments & subscriptions

### Glossaries (Architectural Patterns)
- [nextjs-app-router.md](./glossary/nextjs-app-router.md) — App Router deep dive
- [multi-tenancy-rls.md](./glossary/multi-tenancy-rls.md) — Tenant isolation

### Templates
- [QUEST-TEMPLATE.md](./quests/QUEST-TEMPLATE.md) — Feature planning

---

## 🚀 Technology Stack Quick Reference

**Current versions** (as of docs creation):
- Next.js: 14.2.5 (App Router)
- React: 18.3.1
- TypeScript: 5.5.3
- Prisma: 5.17.0
- PostgreSQL: 15+ (via Neon)
- Auth.js: 5.0.0-beta.19
- Stripe: 15.12+
- Tailwind CSS: 3.4.6
- Node.js: 20+

**Package manager**: pnpm  
**Deployment**: Vercel

---

## 🎓 Learning Path

### For AI Agents
1. [`always.md`](./rules/always.md) → Product context
2. Task-specific rules → Technical patterns
3. Glossary → Deep architectural understanding
4. Implement with confidence

### For Junior Developers
1. [`always.md`](./rules/always.md) → Overview
2. [`nextjs-app-router.md`](./glossary/nextjs-app-router.md) → App Router basics
3. [`frontend.md`](./rules/frontend.md) → Component patterns
4. [`database.md`](./rules/database.md) → Data layer
5. Practice with simple tasks

### For Senior Developers
1. Skim all documents → Understand system
2. Focus on [`database.md`](./rules/database.md) → RLS is critical
3. Review [`api-server-actions.md`](./rules/api-server-actions.md) → Server Actions
4. Contribute to documentation improvements

---

## 💡 Best Practices

### ✅ DO
- Consult rules BEFORE starting work
- Follow patterns consistently
- Update docs when patterns change
- Ask questions if rules are unclear
- Test against rule requirements

### ❌ DON'T
- Ignore rules because "I know better"
- Implement patterns not in documentation
- Skip reading rules for "simple" tasks
- Let documentation become outdated
- Create competing patterns

---

## 📞 Getting Help

**Rules unclear?**
- Check glossary for more context
- Review code examples in rules
- Ask for clarification (update docs after)

**Pattern not covered?**
- Check if it fits existing patterns
- Research best practices
- Document new pattern
- Get review before adopting

**Conflict with vendor docs?**
- Follow vendor docs for API usage
- Follow our rules for patterns/architecture
- Document any deviations

---

## 🔒 Critical Reminders

### Security
- **ALWAYS use `prismaForOrg()`** for tenant data
- **ALWAYS check authentication** in server actions/APIs
- **ALWAYS validate input** with Zod
- **ALWAYS verify webhook signatures** (Stripe)

### Performance
- **Server Components by default**
- **'use client' only when needed**
- **Index `organizationId`** on tenant tables
- **Use Suspense for streaming**

### Type Safety
- **Explicit types** for function signatures
- **Avoid `any`** (use `unknown` or proper types)
- **Validate at boundaries** (Zod schemas)
- **Generate types from Prisma**

---

## 📈 Version History

**v1.0.0** (2025-01-17)
- Initial comprehensive documentation system
- 7 core rule documents
- 2 glossary documents
- Quest template system
- Integrated with existing codebase patterns

---

**Remember**: These rules exist to help you ship quality code faster. When in doubt, follow the patterns. When patterns are missing, document them. 🚀

Happy coding! 💻
