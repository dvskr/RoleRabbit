-- ============================================================================
-- Migration: 003_create_portfolio_versions_table
-- Section 3.3: Portfolio Version Tables
-- ============================================================================
-- Description: Create portfolio_versions table for version control
-- Run in: Supabase SQL Editor (run AFTER 001 and 002)
-- ============================================================================

-- ============================================================================
-- Create portfolio_versions table
-- Requirement #1: Create portfolio_versions table with all specified columns
-- ============================================================================
CREATE TABLE IF NOT EXISTS portfolio_versions (
  -- Primary identifier
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Portfolio relationship (Requirement #1)
  portfolio_id UUID NOT NULL,

  -- Version information (Requirement #1)
  version INTEGER NOT NULL,
  name VARCHAR(200),

  -- Version data (Requirement #1)
  data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',

  -- Audit fields (Requirement #1)
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Add constraints
-- ============================================================================

-- Requirement #3: Unique constraint on (portfolioId, version)
ALTER TABLE portfolio_versions
  ADD CONSTRAINT unique_portfolio_version UNIQUE (portfolio_id, version);

-- Ensure version is positive
ALTER TABLE portfolio_versions
  ADD CONSTRAINT positive_version
  CHECK (version > 0);

-- ============================================================================
-- Add indexes
-- ============================================================================

-- Requirement #4: Composite index on (portfolioId, version DESC)
CREATE INDEX idx_portfolio_versions_portfolio
  ON portfolio_versions (portfolio_id, version DESC);

-- Additional recommended indexes
CREATE INDEX idx_portfolio_versions_created_at
  ON portfolio_versions (created_at DESC);

CREATE INDEX idx_portfolio_versions_created_by
  ON portfolio_versions (created_by)
  WHERE created_by IS NOT NULL;

-- ============================================================================
-- Create function to auto-increment version number
-- ============================================================================
CREATE OR REPLACE FUNCTION get_next_portfolio_version(p_portfolio_id UUID)
RETURNS INTEGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1
  INTO next_version
  FROM portfolio_versions
  WHERE portfolio_id = p_portfolio_id;

  RETURN next_version;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create function to create portfolio version automatically
-- ============================================================================
CREATE OR REPLACE FUNCTION create_portfolio_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if data actually changed
  IF (TG_OP = 'UPDATE' AND OLD.data IS DISTINCT FROM NEW.data) OR TG_OP = 'INSERT' THEN
    INSERT INTO portfolio_versions (
      portfolio_id,
      version,
      name,
      data,
      metadata,
      created_by
    ) VALUES (
      NEW.id,
      get_next_portfolio_version(NEW.id),
      'Auto-save ' || NOW()::TEXT,
      NEW.data,
      jsonb_build_object(
        'operation', TG_OP,
        'is_published', NEW.is_published,
        'build_status', NEW.build_status
      ),
      NEW.updated_by
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic versioning
CREATE TRIGGER auto_create_portfolio_version
  AFTER INSERT OR UPDATE OF data ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION create_portfolio_version();

-- ============================================================================
-- Create function to restore portfolio from version
-- ============================================================================
CREATE OR REPLACE FUNCTION restore_portfolio_version(
  p_portfolio_id UUID,
  p_version INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  version_data JSONB;
BEGIN
  -- Get version data
  SELECT data INTO version_data
  FROM portfolio_versions
  WHERE portfolio_id = p_portfolio_id
    AND version = p_version;

  IF version_data IS NULL THEN
    RAISE EXCEPTION 'Version % not found for portfolio %', p_version, p_portfolio_id;
  END IF;

  -- Update portfolio with version data
  UPDATE portfolios
  SET
    data = version_data,
    updated_at = NOW()
  WHERE id = p_portfolio_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create function to compare versions
-- ============================================================================
CREATE OR REPLACE FUNCTION compare_portfolio_versions(
  p_portfolio_id UUID,
  p_version1 INTEGER,
  p_version2 INTEGER
)
RETURNS TABLE (
  field TEXT,
  version1_value JSONB,
  version2_value JSONB,
  is_different BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH v1 AS (
    SELECT data FROM portfolio_versions
    WHERE portfolio_id = p_portfolio_id AND version = p_version1
  ),
  v2 AS (
    SELECT data FROM portfolio_versions
    WHERE portfolio_id = p_portfolio_id AND version = p_version2
  )
  SELECT
    key::TEXT as field,
    v1.data->key as version1_value,
    v2.data->key as version2_value,
    (v1.data->key) IS DISTINCT FROM (v2.data->key) as is_different
  FROM v1, v2, jsonb_object_keys(v1.data) key
  UNION
  SELECT
    key::TEXT as field,
    v1.data->key as version1_value,
    v2.data->key as version2_value,
    (v1.data->key) IS DISTINCT FROM (v2.data->key) as is_different
  FROM v1, v2, jsonb_object_keys(v2.data) key;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create function to get version history
-- ============================================================================
CREATE OR REPLACE FUNCTION get_portfolio_version_history(
  p_portfolio_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  version INTEGER,
  name VARCHAR(200),
  created_at TIMESTAMPTZ,
  created_by UUID,
  changes_summary TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pv.version,
    pv.name,
    pv.created_at,
    pv.created_by,
    CASE
      WHEN pv.metadata->>'operation' = 'INSERT' THEN 'Created'
      WHEN pv.metadata->>'operation' = 'UPDATE' THEN 'Updated'
      ELSE 'Modified'
    END as changes_summary
  FROM portfolio_versions pv
  WHERE pv.portfolio_id = p_portfolio_id
  ORDER BY pv.version DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Add Row Level Security (RLS)
-- ============================================================================
ALTER TABLE portfolio_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view versions of their own portfolios
CREATE POLICY "Users can view own portfolio versions"
  ON portfolio_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_versions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Policy: Users can create versions for their own portfolios
CREATE POLICY "Users can create own portfolio versions"
  ON portfolio_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_versions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Policy: Versions are immutable (no updates or deletes)
-- No UPDATE or DELETE policies = versions cannot be modified once created

-- ============================================================================
-- Add comments for documentation
-- ============================================================================
COMMENT ON TABLE portfolio_versions IS 'Version history for portfolio data with automatic versioning';
COMMENT ON COLUMN portfolio_versions.id IS 'Unique version identifier (UUID)';
COMMENT ON COLUMN portfolio_versions.portfolio_id IS 'Reference to parent portfolio';
COMMENT ON COLUMN portfolio_versions.version IS 'Sequential version number (1, 2, 3, ...)';
COMMENT ON COLUMN portfolio_versions.name IS 'Optional version name/description';
COMMENT ON COLUMN portfolio_versions.data IS 'Snapshot of portfolio data at this version';
COMMENT ON COLUMN portfolio_versions.metadata IS 'Additional metadata (operation type, flags, etc.)';
COMMENT ON COLUMN portfolio_versions.created_by IS 'User who created this version';

COMMENT ON FUNCTION get_next_portfolio_version IS 'Returns the next version number for a portfolio';
COMMENT ON FUNCTION create_portfolio_version IS 'Trigger function to auto-create versions on portfolio data changes';
COMMENT ON FUNCTION restore_portfolio_version IS 'Restore a portfolio to a specific version';
COMMENT ON FUNCTION compare_portfolio_versions IS 'Compare two versions and return differences';
COMMENT ON FUNCTION get_portfolio_version_history IS 'Get version history for a portfolio';

-- ============================================================================
-- Verify migration
-- ============================================================================
-- SELECT COUNT(*) as version_count FROM portfolio_versions;
-- SELECT * FROM get_portfolio_version_history('your-portfolio-id', 5);
