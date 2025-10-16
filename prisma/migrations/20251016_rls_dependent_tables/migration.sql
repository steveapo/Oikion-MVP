-- Enable Row Level Security on dependent tables
-- These tables are property or client dependent and use subqueries for RLS

-- ============================================
-- ADDRESSES TABLE RLS (Property Dependent)
-- ============================================
ALTER TABLE "addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "addresses" FORCE ROW LEVEL SECURITY;

-- SELECT policy: users can read addresses if the parent property is in their organization
CREATE POLICY "addresses_select_policy" ON "addresses"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "addresses"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );

-- INSERT policy: users can create addresses if the parent property is in their organization
CREATE POLICY "addresses_insert_policy" ON "addresses"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "addresses"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );

-- UPDATE policy: users can update addresses if the parent property is in their organization
CREATE POLICY "addresses_update_policy" ON "addresses"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "addresses"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "addresses"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );

-- DELETE policy: users can delete addresses if the parent property is in their organization
CREATE POLICY "addresses_delete_policy" ON "addresses"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "addresses"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );

-- ============================================
-- LISTINGS TABLE RLS (Property Dependent)
-- ============================================
ALTER TABLE "listings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "listings" FORCE ROW LEVEL SECURITY;

-- SELECT policy: users can read listings if the parent property is in their organization
CREATE POLICY "listings_select_policy" ON "listings"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "listings"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );

-- INSERT policy: users can create listings if the parent property is in their organization
CREATE POLICY "listings_insert_policy" ON "listings"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "listings"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );

-- UPDATE policy: users can update listings if the parent property is in their organization
CREATE POLICY "listings_update_policy" ON "listings"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "listings"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "listings"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );

-- DELETE policy: users can delete listings if the parent property is in their organization
CREATE POLICY "listings_delete_policy" ON "listings"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "listings"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );

-- ============================================
-- MEDIA_ASSETS TABLE RLS (Property Dependent)
-- ============================================
ALTER TABLE "media_assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media_assets" FORCE ROW LEVEL SECURITY;

-- SELECT policy: users can read media assets if the parent property is in their organization
CREATE POLICY "media_assets_select_policy" ON "media_assets"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "media_assets"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );

-- INSERT policy: users can create media assets if the parent property is in their organization
CREATE POLICY "media_assets_insert_policy" ON "media_assets"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "media_assets"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );

-- UPDATE policy: users can update media assets if the parent property is in their organization
CREATE POLICY "media_assets_update_policy" ON "media_assets"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "media_assets"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "media_assets"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );

-- DELETE policy: users can delete media assets if the parent property is in their organization
CREATE POLICY "media_assets_delete_policy" ON "media_assets"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "media_assets"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );

-- ============================================
-- INTERACTIONS TABLE RLS (Client or Property Dependent)
-- ============================================
ALTER TABLE "interactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "interactions" FORCE ROW LEVEL SECURITY;

-- SELECT policy: users can read interactions if linked client OR property is in their organization
CREATE POLICY "interactions_select_policy" ON "interactions"
  FOR SELECT
  USING (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "interactions"."clientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "interactions"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
  );

-- INSERT policy: users can create interactions if linked client OR property is in their organization
CREATE POLICY "interactions_insert_policy" ON "interactions"
  FOR INSERT
  WITH CHECK (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "interactions"."clientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "interactions"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
  );

-- UPDATE policy: users can update interactions if linked client OR property is in their organization
CREATE POLICY "interactions_update_policy" ON "interactions"
  FOR UPDATE
  USING (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "interactions"."clientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "interactions"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
  )
  WITH CHECK (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "interactions"."clientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "interactions"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
  );

-- DELETE policy: users can delete interactions if linked client OR property is in their organization
CREATE POLICY "interactions_delete_policy" ON "interactions"
  FOR DELETE
  USING (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "interactions"."clientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "interactions"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
  );

-- ============================================
-- NOTES TABLE RLS (Client or Property Dependent)
-- ============================================
ALTER TABLE "notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notes" FORCE ROW LEVEL SECURITY;

-- SELECT policy: users can read notes if linked client OR property is in their organization
CREATE POLICY "notes_select_policy" ON "notes"
  FOR SELECT
  USING (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "notes"."clientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "notes"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
  );

-- INSERT policy: users can create notes if linked client OR property is in their organization
CREATE POLICY "notes_insert_policy" ON "notes"
  FOR INSERT
  WITH CHECK (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "notes"."clientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "notes"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
  );

-- UPDATE policy: users can update notes if linked client OR property is in their organization
CREATE POLICY "notes_update_policy" ON "notes"
  FOR UPDATE
  USING (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "notes"."clientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "notes"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
  )
  WITH CHECK (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "notes"."clientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "notes"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
  );

-- DELETE policy: users can delete notes if linked client OR property is in their organization
CREATE POLICY "notes_delete_policy" ON "notes"
  FOR DELETE
  USING (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "notes"."clientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p.id = "notes"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization', TRUE)::text
    ))
  );

-- ============================================
-- CLIENT_RELATIONSHIPS TABLE RLS (Client Dependent)
-- ============================================
ALTER TABLE "client_relationships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_relationships" FORCE ROW LEVEL SECURITY;

-- SELECT policy: users can read relationships if either client is in their organization
CREATE POLICY "client_relationships_select_policy" ON "client_relationships"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "client_relationships"."fromClientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
    OR
    EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "client_relationships"."toClientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );

-- INSERT policy: users can create relationships if both clients are in their organization
CREATE POLICY "client_relationships_insert_policy" ON "client_relationships"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "client_relationships"."fromClientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
    AND
    EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "client_relationships"."toClientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );

-- UPDATE policy: users can update relationships if both clients are in their organization
CREATE POLICY "client_relationships_update_policy" ON "client_relationships"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "client_relationships"."fromClientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
    AND
    EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "client_relationships"."toClientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "client_relationships"."fromClientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
    AND
    EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "client_relationships"."toClientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );

-- DELETE policy: users can delete relationships if both clients are in their organization
CREATE POLICY "client_relationships_delete_policy" ON "client_relationships"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "client_relationships"."fromClientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
    AND
    EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c.id = "client_relationships"."toClientId"
        AND c."organizationId" = current_setting('app.current_organization', TRUE)::text
    )
  );
