# Troubleshooting

<cite>
**Referenced Files in This Document**   
- [ENVIRONMENT_SETUP_GUIDE.md](file://ENVIRONMENT_SETUP_GUIDE.md)
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md)
- [auth.config.ts](file://auth.config.ts)
- [lib/stripe.ts](file://lib/stripe.ts)
- [app/api/webhooks/stripe/route.ts](file://app/api/webhooks/stripe/route.ts)
- [lib/db.ts](file://lib/db.ts)
</cite>

## Table of Contents
1. [Environment Setup Issues](#environment-setup-issues)
2. [Authentication Problems](#authentication-problems)
3. [Database Connection and Migration Errors](#database-connection-and-migration-errors)
4. [Stripe Integration Failures](#stripe-integration-failures)
5. [Deployment and Runtime Issues](#deployment-and-runtime-issues)
6. [Logging and Debugging Techniques](#logging-and-debugging-techniques)

## Environment Setup Issues

### Missing Dependencies
**Description**: Application fails to start due to missing or incorrectly installed packages.

**Likely Causes**:
- Using incorrect package manager (npm/yarn instead of pnpm)
- Corrupted node_modules directory
- Outdated pnpm version

**Diagnosis**:
1. Verify pnpm is installed: `pnpm --version`
2. Check for node_modules: `ls node_modules`
3. Validate package manager in package.json

**Solutions**:
```bash
# Install pnpm if missing
npm install -g pnpm

# Clean install
rm -rf node_modules
pnpm install

# Verify postinstall script runs Prisma generation
pnpm postinstall
```

**Section sources**
- [package.json](file://package.json)
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#testing--development)

### Incorrect Environment Variables
**Description**: Application fails to connect to services due to misconfigured environment variables.

**Likely Causes**:
- Missing required environment variables
- Incorrect variable names or values
- Using test keys in production or vice versa

**Diagnosis**:
1. Check for `.env.local` file existence
2. Validate all required variables are present using ENVIRONMENT_SETUP_GUIDE.md
3. Verify variable names match those in `env.mjs`

**Solutions**:
```bash
# Create .env.local if missing
cp .env.example .env.local

# Test environment variable loading
npx t3-env validate
```

Follow the [Environment Setup Guide](file://ENVIRONMENT_SETUP_GUIDE.md) for proper configuration of:
- Authentication (NextAuth.js)
- Database (PostgreSQL - Neon)
- Email (Resend)
- Subscriptions (Stripe)

**Section sources**
- [ENVIRONMENT_SETUP_GUIDE.md](file://ENVIRONMENT_SETUP_GUIDE.md)
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#environment-variables)

## Authentication Problems

### OAuth Configuration Errors
**Description**: Google or GitHub authentication fails during login.

**Likely Causes**:
- Incorrect redirect URIs in OAuth provider settings
- Missing or invalid client credentials
- AUTH_SECRET not properly configured

**Diagnosis**:
1. Verify redirect URIs match exactly:
   - Google: `http://localhost:3000/api/auth/callback/google`
   - GitHub: `http://localhost:3000/api/auth/callback/github`
2. Check client ID and secret values
3. Validate AUTH_SECRET is 32+ characters

**Solutions**:
```bash
# Generate new AUTH_SECRET
openssl rand -base64 32
```

Update OAuth provider settings with correct redirect URIs and verify credentials in `.env.local`.

**Section sources**
- [auth.config.ts](file://auth.config.ts)
- [ENVIRONMENT_SETUP_GUIDE.md](file://ENVIRONMENT_SETUP_GUIDE.md#authentication-nextauthjs)

### Session and Authentication Failures
**Description**: Users cannot maintain login sessions or access protected routes.

**Likely Causes**:
- Invalid or missing AUTH_SECRET
- Database connection issues preventing session storage
- Middleware configuration problems

**Diagnosis**:
1. Check if AUTH_SECRET is set and consistent across deployments
2. Verify database connection is working
3. Test protected route access

**Solutions**:
```bash
# Regenerate Prisma client and push schema
npx prisma generate
npx prisma db push
```

Ensure the middleware is properly configured to handle authentication and redirect unauthenticated users.

**Section sources**
- [auth.config.ts](file://auth.config.ts)
- [lib/db.ts](file://lib/db.ts)
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#authentication-patterns)

## Database Connection and Migration Errors

### Database Connection Failures
**Description**: Application cannot connect to the PostgreSQL database.

**Likely Causes**:
- Incorrect DATABASE_URL format
- Neon project not properly configured
- Network connectivity issues

**Diagnosis**:
1. Validate DATABASE_URL format matches Neon connection string
2. Test connection using Prisma CLI
3. Verify Neon project status

**Solutions**:
```bash
# Test database connection
npx prisma db push

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

Ensure the DATABASE_URL follows the format:
```
postgres://[username]:[password]@[hostname]/[database]?sslmode=require
```

**Section sources**
- [lib/db.ts](file://lib/db.ts)
- [ENVIRONMENT_SETUP_GUIDE.md](file://ENVIRONMENT_SETUP_GUIDE.md#database-postgresql---neon)

### Prisma Client and Migration Issues
**Description**: Prisma client generation fails or migrations do not apply correctly.

**Likely Causes**:
- Schema conflicts between local and database
- Missing migration files
- Prisma client not generated

**Diagnosis**:
1. Check for prisma/migrations directory contents
2. Verify prisma/schema.prisma file integrity
3. Test client generation

**Solutions**:
```bash
# Regenerate Prisma client
npx prisma generate

# Create new migration
npx prisma migrate dev --name updated_schema

# Reset database (development only)
npx prisma migrate reset
```

Ensure the postinstall script runs `prisma generate` automatically.

**Section sources**
- [lib/db.ts](file://lib/db.ts)
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#database--prisma-patterns)

## Stripe Integration Failures

### Webhook Issues
**Description**: Stripe webhooks fail to process subscription events.

**Likely Causes**:
- Incorrect STRIPE_WEBHOOK_SECRET
- Webhook endpoint URL not accessible
- Missing event types in Stripe dashboard

**Diagnosis**:
1. Verify webhook secret matches between `.env.local` and Stripe dashboard
2. Test endpoint accessibility
3. Check Stripe dashboard for webhook delivery attempts

**Solutions**:
```bash
# Test webhooks locally using Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Verify webhook signature
stripe trigger customer.subscription.created
```

Ensure the following events are enabled in Stripe:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Section sources**
- [app/api/webhooks/stripe/route.ts](file://app/api/webhooks/stripe/route.ts)
- [lib/stripe.ts](file://lib/stripe.ts)
- [ENVIRONMENT_SETUP_GUIDE.md](file://ENVIRONMENT_SETUP_GUIDE.md#subscriptions-stripe)

### Payment Processing Failures
**Description**: Users cannot complete subscription payments.

**Likely Causes**:
- Incorrect Stripe price IDs
- Missing or invalid STRIPE_API_KEY
- Client-side environment variables not properly exposed

**Diagnosis**:
1. Verify NEXT_PUBLIC_STRIPE_* environment variables are set
2. Check STRIPE_API_KEY validity
3. Test checkout flow with Stripe test cards

**Solutions**:
```bash
# Validate environment variables
echo $NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID
echo $STRIPE_API_KEY
```

Use Stripe test cards for verification:
- Successful payment: `4242 4242 4242 4242`
- Payment failure: `4000 0000 0000 0002`

Ensure price IDs in `.env.local` match those in Stripe Dashboard under Products & Prices.

**Section sources**
- [lib/stripe.ts](file://lib/stripe.ts)
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#stripe-integration-patterns)

## Deployment and Runtime Issues

### Build Failures
**Description**: Application fails to build for production.

**Likely Causes**:
- TypeScript compilation errors
- Missing environment variables
- Prisma client not generated

**Diagnosis**:
1. Run TypeScript check: `pnpm tsc --noEmit`
2. Verify all required environment variables are set
3. Check if Prisma client is generated

**Solutions**:
```bash
# Check for TypeScript errors
pnpm tsc --noEmit

# Generate Prisma client
npx prisma generate

# Build application
pnpm build
```

Ensure the postinstall script runs automatically to generate the Prisma client.

**Section sources**
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#testing--development)
- [package.json](file://package.json)

### Runtime Errors
**Description**: Application crashes or behaves unexpectedly during runtime.

**Likely Causes**:
- Server-side environment variables not properly configured
- Database connection timeouts
- Memory leaks in server components

**Diagnosis**:
1. Check server logs for error messages
2. Monitor database connection status
3. Test individual API routes

**Solutions**:
```bash
# Test API routes individually
curl http://localhost:3000/api/user
curl http://localhost:3000/api/webhooks/stripe
```

Implement proper error handling and logging in server actions and API routes.

**Section sources**
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#error-handling)

## Logging and Debugging Techniques

### Next.js Specific Debugging
**Description**: Methods for debugging issues specific to Next.js applications.

**Techniques**:
1. **Server Component Debugging**:
```typescript
// Add debug logs in server components
console.log("User data:", user);
console.log("Subscription plan:", subscriptionPlan);
```

2. **Client Component Debugging**:
```typescript
"use client";
import { useEffect } from "react";

useEffect(() => {
  console.log("Component mounted");
  console.log("Props:", props);
}, [props]);
```

3. **API Route Testing**:
```bash
# Test authentication API
curl -v http://localhost:3000/api/auth/session

# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhooks/stripe
```

4. **Environment Validation**:
```bash
# List all environment variables
printenv | grep NEXT_PUBLIC
printenv | grep STRIPE
```

5. **Prisma Debugging**:
```bash
# Enable Prisma debug logging
npx prisma generate --schema=prisma/schema.prisma --debug

# Use Prisma Studio
npx prisma studio
```

**Section sources**
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#testing--development)
- [lib/db.ts](file://lib/db.ts)
- [app/api/webhooks/stripe/route.ts](file://app/api/webhooks/stripe/route.ts)