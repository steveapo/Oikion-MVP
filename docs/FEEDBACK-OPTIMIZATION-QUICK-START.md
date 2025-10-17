# Feedback Optimization - Quick Start Guide

**For Developers**: This guide shows you how to use the new feedback optimization infrastructure in your code.

---

## 🎯 Quick Reference

### Server Actions - New Pattern

```typescript
// Import the utilities
import { requireAuth } from "@/lib/auth-utils";
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode,
  zodErrorsToValidationErrors 
} from "@/lib/action-response";
import { TOAST_ERROR } from "@/lib/toast-messages";

// Your action function
export async function createProperty(
  data: PropertyFormData
): Promise<ActionResponse<{ propertyId: string }>> {
  
  // 1️⃣ Authentication (replaces 5-10 lines of boilerplate)
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult; // Typed user with id, email, role, organizationId

  // 2️⃣ Validation (use safeParse instead of parse)
  const result = propertyFormSchema.safeParse(data);
  if (!result.success) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      TOAST_ERROR.PROPERTY_CREATE_FAILED,
      { validationErrors: zodErrorsToValidationErrors(result.error) }
    );
  }
  const validatedData = result.data;

  // 3️⃣ Business logic with error handling
  try {
    const db = prismaForOrg(user.organizationId);
    const property = await db.property.create({
      data: { ...validatedData, createdBy: user.id }
    });
    
    revalidatePath("/dashboard/properties");
    return createSuccessResponse({ propertyId: property.id });
    
  } catch (error) {
    console.error("Failed to create property:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      TOAST_ERROR.PROPERTY_CREATE_FAILED
    );
  }
}
```

---

## 📋 Frontend - Form Handling

### Modal with Loading State

```typescript
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TOAST_SUCCESS, TOAST_ERROR } from "@/lib/toast-messages";
import { createProperty } from "@/actions/properties";

export function PropertyCreateDialog() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    
    const result = await createProperty(data);
    
    if (result.success) {
      toast.success(TOAST_SUCCESS.PROPERTY_CREATED);
      setIsOpen(false); // Close modal only on success
      form.reset();
    } else if (result.validationErrors) {
      // Map validation errors to form fields
      Object.entries(result.validationErrors).forEach(([field, message]) => {
        form.setError(field as any, { 
          message: Array.isArray(message) ? message[0] : message 
        });
      });
      toast.error(TOAST_ERROR.VALIDATION_FAILED);
    } else {
      // Generic error
      toast.error(result.error);
    }
    
    setIsSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Form fields */}
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Creating..." : "Create Property"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Optimistic UI for Delete/Archive

```typescript
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TOAST_SUCCESS, TOAST_ERROR } from "@/lib/toast-messages";
import { archiveProperty } from "@/actions/properties";

export function PropertyCard({ property, onArchive }: Props) {
  const [isArchiving, setIsArchiving] = useState(false);

  async function handleArchive() {
    setIsArchiving(true);
    
    // Optimistic update - remove from UI immediately
    onArchive(property.id); // Parent removes from list
    toast.success(TOAST_SUCCESS.PROPERTY_ARCHIVED);
    
    // Call server
    const result = await archiveProperty(property.id);
    
    if (!result.success) {
      // Rollback on error
      onArchive(property.id, "restore"); // Parent restores to list
      toast.error(result.error);
    }
    
    setIsArchiving(false);
  }

  return (
    <Card>
      {/* Card content */}
      <Button 
        onClick={handleArchive} 
        disabled={isArchiving}
        variant="destructive"
      >
        Archive
      </Button>
    </Card>
  );
}
```

---

## 🔑 Auth Utilities Cheat Sheet

### Basic Auth Check

```typescript
const authResult = await requireAuth();
if (!authResult.success) return authResult.error;
const { user } = authResult;
```

### Auth with Permission Check

```typescript
import { UserRole } from "@prisma/client";

const authResult = await requireAuthWithPermissions({
  allowedRoles: [UserRole.ORG_OWNER, UserRole.ADMIN]
});
if (!authResult.success) return authResult.error;
const { user } = authResult;
```

### Auth with Ownership Check

```typescript
// First get the resource to check ownership
const property = await db.property.findUnique({ where: { id } });

const authResult = await requireAuth();
if (!authResult.success) return authResult.error;

const permissionError = checkPermissions(authResult.user, {
  requireOwnership: true,
  ownerId: property.createdBy,
});
if (permissionError) return permissionError;
```

### Permission Helpers

```typescript
import { canCreate, canDelete, canManageMembers } from "@/lib/auth-utils";

if (!canCreate(user.role)) {
  return createErrorResponse(
    ErrorCode.INSUFFICIENT_PERMISSIONS,
    "You don't have permission to create content"
  );
}
```

---

## 💬 Toast Messages

### Using Constants

```typescript
import { TOAST_SUCCESS, TOAST_ERROR, TOAST_INFO } from "@/lib/toast-messages";

// Success
toast.success(TOAST_SUCCESS.PROPERTY_CREATED);

// Error
toast.error(TOAST_ERROR.PROPERTY_CREATE_FAILED);

// Info
toast.info(TOAST_INFO.PROCESSING);
```

### Available Categories

**Properties**: `PROPERTY_CREATED`, `PROPERTY_UPDATED`, `PROPERTY_DELETED`, `PROPERTY_ARCHIVED`  
**Clients**: `CLIENT_CREATED`, `CLIENT_UPDATED`, `CLIENT_DELETED`, `CLIENT_ARCHIVED`  
**Interactions**: `INTERACTION_CREATED`, `INTERACTION_UPDATED`, `INTERACTION_DELETED`  
**Members**: `MEMBER_INVITED`, `MEMBER_ROLE_UPDATED`, `MEMBER_REMOVED`  
**Generic**: `CHANGES_SAVED`, `SETTINGS_UPDATED`

**Errors**: See full list in `lib/toast-messages.ts`

---

## 📊 Error Codes Reference

| Code | When to Use | User Sees |
|------|-------------|-----------|
| `UNAUTHORIZED` | No session or invalid user | "Your session has expired. Please sign in again." |
| `INSUFFICIENT_PERMISSIONS` | User lacks required role | "You don't have permission to perform this action." |
| `VALIDATION_ERROR` | Zod validation fails | "Please check the form for errors." + field errors |
| `NOT_FOUND` | Resource doesn't exist | "The resource you're looking for doesn't exist." |
| `ALREADY_EXISTS` | Unique constraint violation | "This resource already exists." |
| `DATABASE_ERROR` | DB operation fails | "Something went wrong. Please try again." |
| `NETWORK_ERROR` | Fetch/connection fails | "Connection lost. Check your internet connection." |
| `RATE_LIMIT_EXCEEDED` | Too many requests | "Too many requests. Please wait a moment and try again." |

---

## 🎨 Loading States

### Page-Level Loading (Route)

Create `loading.tsx` in the route directory:

```typescript
// app/(protected)/dashboard/my-page/loading.tsx
import { Skeleton } from "@/components/ui/loading-state";
import { Card, CardContent } from "@/components/ui/card";

export default function MyPageLoading() {
  return (
    <div className="space-y-6">
      <Skeleton variant="text" className="h-9 w-48" />
      
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent>
              <Skeleton variant="rectangular" className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Component-Level Loading

```typescript
{isLoading ? (
  <Skeleton variant="text" className="h-6 w-32" />
) : (
  <h2>{title}</h2>
)}
```

### Skeleton Variants

- `variant="text"` - For text content
- `variant="rectangular"` - For boxes, cards, images
- `variant="circular"` - For avatars

---

## 🚫 Empty States

### Using EmptyPlaceholder

```typescript
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { Button } from "@/components/ui/button";

{properties.length === 0 ? (
  <EmptyPlaceholder>
    <EmptyPlaceholder.Icon name="building" />
    <EmptyPlaceholder.Title>No properties found</EmptyPlaceholder.Title>
    <EmptyPlaceholder.Description>
      Add your first listing to get started.
    </EmptyPlaceholder.Description>
    {canCreate && (
      <Button onClick={() => setShowCreateDialog(true)}>
        Add Property
      </Button>
    )}
  </EmptyPlaceholder>
) : (
  <PropertyList properties={properties} />
)}
```

---

## 🛡️ Error Boundary

The protected layout now has an error boundary at `app/(protected)/error.tsx`.

It automatically handles:
- **Auth errors** → Redirects to login
- **Permission errors** → Shows access denied + go back button
- **Not found** → Shows 404 message + navigation options
- **Server errors** → Shows retry + go to dashboard

No additional code needed - errors are caught automatically!

---

## ✅ Validation Error Mapping

### Server-Side (in action)

```typescript
const result = schema.safeParse(data);
if (!result.success) {
  return createErrorResponse(
    ErrorCode.VALIDATION_ERROR,
    TOAST_ERROR.VALIDATION_FAILED,
    { validationErrors: zodErrorsToValidationErrors(result.error) }
  );
}
```

### Client-Side (in component)

```typescript
if (result.validationErrors) {
  Object.entries(result.validationErrors).forEach(([field, message]) => {
    form.setError(field as any, { 
      message: Array.isArray(message) ? message[0] : message 
    });
  });
}
```

### Form Field with Error

```typescript
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input 
          {...field} 
          type="email"
          aria-invalid={!!form.formState.errors.email}
          aria-describedby={form.formState.errors.email ? "email-error" : undefined}
        />
      </FormControl>
      <FormMessage id="email-error" />
    </FormItem>
  )}
/>
```

---

## 🔍 Common Patterns

### Create Action

```typescript
export async function createItem(data: ItemFormData) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  
  const result = itemSchema.safeParse(data);
  if (!result.success) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      TOAST_ERROR.ITEM_CREATE_FAILED,
      { validationErrors: zodErrorsToValidationErrors(result.error) }
    );
  }
  
  try {
    const item = await db.item.create({ data: result.data });
    revalidatePath("/items");
    return createSuccessResponse({ itemId: item.id });
  } catch (error) {
    return createErrorResponse(ErrorCode.DATABASE_ERROR, TOAST_ERROR.ITEM_CREATE_FAILED);
  }
}
```

### Update Action

```typescript
export async function updateItem(id: string, data: Partial<ItemFormData>) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  
  const item = await db.item.findUnique({ where: { id } });
  if (!item) {
    return createErrorResponse(ErrorCode.NOT_FOUND, TOAST_ERROR.ITEM_NOT_FOUND);
  }
  
  const permissionError = checkPermissions(authResult.user, {
    requireOwnership: true,
    ownerId: item.createdBy,
  });
  if (permissionError) return permissionError;
  
  try {
    await db.item.update({ where: { id }, data });
    revalidatePath(`/items/${id}`);
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(ErrorCode.DATABASE_ERROR, TOAST_ERROR.ITEM_UPDATE_FAILED);
  }
}
```

### Delete Action

```typescript
export async function deleteItem(id: string) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  
  const item = await db.item.findUnique({ where: { id } });
  if (!item) {
    return createErrorResponse(ErrorCode.NOT_FOUND, TOAST_ERROR.ITEM_NOT_FOUND);
  }
  
  if (!canDelete(authResult.user.role, item.createdBy === authResult.user.id)) {
    return createErrorResponse(ErrorCode.INSUFFICIENT_PERMISSIONS, TOAST_ERROR.FORBIDDEN);
  }
  
  try {
    await db.item.delete({ where: { id } });
    revalidatePath("/items");
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(ErrorCode.DATABASE_ERROR, TOAST_ERROR.ITEM_DELETE_FAILED);
  }
}
```

---

## 📚 Related Documentation

- **Full Implementation Plan**: `/FEEDBACK-OPTIMIZATION-IMPLEMENTATION.md`
- **Design Document**: See attached design.md in project docs
- **Action Response Types**: `lib/action-response.ts`
- **Auth Utilities**: `lib/auth-utils.ts`
- **Toast Messages**: `lib/toast-messages.ts`
- **Error Boundary**: `app/(protected)/error.tsx`

---

## 🐛 Troubleshooting

### "Property 'success' does not exist on type..."

Make sure your action returns `ActionResponse<T>`:

```typescript
export async function myAction(): Promise<ActionResponse<{ id: string }>> {
  // ...
}
```

### Validation errors not showing in form

1. Check that server action returns `validationErrors` in error response
2. Verify you're mapping them with `form.setError()`
3. Ensure form fields have correct `name` attributes

### Toast not showing

1. Import from correct constants: `TOAST_SUCCESS`, `TOAST_ERROR`
2. Verify Sonner is installed and provider is in layout
3. Check console for errors

### User always shows as unauthorized

1. Verify session exists: `await auth()`
2. Check user has `organizationId` set
3. Ensure middleware allows the route

---

**Need Help?** Check the full implementation plan or ask the team!
