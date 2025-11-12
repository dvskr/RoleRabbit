-- ============================================================
-- MIGRATION: Add Vector Embeddings Support
-- ============================================================
-- This migration adds vector embedding capabilities to the database
-- for semantic ATS scoring and resume matching
--
-- Changes:
-- 1. Add embedding columns to BaseResume table
-- 2. Create job_embeddings table for caching job embeddings
-- 3. Create vector indexes for fast similarity search
-- ============================================================

-- Step 1: Add embedding column to BaseResume table
-- This stores the vector representation of the entire resume content
ALTER TABLE "base_resumes" 
ADD COLUMN IF NOT EXISTS "embedding" vector(1536),
ADD COLUMN IF NOT EXISTS "embedding_updated_at" TIMESTAMP;

-- Add comment to explain the column
COMMENT ON COLUMN "base_resumes"."embedding" IS 'OpenAI text-embedding-3-small vector (1536 dimensions) for semantic similarity search';
COMMENT ON COLUMN "base_resumes"."embedding_updated_at" IS 'Timestamp of when the embedding was last generated or updated';

-- Step 2: Create job_embeddings table for caching
-- This caches job description embeddings to avoid re-generating them
CREATE TABLE IF NOT EXISTS "job_embeddings" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "job_hash" TEXT NOT NULL UNIQUE,
  "job_description" TEXT NOT NULL,
  "embedding" vector(1536) NOT NULL,
  "metadata" JSONB DEFAULT '{}',
  "hit_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "last_used_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "expires_at" TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Add comments to job_embeddings table
COMMENT ON TABLE "job_embeddings" IS 'Cache table for job description embeddings to improve performance and reduce API costs';
COMMENT ON COLUMN "job_embeddings"."job_hash" IS 'SHA-256 hash of normalized job description for cache key';
COMMENT ON COLUMN "job_embeddings"."embedding" IS 'OpenAI text-embedding-3-small vector (1536 dimensions)';
COMMENT ON COLUMN "job_embeddings"."metadata" IS 'Additional metadata (extracted skills, keywords, etc.)';
COMMENT ON COLUMN "job_embeddings"."hit_count" IS 'Number of times this cache entry was used';
COMMENT ON COLUMN "job_embeddings"."expires_at" IS 'Cache expiration (24 hours from creation)';

-- Step 3: Create indexes on job_embeddings for performance
CREATE INDEX IF NOT EXISTS "idx_job_embeddings_job_hash" ON "job_embeddings"("job_hash");
CREATE INDEX IF NOT EXISTS "idx_job_embeddings_expires_at" ON "job_embeddings"("expires_at");
CREATE INDEX IF NOT EXISTS "idx_job_embeddings_created_at" ON "job_embeddings"("created_at");

-- Step 4: Create vector similarity indexes
-- IVFFlat index for approximate nearest neighbor search (faster, slightly less accurate)
-- We'll create this after data migration when we have embeddings to train on
-- For now, we'll use sequential scan which is fine for small datasets

-- Note: IVFFlat index creation command (to be run after data migration):
-- CREATE INDEX IF NOT EXISTS "idx_base_resumes_embedding_ivfflat" 
-- ON "base_resumes" USING ivfflat (embedding vector_cosine_ops) 
-- WITH (lists = 100);

-- Note: HNSW index for exact search (to be added in production if needed):
-- CREATE INDEX IF NOT EXISTS "idx_base_resumes_embedding_hnsw" 
-- ON "base_resumes" USING hnsw (embedding vector_cosine_ops);

-- Step 5: Create index on base_resumes for embedding_updated_at
CREATE INDEX IF NOT EXISTS "idx_base_resumes_embedding_updated" ON "base_resumes"("embedding_updated_at");
CREATE INDEX IF NOT EXISTS "idx_base_resumes_has_embedding" ON "base_resumes"("userId") WHERE "embedding" IS NOT NULL;

-- Step 6: Create a function to automatically update embedding_updated_at
CREATE OR REPLACE FUNCTION update_embedding_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.embedding IS DISTINCT FROM OLD.embedding THEN
    NEW.embedding_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to automatically update timestamp when embedding changes
DROP TRIGGER IF EXISTS trigger_update_embedding_timestamp ON "base_resumes";
CREATE TRIGGER trigger_update_embedding_timestamp
  BEFORE UPDATE ON "base_resumes"
  FOR EACH ROW
  EXECUTE FUNCTION update_embedding_timestamp();

-- Step 8: Create a function to clean up expired job embeddings
CREATE OR REPLACE FUNCTION cleanup_expired_job_embeddings()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM "job_embeddings" WHERE "expires_at" < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Add helper function for cosine similarity calculation
-- This is mainly for debugging/testing purposes
CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector)
RETURNS FLOAT AS $$
BEGIN
  RETURN 1 - (a <=> b);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION cosine_similarity IS 'Calculate cosine similarity (0-1 scale, 1 = identical) between two vectors';

-- Step 10: Create view for monitoring embedding coverage
CREATE OR REPLACE VIEW "embedding_coverage_stats" AS
SELECT 
  COUNT(*) AS total_resumes,
  COUNT(embedding) AS resumes_with_embeddings,
  COUNT(*) - COUNT(embedding) AS resumes_without_embeddings,
  ROUND(100.0 * COUNT(embedding) / NULLIF(COUNT(*), 0), 2) AS coverage_percentage,
  MAX(embedding_updated_at) AS last_embedding_generated,
  MIN(embedding_updated_at) AS first_embedding_generated
FROM "base_resumes";

COMMENT ON VIEW "embedding_coverage_stats" IS 'Monitor how many resumes have embeddings generated';

-- Step 11: Create view for monitoring job embedding cache stats
CREATE OR REPLACE VIEW "job_embedding_cache_stats" AS
SELECT 
  COUNT(*) AS total_cached_jobs,
  SUM(hit_count) AS total_cache_hits,
  ROUND(AVG(hit_count), 2) AS avg_hits_per_job,
  COUNT(*) FILTER (WHERE expires_at < NOW()) AS expired_entries,
  COUNT(*) FILTER (WHERE expires_at >= NOW()) AS active_entries,
  MAX(last_used_at) AS most_recent_use,
  MIN(created_at) AS oldest_entry
FROM "job_embeddings";

COMMENT ON VIEW "job_embedding_cache_stats" IS 'Monitor job embedding cache performance and usage';

-- Migration complete!
-- Summary of changes:
-- ✅ Added embedding columns to base_resumes
-- ✅ Created job_embeddings cache table
-- ✅ Created indexes for performance
-- ✅ Created automatic timestamp trigger
-- ✅ Created cleanup function for expired cache
-- ✅ Created monitoring views

