-- Migration: Add Missing Tables for Resume Builder
-- Date: 2025-11-15
-- Description: Creates ResumeTemplate, ResumeShareLink, ResumeAnalytics, and GeneratedDocument tables

-- 1. Resume Templates Table
CREATE TABLE IF NOT EXISTS "resume_templates" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "is_premium" BOOLEAN NOT NULL DEFAULT false,
  "color_scheme" TEXT NOT NULL DEFAULT 'blue',
  "preview" TEXT,
  "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for template queries
CREATE INDEX IF NOT EXISTS "idx_resume_templates_category" ON "resume_templates"("category");
CREATE INDEX IF NOT EXISTS "idx_resume_templates_is_premium" ON "resume_templates"("is_premium");

-- 2. Resume Share Links Table
CREATE TABLE IF NOT EXISTS "resume_share_links" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "base_resume_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "expires_at" TIMESTAMP(3),
  "password_hash" TEXT,
  "allow_download" BOOLEAN NOT NULL DEFAULT true,
  "view_count" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "last_accessed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_resume_share_links_base_resume" 
    FOREIGN KEY ("base_resume_id") 
    REFERENCES "base_resumes"("id") 
    ON DELETE CASCADE,
    
  CONSTRAINT "fk_resume_share_links_user" 
    FOREIGN KEY ("user_id") 
    REFERENCES "users"("id") 
    ON DELETE CASCADE
);

-- Indexes for share link queries
CREATE INDEX IF NOT EXISTS "idx_resume_share_links_token" ON "resume_share_links"("token");
CREATE INDEX IF NOT EXISTS "idx_resume_share_links_base_resume_id" ON "resume_share_links"("base_resume_id");
CREATE INDEX IF NOT EXISTS "idx_resume_share_links_user_id" ON "resume_share_links"("user_id");
CREATE INDEX IF NOT EXISTS "idx_resume_share_links_expires_at" ON "resume_share_links"("expires_at");

-- 3. Resume Analytics Table
CREATE TABLE IF NOT EXISTS "resume_analytics" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "resume_id" TEXT NOT NULL UNIQUE,
  "view_count" INTEGER NOT NULL DEFAULT 0,
  "export_count" INTEGER NOT NULL DEFAULT 0,
  "tailor_count" INTEGER NOT NULL DEFAULT 0,
  "share_count" INTEGER NOT NULL DEFAULT 0,
  "last_viewed_at" TIMESTAMP(3),
  "last_exported_at" TIMESTAMP(3),
  "last_shared_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_resume_analytics_resume" 
    FOREIGN KEY ("resume_id") 
    REFERENCES "base_resumes"("id") 
    ON DELETE CASCADE
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS "idx_resume_analytics_resume_id" ON "resume_analytics"("resume_id");

-- 4. Generated Documents Table (for exports)
CREATE TABLE IF NOT EXISTS "generated_documents" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "base_resume_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "template_id" TEXT,
  "data" JSONB NOT NULL DEFAULT '{}',
  "storage_path" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_generated_documents_user" 
    FOREIGN KEY ("user_id") 
    REFERENCES "users"("id") 
    ON DELETE CASCADE,
    
  CONSTRAINT "fk_generated_documents_base_resume" 
    FOREIGN KEY ("base_resume_id") 
    REFERENCES "base_resumes"("id") 
    ON DELETE CASCADE
);

-- Indexes for generated documents
CREATE INDEX IF NOT EXISTS "idx_generated_documents_user_id" ON "generated_documents"("user_id");
CREATE INDEX IF NOT EXISTS "idx_generated_documents_base_resume_id" ON "generated_documents"("base_resume_id");
CREATE INDEX IF NOT EXISTS "idx_generated_documents_type" ON "generated_documents"("type");

-- Insert default templates
INSERT INTO "resume_templates" ("id", "name", "category", "description", "is_premium", "color_scheme", "preview", "features", "tags")
VALUES
  ('modern-professional', 'Modern Professional', 'professional', 'Clean and modern design perfect for tech and corporate roles', false, 'blue', '/templates/modern-professional.png', ARRAY['ATS-friendly', 'Single column', 'Bold headers'], ARRAY['modern', 'professional', 'ats']),
  ('classic-elegant', 'Classic Elegant', 'traditional', 'Timeless design suitable for traditional industries', false, 'black', '/templates/classic-elegant.png', ARRAY['Traditional layout', 'Serif fonts', 'Conservative'], ARRAY['classic', 'elegant', 'traditional']),
  ('minimalist-clean', 'Minimalist Clean', 'minimalist', 'Less is more with this ultra-clean design', false, 'gray', '/templates/minimalist-clean.png', ARRAY['Minimal design', 'Lots of whitespace', 'Easy to read'], ARRAY['minimalist', 'clean', 'simple']),
  ('tech-modern', 'Tech Modern', 'tech', 'Perfect for software engineers and tech professionals', false, 'teal', '/templates/tech-modern.png', ARRAY['Tech-focused', 'Modern', 'Code-friendly'], ARRAY['tech', 'software', 'engineering']),
  ('ats-optimized', 'ATS Optimized', 'ats', 'Maximum ATS compatibility with proven format', false, 'blue', '/templates/ats-optimized.png', ARRAY['ATS-optimized', 'Simple format', 'High pass rate'], ARRAY['ats', 'optimized', 'simple'])
ON CONFLICT (id) DO NOTHING;

-- Add comments
COMMENT ON TABLE "resume_templates" IS 'Resume templates available for users';
COMMENT ON TABLE "resume_share_links" IS 'Shareable links for resumes';
COMMENT ON TABLE "resume_analytics" IS 'Analytics tracking for resumes';
COMMENT ON TABLE "generated_documents" IS 'Exported resume documents';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed: Added ResumeTemplate, ResumeShareLink, ResumeAnalytics, and GeneratedDocument tables';
END $$;

