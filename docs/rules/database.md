# Database Rules & Prisma Standards

## Overview
This document defines database architecture, Prisma ORM patterns, Row-Level Security (RLS), and data integrity rules for the Oikion application. All database operations must follow these standards to ensure data security, consistency, and multi-tenant isolation.

## Database Stack

### Technology
- **Database**: PostgreSQL 15+ (via Neon serverless)
- **ORM**: Prisma 5.17.0
- **Migration Strategy**: Prisma Migrate
- **Connection**: Pooled connections via Neon

### Configuration Files
- [`prisma/schema.prisma`](../../prisma/schema.prisma) - Schema definition
- [`lib/db.ts`](../../lib/db.ts) - Prisma client instance
- [`lib/org-prisma.ts`](../../lib/org-prisma.ts) - Organization-scoped client
- [`DATABASE_URL`](../../env.mjs) - Connection string (environment variable)

## Prisma Client Patterns

### 1. Standard Client Usage (Non-Tenant Data)

```typescript
import { prisma } from "@/lib/db";

// ✅ For global data (User, Account, Session)
async function getUserById(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}
```

**When to use:**
- User authentication/profile management
- Account linkage (OAuth providers)
- Session management
- Global system operations (non-tenant specific)

### 2. Organization-Scoped Client (Tenant Data)

```typescript
import { prismaForOrg } from "@/lib/org-prisma";

// ✅ REQUIRED for all tenant-specific data
async function getProperties(organizationId: string) {
  const orgPrisma = prismaForOrg(organizationId);
  
  return await orgPrisma.property.findMany({
    where: { organizationId }, // Still include for clarity
    include: { address: true, listing: true },
  });
}
```

**When to use (MANDATORY):**
- Properties, Clients, Interactions, Tasks, Notes
- Organization settings
- Activities within organization
- ANY data that belongs to an organization

**How it works:**
```typescript
// Sets PostgreSQL session variable before each query
SELECT set_config('app.current_organization', 'org_123', TRUE);
-- Then RLS policies enforce tenant isolation
```

### 3. Client Initialization (lib/db.ts)

```typescript
import { PrismaClient } from "@prisma/client";

declare global {
  var cachedPrisma: PrismaClient;
}

export let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Development: reuse client across hot-reloads
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}
```

**Why:**
- Prevents "Too many connections" in development
- Single client instance in production
- Hot-reload compatible

## Row-Level Security (RLS)

### Overview
PostgreSQL RLS policies enforce tenant isolation at the database level. Even if application code has bugs, data cannot leak between organizations.

### Current RLS Tables

All tenant-scoped tables have RLS enabled:
- `properties`, `addresses`, `listings`, `media_assets`
- `clients`, `client_relationships`
- `interactions`, `tasks`, `notes`
- `activities`
- `organizations`, `organization_members`

### RLS Policy Pattern

**Standard policy (properties example):**
```sql
-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their org's data
CREATE POLICY "Users can access own organization data"
  ON properties
  FOR ALL
  USING (organization_id = current_setting('app.current_organization', TRUE));

-- Policy: Superuser bypass (for migrations, admin tools)
CREATE POLICY "Bypass for service role"
  ON properties
  FOR ALL
  TO service_role
  USING (true);
```

### Session Variable Usage

```typescript
// Automatically set by prismaForOrg()
SELECT set_config('app.current_organization', 'org_xyz123', TRUE);

// Query now only sees org_xyz123's data
SELECT * FROM properties; -- RLS filters automatically
```

### RLS Best Practices

**✅ DO:**
- Always use `prismaForOrg()` for tenant data
- Test cross-tenant isolation (see scripts/verify-*.ts)
- Include `organizationId` in WHERE clauses for clarity (even though RLS enforces it)
- Use database-level constraints (foreign keys, checks)

**❌ DON'T:**
- Rely solely on application-level filtering
- Use raw SQL without setting session variable
- Bypass RLS in application code (except admin tools with explicit checks)
- Assume RLS is enabled - verify in migrations

## Schema Design Principles

### 1. Multi-Tenancy Pattern

**Organization-Scoped Models:**
```prisma
model Property {
  id             String   @id @default(cuid())
  organizationId String   // REQUIRED for all tenant data
  
  // ... other fields
  
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@index([organizationId]) // REQUIRED for performance
  @@map("properties")
}
```

**Rules:**
- Every tenant model MUST have `organizationId`
- Index `organizationId` for query performance
- Use `onDelete: Cascade` for data cleanup
- Map to snake_case table names (`@@map`)

### 2. Audit Fields (Timestamps & Creators)

```prisma
model Client {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @default(now()) @updatedAt @map("updated_at")
  createdBy String
  
  creator User @relation("ClientCreatedBy", fields: [createdBy], references: [id])
  
  @@index([createdBy])
  @@map("clients")
}
```

**Required fields:**
- `id`: Always use `@default(cuid())` for unique IDs
- `createdAt`: Automatic timestamp on creation
- `updatedAt`: Automatic timestamp on updates (use `@updatedAt`)
- `createdBy`: User ID of creator (for ownership checks)

**Index rules:**
- Index all foreign keys
- Index frequently queried fields (status, type, dates)
- Composite indexes for common filter combinations

### 3. Enums for Fixed Sets

```prisma
enum UserRole {
  ORG_OWNER
  ADMIN
  AGENT
  VIEWER
}

enum PropertyStatus {
  AVAILABLE
  UNDER_OFFER
  SOLD
  RENTED
}
```

**Rules:**
- Use SCREAMING_SNAKE_CASE for enum values
- Define enums in schema (not at application level)
- Never add values that break backward compatibility
- Document enum meanings in comments

### 4. Relationships & Foreign Keys

**One-to-Many:**
```prisma
model Organization {
  id         String     @id @default(cuid())
  properties Property[]
}

model Property {
  id             String       @id
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@index([organizationId])
}
```

**One-to-One:**
```prisma
model Property {
  id      String   @id
  address Address? // Optional relation
}

model Address {
  id         String   @id
  propertyId String   @unique // ONE address per property
  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
}
```

**Many-to-Many (Self-Referential):**
```prisma
model Client {
  id                String               @id
  relationshipsFrom ClientRelationship[] @relation("RelationshipFrom")
  relationshipsTo   ClientRelationship[] @relation("RelationshipTo")
}

model ClientRelationship {
  id             String @id
  fromClientId   String
  toClientId     String
  relationshipType RelationshipType
  
  fromClient Client @relation("RelationshipFrom", fields: [fromClientId], references: [id], onDelete: Cascade)
  toClient   Client @relation("RelationshipTo", fields: [toClientId], references: [id], onDelete: Cascade)
  
  @@unique([fromClientId, toClientId]) // Prevent duplicates
  @@index([fromClientId])
  @@index([toClientId])
}
```

### 5. JSON Fields (Use Sparingly)

```prisma
model Property {
  features Json? // Dynamic key-value pairs
  // { "parking": true, "pool": false, "heating": "central" }
}
```

**When to use:**
- Flexible, non-queryable metadata
- User preferences
- Dynamic configuration

**When NOT to use:**
- Relationships (use proper foreign keys)
- Data that needs indexing/filtering
- Critical business logic fields

## Migrations

### 1. Creating Migrations

```bash
# Generate migration from schema changes
pnpm prisma migrate dev --name descriptive_name

# Example names:
# - add_client_relationships
# - add_property_status_index
# - enable_rls_on_tasks
```

### 2. Migration File Structure

```sql
-- Migration: 20251016_add_rls_policies/migration.sql

-- Step 1: Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Step 2: Create policies
CREATE POLICY "org_isolation" ON properties
  FOR ALL USING (
    organization_id = current_setting('app.current_organization', TRUE)
  );

-- Step 3: Create indexes (if needed)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_organization 
  ON properties(organization_id);
```

### 3. Migration Best Practices

**✅ DO:**
- Write idempotent migrations (`IF NOT EXISTS`, `IF EXISTS`)
- Use `CONCURRENTLY` for index creation (production)
- Test on staging data before production
- Include rollback instructions in comments
- Run migrations in CI/CD pipeline

**❌ DON'T:**
- Delete columns with data (deprecate first)
- Change primary keys on large tables
- Run without backup
- Modify deployed migrations (create new ones)

### 4. Rollback Strategy

```bash
# Check migration status
pnpm prisma migrate status

# Rollback not officially supported - instead:
# 1. Create a new migration that undoes changes
pnpm prisma migrate dev --name revert_previous_change
```

## Query Patterns

### 1. Basic CRUD Operations

**Create:**
```typescript
const client = await orgPrisma.client.create({
  data: {
    name: "John Doe",
    email: "john@example.com",
    organizationId: orgId,
    createdBy: userId,
    clientType: ClientType.PERSON,
  },
});
```

**Read (Single):**
```typescript
const property = await orgPrisma.property.findUnique({
  where: { id: propertyId },
  include: {
    address: true,
    listing: true,
    mediaAssets: { orderBy: { displayOrder: 'asc' } },
  },
});
```

**Read (List with Filters):**
```typescript
const clients = await orgPrisma.client.findMany({
  where: {
    organizationId: orgId,
    clientType: ClientType.PERSON,
    email: { contains: searchQuery, mode: 'insensitive' },
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: (page - 1) * 20,
});
```

**Update:**
```typescript
const updated = await orgPrisma.property.update({
  where: { id: propertyId },
  data: {
    price: newPrice,
    updatedAt: new Date(), // Automatic with @updatedAt
  },
});
```

**Delete:**
```typescript
await orgPrisma.client.delete({
  where: { id: clientId },
  // Cascade deletes handled by schema (onDelete: Cascade)
});
```

### 2. Transactions

**Use for atomic operations:**
```typescript
const result = await orgPrisma.$transaction(async (tx) => {
  // 1. Create property
  const property = await tx.property.create({
    data: propertyData,
  });
  
  // 2. Create listing
  const listing = await tx.listing.create({
    data: {
      propertyId: property.id,
      listPrice: propertyData.price,
      marketingStatus: MarketingStatus.DRAFT,
    },
  });
  
  // 3. Log activity
  await tx.activity.create({
    data: {
      actionType: ActionType.PROPERTY_CREATED,
      entityType: EntityType.PROPERTY,
      entityId: property.id,
      actorId: userId,
      organizationId: orgId,
    },
  });
  
  return { property, listing };
});
```

**Transaction rules:**
- Use for operations that must succeed/fail together
- Keep transactions short (minimize lock time)
- Don't mix external API calls inside transactions
- Handle errors with try/catch

### 3. Aggregations

```typescript
// Count
const propertyCount = await orgPrisma.property.count({
  where: {
    organizationId: orgId,
    status: PropertyStatus.AVAILABLE,
  },
});

// Group by with count
const statusCounts = await orgPrisma.property.groupBy({
  by: ['status'],
  where: { organizationId: orgId },
  _count: { id: true },
});

// Complex aggregation
const stats = await orgPrisma.property.aggregate({
  where: { organizationId: orgId },
  _avg: { price: true },
  _max: { price: true },
  _min: { price: true },
  _count: true,
});
```

### 4. Raw SQL (Use Sparingly)

```typescript
// When Prisma syntax insufficient (complex queries, full-text search)
const results = await orgPrisma.$queryRaw<Property[]>`
  SELECT * FROM properties 
  WHERE organization_id = ${orgId}
    AND to_tsvector('english', description) @@ to_tsquery('luxury')
  LIMIT 20
`;

// Always parameterize to prevent SQL injection
// ✅ CORRECT: Use ${} placeholders
// ❌ NEVER: String concatenation
```

## Performance Optimization

### 1. Indexing Strategy

```prisma
model Property {
  // Single column indexes
  @@index([organizationId])  // Required for RLS performance
  @@index([status])          // Frequently filtered
  @@index([createdAt])       // Sorting/pagination
  
  // Composite indexes (order matters!)
  @@index([organizationId, status, propertyType]) // Common filter combo
}
```

**Index rules:**
- Index foreign keys (always)
- Index frequently filtered columns
- Index sort columns (ORDER BY)
- Composite indexes: most selective columns first
- Monitor query performance (EXPLAIN ANALYZE)

### 2. Select Only Needed Fields

```typescript
// ❌ Fetches ALL fields (potentially large JSON, text columns)
const properties = await orgPrisma.property.findMany();

// ✅ Select only needed fields
const properties = await orgPrisma.property.findMany({
  select: {
    id: true,
    price: true,
    bedrooms: true,
    status: true,
    address: { select: { city: true, region: true } },
  },
});
```

### 3. Pagination Patterns

**Offset-based (simple but slow at high offsets):**
```typescript
const page = 1;
const pageSize = 20;

const clients = await orgPrisma.client.findMany({
  take: pageSize,
  skip: (page - 1) * pageSize,
  orderBy: { createdAt: 'desc' },
});
```

**Cursor-based (efficient for large datasets):**
```typescript
const clients = await orgPrisma.client.findMany({
  take: 20,
  cursor: lastClientId ? { id: lastClientId } : undefined,
  skip: lastClientId ? 1 : 0, // Skip cursor itself
  orderBy: { createdAt: 'desc' },
});
```

### 4. N+1 Query Prevention

```typescript
// ❌ N+1 Problem (1 query + N queries in loop)
const properties = await orgPrisma.property.findMany();
for (const property of properties) {
  const address = await orgPrisma.address.findUnique({
    where: { propertyId: property.id },
  });
}

// ✅ Use include/select (1 query)
const properties = await orgPrisma.property.findMany({
  include: { address: true },
});
```

## Data Validation

### 1. Database-Level Constraints

```prisma
model Property {
  price     Decimal @db.Decimal(12, 2) // Max 12 digits, 2 decimal places
  bedrooms  Int?    @db.SmallInt       // -32768 to 32767
  size      Decimal? @db.Decimal(10, 2)
  
  // Check constraints (PostgreSQL)
  @@check("price > 0", name: "positive_price")
  @@check("bedrooms > 0", name: "positive_bedrooms")
}
```

### 2. Application-Level Validation (Zod)

```typescript
import { z } from "zod";
import { PropertyType, PropertyStatus } from "@prisma/client";

const propertySchema = z.object({
  price: z.number().positive().finite(),
  bedrooms: z.number().int().positive().optional(),
  propertyType: z.nativeEnum(PropertyType),
  status: z.nativeEnum(PropertyStatus),
});

// In server action:
const result = propertySchema.safeParse(input);
if (!result.success) {
  return { error: result.error.message };
}
```

**Validation layers:**
1. **TypeScript**: Compile-time type checking
2. **Zod**: Runtime input validation
3. **Prisma**: ORM-level validation
4. **PostgreSQL**: Database constraints

## Error Handling

### 1. Prisma Error Codes

```typescript
import { Prisma } from "@prisma/client";

try {
  await orgPrisma.client.create({ data: clientData });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return { error: 'Client with this email already exists' };
      case 'P2025': // Record not found
        return { error: 'Organization not found' };
      case 'P2003': // Foreign key constraint
        return { error: 'Invalid organization ID' };
      default:
        console.error('Prisma error:', error.code, error.message);
        return { error: 'Database operation failed' };
    }
  }
  throw error; // Re-throw unexpected errors
}
```

### 2. Common Error Codes

| Code | Meaning | Typical Cause |
|------|---------|---------------|
| P2002 | Unique constraint violation | Duplicate email, ID collision |
| P2003 | Foreign key constraint failed | Invalid organizationId, userId |
| P2025 | Record not found | Invalid ID in update/delete |
| P2016 | Query interpretation error | Malformed query |
| P2021 | Table doesn't exist | Migration not run |

## Testing Database Operations

### 1. Unit Tests (Mock Prisma)

```typescript
import { prismaMock } from '@/tests/mocks/prisma';

describe('getClient', () => {
  it('should return client by ID', async () => {
    const mockClient = { id: '123', name: 'Test', ... };
    prismaMock.client.findUnique.mockResolvedValue(mockClient);
    
    const result = await getClient('123', 'org_456');
    
    expect(result).toEqual(mockClient);
  });
});
```

### 2. Integration Tests (Test Database)

```typescript
// tests/integration/properties.test.ts
import { prisma } from '@/lib/db';
import { PropertyType, PropertyStatus } from '@prisma/client';

beforeAll(async () => {
  // Seed test data
  await prisma.organization.create({ data: testOrg });
});

afterAll(async () => {
  // Cleanup
  await prisma.organization.deleteMany();
  await prisma.$disconnect();
});

test('createProperty with RLS', async () => {
  const orgPrisma = prismaForOrg(testOrg.id);
  const property = await orgPrisma.property.create({
    data: { /* ... */ },
  });
  
  expect(property.organizationId).toBe(testOrg.id);
});
```

## Backup & Recovery

### Production Practices

1. **Automated Backups (Neon)**: Daily snapshots
2. **Point-in-Time Recovery**: Available via Neon console
3. **Migration Backups**: Before major schema changes
4. **Seed Data**: Keep in `prisma/seed.ts` for dev environments

## Common Patterns

### 1. Soft Deletes (If Needed)

```prisma
model Client {
  id        String    @id
  deletedAt DateTime? @map("deleted_at")
  
  @@index([deletedAt])
}
```

```typescript
// Queries exclude soft-deleted by default
const activeClients = await orgPrisma.client.findMany({
  where: { deletedAt: null },
});

// "Delete" = set deletedAt
await orgPrisma.client.update({
  where: { id: clientId },
  data: { deletedAt: new Date() },
});
```

### 2. Audit Logs

```prisma
model AuditLog {
  id             String   @id @default(cuid())
  action         String   // CREATE, UPDATE, DELETE
  entityType     String   // Client, Property, etc.
  entityId       String
  changes        Json     // Before/after snapshot
  userId         String
  organizationId String
  createdAt      DateTime @default(now())
  
  @@index([organizationId])
  @@index([entityType, entityId])
}
```

### 3. Full-Text Search (Future)

```prisma
model Property {
  // Add to existing model
  @@index([description(ops: raw("gin_trgm_ops"))], type: Gin)
}
```

```sql
-- Migration
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX properties_description_trgm ON properties USING gin(description gin_trgm_ops);
```

## Security Checklist

- [ ] All tenant models have `organizationId`
- [ ] RLS enabled on all tenant tables
- [ ] RLS policies tested (cross-org isolation)
- [ ] `prismaForOrg()` used for tenant queries
- [ ] Foreign keys have `onDelete: Cascade`
- [ ] Sensitive fields encrypted (if needed)
- [ ] Database credentials in environment variables
- [ ] Connection pooling enabled (Neon default)
- [ ] Prepared statements used (Prisma default)
- [ ] Error messages don't leak schema details

## Related Files

- [`prisma/schema.prisma`](../../prisma/schema.prisma) - Schema definition
- [`lib/db.ts`](../../lib/db.ts) - Prisma client
- [`lib/org-prisma.ts`](../../lib/org-prisma.ts) - Org-scoped client
- [`prisma/migrations/`](../../prisma/migrations/) - Migration history

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Neon Documentation](https://neon.tech/docs)
- [Multi-Tenant SaaS with Prisma](https://www.prisma.io/docs/guides/deployment/deploying-to-neon)
