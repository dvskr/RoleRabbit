-- Migration: Move projects to profile (separate section) and remove achievements
-- This migration:
-- 1. Drops the achievements table
-- 2. Creates or updates projects table to link to user_profiles instead of work_experiences
-- 3. Handles data migration for existing projects

-- Step 1: Drop achievements table if it exists
DROP TABLE IF EXISTS achievements CASCADE;

-- Step 2: Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS "projects" (
    "id" TEXT NOT NULL,
    "profileId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "technologies" TEXT,
    "date" TEXT,
    "link" TEXT,
    "github" TEXT,
    "media" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- Step 3: Add profileId column if it doesn't exist (for existing tables)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'profileId'
  ) THEN
    ALTER TABLE projects ADD COLUMN "profileId" TEXT;
  END IF;
END $$;

-- Step 4: Migrate existing projects to link to profiles (only if workExperienceId column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'workExperienceId'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'work_experiences'
  ) THEN
    -- Find the profileId for each project based on workExperienceId
    UPDATE projects
    SET "profileId" = (
      SELECT "profileId" 
      FROM work_experiences 
      WHERE work_experiences.id = projects."workExperienceId"
      LIMIT 1
    )
    WHERE "profileId" IS NULL AND "workExperienceId" IS NOT NULL;
    
    -- Drop the old workExperienceId column
    ALTER TABLE projects DROP COLUMN "workExperienceId";
  END IF;
END $$;

-- Step 5: Make profileId NOT NULL after migration (only if table has data and user_profiles exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles')
     AND EXISTS (SELECT 1 FROM projects LIMIT 1) THEN
    -- Only set NOT NULL if column is currently nullable
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'projects' 
      AND column_name = 'profileId' 
      AND is_nullable = 'YES'
    ) THEN
      ALTER TABLE projects ALTER COLUMN "profileId" SET NOT NULL;
    END IF;
  END IF;
END $$;

-- Step 6: Add foreign key constraint if it doesn't exist AND user_profiles exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'projects_profileId_fkey'
     ) THEN
    ALTER TABLE projects 
    ADD CONSTRAINT "projects_profileId_fkey" 
    FOREIGN KEY ("profileId") 
    REFERENCES user_profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Step 7: Create index on profileId if it doesn't exist
CREATE INDEX IF NOT EXISTS "projects_profileId_idx" ON projects("profileId");
