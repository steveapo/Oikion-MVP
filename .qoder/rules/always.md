---
trigger: always_on
alwaysApply: true
---

 # ALWAYS — Product Purpose & Domain Canonicals (Oikion App)

## Purpose (Single Source of Truth)
Oikion is the **operating system for Greek real-estate agencies**. It delivers three pillars in one web app:
1) **MLS** (internal listings management),
2) **CRM** (client & deal workflow),
3) **Socials** (an internal, organization-wide activity feed).
Goal: **speedy daily operations** (add/list/show), **clean team visibility**, and **subscription-backed** sustainability. Ship fastest usable path; avoid scope creep.

## Non-Negotiable Stack (for any task)
Next.js App Router • TypeScript • Node 20 • Tailwind • shadcn/ui • Auth.js v5 • Prisma • PostgreSQL (Neon) • Stripe (Checkout + Customer Portal) • pnpm • Vercel. Use `AUTH_*` envs (Auth.js v5). Treat `NEXTAUTH_*` as legacy.

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
- Tasks surfaced on Dashboard (what’s due today/soon).
- Linkage between Clients ↔ Properties ↔ Interactions.

**Explicit non-goals (Alpha):**
- Email sending, calendar sync, advanced pipelines/kanban, marketing automation.

---

## Socials — Canonical Definition
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
1) `/docs/vendor/*` snapshots (starter, Auth.js v5, Stripe, Neon, Prisma)
2) Repo README/docs
3) Official docs (authjs.dev, docs.stripe.com, neon.tech, prisma.io)
Everything else: ignore unless promoted into `/docs/vendor`.

---

**Remember**: Always use `prismaForOrg(session.user.organizationId)` for tenant data! 🔒