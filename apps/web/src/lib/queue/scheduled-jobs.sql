/**
 * Scheduled Jobs using pg_cron
 * Section 2.12: Background Jobs & Async Processing
 *
 * Requirement #8: Auto-renew SSL certificates 30 days before expiration
 * Requirement #9: Clean up expired share links
 * Requirement #10: Archive old portfolio versions
 *
 * IMPORTANT: Run this in your Supabase SQL Editor
 * pg_cron is available in Supabase by default
 */

-- ============================================================================
-- Enable pg_cron extension (if not already enabled)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- Requirement #9: Clean up expired share links
-- Run daily at midnight (00:00 UTC)
-- ============================================================================
SELECT cron.schedule(
  'cleanup-expired-shares',
  '0 0 * * *', -- Every day at midnight
  $$
  DELETE FROM portfolio_shares
  WHERE expires_at < NOW()
  AND deleted_at IS NULL;
  $$
);

-- ============================================================================
-- Requirement #10: Archive old portfolio versions
-- Move versions >6 months old to cold storage
-- Run weekly on Sunday at 2:00 AM UTC
-- ============================================================================
SELECT cron.schedule(
  'archive-old-versions',
  '0 2 * * 0', -- Every Sunday at 2:00 AM
  $$
  UPDATE portfolio_versions
  SET is_archived = true,
      archived_at = NOW()
  WHERE created_at < NOW() - INTERVAL '6 months'
  AND is_archived = false
  AND deleted_at IS NULL;
  $$
);

-- Optional: Move archived versions to separate table for better performance
SELECT cron.schedule(
  'move-archived-versions-to-cold-storage',
  '0 3 * * 0', -- Every Sunday at 3:00 AM (after archiving)
  $$
  INSERT INTO portfolio_versions_archived (
    id, portfolio_id, version_number, snapshot_data,
    created_by, created_at, is_archived, archived_at
  )
  SELECT
    id, portfolio_id, version_number, snapshot_data,
    created_by, created_at, is_archived, archived_at
  FROM portfolio_versions
  WHERE is_archived = true
  AND archived_at < NOW() - INTERVAL '1 month'
  ON CONFLICT (id) DO NOTHING;

  -- Delete from main table after moving
  DELETE FROM portfolio_versions
  WHERE id IN (
    SELECT id FROM portfolio_versions_archived
  );
  $$
);

-- ============================================================================
-- Requirement #8: Auto-renew SSL certificates 30 days before expiration
-- Run daily at 3:00 AM UTC
-- ============================================================================
SELECT cron.schedule(
  'check-ssl-certificates-expiration',
  '0 3 * * *', -- Every day at 3:00 AM
  $$
  -- Mark certificates that need renewal
  UPDATE custom_domains
  SET ssl_status = 'pending_renewal'
  WHERE ssl_status = 'active'
  AND ssl_expires_at < NOW() + INTERVAL '30 days'
  AND ssl_expires_at > NOW()
  AND deleted_at IS NULL;
  $$
);

-- Optional: Trigger webhook or job queue for SSL renewal
-- This requires a database function that can call external APIs
CREATE OR REPLACE FUNCTION trigger_ssl_renewal()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  domain_record RECORD;
BEGIN
  -- Find domains that need SSL renewal
  FOR domain_record IN
    SELECT id, portfolio_id, domain
    FROM custom_domains
    WHERE ssl_status = 'pending_renewal'
    AND deleted_at IS NULL
  LOOP
    -- TODO: Trigger SSL renewal job
    -- Option 1: Use Supabase Edge Function
    -- SELECT net.http_post(
    --   url := 'https://your-project.supabase.co/functions/v1/renew-ssl',
    --   body := json_build_object('domainId', domain_record.id)
    -- );

    -- Option 2: Insert into job queue table (processed by worker)
    -- INSERT INTO job_queue (type, data, status)
    -- VALUES ('ssl-renewal', json_build_object('domainId', domain_record.id), 'pending');

    RAISE NOTICE 'SSL renewal triggered for domain %', domain_record.domain;
  END LOOP;
END;
$$;

-- Schedule SSL renewal trigger
SELECT cron.schedule(
  'trigger-ssl-renewal',
  '30 3 * * *', -- Every day at 3:30 AM (after marking)
  $$ SELECT trigger_ssl_renewal(); $$
);

-- ============================================================================
-- Clean up old deployment logs (optional)
-- Keep logs for 30 days
-- ============================================================================
SELECT cron.schedule(
  'cleanup-old-deployment-logs',
  '0 4 * * 0', -- Every Sunday at 4:00 AM
  $$
  DELETE FROM deployment_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
  $$
);

-- ============================================================================
-- Clean up old analytics data (optional)
-- Aggregate daily analytics into monthly analytics for data >1 year old
-- ============================================================================
SELECT cron.schedule(
  'aggregate-old-analytics',
  '0 5 * * 0', -- Every Sunday at 5:00 AM
  $$
  INSERT INTO portfolio_analytics_monthly (
    portfolio_id, year, month,
    total_views, total_unique_visitors,
    avg_duration, created_at
  )
  SELECT
    portfolio_id,
    EXTRACT(YEAR FROM date) as year,
    EXTRACT(MONTH FROM date) as month,
    SUM(views) as total_views,
    SUM(unique_visitors) as total_unique_visitors,
    AVG(avg_duration) as avg_duration,
    NOW() as created_at
  FROM portfolio_analytics
  WHERE date < NOW() - INTERVAL '1 year'
  AND date >= NOW() - INTERVAL '2 years'
  GROUP BY portfolio_id, year, month
  ON CONFLICT (portfolio_id, year, month)
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    total_unique_visitors = EXCLUDED.total_unique_visitors,
    avg_duration = EXCLUDED.avg_duration;

  -- Delete old daily analytics after aggregation
  DELETE FROM portfolio_analytics
  WHERE date < NOW() - INTERVAL '1 year';
  $$
);

-- ============================================================================
-- View scheduled jobs
-- ============================================================================
-- SELECT * FROM cron.job;

-- ============================================================================
-- Unschedule a job (if needed)
-- ============================================================================
-- SELECT cron.unschedule('cleanup-expired-shares');

-- ============================================================================
-- View job run history
-- ============================================================================
-- SELECT * FROM cron.job_run_details
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-expired-shares')
-- ORDER BY start_time DESC
-- LIMIT 10;

-- ============================================================================
-- Create table for archived versions (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS portfolio_versions_archived (
  id UUID PRIMARY KEY,
  portfolio_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  snapshot_data JSONB NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT true,
  archived_at TIMESTAMPTZ,
  UNIQUE(portfolio_id, version_number)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_versions_archived_portfolio
ON portfolio_versions_archived(portfolio_id);

CREATE INDEX IF NOT EXISTS idx_versions_archived_date
ON portfolio_versions_archived(archived_at);

-- ============================================================================
-- Create table for monthly analytics (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS portfolio_analytics_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_views INTEGER DEFAULT 0,
  total_unique_visitors INTEGER DEFAULT 0,
  avg_duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(portfolio_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_analytics_monthly_portfolio
ON portfolio_analytics_monthly(portfolio_id);

CREATE INDEX IF NOT EXISTS idx_analytics_monthly_date
ON portfolio_analytics_monthly(year, month);
