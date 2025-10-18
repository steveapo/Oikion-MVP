-- Rollback Agency to Organization Migration
-- This migration reverts all agency-related changes back to organization

-- Step 1: Rename the agencies table back to organizations
ALTER TABLE "agencies" RENAME TO "organizations";

-- Step 2: Rename the enum type
ALTER TYPE "AgencyPlan" RENAME TO "OrganizationPlan";

-- Step 3: Rename foreign key columns back in dependent tables

-- Users table
ALTER TABLE "users" RENAME COLUMN "agencyId" TO "organizationId";

-- Properties table  
ALTER TABLE "properties" RENAME COLUMN "agencyId" TO "organizationId";

-- Clients table
ALTER TABLE "clients" RENAME COLUMN "agencyId" TO "organizationId";

-- Tasks table
ALTER TABLE "tasks" RENAME COLUMN "agencyId" TO "organizationId";

-- Activities table
ALTER TABLE "activities" RENAME COLUMN "agencyId" TO "organizationId";

-- Invitations table
ALTER TABLE "invitations" RENAME COLUMN "agencyId" TO "organizationId";

-- Step 4: Rename all foreign key constraints back
-- Users
ALTER TABLE "users" RENAME CONSTRAINT "users_agencyId_fkey" TO "users_organizationId_fkey";

-- Properties
ALTER TABLE "properties" RENAME CONSTRAINT "properties_agencyId_fkey" TO "properties_organizationId_fkey";

-- Clients
ALTER TABLE "clients" RENAME CONSTRAINT "clients_agencyId_fkey" TO "clients_organizationId_fkey";

-- Tasks
ALTER TABLE "tasks" RENAME CONSTRAINT "tasks_agencyId_fkey" TO "tasks_organizationId_fkey";

-- Activities
ALTER TABLE "activities" RENAME CONSTRAINT "activities_agencyId_fkey" TO "activities_organizationId_fkey";

-- Invitations
ALTER TABLE "invitations" RENAME CONSTRAINT "invitations_agencyId_fkey" TO "invitations_organizationId_fkey";

-- Step 5: Rename all indexes back
-- Users
ALTER INDEX "users_agencyId_idx" RENAME TO "users_organizationId_idx";

-- Properties
ALTER INDEX "properties_agencyId_idx" RENAME TO "properties_organizationId_idx";

-- Clients
ALTER INDEX "clients_agencyId_idx" RENAME TO "clients_organizationId_idx";

-- Tasks
ALTER INDEX "tasks_agencyId_idx" RENAME TO "tasks_organizationId_idx";

-- Activities
ALTER INDEX "activities_agencyId_idx" RENAME TO "activities_organizationId_idx";

-- Invitations
ALTER INDEX "invitations_agencyId_idx" RENAME TO "invitations_organizationId_idx";
