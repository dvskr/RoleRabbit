-- Alter education table to support extended education fields
-- This migration handles cases where education table might not exist in shadow databases

DO $$
BEGIN
  -- Check if education table exists before modifying it
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'education'
  ) THEN
    -- Rename graduationDate to endDate if graduationDate exists and endDate doesn't
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'education' AND column_name = 'graduationDate'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'education' AND column_name = 'endDate'
    ) THEN
      ALTER TABLE "education"
      RENAME COLUMN "graduationDate" TO "endDate";
    END IF;

    -- Add new columns if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'education' AND column_name = 'startDate'
    ) THEN
      ALTER TABLE "education"
      ADD COLUMN "startDate" TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'education' AND column_name = 'gpa'
    ) THEN
      ALTER TABLE "education"
      ADD COLUMN "gpa" TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'education' AND column_name = 'honors'
    ) THEN
      ALTER TABLE "education"
      ADD COLUMN "honors" TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'education' AND column_name = 'location'
    ) THEN
      ALTER TABLE "education"
      ADD COLUMN "location" TEXT;
    END IF;
  END IF;
END $$;
