-- Add portfolio column to user_profiles table if it doesn't exist
-- This migration handles cases where user_profiles table might not exist in shadow databases

DO $$
BEGIN
  -- Check if user_profiles table exists before adding column
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_profiles'
  ) THEN
    -- Add portfolio column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_profiles' AND column_name = 'portfolio'
    ) THEN
      ALTER TABLE "user_profiles"
      ADD COLUMN "portfolio" TEXT;
    END IF;
  END IF;
END $$;
