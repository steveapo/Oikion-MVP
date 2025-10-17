# Next.js App Router Glossary

## Overview
This glossary defines Next.js 14 App Router concepts, patterns, and best practices specific to the Oikion codebase. For complete rules, see [frontend.md](../rules/frontend.md).

## Core Concepts

### App Router
**Definition**: File-system based routing using the `app/` directory (Next.js 13+)

**Key Features**:
- Nested layouts
- Server Components by default
- Streaming with Suspense
- Built-in loading and error states
- Route groups `(name)`

**Example Structure**:
```
app/
├── (auth)/              # Route group (parentheses don't affect URL)
│   ├── login/
│   │   └── page.tsx     # URL: /login
│   └── layout.tsx       # Shared layout for auth routes
├── (protected)/
│   ├── dashboard/
│   │   └── page.tsx     # URL: /dashboard
│   └── layout.tsx       # Protected layout (auth check)
└── layout.tsx           # Root layout (entire app)
```

**When to use**: Always (this is the project standard, not Pages Router)

---

### Server Components (RSC)

**Definition**: React components that run on the server, don't send JavaScript to the client

**Characteristics**:
- Can directly query database
- Can use Node.js APIs
- Can access server-side environment variables
- Cannot use hooks (`useState`, `useEffect`, etc.)
- Cannot attach event handlers
- Cannot use browser APIs

**Example**:
```typescript
// app/dashboard/properties/page.tsx (Server Component)

import { getCurrentUser } from "@/lib/session";
import { prismaForOrg } from "@/lib/org-prisma";

export default async function PropertiesPage() {
  // ✅ Direct database access
  const user = await getCurrentUser();
  const orgPrisma = prismaForOrg(user.organizationId);
  
  const properties = await orgPrisma.property.findMany({
    include: { address: true },
  });
  
  // ✅ Pass data to Client Component
  return <PropertyList properties={properties} />;
}
```

**Benefits**:
- Zero JavaScript to client (faster page loads)
- Better SEO (fully rendered HTML)
- Secure (no exposure of server logic)
- Direct data access (no API layer needed)

**When to use**: Default for all components (unless you need client features)

---

### Client Components

**Definition**: React components that run in the browser, marked with `'use client'`

**Characteristics**:
- Can use React hooks
- Can attach event handlers
- Can use browser APIs
- Can access `window`, `localStorage`, etc.
- Ship JavaScript to the client

**Example**:
```typescript
// components/properties/property-filter.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PropertyFilter() {
  const [status, setStatus] = useState<PropertyStatus | "ALL">("ALL");
  const router = useRouter();
  
  function handleFilterChange(newStatus: PropertyStatus | "ALL") {
    setStatus(newStatus);
    router.push(`/dashboard/properties?status=${newStatus}`);
  }
  
  return (
    <select value={status} onChange={(e) => handleFilterChange(e.target.value)}>
      <option value="ALL">All</option>
      <option value="AVAILABLE">Available</option>
      <option value="SOLD">Sold</option>
    </select>
  );
}
```

**When to use**:
- Forms with state
- Interactive UI (dropdowns, modals, tabs)
- Animations
- Browser APIs (geolocation, localStorage, etc.)
- Real-time features (WebSockets, polling)

**Best practice**: Push `'use client'` boundary as low as possible (leaf components)

---

### Layout Components

**Definition**: Special file (`layout.tsx`) that wraps child routes and persists across navigations

**Characteristics**:
- Shared UI (nav, sidebar, footer)
- Can be Server Components (async)
- Nested (each route group can have its own)
- Doesn't re-render on navigation

**Example**:
```typescript
// app/(protected)/layout.tsx

import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check (runs on every protected route)
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar user={user} />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
```

**When to use**:
- Shared navigation/UI
- Authentication checks
- Global providers (theme, modals)
- Persistent state across routes

---

### Page Components

**Definition**: Special file (`page.tsx`) that defines a route's UI

**Characteristics**:
- Must export default component
- Can be Server Component (async)
- Receives `params` and `searchParams` props
- Defines actual route URL

**Example**:
```typescript
// app/dashboard/properties/[id]/page.tsx

interface PageProps {
  params: { id: string };
  searchParams: { view?: 'details' | 'media' };
}

export default async function PropertyDetailPage({ 
  params, 
  searchParams 
}: PageProps) {
  const property = await getProperty(params.id);
  const view = searchParams.view ?? 'details';
  
  return (
    <div>
      <h1>{property.address.street}</h1>
      {view === 'details' ? <PropertyDetails /> : <PropertyMedia />}
    </div>
  );
}
```

**File naming**:
- `page.tsx` - Standard page
- `[id]/page.tsx` - Dynamic route (e.g., `/properties/123`)
- `[...slug]/page.tsx` - Catch-all route (e.g., `/docs/guides/auth`)

---

### Route Groups

**Definition**: Folders wrapped in parentheses `(name)` to organize routes without affecting URL structure

**Example**:
```
app/
├── (marketing)/
│   ├── page.tsx           # URL: /
│   ├── pricing/page.tsx   # URL: /pricing
│   └── layout.tsx         # Marketing layout
├── (protected)/
│   ├── dashboard/page.tsx # URL: /dashboard
│   └── layout.tsx         # Dashboard layout
```

**Benefits**:
- Logical organization
- Different layouts for different sections
- Shared middleware/auth logic
- Doesn't pollute URLs

**When to use**: Group routes with similar layouts or authentication requirements

---

### Loading States

**Definition**: Special file (`loading.tsx`) that shows while page is loading

**Example**:
```typescript
// app/dashboard/properties/loading.tsx

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-1/3" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
```

**Behavior**:
- Automatically shown while page data is loading
- Uses React Suspense under the hood
- Can be nested (layout-level or page-level)

---

### Error Boundaries

**Definition**: Special file (`error.tsx`) that catches errors in page or layout

**Example**:
```typescript
// app/dashboard/error.tsx
'use client'; // Must be Client Component

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

**When errors occur**:
- Automatically catches errors in child components
- Shows error UI instead of crashing entire app
- Provides `reset()` function to retry

---

### Metadata & SEO

**Definition**: Functions to define page metadata for SEO

**Static metadata**:
```typescript
export const metadata = {
  title: "Properties - Oikion",
  description: "Manage your real estate properties",
};
```

**Dynamic metadata**:
```typescript
export async function generateMetadata({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id);
  
  return {
    title: `${property.address.street} - Property Details`,
    description: property.description,
    openGraph: {
      images: [property.primaryImage?.url],
    },
  };
}
```

**Benefits**:
- Better SEO
- Social media previews
- Browser tab titles
- Search engine indexing

---

## Routing Patterns

### Dynamic Routes

**Pattern**: Use `[param]` for dynamic segments

**Examples**:
- `app/properties/[id]/page.tsx` → `/properties/abc123`
- `app/blog/[...slug]/page.tsx` → `/blog/guides/getting-started`

**Access params**:
```typescript
export default async function Page({ params }: { params: { id: string } }) {
  console.log(params.id); // "abc123"
}
```

---

### Search Params (Query Strings)

**URL**: `/properties?status=AVAILABLE&type=APARTMENT`

**Access**:
```typescript
export default async function Page({ 
  searchParams 
}: { 
  searchParams: { status?: string; type?: string } 
}) {
  console.log(searchParams.status); // "AVAILABLE"
  console.log(searchParams.type); // "APARTMENT"
}
```

**Update (Client Component)**:
```typescript
'use client';

import { useRouter, useSearchParams } from "next/navigation";

export function Filter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`);
  }
  
  return <button onClick={() => updateFilter('status', 'SOLD')}>Show Sold</button>;
}
```

---

### Parallel Routes

**Definition**: Render multiple pages in the same layout simultaneously

**Use case**: Dashboard with multiple sections that load independently

**Pattern**: Use `@slot` folders
```
app/dashboard/
├── @analytics/
│   └── page.tsx
├── @recent/
│   └── page.tsx
├── layout.tsx
└── page.tsx
```

**Layout usage**:
```typescript
export default function Layout({
  children,
  analytics,
  recent,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  recent: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <div className="grid grid-cols-2 gap-4">
        <div>{analytics}</div>
        <div>{recent}</div>
      </div>
    </div>
  );
}
```

---

## Data Fetching Patterns

### Fetch in Server Components (Preferred)

```typescript
// Direct database access
const properties = await prismaForOrg(orgId).property.findMany();

// External API
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 } // Cache for 1 hour
});
```

---

### Streaming with Suspense

**Pattern**: Load slow data progressively

```typescript
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Loads immediately */}
      <QuickStats />
      
      {/* Streams in when ready */}
      <Suspense fallback={<Skeleton />}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}

async function SlowComponent() {
  const data = await slowDatabaseQuery(); // Takes 2-3 seconds
  return <div>{data}</div>;
}
```

---

### Parallel Data Fetching

```typescript
export default async function Page() {
  // ✅ Fetch in parallel (fast)
  const [properties, clients, activities] = await Promise.all([
    getProperties(),
    getClients(),
    getActivities(),
  ]);
  
  return <Dashboard data={{ properties, clients, activities }} />;
}
```

---

## Navigation Patterns

### Link Component (Prefetching)

```typescript
import Link from "next/link";

<Link href="/dashboard/properties" prefetch={true}>
  View Properties
</Link>
```

**Benefits**:
- Prefetches linked pages on hover
- Faster navigation
- Preserves scroll position

---

### Programmatic Navigation

```typescript
'use client';

import { useRouter } from "next/navigation";

export function CreateButton() {
  const router = useRouter();
  
  async function handleCreate() {
    const result = await createProperty(data);
    
    if (result.success) {
      router.push(`/dashboard/properties/${result.data.id}`);
    }
  }
  
  return <button onClick={handleCreate}>Create</button>;
}
```

---

### Redirects (Server)

```typescript
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login"); // Server-side redirect
  }
  
  return <div>Protected content</div>;
}
```

---

## Best Practices Summary

### ✅ DO
- Use Server Components by default
- Fetch data in Server Components
- Push `'use client'` to leaf components
- Use TypeScript for all components
- Define metadata for SEO
- Use `loading.tsx` for loading states
- Use `error.tsx` for error handling
- Use route groups for organization
- Prefetch with `<Link>`

### ❌ DON'T
- Don't mark components `'use client'` unnecessarily
- Don't fetch data in Client Components (use Server Components)
- Don't use Pages Router patterns (this is App Router)
- Don't ignore TypeScript errors
- Don't skip loading/error states
- Don't forget metadata for public pages

---

## Related Files

- [frontend.md](../rules/frontend.md) - Complete frontend rules
- [typescript.md](../rules/typescript.md) - TypeScript patterns
- [api-server-actions.md](../rules/api-server-actions.md) - Data mutations

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/react/use-server)
- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing)
