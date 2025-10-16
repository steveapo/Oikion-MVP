# Testing Scripts for RLS Implementation

This directory contains scripts to verify and test the Row-Level Security (RLS) implementation.

## Available Scripts

### 1. `verify-rls.sql`

SQL script for manual verification of RLS configuration.

**Usage:**
```bash
psql $DATABASE_URL -f scripts/verify-rls.sql
```

**What it checks:**
- ✅ RLS is enabled on all tenant tables
- ✅ FORCE ROW LEVEL SECURITY is active
- ✅ All policies exist (4 per table, 40 total)
- ✅ Policies use `current_setting('app.current_organization')`
- ✅ Indexes exist on foreign keys
- ✅ Empty session variable blocks access
- ✅ Cross-org isolation works correctly

---

### 2. `test-rls.sh`

Bash script for automated RLS verification.

**Prerequisites:**
- `DATABASE_URL` environment variable set
- `psql` command-line tool installed

**Usage:**
```bash
# Make executable (first time only)
chmod +x scripts/test-rls.sh

# Run tests
./scripts/test-rls.sh
```

**Output:**
- Colored terminal output showing test results
- Green checkmarks (✓) for passing tests
- Red crosses (✗) for failing tests
- Yellow warnings for manual testing steps

---

### 3. `test-rls-utils.ts`

TypeScript utilities for programmatic RLS testing.

**Prerequisites:**
- Migrations applied (`npx prisma migrate dev`)
- Database seeded with test data (2+ organizations)

**Usage:**

**Via npm script:**
```bash
npm run test:rls
```

**Directly with tsx:**
```bash
npx tsx scripts/test-rls-utils.ts
```

**In code:**
```typescript
import { 
  testEmptySession,
  testCrossOrgIsolation,
  testDependentTables,
  runAllTests 
} from './scripts/test-rls-utils';

// Run all tests
await runAllTests();

// Or run individual tests
await testEmptySession();
await testCrossOrgIsolation();
await testDependentTables();
```

**Tests included:**
1. **Empty Session Test** - Verifies RLS blocks queries without session variable
2. **Cross-Org Isolation Test** - Ensures organizations cannot see each other's data
3. **Dependent Tables Test** - Validates subquery-based policies work correctly

---

## Quick Start Guide

### Step 1: Run Migrations

```bash
npx prisma migrate dev
npx prisma generate
```

### Step 2: Verify RLS Configuration

```bash
# Option A: SQL verification
psql $DATABASE_URL -f scripts/verify-rls.sql

# Option B: Bash script
./scripts/test-rls.sh
```

### Step 3: Run Automated Tests

```bash
npm run test:rls
```

### Step 4: Manual Testing

Follow the checklist in [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) for comprehensive manual testing.

---

## Test Scenarios

### Scenario 1: Database-Level Isolation

**Goal:** Verify RLS enforces tenant boundaries at the database layer

**Steps:**
1. Create two organizations (Org A, Org B)
2. Create properties in each organization
3. Set session variable to Org A ID
4. Query properties table
5. **Expected:** Only Org A properties returned
6. Set session variable to Org B ID
7. Query properties table
8. **Expected:** Only Org B properties returned

**Test with:**
```typescript
npm run test:rls  // Runs testCrossOrgIsolation()
```

---

### Scenario 2: Session Variable Requirement

**Goal:** Verify queries fail without proper session variable

**Steps:**
1. Set session variable to empty string
2. Attempt to query properties table
3. **Expected:** 0 rows returned (RLS blocks access)

**Test with:**
```typescript
npm run test:rls  // Runs testEmptySession()
```

---

### Scenario 3: Dependent Table Policies

**Goal:** Verify dependent tables (addresses, listings, etc.) enforce parent organization check

**Steps:**
1. Get a property with address from Org A
2. Set session variable to Org A
3. Query address by ID
4. **Expected:** Address accessible
5. Set session variable to Org B
6. Query same address by ID
7. **Expected:** Address not accessible (returns null)

**Test with:**
```typescript
npm run test:rls  // Runs testDependentTables()
```

---

## Troubleshooting

### "Command not found: psql"

**Cause:** PostgreSQL client tools not installed

**Solution:**
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Windows
# Download from https://www.postgresql.org/download/windows/
```

---

### "Permission denied: test-rls.sh"

**Cause:** Script not executable

**Solution:**
```bash
chmod +x scripts/test-rls.sh
```

---

### "DATABASE_URL not set"

**Cause:** Environment variable missing

**Solution:**
```bash
# Option 1: Set in terminal
export DATABASE_URL='postgresql://user:password@host:5432/database'

# Option 2: Use .env file
# Ensure DATABASE_URL is in .env and source it
source .env
./scripts/test-rls.sh

# Option 3: Pass directly
DATABASE_URL='postgresql://...' ./scripts/test-rls.sh
```

---

### "0 rows returned" for all queries

**Cause:** RLS policies are working, but session variable not set correctly

**Solution:**
Ensure you're using `prismaForOrg()` utility in your code:
```typescript
import { prismaForOrg } from '@/lib/org-prisma';

const db = prismaForOrg(session.user.organizationId);
const properties = await db.property.findMany();
```

---

### "Cannot find module 'tsx'"

**Cause:** Development dependency not installed

**Solution:**
```bash
npm install -D tsx
# or
pnpm add -D tsx
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: RLS Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: npx prisma migrate deploy
      
      - name: Seed test data
        run: npm run seed  # Create test organizations
      
      - name: Run RLS tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: npm run test:rls
```

---

## Expected Test Output

### Successful Run

```
═══════════════════════════════════════════════════
RLS Test Suite
═══════════════════════════════════════════════════

🔒 Testing RLS enforcement with empty session variable...

✅ PASS: RLS blocked access without session variable

🔒 Testing cross-organization data isolation...

Testing with:
  Org A: Acme Real Estate (5 properties)
  Org B: Superior Properties (3 properties)

Org A context: 5 properties visible
Org B context: 3 properties visible

✅ PASS: Cross-organization isolation verified
   Each organization sees only its own data

🔒 Testing dependent table RLS policies...

Testing dependent tables for property: cuid123...

✅ Address accessible with correct org context
✅ Listing accessible with correct org context
✅ Media asset accessible with correct org context

Testing with wrong org context (Superior Properties)...

✅ PASS: Dependent tables properly isolated
   Cannot access data from other organization

═══════════════════════════════════════════════════
Test Results Summary
═══════════════════════════════════════════════════

Empty Session Test:        ✅ PASS
Cross-Org Isolation Test:  ✅ PASS
Dependent Tables Test:     ✅ PASS

Total: 3/3 tests passed
```

---

## Additional Resources

- [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) - Comprehensive migration and testing guide
- [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md) - Implementation details
- [lib/org-prisma.ts](../lib/org-prisma.ts) - Prisma client extension source code
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

## Contributing

When adding new tests:

1. Add SQL verification to `verify-rls.sql`
2. Add bash automation to `test-rls.sh`
3. Add TypeScript function to `test-rls-utils.ts`
4. Update this README with the new test
5. Add test scenario to MIGRATION_GUIDE.md

---

**Last Updated:** October 16, 2025  
**Maintainer:** Development Team  
**Status:** Production Ready
