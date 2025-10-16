# Quick Start: Members & Invitations

This guide will help you test the new organization member management features.

---

## 🚀 Start the Application

```bash
# Install dependencies (if not done)
pnpm install

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Start development server
pnpm dev
```

Navigate to: `http://localhost:3000`

---

## 👥 Access Members Page

### As ORG_OWNER or ADMIN:

1. Sign in to your account
2. From the dashboard sidebar, click **"Members"**
3. You'll see:
   - Invite form (top)
   - Pending invitations (if any)
   - Members list (bottom)

### As AGENT or VIEWER:

- Members link won't appear in sidebar (insufficient permissions)
- Direct access to `/dashboard/members` will show permission error

---

## 📧 Invite a New Member

### Step 1: Fill Invitation Form

1. Enter email address
2. Select role:
   - **Owner** - Full access (only ORG_OWNER can assign)
   - **Admin** - Manage members & content
   - **Agent** - Create/edit content
   - **Viewer** - Read-only
3. Click "Send Invitation"

### Step 2: Check Pending Invitations

- Invitation appears in "Pending Invitations" section
- Shows email, role, expiration (7 days)
- Actions: Resend or Cancel

### Step 3: Accept Invitation

**Option A: New User**
1. Invited user receives email (TODO - not implemented yet)
2. User clicks invite link or signs up with invited email
3. On first sign-in, automatically assigned to your organization

**Option B: Manual Testing** (until email is implemented)
1. Sign up with the invited email address
2. Auth system auto-detects pending invitation
3. User is assigned to organization with specified role

---

## 👤 Manage Existing Members

### View Members

All members shown in table with:
- Avatar
- Name and email
- Role badge
- Join date
- Actions menu (if you have permission)

### Change Member Role

1. Click **⋯** (three dots) next to member
2. Select "Change role"
3. Choose new role from dropdown
4. Click "Update Role"

**Restrictions:**
- Cannot change your own role
- Can only assign roles ≤ your own level
- ORG_OWNER required to assign ORG_OWNER role

### Remove Member

1. Click **⋯** (three dots) next to member
2. Select "Remove from organization"
3. Confirm in dialog
4. Member loses access immediately

**Restrictions:**
- Cannot remove yourself
- Cannot remove last ORG_OWNER
- Only ADMIN+ can remove members

---

## 🧪 Testing Scenarios

### Scenario 1: Invite and Accept

```bash
# Terminal 1: Start dev server
pnpm dev

# Browser 1: Sign in as ORG_OWNER
1. Go to /dashboard/members
2. Invite: test@example.com as AGENT
3. Note the invitation in pending list

# Browser 2 (incognito): Accept invitation
1. Sign up with test@example.com
2. Verify assigned to organization
3. Check role is AGENT

# Browser 1: Verify
1. Refresh /dashboard/members
2. See test@example.com in members list
3. Invitation moved to ACCEPTED
```

### Scenario 2: Role Hierarchy

```bash
# As ORG_OWNER:
✅ Can invite any role
✅ Can change anyone's role
✅ Can remove anyone (except self)

# As ADMIN:
✅ Can invite ADMIN, AGENT, VIEWER
❌ Cannot invite ORG_OWNER
✅ Can change roles (except to ORG_OWNER)

# As AGENT:
❌ Cannot access /dashboard/members

# As VIEWER:
❌ Cannot access /dashboard/members
```

### Scenario 3: Protection Logic

```bash
# Try to change own role:
❌ Action menu hidden for self

# Try to remove last ORG_OWNER:
❌ Error: "Cannot remove the last organization owner"

# Try to remove self:
❌ Error: "You cannot remove yourself"
```

---

## 📊 Verification

### Database Check

```bash
# Check invitation was created
npx prisma studio
# Navigate to: invitations table
# Verify: email, role, token, status, expiresAt

# Check member was assigned
# Navigate to: users table
# Verify: organizationId matches, role is correct
```

### Activity Log

```bash
# View activities
npx prisma studio
# Navigate to: activities table
# Look for: MEMBER_INVITED, MEMBER_ROLE_CHANGED actions
```

---

## 🔧 Troubleshooting

### "Members link not showing in sidebar"

**Cause**: Your role is AGENT or VIEWER  
**Solution**: Sign in as ORG_OWNER or ADMIN

### "Insufficient permissions to invite users"

**Cause**: Your role is AGENT or VIEWER  
**Solution**: Ask an ADMIN or ORG_OWNER to upgrade your role

### "Invitation not auto-accepted"

**Cause**: Email doesn't match exactly (case-sensitive)  
**Solution**: Use exact email from invitation

### "TypeScript errors in IDE"

**Cause**: Prisma client cache not refreshed  
**Solution**: 
```bash
npx prisma generate
# Then restart TypeScript server in IDE
```

---

## 📧 Email Integration (TODO)

Currently, invitations are sent but email notifications are not sent. To complete:

### 1. Configure Resend

```bash
# Add to .env
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
```

### 2. Implement Email Function

In `/lib/email.ts`, add:

```typescript
export async function sendInvitationEmail({
  to,
  inviterName,
  organizationName,
  role,
  token,
}: {
  to: string;
  inviterName: string;
  organizationName: string;
  role: UserRole;
  token: string;
}) {
  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/register?email=${to}`;
  
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `You're invited to join ${organizationName}`,
    html: `
      <h2>You've been invited!</h2>
      <p>${inviterName} has invited you to join <strong>${organizationName}</strong> as a ${getRoleDisplayName(role)}.</p>
      <p><a href="${acceptUrl}">Sign Up Now</a></p>
      <p><small>This invitation expires in 7 days.</small></p>
    `,
  });
}
```

### 3. Uncomment in Actions

In `/actions/invitations.ts`:
- Line ~103: Uncomment `sendInvitationEmail()` call in `inviteUser()`
- Line ~260: Uncomment `sendInvitationEmail()` call in `resendInvite()`

---

## 🎯 Next Steps

1. ✅ Test basic invitation flow
2. ✅ Test role changes
3. ✅ Test member removal
4. ✅ Test protection logic
5. ⏳ Implement email notifications
6. ⏳ Add E2E tests
7. ⏳ Deploy to staging

---

## 📚 Related Docs

- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - Full implementation details
- [ORG_INVITATIONS_IMPLEMENTATION.md](./ORG_INVITATIONS_IMPLEMENTATION.md) - Component documentation
- [RLS_ORG_MANAGEMENT_COMPLETE.md](./RLS_ORG_MANAGEMENT_COMPLETE.md) - Security architecture

---

**Questions?** Check the implementation docs or review server action code in `/actions/invitations.ts` and `/actions/members.ts`.
