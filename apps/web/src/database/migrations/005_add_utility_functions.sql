-- ============================================================================
-- Migration: 005_add_utility_functions
-- Additional utility functions for portfolios
-- ============================================================================
-- Description: Add helper functions for common operations
-- Run in: Supabase SQL Editor (run AFTER migrations 001-004)
-- ============================================================================

-- ============================================================================
-- Function: Increment view count
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_view_count(portfolio_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE portfolios
  SET
    view_count = view_count + 1,
    last_viewed_at = NOW()
  WHERE id = portfolio_uuid;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_view_count IS 'Increment portfolio view count and update last viewed timestamp';

-- ============================================================================
-- Function: Get portfolio stats
-- ============================================================================
CREATE OR REPLACE FUNCTION get_portfolio_stats(portfolio_uuid UUID)
RETURNS TABLE (
  view_count INTEGER,
  version_count BIGINT,
  days_since_creation INTEGER,
  days_since_last_update INTEGER,
  is_published BOOLEAN,
  build_status portfolio_build_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.view_count,
    (SELECT COUNT(*) FROM portfolio_versions WHERE portfolio_id = p.id) as version_count,
    EXTRACT(DAY FROM NOW() - p.created_at)::INTEGER as days_since_creation,
    EXTRACT(DAY FROM NOW() - p.updated_at)::INTEGER as days_since_last_update,
    p.is_published,
    p.build_status
  FROM portfolios p
  WHERE p.id = portfolio_uuid;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_portfolio_stats IS 'Get aggregated statistics for a portfolio';

-- ============================================================================
-- Function: Search portfolios
-- ============================================================================
CREATE OR REPLACE FUNCTION search_portfolios(
  search_query TEXT,
  search_user_id UUID DEFAULT NULL,
  include_unpublished BOOLEAN DEFAULT false,
  result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name VARCHAR(200),
  slug VARCHAR(200),
  description TEXT,
  subdomain VARCHAR(63),
  is_published BOOLEAN,
  view_count INTEGER,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.name,
    p.slug,
    p.description,
    p.subdomain,
    p.is_published,
    p.view_count,
    p.created_at,
    ts_rank(
      to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM portfolios p
  WHERE
    p.deleted_at IS NULL
    AND (search_user_id IS NULL OR p.user_id = search_user_id)
    AND (include_unpublished = true OR p.is_published = true)
    AND (
      to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, ''))
      @@ plainto_tsquery('english', search_query)
    )
  ORDER BY rank DESC, p.view_count DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_portfolios IS 'Full-text search across portfolio names and descriptions';

-- ============================================================================
-- Function: Get popular portfolios
-- ============================================================================
CREATE OR REPLACE FUNCTION get_popular_portfolios(
  days_range INTEGER DEFAULT 30,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(200),
  slug VARCHAR(200),
  subdomain VARCHAR(63),
  view_count INTEGER,
  template_id UUID,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.subdomain,
    p.view_count,
    p.template_id,
    p.created_at
  FROM portfolios p
  WHERE
    p.is_published = true
    AND p.visibility = 'PUBLIC'
    AND p.deleted_at IS NULL
    AND p.created_at >= NOW() - (days_range || ' days')::INTERVAL
  ORDER BY p.view_count DESC, p.created_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_popular_portfolios IS 'Get most viewed portfolios within a time range';

-- ============================================================================
-- Function: Get user portfolio count
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_portfolio_count(user_uuid UUID)
RETURNS TABLE (
  total_count BIGINT,
  published_count BIGINT,
  draft_count BIGINT,
  deleted_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE is_published = true AND deleted_at IS NULL) as published_count,
    COUNT(*) FILTER (WHERE is_draft = true AND deleted_at IS NULL) as draft_count,
    COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_count
  FROM portfolios
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_portfolio_count IS 'Get portfolio counts for a user';

-- ============================================================================
-- Function: Validate subdomain format
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_subdomain(subdomain_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    subdomain_input IS NULL OR (
      subdomain_input ~ '^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$'
      AND char_length(subdomain_input) >= 3
      AND char_length(subdomain_input) <= 63
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION validate_subdomain IS 'Validate subdomain format (3-63 chars, lowercase, hyphens)';

-- ============================================================================
-- Function: Check subdomain availability
-- ============================================================================
CREATE OR REPLACE FUNCTION is_subdomain_available(subdomain_input VARCHAR(63))
RETURNS BOOLEAN AS $$
DECLARE
  existing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_count
  FROM portfolios
  WHERE subdomain = subdomain_input
    AND deleted_at IS NULL;

  RETURN existing_count = 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_subdomain_available IS 'Check if a subdomain is available (not used by active portfolios)';

-- ============================================================================
-- Function: Publish portfolio
-- ============================================================================
CREATE OR REPLACE FUNCTION publish_portfolio(portfolio_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE portfolios
  SET
    is_published = true,
    is_draft = false,
    published_at = COALESCE(published_at, NOW()),
    updated_at = NOW()
  WHERE id = portfolio_uuid
    AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION publish_portfolio IS 'Publish a portfolio (set is_published=true, is_draft=false, set published_at)';

-- ============================================================================
-- Function: Unpublish portfolio
-- ============================================================================
CREATE OR REPLACE FUNCTION unpublish_portfolio(portfolio_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE portfolios
  SET
    is_published = false,
    is_draft = true,
    updated_at = NOW()
  WHERE id = portfolio_uuid
    AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION unpublish_portfolio IS 'Unpublish a portfolio (set is_published=false, is_draft=true)';

-- ============================================================================
-- Function: Get template popularity
-- ============================================================================
CREATE OR REPLACE FUNCTION get_template_popularity()
RETURNS TABLE (
  template_id UUID,
  template_name VARCHAR(200),
  template_category template_category,
  usage_count INTEGER,
  active_portfolios BIGINT,
  avg_views NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id as template_id,
    t.name as template_name,
    t.category as template_category,
    t.usage_count,
    COUNT(DISTINCT p.id) as active_portfolios,
    AVG(p.view_count) as avg_views
  FROM portfolio_templates t
  LEFT JOIN portfolios p ON p.template_id = t.id AND p.deleted_at IS NULL
  WHERE t.is_active = true
  GROUP BY t.id, t.name, t.category, t.usage_count
  ORDER BY t.usage_count DESC, active_portfolios DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_template_popularity IS 'Get template usage statistics and popularity metrics';

-- ============================================================================
-- Create full-text search index
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_portfolios_search
  ON portfolios USING gin(
    to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''))
  );

COMMENT ON INDEX idx_portfolios_search IS 'Full-text search index for portfolio names and descriptions';

-- ============================================================================
-- Create materialized view for portfolio statistics (optional)
-- ============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS portfolio_statistics AS
SELECT
  p.id,
  p.user_id,
  p.name,
  p.slug,
  p.view_count,
  p.is_published,
  p.created_at,
  COUNT(DISTINCT pv.id) as version_count,
  MAX(pv.created_at) as last_version_at,
  EXTRACT(DAY FROM NOW() - p.created_at) as days_old
FROM portfolios p
LEFT JOIN portfolio_versions pv ON pv.portfolio_id = p.id
WHERE p.deleted_at IS NULL
GROUP BY p.id;

CREATE UNIQUE INDEX idx_portfolio_statistics_id ON portfolio_statistics (id);

COMMENT ON MATERIALIZED VIEW portfolio_statistics IS 'Aggregated statistics for portfolios (refresh periodically)';

-- ============================================================================
-- Function to refresh statistics
-- ============================================================================
CREATE OR REPLACE FUNCTION refresh_portfolio_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY portfolio_statistics;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_portfolio_statistics IS 'Refresh portfolio statistics materialized view';

-- ============================================================================
-- Schedule statistics refresh (requires pg_cron extension)
-- ============================================================================
-- Uncomment to enable automatic statistics refresh:
-- SELECT cron.schedule(
--   'refresh-portfolio-stats',
--   '0 */6 * * *', -- Every 6 hours
--   $$ SELECT refresh_portfolio_statistics(); $$
-- );

-- ============================================================================
-- Verify functions
-- ============================================================================
-- List all custom functions:
-- SELECT
--   routine_name,
--   routine_type,
--   data_type
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
--   AND routine_name LIKE '%portfolio%'
-- ORDER BY routine_name;
