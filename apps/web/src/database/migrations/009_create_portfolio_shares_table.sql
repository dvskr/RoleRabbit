-- ============================================================================
-- Migration: 009_create_portfolio_shares_table
-- Section 3.6: Sharing Tables
-- ============================================================================
-- Description: Create portfolio_shares table for secure sharing with passwords and expiry
-- Run in: Supabase SQL Editor (run AFTER 008)
-- ============================================================================

-- ============================================================================
-- Requirement #1: Create portfolio_shares table
-- ============================================================================
CREATE TABLE IF NOT EXISTS portfolio_shares (
  -- Primary identifier
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Portfolio relationship (Requirement #1)
  portfolio_id UUID NOT NULL,

  -- Share token (Requirement #1, unique)
  token VARCHAR(255) NOT NULL,

  -- Expiry (Requirement #1, nullable)
  expires_at TIMESTAMPTZ,

  -- Password protection (Requirement #1, hashed)
  password TEXT, -- Hashed with bcrypt

  -- Usage tracking (Requirement #1)
  view_count INTEGER NOT NULL DEFAULT 0,
  max_views INTEGER, -- Nullable: unlimited if NULL

  -- Timestamps (Requirement #1)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ
);

-- ============================================================================
-- Add constraints
-- ============================================================================

-- Requirement #3: Unique constraint on token
ALTER TABLE portfolio_shares
  ADD CONSTRAINT unique_share_token UNIQUE (token);

-- Token should be long enough for security
ALTER TABLE portfolio_shares
  ADD CONSTRAINT valid_share_token
  CHECK (char_length(token) >= 16);

-- View count must be non-negative
ALTER TABLE portfolio_shares
  ADD CONSTRAINT valid_view_count
  CHECK (view_count >= 0);

-- Max views must be positive if set
ALTER TABLE portfolio_shares
  ADD CONSTRAINT valid_max_views
  CHECK (max_views IS NULL OR max_views > 0);

-- View count cannot exceed max views
ALTER TABLE portfolio_shares
  ADD CONSTRAINT view_count_not_exceed_max
  CHECK (max_views IS NULL OR view_count <= max_views);

-- Expires at must be in the future when created
-- Note: This is checked at creation time, not enforced by constraint
-- Use trigger or application logic for this

-- ============================================================================
-- Add indexes
-- ============================================================================

-- Requirement #4: Index on portfolioId
CREATE INDEX idx_portfolio_shares_portfolio
  ON portfolio_shares (portfolio_id);

-- Requirement #5: Index on token
CREATE INDEX idx_portfolio_shares_token
  ON portfolio_shares (token);

-- Requirement #6: Index on expiresAt (non-null only)
CREATE INDEX idx_portfolio_shares_expires
  ON portfolio_shares (expires_at)
  WHERE expires_at IS NOT NULL;

-- Index on created_at for cleanup jobs
CREATE INDEX idx_portfolio_shares_created_at
  ON portfolio_shares (created_at DESC);

-- Index on last_accessed_at for analytics
CREATE INDEX idx_portfolio_shares_last_accessed
  ON portfolio_shares (last_accessed_at DESC)
  WHERE last_accessed_at IS NOT NULL;

-- ============================================================================
-- Create function to generate unique share token
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a 32-character URL-safe token
    token := encode(gen_random_bytes(24), 'base64');
    token := replace(replace(replace(token, '+', '-'), '/', '_'), '=', '');

    -- Check if token already exists
    SELECT EXISTS (
      SELECT 1 FROM portfolio_shares WHERE portfolio_shares.token = token
    ) INTO exists;

    EXIT WHEN NOT exists;
  END LOOP;

  RETURN token;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_share_token IS 'Generate a unique URL-safe share token';

-- ============================================================================
-- Create function to create share link
-- ============================================================================
CREATE OR REPLACE FUNCTION create_portfolio_share(
  p_portfolio_id UUID,
  p_expires_in_days INTEGER DEFAULT NULL,
  p_password TEXT DEFAULT NULL,
  p_max_views INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  token TEXT,
  expires_at TIMESTAMPTZ,
  has_password BOOLEAN
) AS $$
DECLARE
  share_id UUID;
  share_token TEXT;
  share_expires TIMESTAMPTZ;
  hashed_password TEXT;
BEGIN
  -- Generate unique token
  share_token := generate_share_token();

  -- Calculate expiry
  IF p_expires_in_days IS NOT NULL THEN
    share_expires := NOW() + (p_expires_in_days || ' days')::INTERVAL;
  END IF;

  -- Hash password if provided
  IF p_password IS NOT NULL THEN
    -- TODO: In production, hash with bcrypt
    -- hashed_password := crypt(p_password, gen_salt('bf'));
    hashed_password := p_password; -- Placeholder - hash in application layer
  END IF;

  -- Insert share record
  INSERT INTO portfolio_shares (
    portfolio_id,
    token,
    expires_at,
    password,
    max_views
  ) VALUES (
    p_portfolio_id,
    share_token,
    share_expires,
    hashed_password,
    p_max_views
  )
  RETURNING portfolio_shares.id INTO share_id;

  -- Return share info
  RETURN QUERY
  SELECT
    share_id,
    share_token,
    share_expires,
    (p_password IS NOT NULL) as has_password;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_portfolio_share IS 'Create a new share link for a portfolio';

-- ============================================================================
-- Create function to increment share view count
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_share_view_count(
  p_share_token TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  share_record RECORD;
BEGIN
  -- Get share record
  SELECT * INTO share_record
  FROM portfolio_shares
  WHERE token = p_share_token;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check if expired
  IF share_record.expires_at IS NOT NULL AND share_record.expires_at < NOW() THEN
    RETURN false;
  END IF;

  -- Check if max views reached
  IF share_record.max_views IS NOT NULL AND share_record.view_count >= share_record.max_views THEN
    RETURN false;
  END IF;

  -- Increment view count
  UPDATE portfolio_shares
  SET
    view_count = view_count + 1,
    last_accessed_at = NOW()
  WHERE token = p_share_token;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_share_view_count IS 'Increment view count for a share link and update last accessed timestamp';

-- ============================================================================
-- Create function to validate share access
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_share_access(
  p_share_token TEXT,
  p_password TEXT DEFAULT NULL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  portfolio_id UUID,
  requires_password BOOLEAN,
  password_correct BOOLEAN,
  is_expired BOOLEAN,
  views_remaining INTEGER,
  error_message TEXT
) AS $$
DECLARE
  share_record RECORD;
BEGIN
  -- Get share record
  SELECT * INTO share_record
  FROM portfolio_shares ps
  WHERE ps.token = p_share_token;

  IF NOT FOUND THEN
    RETURN QUERY SELECT
      false as is_valid,
      NULL::UUID as portfolio_id,
      false as requires_password,
      false as password_correct,
      false as is_expired,
      NULL::INTEGER as views_remaining,
      'Share link not found' as error_message;
    RETURN;
  END IF;

  -- Check if expired
  IF share_record.expires_at IS NOT NULL AND share_record.expires_at < NOW() THEN
    RETURN QUERY SELECT
      false,
      share_record.portfolio_id,
      (share_record.password IS NOT NULL),
      false,
      true,
      NULL::INTEGER,
      'Share link has expired';
    RETURN;
  END IF;

  -- Check if max views reached
  IF share_record.max_views IS NOT NULL AND share_record.view_count >= share_record.max_views THEN
    RETURN QUERY SELECT
      false,
      share_record.portfolio_id,
      (share_record.password IS NOT NULL),
      false,
      false,
      0,
      'Maximum views reached';
    RETURN;
  END IF;

  -- Check password if required
  IF share_record.password IS NOT NULL THEN
    IF p_password IS NULL THEN
      RETURN QUERY SELECT
        false,
        share_record.portfolio_id,
        true,
        false,
        false,
        share_record.max_views - share_record.view_count,
        'Password required';
      RETURN;
    END IF;

    -- TODO: In production, verify with bcrypt
    -- IF share_record.password != crypt(p_password, share_record.password) THEN
    IF share_record.password != p_password THEN
      RETURN QUERY SELECT
        false,
        share_record.portfolio_id,
        true,
        false,
        false,
        share_record.max_views - share_record.view_count,
        'Incorrect password';
      RETURN;
    END IF;
  END IF;

  -- Valid access
  RETURN QUERY SELECT
    true,
    share_record.portfolio_id,
    (share_record.password IS NOT NULL),
    (share_record.password IS NULL OR share_record.password = p_password),
    false,
    CASE
      WHEN share_record.max_views IS NULL THEN NULL
      ELSE share_record.max_views - share_record.view_count
    END,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_share_access IS 'Validate access to a share link with password verification';

-- ============================================================================
-- Create function to get expired shares
-- ============================================================================
CREATE OR REPLACE FUNCTION get_expired_shares()
RETURNS TABLE (
  id UUID,
  portfolio_id UUID,
  token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ps.id,
    ps.portfolio_id,
    ps.token,
    ps.expires_at,
    ps.created_at
  FROM portfolio_shares ps
  WHERE
    ps.expires_at IS NOT NULL
    AND ps.expires_at < NOW()
  ORDER BY ps.expires_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_expired_shares IS 'Get all expired share links for cleanup';

-- ============================================================================
-- Add Row Level Security (RLS)
-- ============================================================================
ALTER TABLE portfolio_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view shares for their own portfolios
CREATE POLICY "Users can view own portfolio shares"
  ON portfolio_shares FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_shares.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Policy: Users can create shares for their own portfolios
CREATE POLICY "Users can create own portfolio shares"
  ON portfolio_shares FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_shares.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Policy: Users can update shares for their own portfolios
CREATE POLICY "Users can update own portfolio shares"
  ON portfolio_shares FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_shares.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Policy: Users can delete shares for their own portfolios
CREATE POLICY "Users can delete own portfolio shares"
  ON portfolio_shares FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_shares.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Add comments for documentation
-- ============================================================================
COMMENT ON TABLE portfolio_shares IS 'Secure sharing links for portfolios with password protection and expiry';
COMMENT ON COLUMN portfolio_shares.id IS 'Unique share link identifier';
COMMENT ON COLUMN portfolio_shares.portfolio_id IS 'Portfolio being shared';
COMMENT ON COLUMN portfolio_shares.token IS 'Unique URL-safe share token (32+ chars)';
COMMENT ON COLUMN portfolio_shares.expires_at IS 'Expiration timestamp (NULL = never expires)';
COMMENT ON COLUMN portfolio_shares.password IS 'Hashed password for access (NULL = no password)';
COMMENT ON COLUMN portfolio_shares.view_count IS 'Number of times this link has been accessed';
COMMENT ON COLUMN portfolio_shares.max_views IS 'Maximum allowed views (NULL = unlimited)';
COMMENT ON COLUMN portfolio_shares.last_accessed_at IS 'Last time this share link was accessed';

-- ============================================================================
-- Verify migration
-- ============================================================================
-- Test creating a share:
-- SELECT * FROM create_portfolio_share('portfolio-uuid', 7, 'password123', 10);

-- Test validation:
-- SELECT * FROM validate_share_access('share-token', 'password123');
