# Admin Components

This directory contains React components for managing organization members, invitations, and roles.

## Components Overview

### 📧 InviteMemberForm

Form component for sending email invitations to new organization members.

**Props:**
- `currentUserRole: UserRole` - The current user's role (determines assignable roles)
- `onSuccess?: () => void` - Callback fired after successful invitation

**Features:**
- Permission-aware role dropdown (only shows roles user can assign)
- Email validation
- Role descriptions on hover/select
- Loading states and error handling
- Toast notifications

**Usage:**
```tsx
import { InviteMemberForm } from "@/components/admin";

<InviteMemberForm 
  currentUserRole={user.role}
  onSuccess={() => {
    // Refresh invitations list
  }}
/>
```

---

### 📋 InvitationsList

Table component displaying pending and past invitations with management actions.

**Props:**
- `invitations: Invitation[]` - Array of invitation objects
- `onUpdate?: () => void` - Callback fired after invitation state changes

**Features:**
- Separate sections for pending vs. past invitations
- Status badges (Pending, Accepted, Canceled, Expired)
- Expiration countdown with visual warnings
- Resend and cancel actions
- Responsive table layout

**Usage:**
```tsx
import { InvitationsList } from "@/components/admin";

<InvitationsList 
  invitations={invitations}
  onUpdate={() => {
    // Refresh data
  }}
/>
```

---

### 👥 MembersList

Table component for displaying organization members with inline role management and removal.

**Props:**
- `members: Member[]` - Array of member objects
- `currentUserId: string` - ID of currently logged-in user
- `currentUserRole: UserRole` - Current user's role
- `onUpdate?: () => void` - Callback fired after member updates

**Features:**
- Inline role change via dropdown
- Permission-aware role options
- Prevents self-role changes
- Member removal with confirmation modal
- User avatars and status indicators
- "You" badge for current user
- Join date display

**Usage:**
```tsx
import { MembersList } from "@/components/admin";

<MembersList
  members={members}
  currentUserId={user.id}
  currentUserRole={user.role}
  onUpdate={() => {
    // Refresh member list
  }}
/>
```

---

### ⚠️ RemoveMemberModal

Confirmation dialog for removing members from the organization.

**Props:**
- `member: Member | null` - Member to remove (null = modal closed)
- `onClose: () => void` - Callback to close the modal
- `onConfirm: (member: Member) => void` - Callback to confirm removal
- `isLoading: boolean` - Loading state during removal

**Features:**
- Clear warning about data attribution
- Shows member name, email, and current role
- Destructive action styling
- Loading states
- Focus trap and keyboard navigation

**Usage:**
```tsx
import { RemoveMemberModal } from "@/components/admin";

const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
const [isRemoving, setIsRemoving] = useState(false);

<RemoveMemberModal
  member={memberToRemove}
  onClose={() => setMemberToRemove(null)}
  onConfirm={async (member) => {
    setIsRemoving(true);
    await removeUser(member.id);
    setIsRemoving(false);
  }}
  isLoading={isRemoving}
/>
```

---

## Type Definitions

```typescript
// Member
interface Member {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: Date;
  image: string | null;
}

// Invitation
interface Invitation {
  id: string;
  email: string;
  role: string;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  inviter: {
    name: string | null;
    email: string | null;
  };
}

// UserRole (from Prisma)
enum UserRole {
  ORG_OWNER = "ORG_OWNER",
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  VIEWER = "VIEWER",
}

// InvitationStatus (from Prisma)
enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  CANCELED = "CANCELED",
  EXPIRED = "EXPIRED",
}
```

---

## Server Actions Used

These components rely on the following server actions:

```typescript
// From /actions/invitations.ts
inviteUser(data: { email: string, role: UserRole })
cancelInvitation(invitationId: string)
resendInvitation(invitationId: string)
getInvitations()
getOrganizationMembers()

// From /actions/members.ts
updateUserRole(data: { targetUserId: string, newRole: UserRole })
removeUser(targetUserId: string)
```

---

## Styling & Dependencies

**UI Library**: shadcn/ui components
- `Button`, `Input`, `Select`, `Table`, `Card`, `Badge`, `AlertDialog`, `Label`

**Icons**: lucide-react
- `UserPlus`, `Mail`, `Clock`, `Trash2`, `Shield`, `Users`, `AlertTriangle`

**Utilities**: 
- `date-fns` for date formatting
- `sonner` for toast notifications
- `@/lib/roles` for permission utilities

---

## Accessibility

All components follow WCAG 2.1 AA guidelines:

✅ Keyboard navigation support  
✅ Screen reader labels (ARIA)  
✅ Focus management in modals  
✅ Error state announcements  
✅ Loading state indicators  
✅ Semantic HTML structure  

---

## Permission Matrix

| Action | ORG_OWNER | ADMIN | AGENT | VIEWER |
|--------|-----------|-------|-------|--------|
| Invite members | ✅ | ✅ | ❌ | ❌ |
| Assign ORG_OWNER | ✅ | ❌ | ❌ | ❌ |
| Assign ADMIN | ✅ | ✅ | ❌ | ❌ |
| Assign AGENT/VIEWER | ✅ | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ❌ | ❌ |
| Cancel invitations | ✅ | ✅ | ❌ | ❌ |
| Change own role | ❌ | ❌ | ❌ | ❌ |

---

## Example: Full Members Page

```tsx
import { getCurrentUser } from "@/lib/session";
import { canManageMembers } from "@/lib/roles";
import { getOrganizationMembers, getInvitations } from "@/actions/invitations";
import {
  InviteMemberForm,
  InvitationsList,
  MembersList,
} from "@/components/admin";

export default async function MembersPage() {
  const user = await getCurrentUser();
  
  if (!user || !canManageMembers(user.role)) {
    redirect("/dashboard");
  }

  const [members, invitations] = await Promise.all([
    getOrganizationMembers(),
    getInvitations(),
  ]);

  return (
    <div className="space-y-6">
      <InviteMemberForm currentUserRole={user.role} />
      <MembersList
        members={members}
        currentUserId={user.id}
        currentUserRole={user.role}
      />
      {invitations.length > 0 && (
        <InvitationsList invitations={invitations} />
      )}
    </div>
  );
}
```

---

## Testing

### Unit Tests (Example with Jest/Vitest)

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { InviteMemberForm } from "./invite-member-form";

test("renders invite form with email and role fields", () => {
  render(<InviteMemberForm currentUserRole="ORG_OWNER" />);
  
  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
});

test("shows only assignable roles for ADMIN user", () => {
  render(<InviteMemberForm currentUserRole="ADMIN" />);
  
  // ADMIN cannot assign ORG_OWNER role
  fireEvent.click(screen.getByRole("combobox"));
  expect(screen.queryByText("Organization Owner")).not.toBeInTheDocument();
  expect(screen.getByText("Administrator")).toBeInTheDocument();
});
```

### Integration Tests

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import MembersPage from "./page";

test("displays members and invitations", async () => {
  const { container } = render(<MembersPage />);
  
  await waitFor(() => {
    expect(screen.getByText("Organization Members")).toBeInTheDocument();
    expect(screen.getByText("Pending Invitations")).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Invitations not sending emails

**Cause**: Resend API key not configured or invalid  
**Solution**: Check `.env` file for `RESEND_API_KEY` and verify in Resend dashboard

### Role dropdown shows wrong options

**Cause**: `canAssignRole` logic not filtering correctly  
**Solution**: Ensure `currentUserRole` prop is passed correctly and matches session

### Member removal fails

**Cause**: Trying to remove last ORG_OWNER  
**Solution**: Server action validates this; ensure error message displays in UI

### Components not updating after actions

**Cause**: Missing `onUpdate` callback or not revalidating data  
**Solution**: Use `router.refresh()` or `revalidatePath()` in server actions

---

## Future Enhancements

- [ ] Bulk member invitation (CSV upload)
- [ ] Advanced filtering (by role, join date, activity)
- [ ] Member activity timeline
- [ ] Export member list as CSV
- [ ] Custom role permissions (feature flags)
- [ ] Member profile pages

---

## Related Documentation

- [Implementation Status](/IMPLEMENTATION_STATUS.md)
- [Migration Guide](/MIGRATION_GUIDE.md)
- [Design Document](/docs/design/security-multi-tenancy.md)
- [Role Utilities](/lib/roles.ts)
- [Server Actions](/actions/invitations.ts)
