-- Migration: Move projects to profile (separate section) and remove achievements
-- This migration:
-- 1. Drops the achievements table
-- 2. Updates projects table to link to user_profiles instead of work_experiences
-- 3. Handles data migration for existing projects

-- Step 1: Drop achievements table if it exists
DROP TABLE IF EXISTS achievements CASCADE;

-- Step 2: Add profileId column to projects table (if not exists)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "profileId" TEXT;

-- Step 3: Migrate existing projects to link to profiles
-- Find the profileId for each project based on workExperienceId
UPDATE projects
SET "profileId" = (
  SELECT "profileId" 
  FROM work_experiences 
  WHERE work_experiences.id = projects."workExperienceId"
  LIMIT 1
)
WHERE "profileId" IS NULL AND "workExperienceId" IS NOT NULL;

-- Step 4: Delete projects that couldn't be linked to a profile
-- (Optional - comment out if you want to keep orphaned projects)
-- DELETE FROM projects WHERE "profileId" IS NULL;

-- Step 5: Make profileId NOT NULL after migration
ALTER TABLE projects ALTER COLUMN "profileId" SET NOT NULL;

-- Step 6: Drop the old workExperienceId column
ALTER TABLE projects DROP COLUMN IF EXISTS "workExperienceId";

-- Step 7: Add foreign key constraint
ALTER TABLE projects 
ADD CONSTRAINT "projects_profileId_fkey" 
FOREIGN KEY ("profileId") 
REFERENCES user_profiles(id) 
ON DELETE CASCADE;

-- Step 8: Create index on profileId
CREATE INDEX IF NOT EXISTS "projects_profileId_idx" ON projects("profileId");

