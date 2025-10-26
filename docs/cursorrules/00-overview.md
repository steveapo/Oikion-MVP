# Oikion - Project Overview & Core Principles

## Project Identity

Oikion is a real estate agency operating system built on Next.js 14 with multi-tenancy, role-based access control, and comprehensive property/client management capabilities.

## Technology Stack

### Core Framework
- Next.js 14.2.5 with App Router architecture
- React 18.3.1 with Server Components as default
- TypeScript 5.5.3 with partial strict mode
- Node.js target ES5 for compatibility

### Database & ORM
- PostgreSQL hosted on Neon (serverless)
- Prisma ORM 5.17.0 for type-safe database access
- Row-level security patterns with organization isolation
- prisma-field-encryption for sensitive data

### Authentication & Authorization
- Auth.js v5 (next-auth beta) for authentication
- Custom RBAC with four roles: ORG_OWNER, ADMIN, AGENT, VIEWER
- Multi-tenancy with organization-based isolation
- Session-based auth with database sessions

### UI & Styling
- Tailwind CSS 3.4.6 for utility-first styling
- shadcn/ui component library (Radix UI primitives)
- class-variance-authority (CVA) for component variants
- next-themes for dark mode support
- Lucide React for icons

### Payment & Subscriptions
- Stripe integration for payment processing
- Webhook handling for subscription events
- Three-tier subscription model: FREE, STARTER, PRO

### Email & Communication
- Resend for email delivery
- React Email for email templates
- Dev mode email testing without actual sending

### Content Management
- Contentlayer2 for MDX processing
- Blog, guides, and documentation pages
- Shiki for syntax highlighting in docs

### State & Forms
- React Hook Form 7.52.1 for form management
- Zod 3.23.8 for schema validation
- Server actions for mutations
- Optimistic updates where appropriate

## Architecture Principles

### Server-First Architecture
- Default to Server Components for better performance
- Client Components only when interactivity required
- Server actions for all data mutations
- API routes only for webhooks and external integrations

### Multi-Tenancy Model
- Organization-based isolation (soft multi-tenancy)
- Every user belongs to one or more organizations
- Personal workspace created for every user
- Active organization tracked in user session
- Row-level security enforced at query level

### Data Flow Patterns
- Server actions return ActionResult<T> with success/error structure
- All mutations invalidate appropriate cache tags
- Optimistic UI updates for instant feedback
- Activity logging for audit trail

### Security Model
- Organization context required for all protected operations
- Role-based permissions checked before mutations
- CSRF protection via Auth.js
- Encrypted fields for sensitive data (e.g., passwords if stored)

### Performance Optimizations
- Aggressive bundle splitting by feature
- Tree-shaking for icon and UI imports
- Modular imports configured in next.config.js
- Image optimization with Next.js Image component
- Surgical cache invalidation with tags

## File Organization Philosophy

### Colocation by Feature
- Related components grouped by domain (properties, relations, members)
- Shared/reusable components in shared/ or ui/
- Feature-specific logic stays with feature components

### Naming Conventions
- Files: kebab-case for all files (user-auth-form.tsx)
- Components: PascalCase (UserAuthForm)
- Server actions: camelCase (createProperty)
- Database models: PascalCase singular (Property, Client)
- Database tables: snake_case plural via @@map

### Import Path Strategy
- Always use @/* alias for absolute imports
- Never use relative imports across features
- Relative imports only within same feature/directory
- Import order enforced by Prettier plugin

## Code Quality Standards

### TypeScript Usage
- Explicit return types on public functions
- Interface over type for object shapes
- Enums from Prisma for status/role types
- Avoid any, use unknown for truly dynamic data
- strictNullChecks enabled, handle null/undefined

### Error Handling
- Server actions return ActionResult with error codes
- User-facing error messages are descriptive
- Technical errors logged server-side
- Activity logging failures never break main operation

### Testing Philosophy
- No automated test suite currently
- Manual testing checklist in docs
- Staging environment for pre-production validation

## Development Workflow

### Package Management
- pnpm as exclusive package manager
- Lock file must be updated for all dependency changes
- Workspace configuration in pnpm-workspace.yaml

### Database Workflow
- Schema changes via Prisma schema.prisma
- Migrations generated with prisma migrate dev
- Production migrations via prisma migrate deploy
- Always regenerate client after schema changes

### Environment Management
- .env.local for local development
- env.mjs for environment validation with T3 Env
- Strict validation on build prevents runtime errors

### Git Conventions
- Conventional commits enforced via commitlint
- Husky pre-commit hooks run prettier
- No direct commits to main without review
- Feature branches for all development

## Key Constraints & Considerations

### Performance Budget
- First Contentful Paint (FCP) under 1.8s
- Time to Interactive (TTI) under 3.9s
- Bundle size monitored via bundle analyzer

### Browser Support
- Modern browsers (last 2 versions)
- ES5 target ensures wide compatibility
- Graceful degradation for older browsers

### Accessibility
- WCAG 2.1 AA compliance target
- Semantic HTML throughout
- ARIA labels where needed
- Keyboard navigation support

### Internationalization
- Previously had i18n, now removed
- Single language (English) currently
- Infrastructure can be re-added if needed

## Common Patterns & Idioms

### Component Patterns
- Async Server Components for data fetching
- Skeleton components for loading states
- Error boundaries at page level
- Suspense for streaming where beneficial

### Data Fetching
- Server Components fetch directly from database
- unstable_cache for expensive queries
- Cache tags for granular invalidation
- No client-side fetching except for real-time features

### Form Handling
- Server actions called from form actions or transitions
- Zod schemas define validation rules
- Field errors displayed inline
- Success feedback via toast notifications

### Layout Patterns
- Route groups for layout organization
- Nested layouts for common shells
- Dynamic segments for ID-based routes
- Loading.tsx for automatic loading UI

## Project-Specific Domain Knowledge

### Real Estate Entities
- Properties: MLS listings with images, details, status
- Clients: Contacts with relationship types (buyer, seller, tenant)
- Interactions: Communications logged with clients
- Tasks: Action items assigned to team members
- Activities: Audit log of all system actions

### Organization Management
- Organizations called "workspaces" in UI
- Personal workspace cannot be deleted
- Organization switcher in dashboard header
- Members can be invited via email token

### Subscription Tiers
- FREE: Basic features, limited listings
- STARTER: More listings, team members
- PRO: Unlimited, advanced features, priority support

## Documentation References

For detailed rules on specific aspects, see:
- 01-typescript-conventions.md - TypeScript patterns and types
- 02-nextjs-patterns.md - Next.js App Router usage
- 03-prisma-database.md - Database schema and queries
- 04-server-actions.md - Mutation patterns
- 05-ui-components.md - Component architecture
- 06-forms-validation.md - Form handling patterns
- 07-auth-security.md - Authentication and permissions
- 08-multi-tenancy.md - Organization isolation
- 09-styling-design.md - CSS and design system
- 10-testing-quality.md - Quality assurance practices

## Version Information

Last Updated: October 25, 2025
Oikion Version: 0.3.1
Next.js: 14.2.5
Documentation Structure: Established 2025-10-25

