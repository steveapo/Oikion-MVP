-- Check RLS status for all tenant-scoped tables
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename IN (
  'properties', 'clients', 'tasks', 'activities',
  'addresses', 'listings', 'media_assets',
  'interactions', 'notes', 'client_relationships'
)
ORDER BY tablename;

-- Check policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd AS operation,
  qual AS using_expression,
  with_check
FROM pg_policies
WHERE tablename IN (
  'properties', 'clients', 'tasks', 'activities',
  'addresses', 'listings', 'media_assets',
  'interactions', 'notes', 'client_relationships'
)
ORDER BY tablename, policyname;
