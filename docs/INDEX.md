# Documentation Index

Quick reference index for finding the right documentation.

## 🎯 I want to...

### Start a new feature
→ [`quests/QUEST-TEMPLATE.md`](./quests/QUEST-TEMPLATE.md) - Plan your feature  
→ [`rules/always.md`](./rules/always.md) - Understand product context  
→ Relevant rule documents based on feature type

### Fix a TypeScript error
→ [`rules/typescript.md`](./rules/typescript.md) - Type safety rules  
→ Check type definitions in `/types/`

### Add a new database model
→ [`rules/database.md`](./rules/database.md) - Prisma patterns  
→ [`glossary/multi-tenancy-rls.md`](./glossary/multi-tenancy-rls.md) - RLS setup

### Create a new page/component
→ [`rules/frontend.md`](./rules/frontend.md) - Component patterns  
→ [`glossary/nextjs-app-router.md`](./glossary/nextjs-app-router.md) - App Router guide

### Add a form with validation
→ [`rules/api-server-actions.md`](./rules/api-server-actions.md) - Server Actions  
→ [`rules/typescript.md`](./rules/typescript.md) - Zod schemas  
→ [`rules/frontend.md`](./rules/frontend.md) - Form components

### Implement authentication/authorization
→ [`rules/authentication.md`](./rules/authentication.md) - Auth.js patterns  
→ Check role helpers in `/lib/roles.ts`

### Integrate payment feature
→ [`rules/stripe-billing.md`](./rules/stripe-billing.md) - Stripe integration

### Debug data not showing
→ [`rules/database.md`](./rules/database.md) - Verify `prismaForOrg()` usage  
→ [`glossary/multi-tenancy-rls.md`](./glossary/multi-tenancy-rls.md) - Check RLS

### Understand the architecture
→ [`README.md`](./README.md) - Documentation system overview  
→ [`rules/always.md`](./rules/always.md) - Product vision  
→ Glossary documents for deep dives

### Onboard a new developer
→ [`README.md`](./README.md) - Start here  
→ [`rules/always.md`](./rules/always.md) - Product overview  
→ [`glossary/nextjs-app-router.md`](./glossary/nextjs-app-router.md) - Tech foundation

### Review code
→ Use rule documents as checklist  
→ [`rules/always.md`](./rules/always.md) - Critical reminders

---

## 📚 By Topic

### Frontend
- [`frontend.md`](./rules/frontend.md) - Complete frontend rules
- [`nextjs-app-router.md`](./glossary/nextjs-app-router.md) - App Router deep dive
- [`typescript.md`](./rules/typescript.md) - Type safety

### Backend
- [`api-server-actions.md`](./rules/api-server-actions.md) - Server Actions & APIs
- [`database.md`](./rules/database.md) - Prisma & RLS
- [`multi-tenancy-rls.md`](./glossary/multi-tenancy-rls.md) - Tenant isolation

### Authentication & Authorization
- [`authentication.md`](./rules/authentication.md) - Auth.js & RBAC

### Payments
- [`stripe-billing.md`](./rules/stripe-billing.md) - Stripe integration

### Type Safety
- [`typescript.md`](./rules/typescript.md) - TypeScript standards

### Product & Process
- [`always.md`](./rules/always.md) - Product vision & rules system
- [`QUEST-TEMPLATE.md`](./quests/QUEST-TEMPLATE.md) - Feature planning

---

## 📖 By Role

### AI Agent
1. [`always.md`](./rules/always.md) - Start here
2. Task-specific rule documents
3. Glossary for deep understanding

### Junior Developer
1. [`README.md`](./README.md) - Overview
2. [`nextjs-app-router.md`](./glossary/nextjs-app-router.md) - Foundation
3. [`frontend.md`](./rules/frontend.md) - Component patterns
4. Practice with simple tasks

### Senior Developer
1. Skim all documents
2. Focus on [`database.md`](./rules/database.md) - RLS critical
3. [`api-server-actions.md`](./rules/api-server-actions.md) - Server patterns
4. Contribute to docs

### Product Manager
1. [`always.md`](./rules/always.md) - Product vision
2. [`QUEST-TEMPLATE.md`](./quests/QUEST-TEMPLATE.md) - Feature planning

---

## 🔍 By File Type

### Rules (Core Technical Standards)
- [`always.md`](./rules/always.md) - Product & system overview
- [`typescript.md`](./rules/typescript.md) - Type safety (639 lines)
- [`database.md`](./rules/database.md) - Prisma & RLS (813 lines)
- [`frontend.md`](./rules/frontend.md) - Next.js & React (1,242 lines)
- [`api-server-actions.md`](./rules/api-server-actions.md) - Server Actions (930 lines)
- [`authentication.md`](./rules/authentication.md) - Auth.js & RBAC (925 lines)
- [`stripe-billing.md`](./rules/stripe-billing.md) - Stripe (794 lines)

### Glossaries (Deep Dives)
- [`nextjs-app-router.md`](./glossary/nextjs-app-router.md) - App Router patterns (606 lines)
- [`multi-tenancy-rls.md`](./glossary/multi-tenancy-rls.md) - Multi-tenancy (586 lines)

### Templates
- [`QUEST-TEMPLATE.md`](./quests/QUEST-TEMPLATE.md) - Feature planning (284 lines)

### Meta
- [`README.md`](./README.md) - Documentation system guide
- [`INDEX.md`](./INDEX.md) - This file

---

## ⚡ Quick Reference

### Critical Patterns (Always Follow)
```typescript
// ✅ Tenant data - ALWAYS use prismaForOrg()
const orgPrisma = prismaForOrg(user.organizationId);
const data = await orgPrisma.property.findMany();

// ✅ Auth check - ALWAYS in server actions
const session = await auth();
if (!session?.user?.id) {
  return { success: false, error: "Unauthorized" };
}

// ✅ Validation - ALWAYS with Zod
const result = schema.safeParse(input);
if (!result.success) {
  return { success: false, error: result.error };
}

// ✅ Server Components - Default (no 'use client')
export default async function Page() {
  const data = await fetchData();
  return <Component data={data} />;
}
```

### Common Pitfalls (Avoid)
```typescript
// ❌ NO global prisma for tenant data
const data = await prisma.property.findMany(); // WRONG!

// ❌ NO skipping auth checks
export async function deleteProperty(id: string) {
  // Missing auth check - WRONG!
  await prisma.property.delete({ where: { id } });
}

// ❌ NO unvalidated input
export async function createClient(data: any) { // WRONG!
  await prisma.client.create({ data }); // Dangerous!
}

// ❌ NO unnecessary 'use client'
'use client'; // Only use when you need hooks/events!
export default function Page() { /* ... */ }
```

---

## 🎯 Decision Trees

### Should I use Server or Client Component?
```
Need state/hooks/events/browser APIs?
├─ YES → 'use client'
└─ NO → Server Component (default)
```

### Which data fetching pattern?
```
Where is data fetched?
├─ Server Component → Direct Prisma query (preferred)
├─ Client Component → Server Action or API route
└─ Webhook → API route with signature verification
```

### How to scope database query?
```
Is this tenant data?
├─ YES → prismaForOrg(organizationId)
└─ NO (User/Account/Session) → global prisma
```

---

## 📊 Documentation Statistics

- **Total**: ~7,500 lines of documentation
- **Rules**: 7 documents (5,534 lines)
- **Glossaries**: 2 documents (1,192 lines)
- **Templates**: 1 document (284 lines)

**Coverage**: TypeScript, Database, Frontend, API, Auth, Stripe, Architecture, Planning

---

## 🔗 External Resources

### Official Documentation
- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/)
- [Prisma](https://www.prisma.io/docs)
- [Auth.js](https://authjs.dev/)
- [Stripe](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Community Resources
- [Oikion Starter](https://github.com/mickasmt/next-saas-stripe-starter)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)

---

**Need help?** Start with [`README.md`](./README.md) for the full documentation system guide.
