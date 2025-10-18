# Personal Organization - Quick Reference

## 🎯 Core Concept
Every user has exactly **ONE permanent Personal Organization** that cannot be deleted.

---

## ✅ Key Points

### For Users
- ✅ Automatically created on sign-up
- ✅ Named: `{yourname}'s Organization`
- ✅ You are the `ORG_OWNER`
- ✅ Cannot be deleted (permanent workspace)
- ✅ Can create/join other team organizations

### For Developers
- ✅ Marked with `isPersonal: true` in database
- ✅ Created in [`auth.ts`](./auth.ts) during `createUser` event
- ✅ Protected from deletion in UI and API
- ✅ Preserved when user deletes account

---

## 🔧 Commands

```bash
# Assign personal orgs to existing users
npx tsx scripts/ensure-personal-orgs.ts

# Verify all users have personal orgs
npx tsx scripts/verify-personal-org-protection.ts

# Check database state
npx tsx scripts/check-database.ts
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| [`auth.ts`](./auth.ts) | Creates personal org on sign-up |
| [`actions/organizations.ts`](./actions/organizations.ts) | Blocks personal org deletion |
| [`components/dashboard/delete-organization.tsx`](./components/dashboard/delete-organization.tsx) | Hides delete button for personal orgs |
| [`app/api/user/route.ts`](./app/api/user/route.ts) | Preserves personal org on account deletion |

---

## 🔒 Protection Levels

1. **UI** - Delete button hidden
2. **Server Action** - Throws error if `isPersonal: true`
3. **API Route** - Returns 400 if `isPersonal: true`
4. **Account Deletion** - Skips personal org deletion

---

## 💡 User Flows

### New User
```
Sign Up → Personal Org Created → User assigned as ORG_OWNER
```

### Invited User
```
Sign Up → Personal Org Created → Assigned to Team Org → Can switch to Personal Org
```

### Delete Account
```
Delete Account → Personal Org Preserved → User Removed
```

---

## ⚠️ Important

- Personal orgs **CANNOT** be deleted
- Each user has **EXACTLY ONE** personal org
- Personal orgs are **PERMANENT** workspaces
- Team orgs **CAN** be deleted by ORG_OWNERs

---

**See full docs**: [`/docs/implementation/PERSONAL_ORG_PROTECTION.md`](./docs/implementation/PERSONAL_ORG_PROTECTION.md)
