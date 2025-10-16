# Development Email Testing - Quick Guide

In development mode, **all invitation emails are sent to your own email** (`oikion.parent@gmail.com`) for easy testing.

---

## ✅ How It Works

```
You invite: colleague@company.com
↓
Email sent to: oikion.parent@gmail.com (YOUR email)
↓
Email shows: "Intended for colleague@company.com"
↓
You receive it in YOUR inbox
↓
Test the flow from YOUR inbox
```

---

## 🚀 Quick Setup

### Your `.env.local` should have:

```bash
# Resend (required)
RESEND_API_KEY=re_your_key_here
EMAIL_FROM=onboarding@resend.dev

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Override dev recipient (defaults to oikion.parent@gmail.com)
# DEV_EMAIL_RECIPIENT=your-other-email@gmail.com
```

**That's it!** No domain verification needed.

---

## 📧 What You'll Receive

When you send an invitation, you'll get an email like this:

```
┌─────────────────────────────────────────────┐
│ 🧪 DEVELOPMENT MODE - TESTING EMAIL         │
│                                             │
│ Intended Recipient: colleague@company.com   │
│ Actual Recipient: oikion.parent@gmail.com   │
│ Organization: Acme Real Estate              │
│ Role: Agent                                 │
│                                             │
│ In production, this would be delivered to   │
│ colleague@company.com                       │
├─────────────────────────────────────────────┤
│         Oikion                              │
│     You've been invited!                    │
├─────────────────────────────────────────────┤
│ Hi (Testing for: colleague@company.com),    │
│                                             │
│ John Doe has invited colleague@company.com  │
│ to join Acme Real Estate on Oikion.         │
│                                             │
│ Role: ┌──────┐                              │
│       │ Agent│                              │
│       └──────┘                              │
│                                             │
│   ┌────────────────────┐                    │
│   │ Accept Invitation  │                    │
│   └────────────────────┘                    │
│                                             │
│ 👉 Testing Instructions:                    │
│ 1. Open the link above                      │
│ 2. Sign up with email: colleague@company.com│
│ 3. User will be auto-assigned to org        │
└─────────────────────────────────────────────┘

Subject: [DEV] Invite for colleague@company.com to join Acme Real Estate
```

---

## 🧪 Testing Workflow

### 1. Send Invitation
```bash
# Go to: http://localhost:3000/dashboard/members
# Fill form:
- Email: testuser@example.com
- Role: Agent
# Click "Send Invitation"
```

### 2. Check Your Email
```bash
# Open: oikion.parent@gmail.com inbox
# You'll see email with subject:
[DEV] Invite for testuser@example.com to join [Your Org]
```

### 3. Test the Flow
```bash
# Click "Accept Invitation" button in email
# OR copy the URL
# Sign up with: testuser@example.com
# ✅ User auto-assigned to your organization
```

### 4. Console Output
```bash
✅ [DEV] Invitation email sent
   Intended for: testuser@example.com
   Sent to: oikion.parent@gmail.com
   Role: Agent
   View: Check your inbox at oikion.parent@gmail.com
```

---

## 💡 Key Features

### Dev Mode Email Shows:
- ✅ **Yellow banner** - "DEVELOPMENT MODE"
- ✅ **Intended recipient** - Who should get it in production
- ✅ **Actual recipient** - Your email (for testing)
- ✅ **Organization name** - Which org they're joining
- ✅ **Role assignment** - What permissions they'll have
- ✅ **Testing instructions** - How to test the flow
- ✅ **Working accept link** - Pre-filled with intended email

### Subject Line:
```
[DEV] Invite for {intended-email} to join {organization}
```

Easy to identify and test!

---

## 🔧 Testing Different Scenarios

### Test Multiple Users
```bash
# Send 3 invitations:
1. alice@example.com → Agent
2. bob@example.com → Admin
3. carol@example.com → Viewer

# All emails go to: oikion.parent@gmail.com
# Each shows different intended recipient
# Each has correct role and permissions
```

### Test Role Permissions
```bash
# Invite as different roles
- ORG_OWNER → Full access
- ADMIN → Can manage members
- AGENT → Can create content
- VIEWER → Read-only

# Each email shows the role badge
# Test acceptance with each role level
```

### Test Resend
```bash
# From Members page:
- Find pending invitation
- Click ⋯ → Resend invitation
- Check email again (new timestamp)
- Expiration extended by 7 days
```

---

## 🎯 Advantages

### Why This Approach is Better:

✅ **No spam** - Only you receive emails  
✅ **Easy testing** - All in your inbox  
✅ **Clear context** - Each email shows intended recipient  
✅ **Real flow** - Accept links work perfectly  
✅ **No domain verification** - Works immediately  
✅ **Multiple tests** - Send as many as you want  
✅ **Safe** - Won't accidentally email real users  

---

## 🚀 Production Behavior

When you deploy to production (NODE_ENV=production):

### Automatic Changes:
- ❌ **No dev banner** - Removed automatically
- ✅ **Real delivery** - Sent to actual recipient
- ✅ **Clean subject** - No [DEV] prefix
- ✅ **Professional** - Production-ready template
- ✅ **Personalized** - "Hi there" instead of "Testing for..."

### Required Setup:
1. Verify your domain in Resend
2. Update EMAIL_FROM to your domain
3. Deploy with production env vars

---

## 🔍 Troubleshooting

### "Still getting 403 error"

**Check**:
```bash
# 1. Restart dev server
pnpm dev

# 2. Verify environment
cat .env.local | grep EMAIL
# Should show:
# EMAIL_FROM=onboarding@resend.dev

# 3. Check logs
# Should see: "Sent to: oikion.parent@gmail.com"
```

### "Email not received"

**Check**:
```bash
# 1. Spam folder
# Subject starts with [DEV]

# 2. Gmail filters
# Make sure no filters blocking

# 3. Console output
# Should show: "Sent to: oikion.parent@gmail.com"

# 4. Resend dashboard
# https://resend.com/emails
# Should show delivery to oikion.parent@gmail.com
```

### "Want to use different email for testing"

```bash
# Add to .env.local:
DEV_EMAIL_RECIPIENT=your-other-email@gmail.com

# Restart server
# All dev emails will go there instead
```

---

## 📊 Email Content Details

### Yellow Dev Banner (Top)
- Shows testing context
- Lists all key info
- Instructions for testing
- Only visible in development

### Main Email Body
- Professional design
- Gradient header
- Role badge
- Accept button
- Expiration warning

### Testing Instructions Box
- Step-by-step guide
- Highlighted intended email
- Testing workflow

### Footer
- Standard legal text
- Professional appearance

---

## ✨ Example Email Flow

```bash
# You invite: new-agent@realestate.com as AGENT

# You receive email at: oikion.parent@gmail.com

# Email shows:
┌────────────────────────────────┐
│ 🧪 DEV MODE                    │
│ Intended: new-agent@...        │
│ Sent to: oikion.parent@...     │
│ Role: Agent                    │
└────────────────────────────────┘

# You click "Accept Invitation"

# Opens: localhost:3000/register?email=new-agent@realestate.com

# You sign up with: new-agent@realestate.com

# ✅ User created
# ✅ Assigned to your organization
# ✅ Role: AGENT
# ✅ Can access properties/clients
# ✅ Cannot access members page (needs ADMIN)
```

---

## 🎓 Best Practices

### Testing Checklist
- [ ] Send invitation
- [ ] Check email received
- [ ] Verify dev banner shows correct info
- [ ] Click accept link
- [ ] Sign up with intended email
- [ ] Verify user appears in members list
- [ ] Verify role permissions work
- [ ] Test resend functionality

### Common Test Cases
1. **New member invitation** - Basic flow
2. **Different roles** - ORG_OWNER, ADMIN, AGENT, VIEWER
3. **Resend invitation** - Expiration extension
4. **Cancel invitation** - Cleanup
5. **Expired invitation** - Auto-rejection

---

## 📝 Quick Reference

```bash
# All dev emails go to
oikion.parent@gmail.com

# Subject format
[DEV] Invite for {email} to join {org}

# Console output
✅ [DEV] Invitation email sent
   Intended for: {email}
   Sent to: oikion.parent@gmail.com
   
# Testing
1. Check inbox at oikion.parent@gmail.com
2. Open email with [DEV] prefix
3. Click accept link
4. Sign up with intended email
5. ✅ Auto-assigned to org
```

---

**Happy Testing!** 🚀

All emails will arrive in your inbox with clear context about who they're intended for.
