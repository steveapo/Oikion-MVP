# API Routes & Server Actions Rules

## Overview
This document defines patterns for API routes and Server Actions in the Oikion application. These are the two primary ways to handle server-side logic in Next.js 14+. Understanding when and how to use each is critical for security, performance, and maintainability.

## When to Use What

### Server Actions (Preferred for Most Cases)

**Use Server Actions for:**
- Form submissions
- Database mutations (create, update, delete)
- Data operations requiring authentication
- Operations called from Server or Client Components
- Type-safe function calls

**Benefits:**
- Type-safe (TypeScript end-to-end)
- No need to create API endpoints
- Automatic CSRF protection
- Better code colocation
- Simpler error handling

### API Routes (Specific Use Cases)

**Use API Routes for:**
- Webhooks (Stripe, external services)
- Public APIs consumed by external clients
- REST endpoints for mobile apps
- OAuth callbacks
- File uploads requiring special handling

**Benefits:**
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Easier to document (OpenAPI/Swagger)
- Familiar REST patterns
- Can be called from anywhere (not just your app)

## Server Actions

### 1. Definition & Structure

**File Location:** `actions/[domain].ts`

**Pattern:**
```typescript
// actions/clients.ts
"use server";

import { auth } from "@/auth";
import { prismaForOrg } from "@/lib/org-prisma";
import { canCreateContent } from "@/lib/roles";
import { clientSchema, type ClientInput } from "@/lib/validations/client";
import { revalidatePath } from "next/cache";

export async function createClient(data: ClientInput) {
  // 1. AUTHENTICATION
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // 2. AUTHORIZATION
  if (!canCreateContent(session.user.role)) {
    return { success: false, error: "Insufficient permissions" };
  }

  if (!session.user.organizationId) {
    return { success: false, error: "No organization found" };
  }

  // 3. VALIDATION
  const result = clientSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  // 4. BUSINESS LOGIC
  try {
    const orgPrisma = prismaForOrg(session.user.organizationId);
    
    const client = await orgPrisma.client.create({
      data: {
        ...result.data,
        organizationId: session.user.organizationId,
        createdBy: session.user.id,
      },
    });

    // 5. ACTIVITY LOGGING
    await orgPrisma.activity.create({
      data: {
        actionType: "CLIENT_CREATED",
        entityType: "CLIENT",
        entityId: client.id,
        actorId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    // 6. CACHE INVALIDATION
    revalidatePath("/dashboard/clients");

    // 7. RETURN
    return { success: true, data: client };
  } catch (error) {
    console.error("Failed to create client:", error);
    return { success: false, error: "Failed to create client" };
  }
}
```

### 2. Server Action Rules

**MUST haves:**
1. **`"use server"` directive** at top of file
2. **Authentication check** (every action)
3. **Authorization check** (role-based permissions)
4. **Input validation** (Zod schemas)
5. **Organization scoping** (`prismaForOrg()`)
6. **Error handling** (try/catch)
7. **Consistent return type** (success/error pattern)
8. **Cache revalidation** (when data changes)

**Return Type Pattern:**
```typescript
// Success/Error discriminated union
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string | Record<string, string[]> };

// Usage
export async function createClient(
  data: ClientInput
): Promise<ActionResult<Client>> {
  // ...
}
```

### 3. Calling Server Actions

**From Server Components:**
```typescript
// app/dashboard/clients/page.tsx (Server Component)
import { getClients } from "@/actions/clients";

export default async function ClientsPage() {
  const result = await getClients();
  
  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }
  
  return <ClientList clients={result.data} />;
}
```

**From Client Components (Forms):**
```typescript
// components/clients/client-form.tsx
'use client';

import { createClient } from "@/actions/clients";
import { toast } from "sonner";

export function ClientForm() {
  async function handleSubmit(formData: FormData) {
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    };
    
    const result = await createClient(data);
    
    if (result.success) {
      toast.success("Client created successfully");
    } else {
      toast.error(result.error);
    }
  }
  
  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" />
      <button type="submit">Create</button>
    </form>
  );
}
```

**With react-hook-form:**
```typescript
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientInput } from "@/lib/validations/client";
import { createClient } from "@/actions/clients";

export function ClientForm() {
  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
  });
  
  async function onSubmit(data: ClientInput) {
    const result = await createClient(data);
    
    if (result.success) {
      toast.success("Client created");
      form.reset();
    } else {
      // Handle field errors
      if (typeof result.error === 'object') {
        Object.entries(result.error).forEach(([field, messages]) => {
          form.setError(field as any, { message: messages[0] });
        });
      } else {
        toast.error(result.error);
      }
    }
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### 4. Transaction Patterns

**Use transactions for atomic operations:**
```typescript
"use server";

export async function createPropertyWithListing(data: PropertyFormData) {
  const session = await auth();
  // ... auth checks
  
  const orgPrisma = prismaForOrg(session.user.organizationId);
  
  try {
    const result = await orgPrisma.$transaction(async (tx) => {
      // 1. Create property
      const property = await tx.property.create({
        data: {
          ...propertyData,
          organizationId: session.user.organizationId,
          createdBy: session.user.id,
        },
      });
      
      // 2. Create address
      await tx.address.create({
        data: {
          propertyId: property.id,
          ...addressData,
        },
      });
      
      // 3. Create listing
      await tx.listing.create({
        data: {
          propertyId: property.id,
          ...listingData,
        },
      });
      
      // 4. Log activity
      await tx.activity.create({
        data: {
          actionType: "PROPERTY_CREATED",
          entityId: property.id,
          // ...
        },
      });
      
      return property;
    });
    
    revalidatePath("/dashboard/properties");
    return { success: true, data: result };
  } catch (error) {
    console.error("Transaction failed:", error);
    return { success: false, error: "Failed to create property" };
  }
}
```

### 5. Error Handling Patterns

**Prisma Errors:**
```typescript
import { Prisma } from "@prisma/client";

try {
  await orgPrisma.client.create({ data });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return { success: false, error: "A client with this email already exists" };
      case 'P2025':
        return { success: false, error: "Record not found" };
      case 'P2003':
        return { success: false, error: "Invalid reference" };
      default:
        console.error("Prisma error:", error.code, error.message);
        return { success: false, error: "Database operation failed" };
    }
  }
  
  console.error("Unexpected error:", error);
  return { success: false, error: "An unexpected error occurred" };
}
```

**Validation Errors:**
```typescript
const result = clientSchema.safeParse(data);

if (!result.success) {
  // Return structured field errors
  return { 
    success: false, 
    error: result.error.flatten().fieldErrors 
  };
  // Returns: { name: ["Required"], email: ["Invalid email"] }
}
```

### 6. Cache Revalidation

**After mutations, revalidate affected paths:**
```typescript
import { revalidatePath, revalidateTag } from "next/cache";

// Revalidate specific path
revalidatePath("/dashboard/clients");

// Revalidate with type
revalidatePath("/dashboard/clients", "page");

// Revalidate layout (affects all nested pages)
revalidatePath("/dashboard", "layout");

// Revalidate by tag (if using fetch with tags)
revalidateTag("clients");
```

**When to revalidate:**
- After creating records (revalidate list page)
- After updating records (revalidate list + detail pages)
- After deleting records (revalidate list page)
- After bulk operations (revalidate affected pages)

### 7. Optimistic Updates (Advanced)

**Pattern:**
```typescript
'use client';

import { useOptimistic } from "react";
import { deleteClient } from "@/actions/clients";

export function ClientList({ initialClients }) {
  const [clients, optimisticDelete] = useOptimistic(
    initialClients,
    (state, deletedId: string) => state.filter(c => c.id !== deletedId)
  );
  
  async function handleDelete(id: string) {
    // Optimistically remove from UI
    optimisticDelete(id);
    
    // Perform actual deletion
    const result = await deleteClient(id);
    
    if (!result.success) {
      // UI will revert automatically
      toast.error(result.error);
    }
  }
  
  return (
    <div>
      {clients.map(client => (
        <ClientCard 
          key={client.id} 
          client={client}
          onDelete={() => handleDelete(client.id)}
        />
      ))}
    </div>
  );
}
```

## API Routes

### 1. Route Structure

**File Location:** `app/api/[route]/route.ts`

**Pattern:**
```typescript
// app/api/organization/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prismaForOrg } from "@/lib/org-prisma";

// GET /api/organization
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const orgPrisma = prismaForOrg(session.user.organizationId);
    const organization = await orgPrisma.organization.findUnique({
      where: { id: session.user.organizationId },
    });
    
    return NextResponse.json({ organization });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/organization
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    // Validate body with Zod
    const result = organizationSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 }
      );
    }
    
    // Business logic...
    
    return NextResponse.json({ organization }, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 2. Dynamic Routes

**Catch-all parameters:**
```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

**Single dynamic parameter:**
```typescript
// app/api/properties/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const propertyId = params.id;
  
  // Fetch property by ID
  const property = await orgPrisma.property.findUnique({
    where: { id: propertyId },
  });
  
  if (!property) {
    return NextResponse.json(
      { error: "Property not found" },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ property });
}
```

### 3. Webhook Handlers

**Stripe Webhook Example:**
```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  // 1. Get raw body (required for signature verification)
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event;

  try {
    // 2. Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 3. Handle events
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }
      
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // 4. Always return 200 to acknowledge receipt
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Webhook handler failed:", error);
    // Still return 200 to prevent retries for code errors
    return new Response(null, { status: 200 });
  }
}

async function handleCheckoutCompleted(session: any) {
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );
  
  await prisma.user.update({
    where: { id: session?.metadata?.userId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}
```

**Webhook Best Practices:**
1. **Always verify signatures** (prevent spoofing)
2. **Use raw body** for signature verification
3. **Return 200 quickly** (acknowledge receipt)
4. **Handle idempotently** (webhooks may retry)
5. **Log unhandled events** (for debugging)
6. **Don't throw on business logic errors** (causes retries)

### 4. File Upload Handlers

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      );
    }
    
    // Process file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save to storage (adjust for your setup)
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(process.cwd(), "public/uploads", filename);
    await writeFile(filepath, buffer);
    
    const url = `/uploads/${filename}`;
    
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
```

### 5. Rate Limiting (Future Enhancement)

```typescript
// lib/rate-limit.ts
import { headers } from "next/headers";

const rateLimit = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimit.get(identifier);
  
  if (!record || record.resetAt < now) {
    rateLimit.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: limit - record.count };
}

// Usage in API route
export async function POST(request: NextRequest) {
  const ip = headers().get("x-forwarded-for") || "unknown";
  const { allowed, remaining } = checkRateLimit(ip, 10, 60000);
  
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }
  
  // Process request...
}
```

## Security Best Practices

### 1. Authentication Check Pattern

```typescript
// Every server action and API route
const session = await auth();

if (!session?.user?.id) {
  return { success: false, error: "Unauthorized" };
  // or: return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### 2. Authorization Check Pattern

```typescript
import { canCreateContent, canDeleteContent } from "@/lib/roles";

// Create operations
if (!canCreateContent(session.user.role)) {
  return { success: false, error: "Insufficient permissions" };
}

// Delete operations
const isOwner = resource.createdBy === session.user.id;
if (!canDeleteContent(session.user.role, isOwner)) {
  return { success: false, error: "Insufficient permissions" };
}
```

### 3. Input Validation (Always)

```typescript
import { z } from "zod";

// Define schema
const schema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
});

// Validate input
const result = schema.safeParse(input);
if (!result.success) {
  return { success: false, error: result.error.flatten() };
}

// Use validated data
const validatedData = result.data;
```

### 4. Organization Scoping (ALWAYS)

```typescript
// ALWAYS use prismaForOrg for tenant data
const orgPrisma = prismaForOrg(session.user.organizationId);

// NEVER use global prisma for tenant data
// ❌ BAD: const clients = await prisma.client.findMany();
// ✅ GOOD: const clients = await orgPrisma.client.findMany();
```

### 5. Error Messages (Don't Leak Info)

```typescript
// ❌ BAD: Exposes internal details
catch (error) {
  return { success: false, error: error.message };
}

// ✅ GOOD: Generic message, log details
catch (error) {
  console.error("Failed to create client:", error);
  return { success: false, error: "Failed to create client" };
}
```

## Testing

### 1. Server Action Tests

```typescript
// __tests__/actions/clients.test.ts
import { createClient } from "@/actions/clients";
import { auth } from "@/auth";
import { prismaForOrg } from "@/lib/org-prisma";

jest.mock("@/auth");
jest.mock("@/lib/org-prisma");

describe("createClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it("should create client with valid data", async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: "user1", role: "AGENT", organizationId: "org1" },
    });
    
    const mockCreate = jest.fn().mockResolvedValue({
      id: "client1",
      name: "Test Client",
    });
    
    (prismaForOrg as jest.Mock).mockReturnValue({
      client: { create: mockCreate },
    });
    
    const result = await createClient({
      name: "Test Client",
      clientType: "PERSON",
    });
    
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ name: "Test Client" });
  });
  
  it("should reject unauthorized users", async () => {
    (auth as jest.Mock).mockResolvedValue(null);
    
    const result = await createClient({
      name: "Test Client",
      clientType: "PERSON",
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });
});
```

### 2. API Route Tests

```typescript
// __tests__/api/organization.test.ts
import { GET } from "@/app/api/organization/route";
import { NextRequest } from "next/server";

describe("GET /api/organization", () => {
  it("should return organization for authenticated user", async () => {
    const request = new NextRequest("http://localhost:3000/api/organization");
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("organization");
  });
});
```

## Performance Optimization

### 1. Parallel Operations

```typescript
// ✅ Fetch in parallel
const [properties, clients, activities] = await Promise.all([
  getProperties(orgId),
  getClients(orgId),
  getActivities(orgId),
]);

// ❌ Sequential (slow)
const properties = await getProperties(orgId);
const clients = await getClients(orgId);
const activities = await getActivities(orgId);
```

### 2. Selective Revalidation

```typescript
// ✅ Revalidate only affected paths
revalidatePath(`/dashboard/clients/${clientId}`);
revalidatePath("/dashboard/clients");

// ❌ Over-revalidation (slow)
revalidatePath("/dashboard", "layout"); // Revalidates everything
```

## Common Patterns Summary

### Server Action Checklist
- [ ] `"use server"` directive at top
- [ ] Authentication check
- [ ] Authorization check (role-based)
- [ ] Input validation (Zod)
- [ ] Organization scoping (`prismaForOrg`)
- [ ] Error handling (try/catch)
- [ ] Consistent return type (success/error)
- [ ] Activity logging (for audit trail)
- [ ] Cache revalidation (after mutations)
- [ ] Type-safe parameters and return

### API Route Checklist
- [ ] Authentication check
- [ ] Authorization check
- [ ] Input validation
- [ ] Proper HTTP status codes
- [ ] Error handling
- [ ] NextResponse for JSON responses
- [ ] Rate limiting (for public endpoints)
- [ ] CORS headers (if needed)

## Related Files

- [`actions/`](../../actions/) - Server Actions
- [`app/api/`](../../app/api/) - API Routes
- [`lib/validations/`](../../lib/validations/) - Zod schemas
- [`lib/roles.ts`](../../lib/roles.ts) - Authorization helpers
- [`lib/session.ts`](../../lib/session.ts) - Session management

## Resources

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Zod Documentation](https://zod.dev/)
- [Stripe Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
