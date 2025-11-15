-- Migration 019: Create Moderation and Security Tables
-- Sections 6.4, 6.5, 6.6

-- ============================================================================
-- Content Moderation Tables
-- ============================================================================

-- Review Queue (Section 6.4)
CREATE TABLE IF NOT EXISTS review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL DEFAULT 'portfolio',
  content_snapshot JSONB NOT NULL,
  moderation_result JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'escalated')),
  priority VARCHAR(20) NOT NULL DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  review_decision VARCHAR(50),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_queue_status ON review_queue(status);
CREATE INDEX idx_review_queue_priority ON review_queue(priority);
CREATE INDEX idx_review_queue_user_id ON review_queue(user_id);
CREATE INDEX idx_review_queue_pending ON review_queue(status, priority) WHERE status = 'pending';

-- Abuse Reports (Section 6.4)
CREATE TABLE IF NOT EXISTS abuse_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolution TEXT,
  action_taken VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_abuse_reports_status ON abuse_reports(status);
CREATE INDEX idx_abuse_reports_reporter ON abuse_reports(reporter_id);
CREATE INDEX idx_abuse_reports_reported_user ON abuse_reports(reported_user_id);
CREATE INDEX idx_abuse_reports_portfolio ON abuse_reports(portfolio_id);

-- ============================================================================
-- Security Logging Tables (Section 6.5)
-- ============================================================================

-- Security Logs
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  resource VARCHAR(100),
  resource_id VARCHAR(255),
  action VARCHAR(100),
  result VARCHAR(20) NOT NULL CHECK (result IN ('success', 'failure')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX idx_security_logs_ip_address ON security_logs(ip_address);
CREATE INDEX idx_security_logs_result ON security_logs(result);

-- Composite indexes for common queries
CREATE INDEX idx_security_logs_user_event ON security_logs(user_id, event_type, created_at DESC);
CREATE INDEX idx_security_logs_ip_event ON security_logs(ip_address, event_type, created_at DESC);

-- ============================================================================
-- Rate Limiting and Activity Tracking (Section 6.6)
-- ============================================================================

-- User Activities
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_activity_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX idx_user_activities_user_activity ON user_activities(user_id, activity_type, created_at DESC);

-- Account Restrictions
CREATE TABLE IF NOT EXISTS account_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restriction_type VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_account_restrictions_user_id ON account_restrictions(user_id);
CREATE INDEX idx_account_restrictions_expires_at ON account_restrictions(expires_at);
CREATE INDEX idx_account_restrictions_active ON account_restrictions(user_id, expires_at) WHERE expires_at > NOW();

-- ============================================================================
-- Alter Existing Tables
-- ============================================================================

-- Add moderation fields to portfolios
ALTER TABLE portfolios
  ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- Add user status fields
ALTER TABLE auth.users
  ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ban_reason TEXT,
  ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS suspend_until TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS suspend_reason TEXT;

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_queue_updated_at
  BEFORE UPDATE ON review_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER abuse_reports_updated_at
  BEFORE UPDATE ON abuse_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Cleanup old security logs (keep for 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM security_logs
  WHERE created_at < NOW() - INTERVAL '1 year';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old user activities (keep for 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_activities()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_activities
  WHERE created_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Row Level Security
-- ============================================================================

-- Review Queue RLS
ALTER TABLE review_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY review_queue_admin_all ON review_queue
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Abuse Reports RLS
ALTER TABLE abuse_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY abuse_reports_reporter_view ON abuse_reports
  FOR SELECT
  USING (reporter_id = auth.uid());

CREATE POLICY abuse_reports_user_insert ON abuse_reports
  FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY abuse_reports_admin_all ON abuse_reports
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Security Logs RLS
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY security_logs_user_view ON security_logs
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY security_logs_admin_all ON security_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User Activities RLS
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_activities_own ON user_activities
  FOR SELECT
  USING (user_id = auth.uid());

-- Account Restrictions RLS
ALTER TABLE account_restrictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_restrictions_own ON account_restrictions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY account_restrictions_admin_all ON account_restrictions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE review_queue IS 'Manual review queue for flagged content (Section 6.4)';
COMMENT ON TABLE abuse_reports IS 'User-submitted abuse reports (Section 6.4)';
COMMENT ON TABLE security_logs IS 'Security event logs for authentication, authorization, etc. (Section 6.5)';
COMMENT ON TABLE user_activities IS 'User activity tracking for unusual pattern detection (Section 6.6)';
COMMENT ON TABLE account_restrictions IS 'Account-level restrictions for abuse prevention (Section 6.6)';

-- ============================================================================
-- Grant Permissions
-- ============================================================================

GRANT SELECT, INSERT ON review_queue TO authenticated;
GRANT SELECT, INSERT ON abuse_reports TO authenticated;
GRANT SELECT ON security_logs TO authenticated;
GRANT SELECT ON user_activities TO authenticated;
GRANT SELECT ON account_restrictions TO authenticated;

GRANT ALL ON review_queue TO service_role;
GRANT ALL ON abuse_reports TO service_role;
GRANT ALL ON security_logs TO service_role;
GRANT ALL ON user_activities TO service_role;
GRANT ALL ON account_restrictions TO service_role;

-- ============================================================================
-- End of Migration 019
-- ============================================================================
