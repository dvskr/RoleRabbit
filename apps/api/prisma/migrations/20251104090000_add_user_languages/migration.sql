-- Add language model support
-- The languages table should already exist from previous migrations
-- This migration ensures the table structure is correct

CREATE TABLE IF NOT EXISTS "languages" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "proficiency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "languages_profileId_idx" ON "languages"("profileId");

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'languages_profileId_fkey'
    ) THEN
        ALTER TABLE "languages" 
        ADD CONSTRAINT "languages_profileId_fkey" 
        FOREIGN KEY ("profileId") 
        REFERENCES "user_profiles"("id") 
        ON DELETE CASCADE;
    END IF;
END $$;

