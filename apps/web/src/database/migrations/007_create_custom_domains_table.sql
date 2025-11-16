-- ============================================================================
-- Migration: 007_create_custom_domains_table
-- Section 3.4: Custom Domain Tables
-- ============================================================================
-- Description: Create custom_domains table for custom domain management
-- Run in: Supabase SQL Editor (run AFTER 006_create_enums.sql)
-- ============================================================================

-- ============================================================================
-- Requirement #1: Create custom_domains table
-- ============================================================================
CREATE TABLE IF NOT EXISTS custom_domains (
  -- Primary identifier
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Portfolio relationship (Requirement #1)
  portfolio_id UUID NOT NULL,

  -- Domain information (Requirement #1)
  domain VARCHAR(255) NOT NULL,

  -- Verification (Requirement #1)
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_token VARCHAR(255) NOT NULL,

  -- SSL/TLS (Requirement #1)
  ssl_status ssl_status NOT NULL DEFAULT 'PENDING',
  ssl_cert_path TEXT,
  ssl_expires_at TIMESTAMPTZ,

  -- DNS configuration (Requirement #1)
  dns_records JSONB DEFAULT '[]',

  -- Status tracking (Requirement #1)
  last_checked_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,

  -- Timestamps (Requirement #1)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Add constraints
-- ============================================================================

-- Requirement #3: Unique constraint on domain
ALTER TABLE custom_domains
  ADD CONSTRAINT unique_custom_domain UNIQUE (domain);

-- Domain format validation
ALTER TABLE custom_domains
  ADD CONSTRAINT valid_domain_format
  CHECK (domain ~ '^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$');

-- Verification token should not be empty
ALTER TABLE custom_domains
  ADD CONSTRAINT valid_verification_token
  CHECK (char_length(verification_token) >= 10);

-- ============================================================================
-- Add indexes
-- ============================================================================

-- Requirement #4: Index on portfolioId
CREATE INDEX idx_custom_domains_portfolio
  ON custom_domains (portfolio_id);

-- Requirement #5: Index on domain
CREATE INDEX idx_custom_domains_domain
  ON custom_domains (domain);

-- Requirement #6: Composite index on (isVerified, sslStatus)
CREATE INDEX idx_custom_domains_verified
  ON custom_domains (is_verified, ssl_status);

-- Index on verification token for lookup
CREATE INDEX idx_custom_domains_verification_token
  ON custom_domains (verification_token);

-- Index on SSL expiry for renewal checks
CREATE INDEX idx_custom_domains_ssl_expires
  ON custom_domains (ssl_expires_at)
  WHERE ssl_expires_at IS NOT NULL;

-- Index on last_checked_at for periodic verification
CREATE INDEX idx_custom_domains_last_checked
  ON custom_domains (last_checked_at)
  WHERE is_verified = true;

-- ============================================================================
-- Create updated_at trigger
-- ============================================================================
CREATE TRIGGER update_custom_domains_updated_at
  BEFORE UPDATE ON custom_domains
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Create function to verify domain
-- ============================================================================
CREATE OR REPLACE FUNCTION verify_custom_domain(
  domain_id UUID,
  verified BOOLEAN DEFAULT true
)
RETURNS BOOLEAN AS $$
BEGIN
  IF verified THEN
    UPDATE custom_domains
    SET
      is_verified = true,
      verified_at = NOW(),
      last_checked_at = NOW(),
      updated_at = NOW()
    WHERE id = domain_id;
  ELSE
    UPDATE custom_domains
    SET
      is_verified = false,
      verified_at = NULL,
      last_checked_at = NOW(),
      updated_at = NOW()
    WHERE id = domain_id;
  END IF;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION verify_custom_domain IS 'Mark a custom domain as verified or unverified';

-- ============================================================================
-- Create function to update SSL status
-- ============================================================================
CREATE OR REPLACE FUNCTION update_domain_ssl_status(
  domain_id UUID,
  new_status ssl_status,
  cert_path TEXT DEFAULT NULL,
  expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE custom_domains
  SET
    ssl_status = new_status,
    ssl_cert_path = COALESCE(cert_path, ssl_cert_path),
    ssl_expires_at = COALESCE(expires_at, ssl_expires_at),
    updated_at = NOW()
  WHERE id = domain_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_domain_ssl_status IS 'Update SSL certificate status and metadata for a domain';

-- ============================================================================
-- Create function to get domains needing SSL renewal
-- ============================================================================
CREATE OR REPLACE FUNCTION get_domains_needing_ssl_renewal(
  days_before_expiry INTEGER DEFAULT 30
)
RETURNS TABLE (
  id UUID,
  portfolio_id UUID,
  domain VARCHAR(255),
  ssl_expires_at TIMESTAMPTZ,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cd.id,
    cd.portfolio_id,
    cd.domain,
    cd.ssl_expires_at,
    EXTRACT(DAY FROM cd.ssl_expires_at - NOW())::INTEGER as days_until_expiry
  FROM custom_domains cd
  WHERE
    cd.is_verified = true
    AND cd.ssl_status = 'ACTIVE'
    AND cd.ssl_expires_at IS NOT NULL
    AND cd.ssl_expires_at <= NOW() + (days_before_expiry || ' days')::INTERVAL
    AND cd.ssl_expires_at > NOW()
  ORDER BY cd.ssl_expires_at ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_domains_needing_ssl_renewal IS 'Get list of domains whose SSL certificates will expire within specified days';

-- ============================================================================
-- Create function to get unverified domains
-- ============================================================================
CREATE OR REPLACE FUNCTION get_unverified_domains(
  hours_since_creation INTEGER DEFAULT 24
)
RETURNS TABLE (
  id UUID,
  portfolio_id UUID,
  domain VARCHAR(255),
  verification_token VARCHAR(255),
  created_at TIMESTAMPTZ,
  hours_old INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cd.id,
    cd.portfolio_id,
    cd.domain,
    cd.verification_token,
    cd.created_at,
    EXTRACT(HOUR FROM NOW() - cd.created_at)::INTEGER as hours_old
  FROM custom_domains cd
  WHERE
    cd.is_verified = false
    AND cd.created_at >= NOW() - (hours_since_creation || ' hours')::INTERVAL
  ORDER BY cd.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_unverified_domains IS 'Get list of unverified domains within specified hours';

-- ============================================================================
-- Add Row Level Security (RLS)
-- ============================================================================
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view domains for their own portfolios
CREATE POLICY "Users can view own portfolio domains"
  ON custom_domains FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = custom_domains.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Policy: Users can create domains for their own portfolios
CREATE POLICY "Users can create own portfolio domains"
  ON custom_domains FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = custom_domains.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Policy: Users can update domains for their own portfolios
CREATE POLICY "Users can update own portfolio domains"
  ON custom_domains FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = custom_domains.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Policy: Users can delete domains for their own portfolios
CREATE POLICY "Users can delete own portfolio domains"
  ON custom_domains FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = custom_domains.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Add comments for documentation
-- ============================================================================
COMMENT ON TABLE custom_domains IS 'Custom domains configured for portfolios with DNS and SSL management';
COMMENT ON COLUMN custom_domains.id IS 'Unique domain configuration identifier';
COMMENT ON COLUMN custom_domains.portfolio_id IS 'Portfolio this domain points to';
COMMENT ON COLUMN custom_domains.domain IS 'Fully qualified domain name (e.g., example.com)';
COMMENT ON COLUMN custom_domains.is_verified IS 'Whether domain ownership has been verified';
COMMENT ON COLUMN custom_domains.verification_token IS 'Token to add in DNS TXT record for verification';
COMMENT ON COLUMN custom_domains.ssl_status IS 'SSL certificate status (PENDING, PROVISIONING, ACTIVE, FAILED, EXPIRED)';
COMMENT ON COLUMN custom_domains.ssl_cert_path IS 'Path to SSL certificate file';
COMMENT ON COLUMN custom_domains.ssl_expires_at IS 'SSL certificate expiration timestamp';
COMMENT ON COLUMN custom_domains.dns_records IS 'DNS records configuration (A, CNAME, TXT, etc.) in JSON format';
COMMENT ON COLUMN custom_domains.last_checked_at IS 'Last time domain verification was checked';
COMMENT ON COLUMN custom_domains.verified_at IS 'Timestamp when domain was verified';

-- ============================================================================
-- Verify migration
-- ============================================================================
-- SELECT COUNT(*) as domain_count FROM custom_domains;
-- SELECT * FROM get_domains_needing_ssl_renewal(30);
-- SELECT * FROM get_unverified_domains(24);
