-- Migration: Add Invitations table and clean up duplicate RLS policies
-- This migration:
-- 1. Creates the invitations table for org management
-- 2. Removes duplicate RLS policies (keeping the newer _rls naming convention)
-- 3. Documents BYPASSRLS limitation for Neon managed databases

-- ============================================================================
-- PART 1: Create Invitation System
-- ============================================================================

-- Create InvitationStatus enum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'CANCELED', 'EXPIRED');

-- Create invitations table
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_organizationId_fkey" 
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invitations_invitedBy_fkey" 
        FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for invitations
CREATE INDEX "invitations_organizationId_idx" ON "invitations"("organizationId");
CREATE INDEX "invitations_email_idx" ON "invitations"("email");
CREATE INDEX "invitations_token_idx" ON "invitations"("token");

-- ============================================================================
-- PART 2: Clean up Duplicate RLS Policies
-- ============================================================================
-- We have duplicate policies from different migration runs:
-- - org_isolation_* (older)
-- - *_rls (newer, from 20251015_rls_policies)
-- Keep the newer ones and remove the older duplicates.

-- Properties
DROP POLICY IF EXISTS "org_isolation_select_properties" ON "properties";
DROP POLICY IF EXISTS "org_isolation_insert_properties" ON "properties";
DROP POLICY IF EXISTS "org_isolation_update_properties" ON "properties";
DROP POLICY IF EXISTS "org_isolation_delete_properties" ON "properties";

-- Clients
DROP POLICY IF EXISTS "org_isolation_select_clients" ON "clients";
DROP POLICY IF EXISTS "org_isolation_insert_clients" ON "clients";
DROP POLICY IF EXISTS "org_isolation_update_clients" ON "clients";
DROP POLICY IF EXISTS "org_isolation_delete_clients" ON "clients";

-- Tasks
DROP POLICY IF EXISTS "org_isolation_select_tasks" ON "tasks";
DROP POLICY IF EXISTS "org_isolation_insert_tasks" ON "tasks";
DROP POLICY IF EXISTS "org_isolation_update_tasks" ON "tasks";
DROP POLICY IF EXISTS "org_isolation_delete_tasks" ON "tasks";

-- Activities
DROP POLICY IF EXISTS "org_isolation_select_activities" ON "activities";
DROP POLICY IF EXISTS "org_isolation_insert_activities" ON "activities";
DROP POLICY IF EXISTS "org_isolation_update_activities" ON "activities";
DROP POLICY IF EXISTS "org_isolation_delete_activities" ON "activities";

-- Addresses
DROP POLICY IF EXISTS "org_isolation_select_addresses" ON "addresses";
DROP POLICY IF EXISTS "org_isolation_insert_addresses" ON "addresses";
DROP POLICY IF EXISTS "org_isolation_update_addresses" ON "addresses";
DROP POLICY IF EXISTS "org_isolation_delete_addresses" ON "addresses";

-- Listings
DROP POLICY IF EXISTS "org_isolation_select_listings" ON "listings";
DROP POLICY IF EXISTS "org_isolation_insert_listings" ON "listings";
DROP POLICY IF EXISTS "org_isolation_update_listings" ON "listings";
DROP POLICY IF EXISTS "org_isolation_delete_listings" ON "listings";

-- Media Assets
DROP POLICY IF EXISTS "org_isolation_select_media_assets" ON "media_assets";
DROP POLICY IF EXISTS "org_isolation_insert_media_assets" ON "media_assets";
DROP POLICY IF EXISTS "org_isolation_update_media_assets" ON "media_assets";
DROP POLICY IF EXISTS "org_isolation_delete_media_assets" ON "media_assets";

-- Interactions
DROP POLICY IF EXISTS "org_isolation_select_interactions" ON "interactions";
DROP POLICY IF EXISTS "org_isolation_insert_interactions" ON "interactions";
DROP POLICY IF EXISTS "org_isolation_update_interactions" ON "interactions";
DROP POLICY IF EXISTS "org_isolation_delete_interactions" ON "interactions";

-- Notes
DROP POLICY IF EXISTS "org_isolation_select_notes" ON "notes";
DROP POLICY IF EXISTS "org_isolation_insert_notes" ON "notes";
DROP POLICY IF EXISTS "org_isolation_update_notes" ON "notes";
DROP POLICY IF EXISTS "org_isolation_delete_notes" ON "notes";

-- Client Relationships
DROP POLICY IF EXISTS "org_isolation_select_client_relationships" ON "client_relationships";
DROP POLICY IF EXISTS "org_isolation_insert_client_relationships" ON "client_relationships";
DROP POLICY IF EXISTS "org_isolation_update_client_relationships" ON "client_relationships";
DROP POLICY IF EXISTS "org_isolation_delete_client_relationships" ON "client_relationships";

-- ============================================================================
-- PART 3: Add RLS policies for client_relationships (if missing)
-- ============================================================================
-- Client relationships depend on clients, so check via fromClient org

-- Only create if not exists (idempotent)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'client_relationships' AND policyname = 'client_relationships_select_rls'
    ) THEN
        CREATE POLICY "client_relationships_select_rls"
          ON "client_relationships" FOR SELECT
          USING (EXISTS (
            SELECT 1 FROM "clients" c
            WHERE c."id" = "client_relationships"."fromClientId"
              AND c."organizationId" = current_setting('app.current_organization')::text
          ));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'client_relationships' AND policyname = 'client_relationships_insert_rls'
    ) THEN
        CREATE POLICY "client_relationships_insert_rls"
          ON "client_relationships" FOR INSERT
          WITH CHECK (EXISTS (
            SELECT 1 FROM "clients" c
            WHERE c."id" = "client_relationships"."fromClientId"
              AND c."organizationId" = current_setting('app.current_organization')::text
          ));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'client_relationships' AND policyname = 'client_relationships_update_rls'
    ) THEN
        CREATE POLICY "client_relationships_update_rls"
          ON "client_relationships" FOR UPDATE
          USING (EXISTS (
            SELECT 1 FROM "clients" c
            WHERE c."id" = "client_relationships"."fromClientId"
              AND c."organizationId" = current_setting('app.current_organization')::text
          ))
          WITH CHECK (EXISTS (
            SELECT 1 FROM "clients" c
            WHERE c."id" = "client_relationships"."fromClientId"
              AND c."organizationId" = current_setting('app.current_organization')::text
          ));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'client_relationships' AND policyname = 'client_relationships_delete_rls'
    ) THEN
        CREATE POLICY "client_relationships_delete_rls"
          ON "client_relationships" FOR DELETE
          USING (EXISTS (
            SELECT 1 FROM "clients" c
            WHERE c."id" = "client_relationships"."fromClientId"
              AND c."organizationId" = current_setting('app.current_organization')::text
          ));
    END IF;
END $$;

-- ============================================================================
-- IMPORTANT NOTES ON RLS WITH NEON
-- ============================================================================
-- 
-- ⚠️  KNOWN LIMITATION: Neon managed PostgreSQL databases grant BYPASSRLS 
-- privilege to the default database owner (neondb_owner). This means that
-- RLS policies are ENABLED but NOT ENFORCED for this user.
--
-- VERIFICATION:
-- Run this query to check:
--   SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname = current_user;
-- 
-- If rolbypassrls = true, the database user will bypass all RLS policies.
--
-- MITIGATION STRATEGY:
-- Since we cannot disable BYPASSRLS on Neon managed databases, we implement
-- a defense-in-depth approach:
--
-- 1. PRIMARY ISOLATION: Application-level enforcement via prismaForOrg()
--    - All server actions MUST use prismaForOrg(session.user.organizationId)
--    - This sets app.current_organization session variable
--    - Provides immediate, working tenant isolation
--
-- 2. DEFENSE-IN-DEPTH: RLS policies as safety net
--    - Policies are configured and ready
--    - Would work if database is migrated to self-hosted PostgreSQL
--    - Provides documentation of intended security model
--    - May catch bugs in future if Neon changes BYPASSRLS behavior
--
-- 3. CODE REVIEW: Enforce via linting/review
--    - All data access must use org-scoped Prisma client
--    - No direct prisma.* calls for tenant data
--    - Regular audits of server actions
--
-- If you need true database-level RLS enforcement, consider:
-- - Self-hosted PostgreSQL where you control user privileges
-- - Supabase (no BYPASSRLS for service role)
-- - Creating a separate database user without BYPASSRLS (if Neon supports)
--
-- ============================================================================
