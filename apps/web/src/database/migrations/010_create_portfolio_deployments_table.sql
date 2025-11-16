-- ============================================================================
-- Migration: 010_create_portfolio_deployments_table
-- Section 3.7: Deployment History Tables
-- ============================================================================
-- Description: Create portfolio_deployments table for deployment tracking
-- Run in: Supabase SQL Editor (run AFTER 009)
-- ============================================================================

-- ============================================================================
-- Requirement #1: Create portfolio_deployments table
-- ============================================================================
CREATE TABLE IF NOT EXISTS portfolio_deployments (
  -- Primary identifier
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Portfolio relationship (Requirement #1)
  portfolio_id UUID NOT NULL,

  -- Deployment status (Requirement #1)
  status deployment_status NOT NULL DEFAULT 'QUEUED',

  -- Build information (Requirement #1)
  build_log TEXT,
  error_message TEXT,

  -- Deployment result (Requirement #1)
  deployed_url TEXT,

  -- Performance metrics (Requirement #1)
  build_duration INTEGER, -- seconds

  -- Audit (Requirement #1)
  deployed_by UUID,
  deployed_at TIMESTAMPTZ,

  -- Timestamp (Requirement #1)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Add constraints
-- ============================================================================

-- Build duration must be non-negative
ALTER TABLE portfolio_deployments
  ADD CONSTRAINT valid_build_duration
  CHECK (build_duration IS NULL OR build_duration >= 0);

-- Status transitions validation
-- QUEUED -> BUILDING -> DEPLOYING -> DEPLOYED/FAILED/ROLLED_BACK

-- ============================================================================
-- Add indexes
-- ============================================================================

-- Requirement #3: Composite index on (portfolioId, createdAt DESC)
CREATE INDEX idx_portfolio_deployments_portfolio_created
  ON portfolio_deployments (portfolio_id, created_at DESC);

-- Index on portfolio_id alone
CREATE INDEX idx_portfolio_deployments_portfolio
  ON portfolio_deployments (portfolio_id);

-- Index on status for filtering
CREATE INDEX idx_portfolio_deployments_status
  ON portfolio_deployments (status);

-- Index on deployed_by for user history
CREATE INDEX idx_portfolio_deployments_deployed_by
  ON portfolio_deployments (deployed_by)
  WHERE deployed_by IS NOT NULL;

-- Index on created_at for global deployment history
CREATE INDEX idx_portfolio_deployments_created_at
  ON portfolio_deployments (created_at DESC);

-- Index on deployed_at for successful deployments
CREATE INDEX idx_portfolio_deployments_deployed_at
  ON portfolio_deployments (deployed_at DESC)
  WHERE deployed_at IS NOT NULL;

-- ============================================================================
-- Create function to update deployment status
-- ============================================================================
CREATE OR REPLACE FUNCTION update_deployment_status(
  p_deployment_id UUID,
  p_status deployment_status,
  p_error_message TEXT DEFAULT NULL,
  p_deployed_url TEXT DEFAULT NULL,
  p_build_duration INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE portfolio_deployments
  SET
    status = p_status,
    error_message = COALESCE(p_error_message, error_message),
    deployed_url = COALESCE(p_deployed_url, deployed_url),
    build_duration = COALESCE(p_build_duration, build_duration),
    deployed_at = CASE
      WHEN p_status = 'DEPLOYED' THEN NOW()
      ELSE deployed_at
    END
  WHERE id = p_deployment_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_deployment_status IS 'Update deployment status and related fields';

-- ============================================================================
-- Create function to append build log
-- ============================================================================
CREATE OR REPLACE FUNCTION append_deployment_log(
  p_deployment_id UUID,
  p_log_entry TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE portfolio_deployments
  SET
    build_log = COALESCE(build_log || E'\n', '') || '[' || NOW()::TEXT || '] ' || p_log_entry
  WHERE id = p_deployment_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION append_deployment_log IS 'Append a log entry to deployment build log';

-- ============================================================================
-- Create function to start deployment
-- ============================================================================
CREATE OR REPLACE FUNCTION start_deployment(
  p_portfolio_id UUID,
  p_deployed_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  deployment_id UUID;
BEGIN
  INSERT INTO portfolio_deployments (
    portfolio_id,
    status,
    deployed_by
  ) VALUES (
    p_portfolio_id,
    'QUEUED',
    p_deployed_by
  )
  RETURNING id INTO deployment_id;

  -- Update portfolio build status
  UPDATE portfolios
  SET
    build_status = 'BUILDING',
    last_build_at = NOW()
  WHERE id = p_portfolio_id;

  RETURN deployment_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION start_deployment IS 'Create a new deployment record and update portfolio build status';

-- ============================================================================
-- Create function to complete deployment
-- ============================================================================
CREATE OR REPLACE FUNCTION complete_deployment(
  p_deployment_id UUID,
  p_success BOOLEAN,
  p_deployed_url TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_build_duration INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  p_portfolio_id UUID;
  new_status deployment_status;
  build_status_value portfolio_build_status;
BEGIN
  -- Get portfolio ID
  SELECT portfolio_id INTO p_portfolio_id
  FROM portfolio_deployments
  WHERE id = p_deployment_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Determine status
  IF p_success THEN
    new_status := 'DEPLOYED';
    build_status_value := 'SUCCESS';
  ELSE
    new_status := 'FAILED';
    build_status_value := 'FAILED';
  END IF;

  -- Update deployment
  UPDATE portfolio_deployments
  SET
    status = new_status,
    deployed_url = p_deployed_url,
    error_message = p_error_message,
    build_duration = p_build_duration,
    deployed_at = CASE WHEN p_success THEN NOW() ELSE NULL END
  WHERE id = p_deployment_id;

  -- Update portfolio
  UPDATE portfolios
  SET
    build_status = build_status_value,
    build_artifact_path = CASE WHEN p_success THEN p_deployed_url ELSE build_artifact_path END,
    last_build_at = NOW()
  WHERE id = p_portfolio_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION complete_deployment IS 'Mark deployment as complete (success or failure) and update portfolio';

-- ============================================================================
-- Create function to rollback deployment
-- ============================================================================
CREATE OR REPLACE FUNCTION rollback_deployment(
  p_portfolio_id UUID,
  p_target_deployment_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  rollback_id UUID;
  target_url TEXT;
BEGIN
  -- If no target specified, rollback to last successful deployment
  IF p_target_deployment_id IS NULL THEN
    SELECT id, deployed_url INTO p_target_deployment_id, target_url
    FROM portfolio_deployments
    WHERE portfolio_id = p_portfolio_id
      AND status = 'DEPLOYED'
    ORDER BY deployed_at DESC
    LIMIT 1;
  ELSE
    SELECT deployed_url INTO target_url
    FROM portfolio_deployments
    WHERE id = p_target_deployment_id;
  END IF;

  IF p_target_deployment_id IS NULL THEN
    RAISE EXCEPTION 'No successful deployment found to rollback to';
  END IF;

  -- Create rollback deployment record
  INSERT INTO portfolio_deployments (
    portfolio_id,
    status,
    deployed_url,
    deployed_at
  ) VALUES (
    p_portfolio_id,
    'ROLLED_BACK',
    target_url,
    NOW()
  )
  RETURNING id INTO rollback_id;

  -- Update portfolio
  UPDATE portfolios
  SET
    build_artifact_path = target_url,
    last_build_at = NOW()
  WHERE id = p_portfolio_id;

  RETURN rollback_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rollback_deployment IS 'Rollback portfolio to a previous successful deployment';

-- ============================================================================
-- Create function to get deployment history
-- ============================================================================
CREATE OR REPLACE FUNCTION get_deployment_history(
  p_portfolio_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  status deployment_status,
  deployed_url TEXT,
  build_duration INTEGER,
  error_message TEXT,
  deployed_by UUID,
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pd.id,
    pd.status,
    pd.deployed_url,
    pd.build_duration,
    pd.error_message,
    pd.deployed_by,
    pd.deployed_at,
    pd.created_at
  FROM portfolio_deployments pd
  WHERE pd.portfolio_id = p_portfolio_id
  ORDER BY pd.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_deployment_history IS 'Get deployment history for a portfolio';

-- ============================================================================
-- Create function to get deployment stats
-- ============================================================================
CREATE OR REPLACE FUNCTION get_deployment_stats(
  p_portfolio_id UUID
)
RETURNS TABLE (
  total_deployments BIGINT,
  successful_deployments BIGINT,
  failed_deployments BIGINT,
  avg_build_duration INTEGER,
  last_deployment_at TIMESTAMPTZ,
  last_successful_deployment_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_deployments,
    COUNT(*) FILTER (WHERE status = 'DEPLOYED') as successful_deployments,
    COUNT(*) FILTER (WHERE status = 'FAILED') as failed_deployments,
    AVG(build_duration)::INTEGER as avg_build_duration,
    MAX(created_at) as last_deployment_at,
    MAX(deployed_at) FILTER (WHERE status = 'DEPLOYED') as last_successful_deployment_at
  FROM portfolio_deployments
  WHERE portfolio_id = p_portfolio_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_deployment_stats IS 'Get aggregated deployment statistics for a portfolio';

-- ============================================================================
-- Add Row Level Security (RLS)
-- ============================================================================
ALTER TABLE portfolio_deployments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view deployments for their own portfolios
CREATE POLICY "Users can view own portfolio deployments"
  ON portfolio_deployments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_deployments.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Policy: System can insert deployments
CREATE POLICY "System can insert deployments"
  ON portfolio_deployments FOR INSERT
  WITH CHECK (true);

-- Policy: System can update deployments
CREATE POLICY "System can update deployments"
  ON portfolio_deployments FOR UPDATE
  USING (true);

-- ============================================================================
-- Add comments for documentation
-- ============================================================================
COMMENT ON TABLE portfolio_deployments IS 'Deployment history and tracking for portfolios';
COMMENT ON COLUMN portfolio_deployments.id IS 'Unique deployment identifier';
COMMENT ON COLUMN portfolio_deployments.portfolio_id IS 'Portfolio being deployed';
COMMENT ON COLUMN portfolio_deployments.status IS 'Current deployment status (QUEUED, BUILDING, DEPLOYING, DEPLOYED, FAILED, ROLLED_BACK)';
COMMENT ON COLUMN portfolio_deployments.build_log IS 'Full build log with timestamps';
COMMENT ON COLUMN portfolio_deployments.error_message IS 'Error message if deployment failed';
COMMENT ON COLUMN portfolio_deployments.deployed_url IS 'URL where portfolio is deployed';
COMMENT ON COLUMN portfolio_deployments.build_duration IS 'Time taken to build in seconds';
COMMENT ON COLUMN portfolio_deployments.deployed_by IS 'User who initiated this deployment';
COMMENT ON COLUMN portfolio_deployments.deployed_at IS 'Timestamp when deployment completed successfully';
COMMENT ON COLUMN portfolio_deployments.created_at IS 'Timestamp when deployment was queued';

-- ============================================================================
-- Verify migration
-- ============================================================================
-- Test deployment flow:
-- SELECT start_deployment('portfolio-uuid', 'user-uuid');
-- SELECT update_deployment_status('deployment-uuid', 'BUILDING');
-- SELECT append_deployment_log('deployment-uuid', 'Starting build...');
-- SELECT complete_deployment('deployment-uuid', true, 'https://example.com', NULL, 45);
-- SELECT * FROM get_deployment_history('portfolio-uuid', 10);
-- SELECT * FROM get_deployment_stats('portfolio-uuid');
