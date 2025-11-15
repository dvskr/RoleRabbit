-- Migration 018: Create Audit Logs and Privacy Tables
-- Section 6: Security, Privacy & Compliance

-- ============================================================================
-- Audit Logs Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- For moderation actions
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  ip_address VARCHAR(45), -- IPv6 compatible
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own audit logs
CREATE POLICY audit_logs_select_policy ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can insert audit logs
CREATE POLICY audit_logs_insert_policy ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- Deletion Requests Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'completed')),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for deletion requests
CREATE INDEX idx_deletion_requests_user_id ON deletion_requests(user_id);
CREATE INDEX idx_deletion_requests_status ON deletion_requests(status);
CREATE INDEX idx_deletion_requests_scheduled_for ON deletion_requests(scheduled_for);

-- Composite index for processing pending deletions
CREATE INDEX idx_deletion_requests_pending ON deletion_requests(status, scheduled_for)
  WHERE status = 'pending';

-- Enable Row Level Security
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own deletion requests
CREATE POLICY deletion_requests_select_policy ON deletion_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create deletion requests
CREATE POLICY deletion_requests_insert_policy ON deletion_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own deletion requests (cancel)
CREATE POLICY deletion_requests_update_policy ON deletion_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Add Privacy Fields to Users Table
-- ============================================================================

-- Add deletion scheduled timestamp to users
ALTER TABLE auth.users
  ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP WITH TIME ZONE;

-- Add privacy preferences
ALTER TABLE auth.users
  ADD COLUMN IF NOT EXISTS analytics_opt_out BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS marketing_opt_out BOOLEAN DEFAULT FALSE;

-- Index for finding users with scheduled deletions
CREATE INDEX IF NOT EXISTS idx_users_deletion_scheduled
  ON auth.users(deletion_scheduled_at)
  WHERE deletion_scheduled_at IS NOT NULL;

-- ============================================================================
-- Add Privacy Fields to Portfolios Table
-- ============================================================================

-- Add privacy visibility field
ALTER TABLE portfolios
  ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public'
    CHECK (visibility IN ('public', 'unlisted', 'private'));

-- Add password protection
ALTER TABLE portfolios
  ADD COLUMN IF NOT EXISTS password_hash TEXT; -- bcrypt hash

-- Index for visibility queries
CREATE INDEX IF NOT EXISTS idx_portfolios_visibility ON portfolios(visibility);

-- ============================================================================
-- Analytics Anonymization View
-- ============================================================================

-- Create view for anonymized analytics (without PII)
CREATE OR REPLACE VIEW analytics_anonymized AS
SELECT
  id,
  portfolio_id,
  event_type,
  -- Hash IP and user agent
  encode(digest(ip_address::text, 'sha256'), 'hex') AS ip_hash,
  encode(digest(user_agent::text, 'sha256'), 'hex') AS user_agent_hash,
  country,
  referrer_domain, -- Only domain, not full URL
  created_at,
  date_trunc('day', created_at) AS date
FROM portfolio_analytics;

-- ============================================================================
-- Audit Log Cleanup Function
-- ============================================================================

-- Function to archive old audit logs (older than 1 year)
CREATE OR REPLACE FUNCTION archive_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- In production, this would move to cold storage
  -- For now, we keep them but mark as archived in metadata
  WITH updated AS (
    UPDATE audit_logs
    SET metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{archived}',
      'true'::jsonb
    )
    WHERE created_at < NOW() - INTERVAL '1 year'
      AND (metadata->>'archived')::boolean IS DISTINCT FROM true
    RETURNING *
  )
  SELECT COUNT(*) INTO archived_count FROM updated;

  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Deletion Request Processing Function
-- ============================================================================

-- Function to find pending deletions that are ready to process
CREATE OR REPLACE FUNCTION get_pending_deletions()
RETURNS TABLE (
  deletion_id UUID,
  user_id UUID,
  scheduled_for TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dr.id,
    dr.user_id,
    dr.scheduled_for
  FROM deletion_requests dr
  WHERE dr.status = 'pending'
    AND dr.scheduled_for <= NOW()
  ORDER BY dr.scheduled_for ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Trigger for Updated At Timestamp
-- ============================================================================

-- Trigger to update updated_at on deletion_requests
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deletion_requests_updated_at
  BEFORE UPDATE ON deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE audit_logs IS 'Audit trail for sensitive operations (Section 6.1)';
COMMENT ON TABLE deletion_requests IS 'GDPR/CCPA right to be forgotten (Section 6.3)';

COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (e.g., portfolio.deleted)';
COMMENT ON COLUMN audit_logs.ip_address IS 'Client IP address for security tracking';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context about the action';

COMMENT ON COLUMN deletion_requests.scheduled_for IS '30-day grace period expiry date';
COMMENT ON COLUMN deletion_requests.status IS 'pending, cancelled, or completed';

COMMENT ON COLUMN portfolios.visibility IS 'public, unlisted (no search), or private (password)';
COMMENT ON COLUMN portfolios.password_hash IS 'bcrypt hash for private portfolios';

-- ============================================================================
-- Grant Permissions
-- ============================================================================

-- Grant appropriate permissions to authenticated users
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON deletion_requests TO authenticated;

-- Service role needs full access for background jobs
GRANT ALL ON audit_logs TO service_role;
GRANT ALL ON deletion_requests TO service_role;

-- ============================================================================
-- End of Migration 018
-- ============================================================================
