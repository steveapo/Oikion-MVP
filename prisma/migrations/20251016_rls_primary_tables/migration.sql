-- Enable Row Level Security on primary tenant tables
-- These tables have direct organizationId foreign keys

-- ============================================
-- PROPERTIES TABLE RLS
-- ============================================
ALTER TABLE "properties" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "properties" FORCE ROW LEVEL SECURITY;

-- SELECT policy: users can read properties in their organization
CREATE POLICY "properties_select_policy" ON "properties"
  FOR SELECT
  USING ("organizationId" = current_setting('app.current_organization', TRUE)::text);

-- INSERT policy: users can create properties only in their organization
CREATE POLICY "properties_insert_policy" ON "properties"
  FOR INSERT
  WITH CHECK ("organizationId" = current_setting('app.current_organization', TRUE)::text);

-- UPDATE policy: users can update properties only in their organization
CREATE POLICY "properties_update_policy" ON "properties"
  FOR UPDATE
  USING ("organizationId" = current_setting('app.current_organization', TRUE)::text)
  WITH CHECK ("organizationId" = current_setting('app.current_organization', TRUE)::text);

-- DELETE policy: users can delete properties only in their organization
CREATE POLICY "properties_delete_policy" ON "properties"
  FOR DELETE
  USING ("organizationId" = current_setting('app.current_organization', TRUE)::text);

-- ============================================
-- CLIENTS TABLE RLS
-- ============================================
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clients" FORCE ROW LEVEL SECURITY;

-- SELECT policy: users can read clients in their organization
CREATE POLICY "clients_select_policy" ON "clients"
  FOR SELECT
  USING ("organizationId" = current_setting('app.current_organization', TRUE)::text);

-- INSERT policy: users can create clients only in their organization
CREATE POLICY "clients_insert_policy" ON "clients"
  FOR INSERT
  WITH CHECK ("organizationId" = current_setting('app.current_organization', TRUE)::text);

-- UPDATE policy: users can update clients only in their organization
CREATE POLICY "clients_update_policy" ON "clients"
  FOR UPDATE
  USING ("organizationId" = current_setting('app.current_organization', TRUE)::text)
  WITH CHECK ("organizationId" = current_setting('app.current_organization', TRUE)::text);

-- DELETE policy: users can delete clients only in their organization
CREATE POLICY "clients_delete_policy" ON "clients"
  FOR DELETE
  USING ("organizationId" = current_setting('app.current_organization', TRUE)::text);

-- ============================================
-- TASKS TABLE RLS
-- ============================================
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" FORCE ROW LEVEL SECURITY;

-- SELECT policy: users can read tasks in their organization
CREATE POLICY "tasks_select_policy" ON "tasks"
  FOR SELECT
  USING ("organizationId" = current_setting('app.current_organization', TRUE)::text);

-- INSERT policy: users can create tasks only in their organization
CREATE POLICY "tasks_insert_policy" ON "tasks"
  FOR INSERT
  WITH CHECK ("organizationId" = current_setting('app.current_organization', TRUE)::text);

-- UPDATE policy: users can update tasks only in their organization
CREATE POLICY "tasks_update_policy" ON "tasks"
  FOR UPDATE
  USING ("organizationId" = current_setting('app.current_organization', TRUE)::text)
  WITH CHECK ("organizationId" = current_setting('app.current_organization', TRUE)::text);

-- DELETE policy: users can delete tasks only in their organization
CREATE POLICY "tasks_delete_policy" ON "tasks"
  FOR DELETE
  USING ("organizationId" = current_setting('app.current_organization', TRUE)::text);

-- ============================================
-- ACTIVITIES TABLE RLS
-- ============================================
ALTER TABLE "activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activities" FORCE ROW LEVEL SECURITY;

-- SELECT policy: users can read activities in their organization
CREATE POLICY "activities_select_policy" ON "activities"
  FOR SELECT
  USING ("organizationId" = current_setting('app.current_organization', TRUE)::text);

-- INSERT policy: users can create activities only in their organization
CREATE POLICY "activities_insert_policy" ON "activities"
  FOR INSERT
  WITH CHECK ("organizationId" = current_setting('app.current_organization', TRUE)::text);

-- UPDATE policy: users can update activities only in their organization
CREATE POLICY "activities_update_policy" ON "activities"
  FOR UPDATE
  USING ("organizationId" = current_setting('app.current_organization', TRUE)::text)
  WITH CHECK ("organizationId" = current_setting('app.current_organization', TRUE)::text);

-- DELETE policy: users can delete activities only in their organization
CREATE POLICY "activities_delete_policy" ON "activities"
  FOR DELETE
  USING ("organizationId" = current_setting('app.current_organization', TRUE)::text);
