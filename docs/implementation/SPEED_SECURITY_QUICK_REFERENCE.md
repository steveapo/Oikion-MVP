# Speed & Security Sprint - Developer Quick Reference

## Quick Start

### Using withOrgContext for Multi-Step Operations

**When to use**: Creating/updating records with related data (property + address + listing)

```typescript
import { withOrgContext } from "@/lib/org-prisma";

// ❌ Old way (3 transactions)
const property = await db.property.create(...);
const address = await db.address.create(...);
const listing = await db.listing.create(...);

// ✅ New way (1 transaction)
const result = await withOrgContext(organizationId, async (tx) => {
  const property = await tx.property.create(...);
  const address = await tx.address.create(...);
  const listing = await tx.listing.create(...);
  return { property, address, listing };
});
```

### Using Tag-Based Cache Invalidation

**When to use**: Invalidating cache after mutations

```typescript
import { revalidateTag } from "next/cache";

// ❌ Old way (over-invalidation)
revalidatePath("/dashboard/properties");
revalidatePath(`/dashboard/properties/${id}`);

// ✅ New way (surgical invalidation)
revalidateTag("properties:list");
revalidateTag(`properties:detail:${id}`);
revalidateTag("activities:feed");
```

**Available Tags**:
- `properties:list` - All property lists
- `properties:detail:{id}` - Single property
- `properties:filters` - Filter options
- `clients:list` - All client lists
- `clients:detail:{id}` - Single client
- `clients:tags` - Tag list
- `activities:feed` - Activity feed
- `dashboard:stats` - Dashboard stats

### Using Safe Action Wrapper

**When to use**: Creating new server actions

```typescript
import { safeAction } from "@/lib/actions/safe-action";
import { canCreateContent } from "@/lib/roles";
import { mySchema } from "@/lib/validations/my-schema";

export const myAction = safeAction({
  schema: mySchema,
  roleCheck: (role) => canCreateContent(role),
  handler: async (data, { userId, organizationId, db }) => {
    // Business logic here
    const result = await db.myModel.create({
      data: { ...data, organizationId, createdBy: userId }
    });
    
    return { id: result.id };
  }
});
```

**Benefits**:
- ✅ Automatic auth/org validation
- ✅ Input validation with Zod
- ✅ Role-based authorization
- ✅ Consistent error handling
- ✅ Type-safe context

### Creating Server Components

**When to use**: Building list/card components

```typescript
// PropertyServerCard.tsx (Server Component)
import { formatCurrency, formatLocation } from "@/lib/format-utils";

export function PropertyServerCard({ property, userRole, userId }) {
  // All formatting runs on server
  const price = formatCurrency(property.price);
  const location = formatLocation(property.address?.city, property.address?.region);
  
  return (
    <Card>
      {/* Static HTML */}
      <h3>{location}</h3>
      <p>{price}</p>
      
      {/* Client island for interactions */}
      <PropertyCardActions propertyId={property.id} canEdit={true} />
    </Card>
  );
}
```

```typescript
// PropertyCardActions.tsx (Client Island)
"use client";

export function PropertyCardActions({ propertyId, canEdit }) {
  const handleArchive = async () => {
    await archiveProperty(propertyId);
    router.refresh();
  };
  
  return <DropdownMenu>...</DropdownMenu>;
}
```

### Using Suspense with Skeletons

**When to use**: Loading states for async data

```typescript
import { Suspense } from "react";
import { PropertyListSkeleton } from "@/components/properties/property-card-skeleton";

export default function PropertiesPage() {
  return (
    <Suspense fallback={<PropertyListSkeleton count={6} />}>
      <PropertiesContent />
    </Suspense>
  );
}
```

## Common Patterns

### Pattern 1: Create with Related Data

```typescript
export async function createProperty(data: PropertyFormData) {
  const session = await auth();
  if (!session?.user?.organizationId) throw new Error("Unauthorized");

  const result = await withOrgContext(session.user.organizationId, async (tx) => {
    const property = await tx.property.create({ data: propertyData });
    const address = await tx.address.create({ data: addressData });
    const listing = await tx.listing.create({ data: listingData });
    return property;
  });

  revalidateTag("properties:list");
  revalidateTag("activities:feed");
  
  return { success: true, propertyId: result.id };
}
```

### Pattern 2: Update with Cache Invalidation

```typescript
export async function updateProperty(id: string, data: Partial<PropertyFormData>) {
  const session = await auth();
  if (!session?.user?.organizationId) throw new Error("Unauthorized");

  const result = await withOrgContext(session.user.organizationId, async (tx) => {
    const property = await tx.property.update({ where: { id }, data });
    await tx.address.update({ where: { propertyId: id }, data: addressData });
    return property;
  });

  revalidateTag("properties:list");
  revalidateTag(`properties:detail:${id}`);
  revalidateTag("activities:feed");
  
  return { success: true };
}
```

### Pattern 3: Server Component with Client Island

```typescript
// ServerCard.tsx
export function ServerCard({ data, userRole, userId }) {
  const canEdit = canCreateContent(userRole);
  
  return (
    <Card>
      {/* Server-rendered content */}
      <CardContent>{staticContent}</CardContent>
      
      {/* Client island */}
      <CardFooter>
        <ClientActions id={data.id} canEdit={canEdit} />
      </CardFooter>
    </Card>
  );
}
```

## Formatting Utilities

Use server-side formatting to reduce client bundle:

```typescript
import { 
  formatCurrency,
  formatPropertyType,
  formatLocation,
  formatRelativeDate,
  getStatusBadgeVariant 
} from "@/lib/format-utils";

// ✅ Server component
export function PropertyCard({ property }) {
  return (
    <>
      <h3>{formatPropertyType(property.type)} in {formatLocation(city, region)}</h3>
      <p>{formatCurrency(property.price)}</p>
      <Badge variant={getStatusBadgeVariant(property.status)}>
        {property.status}
      </Badge>
    </>
  );
}

// ❌ Don't import date-fns or format on client
```

## Performance Best Practices

### 1. Minimize Client JavaScript
- ✅ Use server components for static content
- ✅ Extract only interactive parts to client islands
- ✅ Use server-side formatting utilities
- ❌ Don't make entire cards client components

### 2. Cache Strategically
- ✅ Use specific tags for targeted invalidation
- ✅ Invalidate only what changed
- ❌ Don't invalidate entire routes with `revalidatePath`

### 3. Optimize Database Queries
- ✅ Use `withOrgContext` for multi-step operations
- ✅ Leverage new indexes for filtered queries
- ✅ Use minimal projections (select only needed fields)
- ❌ Don't fetch related data if not needed

### 4. Image Optimization
- ✅ Use Next/Image with `sizes` prop
- ✅ Rely on AVIF/WebP automatic conversion
- ✅ Set appropriate `priority` flag
- ❌ Don't load all images eagerly

## Troubleshooting

### Issue: RLS Policy Violation
**Symptom**: Zero rows returned or access denied errors

**Solution**:
```typescript
// ✅ Always use withOrgContext or prismaForOrg
const result = await withOrgContext(orgId, async (tx) => {
  return await tx.property.findMany(...);
});

// ❌ Never use raw prisma client for tenant data
const result = await prisma.property.findMany(...); // WRONG!
```

### Issue: Hydration Mismatch
**Symptom**: Console errors about server/client HTML mismatch

**Solution**:
```typescript
// ✅ Ensure date formatting is consistent
const date = formatRelativeDate(new Date(timestamp)); // Server-side

// ❌ Don't use different formatting on server vs client
```

### Issue: Stale Cache
**Symptom**: Updated data not showing

**Solution**:
```typescript
// ✅ Invalidate all relevant tags
revalidateTag("properties:list");
revalidateTag(`properties:detail:${id}`);
revalidateTag("activities:feed");

// ❌ Don't forget activity feed tag
```

## Migration Checklist

When refactoring existing code:

- [ ] Replace `db.$transaction` with `withOrgContext`
- [ ] Replace `revalidatePath` with `revalidateTag`
- [ ] Extract client components to server + client island
- [ ] Add Suspense boundaries with skeletons
- [ ] Use formatting utilities instead of inline logic
- [ ] Test RLS enforcement
- [ ] Verify cache invalidation
- [ ] Check accessibility (keyboard nav, screen readers)

## Testing

### Unit Test Example
```typescript
import { withOrgContext } from "@/lib/org-prisma";

describe("createProperty", () => {
  it("creates property with related data in single transaction", async () => {
    const result = await createProperty(mockData);
    expect(result.success).toBe(true);
    // Verify only 1 transaction executed
  });
});
```

### RLS Test Example
```typescript
it("prevents cross-tenant access", async () => {
  const orgA = "org-a-id";
  const orgB = "org-b-id";
  
  const propertyA = await withOrgContext(orgA, async (tx) => {
    return await tx.property.create({ data: { organizationId: orgA } });
  });
  
  const result = await withOrgContext(orgB, async (tx) => {
    return await tx.property.findUnique({ where: { id: propertyA.id } });
  });
  
  expect(result).toBeNull(); // Cross-tenant access blocked
});
```

## Resources

- [Full Design Doc](./SPEED_SECURITY_SPRINT_DESIGN.md)
- [Implementation Summary](./SPEED_SECURITY_SPRINT_SUMMARY.md)
- [Always Rules](/rules/always.md)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Prisma Transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)
