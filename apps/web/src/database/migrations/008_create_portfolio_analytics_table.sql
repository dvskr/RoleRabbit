-- ============================================================================
-- Migration: 008_create_portfolio_analytics_table
-- Section 3.5: Analytics Tables
-- ============================================================================
-- Description: Create portfolio_analytics table with date partitioning
-- Run in: Supabase SQL Editor (run AFTER 007)
-- ============================================================================

-- ============================================================================
-- Requirement #1: Create portfolio_analytics table
-- Requirement #5: Implement table partitioning by date range
-- ============================================================================

-- Create the parent table (partitioned by date)
CREATE TABLE IF NOT EXISTS portfolio_analytics (
  -- Primary identifier
  id UUID DEFAULT gen_random_uuid(),

  -- Portfolio relationship (Requirement #1)
  portfolio_id UUID NOT NULL,

  -- Date for analytics (Requirement #1, indexed)
  date DATE NOT NULL,

  -- Metrics (Requirement #1)
  views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  avg_time_on_page INTEGER, -- seconds
  bounce_rate NUMERIC(5,2), -- percentage (0.00-100.00)

  -- Detailed analytics (Requirement #1)
  referrers JSONB DEFAULT '{}',
  countries JSONB DEFAULT '{}',
  devices JSONB DEFAULT '{}',

  -- Timestamps (Requirement #1)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Composite primary key including partition key
  PRIMARY KEY (id, date)
) PARTITION BY RANGE (date);

-- ============================================================================
-- Create partitions for current and future months
-- Requirement #5: Monthly partitioning for performance
-- ============================================================================

-- Create partition for current month
DO $$
DECLARE
  partition_name TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  -- Current month
  start_date := DATE_TRUNC('month', CURRENT_DATE);
  end_date := start_date + INTERVAL '1 month';
  partition_name := 'portfolio_analytics_' || TO_CHAR(start_date, 'YYYY_MM');

  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF portfolio_analytics
     FOR VALUES FROM (%L) TO (%L)',
    partition_name, start_date, end_date
  );

  -- Next month
  start_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
  end_date := start_date + INTERVAL '1 month';
  partition_name := 'portfolio_analytics_' || TO_CHAR(start_date, 'YYYY_MM');

  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF portfolio_analytics
     FOR VALUES FROM (%L) TO (%L)',
    partition_name, start_date, end_date
  );

  -- Month after next
  start_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '2 months');
  end_date := start_date + INTERVAL '1 month';
  partition_name := 'portfolio_analytics_' || TO_CHAR(start_date, 'YYYY_MM');

  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF portfolio_analytics
     FOR VALUES FROM (%L) TO (%L)',
    partition_name, start_date, end_date
  );
END $$;

-- ============================================================================
-- Create function to auto-create next month's partition
-- ============================================================================
CREATE OR REPLACE FUNCTION create_next_analytics_partition()
RETURNS void AS $$
DECLARE
  partition_name TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  -- Create partition for 3 months from now
  start_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '3 months');
  end_date := start_date + INTERVAL '1 month';
  partition_name := 'portfolio_analytics_' || TO_CHAR(start_date, 'YYYY_MM');

  -- Check if partition already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE tablename = partition_name
  ) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF portfolio_analytics
       FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );

    RAISE NOTICE 'Created partition % for date range % to %',
      partition_name, start_date, end_date;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_next_analytics_partition IS 'Create partition for analytics data 3 months in advance';

-- Schedule partition creation (requires pg_cron)
-- Uncomment to enable:
-- SELECT cron.schedule(
--   'create-analytics-partition',
--   '0 0 1 * *', -- First day of each month at midnight
--   $$ SELECT create_next_analytics_partition(); $$
-- );

-- ============================================================================
-- Add constraints
-- ============================================================================

-- Requirement #3: Unique constraint on (portfolioId, date)
CREATE UNIQUE INDEX unique_portfolio_date
  ON portfolio_analytics (portfolio_id, date);

-- Constraint: bounce_rate between 0 and 100
ALTER TABLE portfolio_analytics
  ADD CONSTRAINT valid_bounce_rate
  CHECK (bounce_rate IS NULL OR (bounce_rate >= 0 AND bounce_rate <= 100));

-- Constraint: views and unique_visitors must be non-negative
ALTER TABLE portfolio_analytics
  ADD CONSTRAINT valid_views
  CHECK (views >= 0);

ALTER TABLE portfolio_analytics
  ADD CONSTRAINT valid_unique_visitors
  CHECK (unique_visitors >= 0);

-- Constraint: unique_visitors cannot exceed views
ALTER TABLE portfolio_analytics
  ADD CONSTRAINT visitors_not_exceed_views
  CHECK (unique_visitors <= views);

-- ============================================================================
-- Add indexes
-- ============================================================================

-- Requirement #4: Composite index on (portfolioId, date DESC)
CREATE INDEX idx_portfolio_analytics_portfolio_date
  ON portfolio_analytics (portfolio_id, date DESC);

-- Index on portfolio_id alone for aggregations
CREATE INDEX idx_portfolio_analytics_portfolio
  ON portfolio_analytics (portfolio_id);

-- Index on date alone for global queries
CREATE INDEX idx_portfolio_analytics_date
  ON portfolio_analytics (date DESC);

-- ============================================================================
-- Create updated_at trigger
-- ============================================================================
CREATE TRIGGER update_portfolio_analytics_updated_at
  BEFORE UPDATE ON portfolio_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Create function to upsert analytics
-- ============================================================================
CREATE OR REPLACE FUNCTION upsert_portfolio_analytics(
  p_portfolio_id UUID,
  p_date DATE,
  p_views INTEGER DEFAULT 0,
  p_unique_visitors INTEGER DEFAULT 0,
  p_avg_time_on_page INTEGER DEFAULT NULL,
  p_bounce_rate NUMERIC DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_device TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  analytics_id UUID;
BEGIN
  -- Insert or update analytics record
  INSERT INTO portfolio_analytics (
    portfolio_id,
    date,
    views,
    unique_visitors,
    avg_time_on_page,
    bounce_rate,
    referrers,
    countries,
    devices
  ) VALUES (
    p_portfolio_id,
    p_date,
    p_views,
    p_unique_visitors,
    p_avg_time_on_page,
    p_bounce_rate,
    CASE WHEN p_referrer IS NOT NULL
      THEN jsonb_build_object(p_referrer, 1)
      ELSE '{}'::JSONB
    END,
    CASE WHEN p_country IS NOT NULL
      THEN jsonb_build_object(p_country, 1)
      ELSE '{}'::JSONB
    END,
    CASE WHEN p_device IS NOT NULL
      THEN jsonb_build_object(p_device, 1)
      ELSE '{}'::JSONB
    END
  )
  ON CONFLICT (portfolio_id, date)
  DO UPDATE SET
    views = portfolio_analytics.views + EXCLUDED.views,
    unique_visitors = portfolio_analytics.unique_visitors + EXCLUDED.unique_visitors,
    avg_time_on_page = COALESCE(EXCLUDED.avg_time_on_page, portfolio_analytics.avg_time_on_page),
    bounce_rate = COALESCE(EXCLUDED.bounce_rate, portfolio_analytics.bounce_rate),
    referrers = CASE
      WHEN p_referrer IS NOT NULL THEN
        jsonb_set(
          portfolio_analytics.referrers,
          ARRAY[p_referrer],
          to_jsonb(COALESCE((portfolio_analytics.referrers->p_referrer)::INTEGER, 0) + 1)
        )
      ELSE portfolio_analytics.referrers
    END,
    countries = CASE
      WHEN p_country IS NOT NULL THEN
        jsonb_set(
          portfolio_analytics.countries,
          ARRAY[p_country],
          to_jsonb(COALESCE((portfolio_analytics.countries->p_country)::INTEGER, 0) + 1)
        )
      ELSE portfolio_analytics.countries
    END,
    devices = CASE
      WHEN p_device IS NOT NULL THEN
        jsonb_set(
          portfolio_analytics.devices,
          ARRAY[p_device],
          to_jsonb(COALESCE((portfolio_analytics.devices->p_device)::INTEGER, 0) + 1)
        )
      ELSE portfolio_analytics.devices
    END,
    updated_at = NOW()
  RETURNING id INTO analytics_id;

  RETURN analytics_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION upsert_portfolio_analytics IS 'Insert or update analytics for a portfolio on a specific date';

-- ============================================================================
-- Create function to get analytics summary
-- ============================================================================
CREATE OR REPLACE FUNCTION get_portfolio_analytics_summary(
  p_portfolio_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_views BIGINT,
  total_unique_visitors BIGINT,
  avg_time_on_page INTEGER,
  avg_bounce_rate NUMERIC,
  top_referrers JSONB,
  top_countries JSONB,
  top_devices JSONB,
  daily_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_stats AS (
    SELECT
      date,
      views,
      unique_visitors,
      avg_time_on_page,
      bounce_rate,
      referrers,
      countries,
      devices
    FROM portfolio_analytics
    WHERE
      portfolio_id = p_portfolio_id
      AND date BETWEEN p_start_date AND p_end_date
    ORDER BY date DESC
  )
  SELECT
    COALESCE(SUM(views), 0) as total_views,
    COALESCE(SUM(unique_visitors), 0) as total_unique_visitors,
    COALESCE(AVG(avg_time_on_page)::INTEGER, 0) as avg_time_on_page,
    COALESCE(AVG(bounce_rate), 0) as avg_bounce_rate,
    (
      SELECT jsonb_object_agg(key, value ORDER BY value DESC)
      FROM (
        SELECT key, SUM(value::INTEGER) as value
        FROM daily_stats,
        LATERAL jsonb_each_text(referrers)
        GROUP BY key
        ORDER BY value DESC
        LIMIT 10
      ) t
    ) as top_referrers,
    (
      SELECT jsonb_object_agg(key, value ORDER BY value DESC)
      FROM (
        SELECT key, SUM(value::INTEGER) as value
        FROM daily_stats,
        LATERAL jsonb_each_text(countries)
        GROUP BY key
        ORDER BY value DESC
        LIMIT 10
      ) t
    ) as top_countries,
    (
      SELECT jsonb_object_agg(key, value ORDER BY value DESC)
      FROM (
        SELECT key, SUM(value::INTEGER) as value
        FROM daily_stats,
        LATERAL jsonb_each_text(devices)
        GROUP BY key
        ORDER BY value DESC
      ) t
    ) as top_devices,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', date,
          'views', views,
          'uniqueVisitors', unique_visitors,
          'avgTimeOnPage', avg_time_on_page,
          'bounceRate', bounce_rate
        ) ORDER BY date
      )
      FROM daily_stats
    ) as daily_data
  FROM daily_stats;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_portfolio_analytics_summary IS 'Get aggregated analytics summary for a portfolio within date range';

-- ============================================================================
-- Add Row Level Security (RLS)
-- ============================================================================
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view analytics for their own portfolios
CREATE POLICY "Users can view own portfolio analytics"
  ON portfolio_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_analytics.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Policy: System can insert analytics (no user check)
CREATE POLICY "System can insert analytics"
  ON portfolio_analytics FOR INSERT
  WITH CHECK (true);

-- Policy: System can update analytics (no user check)
CREATE POLICY "System can update analytics"
  ON portfolio_analytics FOR UPDATE
  USING (true);

-- ============================================================================
-- Add comments for documentation
-- ============================================================================
COMMENT ON TABLE portfolio_analytics IS 'Daily analytics data for portfolios with monthly partitioning';
COMMENT ON COLUMN portfolio_analytics.id IS 'Unique analytics record identifier';
COMMENT ON COLUMN portfolio_analytics.portfolio_id IS 'Portfolio these analytics belong to';
COMMENT ON COLUMN portfolio_analytics.date IS 'Date for this analytics record';
COMMENT ON COLUMN portfolio_analytics.views IS 'Total page views';
COMMENT ON COLUMN portfolio_analytics.unique_visitors IS 'Unique visitors (by IP/session)';
COMMENT ON COLUMN portfolio_analytics.avg_time_on_page IS 'Average time spent on page in seconds';
COMMENT ON COLUMN portfolio_analytics.bounce_rate IS 'Percentage of visitors who left immediately (0-100)';
COMMENT ON COLUMN portfolio_analytics.referrers IS 'Traffic sources with counts (JSON object)';
COMMENT ON COLUMN portfolio_analytics.countries IS 'Visitor countries with counts (JSON object)';
COMMENT ON COLUMN portfolio_analytics.devices IS 'Device types with counts (JSON object)';

-- ============================================================================
-- Verify migration
-- ============================================================================
-- List all partitions:
-- SELECT
--   schemaname,
--   tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE tablename LIKE 'portfolio_analytics%'
-- ORDER BY tablename;

-- Test upsert:
-- SELECT upsert_portfolio_analytics(
--   'portfolio-uuid',
--   CURRENT_DATE,
--   1, 1, 60, 25.5,
--   'google.com', 'US', 'desktop'
-- );
