#!/bin/bash

# RLS Testing Script
# This script helps verify Row-Level Security implementation

set -e

echo "=================================================="
echo "RLS Testing Script for Oikion MVP"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
    echo "Please set it in your .env file or export it:"
    echo "  export DATABASE_URL='postgresql://...'"
    exit 1
fi

echo -e "${GREEN}✓ DATABASE_URL found${NC}"
echo ""

# Function to run SQL and display results
run_sql() {
    local query="$1"
    local description="$2"
    
    echo -e "${YELLOW}Testing: $description${NC}"
    psql "$DATABASE_URL" -c "$query" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Success${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
    fi
    echo ""
}

echo "=================================================="
echo "Step 1: Verify RLS is Enabled"
echo "=================================================="
echo ""

run_sql "
SELECT 
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
" "RLS Status on All Tables"

echo "=================================================="
echo "Step 2: Count RLS Policies"
echo "=================================================="
echo ""

run_sql "
SELECT 
    COUNT(*) as total_policies,
    COUNT(DISTINCT tablename) as tables_with_policies,
    CASE 
        WHEN COUNT(*) = 40 THEN '✓ Expected count (40 policies)'
        ELSE '✗ Unexpected count (expected 40)'
    END as validation
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN (
        'properties', 'clients', 'tasks', 'activities',
        'addresses', 'listings', 'media_assets',
        'interactions', 'notes', 'client_relationships'
    );
" "Policy Count Verification"

echo "=================================================="
echo "Step 3: Verify Session Variable Usage"
echo "=================================================="
echo ""

run_sql "
SELECT 
    tablename,
    COUNT(*) as policies_with_session_var
FROM pg_policies 
WHERE schemaname = 'public'
    AND (
        qual LIKE '%current_setting%app.current_organization%'
        OR with_check LIKE '%current_setting%app.current_organization%'
    )
GROUP BY tablename
ORDER BY tablename;
" "Session Variable in Policies"

echo "=================================================="
echo "Step 4: Verify FORCE ROW LEVEL SECURITY"
echo "=================================================="
echo ""

run_sql "
SELECT 
    c.relname as table_name,
    c.relforcerowsecurity as force_rls,
    CASE 
        WHEN c.relforcerowsecurity THEN '✓ FORCED'
        ELSE '✗ NOT FORCED'
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
" "FORCE ROW LEVEL SECURITY Status"

echo "=================================================="
echo "Step 5: Check Indexes for Performance"
echo "=================================================="
echo ""

run_sql "
SELECT 
    tablename,
    COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public'
    AND (
        indexdef LIKE '%organizationId%' 
        OR indexdef LIKE '%propertyId%'
        OR indexdef LIKE '%clientId%'
    )
GROUP BY tablename
ORDER BY tablename;
" "Foreign Key Indexes"

echo "=================================================="
echo "Step 6: Test Policy Enforcement (Empty Session)"
echo "=================================================="
echo ""

echo "Testing query without session variable (should return 0 rows)..."
run_sql "
BEGIN;
SELECT set_config('app.current_organization', '', TRUE);
SELECT COUNT(*) as count_without_session, 
       CASE 
           WHEN COUNT(*) = 0 THEN '✓ RLS blocking access'
           ELSE '✗ RLS not enforcing'
       END as validation
FROM properties;
ROLLBACK;
" "Empty Session Variable Test"

echo "=================================================="
echo "Manual Testing Required"
echo "=================================================="
echo ""
echo "The following tests require manual intervention:"
echo ""
echo "1. Cross-Org Isolation Test:"
echo "   - Create two test organizations with different users"
echo "   - Create properties in each organization"
echo "   - Sign in as User A and verify you only see Org A data"
echo "   - Sign in as User B and verify you only see Org B data"
echo ""
echo "2. Invitation Flow Test:"
echo "   - Send an invitation via the UI"
echo "   - Check email delivery in Resend dashboard"
echo "   - Accept invitation and verify org assignment"
echo ""
echo "3. Role Management Test:"
echo "   - Change user roles via the admin UI"
echo "   - Verify permission boundaries work correctly"
echo ""
echo "4. Member Removal Test:"
echo "   - Remove a member via the admin UI"
echo "   - Verify they lose access to organization data"
echo ""
echo "See MIGRATION_GUIDE.md for detailed test procedures."
echo ""

echo "=================================================="
echo "RLS Verification Complete"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Review the output above for any errors"
echo "2. If all checks pass, proceed to manual testing"
echo "3. See scripts/verify-rls.sql for additional SQL tests"
echo "4. See MIGRATION_GUIDE.md for comprehensive test plan"
echo ""
