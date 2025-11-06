-- Migration: Add permission field to ShareLink model
-- This allows share links to have different permission levels

-- Add permission column if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'share_links') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'share_links' AND column_name = 'permission') THEN
            ALTER TABLE "share_links" ADD COLUMN "permission" TEXT NOT NULL DEFAULT 'view';
        END IF;
    END IF;
END $$;

