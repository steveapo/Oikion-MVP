# Resend Development Mode Setup

This guide shows how to use Resend in development mode where emails are sent but not delivered. You can view them in the Resend dashboard for testing.

---

## ✅ How It Works

In development mode:
- ✅ Emails are **sent** to Resend
- ✅ Emails appear in your **Resend Dashboard**
- ❌ Emails are **NOT delivered** to recipients
- 🔍 You can **preview** them in the dashboard

This is perfect for testing without:
- Spamming real email addresses
- Verifying domains
- Worrying about deliverability

---

## 🚀 Setup (5 minutes)

### 1. Get Your Resend API Key

```bash
# Go to Resend
https://resend.com

# Sign up (free account)
# Navigate to: API Keys → Create API Key
# Copy the key (starts with re_...)
```

### 2. Add to Environment

In your `.env.local`:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_actual_key_here
EMAIL_FROM=onboarding@resend.dev

# App URL (for invite links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Use `onboarding@resend.dev` as EMAIL_FROM - this is Resend's test domain that works without verification.

### 3. Restart Dev Server

```bash
# Stop server (Ctrl+C)
pnpm dev
```

---

## 📧 Testing Invitation Emails

### Send an Invitation

1. Navigate to `/dashboard/members`
2. Fill the invite form:
   - Email: **any-email@example.com** (doesn't matter, won't be delivered)
   - Role: **Agent** (or any role)
3. Click "Send Invitation"

### View in Resend Dashboard

1. Go to: https://resend.com/emails
2. You should see your email in the list
3. Click to preview the full HTML email
4. You can see:
   - ✅ Subject line
   - ✅ Full HTML preview
   - ✅ Email content
   - ✅ All styling
   - ℹ️ Delivery status (will show as "sent" but not delivered in dev)

---

## 🎨 Email Features You'll See

When viewing in Resend dashboard:

### Visual Elements
- 🎨 **Gradient header** (purple gradient)
- 🏷️ **Role badge** showing assignment
- 🔘 **Accept Invitation button** (blue)
- ⏰ **Expiration warning** (7 days)
- 🧪 **Dev mode banner** (yellow - only in development)

### Content
- Inviter name
- Organization name
- Assigned role
- Accept URL (clickable in preview)
- Expiration notice

### Technical
- Professional HTML/CSS
- Mobile-responsive
- Anti-spam headers
- Unique message ID

---

## 📊 Console Logging

When you send an invitation in development, you'll see:

```bash
✅ Invitation email sent to test@example.com (view in Resend dashboard: https://resend.com/emails)
```

This confirms:
- Email was sent to Resend
- You can view it in the dashboard
- No actual delivery attempted

---

## 🔍 What the Email Looks Like

```
┌─────────────────────────────────────┐
│ 🧪 Development Mode                 │ (Yellow banner)
│ This email was sent in development  │
│ mode. In production, this would be  │
│ delivered to test@example.com       │
├─────────────────────────────────────┤
│          Oikion                     │ (Gradient header)
│      You've been invited!           │
├─────────────────────────────────────┤
│ Hi there,                           │
│                                     │
│ John Doe has invited you to join   │
│ Acme Real Estate on Oikion.         │
│                                     │
│ Role: ┌──────┐                      │
│       │ Agent│                      │
│       └──────┘                      │
│                                     │
│   ┌────────────────────┐            │
│   │ Accept Invitation  │            │ (Blue button)
│   └────────────────────┘            │
│                                     │
│ Or copy: http://localhost:3000/... │
│                                     │
│ ⚠️ Expires in 7 days                │
├─────────────────────────────────────┤
│ © 2025 Oikion                       │
└─────────────────────────────────────┘
```

---

## 🧪 Testing Workflow

### Complete Test Scenario

```bash
# 1. Send Invitation
- Go to /dashboard/members
- Invite: testuser@example.com
- Role: Agent
- ✅ Success message appears

# 2. Check Server Logs
- Terminal shows: "✅ Invitation email sent..."
- No errors

# 3. View in Resend
- Open: https://resend.com/emails
- See email in list
- Click to preview
- ✅ Looks perfect

# 4. Copy Invite Link
- From email preview, copy the accept URL
- Should be: http://localhost:3000/register?email=testuser@example.com

# 5. Test Acceptance (Optional)
- Open copied URL in incognito window
- Sign up with testuser@example.com
- ✅ User should be auto-assigned to your org
```

---

## 🔧 Troubleshooting

### "403 Error: Can only send to your own email"

**This means you're NOT in dev mode correctly**

**Solution**:
```bash
# Check your EMAIL_FROM in .env.local
# It MUST be:
EMAIL_FROM=onboarding@resend.dev

# NOT your personal email
# NOT a custom domain (unless verified)
```

### "Email not appearing in dashboard"

**Check**:
1. Correct Resend account logged in?
2. API key is valid?
3. Check "All" or "Sent" filter in dashboard
4. Refresh the page

### "401 Unauthorized"

**Solution**:
```bash
# Your API key is invalid
# Get a new one from https://resend.com/api-keys
# Update .env.local
# Restart server
```

### "Email looks broken in preview"

**This is normal** - Some email clients strip CSS. The email includes:
- Inline styles (for most clients)
- Fallback plain styles
- Basic HTML structure

Test in multiple places:
- ✅ Resend preview
- ✅ Gmail web
- ✅ Outlook web
- ⚠️ Some clients may vary

---

## 🚀 Moving to Production

When you deploy, emails will be **actually delivered**. You need to:

### 1. Verify Your Domain

```bash
# In Resend dashboard
https://resend.com/domains

# Add your domain (e.g., yourdomain.com)
# Add DNS records (SPF, DKIM)
# Wait for verification
```

### 2. Update Environment Variables

```bash
# Production .env
RESEND_API_KEY=re_your_production_key
EMAIL_FROM=noreply@yourdomain.com  # Your verified domain
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Remove Dev Banner

The yellow "Development Mode" banner automatically disappears in production (checks `NODE_ENV`).

---

## 📈 Resend Dashboard Features

What you can do:
- ✅ **View all sent emails**
- ✅ **Preview HTML content**
- ✅ **See delivery status**
- ✅ **Check open rates** (in production)
- ✅ **Click tracking** (if enabled)
- ✅ **Search by recipient**
- ✅ **Filter by date**
- ✅ **Export data**

---

## 💡 Pro Tips

### Testing Multiple Scenarios

```bash
# Different roles
- Invite as ORG_OWNER (to test permission level emails)
- Invite as ADMIN
- Invite as AGENT
- Invite as VIEWER

# Different states
- Send new invitation
- Resend existing invitation (check timestamp update)
- Cancel invitation (should not send email)
```

### Email Content Testing

Check in Resend preview:
- ✅ Links are clickable
- ✅ Button renders correctly
- ✅ Responsive layout (mobile view)
- ✅ Text is readable
- ✅ No broken images
- ✅ Professional appearance

### Performance

Resend free tier includes:
- ✅ 100 emails/day
- ✅ 3,000 emails/month
- ✅ Unlimited previews/tests
- ✅ Full dashboard access

Perfect for development!

---

## 🎯 Quick Reference

```bash
# Environment Setup
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=onboarding@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000

# View Emails
https://resend.com/emails

# Console Output
✅ Invitation email sent to {email} (view in Resend dashboard...)

# Email Features
- Gradient header ✅
- Role badge ✅
- Accept button ✅
- Dev banner ✅ (development only)
- Expiration warning ✅
```

---

## ✅ Summary

You're now set up to:
- ✅ Send invitation emails in development
- ✅ View them in Resend dashboard
- ✅ Test the full flow without actual delivery
- ✅ Preview HTML rendering
- ✅ Verify content and links

**No domain verification needed** ✨  
**No email spam** ✨  
**Perfect for testing** ✨

---

**Questions?**  
- Resend Docs: https://resend.com/docs
- Dashboard: https://resend.com/emails
- Support: https://resend.com/support
