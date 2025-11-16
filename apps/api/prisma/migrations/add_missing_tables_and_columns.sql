-- ============================================================================
-- MIGRATION: Add Missing Tables and Columns
-- Sections: 3.1, 3.2, 3.3
-- ============================================================================

-- ============================================================================
-- 3.1 CREATE MISSING TABLES
-- ============================================================================

-- Create resume_templates table
CREATE TABLE IF NOT EXISTS "resume_templates" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "layout" TEXT NOT NULL,
  "colorScheme" TEXT NOT NULL,
  "isPremium" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "cssClasses" JSONB NOT NULL,
  "previewUrl" TEXT,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_resume_templates_category" ON "resume_templates"("category");
CREATE INDEX IF NOT EXISTS "idx_resume_templates_isPremium" ON "resume_templates"("isPremium");
CREATE INDEX IF NOT EXISTS "idx_resume_templates_isActive" ON "resume_templates"("isActive");

-- Create resume_versions table
CREATE TABLE IF NOT EXISTS "resume_versions" (
  "id" TEXT PRIMARY KEY,
  "baseResumeId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "changeType" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "formatting" JSONB NOT NULL,
  "metadata" JSONB NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("baseResumeId") REFERENCES "base_resumes"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
  UNIQUE ("baseResumeId", "versionNumber")
);

CREATE INDEX IF NOT EXISTS "idx_resume_versions_baseResumeId" ON "resume_versions"("baseResumeId");
CREATE INDEX IF NOT EXISTS "idx_resume_versions_userId" ON "resume_versions"("userId");
CREATE INDEX IF NOT EXISTS "idx_resume_versions_createdAt" ON "resume_versions"("createdAt" DESC);

-- Create resume_share_links table
CREATE TABLE IF NOT EXISTS "resume_share_links" (
  "id" TEXT PRIMARY KEY,
  "baseResumeId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("baseResumeId") REFERENCES "base_resumes"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_resume_share_links_token" ON "resume_share_links"("token");
CREATE INDEX IF NOT EXISTS "idx_resume_share_links_baseResumeId" ON "resume_share_links"("baseResumeId");
CREATE INDEX IF NOT EXISTS "idx_resume_share_links_userId" ON "resume_share_links"("userId");
CREATE INDEX IF NOT EXISTS "idx_resume_share_links_expiresAt" ON "resume_share_links"("expiresAt");

-- Create resume_analytics table
CREATE TABLE IF NOT EXISTS "resume_analytics" (
  "id" TEXT PRIMARY KEY,
  "baseResumeId" TEXT NOT NULL UNIQUE,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "exportCount" INTEGER NOT NULL DEFAULT 0,
  "tailorCount" INTEGER NOT NULL DEFAULT 0,
  "shareCount" INTEGER NOT NULL DEFAULT 0,
  "lastViewedAt" TIMESTAMP,
  "lastExportedAt" TIMESTAMP,
  "lastTailoredAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("baseResumeId") REFERENCES "base_resumes"("id") ON DELETE CASCADE
);

-- ============================================================================
-- 3.2 ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add columns to base_resumes table
ALTER TABLE "base_resumes" 
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP;

-- ============================================================================
-- 3.3 ADD MISSING INDEXES
-- ============================================================================

-- Indexes for base_resumes
CREATE INDEX IF NOT EXISTS "idx_base_resume_deletedAt" ON "base_resumes"("deletedAt");
CREATE INDEX IF NOT EXISTS "idx_base_resume_archivedAt" ON "base_resumes"("archivedAt");
CREATE INDEX IF NOT EXISTS "idx_base_resume_tags" ON "base_resumes" USING GIN("tags");
CREATE INDEX IF NOT EXISTS "idx_base_resume_name" ON "base_resumes"("name");

-- Index for working_drafts
CREATE INDEX IF NOT EXISTS "idx_working_draft_updatedAt" ON "working_drafts"("updatedAt" DESC);

-- Composite index for tailored_versions
CREATE INDEX IF NOT EXISTS "idx_tailored_version_userId_createdAt" ON "tailored_versions"("userId", "createdAt" DESC);

-- Index for ai_request_logs
CREATE INDEX IF NOT EXISTS "idx_ai_request_log_createdAt" ON "ai_request_logs"("createdAt" DESC);

-- Index for resume_caches
CREATE INDEX IF NOT EXISTS "idx_resume_cache_lastUsedAt" ON "resume_caches"("lastUsedAt" DESC);

-- ============================================================================
-- DATA MIGRATION (if needed)
-- ============================================================================

-- Initialize analytics for existing resumes
INSERT INTO "resume_analytics" ("id", "baseResumeId", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  "id",
  NOW(),
  NOW()
FROM "base_resumes"
WHERE "id" NOT IN (SELECT "baseResumeId" FROM "resume_analytics")
ON CONFLICT ("baseResumeId") DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE "resume_templates" IS 'Stores resume template definitions';
COMMENT ON TABLE "resume_versions" IS 'Stores version history for manual edits';
COMMENT ON TABLE "resume_share_links" IS 'Stores public share links for resumes';
COMMENT ON TABLE "resume_analytics" IS 'Tracks usage statistics for resumes';

COMMENT ON COLUMN "base_resumes"."deletedAt" IS 'Soft delete timestamp';
COMMENT ON COLUMN "base_resumes"."version" IS 'Optimistic locking version number';
COMMENT ON COLUMN "base_resumes"."tags" IS 'User-defined tags for filtering';
COMMENT ON COLUMN "base_resumes"."archivedAt" IS 'Archive timestamp';

