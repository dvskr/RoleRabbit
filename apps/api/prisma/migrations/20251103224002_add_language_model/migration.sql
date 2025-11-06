-- Add language model support
-- This migration creates the languages table and handles missing dependencies gracefully

-- Create languages table if it doesn't exist
CREATE TABLE IF NOT EXISTS "languages" (
    "id" TEXT NOT NULL,
    "profileId" TEXT,
    "name" TEXT NOT NULL,
    "proficiency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS "languages_profileId_idx" ON "languages"("profileId");

-- Add foreign key constraint only if user_profiles table exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_profiles'
    ) THEN
        -- Add constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'languages_profileId_fkey'
        ) THEN
            ALTER TABLE "languages" 
            ADD CONSTRAINT "languages_profileId_fkey" 
            FOREIGN KEY ("profileId") 
            REFERENCES "user_profiles"("id") 
            ON DELETE CASCADE;
        END IF;
        
        -- Make profileId NOT NULL if table has data and user_profiles exists
        IF EXISTS (SELECT 1 FROM languages LIMIT 1) THEN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'languages' 
                AND column_name = 'profileId' 
                AND is_nullable = 'YES'
            ) THEN
                ALTER TABLE "languages" ALTER COLUMN "profileId" SET NOT NULL;
            END IF;
        END IF;
    END IF;
END $$;

