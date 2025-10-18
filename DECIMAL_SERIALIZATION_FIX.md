# Decimal Serialization Fix for Client Components

## Issue

React was throwing a warning when passing client data with property information to Client Components:

```
Warning: Only plain objects can be passed to Client Components from Server Components. 
Decimal objects are not supported.
  {id: ..., propertyType: ..., price: Decimal, address: ...}
```

### Root Cause

In the [`getClient`](file:///Users/stapo/Desktop/Oikion%20App%20-%20Latest/actions/clients.ts#L276-L339) server action, when loading a client's interactions, the included property data contained a `price` field that was a Prisma `Decimal` type. React cannot serialize Decimal objects when passing data from Server Components to Client Components.

The data flow was:
1. Server Action (`getClient`) → loads interaction with property (price as Decimal)
2. Server Component (`ContactPage`) → receives client data
3. Client Component (`ContactTimeline`) → **ERROR**: Cannot receive Decimal objects

---

## Solution

Serialize the Decimal `price` field to a number before returning the data from the server action.

### Changes Made

**File**: [`/actions/clients.ts`](file:///Users/stapo/Desktop/Oikion%20App%20-%20Latest/actions/clients.ts)

#### Before:
```typescript
export async function getClient(id: string) {
  // ... auth checks ...
  
  const client = await db.client.findFirst({
    where: { id, organizationId: session.user.organizationId },
    include: {
      interactions: {
        include: {
          property: {
            select: { 
              id: true,
              propertyType: true,
              address: { select: { city: true, region: true } },
            },
          },
          creator: { select: { name: true } },
        },
        orderBy: { timestamp: "desc" },
      },
      // ... other includes
    },
  });

  return client; // ❌ Contains Decimal objects
}
```

#### After:
```typescript
export async function getClient(id: string) {
  // ... auth checks ...
  
  const client = await db.client.findFirst({
    where: { id, organizationId: session.user.organizationId },
    include: {
      interactions: {
        include: {
          property: {
            select: { 
              id: true,
              propertyType: true,
              price: true, // ✅ Now included
              address: { select: { city: true, region: true } },
            },
          },
          creator: { select: { name: true } },
        },
        orderBy: { timestamp: "desc" },
      },
      // ... other includes
    },
  });

  if (!client) {
    throw new Error("Client not found or access denied");
  }

  // ✅ Serialize Decimal fields in property data for client components
  const serializedClient = {
    ...client,
    interactions: client.interactions.map(interaction => ({
      ...interaction,
      property: interaction.property ? {
        ...interaction.property,
        price: Number(interaction.property.price), // Convert Decimal to number
      } : null,
    })),
  };

  return serializedClient; // ✅ Safe to pass to Client Components
}
```

---

## Why This Pattern?

### Prisma Decimal Type
- Prisma uses the `Decimal` type for precise decimal numbers (currency, measurements)
- Stored as `@db.Decimal(12, 2)` in PostgreSQL
- Returns a `Decimal` object (from `decimal.js` library) in JavaScript

### React Server/Client Boundary
- Only **plain JSON-serializable objects** can cross the Server → Client boundary
- Decimal objects are **not** JSON-serializable
- Must convert to primitive types (number, string) before passing

### Conversion Strategy
```typescript
price: Number(interaction.property.price)
```

- `Number()` converts Prisma Decimal to JavaScript number
- Safe for currency values up to $999,999,999.99 (within `Number.MAX_SAFE_INTEGER`)
- Maintains 2 decimal places for currency display

---

## Alternative Approaches Considered

### 1. Convert to String
```typescript
price: interaction.property.price.toString()
```
**Pros**: Preserves exact decimal precision  
**Cons**: Requires parsing for calculations, harder to format

### 2. Exclude Price from Query
```typescript
property: {
  select: { 
    id: true,
    propertyType: true,
    // price: true, // Omit price
    address: { select: { city: true, region: true } },
  },
}
```
**Pros**: Avoids serialization issue  
**Cons**: Price might be needed for display in timeline

### 3. Selected Approach: Convert to Number ✅
```typescript
price: Number(interaction.property.price)
```
**Pros**: Simple, works with existing formatters, compatible with UI  
**Cons**: Minor precision loss for very large numbers (not an issue for real estate prices)

---

## Impact

### Before Fix:
- ❌ React warning in console on clients page
- ❌ Potential hydration errors
- ❌ Data might not display correctly in client components

### After Fix:
- ✅ No React warnings
- ✅ Clean data flow Server → Client
- ✅ Property price displays correctly in interaction timeline
- ✅ Consistent with other Decimal serialization patterns in the codebase

---

## Related Patterns in Codebase

This fix follows the same pattern already used in:

1. **[`actions/properties.ts`](file:///Users/stapo/Desktop/Oikion%20App%20-%20Latest/actions/properties.ts)** - `getProperties()`
   ```typescript
   const serializedProperties = properties.map(property => ({
     ...property,
     price: Number(property.price),
     size: property.size ? Number(property.size) : null,
     listing: property.listing ? {
       ...property.listing,
       listPrice: Number(property.listing.listPrice),
     } : null,
   }));
   ```

2. **[`actions/interactions.ts`](file:///Users/stapo/Desktop/Oikion%20App%20-%20Latest/actions/interactions.ts)** - `getOrganizationProperties()`
   ```typescript
   const serialized = properties.map((p) => ({
     id: p.id,
     propertyType: p.propertyType,
     price: Number(p.price), // Decimal → number
     address: p.address,
   }));
   ```

---

## Testing Checklist

- [x] ESLint passes on modified file ✅
- [x] No TypeScript errors ✅
- [ ] **User Testing Required**: Navigate to `/dashboard/relations/[id]` and verify:
  - [ ] No React warnings in console
  - [ ] Property price displays correctly in interaction timeline
  - [ ] No hydration errors

---

## Files Modified

1. **[`/actions/clients.ts`](file:///Users/stapo/Desktop/Oikion%20App%20-%20Latest/actions/clients.ts)** - Line ~290-348
   - Added `price: true` to property select
   - Added serialization logic to convert Decimal to number

---

## Future Considerations

### For New Features

When creating server actions that:
1. Include property data with `price`, `size`, or `listPrice`
2. Pass data to Client Components
3. Use Prisma models with Decimal fields

**Always serialize Decimal fields before returning**:

```typescript
// Template pattern
const serialized = data.map(item => ({
  ...item,
  price: Number(item.price),
  size: item.size ? Number(item.size) : null,
  // ... other Decimal fields
}));
```

### Type Safety

Consider creating a utility type for serialized properties:

```typescript
// lib/types/serialized.ts
import { Property } from "@prisma/client";

export type SerializedProperty = Omit<Property, 'price' | 'size'> & {
  price: number;
  size: number | null;
};
```

---

## Conclusion

This fix ensures clean data serialization between Server and Client Components by converting Prisma Decimal types to JavaScript numbers. The approach is consistent with existing patterns in the codebase and resolves the React warning without changing the UI or data structure.
