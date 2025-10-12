# Environment Setup Guide

This guide will walk you through setting up all the required environment variables for your Next.js SaaS Stripe Starter application.

## Table of Contents
1. [Authentication (NextAuth.js)](#authentication-nextauthjs)
2. [Database (PostgreSQL - Neon)](#database-postgresql---neon)
3. [Email (Resend)](#email-resend)
4. [Subscriptions (Stripe)](#subscriptions-stripe)

---

## Authentication (NextAuth.js)

### AUTH_SECRET
**What it is**: A secret key used to encrypt JWT tokens and session data.

**Steps**:
1. Generate a random secret string (32+ characters)
2. You can use this command in terminal: `openssl rand -base64 32`
3. Or visit: https://generate-secret.vercel.app/32
4. Copy the generated secret to `AUTH_SECRET=your_generated_secret`

### GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
**What it is**: OAuth credentials to enable Google sign-in.

**Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure OAuth consent screen if prompted
6. Choose **Web application** as application type
7. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
8. Copy **Client ID** to `GOOGLE_CLIENT_ID`
9. Copy **Client Secret** to `GOOGLE_CLIENT_SECRET`

**Documentation**: [NextAuth Google Provider](https://next-auth.js.org/providers/google)

### GITHUB_OAUTH_TOKEN
**What it is**: OAuth token for GitHub authentication.

**Steps**:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in application details:
   - **Application name**: Your app name
   - **Homepage URL**: `http://localhost:3000` (dev) or your domain
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**
5. Copy **Client ID** and **Client Secret**
6. Set `GITHUB_OAUTH_TOKEN=your_github_client_secret`

**Documentation**: [NextAuth GitHub Provider](https://next-auth.js.org/providers/github)

---

## Database (PostgreSQL - Neon)

### DATABASE_URL
**What it is**: Connection string for your PostgreSQL database hosted on Neon.

**Steps**:
1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up/Sign in to your account
3. Click **Create a project**
4. Choose your region and project name
5. Once created, go to **Dashboard**
6. Copy the connection string from **Connection Details**
7. The format will be: `postgres://[username]:[password]@[hostname]/[database]?sslmode=require`
8. Replace the placeholder in your `.env.local` with this URL

**Example**:
```
DATABASE_URL='postgres://username:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require'
```

**Documentation**: [Neon Getting Started](https://neon.tech/docs/get-started-with-neon)

---

## Email (Resend)

### RESEND_API_KEY
**What it is**: API key for sending transactional emails via Resend.

**Steps**:
1. Go to [Resend](https://resend.com/)
2. Sign up for an account
3. Verify your email address
4. Go to **API Keys** in the dashboard
5. Click **Create API Key**
6. Give it a name (e.g., "SaaS Starter")
7. Copy the generated API key
8. Set `RESEND_API_KEY=your_resend_api_key`

### EMAIL_FROM
**What it is**: The sender email address for your transactional emails.

**Steps**:
1. In Resend dashboard, go to **Domains**
2. Either use the default `onboarding@resend.dev` for testing
3. Or add your own domain:
   - Click **Add Domain**
   - Enter your domain name
   - Add the provided DNS records to your domain
   - Verify the domain
4. Update `EMAIL_FROM="Your App Name <noreply@yourdomain.com>"`

**Documentation**: [Resend Quick Start](https://resend.com/docs/send-with-nextjs)

---

## Subscriptions (Stripe)

### STRIPE_API_KEY
**What it is**: Secret API key for Stripe payments.

**Steps**:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or sign in
3. In the dashboard, click **Developers** → **API keys**
4. Copy the **Secret key** (starts with `sk_test_` for test mode)
5. Set `STRIPE_API_KEY=sk_test_your_stripe_secret_key`

**Important**: Use test keys during development, switch to live keys for production.

### STRIPE_WEBHOOK_SECRET
**What it is**: Secret for verifying Stripe webhook events.

**Steps**:
1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL:
   - Development: `http://localhost:3000/api/webhooks/stripe`
   - Production: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Click on the created webhook
7. Copy the **Signing secret** (starts with `whsec_`)
8. Set `STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret`

### Stripe Plan IDs
**What they are**: Product price IDs for your subscription plans.

**Steps**:
1. In Stripe Dashboard, go to **Products**
2. Create your subscription products:

**For Pro Monthly Plan**:
3. Click **Add product**
4. Name: "Pro Plan"
5. Set up pricing: **Recurring** → **Monthly** → Set price
6. Click **Save product**
7. Copy the **Price ID** (starts with `price_`)
8. Set `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID=price_your_pro_monthly_id`

**For Pro Yearly Plan**:
9. Add another price to the same product: **Recurring** → **Yearly**
10. Copy the **Price ID**
11. Set `NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID=price_your_pro_yearly_id`

**For Business Plans**:
12. Repeat the same process for Business tier
13. Set `NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID=price_your_business_monthly_id`
14. Set `NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID=price_your_business_yearly_id`

**Documentation**: [Stripe Products & Pricing](https://stripe.com/docs/products-prices/overview)

---

## Final Steps

1. **Save your `.env.local` file** with all the environment variables filled in
2. **Restart your development server** to load the new environment variables
3. **Test each integration**:
   - Authentication: Try signing in with Google/GitHub
   - Database: Check if the app connects successfully
   - Email: Test email sending functionality
   - Stripe: Test subscription flow

## Security Notes

- ⚠️ **Never commit your `.env.local` file to version control**
- 🔒 **Keep your API keys and secrets secure**
- 🧪 **Use test/development keys during development**
- 🚀 **Switch to production keys when deploying**

## Troubleshooting

### Common Issues:
1. **Database connection fails**: Check your Neon connection string format
2. **OAuth not working**: Verify redirect URIs match exactly
3. **Webhooks failing**: Ensure webhook URL is accessible and uses HTTPS in production
4. **Emails not sending**: Verify Resend domain is properly configured

### Useful Commands:
```bash
# Test database connection
npx prisma db push

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

---

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Neon Documentation](https://neon.tech/docs)
- [Resend Documentation](https://resend.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)