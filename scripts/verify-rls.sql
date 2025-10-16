-- RLS Verification Script
-- Run this after migrations to verify Row-Level Security is properly configured

-- ============================================
-- PART 1: Verify RLS is Enabled
-- ============================================

SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✓ ENABLED'
        ELSE '✗ DISABLED'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'properties', 'clients', 'tasks', 'activities',
        'addresses', 'listings', 'media_assets', 
        'interactions', 'notes', 'client_relationships'
    )
ORDER BY tablename;

-- Expected: All tables should show rowsecurity = true

-- ============================================
-- PART 2: List All RLS Policies
-- ============================================

SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected: 4 policies per table (SELECT, INSERT, UPDATE, DELETE)
-- Total: 40 policies (10 tables × 4 operations)

-- ============================================
-- PART 3: Verify Policy Definitions
-- ============================================

-- Check properties table policies
SELECT 
    tablename,
    policyname,
    cmd AS operation,
    CASE 
        WHEN qual LIKE '%current_setting%' THEN '✓ Uses session variable'
        ELSE '✗ Missing session variable'
    END as validation
FROM pg_policies 
WHERE tablename = 'properties'
ORDER BY policyname;

-- ============================================
-- PART 4: Test Policy Enforcement
-- ============================================

-- Test 1: Query without session variable (should return 0 rows)
BEGIN;
SELECT set_config('app.current_organization', '', TRUE);
SELECT COUNT(*) as count_without_session FROM properties;
-- Expected: count = 0
ROLLBACK;

-- Test 2: Query with valid session variable
BEGIN;
-- Replace 'your_org_id_here' with actual organization ID
SELECT set_config('app.current_organization', 'your_org_id_here', TRUE);
SELECT COUNT(*) as count_with_session FROM properties;
-- Expected: count = number of properties in that organization
ROLLBACK;

-- ============================================
-- PART 5: Verify Indexes for Performance
-- ============================================

SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND (
        indexdef LIKE '%organizationId%' 
        OR indexdef LIKE '%propertyId%'
        OR indexdef LIKE '%clientId%'
    )
ORDER BY tablename, indexname;

-- Expected: Indexes on all foreign key columns

-- ============================================
-- PART 6: Check FORCE ROW LEVEL SECURITY
-- ============================================

SELECT 
    n.nspname as schema,
    c.relname as table_name,
    c.relforcerowsecurity as force_rls,
    CASE 
        WHEN c.relforcerowsecurity THEN '✓ FORCED (applies to owner)'
        ELSE '✗ NOT FORCED (owner bypasses RLS)'
    END as status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relname IN (
        'properties', 'clients', 'tasks', 'activities',
        'addresses', 'listings', 'media_assets',
        'interactions', 'notes', 'client_relationships'
    )
ORDER BY c.relname;

-- Expected: All tables should have force_rls = true

-- ============================================
-- PART 7: Cross-Org Isolation Test
-- ============================================

-- Prerequisites: Create two test organizations with data
-- Run this test to verify no cross-contamination

-- Step 1: Create test data for Org A
BEGIN;
-- Note: This requires actual organization IDs from your database
-- Replace the IDs below with real values

-- Set context to Org A
SELECT set_config('app.current_organization', 'org_a_id_here', TRUE);

-- Query should only return Org A data
SELECT id, "organizationId", COUNT(*) OVER() as total_visible
FROM properties
LIMIT 5;

ROLLBACK;

-- Step 2: Switch to Org B and verify isolation
BEGIN;

-- Set context to Org B
SELECT set_config('app.current_organization', 'org_b_id_here', TRUE);

-- Query should only return Org B data
SELECT id, "organizationId", COUNT(*) OVER() as total_visible
FROM properties
LIMIT 5;

ROLLBACK;

-- ============================================
-- PART 8: Dependent Table Policy Test
-- ============================================

-- Test addresses table (property-dependent)
BEGIN;
SELECT set_config('app.current_organization', 'org_a_id_here', TRUE);

-- This should only return addresses for properties in Org A
SELECT 
    a.id as address_id,
    a."propertyId",
    p."organizationId"
FROM addresses a
JOIN properties p ON p.id = a."propertyId"
LIMIT 5;

-- Verify all organizationId values match the session variable
ROLLBACK;

-- ============================================
-- SUMMARY CHECKLIST
-- ============================================

/*
Verification Checklist:
□ All 10 tables have rowsecurity = true
□ All 10 tables have force_rls = true
□ 40 total policies exist (4 per table)
□ All policies reference current_setting('app.current_organization')
□ Queries without session variable return 0 rows
□ Queries with session variable return only matching org data
□ Cross-org queries show complete isolation
□ Indexes exist on organizationId, propertyId, clientId
□ Dependent tables enforce parent organization check
*/

-- ============================================
-- CLEANUP (if needed)
-- ============================================

-- If you need to disable RLS for rollback:
-- WARNING: Only use this in emergencies
/*
ALTER TABLE "properties" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "clients" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "activities" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "addresses" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "listings" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "media_assets" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "interactions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "notes" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "client_relationships" DISABLE ROW LEVEL SECURITY;
*/
