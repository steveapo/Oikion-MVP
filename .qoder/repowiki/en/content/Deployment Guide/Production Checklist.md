# Production Checklist

<cite>
**Referenced Files in This Document**   
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md)
- [ENVIRONMENT_SETUP_GUIDE.md](file://ENVIRONMENT_SETUP_GUIDE.md)
- [lib/db.ts](file://lib/db.ts)
- [env.mjs](file://env.mjs)
- [app/api/webhooks/stripe/route.ts](file://app/api/webhooks/stripe/route.ts)
- [lib/stripe.ts](file://lib/stripe.ts)
</cite>

## Table of Contents
1. [Security Hardening](#security-hardening)
2. [Performance Optimization](#performance-optimization)
3. [Reliability Considerations](#reliability-considerations)
4. [Database Migration Procedures](#database-migration-procedures)
5. [Monitoring Recommendations](#monitoring-recommendations)
6. [Compliance Requirements](#compliance-requirements)

## Security Hardening

### NEXTAUTH_SECRET Validation
- Ensure `AUTH_SECRET` is set with a cryptographically secure random string of at least 32 characters
- Verification: Check `.env.local` contains `AUTH_SECRET` with sufficient length and complexity
- Use `openssl rand -base64 32` or https://generate-secret.vercel.app/32 to generate
- Never commit this value to version control

### Stripe Webhook Signature Validation
- Webhook signatures are validated using `STRIPE_WEBHOOK_SECRET`
- Implementation: `app/api/webhooks/stripe/route.ts` uses `stripe.webhooks.constructEvent()` to verify signatures
- Verification: Confirm webhook endpoint correctly handles events and rejects invalid signatures
- Test using Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Environment Variable Protection
- Server-side secrets (`STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `AUTH_SECRET`) must not be exposed client-side
- Client-side variables must be prefixed with `NEXT_PUBLIC_`
- Verification: Run `grep -r "process.env" . --include="*.ts" --include="*.tsx"` and confirm no sensitive keys are exposed
- Type-safe validation implemented via `@t3-oss/env-nextjs` in `env.mjs`

### Authentication and Session Security
- All protected routes use middleware for authentication enforcement
- Protected routes located in `app/(protected)/`
- Session validation performed using `auth()` from `@/auth`
- Verification: Attempt unauthenticated access to protected routes and confirm redirection to login

**Section sources**
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#L193-L261)
- [ENVIRONMENT_SETUP_GUIDE.md](file://ENVIRONMENT_SETUP_GUIDE.md#L44-L86)
- [env.mjs](file://env.mjs#L1-L48)

## Performance Optimization

### Image Optimization
- All images use Next.js `Image` component with specified dimensions
- Remote patterns restricted to trusted domains in `next.config.js`
- Blur placeholders generated using `getBlurDataURL()` utility
- Verification: Audit all image components and confirm proper usage of width/height props

### Compression and Delivery
- Static assets automatically compressed by Next.js build process
- Dynamic content compression handled by hosting platform (Vercel)
- Font optimization implemented with `next/font`
- Verification: Use browser DevTools to confirm assets are served with gzip/brotli compression

### Metadata and OG Image Optimization
- Dynamic OG images generated via `app/api/og/route.tsx` using `@vercel/og`
- Metadata constructed using `constructMetadata()` utility function
- Verification: Test OG image generation by visiting `/api/og` endpoint

### Caching Strategy
- Prisma client cached in development using global variable pattern
- Server Actions automatically benefit from Next.js caching mechanisms
- Verification: Confirm `lib/db.ts` implements proper caching pattern for Prisma client

**Section sources**
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#L537-L568)
- [lib/db.ts](file://lib/db.ts#L5-L17)
- [app/api/og/route.tsx](file://app/api/og/route.tsx#L108-L157)

## Reliability Considerations

### Error Handling Implementation
- Centralized error handling pattern using try-catch blocks
- User-friendly error messages returned without exposing stack traces
- Server Actions include proper error handling with logging
- Verification: Test error conditions and confirm appropriate user feedback

### Logging Setup
- Console logging used for development errors
- Production logging should be integrated with monitoring services
- Critical operations (Stripe webhooks, database mutations) include error logging
- Verification: Review error handling in `app/api/webhooks/stripe/route.ts`

### Toast Notifications
- User feedback implemented using `sonner` toast notifications
- Success and error states properly communicated to users
- Verification: Test form submissions and confirm appropriate toast messages appear

### Input Validation
- All user input validated using Zod schemas
- Validation schemas located in `lib/validations/`
- Server Actions validate input before processing
- Verification: Attempt invalid inputs and confirm validation errors

**Section sources**
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#L498-L536)
- [app/api/webhooks/stripe/route.ts](file://app/api/webhooks/stripe/route.ts#L5-L77)

## Database Migration Procedures

### Prisma Migrate in Production
- Use `prisma migrate deploy` for production deployments (never `prisma migrate dev`)
- `prisma migrate dev` should only be used in development
- Verification: Check deployment scripts and confirm `prisma migrate deploy` is used
- Database URL must point to production database

### Migration Safety Practices
- Always backup production database before applying migrations
- Test migrations on staging environment first
- Use transactional operations for data modifications
- Verification: Review recent migration history and confirm safe practices

### Prisma Client Initialization
- Prisma client properly initialized with caching in development
- Production instances create fresh client connections
- Implementation: `lib/db.ts` handles environment-specific initialization
- Verification: Confirm no memory leaks in development due to client instantiation

**Section sources**
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#L244-L261)
- [lib/db.ts](file://lib/db.ts#L5-L17)
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#L571-L578)

## Monitoring Recommendations

### Error Tracking Setup
- Integrate Sentry for comprehensive error tracking
- Configure LogRocket for session replay and frontend monitoring
- Set up alerting for critical errors
- Verification: Confirm error tracking service is initialized in application

### Uptime Monitoring
- Implement uptime monitoring using services like UptimeRobot or Pingdom
- Monitor critical endpoints: API routes, webhook endpoints, authentication
- Set up alerts for downtime with appropriate thresholds
- Verification: Confirm monitoring is active and receiving heartbeats

### Logging and Analytics
- Enable Vercel Analytics via `components/analytics.tsx`
- Implement structured logging for server-side operations
- Monitor Stripe webhook delivery success rates
- Verification: Check analytics dashboard and confirm data is being collected

**Section sources**
- [components/analytics.tsx](file://components/analytics.tsx#L0-L6)
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#L600-L630)

## Compliance Requirements

### GDPR Compliance for User Data
- Implement data subject request handling procedures
- Provide clear privacy policy and cookie consent
- Enable user data export and deletion functionality
- Minimize data collection to only what's necessary
- Verification: Test data export/delete functionality

### PCI-DSS Considerations for Stripe Integration
- Never store sensitive payment information in application database
- Use Stripe.js for client-side payment collection
- Ensure SSL/TLS is enforced for all pages handling payment information
- Regularly review Stripe security checklist
- Verification: Confirm no payment details are stored in database

### Data Retention Policy
- Implement appropriate data retention periods
- Anonymize or delete user data upon account deletion
- Document data retention policies
- Verification: Review account deletion process and confirm data cleanup

**Section sources**
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#L600-L630)
- [ENVIRONMENT_SETUP_GUIDE.md](file://ENVIRONMENT_SETUP_GUIDE.md#L129-L148)