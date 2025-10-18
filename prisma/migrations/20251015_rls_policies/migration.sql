-- Migration: Enable Row-Level Security (RLS) and policies for organization isolation
-- Phase 1: Database Isolation per SECURITY_MULTI_TENANCY_PLAN.md

-- Properties: simple orgId policy
ALTER TABLE "properties" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "properties" FORCE ROW LEVEL SECURITY;
CREATE POLICY "properties_select_rls"
  ON "properties" FOR SELECT
  USING ("organizationId" = current_setting('app.current_organization')::text);
CREATE POLICY "properties_insert_rls"
  ON "properties" FOR INSERT
  WITH CHECK ("organizationId" = current_setting('app.current_organization')::text);
CREATE POLICY "properties_update_rls"
  ON "properties" FOR UPDATE
  USING ("organizationId" = current_setting('app.current_organization')::text)
  WITH CHECK ("organizationId" = current_setting('app.current_organization')::text);
CREATE POLICY "properties_delete_rls"
  ON "properties" FOR DELETE
  USING ("organizationId" = current_setting('app.current_organization')::text);

-- Clients: simple orgId policy
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clients" FORCE ROW LEVEL SECURITY;
CREATE POLICY "clients_select_rls"
  ON "clients" FOR SELECT
  USING ("organizationId" = current_setting('app.current_organization')::text);
CREATE POLICY "clients_insert_rls"
  ON "clients" FOR INSERT
  WITH CHECK ("organizationId" = current_setting('app.current_organization')::text);
CREATE POLICY "clients_update_rls"
  ON "clients" FOR UPDATE
  USING ("organizationId" = current_setting('app.current_organization')::text)
  WITH CHECK ("organizationId" = current_setting('app.current_organization')::text);
CREATE POLICY "clients_delete_rls"
  ON "clients" FOR DELETE
  USING ("organizationId" = current_setting('app.current_organization')::text);

-- Tasks: has organizationId
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tasks_select_rls"
  ON "tasks" FOR SELECT
  USING ("organizationId" = current_setting('app.current_organization')::text);
CREATE POLICY "tasks_insert_rls"
  ON "tasks" FOR INSERT
  WITH CHECK ("organizationId" = current_setting('app.current_organization')::text);
CREATE POLICY "tasks_update_rls"
  ON "tasks" FOR UPDATE
  USING ("organizationId" = current_setting('app.current_organization')::text)
  WITH CHECK ("organizationId" = current_setting('app.current_organization')::text);
CREATE POLICY "tasks_delete_rls"
  ON "tasks" FOR DELETE
  USING ("organizationId" = current_setting('app.current_organization')::text);

-- Activities: has organizationId
ALTER TABLE "activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activities" FORCE ROW LEVEL SECURITY;
CREATE POLICY "activities_select_rls"
  ON "activities" FOR SELECT
  USING ("organizationId" = current_setting('app.current_organization')::text);
CREATE POLICY "activities_insert_rls"
  ON "activities" FOR INSERT
  WITH CHECK ("organizationId" = current_setting('app.current_organization')::text);
CREATE POLICY "activities_update_rls"
  ON "activities" FOR UPDATE
  USING ("organizationId" = current_setting('app.current_organization')::text)
  WITH CHECK ("organizationId" = current_setting('app.current_organization')::text);
CREATE POLICY "activities_delete_rls"
  ON "activities" FOR DELETE
  USING ("organizationId" = current_setting('app.current_organization')::text);

-- Addresses: depend on properties
ALTER TABLE "addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "addresses" FORCE ROW LEVEL SECURITY;
CREATE POLICY "addresses_select_rls"
  ON "addresses" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "properties" p
    WHERE p."id" = "addresses"."propertyId"
      AND p."organizationId" = current_setting('app.current_organization')::text
  ));
CREATE POLICY "addresses_insert_rls"
  ON "addresses" FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM "properties" p
    WHERE p."id" = "addresses"."propertyId"
      AND p."organizationId" = current_setting('app.current_organization')::text
  ));
CREATE POLICY "addresses_update_rls"
  ON "addresses" FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM "properties" p
    WHERE p."id" = "addresses"."propertyId"
      AND p."organizationId" = current_setting('app.current_organization')::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "properties" p
    WHERE p."id" = "addresses"."propertyId"
      AND p."organizationId" = current_setting('app.current_organization')::text
  ));
CREATE POLICY "addresses_delete_rls"
  ON "addresses" FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM "properties" p
    WHERE p."id" = "addresses"."propertyId"
      AND p."organizationId" = current_setting('app.current_organization')::text
  ));

-- Listings: depend on properties
ALTER TABLE "listings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "listings" FORCE ROW LEVEL SECURITY;
CREATE POLICY "listings_select_rls"
  ON "listings" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "properties" p
    WHERE p."id" = "listings"."propertyId"
      AND p."organizationId" = current_setting('app.current_organization')::text
  ));
CREATE POLICY "listings_insert_rls"
  ON "listings" FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM "properties" p
    WHERE p."id" = "listings"."propertyId"
      AND p."organizationId" = current_setting('app.current_organization')::text
  ));
CREATE POLICY "listings_update_rls"
  ON "listings" FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM "properties" p
    WHERE p."id" = "listings"."propertyId"
      AND p."organizationId" = current_setting('app.current_organization')::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "properties" p
    WHERE p."id" = "listings"."propertyId"
      AND p."organizationId" = current_setting('app.current_organization')::text
  ));
CREATE POLICY "listings_delete_rls"
  ON "listings" FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM "properties" p
    WHERE p."id" = "listings"."propertyId"
      AND p."organizationId" = current_setting('app.current_organization')::text
  ));

-- Media assets: depend on properties
ALTER TABLE "media_assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media_assets" FORCE ROW LEVEL SECURITY;
CREATE POLICY "media_assets_select_rls"
  ON "media_assets" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "properties" p
    WHERE p."id" = "media_assets"."propertyId"
      AND p."organizationId" = current_setting('app.current_organization')::text
  ));
CREATE POLICY "media_assets_insert_rls"
  ON "media_assets" FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM "properties" p
    WHERE p."id" = "media_assets"."propertyId"
      AND p."organizationId" = current_setting('app.current_organization')::text
  ));
CREATE POLICY "media_assets_update_rls"
  ON "media_assets" FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM "properties" p
    WHERE p."id" = "media_assets"."propertyId"
      AND p."organizationId" = current_setting('app.current_organization')::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "properties" p
    WHERE p."id" = "media_assets"."propertyId"
      AND p."organizationId" = current_setting('app.current_organization')::text
  ));
CREATE POLICY "media_assets_delete_rls"
  ON "media_assets" FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM "properties" p
    WHERE p."id" = "media_assets"."propertyId"
      AND p."organizationId" = current_setting('app.current_organization')::text
  ));

-- Interactions: depend on clients or properties
ALTER TABLE "interactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "interactions" FORCE ROW LEVEL SECURITY;
CREATE POLICY "interactions_select_rls"
  ON "interactions" FOR SELECT
  USING (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c."id" = "interactions"."clientId"
        AND c."organizationId" = current_setting('app.current_organization')::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p."id" = "interactions"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization')::text
    ))
  );
CREATE POLICY "interactions_insert_rls"
  ON "interactions" FOR INSERT
  WITH CHECK (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c."id" = "interactions"."clientId"
        AND c."organizationId" = current_setting('app.current_organization')::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p."id" = "interactions"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization')::text
    ))
  );
CREATE POLICY "interactions_update_rls"
  ON "interactions" FOR UPDATE
  USING (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c."id" = "interactions"."clientId"
        AND c."organizationId" = current_setting('app.current_organization')::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p."id" = "interactions"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization')::text
    ))
  )
  WITH CHECK (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c."id" = "interactions"."clientId"
        AND c."organizationId" = current_setting('app.current_organization')::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p."id" = "interactions"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization')::text
    ))
  );
CREATE POLICY "interactions_delete_rls"
  ON "interactions" FOR DELETE
  USING (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c."id" = "interactions"."clientId"
        AND c."organizationId" = current_setting('app.current_organization')::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p."id" = "interactions"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization')::text
    ))
  );

-- Notes: depend on clients or properties
ALTER TABLE "notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notes" FORCE ROW LEVEL SECURITY;
CREATE POLICY "notes_select_rls"
  ON "notes" FOR SELECT
  USING (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c."id" = "notes"."clientId"
        AND c."organizationId" = current_setting('app.current_organization')::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p."id" = "notes"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization')::text
    ))
  );
CREATE POLICY "notes_insert_rls"
  ON "notes" FOR INSERT
  WITH CHECK (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c."id" = "notes"."clientId"
        AND c."organizationId" = current_setting('app.current_organization')::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p."id" = "notes"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization')::text
    ))
  );
CREATE POLICY "notes_update_rls"
  ON "notes" FOR UPDATE
  USING (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c."id" = "notes"."clientId"
        AND c."organizationId" = current_setting('app.current_organization')::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p."id" = "notes"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization')::text
    ))
  )
  WITH CHECK (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c."id" = "notes"."clientId"
        AND c."organizationId" = current_setting('app.current_organization')::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p."id" = "notes"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization')::text
    ))
  );
CREATE POLICY "notes_delete_rls"
  ON "notes" FOR DELETE
  USING (
    ("clientId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "clients" c
      WHERE c."id" = "notes"."clientId"
        AND c."organizationId" = current_setting('app.current_organization')::text
    ))
    OR
    ("propertyId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM "properties" p
      WHERE p."id" = "notes"."propertyId"
        AND p."organizationId" = current_setting('app.current_organization')::text
    ))
  );
