# ALWAYS — Product Purpose & Domain Canonicals (Oikion App)

## Purpose (Single Source of Truth)
Oikion is the **operating system for Greek real-estate agencies**. It delivers three pillars in one web app:
1) **MLS** (internal listings management),
2) **CRM** (client & deal workflow),
3) **Socials** (an internal, organization-wide activity feed).
Goal: **speedy daily operations** (add/list/show), **clean team visibility**, and **subscription-backed** sustainability. Ship fastest usable path; avoid scope creep.

## Non-Negotiable Stack (for any task)
Next.js 14.2.5 App Router • TypeScript 5.5.3 • Node 20 • Tailwind CSS 3.4.6 • shadcn/ui • Auth.js v5.0.0-beta.19 • Prisma 5.17.0 • PostgreSQL 15+ (Neon) • Stripe 15.12+ (Checkout + Customer Portal) • pnpm • Vercel. Use `AUTH_*` envs (Auth.js v5). Treat `NEXTAUTH_*` as legacy.

## Rule System Structure

This project uses a comprehensive rule system to maintain consistency and quality. All rules are located in `/docs/rules/`:

### Core Technical Rules (MUST follow)
1. **[TypeScript Rules](./typescript.md)** — Type safety, patterns, Zod integration
2. **[Database Rules](./database.md)** — Prisma, RLS, multi-tenancy, migrations
3. **[Frontend Rules](./frontend.md)** — Next.js App Router, Server/Client Components, React patterns
4. **[API & Server Actions Rules](./api-server-actions.md)** — Server Actions (preferred), API routes, validation
5. **[Authentication Rules](./authentication.md)** — Auth.js v5, RBAC, session management
6. **[Stripe & Billing Rules](./stripe-billing.md)** — Subscriptions, webhooks, Customer Portal

### When to Consult Rules
- **Before starting any task** → Review relevant rule document
- **TypeScript errors** → Check `typescript.md`
- **Database operations** → Check `database.md` (especially for RLS)
- **Component creation** → Check `frontend.md` (Server vs Client)
- **Forms & mutations** → Check `api-server-actions.md`
- **Auth issues** → Check `authentication.md`
- **Payment features** → Check `stripe-billing.md`

### Rule Priority
1. **This file (always.md)** — Product domain rules, overrides all
2. **Specific rule documents** — Technical patterns for each domain
3. **Project glossary** — Definitions and best practices (`/docs/glossary/`)
4. **Vendor docs** — Official documentation (when rules don't cover)

If rules conflict with user memory, **ALWAYS follow rules**.

---

## MLS — Canonical Definition
**What it is:** The **internal** Multiple Listing System for a single agency (organization). It is **not** a public portal and **not** external syndication.

**Core entities (minimum):**
- **Property** (type, status, price, beds, baths, size, features)
- **Address** (country, region, city, street, number, postal code; free-text location)
- **Listing** (marketing state: draft/active/archived; list price; dates)
- **MediaAsset** (images/videos; primary image)
- **Inquiry/Lead** (source, message, contact details; links to Property + Client when known)

**Outcomes we always target:**
- Fast CRUD of Property & Listing.
- Reliable filters (status, type, price range, free-text location).
- Image upload using starter-compatible adapter.
- Clear list → detail → edit flow with accessible forms.

**Explicit non-goals (Alpha):**
- Public website/portal, SEO pages, external feeds (Spitogatos/MLS imports), map draw tools.

---

## CRM — Canonical Definition
**What it is:** A lightweight **client & activity manager** for real-estate work.

**Core entities (minimum):**
- **Client** (person/company; name, emails/phones, tags, notes)
- **Interaction** (call/email/meeting; timestamp; summary; related Client/Property)
- **Task** (title, due date, assigned to user; status)
- **Note** (free-text, linked to Client/Property)

**Outcomes we always target:**
- Fast Client CRUD with tags.
- Timeline of Interactions & Notes per Client.
- Tasks surfaced on Dashboard (what's due today/soon).
- Linkage between Clients ↔ Properties ↔ Interactions.

**Explicit non-goals (Alpha):**
- Email sending, calendar sync, advanced pipelines/kanban, marketing automation.

---

## Oikosync — Canonical Definition
**What it is:** An **internal activity feed** (per organization) that shows significant events across MLS & CRM. It is **not** a public social network.

**Core entity:**
- **Activity** { actor (User), verb/action, entity type/id, timestamp, payload }

**Required events (minimum):**
- Property: created/updated/archived; media added
- Client: created/updated; note/interaction added
- Task: created/completed
- Membership: invited/role-changed
- Billing: subscription started/updated/canceled (non-sensitive summary)

**Outcomes we always target:**
- `/feed` with filters (actor, entity type, date range).
- Deep links back to the underlying item (Property/Client/Task).

**Explicit non-goals (Alpha):**
- Real-time sockets, reactions/comments, external sharing.

---

## Product Boundaries & Priorities
1) **One org per user (Alpha).** Roles: `ORG_OWNER`, `ADMIN`, `AGENT`, `VIEWER`.
2) **Billing gates usage.** Non-subscribed orgs see a limited dashboard and CTA to subscribe.
3) **Accessibility first.** Keyboard/focus, ARIA labels, form error states.
4) **Performance over features.** Ship smallest coherent flow; prefer lists + filters + detail/edit.
5) **No external integrations** unless explicitly added to docs/vendor and approved.

---

## Done Means
- Auth & org bootstrap works; roles enforced.
- MLS v1 and CRM v1 are fully usable with persisted data.
- Socials feed reflects CRUD events and is filterable.
- Stripe subscription + Customer Portal flows pass in test mode; gating enforced.
- No console errors; migrations green; a11y pass on critical flows.

---

## Source of Truth (must cite when altering auth/payments/db)
1) **Rule documents** in `/docs/rules/` (canonical patterns for this project)
2) **Glossary** in `/docs/glossary/` (architectural decisions, best practices)
3) Repo README/docs (project-specific setup)
4) Official vendor docs (authjs.dev, docs.stripe.com, neon.tech, prisma.io) — for API reference

Everything else: ignore unless explicitly added to documentation structure.

---

## Critical Technical Rules (Quick Reference)

### Database (See database.md for full rules)
- **ALWAYS use `prismaForOrg(organizationId)`** for tenant data
- Never use global `prisma` for organization-scoped models
- RLS is enabled on all tenant tables (properties, clients, etc.)
- Test cross-tenant isolation before deploying

### Authentication (See authentication.md for full rules)
- **Every server action/API route MUST check auth**: `const session = await auth();`
- **Check authorization**: Use `lib/roles.ts` helpers (`canCreateContent`, etc.)
- Session strategy is JWT (stateless)
- Support Google OAuth + Magic Link (Resend)

### Frontend (See frontend.md for full rules)
- **Server Components by default** (no 'use client' unless needed)
- Push 'use client' boundaries down to leaf components
- Fetch data in Server Components, pass to Client Components as props
- Use TypeScript for all components

### Server Actions (See api-server-actions.md for full rules)
- **Preferred over API routes** for mutations
- Pattern: auth check → authorization → validation → business logic → revalidate
- Always return `{ success: boolean; data?: T; error?: string }`
- Use Zod for input validation

### Stripe (See stripe-billing.md for full rules)
- **Always verify webhook signatures** before processing
- Use `stripe.webhooks.constructEvent()` with raw body
- Return 200 from webhooks (even on errors)
- Test with Stripe CLI locally

---

**Working directory:** `cd /Users/stapo/Desktop/next-saas-stripe-starter-main`
**Remember**: Always use `prismaForOrg(session.user.organizationId)` for tenant data! 🔒

---

## Quick Start for AI Agents

When starting a new task:
1. Read this file (always.md) first
2. Identify which rule document(s) apply to your task
3. Review the relevant rule document(s) in `/docs/rules/`
4. Check `/docs/glossary/` for architectural patterns if needed
5. Proceed with implementation following the patterns

Common task → rule mapping:
- **Add new model** → database.md
- **Create form** → frontend.md + api-server-actions.md
- **Add auth check** → authentication.md
- **Build component** → frontend.md + typescript.md
- **Integrate payment** → stripe-billing.md
- **Debug Prisma** → database.md
- **Fix types** → typescript.md
