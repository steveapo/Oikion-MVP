# Multi-Tenancy & Row-Level Security (RLS) Glossary

## Overview
This glossary explains multi-tenancy architecture, Row-Level Security (RLS), and tenant isolation patterns used in the Oikion application. For complete database rules, see [database.md](../rules/database.md).

## Core Concepts

### Multi-Tenancy

**Definition**: Architecture pattern where a single application instance serves multiple customers (tenants), each with isolated data

**Types**:
1. **Database per tenant** - Separate database for each tenant (expensive, complex)
2. **Schema per tenant** - Separate schema per tenant in one database (moderate complexity)
3. **Row-level isolation** - Single schema, data isolated by tenant ID (Oikion uses this)

**Why row-level isolation?**
- ✅ Cost-effective (single database)
- ✅ Easy maintenance (one schema)
- ✅ Scalable (add tenants without infrastructure changes)
- ✅ Secure (database-level enforcement via RLS)

---

### Tenant (Organization)

**Definition**: A single customer organization using the system (e.g., "ABC Real Estate Agency")

**In Oikion**:
- Each organization is a tenant
- Users belong to one organization at a time
- Data is scoped to organization

**Schema**:
```prisma
model Organization {
  id         String   @id @default(cuid())
  name       String
  isPersonal Boolean  @default(false)
  plan       OrganizationPlan @default(FREE)
  
  // Relationships
  properties Property[]
  clients    Client[]
  members    OrganizationMember[]
  activities Activity[]
}
```

**Key fields**:
- `id` - Tenant identifier (used for isolation)
- `isPersonal` - Personal workspace vs shared organization
- `plan` - Subscription tier (FREE, STARTER, PROFESSIONAL, ENTERPRISE)

---

### Row-Level Security (RLS)

**Definition**: PostgreSQL feature that enforces data access rules at the database level, filtering rows based on user context

**How it works**:
```sql
-- 1. Enable RLS on table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 2. Create policy (filter rule)
CREATE POLICY "org_isolation"
  ON properties
  FOR ALL
  USING (organization_id = current_setting('app.current_organization', TRUE));
```

**Behavior**:
```sql
-- User sets session variable
SELECT set_config('app.current_organization', 'org_123', TRUE);

-- Query sees ONLY rows matching that org
SELECT * FROM properties;
-- Returns only properties where organization_id = 'org_123'

-- Even malicious SQL can't bypass RLS
SELECT * FROM properties WHERE organization_id = 'org_456';
-- STILL returns only org_123's data!
```

**Benefits**:
- 🔒 **Security**: Can't bypass even with SQL injection
- 🛡️ **Defense in depth**: Protects against application bugs
- 🎯 **Automatic filtering**: No need for WHERE clauses in every query
- ✅ **Audit-friendly**: Enforced at database level

---

### Session Variables

**Definition**: PostgreSQL variables set per database connection to pass context (like current tenant)

**Pattern in Oikion**:
```typescript
// lib/org-prisma.ts
export function prismaForOrg(orgId: string): PrismaClient {
  const extension = Prisma.defineExtension((client) =>
    client.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            // Set session variable before EVERY query
            const [, result] = await client.$transaction([
              client.$executeRaw`SELECT set_config('app.current_organization', ${orgId}::text, TRUE)`,
              query(args),
            ]);
            return result;
          },
        },
      },
    })
  );
  
  return prisma.$extends(extension) as PrismaClient;
}
```

**How to use**:
```typescript
// ✅ ALWAYS use this for tenant data
const orgPrisma = prismaForOrg(user.organizationId);
const properties = await orgPrisma.property.findMany();

// ❌ NEVER use global prisma for tenant data
const properties = await prisma.property.findMany(); // WRONG! No isolation!
```

---

### Organization Scoping

**Definition**: Pattern of including `organizationId` in all tenant-specific models

**Schema pattern**:
```prisma
model Property {
  id             String   @id @default(cuid())
  organizationId String   // REQUIRED for tenant data
  
  // ... other fields
  
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@index([organizationId]) // REQUIRED for performance
  @@map("properties")
}
```

**Rules**:
1. **ALWAYS include `organizationId`** in tenant models
2. **ALWAYS index `organizationId`** for query performance
3. **Use `onDelete: Cascade`** for automatic cleanup
4. **Map to snake_case** table names (`@@map`)

**Tenant vs Global models**:

**Tenant-scoped (require organizationId)**:
- ✅ Property, Client, Interaction, Task, Note
- ✅ Activity, MediaAsset
- ✅ Organization, OrganizationMember

**Global (no organizationId)**:
- ✅ User, Account, Session
- ✅ VerificationToken
- ✅ Invitation (has organizationId but not RLS-protected)

---

## RLS Implementation Details

### Tables with RLS Enabled

All tenant-scoped tables in Oikion:
```sql
-- MLS
properties
addresses
listings
media_assets

-- CRM
clients
client_relationships
interactions
tasks
notes

-- Activity
activities

-- Org management
organizations
organization_members
```

### RLS Policy Pattern

**Standard policy (for all tenant tables)**:
```sql
-- Policy 1: Users can only access their org's data
CREATE POLICY "org_isolation"
  ON properties
  FOR ALL  -- Applies to SELECT, INSERT, UPDATE, DELETE
  USING (
    organization_id = current_setting('app.current_organization', TRUE)
  );

-- Policy 2: Bypass for superuser/migrations
CREATE POLICY "bypass_rls_for_service_role"
  ON properties
  FOR ALL
  TO service_role  -- PostgreSQL role for admin operations
  USING (true);
```

**Why two policies?**
1. First policy: Enforces isolation for application users
2. Second policy: Allows migrations and admin tools to work

### Testing RLS Isolation

**Script**: `scripts/verify-rls-isolation.ts`

```typescript
// Test cross-tenant isolation
const org1Prisma = prismaForOrg('org_1');
const org2Prisma = prismaForOrg('org_2');

// Create property in org 1
const property = await org1Prisma.property.create({
  data: {
    organizationId: 'org_1',
    // ...
  },
});

// Try to access from org 2 (should fail)
const result = await org2Prisma.property.findUnique({
  where: { id: property.id },
});

assert(result === null, "RLS isolation broken!"); // Should be null
```

---

## Multi-Tenancy Patterns

### Pattern 1: Organization Membership

**Concept**: Users can belong to multiple organizations

**Schema**:
```prisma
model User {
  id             String   @id @default(cuid())
  organizationId String?  // Current active organization
  
  // User can be member of multiple orgs
  memberships OrganizationMember[]
  
  organization Organization? @relation(fields: [organizationId], references: [id])
}

model OrganizationMember {
  id             String   @id @default(cuid())
  userId         String
  organizationId String
  role           UserRole @default(AGENT)
  joinedAt       DateTime @default(now())
  
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@unique([userId, organizationId]) // User can only be in org once
}
```

**Behavior**:
- User has one **active** organization (`user.organizationId`)
- User can **switch** between organizations
- Each membership has its own role

---

### Pattern 2: Personal Workspaces

**Concept**: Every user gets a personal organization (private workspace)

**Implementation**:
```typescript
// auth.ts - createUser event
async createUser({ user }) {
  // ALWAYS create personal organization
  const personalOrg = await prisma.organization.create({
    data: {
      name: "Private Workspace",
      isPersonal: true,
      plan: "FREE",
    },
  });
  
  await prisma.organizationMember.create({
    data: {
      userId: user.id,
      organizationId: personalOrg.id,
      role: "ORG_OWNER",
    },
  });
  
  // Set as active organization
  await prisma.user.update({
    where: { id: user.id },
    data: {
      organizationId: personalOrg.id,
      role: "ORG_OWNER",
    },
  });
}
```

**Why?**
- User has workspace immediately after signup
- No need to create/join organization first
- Can be invited to shared orgs later

---

### Pattern 3: Invitation Flow

**Concept**: Invite users to join organization by email

**Flow**:
```typescript
// 1. Send invitation
const invitation = await prisma.invitation.create({
  data: {
    email: "user@example.com",
    role: "AGENT",
    organizationId: "org_123",
    token: generateToken(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "PENDING",
  },
});

// 2. User signs up or logs in
// 3. Check for pending invitation
const invitation = await prisma.invitation.findFirst({
  where: {
    email: user.email,
    status: "PENDING",
    expiresAt: { gt: new Date() },
  },
});

// 4. Create membership
if (invitation) {
  await prisma.organizationMember.create({
    data: {
      userId: user.id,
      organizationId: invitation.organizationId,
      role: invitation.role,
    },
  });
  
  // Mark accepted
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: "ACCEPTED" },
  });
}
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Forgetting `prismaForOrg()`

**Problem**:
```typescript
// ❌ WRONG - No tenant isolation!
const properties = await prisma.property.findMany();
```

**Solution**:
```typescript
// ✅ CORRECT - Tenant-scoped
const orgPrisma = prismaForOrg(user.organizationId);
const properties = await orgPrisma.property.findMany();
```

**Detection**: Code review, linting rule (future enhancement)

---

### Pitfall 2: Missing `organizationId` in WHERE clause

**Problem**: Relying ONLY on RLS without explicit filter

```typescript
// Works but not explicit
const property = await orgPrisma.property.findFirst({
  where: { id: propertyId },
  // RLS filters automatically, but not obvious in code
});
```

**Better**:
```typescript
// ✅ Explicit filter (self-documenting)
const property = await orgPrisma.property.findFirst({
  where: {
    id: propertyId,
    organizationId: user.organizationId, // Explicit
  },
});
```

**Why**: Makes intent clear, easier to audit

---

### Pitfall 3: RLS Not Enabled

**Problem**: Forgot to enable RLS in migration

**Solution**: Verify in migration
```sql
-- Always include in migrations
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON new_table
  FOR ALL USING (organization_id = current_setting('app.current_organization', TRUE));
```

**Test**: Run `scripts/verify-rls-status.sql`
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('properties', 'clients', 'tasks', ...);
-- rowsecurity should be 'true' for all tenant tables
```

---

### Pitfall 4: N+1 Queries with Tenant Scoping

**Problem**: Setting session variable for each query
```typescript
// ❌ Slow - sets variable N times
for (const property of properties) {
  const orgPrisma = prismaForOrg(property.organizationId);
  const address = await orgPrisma.address.findUnique({ ... });
}
```

**Solution**: Use `include` or single query
```typescript
// ✅ Fast - sets variable once
const orgPrisma = prismaForOrg(user.organizationId);
const properties = await orgPrisma.property.findMany({
  include: { address: true }, // Single query with join
});
```

---

## Security Best Practices

### ✅ DO
- Always use `prismaForOrg()` for tenant data
- Enable RLS on all tenant tables
- Test cross-tenant isolation regularly
- Include `organizationId` in all tenant models
- Index `organizationId` for performance
- Use `onDelete: Cascade` for cleanup
- Validate user belongs to organization before operations

### ❌ DON'T
- Don't use global `prisma` for tenant data
- Don't trust client-provided `organizationId`
- Don't skip RLS policies ("I'll add it later")
- Don't expose tenant IDs to other tenants
- Don't rely ONLY on application-level filtering
- Don't modify RLS policies in production without testing

---

## Migration Checklist

When adding new tenant table:
- [ ] Add `organizationId` field
- [ ] Create foreign key to `organizations`
- [ ] Set `onDelete: Cascade`
- [ ] Add index on `organizationId`
- [ ] Enable RLS: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- [ ] Create isolation policy
- [ ] Create service role bypass policy
- [ ] Test cross-tenant isolation
- [ ] Update `prismaForOrg()` if needed (usually automatic)

---

## Testing Isolation

### Manual Test
```typescript
// Create data in org 1
const org1Prisma = prismaForOrg('org_1');
const property1 = await org1Prisma.property.create({
  data: { organizationId: 'org_1', /* ... */ },
});

// Try to access from org 2
const org2Prisma = prismaForOrg('org_2');
const leaked = await org2Prisma.property.findUnique({
  where: { id: property1.id },
});

console.assert(leaked === null, "RLS broken! Data leaked!");
```

### Automated Test
```typescript
// __tests__/lib/rls-isolation.test.ts
describe('RLS Isolation', () => {
  it('prevents cross-tenant access', async () => {
    const org1 = await createTestOrg('org1');
    const org2 = await createTestOrg('org2');
    
    const property = await createProperty({ organizationId: org1.id });
    
    const org2Prisma = prismaForOrg(org2.id);
    const result = await org2Prisma.property.findUnique({
      where: { id: property.id },
    });
    
    expect(result).toBeNull();
  });
});
```

---

## Performance Considerations

### Indexing
```sql
-- REQUIRED for tenant queries
CREATE INDEX idx_properties_organization_id ON properties(organization_id);

-- Composite indexes for common filters
CREATE INDEX idx_properties_org_status ON properties(organization_id, status);
CREATE INDEX idx_clients_org_type ON clients(organization_id, client_type);
```

### Connection Pooling
- Neon handles connection pooling automatically
- Session variables are per-connection
- `prismaForOrg()` sets variable in transaction (isolated)

---

## Related Files

- [database.md](../rules/database.md) - Complete database rules
- [authentication.md](../rules/authentication.md) - User & org management
- [`lib/org-prisma.ts`](../../lib/org-prisma.ts) - Tenant-scoped Prisma client
- [`prisma/schema.prisma`](../../prisma/schema.prisma) - Data models

## Resources

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Prisma Multi-Tenancy Guide](https://www.prisma.io/docs/guides/deployment/multi-tenancy)
- [Neon Row-Level Security](https://neon.tech/docs/guides/row-level-security)
- [Multi-Tenant SaaS Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)
