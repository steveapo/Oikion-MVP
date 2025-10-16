-- Check current database user privileges
SELECT 
  rolname,
  rolsuper AS is_superuser,
  rolbypassrls AS can_bypass_rls,
  rolcreatedb,
  rolcreaterole
FROM pg_roles 
WHERE rolname = current_user;

-- Also check what the connection user actually is
SELECT current_user, current_database();

-- Verify RLS is enabled on tables
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'properties', 'clients', 'tasks', 'activities',
    'addresses', 'listings', 'media_assets',
    'interactions', 'notes', 'client_relationships'
  )
ORDER BY tablename;
