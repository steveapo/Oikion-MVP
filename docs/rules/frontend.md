# Frontend Architecture & Component Rules

## Overview
This document defines frontend architecture, React component patterns, Next.js App Router conventions, and UI development standards for the Oikion application. All frontend code must follow these patterns to ensure performance, maintainability, and accessibility.

## Technology Stack

### Core Framework
- **Next.js**: 14.2.5 with App Router
- **React**: 18.3.1 (Server Components default)
- **TypeScript**: 5.5.3
- **Styling**: Tailwind CSS 3.4.6
- **Components**: shadcn/ui (Radix UI + Tailwind)

### Key Libraries
- **Forms**: react-hook-form 7.52+ with @hookform/resolvers
- **Validation**: Zod 3.23+
- **Icons**: lucide-react 0.414+
- **Date**: date-fns 3.6+
- **Theme**: next-themes 0.3+

## App Router Architecture

### Directory Structure

```
app/
├── (auth)/              # Auth route group
│   ├── login/
│   ├── register/
│   └── layout.tsx       # Auth-specific layout
├── (protected)/         # Protected routes (requires auth)
│   ├── dashboard/
│   ├── admin/
│   └── layout.tsx       # Protected layout with sidebar
├── (marketing)/         # Public marketing pages
│   ├── page.tsx         # Homepage
│   ├── pricing/
│   └── layout.tsx       # Marketing layout with navbar
├── (docs)/              # Documentation pages
│   ├── docs/
│   ├── guides/
│   └── layout.tsx       # Docs layout with sidebar
├── api/                 # API routes
│   ├── auth/
│   ├── webhooks/
│   └── ...
├── layout.tsx           # Root layout (providers, fonts, metadata)
└── page.tsx             # Root redirect/landing
```

### Route Groups (parentheses)

**Purpose**: Group routes logically without affecting URL structure

**Pattern:**
```typescript
// app/(protected)/dashboard/page.tsx
// URL: /dashboard (parentheses don't appear in URL)

export default function DashboardPage() {
  // Shares layout with other (protected) routes
}
```

**When to use:**
- Different layouts for different sections
- Logical organization (marketing vs app vs docs)
- Shared middleware/auth requirements

### Layouts (layout.tsx)

**Root Layout (app/layout.tsx):**
```typescript
import { Inter } from "next/font/google";
import { Providers } from "@/components/modals/providers";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**Nested Layout (app/(protected)/layout.tsx):**
```typescript
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

**Layout Rules:**
- Layouts wrap all child routes
- Can be async (Server Components)
- Fetch shared data once (auth, navigation)
- Use for consistent UI elements (nav, sidebar, footer)

## Server vs Client Components

### Default: Server Components

**All components are Server Components unless marked with `'use client'`**

**Server Component Example:**
```typescript
// app/dashboard/properties/page.tsx
// NO 'use client' = Server Component

import { getCurrentUser } from "@/lib/session";
import { getProperties } from "@/actions/properties";
import { PropertyList } from "@/components/properties/property-list";

export default async function PropertiesPage() {
  // ✅ Can directly call server functions
  const user = await getCurrentUser();
  const properties = await getProperties(user.organizationId);
  
  // ✅ Can access environment variables
  const apiUrl = process.env.API_URL;
  
  return (
    <div>
      <h1>Properties</h1>
      <PropertyList properties={properties} />
    </div>
  );
}
```

**Benefits:**
- No JavaScript sent to client
- Direct database access
- Can use Node.js APIs
- Better SEO (fully rendered HTML)
- Faster initial page load

**Limitations:**
- Cannot use hooks (useState, useEffect, etc.)
- Cannot use browser APIs (window, localStorage, etc.)
- Cannot attach event handlers (onClick, onChange, etc.)

### Client Components ('use client')

**When to use:**
- Interactive UI (buttons, forms, modals)
- Browser APIs (localStorage, geolocation)
- React hooks (useState, useEffect, useContext)
- Event handlers (onClick, onChange, onSubmit)
- Third-party libraries requiring browser APIs

**Client Component Example:**
```typescript
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ClientFormProps {
  onSubmit: (data: FormData) => Promise<void>;
}

export function ClientForm({ onSubmit }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    await onSubmit(formData);
    
    setIsSubmitting(false);
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
```

### Composition Pattern (Server + Client)

**Pattern**: Pass server-fetched data to client components

```typescript
// app/dashboard/clients/page.tsx (SERVER)
import { getClients } from "@/actions/clients";
import { ClientsTable } from "@/components/clients/clients-table"; // CLIENT

export default async function ClientsPage() {
  // Server: Fetch data
  const clients = await getClients();
  
  // Pass to client component
  return <ClientsTable clients={clients} />;
}
```

```typescript
// components/clients/clients-table.tsx (CLIENT)
'use client';

import { useState } from "react";
import type { Client } from "@prisma/client";

interface ClientsTableProps {
  clients: Client[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  
  // Client-side sorting
  const sorted = [...clients].sort((a, b) => 
    sortBy === 'name' 
      ? a.name.localeCompare(b.name)
      : a.createdAt.getTime() - b.createdAt.getTime()
  );
  
  return (
    <div>
      <button onClick={() => setSortBy('name')}>Sort by Name</button>
      <button onClick={() => setSortBy('date')}>Sort by Date</button>
      <table>
        {sorted.map(client => (
          <tr key={client.id}>
            <td>{client.name}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```

### Boundary Placement Strategy

**✅ GOOD: Push 'use client' down to leaf components**
```typescript
// page.tsx (SERVER) - fetches data
// └── ClientList (SERVER) - renders structure
//     └── ClientCard (CLIENT) - interactive card
```

**❌ BAD: Top-level 'use client'**
```typescript
// page.tsx (CLIENT) - everything is client-side
// └── ClientList (CLIENT)
//     └── ClientCard (CLIENT)
```

**Rule**: Keep client boundaries as small as possible

## Component Patterns

### 1. Page Components (Server)

**Pattern:**
```typescript
// app/dashboard/properties/[id]/page.tsx

import { notFound } from "next/navigation";
import { getProperty } from "@/actions/properties";
import { PropertyDetail } from "@/components/properties/property-detail";

interface PageProps {
  params: { id: string };
  searchParams: { view?: 'details' | 'media' };
}

export async function generateMetadata({ params }: PageProps) {
  const property = await getProperty(params.id);
  
  return {
    title: `${property.address.street} - Property Details`,
    description: property.description,
  };
}

export default async function PropertyPage({ params, searchParams }: PageProps) {
  const property = await getProperty(params.id);
  
  if (!property) {
    notFound(); // Shows 404 page
  }
  
  return (
    <Container>
      <PropertyDetail 
        property={property} 
        view={searchParams.view ?? 'details'} 
      />
    </Container>
  );
}
```

**Page Rules:**
- Always export `default` async function
- Use `generateMetadata` for SEO
- Handle not found with `notFound()`
- Validate `params` and `searchParams`

### 2. Layout Components

**Use for:**
- Persistent UI (nav, sidebar, footer)
- Shared data fetching (user session, org settings)
- Provider wrapping (theme, modal, toast)

**Pattern:**
```typescript
// app/(protected)/layout.tsx

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user) redirect("/login");
  
  return (
    <>
      <Header user={user} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </>
  );
}
```

### 3. UI Components (shadcn/ui Pattern)

**Located in:** `components/ui/`

**Characteristics:**
- Small, reusable primitives
- Radix UI + Tailwind styling
- Fully typed with TypeScript
- Accessible (ARIA, keyboard nav)

**Example: Button Component**
```typescript
// components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-foreground hover:bg-brand/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
```

**Usage:**
```typescript
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg">
  Click me
</Button>

<Button variant="outline" asChild>
  <Link href="/properties">View Properties</Link>
</Button>
```

### 4. Feature Components

**Located in:** `components/[feature]/`

**Examples:**
- `components/properties/property-card.tsx`
- `components/clients/client-form.tsx`
- `components/contacts/contact-timeline.tsx`

**Pattern: Feature-Specific Component**
```typescript
// components/properties/property-card.tsx
'use client';

import { Property, Address } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface PropertyCardProps {
  property: Property & { address: Address };
  onClick?: (id: string) => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick?.(property.id)}
    >
      <div className="aspect-video bg-neutral-3">
        {/* Image placeholder */}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{property.address.street}</h3>
          <Badge variant="success">{property.status}</Badge>
        </div>
        <p className="text-sm text-text-secondary">
          {property.address.city}, {property.address.region}
        </p>
        <p className="mt-2 text-lg font-bold">
          {formatCurrency(property.price)}
        </p>
      </div>
    </Card>
  );
}
```

### 5. Form Components

**Pattern: react-hook-form + Zod + Server Actions**

```typescript
// components/clients/client-form.tsx
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientInput } from "@/lib/validations/client";
import { createClient } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

export function ClientForm() {
  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });
  
  async function onSubmit(data: ClientInput) {
    const result = await createClient(data);
    
    if (result.success) {
      toast.success("Client created successfully");
      form.reset();
    } else {
      toast.error(result.error || "Failed to create client");
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create Client"}
        </Button>
      </form>
    </Form>
  );
}
```

## Styling Conventions

### Tailwind CSS Patterns

**1. Design System Tokens (CSS Variables)**

```css
/* styles/globals.css */
:root {
  /* Neutrals */
  --neutral-1: 0 0% 100%;
  --neutral-2: 0 0% 98%;
  --neutral-3: 0 0% 96%;
  
  /* Brand */
  --brand: 220 70% 50%;
  --brand-foreground: 0 0% 100%;
  
  /* Semantic */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --destructive: 0 84% 60%;
}

.dark {
  --neutral-1: 0 0% 10%;
  --neutral-2: 0 0% 12%;
  /* ... */
}
```

**2. Component Styling Pattern**

```typescript
// ✅ Use utility classes
<div className="flex items-center justify-between p-4 rounded-lg border border-neutral-3 bg-surface">
  <h2 className="text-lg font-semibold text-text-primary">Title</h2>
  <Badge variant="success">Active</Badge>
</div>

// ✅ Use cn() for conditional classes
import { cn } from "@/lib/utils";

<Button className={cn(
  "w-full",
  isLoading && "opacity-50 pointer-events-none",
  variant === "primary" && "bg-brand"
)}>
  Submit
</Button>

// ❌ Avoid inline styles
<div style={{ padding: '16px', color: 'red' }}>Bad</div>
```

**3. Responsive Design**

```typescript
// ✅ Mobile-first breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>

// Breakpoints:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1440px (custom)
```

### Class Variance Authority (CVA)

**For component variants:**

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-lg border p-4", // base classes
  {
    variants: {
      elevation: {
        e0: "shadow-none",
        e1: "shadow-sm",
        e2: "shadow-md",
      },
      padding: {
        tight: "p-2",
        comfortable: "p-4",
        spacious: "p-6",
      },
    },
    defaultVariants: {
      elevation: "e0",
      padding: "comfortable",
    },
  }
);

interface CardProps extends VariantProps<typeof cardVariants> {
  children: React.ReactNode;
}

export function Card({ elevation, padding, children }: CardProps) {
  return (
    <div className={cardVariants({ elevation, padding })}>
      {children}
    </div>
  );
}
```

## Data Fetching Patterns

### 1. Server Component Data Fetching

```typescript
// app/dashboard/properties/page.tsx

import { getCurrentUser } from "@/lib/session";
import { prismaForOrg } from "@/lib/org-prisma";

export default async function PropertiesPage() {
  const user = await getCurrentUser();
  if (!user?.organizationId) return null;
  
  // Direct database access
  const orgPrisma = prismaForOrg(user.organizationId);
  const properties = await orgPrisma.property.findMany({
    include: { address: true },
    orderBy: { createdAt: 'desc' },
  });
  
  return <PropertyList properties={properties} />;
}
```

### 2. Parallel Data Fetching

```typescript
export default async function DashboardPage() {
  // ✅ Fetch in parallel
  const [user, properties, clients] = await Promise.all([
    getCurrentUser(),
    getProperties(),
    getClients(),
  ]);
  
  return (
    <Dashboard 
      user={user} 
      properties={properties} 
      clients={clients} 
    />
  );
}
```

### 3. Streaming with Suspense

```typescript
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Show immediately */}
      <QuickStats />
      
      {/* Stream in when ready */}
      <Suspense fallback={<Skeleton />}>
        <RecentActivity />
      </Suspense>
      
      <Suspense fallback={<Skeleton />}>
        <Analytics />
      </Suspense>
    </div>
  );
}

async function RecentActivity() {
  const activities = await getRecentActivities(); // Slow query
  return <ActivityFeed activities={activities} />;
}
```

### 4. Client-Side Data Fetching (When Needed)

```typescript
'use client';

import { useState, useEffect } from "react";

export function LiveData() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/live-data');
      const json = await res.json();
      setData(json);
    }
    
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    
    return () => clearInterval(interval);
  }, []);
  
  if (!data) return <Skeleton />;
  
  return <DataDisplay data={data} />;
}
```

## State Management

### 1. Server State (Preferred)

**Use URL search params for filters/pagination:**

```typescript
// app/properties/page.tsx
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: {
    status?: string;
    type?: string;
    page?: string;
  };
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const filters = {
    status: searchParams.status as PropertyStatus | undefined,
    type: searchParams.type as PropertyType | undefined,
    page: parseInt(searchParams.page ?? '1'),
  };
  
  const properties = await getProperties(filters);
  
  return <PropertyList properties={properties} filters={filters} />;
}
```

**Update URL from client:**

```typescript
'use client';

import { useRouter, useSearchParams } from "next/navigation";

export function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`);
  }
  
  return (
    <select onChange={(e) => updateFilter('status', e.target.value)}>
      <option value="AVAILABLE">Available</option>
      <option value="SOLD">Sold</option>
    </select>
  );
}
```

### 2. UI State (useState)

**For component-local state:**

```typescript
'use client';

export function CollapsibleSection({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        {title}
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}
```

### 3. Global UI State (Context - Use Sparingly)

```typescript
// providers/modal-provider.tsx
'use client';

import { createContext, useContext, useState } from "react";

const ModalContext = createContext<{
  isOpen: boolean;
  open: () => void;
  close: () => void;
} | null>(null);

export function ModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <ModalContext.Provider value={{
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
}
```

**When to use Context:**
- Theme switching (next-themes)
- Modal/toast state
- Global UI preferences
- NOT for data fetching (use Server Components)

## Performance Optimization

### 1. Code Splitting

```typescript
// ✅ Dynamic import for heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/charts/heavy-chart'), {
  loading: () => <Skeleton />,
  ssr: false, // Client-only if needed
});

export function Dashboard() {
  return (
    <div>
      <QuickStats />
      <HeavyChart data={chartData} />
    </div>
  );
}
```

### 2. Image Optimization

```typescript
import Image from "next/image";

// ✅ Use Next.js Image component
<Image
  src={property.imageUrl}
  alt={property.address.street}
  width={800}
  height={600}
  className="rounded-lg"
  priority={isAboveFold} // For hero images
/>

// Configure remote patterns in next.config.js
// images: {
//   remotePatterns: [
//     { protocol: 'https', hostname: 'your-cdn.com' },
//   ],
// }
```

### 3. Memoization

```typescript
'use client';

import { useMemo } from "react";

export function PropertyList({ properties, filters }) {
  // ✅ Expensive computation memoized
  const filtered = useMemo(() => {
    return properties.filter(p => 
      p.status === filters.status &&
      p.price >= filters.minPrice &&
      p.price <= filters.maxPrice
    );
  }, [properties, filters]);
  
  return (
    <div>
      {filtered.map(p => <PropertyCard key={p.id} property={p} />)}
    </div>
  );
}
```

## Accessibility (A11y)

### 1. Semantic HTML

```typescript
// ✅ Proper semantic structure
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/dashboard">Dashboard</a></li>
      <li><a href="/properties">Properties</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Property Details</h1>
    <section>
      <h2>Description</h2>
      <p>...</p>
    </section>
  </article>
</main>

<footer>
  <p>&copy; 2025 Oikion</p>
</footer>
```

### 2. ARIA Attributes

```typescript
// ✅ Descriptive labels
<button aria-label="Close modal" onClick={onClose}>
  <X className="h-4 w-4" />
</button>

<div role="status" aria-live="polite">
  {isLoading ? "Loading..." : `${count} properties found`}
</div>

// ✅ Form accessibility
<label htmlFor="client-name">Name</label>
<input 
  id="client-name" 
  name="name" 
  aria-required="true"
  aria-describedby="name-error"
/>
<span id="name-error" role="alert">
  {errors.name?.message}
</span>
```

### 3. Keyboard Navigation

```typescript
// ✅ Keyboard-accessible interactive elements
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Interactive element
</div>
```

### 4. Focus Management

```typescript
'use client';

import { useRef, useEffect } from "react";

export function Modal({ isOpen, onClose }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);
  
  return (
    <dialog open={isOpen}>
      <h2>Modal Title</h2>
      <button ref={closeButtonRef} onClick={onClose}>
        Close
      </button>
    </dialog>
  );
}
```

## Error Handling & Loading States

### 1. Error Boundaries (error.tsx)

```typescript
// app/dashboard/error.tsx
'use client';

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
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-text-secondary mb-4">{error.message}</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
```

### 2. Loading States (loading.tsx)

```typescript
// app/dashboard/loading.tsx
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

### 3. Inline Loading States

```typescript
'use client';

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button disabled={isPending}>
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isPending ? "Submitting..." : "Submit"}
    </Button>
  );
}
```

## Testing Frontend Components

### 1. Component Tests (Jest + React Testing Library)

```typescript
// __tests__/components/property-card.test.tsx
import { render, screen } from '@testing-library/react';
import { PropertyCard } from '@/components/properties/property-card';

describe('PropertyCard', () => {
  const mockProperty = {
    id: '123',
    price: 250000,
    status: 'AVAILABLE',
    address: {
      street: '123 Main St',
      city: 'Athens',
      region: 'Attica',
    },
  };
  
  it('renders property details', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Athens, Attica')).toBeInTheDocument();
    expect(screen.getByText('€250,000')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<PropertyCard property={mockProperty} onClick={handleClick} />);
    
    screen.getByRole('article').click();
    expect(handleClick).toHaveBeenCalledWith('123');
  });
});
```

## Best Practices Summary

### ✅ DO

- Use Server Components by default
- Push 'use client' boundaries down to leaf components
- Fetch data in Server Components (parallel when possible)
- Use TypeScript for all components
- Follow accessibility standards (ARIA, keyboard nav)
- Use shadcn/ui components for consistency
- Optimize images with Next.js Image component
- Handle loading and error states
- Use URL search params for filters/pagination
- Keep components small and focused

### ❌ DON'T

- Don't mark components 'use client' unnecessarily
- Don't fetch data in Client Components (use Server Components)
- Don't use global state for data (use Server Components)
- Don't ignore TypeScript errors
- Don't use inline styles (use Tailwind)
- Don't create inaccessible interactive elements
- Don't ignore loading/error states
- Don't render large lists without pagination
- Don't use `any` type

## Related Files

- [`app/`](../../app/) - App Router pages and layouts
- [`components/`](../../components/) - React components
- [`components/ui/`](../../components/ui/) - shadcn/ui components
- [`tailwind.config.ts`](../../tailwind.config.ts) - Tailwind configuration
- [`next.config.js`](../../next.config.js) - Next.js configuration

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/react/use-server)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Accessibility Guide (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
