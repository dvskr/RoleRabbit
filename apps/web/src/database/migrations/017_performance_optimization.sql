-- ============================================================================
-- Migration: 017_performance_optimization
-- Section 3.12: Performance & Optimization (DB-065 to DB-070)
-- ============================================================================
-- Description: Add materialized views, indexes, and query optimizations
-- Run in: Supabase SQL Editor (run AFTER migration 016)
-- ============================================================================

-- ============================================================================
-- DB-065: Materialized view for portfolio analytics summary
-- ============================================================================

CREATE MATERIALIZED VIEW portfolio_analytics_monthly AS
SELECT
  portfolio_id,
  DATE_TRUNC('month', date) AS month,
  SUM(views) AS total_views,
  SUM(unique_visitors) AS total_unique_visitors,
  AVG(avg_time_on_page) AS avg_time_on_page,
  AVG(bounce_rate) AS avg_bounce_rate,
  -- Merge all referrers
  jsonb_object_agg(
    ref.key,
    COALESCE(SUM((ref.value)::int), 0)
  ) FILTER (WHERE ref.key IS NOT NULL) AS top_referrers,
  -- Merge all countries
  jsonb_object_agg(
    country.key,
    COALESCE(SUM((country.value)::int), 0)
  ) FILTER (WHERE country.key IS NOT NULL) AS top_countries,
  -- Merge all devices
  jsonb_object_agg(
    device.key,
    COALESCE(SUM((device.value)::int), 0)
  ) FILTER (WHERE device.key IS NOT NULL) AS top_devices,
  COUNT(*) AS days_count,
  MIN(date) AS first_date,
  MAX(date) AS last_date
FROM portfolio_analytics
LEFT JOIN LATERAL jsonb_each(referrers) AS ref ON true
LEFT JOIN LATERAL jsonb_each(countries) AS country ON true
LEFT JOIN LATERAL jsonb_each(devices) AS device ON true
GROUP BY portfolio_id, DATE_TRUNC('month', date);

-- Create indexes on materialized view
CREATE INDEX idx_analytics_monthly_portfolio ON portfolio_analytics_monthly(portfolio_id, month DESC);
CREATE INDEX idx_analytics_monthly_month ON portfolio_analytics_monthly(month DESC);

COMMENT ON MATERIALIZED VIEW portfolio_analytics_monthly IS 'Monthly aggregated analytics for faster queries';

-- Create yearly materialized view
CREATE MATERIALIZED VIEW portfolio_analytics_yearly AS
SELECT
  portfolio_id,
  DATE_TRUNC('year', date) AS year,
  SUM(views) AS total_views,
  SUM(unique_visitors) AS total_unique_visitors,
  AVG(avg_time_on_page) AS avg_time_on_page,
  AVG(bounce_rate) AS avg_bounce_rate,
  COUNT(*) AS days_count
FROM portfolio_analytics
GROUP BY portfolio_id, DATE_TRUNC('year', date);

CREATE INDEX idx_analytics_yearly_portfolio ON portfolio_analytics_yearly(portfolio_id, year DESC);

COMMENT ON MATERIALIZED VIEW portfolio_analytics_yearly IS 'Yearly aggregated analytics for faster queries';

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY portfolio_analytics_monthly;
  REFRESH MATERIALIZED VIEW CONCURRENTLY portfolio_analytics_yearly;
  RAISE NOTICE 'Refreshed analytics materialized views';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_analytics_views() IS 'Refresh all analytics materialized views';

-- ============================================================================
-- DB-066: Indexes on JSONB columns for frequently queried paths
-- ============================================================================

-- Index for searching by hero section data
CREATE INDEX idx_portfolios_data_hero ON portfolios
  USING GIN ((data->'hero'))
  WHERE data ? 'hero' AND deleted_at IS NULL;

-- Index for searching by about section
CREATE INDEX idx_portfolios_data_about ON portfolios
  USING GIN ((data->'about'))
  WHERE data ? 'about' AND deleted_at IS NULL;

-- Index for searching projects
CREATE INDEX idx_portfolios_data_projects ON portfolios
  USING GIN ((data->'projects'))
  WHERE data ? 'projects' AND deleted_at IS NULL;

-- Index for name in about section (for search)
CREATE INDEX idx_portfolios_about_name ON portfolios
  ((data->'about'->>'name'))
  WHERE data->'about'->>'name' IS NOT NULL AND deleted_at IS NULL;

-- Index for email in contact section
CREATE INDEX idx_portfolios_contact_email ON portfolios
  ((data->'contact'->>'email'))
  WHERE data->'contact'->>'email' IS NOT NULL AND deleted_at IS NULL;

COMMENT ON INDEX idx_portfolios_data_hero IS 'GIN index for hero section queries';
COMMENT ON INDEX idx_portfolios_data_about IS 'GIN index for about section queries';
COMMENT ON INDEX idx_portfolios_data_projects IS 'GIN index for projects section queries';

-- ============================================================================
-- DB-067: Query optimization analysis and missing indexes
-- ============================================================================

-- Add composite index for common filtering patterns
CREATE INDEX idx_portfolios_user_published_visibility ON portfolios(user_id, is_published, visibility)
  WHERE deleted_at IS NULL;

-- Add index for finding portfolios by slug and user (common in API)
CREATE INDEX idx_portfolios_user_slug ON portfolios(user_id, slug)
  WHERE deleted_at IS NULL;

-- Add index for build status filtering
CREATE INDEX idx_portfolios_build_status ON portfolios(build_status)
  WHERE build_status IN ('PENDING', 'BUILDING') AND deleted_at IS NULL;

-- Add index for recently updated portfolios
CREATE INDEX idx_portfolios_updated_recent ON portfolios(updated_at DESC)
  WHERE deleted_at IS NULL;

-- Add index for analytics by date range (covering index)
CREATE INDEX idx_analytics_portfolio_date_views ON portfolio_analytics(portfolio_id, date DESC, views, unique_visitors);

-- Add index for share tokens lookup
CREATE INDEX idx_shares_token_active ON portfolio_shares(token)
  WHERE (expires_at IS NULL OR expires_at > NOW())
    AND (max_views IS NULL OR view_count < max_views);

-- Add partial index for active deployments
CREATE INDEX idx_deployments_active ON portfolio_deployments(portfolio_id, status, created_at DESC)
  WHERE status IN ('QUEUED', 'BUILDING', 'DEPLOYING');

COMMENT ON INDEX idx_portfolios_user_published_visibility IS 'Composite index for common filtering patterns';
COMMENT ON INDEX idx_analytics_portfolio_date_views IS 'Covering index for analytics queries';

-- ============================================================================
-- DB-070: Connection pooling configuration
-- ============================================================================
-- Note: Connection pooling is configured at the application/infrastructure level
-- This section documents the recommended settings

-- Recommended pgBouncer or application pool settings:
-- pool_mode = transaction
-- default_pool_size = 25
-- min_pool_size = 10
-- max_pool_size = 50
-- max_client_conn = 1000
-- reserve_pool_size = 5

COMMENT ON DATABASE postgres IS 'Recommended connection pool: min=10, max=50, mode=transaction';

-- ============================================================================
-- Query optimization helper functions
-- ============================================================================

-- Function to analyze slow queries
CREATE OR REPLACE FUNCTION analyze_slow_queries(min_duration_ms INTEGER DEFAULT 1000)
RETURNS TABLE (
  query TEXT,
  calls BIGINT,
  total_time NUMERIC,
  mean_time NUMERIC,
  max_time NUMERIC
) AS $$
BEGIN
  -- Check if pg_stat_statements extension is available
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
    RAISE NOTICE 'pg_stat_statements extension is not installed. Install it to track query performance.';
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    LEFT(s.query, 100) AS query,
    s.calls,
    ROUND(s.total_exec_time::numeric, 2) AS total_time,
    ROUND(s.mean_exec_time::numeric, 2) AS mean_time,
    ROUND(s.max_exec_time::numeric, 2) AS max_time
  FROM pg_stat_statements s
  WHERE s.mean_exec_time > min_duration_ms
  ORDER BY s.mean_exec_time DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION analyze_slow_queries(INTEGER) IS 'Analyze slow queries using pg_stat_statements';

-- Function to find missing indexes
CREATE OR REPLACE FUNCTION find_missing_indexes()
RETURNS TABLE (
  table_name TEXT,
  seq_scan BIGINT,
  idx_scan BIGINT,
  ratio NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    relname::TEXT AS table_name,
    seq_scan,
    idx_scan,
    CASE
      WHEN seq_scan = 0 THEN 0
      ELSE ROUND((seq_scan::numeric / NULLIF(seq_scan + idx_scan, 0)) * 100, 2)
    END AS ratio
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
    AND seq_scan > 0
    AND idx_scan IS NOT NULL
  ORDER BY seq_scan DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_missing_indexes() IS 'Find tables with high sequential scan ratios';

-- Function to get table sizes
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
  table_name TEXT,
  row_count BIGINT,
  total_size TEXT,
  table_size TEXT,
  indexes_size TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tablename::TEXT,
    n_live_tup AS row_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_table_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_table_sizes() IS 'Get size information for all tables';

-- ============================================================================
-- Scheduled job to refresh materialized views
-- ============================================================================
-- Schedule this to run hourly using pg_cron or application scheduler

-- Using pg_cron (if installed):
-- SELECT cron.schedule('refresh-analytics-views', '0 * * * *', 'SELECT refresh_analytics_views()');

-- ============================================================================
-- Verification and analysis queries
-- ============================================================================
-- Check index usage:
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan,
--   idx_tup_read,
--   idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;
--
-- Check table bloat:
-- SELECT
--   tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
--   n_dead_tup,
--   n_live_tup,
--   ROUND((n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0)) * 100, 2) AS dead_ratio
-- FROM pg_stat_user_tables
-- WHERE schemaname = 'public'
--   AND n_live_tup > 0
-- ORDER BY n_dead_tup DESC;
--
-- Get slow queries:
-- SELECT * FROM analyze_slow_queries(100);
--
-- Find tables needing indexes:
-- SELECT * FROM find_missing_indexes();
--
-- Get table sizes:
-- SELECT * FROM get_table_sizes();
