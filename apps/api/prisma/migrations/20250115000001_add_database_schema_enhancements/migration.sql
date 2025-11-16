-- DB-001: version column already exists (added in previous migration)
-- DB-002: Add tags column to StorageFile table
ALTER TABLE "storage_files" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DB-003: Add expiresAt column to StorageFile table
ALTER TABLE "storage_files" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

-- DB-004: Add lastAccessedAt column to StorageFile table
ALTER TABLE "storage_files" ADD COLUMN IF NOT EXISTS "lastAccessedAt" TIMESTAMP(3);

-- DB-005: thumbnailPath already exists as "thumbnail" column (added in previous migration)
-- DB-006: Add metadata column to StorageFile table (JSON)
ALTER TABLE "storage_files" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- DB-007: Add uploadedBy column to StorageFile table
ALTER TABLE "storage_files" ADD COLUMN IF NOT EXISTS "uploadedBy" TEXT;

-- DB-008: Add modifiedBy column to StorageFile table
ALTER TABLE "storage_files" ADD COLUMN IF NOT EXISTS "modifiedBy" TEXT;

-- DB-009: Note: No unique constraint on (userId, name) to allow duplicates
-- Application-level validation can check for duplicates and prompt user for confirmation
-- This allows flexibility while still being able to detect and handle duplicates in code

-- DB-010, DB-011: Check constraints on size and contentType
-- Prisma doesn't support CHECK constraints directly, handled at application level
-- Add validation in backend code

-- Add foreign keys for audit fields
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'storage_files_uploadedBy_fkey'
    ) THEN
        ALTER TABLE "storage_files" ADD CONSTRAINT "storage_files_uploadedBy_fkey" 
        FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'storage_files_modifiedBy_fkey'
    ) THEN
        ALTER TABLE "storage_files" ADD CONSTRAINT "storage_files_modifiedBy_fkey" 
        FOREIGN KEY ("modifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS "storage_files_expiresAt_idx" ON "storage_files"("expiresAt");
CREATE INDEX IF NOT EXISTS "storage_files_lastAccessedAt_idx" ON "storage_files"("lastAccessedAt");
CREATE INDEX IF NOT EXISTS "storage_files_uploadedBy_idx" ON "storage_files"("uploadedBy");
CREATE INDEX IF NOT EXISTS "storage_files_modifiedBy_idx" ON "storage_files"("modifiedBy");

-- DB-012: Add description column to StorageFolder table
ALTER TABLE "storage_folders" ADD COLUMN IF NOT EXISTS "description" TEXT;

-- DB-013: Add icon column to StorageFolder table
ALTER TABLE "storage_folders" ADD COLUMN IF NOT EXISTS "icon" TEXT;

-- DB-014: Add sortOrder column to StorageFolder table
ALTER TABLE "storage_folders" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- DB-015: Add metadata column to StorageFolder table (JSON)
ALTER TABLE "storage_folders" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- DB-016: Add unique constraint on (userId, name) in StorageFolder table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'storage_folders_userId_name_key'
    ) THEN
        ALTER TABLE "storage_folders" ADD CONSTRAINT "storage_folders_userId_name_key" 
        UNIQUE ("userId", "name");
    END IF;
END $$;

-- DB-017: Check constraint preventing self-reference handled at application level

-- Add index for sortOrder
CREATE INDEX IF NOT EXISTS "storage_folders_sortOrder_idx" ON "storage_folders"("sortOrder");

-- DB-018: Add notifiedAt column to FileShare table
ALTER TABLE "file_shares" ADD COLUMN IF NOT EXISTS "notifiedAt" TIMESTAMP(3);

-- DB-019: Add accessedAt column to FileShare table
ALTER TABLE "file_shares" ADD COLUMN IF NOT EXISTS "accessedAt" TIMESTAMP(3);

-- DB-020: Add lastAccessedAt column to FileShare table
ALTER TABLE "file_shares" ADD COLUMN IF NOT EXISTS "lastAccessedAt" TIMESTAMP(3);

-- DB-021, DB-022: Check constraints on permission and expiresAt handled at application level

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS "file_shares_accessedAt_idx" ON "file_shares"("accessedAt");
CREATE INDEX IF NOT EXISTS "file_shares_lastAccessedAt_idx" ON "file_shares"("lastAccessedAt");

-- DB-023: Add accessedAt column to ShareLink table
ALTER TABLE "share_links" ADD COLUMN IF NOT EXISTS "accessedAt" TIMESTAMP(3);

-- DB-024: Add lastAccessedAt column to ShareLink table
ALTER TABLE "share_links" ADD COLUMN IF NOT EXISTS "lastAccessedAt" TIMESTAMP(3);

-- DB-025: createdBy already exists as "userId" column
-- DB-026, DB-027, DB-028, DB-029: Check constraints handled at application level

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS "share_links_accessedAt_idx" ON "share_links"("accessedAt");
CREATE INDEX IF NOT EXISTS "share_links_lastAccessedAt_idx" ON "share_links"("lastAccessedAt");

-- DB-030: Add editedAt column to FileComment table
ALTER TABLE "file_comments" ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMP(3);

-- DB-031: Add editedBy column to FileComment table
ALTER TABLE "file_comments" ADD COLUMN IF NOT EXISTS "editedBy" TEXT;

-- DB-032: Add mentions column to FileComment table
ALTER TABLE "file_comments" ADD COLUMN IF NOT EXISTS "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DB-033: Check constraint preventing self-reference handled at application level
-- DB-034: Content length constraint (max 5000 chars) - handled by VARCHAR(5000) in schema

-- Add foreign key for editedBy
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'file_comments_editedBy_fkey'
    ) THEN
        ALTER TABLE "file_comments" ADD CONSTRAINT "file_comments_editedBy_fkey" 
        FOREIGN KEY ("editedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add index for editedBy
CREATE INDEX IF NOT EXISTS "file_comments_editedBy_idx" ON "file_comments"("editedBy");

-- Update content column to VARCHAR(5000) if not already
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'file_comments' 
        AND column_name = 'content'
        AND data_type != 'character varying'
    ) THEN
        ALTER TABLE "file_comments" ALTER COLUMN "content" TYPE VARCHAR(5000);
    END IF;
END $$;

-- DB-035: Add tier column to StorageQuota table
ALTER TABLE "storage_quotas" ADD COLUMN IF NOT EXISTS "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE';

-- DB-036: Add warnedAt column to StorageQuota table
ALTER TABLE "storage_quotas" ADD COLUMN IF NOT EXISTS "warnedAt" TIMESTAMP(3);

-- DB-037: Add upgradedAt column to StorageQuota table
ALTER TABLE "storage_quotas" ADD COLUMN IF NOT EXISTS "upgradedAt" TIMESTAMP(3);

-- DB-038, DB-039, DB-040: Check constraints handled at application level

-- Add index for tier
CREATE INDEX IF NOT EXISTS "storage_quotas_tier_idx" ON "storage_quotas"("tier");

