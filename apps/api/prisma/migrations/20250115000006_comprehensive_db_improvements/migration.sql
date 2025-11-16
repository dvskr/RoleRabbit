-- Comprehensive Database Improvements Migration
-- DB-042 through DB-065: Indexes, constraints, audit fields, cleanup functions, and data migrations

-- ============================================================================
-- PART 1: ADD MISSING AUDIT FIELDS (DB-055, DB-056, DB-057, DB-058)
-- ============================================================================

-- DB-058: Add deletedBy to storage_files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'storage_files' 
        AND column_name = 'deletedBy'
    ) THEN
        ALTER TABLE "storage_files" ADD COLUMN "deletedBy" TEXT;
        ALTER TABLE "storage_files" ADD CONSTRAINT "storage_files_deletedBy_fkey" 
            FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        CREATE INDEX IF NOT EXISTS "storage_files_deletedBy_idx" ON "storage_files"("deletedBy");
    END IF;
END $$;

-- DB-058: Add deletedBy to storage_folders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'storage_folders' 
        AND column_name = 'deletedBy'
    ) THEN
        ALTER TABLE "storage_folders" ADD COLUMN "deletedBy" TEXT;
        ALTER TABLE "storage_folders" ADD CONSTRAINT "storage_folders_deletedBy_fkey" 
            FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        CREATE INDEX IF NOT EXISTS "storage_folders_deletedBy_idx" ON "storage_folders"("deletedBy");
    END IF;
END $$;

-- DB-056: Add createdBy and updatedBy to file_shares (if not present)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'file_shares' 
        AND column_name = 'createdBy'
    ) THEN
        ALTER TABLE "file_shares" ADD COLUMN "createdBy" TEXT;
        -- Use userId as default for createdBy
        UPDATE "file_shares" SET "createdBy" = "userId" WHERE "createdBy" IS NULL;
        ALTER TABLE "file_shares" ALTER COLUMN "createdBy" SET NOT NULL;
        ALTER TABLE "file_shares" ADD CONSTRAINT "file_shares_createdBy_fkey" 
            FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        CREATE INDEX IF NOT EXISTS "file_shares_createdBy_idx" ON "file_shares"("createdBy");
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'file_shares' 
        AND column_name = 'updatedBy'
    ) THEN
        ALTER TABLE "file_shares" ADD COLUMN "updatedBy" TEXT;
        ALTER TABLE "file_shares" ADD CONSTRAINT "file_shares_updatedBy_fkey" 
            FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        CREATE INDEX IF NOT EXISTS "file_shares_updatedBy_idx" ON "file_shares"("updatedBy");
    END IF;
END $$;

-- DB-056: Add createdBy and updatedBy to share_links (if not present)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'share_links' 
        AND column_name = 'createdBy'
    ) THEN
        ALTER TABLE "share_links" ADD COLUMN "createdBy" TEXT;
        -- Use userId as default for createdBy
        UPDATE "share_links" SET "createdBy" = "userId" WHERE "createdBy" IS NULL;
        ALTER TABLE "share_links" ALTER COLUMN "createdBy" SET NOT NULL;
        ALTER TABLE "share_links" ADD CONSTRAINT "share_links_createdBy_fkey" 
            FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        CREATE INDEX IF NOT EXISTS "share_links_createdBy_idx" ON "share_links"("createdBy");
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'share_links' 
        AND column_name = 'updatedBy'
    ) THEN
        ALTER TABLE "share_links" ADD COLUMN "updatedBy" TEXT;
        ALTER TABLE "share_links" ADD CONSTRAINT "share_links_updatedBy_fkey" 
            FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        CREATE INDEX IF NOT EXISTS "share_links_updatedBy_idx" ON "share_links"("updatedBy");
    END IF;
END $$;

-- DB-056: Add createdBy and updatedBy to storage_folders (if not present)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'storage_folders' 
        AND column_name = 'createdBy'
    ) THEN
        ALTER TABLE "storage_folders" ADD COLUMN "createdBy" TEXT;
        -- Use userId as default for createdBy
        UPDATE "storage_folders" SET "createdBy" = "userId" WHERE "createdBy" IS NULL;
        ALTER TABLE "storage_folders" ALTER COLUMN "createdBy" SET NOT NULL;
        ALTER TABLE "storage_folders" ADD CONSTRAINT "storage_folders_createdBy_fkey" 
            FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        CREATE INDEX IF NOT EXISTS "storage_folders_createdBy_idx" ON "storage_folders"("createdBy");
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'storage_folders' 
        AND column_name = 'updatedBy'
    ) THEN
        ALTER TABLE "storage_folders" ADD COLUMN "updatedBy" TEXT;
        ALTER TABLE "storage_folders" ADD CONSTRAINT "storage_folders_updatedBy_fkey" 
            FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        CREATE INDEX IF NOT EXISTS "storage_folders_updatedBy_idx" ON "storage_folders"("updatedBy");
    END IF;
END $$;

-- ============================================================================
-- PART 2: ADD MISSING INDEXES (DB-042, DB-043)
-- ============================================================================

-- DB-042: Additional indexes for file_access_logs
CREATE INDEX IF NOT EXISTS "file_access_logs_action_idx" ON "file_access_logs"("action");
CREATE INDEX IF NOT EXISTS "file_access_logs_fileId_createdAt_idx" ON "file_access_logs"("fileId", "createdAt");
CREATE INDEX IF NOT EXISTS "file_access_logs_userId_action_idx" ON "file_access_logs"("userId", "action");

-- DB-042: Additional indexes for file_shares
CREATE INDEX IF NOT EXISTS "file_shares_expiresAt_idx" ON "file_shares"("expiresAt");
CREATE INDEX IF NOT EXISTS "file_shares_userId_fileId_idx" ON "file_shares"("userId", "fileId");
CREATE INDEX IF NOT EXISTS "file_shares_sharedWith_idx" ON "file_shares"("sharedWith");

-- DB-042: Additional indexes for share_links
CREATE INDEX IF NOT EXISTS "share_links_expiresAt_idx" ON "share_links"("expiresAt");
CREATE INDEX IF NOT EXISTS "share_links_userId_fileId_idx" ON "share_links"("userId", "fileId");
CREATE INDEX IF NOT EXISTS "share_links_permission_idx" ON "share_links"("permission");

-- DB-042: Additional indexes for storage_folders
CREATE INDEX IF NOT EXISTS "storage_folders_userId_parentId_idx" ON "storage_folders"("userId", "parentId");
CREATE INDEX IF NOT EXISTS "storage_folders_userId_deletedAt_idx" ON "storage_folders"("userId", "deletedAt");

-- DB-042: Additional indexes for file_versions
CREATE INDEX IF NOT EXISTS "file_versions_fileId_createdAt_idx" ON "file_versions"("fileId", "createdAt");

-- ============================================================================
-- PART 3: DATABASE FUNCTIONS FOR CLEANUP (DB-049, DB-050, DB-051, DB-054)
-- ============================================================================

-- DB-049: Function to clean up expired shares
CREATE OR REPLACE FUNCTION cleanup_expired_shares()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM "file_shares"
    WHERE "expiresAt" IS NOT NULL
    AND "expiresAt" < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- DB-050: Function to clean up expired share links
CREATE OR REPLACE FUNCTION cleanup_expired_share_links()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM "share_links"
    WHERE "expiresAt" IS NOT NULL
    AND "expiresAt" < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- DB-051: Function to clean up old file access logs (90 days retention)
CREATE OR REPLACE FUNCTION cleanup_old_file_access_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM "file_access_logs"
    WHERE "createdAt" < (NOW() - (retention_days || ' days')::INTERVAL);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- DB-048: Function to sync storage quota with actual file sizes
CREATE OR REPLACE FUNCTION sync_storage_quota(target_user_id TEXT DEFAULT NULL)
RETURNS TABLE(user_id TEXT, used_bytes BIGINT) AS $$
BEGIN
    RETURN QUERY
    WITH user_file_sizes AS (
        SELECT 
            "userId",
            COALESCE(SUM("size"), 0::BIGINT) AS total_size
        FROM "storage_files"
        WHERE "deletedAt" IS NULL
        AND (target_user_id IS NULL OR "userId" = target_user_id)
        GROUP BY "userId"
    )
    UPDATE "storage_quotas" q
    SET 
        "usedBytes" = ufs.total_size,
        "updatedAt" = NOW()
    FROM user_file_sizes ufs
    WHERE q."userId" = ufs."userId"
    RETURNING q."userId", q."usedBytes";
END;
$$ LANGUAGE plpgsql;

-- DB-054: Function to verify file hash integrity
CREATE OR REPLACE FUNCTION verify_file_hash_integrity()
RETURNS TABLE(
    file_id TEXT,
    hash_matches BOOLEAN,
    has_hash BOOLEAN
) AS $$
BEGIN
    -- This function checks that files with hashes have valid data
    -- Actual hash computation should be done in application layer
    RETURN QUERY
    SELECT 
        sf."id"::TEXT AS file_id,
        (sf."fileHash" IS NOT NULL AND sf."fileHash" != '') AS hash_matches,
        (sf."fileHash" IS NOT NULL) AS has_hash
    FROM "storage_files" sf
    WHERE sf."deletedAt" IS NULL
    AND sf."fileHash" IS NULL; -- Find files missing hashes
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 4: CONSTRAINTS TO PREVENT CIRCULAR REFERENCES (DB-052, DB-053)
-- ============================================================================

-- DB-052: Function to prevent circular folder references
CREATE OR REPLACE FUNCTION prevent_circular_folder_reference()
RETURNS TRIGGER AS $$
DECLARE
    parent_path TEXT[];
    current_id TEXT;
BEGIN
    -- Prevent self-reference
    IF NEW."parentId" = NEW."id" THEN
        RAISE EXCEPTION 'Folder cannot be its own parent';
    END IF;
    
    -- Check for circular references by traversing parent chain
    IF NEW."parentId" IS NOT NULL THEN
        current_id := NEW."parentId";
        parent_path := ARRAY[NEW."id"];
        
        WHILE current_id IS NOT NULL LOOP
            -- Check if we've seen this ID before (circular reference)
            IF current_id = ANY(parent_path) THEN
                RAISE EXCEPTION 'Circular folder reference detected';
            END IF;
            
            -- Add current ID to path
            parent_path := parent_path || current_id;
            
            -- Get parent's parent
            SELECT "parentId" INTO current_id
            FROM "storage_folders"
            WHERE "id" = current_id;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for folder updates
DROP TRIGGER IF EXISTS check_circular_folder_reference ON "storage_folders";
CREATE TRIGGER check_circular_folder_reference
    BEFORE INSERT OR UPDATE ON "storage_folders"
    FOR EACH ROW
    EXECUTE FUNCTION prevent_circular_folder_reference();

-- DB-053: Function to prevent circular comment references
CREATE OR REPLACE FUNCTION prevent_circular_comment_reference()
RETURNS TRIGGER AS $$
DECLARE
    parent_path TEXT[];
    current_id TEXT;
BEGIN
    -- Prevent self-reference
    IF NEW."parentId" = NEW."id" THEN
        RAISE EXCEPTION 'Comment cannot be its own parent';
    END IF;
    
    -- Check for circular references
    IF NEW."parentId" IS NOT NULL THEN
        current_id := NEW."parentId";
        parent_path := ARRAY[NEW."id"];
        
        WHILE current_id IS NOT NULL LOOP
            -- Check for circular reference
            IF current_id = ANY(parent_path) THEN
                RAISE EXCEPTION 'Circular comment reference detected';
            END IF;
            
            parent_path := parent_path || current_id;
            
            SELECT "parentId" INTO current_id
            FROM "file_comments"
            WHERE "id" = current_id;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment updates
DROP TRIGGER IF EXISTS check_circular_comment_reference ON "file_comments";
CREATE TRIGGER check_circular_comment_reference
    BEFORE INSERT OR UPDATE ON "file_comments"
    FOR EACH ROW
    EXECUTE FUNCTION prevent_circular_comment_reference();

-- ============================================================================
-- PART 5: DATA MIGRATIONS (DB-059 through DB-065)
-- ============================================================================

-- DB-064: Populate uploadedBy and modifiedBy from userId for existing files
DO $$
BEGIN
    UPDATE "storage_files"
    SET "uploadedBy" = "userId"
    WHERE "uploadedBy" IS NULL
    AND "userId" IS NOT NULL;
END $$;

DO $$
BEGIN
    UPDATE "storage_files"
    SET "modifiedBy" = "userId"
    WHERE "modifiedBy" IS NULL
    AND "updatedAt" > "createdAt"
    AND "userId" IS NOT NULL;
END $$;

-- DB-064: Populate createdBy for file_shares (already done above, but ensure all are set)
DO $$
BEGIN
    UPDATE "file_shares"
    SET "createdBy" = "userId"
    WHERE "createdBy" IS NULL
    AND "userId" IS NOT NULL;
END $$;

-- DB-064: Populate createdBy for share_links (already done above)
DO $$
BEGIN
    UPDATE "share_links"
    SET "createdBy" = "userId"
    WHERE "createdBy" IS NULL
    AND "userId" IS NOT NULL;
END $$;

-- DB-064: Populate createdBy for storage_folders (already done above)
DO $$
BEGIN
    UPDATE "storage_folders"
    SET "createdBy" = "userId"
    WHERE "createdBy" IS NULL
    AND "userId" IS NOT NULL;
END $$;

-- Note: DB-060 (backfill fileHash), DB-061 (sync quota), DB-062 (cleanup orphaned),
-- and DB-063 (hash passwords) should be run as separate migration scripts
-- or application-level jobs since they require file system access or hashing

-- ============================================================================
-- PART 6: VERIFY FOREIGN KEY CONSTRAINTS (DB-045, DB-046)
-- ============================================================================

-- Note: Foreign key constraints are already defined in the schema
-- This section verifies that all necessary FKs exist and have proper cascade rules

-- Verify storage_files foreign keys
DO $$
BEGIN
    -- Ensure all foreign keys exist (they should already from schema)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'storage_files_userId_fkey'
    ) THEN
        ALTER TABLE "storage_files" ADD CONSTRAINT "storage_files_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'storage_files_folderId_fkey'
    ) THEN
        ALTER TABLE "storage_files" ADD CONSTRAINT "storage_files_folderId_fkey"
            FOREIGN KEY ("folderId") REFERENCES "storage_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Verify storage_folders foreign keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'storage_folders_userId_fkey'
    ) THEN
        ALTER TABLE "storage_folders" ADD CONSTRAINT "storage_folders_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'storage_folders_parentId_fkey'
    ) THEN
        ALTER TABLE "storage_folders" ADD CONSTRAINT "storage_folders_parentId_fkey"
            FOREIGN KEY ("parentId") REFERENCES "storage_folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Comments for documentation
COMMENT ON FUNCTION cleanup_expired_shares() IS 'DB-049: Clean up expired file shares';
COMMENT ON FUNCTION cleanup_expired_share_links() IS 'DB-050: Clean up expired share links';
COMMENT ON FUNCTION cleanup_old_file_access_logs(INTEGER) IS 'DB-051: Clean up old file access logs (default 90 days retention)';
COMMENT ON FUNCTION sync_storage_quota(TEXT) IS 'DB-048: Sync storage quota with actual file sizes';
COMMENT ON FUNCTION verify_file_hash_integrity() IS 'DB-054: Verify file hash integrity (finds files missing hashes)';
COMMENT ON FUNCTION prevent_circular_folder_reference() IS 'DB-052: Prevent circular folder references';
COMMENT ON FUNCTION prevent_circular_comment_reference() IS 'DB-053: Prevent circular comment references';

