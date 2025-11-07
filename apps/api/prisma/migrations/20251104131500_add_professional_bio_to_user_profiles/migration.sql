-- Add professional_bio column to user_profiles table
-- This migration handles cases where user_profiles table might not exist in shadow databases
-- Note: Prisma schema maps this to snake_case in database (professional_bio)

DO $$
BEGIN
  -- Check if user_profiles table exists before adding column
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_profiles'
  ) THEN
    -- Add professional_bio column if it doesn't exist (check both possible names)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      AND column_name = 'professional_bio'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      AND column_name = 'professionalBio'
    ) THEN
      ALTER TABLE "user_profiles"
      ADD COLUMN "professional_bio" TEXT;
    END IF;
  END IF;
END $$;
