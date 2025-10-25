# Architecture Documentation

High-level system architecture, design decisions, and technical specifications for the Oikion platform.

## Backend Architecture

The backend documentation covers the server-side architecture, database design, and API patterns:

- **[Backend Overview](backend/index.md)** - Complete backend architecture overview
- **[Database Design](backend/database.md)** - PostgreSQL schema, Prisma, and data modeling
- **[API Routes](backend/api-routes.md)** - REST API endpoint structure and patterns
- **[Server Actions](backend/server-actions.md)** - Server-side actions pattern and usage
- **[Auth & Integrations](backend/auth-and-integrations.md)** - Authentication system and third-party integrations

## Key Architectural Patterns

### Multi-Tenancy
The system implements organization-based multi-tenancy with row-level security (RLS):
- Each user belongs to one or more organizations
- Data is isolated by organization using Prisma middleware
- Personal workspaces provide single-user organization functionality

### Authentication & Authorization
- **Auth.js v5** for authentication
- **Role-Based Access Control (RBAC)** with four roles:
  - `ORG_OWNER` - Full organization control
  - `ADMIN` - Administrative functions
  - `AGENT` - Standard user access
  - `VIEWER` - Read-only access
- **Session management** with secure token handling

### Data Layer
- **PostgreSQL** via Neon for serverless scalability
- **Prisma ORM** for type-safe database access
- **Row-level security** implemented at application layer
- **Migrations** managed through Prisma Migrate

### API Design
- **Server Actions** for mutations (preferred)
- **API Routes** for external integrations and webhooks
- **tRPC-style** type safety without tRPC
- **Zod validation** for all inputs

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | Auth.js v5 |
| Payments | Stripe |
| Email | Resend |
| UI | Tailwind CSS + shadcn/ui |
| File Storage | (to be documented) |

## Related Documentation

- [Implementation Complete](../implementation/IMPLEMENTATION_COMPLETE.md) - Full implementation overview
- [Security Multi-Tenancy Plan](../implementation/SECURITY_MULTI_TENANCY_PLAN.md) - Security architecture details
- [Migration Summary](../implementation/MIGRATION_SUMMARY.md) - Database migrations

---

**Last Updated**: October 25, 2025
**Audience**: Architects, Senior Developers, Technical Leads
