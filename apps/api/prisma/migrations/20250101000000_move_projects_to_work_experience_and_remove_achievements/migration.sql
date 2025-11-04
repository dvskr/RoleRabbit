-- Migration: Move projects under work experience and remove achievements
-- This migration:
-- 1. Drops the achievements table
-- 2. Updates projects table to link to work_experiences instead of user_profiles
-- 3. Handles data migration for existing projects

-- Step 1: Drop achievements table if it exists
DROP TABLE IF EXISTS achievements CASCADE;

-- Step 2: Add workExperienceId column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "workExperienceId" TEXT;

-- Step 3: Migrate existing projects to link to work experiences
-- Note: This assumes projects should be linked to the most recent work experience
-- You may need to adjust this logic based on your data
UPDATE projects
SET "workExperienceId" = (
  SELECT id 
  FROM work_experiences 
  WHERE "profileId" = projects."profileId"
  ORDER BY "createdAt" DESC
  LIMIT 1
)
WHERE "workExperienceId" IS NULL AND "profileId" IS NOT NULL;

-- Step 4: Delete projects that couldn't be linked to a work experience
-- (Optional - comment out if you want to keep orphaned projects)
-- DELETE FROM projects WHERE "workExperienceId" IS NULL;

-- Step 5: Make workExperienceId NOT NULL after migration
ALTER TABLE projects ALTER COLUMN "workExperienceId" SET NOT NULL;

-- Step 6: Drop the old profileId column
ALTER TABLE projects DROP COLUMN IF EXISTS "profileId";

-- Step 7: Add foreign key constraint
ALTER TABLE projects 
ADD CONSTRAINT "projects_workExperienceId_fkey" 
FOREIGN KEY ("workExperienceId") 
REFERENCES work_experiences(id) 
ON DELETE CASCADE;

-- Step 8: Create index on workExperienceId
CREATE INDEX IF NOT EXISTS "projects_workExperienceId_idx" ON projects("workExperienceId");

