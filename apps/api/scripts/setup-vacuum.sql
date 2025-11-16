-- ============================================================================
-- AUTOMATED VACUUM CONFIGURATION FOR POSTGRESQL
-- Section: 3.6 Database Performance
-- ============================================================================

-- This script sets up automated VACUUM and ANALYZE operations to maintain
-- database performance and prevent table bloat.

-- ============================================================================
-- UNDERSTANDING VACUUM
-- ============================================================================

-- VACUUM: Reclaims storage occupied by dead tuples
-- ANALYZE: Updates statistics for query planner
-- VACUUM ANALYZE: Does both operations

-- Dead tuples are created by:
-- - UPDATE operations (old version remains until vacuumed)
-- - DELETE operations (row marked as deleted but not removed)
-- - Failed transactions

-- ============================================================================
-- AUTOVACUUM CONFIGURATION (Recommended)
-- ============================================================================

-- Check current autovacuum settings
SELECT name, setting, unit, context
FROM pg_settings
WHERE name LIKE '%autovacuum%'
ORDER BY name;

-- Recommended autovacuum settings for production
-- Add to postgresql.conf or set via ALTER SYSTEM

-- Enable autovacuum (should be enabled by default)
ALTER SYSTEM SET autovacuum = on;

-- Autovacuum naptime (time between autovacuum runs)
-- Default: 1min, Recommended: 30s for busy databases
ALTER SYSTEM SET autovacuum_naptime = '30s';

-- Vacuum threshold (minimum number of updated/deleted tuples before vacuum)
-- Default: 50
ALTER SYSTEM SET autovacuum_vacuum_threshold = 50;

-- Vacuum scale factor (fraction of table size to add to threshold)
-- Default: 0.2 (20%), Recommended: 0.1 (10%) for large tables
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.1;

-- Analyze threshold
ALTER SYSTEM SET autovacuum_analyze_threshold = 50;

-- Analyze scale factor
ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.05;

-- Maximum autovacuum workers
-- Default: 3, Recommended: 4-6 for busy databases
ALTER SYSTEM SET autovacuum_max_workers = 4;

-- Vacuum cost delay (throttling to avoid I/O spikes)
-- Default: 2ms, Recommended: 0-2ms
ALTER SYSTEM SET autovacuum_vacuum_cost_delay = '2ms';

-- Apply changes (requires reload, not restart)
SELECT pg_reload_conf();

-- ============================================================================
-- PER-TABLE AUTOVACUUM SETTINGS
-- ============================================================================

-- Configure aggressive autovacuum for high-traffic tables

-- BaseResume table (frequently updated)
ALTER TABLE "base_resumes" SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02,
  autovacuum_vacuum_threshold = 100,
  autovacuum_analyze_threshold = 100
);

-- WorkingDraft table (very frequently updated)
ALTER TABLE "working_drafts" SET (
  autovacuum_vacuum_scale_factor = 0.01,
  autovacuum_analyze_scale_factor = 0.01,
  autovacuum_vacuum_threshold = 50,
  autovacuum_analyze_threshold = 50
);

-- AIRequestLog table (append-only, less aggressive)
ALTER TABLE "ai_request_logs" SET (
  autovacuum_vacuum_scale_factor = 0.2,
  autovacuum_analyze_scale_factor = 0.1
);

-- ResumeCache table (frequently updated)
ALTER TABLE "resume_caches" SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02
);

-- ============================================================================
-- MANUAL VACUUM SCHEDULE (Backup to autovacuum)
-- ============================================================================

-- Weekly full VACUUM ANALYZE (run during low-traffic hours)
-- This is a backup to autovacuum, not a replacement

-- Function to perform weekly vacuum
CREATE OR REPLACE FUNCTION weekly_vacuum_analyze()
RETURNS void AS $$
BEGIN
    -- Vacuum all tables
    VACUUM ANALYZE "users";
    VACUUM ANALYZE "base_resumes";
    VACUUM ANALYZE "working_drafts";
    VACUUM ANALYZE "tailored_versions";
    VACUUM ANALYZE "ai_request_logs";
    VACUUM ANALYZE "resume_caches";
    VACUUM ANALYZE "storage_files";
    VACUUM ANALYZE "resume_templates";
    VACUUM ANALYZE "resume_versions";
    VACUUM ANALYZE "resume_share_links";
    VACUUM ANALYZE "resume_analytics";
    
    RAISE NOTICE 'Weekly VACUUM ANALYZE completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VACUUM FULL (Use with caution!)
-- ============================================================================

-- VACUUM FULL reclaims ALL dead space but requires exclusive lock
-- Only use during maintenance windows

-- Function for VACUUM FULL (monthly maintenance)
CREATE OR REPLACE FUNCTION monthly_vacuum_full()
RETURNS void AS $$
BEGIN
    -- VACUUM FULL on tables with high churn
    VACUUM FULL ANALYZE "working_drafts";
    VACUUM FULL ANALYZE "resume_caches";
    
    RAISE NOTICE 'Monthly VACUUM FULL completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MONITORING VACUUM OPERATIONS
-- ============================================================================

-- View current autovacuum activity
CREATE OR REPLACE VIEW autovacuum_activity AS
SELECT
    schemaname,
    relname,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze,
    vacuum_count,
    autovacuum_count,
    analyze_count,
    autoanalyze_count,
    n_tup_ins AS inserts,
    n_tup_upd AS updates,
    n_tup_del AS deletes,
    n_live_tup AS live_tuples,
    n_dead_tup AS dead_tuples,
    ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_tuple_percent
FROM pg_stat_user_tables
ORDER BY dead_tuple_percent DESC NULLS LAST;

-- Check table bloat
CREATE OR REPLACE VIEW table_bloat AS
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size,
    n_live_tup AS live_tuples,
    n_dead_tup AS dead_tuples,
    ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS bloat_percent
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- View autovacuum configuration per table
CREATE OR REPLACE VIEW autovacuum_config AS
SELECT
    schemaname,
    relname,
    reloptions
FROM pg_class
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
WHERE nspname NOT IN ('pg_catalog', 'information_schema')
  AND relkind = 'r'
  AND reloptions IS NOT NULL
ORDER BY schemaname, relname;

-- ============================================================================
-- CRON JOBS (using pg_cron extension)
-- ============================================================================

-- Install pg_cron extension (if not already installed)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule weekly VACUUM ANALYZE (Sundays at 2 AM)
-- SELECT cron.schedule('weekly-vacuum', '0 2 * * 0', 'SELECT weekly_vacuum_analyze()');

-- Schedule monthly VACUUM FULL (1st of month at 3 AM)
-- SELECT cron.schedule('monthly-vacuum-full', '0 3 1 * *', 'SELECT monthly_vacuum_full()');

-- ============================================================================
-- MONITORING QUERIES
-- ============================================================================

-- Check when tables were last vacuumed
SELECT
    schemaname,
    relname,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
ORDER BY last_autovacuum DESC NULLS LAST;

-- Check tables that need vacuuming
SELECT
    schemaname,
    relname,
    n_dead_tup AS dead_tuples,
    n_live_tup AS live_tuples,
    ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS bloat_percent,
    last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
  AND ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) > 10
ORDER BY dead_tuples DESC;

-- Check autovacuum progress
SELECT
    pid,
    datname,
    usename,
    state,
    query,
    query_start,
    NOW() - query_start AS duration
FROM pg_stat_activity
WHERE query LIKE '%autovacuum%'
  AND query NOT LIKE '%pg_stat_activity%';

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- If autovacuum is not running, check:

-- 1. Is autovacuum enabled?
SHOW autovacuum;

-- 2. Are there long-running transactions blocking vacuum?
SELECT
    pid,
    usename,
    state,
    query_start,
    NOW() - query_start AS duration,
    query
FROM pg_stat_activity
WHERE state != 'idle'
  AND NOW() - query_start > INTERVAL '1 hour'
ORDER BY duration DESC;

-- 3. Kill long-running transactions (if safe)
-- SELECT pg_terminate_backend(pid) WHERE pid = <pid>;

-- 4. Check for table locks
SELECT
    locktype,
    relation::regclass,
    mode,
    granted,
    pid
FROM pg_locks
WHERE NOT granted
ORDER BY relation;

-- ============================================================================
-- CLEANUP
-- ============================================================================

-- To remove custom autovacuum settings from a table:
-- ALTER TABLE "table_name" RESET (autovacuum_vacuum_scale_factor);

-- To disable autovacuum for a specific table (NOT RECOMMENDED):
-- ALTER TABLE "table_name" SET (autovacuum_enabled = false);

