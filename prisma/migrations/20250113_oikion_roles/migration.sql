-- Migration: Add Oikion roles and organization support
-- This migration updates the role system and adds organization multi-tenancy

-- Step 1: Create new enum type with new role values
CREATE TYPE "UserRole_new" AS ENUM ('ORG_OWNER', 'ADMIN', 'AGENT', 'VIEWER');

-- Step 2: Migrate existing user roles
-- USER -> AGENT (default operational role)
-- ADMIN -> ORG_OWNER (assume existing admins are org owners)
ALTER TABLE "users" 
  ADD COLUMN "role_new" "UserRole_new" DEFAULT 'AGENT';

UPDATE "users" 
  SET "role_new" = CASE 
    WHEN "role"::text = 'USER' THEN 'AGENT'::"UserRole_new"
    WHEN "role"::text = 'ADMIN' THEN 'ORG_OWNER'::"UserRole_new"
    ELSE 'AGENT'::"UserRole_new"
  END;

-- Step 3: Drop old role column and rename new one
ALTER TABLE "users" DROP COLUMN "role";
ALTER TABLE "users" RENAME COLUMN "role_new" TO "role";

-- Step 4: Drop old enum type and rename new one
DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

-- Step 5: Create Organization table
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- Step 6: Add organizationId to users table
ALTER TABLE "users" ADD COLUMN "organizationId" TEXT;

-- Step 7: Create default organization for existing users
-- For each existing user, create a default organization
INSERT INTO "organizations" ("id", "name", "created_at", "updated_at")
SELECT 
  'org_' || "id",
  COALESCE("name", "email", 'Default Organization'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "users"
WHERE "id" NOT IN (SELECT "id" FROM "organizations");

-- Step 8: Link users to their organizations
UPDATE "users" 
SET "organizationId" = 'org_' || "id"
WHERE "organizationId" IS NULL;

-- Step 9: Create Property table
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "size" DECIMAL(10,2),
    "yearBuilt" INTEGER,
    "features" JSONB,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- Step 10: Create Address table
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Greece',
    "region" TEXT,
    "city" TEXT NOT NULL,
    "street" TEXT,
    "number" TEXT,
    "postalCode" TEXT,
    "locationText" TEXT,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- Step 11: Create Listing table
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "marketingStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "listPrice" DECIMAL(12,2) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "notes" TEXT,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- Step 12: Create MediaAsset table
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- Step 13: Create Client table
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "clientType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "secondaryEmail" TEXT,
    "secondaryPhone" TEXT,
    "tags" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- Step 14: Create Interaction table
CREATE TABLE "interactions" (
    "id" TEXT NOT NULL,
    "interactionType" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT,
    "propertyId" TEXT,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("id")
);

-- Step 15: Create Task table
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "createdBy" TEXT NOT NULL,
    "clientId" TEXT,
    "propertyId" TEXT,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- Step 16: Create Note table
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT,
    "propertyId" TEXT,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- Step 17: Create Activity table
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- Step 18: Create indexes for users
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- Step 19: Create unique constraints
CREATE UNIQUE INDEX "addresses_propertyId_key" ON "addresses"("propertyId");
CREATE UNIQUE INDEX "listings_propertyId_key" ON "listings"("propertyId");

-- Step 20: Create indexes for properties
CREATE INDEX "properties_organizationId_idx" ON "properties"("organizationId");
CREATE INDEX "properties_createdBy_idx" ON "properties"("createdBy");

-- Step 21: Create indexes for media_assets
CREATE INDEX "media_assets_propertyId_idx" ON "media_assets"("propertyId");

-- Step 22: Create indexes for clients
CREATE INDEX "clients_organizationId_idx" ON "clients"("organizationId");
CREATE INDEX "clients_createdBy_idx" ON "clients"("createdBy");

-- Step 23: Create indexes for interactions
CREATE INDEX "interactions_clientId_idx" ON "interactions"("clientId");
CREATE INDEX "interactions_propertyId_idx" ON "interactions"("propertyId");
CREATE INDEX "interactions_createdBy_idx" ON "interactions"("createdBy");

-- Step 24: Create indexes for tasks
CREATE INDEX "tasks_organizationId_idx" ON "tasks"("organizationId");
CREATE INDEX "tasks_assignedTo_idx" ON "tasks"("assignedTo");
CREATE INDEX "tasks_createdBy_idx" ON "tasks"("createdBy");
CREATE INDEX "tasks_clientId_idx" ON "tasks"("clientId");
CREATE INDEX "tasks_propertyId_idx" ON "tasks"("propertyId");

-- Step 25: Create indexes for notes
CREATE INDEX "notes_clientId_idx" ON "notes"("clientId");
CREATE INDEX "notes_propertyId_idx" ON "notes"("propertyId");
CREATE INDEX "notes_createdBy_idx" ON "notes"("createdBy");

-- Step 26: Create indexes for activities
CREATE INDEX "activities_organizationId_idx" ON "activities"("organizationId");
CREATE INDEX "activities_actorId_idx" ON "activities"("actorId");
CREATE INDEX "activities_created_at_idx" ON "activities"("created_at");

-- Step 27: Add foreign key constraints
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "properties" ADD CONSTRAINT "properties_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "properties" ADD CONSTRAINT "properties_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clients" ADD CONSTRAINT "clients_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clients" ADD CONSTRAINT "clients_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "activities" ADD CONSTRAINT "activities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activities" ADD CONSTRAINT "activities_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
