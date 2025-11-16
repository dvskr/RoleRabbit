-- Critical Schema Fixes for Production Readiness
-- Date: November 15, 2025
-- Priority: P0 (Production Blockers)

-- ============================================
-- 1. ADD MISSING COLUMNS TO BASE_RESUMES
-- ============================================

-- Add deletedAt for soft delete functionality
ALTER TABLE "base_resumes"
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Add version for optimistic locking
ALTER TABLE "base_resumes"
ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;

-- Add tags for resume organization
ALTER TABLE "base_resumes"
ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add archivedAt for archiving functionality
ALTER TABLE "base_resumes"
ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);

-- ============================================
-- 2. ADD MISSING INDEXES
-- ============================================

-- Index for soft delete queries (WHERE deletedAt IS NULL)
CREATE INDEX IF NOT EXISTS "idx_base_resumes_deletedAt" 
ON "base_resumes"("deletedAt");

-- Index for archived queries
CREATE INDEX IF NOT EXISTS "idx_base_resumes_archivedAt" 
ON "base_resumes"("archivedAt");

-- Index for tag-based searches (GIN index for array operations)
CREATE INDEX IF NOT EXISTS "idx_base_resumes_tags" 
ON "base_resumes" USING GIN ("tags");

-- Index for name-based searches
CREATE INDEX IF NOT EXISTS "idx_base_resumes_name" 
ON "base_resumes"("name");

-- Index for finding stale drafts
CREATE INDEX IF NOT EXISTS "idx_working_drafts_updatedAt" 
ON "working_drafts"("updatedAt");

-- Composite index for user's recent tailored versions
CREATE INDEX IF NOT EXISTS "idx_tailored_versions_userId_createdAt" 
ON "tailored_versions"("userId", "createdAt" DESC);

-- Index for AI request log date range queries
CREATE INDEX IF NOT EXISTS "idx_ai_request_log_createdAt" 
ON "ai_request_logs"("createdAt");

-- Index for cache cleanup queries
CREATE INDEX IF NOT EXISTS "idx_resume_cache_lastUsedAt" 
ON "resume_cache"("lastUsedAt");

-- ============================================
-- 3. ADD CHECK CONSTRAINTS
-- ============================================

-- Ensure slot number is within valid range (1-5)
DO $$ BEGIN
  ALTER TABLE "base_resumes"
  ADD CONSTRAINT "chk_base_resumes_slotNumber_range"
  CHECK ("slotNumber" >= 1 AND "slotNumber" <= 5);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure resume name is not too long
DO $$ BEGIN
  ALTER TABLE "base_resumes"
  ADD CONSTRAINT "chk_base_resumes_name_length"
  CHECK (char_length("name") <= 100 AND char_length("name") > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 4. ADD UNIQUE CONSTRAINTS
-- ============================================

-- Prevent duplicate resume names for same user (excluding deleted/archived)
CREATE UNIQUE INDEX IF NOT EXISTS "idx_base_resumes_userId_name_unique"
ON "base_resumes"("userId", "name")
WHERE "deletedAt" IS NULL AND "archivedAt" IS NULL;

-- ============================================
-- 5. CREATE RESUME_VERSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "resume_versions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "baseResumeId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "changeType" TEXT NOT NULL, -- 'manual_edit', 'ai_tailor', 'template_change', 'restore'
  "data" JSONB NOT NULL,
  "formatting" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_resume_versions_baseResume"
    FOREIGN KEY ("baseResumeId")
    REFERENCES "base_resumes"("id")
    ON DELETE CASCADE,
    
  CONSTRAINT "fk_resume_versions_user"
    FOREIGN KEY ("userId")
    REFERENCES "users"("id")
    ON DELETE CASCADE,
    
  CONSTRAINT "uq_resume_versions_baseResumeId_versionNumber"
    UNIQUE ("baseResumeId", "versionNumber")
);

-- Indexes for resume_versions
CREATE INDEX IF NOT EXISTS "idx_resume_versions_baseResumeId"
ON "resume_versions"("baseResumeId");

CREATE INDEX IF NOT EXISTS "idx_resume_versions_userId"
ON "resume_versions"("userId");

CREATE INDEX IF NOT EXISTS "idx_resume_versions_createdAt"
ON "resume_versions"("createdAt");

-- ============================================
-- 6. ADD COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN "base_resumes"."deletedAt" IS 'Timestamp when resume was soft-deleted. NULL means not deleted.';
COMMENT ON COLUMN "base_resumes"."version" IS 'Version number for optimistic locking. Incremented on each update.';
COMMENT ON COLUMN "base_resumes"."tags" IS 'User-defined tags for organizing resumes (e.g., ["Software Engineer", "Frontend"])';
COMMENT ON COLUMN "base_resumes"."archivedAt" IS 'Timestamp when resume was archived. NULL means active.';

COMMENT ON TABLE "resume_versions" IS 'Stores historical versions of resumes for version control and restore functionality';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Critical schema fixes applied successfully!';
  RAISE NOTICE '   - Added columns: deletedAt, version, tags, archivedAt';
  RAISE NOTICE '   - Added 8 indexes for performance';
  RAISE NOTICE '   - Added 2 CHECK constraints';
  RAISE NOTICE '   - Added 1 UNIQUE constraint';
  RAISE NOTICE '   - Created resume_versions table';
END $$;



