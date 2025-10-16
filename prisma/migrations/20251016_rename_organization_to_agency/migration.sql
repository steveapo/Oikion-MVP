-- Rename Organization to Agency Migration
-- This migration renames all organization-related tables, columns, and enums to agency

-- Step 1: Rename the enum type
ALTER TYPE "OrganizationPlan" RENAME TO "AgencyPlan";

-- Step 2: Rename the organizations table to agencies
ALTER TABLE "organizations" RENAME TO "agencies";

-- Step 3: Rename foreign key columns in dependent tables

-- Users table
ALTER TABLE "users" RENAME COLUMN "organizationId" TO "agencyId";

-- Properties table  
ALTER TABLE "properties" RENAME COLUMN "organizationId" TO "agencyId";

-- Clients table
ALTER TABLE "clients" RENAME COLUMN "organizationId" TO "agencyId";

-- Tasks table
ALTER TABLE "tasks" RENAME COLUMN "organizationId" TO "agencyId";

-- Activities table
ALTER TABLE "activities" RENAME COLUMN "organizationId" TO "agencyId";

-- Invitations table
ALTER TABLE "invitations" RENAME COLUMN "organizationId" TO "agencyId";

-- Step 4: Rename all foreign key constraints
-- Users
ALTER TABLE "users" RENAME CONSTRAINT "users_organizationId_fkey" TO "users_agencyId_fkey";

-- Properties
ALTER TABLE "properties" RENAME CONSTRAINT "properties_organizationId_fkey" TO "properties_agencyId_fkey";

-- Clients
ALTER TABLE "clients" RENAME CONSTRAINT "clients_organizationId_fkey" TO "clients_agencyId_fkey";

-- Tasks
ALTER TABLE "tasks" RENAME CONSTRAINT "tasks_organizationId_fkey" TO "tasks_agencyId_fkey";

-- Activities
ALTER TABLE "activities" RENAME CONSTRAINT "activities_organizationId_fkey" TO "activities_agencyId_fkey";

-- Invitations
ALTER TABLE "invitations" RENAME CONSTRAINT "invitations_organizationId_fkey" TO "invitations_agencyId_fkey";

-- Step 5: Rename all indexes
-- Users
ALTER INDEX "users_organizationId_idx" RENAME TO "users_agencyId_idx";

-- Properties
ALTER INDEX "properties_organizationId_idx" RENAME TO "properties_agencyId_idx";

-- Clients
ALTER INDEX "clients_organizationId_idx" RENAME TO "clients_agencyId_idx";

-- Tasks
ALTER INDEX "tasks_organizationId_idx" RENAME TO "tasks_agencyId_idx";

-- Activities
ALTER INDEX "activities_organizationId_idx" RENAME TO "activities_agencyId_idx";

-- Invitations
ALTER INDEX "invitations_organizationId_idx" RENAME TO "invitations_agencyId_idx";
