-- ============================================================================
-- MIGRATION: Add Database Constraints
-- Section: 3.4
-- ============================================================================

-- ============================================================================
-- CRITICAL (P0) - MUST HAVE
-- ============================================================================

-- Add CHECK constraint on slotNumber (1-5 range)
ALTER TABLE "base_resumes"
DROP CONSTRAINT IF EXISTS "slot_number_range";

ALTER TABLE "base_resumes"
ADD CONSTRAINT "slot_number_range"
CHECK ("slotNumber" >= 1 AND "slotNumber" <= 5);

COMMENT ON CONSTRAINT "slot_number_range" ON "base_resumes" 
IS 'Ensures slot number is between 1 and 5';

-- Add CHECK constraint on name length (max 100 characters)
ALTER TABLE "base_resumes"
DROP CONSTRAINT IF EXISTS "name_length";

ALTER TABLE "base_resumes"
ADD CONSTRAINT "name_length"
CHECK (char_length("name") <= 100);

COMMENT ON CONSTRAINT "name_length" ON "base_resumes" 
IS 'Ensures resume name is not longer than 100 characters';

-- ============================================================================
-- HIGH PRIORITY (P1) - SHOULD HAVE
-- ============================================================================

-- Add UNIQUE constraint on userId + name (prevent duplicate names per user)
-- Note: This allows same name across different users
CREATE UNIQUE INDEX IF NOT EXISTS "unique_user_resume_name" 
ON "base_resumes"("userId", "name")
WHERE "deletedAt" IS NULL; -- Only enforce for non-deleted resumes

COMMENT ON INDEX "unique_user_resume_name" 
IS 'Prevents duplicate resume names for the same user (excluding soft-deleted)';

-- Add foreign key constraint on template ID (once templates are in database)
-- Uncomment when ready to enforce:
-- ALTER TABLE "base_resumes"
-- ADD CONSTRAINT "fk_template_id"
-- FOREIGN KEY ("templateId") 
-- REFERENCES "resume_templates"("id")
-- ON DELETE SET NULL;

-- For now, add a comment to the column
COMMENT ON COLUMN "base_resumes"."templateId" 
IS 'Template ID - will be foreign key to resume_templates table';

-- ============================================================================
-- ADDITIONAL CONSTRAINTS FOR DATA INTEGRITY
-- ============================================================================

-- Ensure isActive is not null
ALTER TABLE "base_resumes"
ALTER COLUMN "isActive" SET NOT NULL;

-- Ensure createdAt is not null
ALTER TABLE "base_resumes"
ALTER COLUMN "createdAt" SET NOT NULL;

-- Ensure updatedAt is not null
ALTER TABLE "base_resumes"
ALTER COLUMN "updatedAt" SET NOT NULL;

-- Add CHECK constraint: archivedAt must be after createdAt
ALTER TABLE "base_resumes"
DROP CONSTRAINT IF EXISTS "archived_after_created";

ALTER TABLE "base_resumes"
ADD CONSTRAINT "archived_after_created"
CHECK ("archivedAt" IS NULL OR "archivedAt" >= "createdAt");

-- Add CHECK constraint: deletedAt must be after createdAt
ALTER TABLE "base_resumes"
DROP CONSTRAINT IF EXISTS "deleted_after_created";

ALTER TABLE "base_resumes"
ADD CONSTRAINT "deleted_after_created"
CHECK ("deletedAt" IS NULL OR "deletedAt" >= "createdAt");

-- Add CHECK constraint: version must be positive
ALTER TABLE "base_resumes"
DROP CONSTRAINT IF EXISTS "version_positive";

ALTER TABLE "base_resumes"
ADD CONSTRAINT "version_positive"
CHECK ("version" > 0);

-- ============================================================================
-- CONSTRAINTS FOR OTHER TABLES
-- ============================================================================

-- ResumeVersion constraints
ALTER TABLE "resume_versions"
DROP CONSTRAINT IF EXISTS "version_number_positive";

ALTER TABLE "resume_versions"
ADD CONSTRAINT "version_number_positive"
CHECK ("versionNumber" > 0);

-- ResumeShareLink constraints
ALTER TABLE "resume_share_links"
DROP CONSTRAINT IF EXISTS "view_count_non_negative";

ALTER TABLE "resume_share_links"
ADD CONSTRAINT "view_count_non_negative"
CHECK ("viewCount" >= 0);

-- ResumeAnalytics constraints
ALTER TABLE "resume_analytics"
DROP CONSTRAINT IF EXISTS "counts_non_negative";

ALTER TABLE "resume_analytics"
ADD CONSTRAINT "counts_non_negative"
CHECK (
  "viewCount" >= 0 AND
  "exportCount" >= 0 AND
  "tailorCount" >= 0 AND
  "shareCount" >= 0
);

-- ResumeTemplate constraints
ALTER TABLE "resume_templates"
DROP CONSTRAINT IF EXISTS "rating_range";

ALTER TABLE "resume_templates"
ADD CONSTRAINT "rating_range"
CHECK ("rating" >= 0 AND "rating" <= 5);

ALTER TABLE "resume_templates"
DROP CONSTRAINT IF EXISTS "usage_count_non_negative";

ALTER TABLE "resume_templates"
ADD CONSTRAINT "usage_count_non_negative"
CHECK ("usageCount" >= 0);

-- ============================================================================
-- VALIDATION QUERIES
-- ============================================================================

-- Test slot number constraint (should fail)
-- INSERT INTO "base_resumes" ("slotNumber", ...) VALUES (6, ...); -- FAIL

-- Test name length constraint (should fail)
-- UPDATE "base_resumes" SET "name" = repeat('a', 101) WHERE id = '...'; -- FAIL

-- Test unique name constraint (should fail for duplicate)
-- INSERT INTO "base_resumes" ("userId", "name", ...) 
-- VALUES ('user1', 'My Resume', ...); -- FAIL if already exists

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- To remove constraints:
-- ALTER TABLE "base_resumes" DROP CONSTRAINT IF EXISTS "slot_number_range";
-- ALTER TABLE "base_resumes" DROP CONSTRAINT IF EXISTS "name_length";
-- DROP INDEX IF EXISTS "unique_user_resume_name";

