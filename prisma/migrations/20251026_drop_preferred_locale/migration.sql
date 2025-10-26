-- Drop preferred_locale column from users table
-- This mirrors removal of `preferredLocale` from Prisma schema

-- AlterTable
ALTER TABLE "users" DROP COLUMN IF EXISTS "preferred_locale";


