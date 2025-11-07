-- Migration: Remove tags column from storage_files table
-- This migration removes the deprecated tags field from storage files
-- Handles cases where storage_files table might not exist in shadow databases

DO $$
BEGIN
  -- Check if storage_files table exists before removing column
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'storage_files'
  ) THEN
    -- Remove tags column if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'storage_files' AND column_name = 'tags'
    ) THEN
      ALTER TABLE "storage_files" DROP COLUMN "tags";
    END IF;
  END IF;
END $$;
