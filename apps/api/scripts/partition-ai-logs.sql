-- ============================================================================
-- PARTITION AI REQUEST LOG TABLE BY DATE
-- Section: 3.6 Database Performance
-- ============================================================================

-- This script sets up monthly partitioning for the ai_request_logs table
-- to improve query performance and enable efficient data archival.

-- ============================================================================
-- STEP 1: CREATE PARTITIONED TABLE
-- ============================================================================

-- Rename existing table
ALTER TABLE "ai_request_logs" RENAME TO "ai_request_logs_old";

-- Create new partitioned table
CREATE TABLE "ai_request_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "baseResumeId" TEXT,
    "tailoredVersionId" TEXT,
    "operation" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "costUsd" DOUBLE PRECISION NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "ai_request_logs_pkey" PRIMARY KEY ("id", "createdAt")
) PARTITION BY RANGE ("createdAt");

-- ============================================================================
-- STEP 2: CREATE MONTHLY PARTITIONS
-- ============================================================================

-- Create partitions for past 12 months and next 3 months
-- Adjust dates based on your current date

-- 2024 Partitions
CREATE TABLE "ai_request_logs_2024_01" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE "ai_request_logs_2024_02" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

CREATE TABLE "ai_request_logs_2024_03" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

CREATE TABLE "ai_request_logs_2024_04" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');

CREATE TABLE "ai_request_logs_2024_05" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');

CREATE TABLE "ai_request_logs_2024_06" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');

CREATE TABLE "ai_request_logs_2024_07" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');

CREATE TABLE "ai_request_logs_2024_08" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');

CREATE TABLE "ai_request_logs_2024_09" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');

CREATE TABLE "ai_request_logs_2024_10" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

CREATE TABLE "ai_request_logs_2024_11" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

CREATE TABLE "ai_request_logs_2024_12" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- 2025 Partitions
CREATE TABLE "ai_request_logs_2025_01" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE "ai_request_logs_2025_02" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE "ai_request_logs_2025_03" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

CREATE TABLE "ai_request_logs_2025_04" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');

CREATE TABLE "ai_request_logs_2025_05" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');

CREATE TABLE "ai_request_logs_2025_06" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

CREATE TABLE "ai_request_logs_2025_07" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

CREATE TABLE "ai_request_logs_2025_08" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

CREATE TABLE "ai_request_logs_2025_09" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE "ai_request_logs_2025_10" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE "ai_request_logs_2025_11" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE "ai_request_logs_2025_12" PARTITION OF "ai_request_logs"
FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- ============================================================================
-- STEP 3: MIGRATE DATA FROM OLD TABLE
-- ============================================================================

INSERT INTO "ai_request_logs"
SELECT * FROM "ai_request_logs_old";

-- ============================================================================
-- STEP 4: RECREATE INDEXES ON PARTITIONED TABLE
-- ============================================================================

-- Index on userId
CREATE INDEX "idx_ai_logs_userId" ON "ai_request_logs"("userId");

-- Index on createdAt (for range queries)
CREATE INDEX "idx_ai_logs_createdAt" ON "ai_request_logs"("createdAt");

-- Composite index on userId + createdAt
CREATE INDEX "idx_ai_logs_userId_createdAt" ON "ai_request_logs"("userId", "createdAt");

-- Index on operation
CREATE INDEX "idx_ai_logs_operation" ON "ai_request_logs"("operation");

-- Index on success (for error tracking)
CREATE INDEX "idx_ai_logs_success" ON "ai_request_logs"("success");

-- ============================================================================
-- STEP 5: RECREATE FOREIGN KEY CONSTRAINTS
-- ============================================================================

ALTER TABLE "ai_request_logs"
ADD CONSTRAINT "fk_ai_logs_user"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "ai_request_logs"
ADD CONSTRAINT "fk_ai_logs_base_resume"
FOREIGN KEY ("baseResumeId") REFERENCES "base_resumes"("id") ON DELETE SET NULL;

ALTER TABLE "ai_request_logs"
ADD CONSTRAINT "fk_ai_logs_tailored_version"
FOREIGN KEY ("tailoredVersionId") REFERENCES "tailored_versions"("id") ON DELETE SET NULL;

-- ============================================================================
-- STEP 6: DROP OLD TABLE (AFTER VERIFICATION)
-- ============================================================================

-- IMPORTANT: Only run this after verifying data migration was successful!
-- Uncomment when ready:
-- DROP TABLE "ai_request_logs_old";

-- ============================================================================
-- MAINTENANCE: AUTOMATED PARTITION CREATION
-- ============================================================================

-- Function to create next month's partition
CREATE OR REPLACE FUNCTION create_next_partition()
RETURNS void AS $$
DECLARE
    next_month_start DATE;
    next_month_end DATE;
    partition_name TEXT;
BEGIN
    -- Calculate next month
    next_month_start := date_trunc('month', CURRENT_DATE + INTERVAL '1 month');
    next_month_end := date_trunc('month', CURRENT_DATE + INTERVAL '2 months');
    
    -- Generate partition name
    partition_name := 'ai_request_logs_' || to_char(next_month_start, 'YYYY_MM');
    
    -- Create partition
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF ai_request_logs FOR VALUES FROM (%L) TO (%L)',
        partition_name,
        next_month_start,
        next_month_end
    );
    
    RAISE NOTICE 'Created partition: %', partition_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MAINTENANCE: ARCHIVE OLD PARTITIONS
-- ============================================================================

-- Function to archive partitions older than 12 months
CREATE OR REPLACE FUNCTION archive_old_partitions()
RETURNS void AS $$
DECLARE
    partition_record RECORD;
    archive_date DATE;
BEGIN
    archive_date := date_trunc('month', CURRENT_DATE - INTERVAL '12 months');
    
    FOR partition_record IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename LIKE 'ai_request_logs_20%'
          AND tablename < 'ai_request_logs_' || to_char(archive_date, 'YYYY_MM')
    LOOP
        -- Detach partition (makes it a standalone table)
        EXECUTE format('ALTER TABLE ai_request_logs DETACH PARTITION %I', partition_record.tablename);
        
        -- Optionally: Move to archive schema or export to S3
        -- For now, just log
        RAISE NOTICE 'Archived partition: %', partition_record.tablename;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CRON JOBS (using pg_cron extension)
-- ============================================================================

-- Install pg_cron extension (if not already installed)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule partition creation (run on 1st of each month)
-- SELECT cron.schedule('create-ai-log-partition', '0 0 1 * *', 'SELECT create_next_partition()');

-- Schedule partition archival (run on 1st of each month)
-- SELECT cron.schedule('archive-ai-log-partitions', '0 1 1 * *', 'SELECT archive_old_partitions()');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check partition structure
SELECT
    parent.relname AS parent_table,
    child.relname AS partition_name,
    pg_get_expr(child.relpartbound, child.oid) AS partition_range
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child ON pg_inherits.inhrelid = child.oid
WHERE parent.relname = 'ai_request_logs'
ORDER BY child.relname;

-- Check data distribution across partitions
SELECT
    tableoid::regclass AS partition,
    COUNT(*) AS record_count,
    MIN("createdAt") AS earliest_record,
    MAX("createdAt") AS latest_record
FROM "ai_request_logs"
GROUP BY tableoid
ORDER BY partition;

-- Test query performance (should only scan relevant partition)
EXPLAIN ANALYZE
SELECT * FROM "ai_request_logs"
WHERE "createdAt" >= '2025-01-01'
  AND "createdAt" < '2025-02-01';

