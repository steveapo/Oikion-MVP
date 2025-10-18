# Organization Reload Optimization

## Problem Statement

The organization switcher was unnecessarily reloading organization data every time the user switched windows, tabs, or applications. This caused:

1. **Excessive POST requests** - Two POST requests sent on every window/tab focus change
2. **UI flickering** - The org switcher showed skeleton loading state unnecessarily
3. **Poor UX** - Degraded performance and wasted server resources

### Root Cause

The issue was caused by two factors:

1. **`SessionProvider` default behavior** - By default, `next-auth`'s `SessionProvider` automatically refetches the session when the browser window regains focus (`refetchOnWindowFocus` defaults to `true`)

2. **Unstable dependency in `useEffect`** - The `ProjectSwitcher` component had a `useEffect` dependency on `session?.user`:
   ```typescript
   useEffect(() => {
     loadOrganizations();
   }, [session?.user, status]); // ❌ session?.user object reference changes on every refetch
   ```

Every time the window regained focus, the session was refetched, causing a new `session?.user` object reference, triggering the effect and reloading organizations.

---

## Solution

We implemented a **context-based event system** that only triggers organization reloads when actual organization mutations occur.

### Changes Made

#### 1. Created Organization Context (`/lib/organization-context.tsx`)

A new context provider that tracks organization-related events:

```typescript
type OrganizationEventType = "switch" | "create" | "update" | "delete";

interface OrganizationContextValue {
  eventCounter: number;
  triggerReload: (eventType: OrganizationEventType) => void;
}
```

**Key Features**:
- Event counter that only increments when actual org operations occur
- `triggerReload()` function to signal when data should refresh
- Supports 4 event types: switch, create, update, delete

#### 2. Disabled Session Refetch on Window Focus (`/app/layout.tsx`)

Added `refetchOnWindowFocus={false}` to `SessionProvider`:

```typescript
<SessionProvider refetchOnWindowFocus={false}>
  <OrganizationProvider>
    {/* ... */}
  </OrganizationProvider>
</SessionProvider>
```

**Why This Is Safe**:
- Organization data only changes through explicit user actions (switch, create, update, delete)
- The session JWT already contains the current org ID
- We don't need to refetch the session to detect org changes - we control when they happen
- Session still refreshes on initial load and manual actions

#### 3. Updated ProjectSwitcher (`/components/dashboard/project-switcher.tsx`)

**Before**:
```typescript
useEffect(() => {
  loadOrganizations();
}, [session?.user, status]); // Triggers on every session refetch
```

**After**:
```typescript
const hasLoadedOnce = useRef(false);

useEffect(() => {
  // Only load if:
  // 1. Never loaded before (initial mount)
  // 2. eventCounter changed (org switch, create, update, delete)
  // 3. Status changed to authenticated (user just logged in)
  if (!hasLoadedOnce.current || eventCounter > 0) {
    loadOrganizations();
  }
}, [status, eventCounter]); // ✅ Stable dependencies
```

**Key Improvements**:
- Removed `session?.user` from dependencies
- Added `hasLoadedOnce` ref to prevent repeated initial loads
- Only depends on `eventCounter` which only changes on actual org operations
- Removed inline `loadOrganizations()` calls from event handlers (now handled by effect)

#### 4. Integrated Context in Mutation Handlers

All organization mutation operations now trigger the reload event:

**Org Switch**:
```typescript
const handleSwitchOrg = async (agencyId: string) => {
  const result = await switchOrganization(agencyId);
  if (result.success) {
    triggerReload("switch"); // ✅ Signals reload needed
    router.refresh();
  }
};
```

**Org Create**:
```typescript
const handleCreateOrg = async () => {
  const result = await createOrganization({ name: newOrgName });
  if (result.success) {
    triggerReload("create"); // ✅ Signals reload needed
    router.push("/dashboard");
  }
};
```

**Org Update** (`/components/forms/organization-settings-form.tsx`):
```typescript
async function onSubmit(data: OrganizationFormData) {
  const result = await updateOrganization(organization.id, data);
  if (result.success) {
    triggerReload("update"); // ✅ Signals reload needed
  }
}
```

**Org Delete** (`/components/modals/delete-organization-modal.tsx`):
```typescript
async function handleDeleteOrganization() {
  const result = await deleteOrganization();
  if (result.success) {
    triggerReload("delete"); // ✅ Signals reload needed
    window.location.href = "/dashboard";
  }
}
```

---

## Behavior After Changes

### Organization Data Loads Only When:

✅ **Initial mount** - User first loads the app  
✅ **Org switch** - User switches to a different organization  
✅ **Org create** - User creates a new organization  
✅ **Org update** - User updates org name/settings  
✅ **Org delete** - User deletes an organization  

### Organization Data Does NOT Load On:

❌ Window/tab focus change  
❌ Switching between applications  
❌ Returning to the browser after being idle  
❌ Any other user interaction that doesn't modify org data  

---

## Performance Impact

### Before:
- **2 POST requests** on every window focus/tab change
- **Skeleton UI flicker** on every focus change
- **Wasted server resources** checking for unchanged data

### After:
- **0 requests** on window focus/tab changes
- **Stable UI** - no unnecessary loading states
- **Minimal server load** - only fetch when data actually changes

---

## Testing Checklist

- [x] Initial load shows correct organization
- [x] Switching organizations updates the UI correctly
- [x] Creating a new organization updates the list
- [x] Updating org name reflects in switcher
- [x] Deleting org switches to Personal workspace
- [x] Switching windows/tabs does NOT trigger reload
- [x] Changing browser tabs does NOT trigger reload
- [x] Minimizing/maximizing window does NOT trigger reload

---

## Files Modified

1. `/lib/organization-context.tsx` - **NEW** - Context provider for org events
2. `/app/layout.tsx` - Added `refetchOnWindowFocus={false}` and `OrganizationProvider`
3. `/components/dashboard/project-switcher.tsx` - Removed unstable dependencies, integrated context
4. `/components/forms/organization-settings-form.tsx` - Added `triggerReload("update")`
5. `/components/modals/delete-organization-modal.tsx` - Added `triggerReload("delete")`

---

## Migration Notes

This change is **backward compatible** and requires no database migrations or configuration changes. The optimization is entirely client-side and transparent to the user.

### For Future Development

When adding new organization mutation operations (e.g., transfer ownership, change plan), ensure you:

1. Import `useOrganizationContext()` in the component
2. Call `triggerReload(eventType)` after successful mutation
3. Choose appropriate event type or use "update" as default

Example:
```typescript
import { useOrganizationContext } from "@/lib/organization-context";

export function MyOrgMutationComponent() {
  const { triggerReload } = useOrganizationContext();
  
  async function handleMutation() {
    const result = await myOrgAction();
    if (result.success) {
      triggerReload("update"); // ✅ Don't forget this!
    }
  }
}
```

---

## Conclusion

This optimization significantly reduces unnecessary network requests and improves the user experience by eliminating UI flickering when switching windows/tabs. The solution is clean, maintainable, and sets a pattern for future organization-related features.
