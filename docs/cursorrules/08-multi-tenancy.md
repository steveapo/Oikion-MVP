# Multi-Tenancy Architecture & Patterns

## Multi-Tenancy Model

### Soft Multi-Tenancy
- Shared database for all organizations
- Organization-level data isolation
- Row-level security via queries
- Cost-effective and scalable
- Single deployment

### Organization Entity
- Central tenant identifier
- organizationId on all tenant data
- Organization table with metadata
- Plan level (FREE, STARTER, PRO)
- Personal organization flag

## Organization Structure

### Organization Model
- id: Unique identifier (cuid)
- name: Display name
- plan: Subscription tier
- isPersonal: Personal workspace flag
- createdAt, updatedAt: Timestamps
- Relations: users, properties, clients, etc.

### Organization Membership
- OrganizationMember join table
- userId + organizationId (unique together)
- role: User's role in this organization
- joinedAt: Membership timestamp
- Many-to-many relationship

### User-Organization Relationship
- User can be member of multiple organizations
- Active organization in user.organizationId
- Switch organizations via UI
- Personal organization always present
- Memberships array on User model

## Data Isolation Patterns

### prismaForOrg Helper
- Returns Prisma client scoped to organization
- Automatically filters by organizationId
- Use for all multi-tenant queries
- Prevents cross-organization access
- Type-safe with Prisma client

### Query Scoping
- Every tenant data query includes where: { organizationId }
- Enforced at application level
- No database-level isolation
- Requires discipline
- Helper function enforces

### Server Action Context
- organizationId in ActionContext
- Provided by safeAction wrapper
- Available to all action handlers
- Used with prismaForOrg
- Type-safe access

## Personal Organizations

### Purpose
- Every user gets personal workspace
- Fallback for organization-less data
- Cannot be deleted
- One per user guaranteed
- Different business rules

### Creation
- Created automatically on user registration
- Name: "[User Name]'s Personal Workspace"
- isPersonal: true flag
- User is ORG_OWNER
- Added to user's memberships

### Protection
- Cannot delete personal organization
- Enforced in delete action
- UI hides delete option
- Error if attempted
- Always accessible to user

## Organization Switching

### Switch Mechanism
- Update user.organizationId in database
- Update session organizationId
- Revalidate relevant caches
- Redirect to dashboard
- New organization context active

### Organization Switcher UI
- Dropdown in dashboard header
- Lists all user memberships
- Shows active organization
- Personal workspace first
- Instant switching

### Session Update
- switchOrganization server action
- Verifies user membership
- Updates user record
- Session reflects change
- Consistent across tabs

## Invitation System

### Invitation Flow
- Admin/Owner sends invitation to email
- Token generated and stored
- Email sent with invitation link
- Recipient clicks link
- New user registers or existing user accepts
- Membership created

### Invitation Model
- email: Invitee email address
- token: Unique token (secure)
- role: Role to grant
- organizationId: Target organization
- expiresAt: Expiration timestamp
- status: PENDING, ACCEPTED, EXPIRED

### Accepting Invitations
- Token validated
- User authenticated or registers
- Membership created
- Invitation marked accepted
- User switched to new organization
- Welcome email sent

## Role Management

### Per-Organization Roles
- Role stored in OrganizationMember
- Different role per organization
- Active role from current organization
- Role changes affect one organization
- Consistent permissions

### Role Hierarchy
- ORG_OWNER: Full control
- ADMIN: Manage members, settings
- AGENT: Create/edit content
- VIEWER: Read-only access
- Hierarchical permissions

### Updating Roles
- Only ORG_OWNER and ADMIN can update
- Cannot change own role (need another owner)
- Validate minimum one owner per organization
- Activity logged
- Real-time UI update

## Data Access Patterns

### Reading Data
- Always filter by current organizationId
- Use prismaForOrg for automatic scoping
- Include organizationId in cache keys
- Verify ownership for shared resources
- Handle not found vs forbidden

### Creating Data
- Include organizationId from context
- Verify user has create permission
- Log activity with organization context
- Revalidate organization-scoped caches
- Return created resource

### Updating Data
- Find resource by ID
- Verify belongs to current organization
- Check update permissions
- Update with validated data
- Log activity
- Revalidate caches

### Deleting Data
- Verify resource ownership
- Check delete permissions
- Handle cascade deletes
- Log deletion
- Revalidate all affected caches
- Soft delete if needed

## Organization Settings

### Organization Profile
- Name (changeable)
- Plan level (managed via Stripe)
- Member count
- Creation date
- Settings specific to organization

### Organization Limits
- Based on plan tier
- Properties limit
- Members limit
- Storage limit
- Feature flags per tier

### Subscription Management
- Stripe customer per organization
- Subscription linked to organization
- Billing managed by ORG_OWNER
- Upgrade/downgrade flows
- Webhook updates plan

## Cross-Organization Features

### None Currently
- No data sharing between organizations
- Complete isolation
- No cross-organization queries
- Simplifies security model
- Future: Shared properties marketplace

## Activity Logging

### Organization Context
- Every activity has organizationId
- Filters activity feed by organization
- Organization-wide audit trail
- Exportable for compliance
- Retention per organization

### Activity Types
- CREATED, UPDATED, DELETED, VIEWED
- Entity types: PROPERTY, CLIENT, TASK, etc.
- Actor (user who performed action)
- Payload (what changed)
- Timestamp

## Organization Deletion

### Deletion Flow
- Only ORG_OWNER can delete
- Cannot delete personal organization
- Confirm dialog (type organization name)
- Soft delete with deletedAt timestamp
- Cascade to all organization data
- Remove all memberships

### Data Retention
- 30-day grace period for soft delete
- Hard delete after grace period
- Export option before deletion
- Notify all members
- Irreversible after hard delete

## Caching Strategy

### Organization-Scoped Caches
- Include organizationId in cache keys
- Tag caches by organization
- Invalidate on organization switch
- Per-organization data freshness
- No cross-organization cache pollution

### Cache Tags
- properties-{orgId}
- clients-{orgId}
- members-{orgId}
- activities-{orgId}
- Granular invalidation

## Migration Between Organizations

### Not Supported Currently
- Data cannot move between organizations
- Would require complex permissions
- Export/import as workaround
- Future: Data transfer requests
- Maintain isolation

## Performance Considerations

### Index Strategy
- Composite indexes: [organizationId, status]
- Organizationid indexed on all tenant tables
- Query performance optimization
- Analyze slow queries
- Add indexes as needed

### Query Optimization
- Select only needed fields
- Limit results with pagination
- Use cursor pagination for large sets
- Cache expensive queries
- Monitor query performance

### Connection Pooling
- Shared connection pool
- No per-organization connections
- Scales to many organizations
- Serverless friendly
- Monitor connection usage

## Security Considerations

### Mandatory Organization Checks
- Never query without organizationId
- Use prismaForOrg consistently
- Code review for org checks
- Automated testing
- Security boundary

### Session Hijacking Prevention
- Session tied to organizationId
- Organization switch updates session
- Verify organization membership
- Timeout idle sessions
- Monitor suspicious switches

### API Endpoints
- Extract organizationId from session
- Verify membership
- Scope all queries
- Return 403 for wrong org
- Log access attempts

## Testing Multi-Tenancy

### Isolation Testing
- Create test organizations
- Verify no data leakage
- Query with wrong orgId fails
- Switch organizations
- Verify correct data displayed

### Permission Testing
- Test each role's permissions
- Verify role hierarchy
- Test organization switching
- Test invitation flow
- Test deletion protection

## Common Pitfalls

### Forgetting organizationId
- Always include in queries
- Use prismaForOrg helper
- Code review catches misses
- Automated linting possible
- Security vulnerability if missed

### Hard-Coded Organization IDs
- Never hard-code organizationId values
- Always from context or session
- Test data uses variables
- Seed scripts parameterized
- No magic strings

### Missing Membership Check
- Verify user is member before access
- Check before organization switch
- Validate invitations
- Enforce on all endpoints
- Critical security check

## Scalability

### Current Limits
- No practical limit on organizations
- Database indexed appropriately
- Single database instance
- Horizontal scaling of app servers
- Consider sharding if huge scale

### Future Considerations
- Database sharding by organization
- Separate databases for large customers
- Read replicas for reporting
- Caching layer (Redis)
- CDN for static assets

## Best Practices Summary

1. Always use prismaForOrg for organization-scoped queries
2. Include organizationId in all tenant data models
3. Verify user membership before organization switch
4. Personal organization cannot be deleted
5. Log all activities with organization context
6. Index organizationId on all tenant tables
7. Use composite indexes for common queries
8. Test data isolation thoroughly
9. Cache with organization-specific keys
10. Document organization-specific business rules

## Organization Limits by Plan

### FREE Plan
- 1 organization (personal only)
- 10 properties
- 1 team member (user only)
- Basic features
- Community support

### STARTER Plan
- Unlimited organizations
- 100 properties per organization
- 5 team members per organization
- Standard features
- Email support

### PRO Plan
- Unlimited organizations
- Unlimited properties
- Unlimited team members
- All features
- Priority support
- Advanced analytics

## Implementation Checklist

- [ ] organizationId on all tenant data models
- [ ] prismaForOrg helper implemented
- [ ] Server actions use ActionContext
- [ ] Organization switcher in UI
- [ ] Personal organization created on signup
- [ ] Personal organization delete prevention
- [ ] Invitation system functional
- [ ] Role management per organization
- [ ] Activity logging includes organizationId
- [ ] Indexes on organizationId fields
- [ ] Cache keys include organizationId
- [ ] Isolation tested thoroughly
- [ ] Organization deletion flow works
- [ ] Subscription tied to organization
- [ ] All memberships queryable

## Version Information

Multi-Tenancy Pattern: Soft (Shared Database)
Established: Project inception
Stability: Production-ready

