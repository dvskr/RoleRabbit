-- Migration: Remove unused profile fields from user_profiles table
-- These fields are not in the current schema and are not actively used

BEGIN;

-- Drop columns from user_profiles table if they exist
ALTER TABLE roleready.user_profiles DROP COLUMN IF EXISTS "bio";
ALTER TABLE roleready.user_profiles DROP COLUMN IF EXISTS "currentRole";
ALTER TABLE roleready.user_profiles DROP COLUMN IF EXISTS "currentCompany";
ALTER TABLE roleready.user_profiles DROP COLUMN IF EXISTS "industry";
ALTER TABLE roleready.user_profiles DROP COLUMN IF EXISTS "jobLevel";

-- Drop columns from users table if they exist (these were from old schema)
ALTER TABLE roleready.users DROP COLUMN IF EXISTS "targetRoles";
ALTER TABLE roleready.users DROP COLUMN IF EXISTS "targetCompanies";
ALTER TABLE roleready.users DROP COLUMN IF EXISTS "experience";

COMMIT;

