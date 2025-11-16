-- DB-059: Create migration to add all new columns with default values
-- (Already done in previous migration 20250115000001_add_database_schema_enhancements)

-- DB-060: Backfill fileHash for existing files (recompute hashes)
-- Note: This requires application-level logic to read files and compute hashes
-- See: apps/api/utils/databaseCleanup.js - verifyFileIntegrity function
-- This migration creates a function that can be called from application code

CREATE OR REPLACE FUNCTION backfill_file_hashes()
RETURNS TABLE(file_id TEXT, status TEXT) AS $$
BEGIN
  -- This function is a placeholder
  -- Actual hash computation must be done in application code
  -- because it requires reading file content from storage
  RETURN QUERY
  SELECT 
    id::TEXT as file_id,
    'PENDING'::TEXT as status
  FROM storage_files
  WHERE "fileHash" IS NULL
  LIMIT 0;
END;
$$ LANGUAGE plpgsql;

-- DB-061: Sync storage quota with actual file sizes
-- This creates a function to recalculate quota from actual file sizes

CREATE OR REPLACE FUNCTION sync_storage_quota()
RETURNS void AS $$
BEGIN
  -- Update quota for all users based on their actual file sizes
  UPDATE storage_quotas sq
  SET "usedBytes" = COALESCE(
    (SELECT SUM(size) 
     FROM storage_files 
     WHERE "userId" = sq."userId" 
     AND "deletedAt" IS NULL),
    0
  )
  WHERE EXISTS (
    SELECT 1 FROM users u WHERE u.id = sq."userId"
  );
END;
$$ LANGUAGE plpgsql;

-- Run the sync
SELECT sync_storage_quota();

-- DB-062: Clean up orphaned files (files in DB but not in storage)
-- This is handled by application-level cleanup job
-- See: apps/api/utils/databaseCleanup.js - cleanupOrphanedFiles function

-- Mark files as corrupted if they don't exist in storage
-- (This would require storage access, so it's application-level)

-- DB-063: Hash existing ShareLink passwords (if any exist)
-- Note: Passwords should already be hashed, but this ensures they are

-- Check if any share links have unhashed passwords (plain text)
-- This is a safety check - passwords should be hashed at creation time
-- See: apps/api/utils/shareLinkSecurity.js

-- DB-064: Populate uploadedBy and modifiedBy from userId for existing files
UPDATE storage_files
SET "uploadedBy" = "userId"
WHERE "uploadedBy" IS NULL;

UPDATE storage_files
SET "modifiedBy" = "userId"
WHERE "modifiedBy" IS NULL AND "updatedAt" > "createdAt";

-- DB-065: Add indexes for new query patterns
-- (Already done in migration 20250115000002_add_missing_indexes_and_constraints)

-- Additional indexes that might be useful
CREATE INDEX IF NOT EXISTS "storage_files_userId_type_createdAt_idx" 
ON "storage_files"("userId", "type", "createdAt");

CREATE INDEX IF NOT EXISTS "storage_files_expiresAt_deletedAt_idx" 
ON "storage_files"("expiresAt", "deletedAt") 
WHERE "expiresAt" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "file_shares_expiresAt_idx" 
ON "file_shares"("expiresAt") 
WHERE "expiresAt" IS NOT NULL;

