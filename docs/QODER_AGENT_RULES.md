# Qoder Agent System Rules - Next.js SaaS Stripe Starter

## Project Overview

This is a **Next.js 14 SaaS Starter Template** with Stripe integration, designed for building production-ready SaaS applications with authentication, subscriptions, and content management.

### Core Technologies
- **Framework**: Next.js 14.2.5 (App Router)
- **Language**: TypeScript 5.5.3
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Authentication**: Auth.js v5 (NextAuth)
- **Payments**: Stripe
- **Email**: Resend with React Email
- **UI**: Shadcn/ui + Tailwind CSS + Radix UI
- **Content**: Contentlayer2 for MDX processing
- **Package Manager**: pnpm

---

## Architecture & File Structure

### App Router Structure (Next.js 14)
```
app/
├── (auth)/          # Authentication pages (login, register)
├── (docs)/          # Documentation pages
├── (marketing)/     # Public marketing pages
├── (protected)/     # Protected dashboard pages
└── api/             # API routes (NextAuth, webhooks, user)
```

### Key Directories
- `actions/` - Server actions for mutations
- `components/` - React components (organized by feature)
- `config/` - Configuration files (site, subscriptions, nav)
- `lib/` - Utilities, validations, and business logic
- `prisma/` - Database schema and migrations
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions
- `emails/` - React Email templates

---

## Code Style & Standards

### TypeScript Configuration
- **Strict mode**: Partially enabled (`strict: false`, but `strictNullChecks: true`)
- **Module**: ES Next with Node resolution
- **Path aliases**: Use `@/*` for imports from root
- **Target**: ES5 for broad compatibility

### Import Order (Prettier)
**CRITICAL**: Always follow this import order:
```typescript
// 1. React imports
import React from "react";
import { useState } from "react";

// 2. Next.js imports
import { redirect } from "next/navigation";
import Link from "next/link";

// 3. Third-party modules
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 4. Types
import type { User } from "types";

// 5. Environment & Config
import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";

// 6. Lib & utilities
import { cn, absoluteUrl } from "@/lib/utils";
import { stripe } from "@/lib/stripe";

// 7. Hooks
import { useMediaQuery } from "@/hooks/use-media-query";

// 8. UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 9. Other components
import { UserAvatar } from "@/components/shared/user-avatar";

// 10. Styles
import "@/styles/globals.css";

// 11. Relative imports
import { localFunction } from "./utils";
```

### Code Formatting Rules
- **Quotes**: Double quotes (`"`)
- **Semi-colons**: Required (`;`)
- **Trailing commas**: All (`trailingComma: "all"`)
- **Tab width**: 2 spaces
- **Print width**: 80 characters
- **Line endings**: LF
- **Bracket spacing**: true

### Naming Conventions
- **Components**: PascalCase (`UserAuthForm.tsx`)
- **Utilities/Hooks**: camelCase (`useLocalStorage.ts`)
- **Config files**: kebab-case (`site-config.ts`)
- **Server Actions**: camelCase with descriptive names (`generateUserStripe`)
- **Types/Interfaces**: PascalCase (`SubscriptionPlan`)

---

## Component Patterns

### Server Components (Default)
```typescript
// No "use client" directive
export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  return (
    <>
      <DashboardHeader heading="Dashboard" text="..." />
      {/* ... */}
    </>
  );
}
```

### Client Components
```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

export function UserAuthForm({ className }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  // ...
}
```

### Component Structure Template
```typescript
import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// 1. Variants definition
const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "...",
        outline: "...",
      },
      size: {
        default: "...",
        sm: "...",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// 2. Props interface
export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {}

// 3. Component with forwardRef (for UI components)
const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <element
        className={cn(componentVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Component.displayName = "Component";

export { Component, componentVariants };
```

---

## Authentication Patterns

### Auth.js v5 Setup
```typescript
// Always use the centralized auth instance
import { auth } from "@/auth";

// In Server Components or Server Actions
const session = await auth();
const user = session?.user;

// Check authentication
if (!user || !user.email) {
  throw new Error("Unauthorized");
}
```

### Protected Routes
- Middleware handles authentication automatically
- Protected routes are in `app/(protected)/`
- Login redirect: `/login`
- Default callback: `/dashboard`

### User Role Management
```typescript
import { UserRole } from "@prisma/client";

// User roles: USER, ADMIN
session.user.role; // Typed with UserRole enum
```

---

## Database & Prisma Patterns

### Database Access
```typescript
import { prisma } from "@/lib/db";

// Always use transactions for multi-step operations
const user = await prisma.user.update({
  where: { id: userId },
  data: { name: newName },
});
```

### Schema Conventions
- **Table names**: Lowercase plural (`users`, `accounts`)
- **Foreign keys**: Indexed for performance
- **Timestamps**: `created_at`, `updated_at` (snake_case)
- **Stripe fields**: Prefixed with `stripe_*`

---

## Stripe Integration Patterns

### Environment Variables
```typescript
// Client-side (NEXT_PUBLIC_*)
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID
NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID

// Server-side
STRIPE_API_KEY
STRIPE_WEBHOOK_SECRET
```

### Subscription Flow Pattern
```typescript
// 1. Check existing subscription
const subscriptionPlan = await getUserSubscriptionPlan(userId);

// 2. Create appropriate Stripe session
if (subscriptionPlan.isPaid) {
  // Billing portal for existing customers
  const stripeSession = await stripe.billingPortal.sessions.create({
    customer: subscriptionPlan.stripeCustomerId,
    return_url: billingUrl,
  });
} else {
  // Checkout for new customers
  const stripeSession = await stripe.checkout.sessions.create({
    // ... configuration
  });
}

// 3. Redirect to Stripe
redirect(stripeSession.url);
```

### Webhook Handling
- Location: `app/api/webhooks/stripe/route.ts`
- Verify webhook signature using `STRIPE_WEBHOOK_SECRET`
- Handle events: `customer.subscription.*`, `invoice.payment_*`

---

## Server Actions Best Practices

### Server Action Pattern
```typescript
"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateUserName(name: string) {
  // 1. Authenticate
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 2. Validate input
  const validatedData = userNameSchema.parse({ name });

  // 3. Perform mutation
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: validatedData.name },
  });

  // 4. Revalidate cache
  revalidatePath("/dashboard/settings");
}
```

### Return Types
```typescript
export type ResponseAction = {
  status: "success" | "error";
  message?: string;
  data?: any;
};
```

---

## Validation Patterns (Zod)

### Schema Location
- Place in `lib/validations/`
- Group by feature (`auth.ts`, `user.ts`)

### Schema Pattern
```typescript
import * as z from "zod";

export const userNameSchema = z.object({
  name: z.string().min(3).max(32),
});

export type UserNameInput = z.infer<typeof userNameSchema>;
```

### Form Integration
```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(userAuthSchema),
});
```

---

## Styling & UI Guidelines

### Tailwind CSS Patterns
```typescript
// Use cn() utility for conditional classes
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  variant === "primary" && "variant-classes",
  className
)} />
```

### Color System (CSS Variables)
```css
--background: hsl(...)
--foreground: hsl(...)
--primary: hsl(...)
--primary-foreground: hsl(...)
--secondary: hsl(...)
--muted: hsl(...)
--accent: hsl(...)
--destructive: hsl(...)
--border: hsl(...)
--input: hsl(...)
--ring: hsl(...)
```

### Dark Mode
- Managed by `next-themes`
- Use `class` strategy: `darkMode: ["class"]`
- Toggle via `<ThemeProvider>` and `<ModeToggle>`

### Custom Fonts
```typescript
// Defined in assets/fonts/index.ts
fontSans       // Default sans-serif
fontUrban      // Urban display font
fontHeading    // Heading font
fontGeist      // Geist mono
```

---

## Content Management (MDX)

### Content Types (Contentlayer)
1. **Doc** - Documentation (`docs/**/*.mdx`)
2. **Guide** - Guides (`guides/**/*.mdx`)
3. **Post** - Blog posts (`blog/**/*.mdx`)
4. **Page** - Static pages (`pages/**/*.mdx`)

### Frontmatter Fields
```yaml
---
title: "Required Title"
description: "Optional description"
date: 2024-01-01
published: true
image: "/path/to/image.jpg"  # For posts
authors: ["author-slug"]      # For posts
categories: ["news"]          # For posts
---
```

### MDX Processing Pipeline
- **Remark**: `remark-gfm` for GitHub Flavored Markdown
- **Rehype**: `rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code`
- **Syntax Highlighting**: `shiki` with `github-dark` theme

---

## Email (Resend + React Email)

### Email Component Pattern
```typescript
import { Button, Html } from "@react-email/components";

export default function MagicLinkEmail({ url }: { url: string }) {
  return (
    <Html>
      {/* Email content */}
      <Button href={url}>Sign in</Button>
    </Html>
  );
}
```

### Sending Emails
```typescript
import { resend } from "@/lib/email";

await resend.emails.send({
  from: env.EMAIL_FROM,
  to: user.email,
  subject: "...",
  react: EmailComponent({ ...props }),
});
```

---

## Environment Variables

### Required Variables
```bash
# Authentication
AUTH_SECRET=                    # Generated secret (32+ chars)
GOOGLE_CLIENT_ID=              # Google OAuth
GOOGLE_CLIENT_SECRET=          # Google OAuth
GITHUB_OAUTH_TOKEN=            # GitHub OAuth

# Database
DATABASE_URL=                  # PostgreSQL connection string

# Email
RESEND_API_KEY=               # Resend API key
EMAIL_FROM=                   # Sender email

# Stripe
STRIPE_API_KEY=               # Secret key
STRIPE_WEBHOOK_SECRET=        # Webhook signing secret

# Plan IDs (NEXT_PUBLIC_*)
NEXT_PUBLIC_APP_URL=                           # App URL
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID=       # Price ID
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID=        # Price ID
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID=  # Price ID
NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID=   # Price ID
```

### Type-Safe Environment
- Validated via `@t3-oss/env-nextjs` in `env.mjs`
- Zod schemas enforce types
- Import as: `import { env } from "@/env.mjs";`

---

## Error Handling

### Error Handling Pattern
```typescript
try {
  // Operation
} catch (error) {
  // Log error (in production, use proper logging)
  console.error(error);
  
  // Return user-friendly message
  return {
    status: "error",
    message: "User-friendly error message",
  };
}
```

### Toast Notifications
```typescript
import { toast } from "sonner";

// Success
toast.success("Title", {
  description: "Details...",
});

// Error
toast.error("Error title", {
  description: "Error details...",
});
```

---

## Performance Optimization

### Image Optimization
```typescript
import Image from "next/image";

// Always specify width/height or fill
<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  className="..."
/>

// Allowed remote patterns (next.config.js)
// - avatars.githubusercontent.com
// - lh3.googleusercontent.com
// - randomuser.me
```

### Metadata Generation
```typescript
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "Page Title – SaaS Starter",
  description: "Page description",
  image: "/custom-og.jpg",
});
```

### Dynamic OG Images
- API route: `app/api/og/route.tsx`
- Uses `@vercel/og` with `ImageResponse`

---

## Testing & Development

### Development Commands
```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm email        # Email development server (port 3333)
```

### Database Commands
```bash
pnpm postinstall          # Generates Prisma client (auto-run)
npx prisma db push        # Push schema changes
npx prisma generate       # Generate Prisma client
npx prisma migrate dev    # Create migration
npx prisma studio         # Open Prisma Studio
```

### Update Dependencies
```bash
# Uses npm-check-updates
ncu -i --format group
```

---

## Security Best Practices

### Never Expose
- API keys in client components
- Database credentials
- Webhook secrets
- Auth secrets

### Always Validate
- User input with Zod schemas
- Environment variables at startup
- Webhook signatures from Stripe
- User sessions in protected routes

### Use Server Actions For
- Database mutations
- Payment processing
- Email sending
- Sensitive operations

---

## Common Utilities

### Utility Functions (`lib/utils.ts`)
```typescript
cn()                  // Merge Tailwind classes
formatDate()          // Format dates
absoluteUrl()         // Generate absolute URLs
timeAgo()            // Relative time formatting
nFormatter()         // Number formatting (1.2k, 1.2M)
capitalize()         // Capitalize strings
truncate()           // Truncate strings
getBlurDataURL()     // Generate blur placeholders
```

### Custom Hooks (`hooks/`)
```typescript
useIntersectionObserver  // Viewport intersection
useLocalStorage         // Persistent state
useLockBody            // Disable body scroll
useMediaQuery          // Responsive breakpoints
useMounted             // Client-side rendering check
useScroll              // Scroll position tracking
```

---

## Deployment Checklist

### Pre-Deployment
1. ✅ Set all production environment variables
2. ✅ Update `NEXT_PUBLIC_APP_URL` to production URL
3. ✅ Switch Stripe keys from test to live mode
4. ✅ Configure production database (Neon)
5. ✅ Run `pnpm build` to check for errors
6. ✅ Test authentication flows
7. ✅ Verify webhook endpoints are accessible
8. ✅ Update OAuth redirect URIs

### Vercel Deployment
- Auto-deploys from Git
- Configure environment variables in Vercel dashboard
- Prisma generates automatically via `postinstall`

---

## Key Design Decisions

### Why These Choices?
- **App Router**: Latest Next.js features, RSC by default
- **Prisma**: Type-safe database access, great DX
- **Auth.js v5**: Most popular Next.js auth solution
- **Shadcn/ui**: Unstyled, customizable components
- **Stripe**: Industry-standard payment processing
- **Contentlayer**: Type-safe MDX with great DX
- **pnpm**: Fast, disk-efficient package manager

### Architectural Patterns
- **Server Components First**: Use client components only when needed
- **Server Actions**: Preferred over API routes for mutations
- **Type Safety**: TypeScript everywhere, Zod for runtime validation
- **Separation of Concerns**: Clear directory structure
- **Configuration Over Code**: Centralized config files

---

## Troubleshooting Guide

### Common Issues

**Build Errors**
- Check TypeScript errors: `pnpm tsc --noEmit`
- Verify environment variables are set
- Ensure Prisma client is generated

**Authentication Issues**
- Verify `AUTH_SECRET` is set and unique
- Check OAuth redirect URIs match exactly
- Ensure database connection is working

**Stripe Integration**
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Verify webhook secret matches
- Check price IDs are correct

**Database Connection**
- Verify `DATABASE_URL` format
- Check Neon project is active
- Run `npx prisma db push` to sync schema

---

## Code Review Checklist

### Before Committing
- [ ] Imports follow the defined order
- [ ] TypeScript has no errors
- [ ] Server actions have proper auth checks
- [ ] Client components marked with `"use client"`
- [ ] Tailwind classes use `cn()` utility
- [ ] Environment variables accessed via `env.mjs`
- [ ] Forms validated with Zod schemas
- [ ] Images use Next.js `<Image>` component
- [ ] Metadata properly defined for SEO
- [ ] Error handling implemented
- [ ] Toast notifications for user feedback

---

## Resources & Documentation

### Official Docs
- [Next.js 14](https://nextjs.org/docs)
- [Auth.js](https://authjs.dev/)
- [Prisma](https://www.prisma.io/docs)
- [Stripe](https://stripe.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Contentlayer](https://contentlayer.dev/)
- [Resend](https://resend.com/docs)

### Package Documentation
- [@t3-oss/env-nextjs](https://env.t3.gg/)
- [Radix UI](https://www.radix-ui.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

## Version Information

- **Template Version**: 0.3.1
- **Next.js**: 14.2.5
- **React**: 18.3.1
- **TypeScript**: 5.5.3
- **Node**: Recommended LTS (18+)
- **Package Manager**: pnpm

---

## License & Credits

- **License**: MIT
- **Author**: [@miickasmt](https://twitter.com/miickasmt)
- **Inspired by**: Taxonomy (shadcn), Precedent (Steven Tey), Next 13 AI SaaS (Antonio Erdeljac)
