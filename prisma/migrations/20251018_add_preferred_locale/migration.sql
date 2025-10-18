-- AlterTable
ALTER TABLE "users" ADD COLUMN "preferred_locale" TEXT DEFAULT 'en';

-- Update existing users to have default locale
UPDATE "users" SET "preferred_locale" = 'en' WHERE "preferred_locale" IS NULL;
