# CSRF SignOut Error - Resolution Summary

## Issue
`MissingCSRF: CSRF token was missing during an action signout` error occurring in Auth.js v5 when users attempt to sign out.

## Resolution Status
✅ **RESOLVED**

## Changes Made

### 1. Core Authentication Configuration
- **File**: `auth.ts`
- **Changes**: 
  - Added `trustHost: true` to NextAuth configuration
  - Exported `signOut` function for server-side use

### 2. Server Action for SignOut
- **File**: `actions/signout.ts` (NEW)
- **Purpose**: Server-side signout handler with proper CSRF protection

### 3. Reusable SignOut Component
- **File**: `components/auth/signout-button.tsx` (NEW)
- **Purpose**: Client component that triggers server-side signout

### 4. Updated Client Components
All components now use the server action instead of client-side signOut:
- `components/layout/user-account-nav.tsx`
- `components/modals/delete-account-modal.tsx`
- `components/modals/delete-organization-modal.tsx`
- `components/shared/session-error-alert.tsx`
- `app/(auth)/accept-invite/page.tsx`

### 5. Environment Configuration
- **File**: `.env.example`
- **Added**: `AUTH_URL` documentation for CSRF validation

## Why It Happened

Auth.js v5 requires:
1. **CSRF tokens** for all authentication actions (including signout)
2. **Proper host configuration** via `trustHost` or `AUTH_URL`
3. **Server-side execution** for secure signout operations

The app was using client-side `signOut()` from `next-auth/react`, which doesn't properly handle CSRF tokens in all scenarios.

## How It's Fixed

1. **Server Actions**: SignOut now happens server-side where CSRF tokens are automatically handled
2. **trustHost**: Allows Auth.js to properly validate requests across different environments
3. **Centralized Logic**: Single source of truth for signout behavior via `actions/signout.ts`

## Required Environment Variable

Add to your `.env.local`:

```env
AUTH_URL=http://localhost:3000
```

For production, set it to your actual domain (e.g., `https://yourdomain.com`).

## Testing Checklist

- [x] User can sign out from dropdown menu (desktop)
- [x] User can sign out from drawer menu (mobile)
- [x] Sign out works from accept-invite page
- [x] Sign out works after account deletion
- [x] No CSRF errors in console
- [x] Proper redirect to home page after signout

## Documentation

See `docs/AUTH_SIGNOUT_CSRF_FIX.md` for detailed technical documentation.

## Future Considerations

- All new signout implementations should use `handleSignOut` server action
- Avoid using `signOut()` from `next-auth/react` in client components
- Use `<SignOutButton>` component for consistent UI/UX

---

**Date Resolved**: 2025-10-18  
**Auth.js Version**: 5.0.0-beta (via @auth/core@0.32.0)  
**Next.js Version**: 14.2.5
