# Auth.js CSRF Token Fix - SignOut Implementation

## Problem

The application was experiencing `MissingCSRF` errors during signout operations:

```
[auth][error] MissingCSRF: CSRF token was missing during an action signout
```

This occurred because Auth.js v5 requires CSRF tokens for all authentication actions, including signout, to prevent Cross-Site Request Forgery attacks.

## Root Causes

1. **Missing `trustHost` configuration** in `auth.ts`
2. **Client-side signOut calls** using `next-auth/react` without proper CSRF handling
3. **Missing `AUTH_URL` environment variable** for CSRF validation

## Solutions Implemented

### 1. Added `trustHost` Configuration

Updated `/auth.ts` to include `trustHost: true`:

```typescript
export const {
  handlers: { GET, POST },
  auth,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  trustHost: true, // ✅ Added this
  providers: [...]
});
```

This tells Auth.js to trust the host header, which is necessary for CSRF token generation in development and production environments.

### 2. Created Server-Side SignOut Action

Created `/actions/signout.ts` as a server action:

```typescript
"use server";

import { signOut } from "@/auth";

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}
```

This ensures signout happens server-side where CSRF tokens are properly handled.

### 3. Updated All Client Components

Replaced all client-side `signOut()` calls from `next-auth/react` with the server action:

**Before:**
```typescript
import { signOut } from "next-auth/react";

signOut({
  callbackUrl: `${window.location.origin}/`,
});
```

**After:**
```typescript
import { handleSignOut } from "@/actions/signout";

await handleSignOut();
```

### 4. Created SignOutButton Component

Created `/components/auth/signout-button.tsx` for reusable signout functionality:

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { handleSignOut } from "@/actions/signout";

export function SignOutButton({ variant = "outline", children }) {
  return (
    <Button 
      variant={variant}
      onClick={async () => {
        await handleSignOut();
      }}
    >
      {children || "Sign Out"}
    </Button>
  );
}
```

### 5. Updated Environment Configuration

Added `AUTH_URL` to `.env.example`:

```env
# Auth.js v5 requires AUTH_URL for CSRF token validation
# In production, set this to your actual domain URL
AUTH_URL=http://localhost:3000
```

## Files Modified

1. `/auth.ts` - Added `trustHost: true` and exported `signOut`
2. `/actions/signout.ts` - Created server action for signout
3. `/components/layout/user-account-nav.tsx` - Updated to use server action
4. `/components/modals/delete-account-modal.tsx` - Updated to use server action
5. `/components/modals/delete-organization-modal.tsx` - Removed unused import
6. `/components/shared/session-error-alert.tsx` - Updated to use server action
7. `/app/(auth)/accept-invite/page.tsx` - Updated to use SignOutButton component
8. `/components/auth/signout-button.tsx` - Created new component
9. `/.env.example` - Added AUTH_URL documentation

## Environment Setup

### Development

Add to your `.env.local`:

```env
AUTH_URL=http://localhost:3000
```

### Production

Set `AUTH_URL` to your production domain:

```env
AUTH_URL=https://yourdomain.com
```

**Important:** Do not include trailing slash in AUTH_URL.

## Why This Works

1. **Server Actions are CSRF-safe**: Server actions in Next.js App Router have built-in CSRF protection
2. **Proper token flow**: Auth.js generates and validates CSRF tokens correctly when using server-side signOut
3. **trustHost allows flexible deployment**: Works across different hosting environments (localhost, Vercel, custom domains)

## Testing

To verify the fix works:

1. Start the development server: `pnpm dev`
2. Sign in to the application
3. Try signing out from:
   - User dropdown menu (desktop)
   - User drawer menu (mobile)
   - Accept invite page (email mismatch scenario)
   - After deleting account
4. Verify no CSRF errors appear in console

## Migration Guide

If you have custom components that use signOut, update them:

```typescript
// ❌ Old way (causes CSRF error)
import { signOut } from "next-auth/react";
<button onClick={() => signOut()}>Sign Out</button>

// ✅ New way (CSRF-safe)
import { SignOutButton } from "@/components/auth/signout-button";
<SignOutButton>Sign Out</SignOutButton>

// ✅ Or use the server action directly
import { handleSignOut } from "@/actions/signout";
<button onClick={async () => await handleSignOut()}>Sign Out</button>
```

## References

- [Auth.js CSRF Error Documentation](https://errors.authjs.dev#missingcsrf)
- [Auth.js v5 Configuration](https://authjs.dev/getting-started/installation)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

## Additional Notes

- This fix is compatible with Auth.js v5 (next-auth v5.0.0-beta)
- The `trustHost` option is required for production deployments on platforms like Vercel
- Server actions provide better security than client-side signout calls
- All existing functionality (redirects, callbacks) is preserved
