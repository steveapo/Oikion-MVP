# Environment Setup

<cite>
**Referenced Files in This Document**   
- [env.mjs](file://env.mjs)
- [ENVIRONMENT_SETUP_GUIDE.md](file://ENVIRONMENT_SETUP_GUIDE.md)
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md)
- [lib/email.ts](file://lib/email.ts)
- [auth.config.ts](file://auth.config.ts)
- [lib/stripe.ts](file://lib/stripe.ts)
</cite>

## Table of Contents
1. [Authentication (NextAuth.js)](#authentication-nextauthjs)
2. [Database (PostgreSQL - Neon)](#database-postgresql---neon)
3. [Email (Resend)](#email-resend)
4. [Subscriptions (Stripe)](#subscriptions-stripe)
5. [Security Best Practices](#security-best-practices)
6. [Validation and Testing](#validation-and-testing)
7. [Troubleshooting Common Issues](#troubleshooting-common-issues)

## Authentication (NextAuth.js)

### AUTH_SECRET
The AUTH_SECRET is a cryptographic key used to sign and encrypt authentication tokens and session data in NextAuth.js. This secret ensures that session information cannot be tampered with and provides security for user authentication flows.

To generate a secure AUTH_SECRET:
1. Use the OpenSSL command: `openssl rand -base64 32`
2. Alternatively, visit https://generate-secret.vercel.app/32 to generate a random 32-character secret
3. Add the generated value to your environment configuration as `AUTH_SECRET=your_generated_value`

### GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
These credentials enable Google OAuth 2.0 authentication, allowing users to sign in with their Google accounts.

Setup process:
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to APIs & Services → Credentials
4. Create OAuth 2.0 Client IDs with application type "Web application"
5. Configure authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
6. Copy the generated Client ID and Client Secret to `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` respectively

### GITHUB_OAUTH_TOKEN
This token enables GitHub OAuth authentication for user sign-in.

Configuration steps:
1. Visit [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App with:
   - Homepage URL: `http://localhost:3000` (development) or your production domain
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. After registration, copy the Client Secret to `GITHUB_OAUTH_TOKEN`

**Section sources**
- [env.mjs](file://env.mjs#L3-L12)
- [auth.config.ts](file://auth.config.ts#L6-L17)
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#L193-L209)

## Database (PostgreSQL - Neon)

### DATABASE_URL
The DATABASE_URL contains the connection string for the PostgreSQL database hosted on Neon, which serves as the persistent data storage for the application.

Database configuration:
1. Sign in to [Neon Console](https://console.neon.tech/)
2. Create a new project with your preferred region and name
3. From the project dashboard, copy the connection string from Connection Details
4. The connection string follows the format: `postgres://[username]:[password]@[hostname]/[database]?sslmode=require`
5. Set this value to the DATABASE_URL environment variable

The application uses Prisma ORM for database operations, with the connection managed through `lib/db.ts`. The Prisma client is configured with a global cache in development to prevent creating multiple instances during hot reloading.

**Section sources**
- [env.mjs](file://env.mjs#L11)
- [lib/db.ts](file://lib/db.ts#L0-L16)
- [ENVIRONMENT_SETUP_GUIDE.md](file://ENVIRONMENT_SETUP_GUIDE.md#L88-L108)

## Email (Resend)

### RESEND_API_KEY
The RESEND_API_KEY authenticates requests to the Resend email service, enabling transactional email delivery for features like magic link authentication.

To configure:
1. Sign up at [Resend](https://resend.com/)
2. Verify your email address
3. Navigate to API Keys in the dashboard
4. Create a new API key with a descriptive name
5. Set the generated key to `RESEND_API_KEY`

### EMAIL_FROM
This variable defines the sender address for outgoing emails.

Configuration options:
1. For testing: Use the default `onboarding@resend.dev`
2. For production: Add your custom domain to Resend
   - Add the domain in the Resend dashboard
   - Configure the provided DNS records with your domain registrar
   - Verify the domain
   - Set EMAIL_FROM to a formatted address like `"Your App Name <noreply@yourdomain.com>"`

The email system integrates with NextAuth.js through the Resend provider in `auth.config.ts`, using the `sendVerificationRequest` function defined in `lib/email.ts` to send magic link emails.

**Section sources**
- [env.mjs](file://env.mjs#L12-L13)
- [lib/email.ts](file://lib/email.ts#L0-L50)
- [auth.config.ts](file://auth.config.ts#L10-L17)
- [emails/magic-link-email.tsx](file://emails/magic-link-email.tsx#L0-L58)

## Subscriptions (Stripe)

### STRIPE_API_KEY
This secret key authenticates the application with the Stripe API for processing payments and managing subscriptions.

Setup:
1. Access the [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers → API keys
3. Copy the Secret key (format: `sk_test_...` for testing, `sk_live_...` for production)
4. Set to `STRIPE_API_KEY`

The application initializes the Stripe client in `lib/stripe.ts` using this key, with API version 2024-04-10.

### STRIPE_WEBHOOK_SECRET
This secret verifies the authenticity of webhook payloads from Stripe, protecting against forged events.

Configuration:
1. In the Stripe Dashboard, go to Developers → Webhooks
2. Add a new endpoint with URLs:
   - Development: `http://localhost:3000/api/webhooks/stripe`
   - Production: `https://yourdomain.com/api/webhooks/stripe`
3. Subscribe to events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the generated Signing secret (format: `whsec_...`) to `STRIPE_WEBHOOK_SECRET`

### Stripe Plan IDs
These client-side variables contain the Price IDs for subscription plans, enabling the frontend to initiate checkout sessions.

To create subscription plans:
1. In Stripe Dashboard, go to Products
2. Create a "Pro Plan" with monthly and yearly pricing
3. Create a "Business Plan" with monthly and yearly pricing
4. Copy the Price IDs to the corresponding environment variables:
   - `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID`
   - `NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID`
   - `NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID`
   - `NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID`

The subscription flow is implemented according to the pattern in QODER_AGENT_RULES.md, checking existing subscriptions and directing users to either the billing portal or checkout.

**Section sources**
- [env.mjs](file://env.mjs#L14-L15)
- [lib/stripe.ts](file://lib/stripe.ts#L0-L7)
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#L262-L285)
- [ENVIRONMENT_SETUP_GUIDE.md](file://ENVIRONMENT_SETUP_GUIDE.md#L132-L193)

## Security Best Practices

### Secret Management
- Never commit `.env.local` to version control - it's included in `.gitignore`
- Use different API keys for development and production environments
- Store secrets in environment variables rather than hardcoding them
- Use strong, randomly generated secrets for AUTH_SECRET (32+ characters)

### Environment Separation
- Use test keys from Stripe during development
- Switch to live keys only in production
- Configure different redirect URIs for development and production OAuth flows
- Set NEXT_PUBLIC_APP_URL appropriately for each environment

### Secure Transmission
- Always use HTTPS for production webhook endpoints
- Ensure SSL mode is required for database connections
- Validate webhook signatures using STRIPE_WEBHOOK_SECRET
- Use the server-side environment validation provided by `@t3-oss/env-nextjs`

**Section sources**
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#L600-L630)
- [ENVIRONMENT_SETUP_GUIDE.md](file://ENVIRONMENT_SETUP_GUIDE.md#L204-L216)

## Validation and Testing

After configuring all environment variables, validate the setup:

1. Create a `.env.local` file with all required variables
2. Restart the development server to load the new environment
3. Test each integration point:
   - Authentication: Sign in using Google and GitHub
   - Database: Verify user creation and data persistence
   - Email: Test magic link sign-in functionality
   - Stripe: Complete a test subscription flow

Use the following commands to verify database connectivity:
```bash
npx prisma db push
npx prisma generate
npx prisma migrate dev
```

The environment validation in `env.mjs` uses Zod schemas to ensure all required variables are present and correctly formatted at runtime.

**Section sources**
- [ENVIRONMENT_SETUP_GUIDE.md](file://ENVIRONMENT_SETUP_GUIDE.md#L195-L203)
- [env.mjs](file://env.mjs#L3-L47)

## Troubleshooting Common Issues

### Authentication Issues
**Problem**: OAuth sign-in fails
**Solution**: 
- Verify redirect URIs match exactly between provider configuration and application
- Ensure AUTH_SECRET is set and consistent across deployments
- Check that database connection is working (sessions are stored in the database)

### Database Connection Failures
**Problem**: Application cannot connect to PostgreSQL
**Solution**:
- Verify the DATABASE_URL format includes all components (username, password, host, database)
- Ensure SSL mode is set to 'require'
- Check that the Neon project is active and accessible
- Test connection with `npx prisma db push`

### Email Delivery Problems
**Problem**: Magic link emails not sending
**Solution**:
- Verify RESEND_API_KEY is correctly configured
- Ensure the domain is properly verified in Resend dashboard
- Check that EMAIL_FROM uses a properly formatted address
- Validate that the email sending function in `lib/email.ts` is properly integrated

### Stripe Integration Errors
**Problem**: Webhooks failing verification
**Solution**:
- Ensure STRIPE_WEBHOOK_SECRET matches exactly with the value from Stripe Dashboard
- Verify the webhook endpoint URL is accessible
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

**Section sources**
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#L645-L670)
- [ENVIRONMENT_SETUP_GUIDE.md](file://ENVIRONMENT_SETUP_GUIDE.md#L206-L216)
- [lib/stripe.ts](file://lib/stripe.ts#L0-L7)
- [lib/email.ts](file://lib/email.ts#L0-L50)