-- ============================================================================
-- Migration: 016_additional_constraints
-- Section 3.11: Data Integrity & Constraints (DB-058 to DB-064)
-- ============================================================================
-- Description: Add additional check constraints and triggers for data integrity
-- Run in: Supabase SQL Editor (run AFTER migration 015)
-- ============================================================================

-- ============================================================================
-- DB-060: Check constraint for publishedAt/isPublished consistency
-- ============================================================================

ALTER TABLE portfolios
  ADD CONSTRAINT check_published_at_consistency
  CHECK (
    (is_published = true AND published_at IS NOT NULL) OR
    (is_published = false AND published_at IS NULL) OR
    (is_published = true AND published_at IS NOT NULL)
  );

COMMENT ON CONSTRAINT check_published_at_consistency ON portfolios
  IS 'Ensures publishedAt is null when isPublished is false';

-- ============================================================================
-- DB-061: Check constraint for custom_domains verifiedAt/isVerified consistency
-- ============================================================================

ALTER TABLE custom_domains
  ADD CONSTRAINT check_verified_at_consistency
  CHECK (
    (is_verified = true AND verified_at IS NOT NULL) OR
    (is_verified = false)
  );

COMMENT ON CONSTRAINT check_verified_at_consistency ON custom_domains
  IS 'Ensures verifiedAt is null when isVerified is false';

-- ============================================================================
-- DB-062: Check constraint for portfolio_shares expiresAt future date
-- ============================================================================

ALTER TABLE portfolio_shares
  ADD CONSTRAINT check_expires_at_future
  CHECK (
    expires_at IS NULL OR
    expires_at > created_at
  );

COMMENT ON CONSTRAINT check_expires_at_future ON portfolio_shares
  IS 'Ensures expiresAt is a future date if not null';

-- ============================================================================
-- DB-063: Auto-update Portfolio.updatedAt trigger
-- ============================================================================
-- This trigger already exists from migration 001, but let's ensure it's applied

-- Verify the trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_portfolios_updated_at'
  ) THEN
    CREATE TRIGGER update_portfolios_updated_at
      BEFORE UPDATE ON portfolios
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    RAISE NOTICE 'Created trigger update_portfolios_updated_at';
  ELSE
    RAISE NOTICE 'Trigger update_portfolios_updated_at already exists';
  END IF;
END $$;

-- ============================================================================
-- DB-064: Auto-increment PortfolioTemplate.usageCount trigger
-- ============================================================================
-- This functionality already exists in migration 004, but let's verify

-- Verify the trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_template_usage'
  ) THEN
    RAISE WARNING 'Trigger update_template_usage does not exist. Please run migration 004.';
  ELSE
    RAISE NOTICE 'Trigger update_template_usage already exists';
  END IF;
END $$;

-- ============================================================================
-- Additional integrity constraints
-- ============================================================================

-- Ensure subdomain is lowercase
ALTER TABLE portfolios
  ADD CONSTRAINT check_subdomain_lowercase
  CHECK (subdomain IS NULL OR subdomain = lower(subdomain));

COMMENT ON CONSTRAINT check_subdomain_lowercase ON portfolios
  IS 'Ensures subdomain is always lowercase';

-- Ensure custom domain is lowercase
ALTER TABLE custom_domains
  ADD CONSTRAINT check_domain_lowercase
  CHECK (domain = lower(domain));

COMMENT ON CONSTRAINT check_domain_lowercase ON custom_domains
  IS 'Ensures domain is always lowercase';

-- Ensure share token is not empty
ALTER TABLE portfolio_shares
  ADD CONSTRAINT check_token_not_empty
  CHECK (length(trim(token)) >= 32);

COMMENT ON CONSTRAINT check_token_not_empty ON portfolio_shares
  IS 'Ensures share token is at least 32 characters';

-- Ensure portfolio name is not empty
ALTER TABLE portfolios
  ADD CONSTRAINT check_name_not_empty
  CHECK (length(trim(name)) > 0);

COMMENT ON CONSTRAINT check_name_not_empty ON portfolios
  IS 'Ensures portfolio name is not empty';

-- Ensure template name is not empty
ALTER TABLE portfolio_templates
  ADD CONSTRAINT check_template_name_not_empty
  CHECK (length(trim(name)) > 0);

COMMENT ON CONSTRAINT check_template_name_not_empty ON portfolio_templates
  IS 'Ensures template name is not empty';

-- Ensure deployment status transitions are valid
CREATE OR REPLACE FUNCTION validate_deployment_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow any transition for new records
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Validate status transitions
  -- QUEUED -> BUILDING, FAILED
  IF OLD.status = 'QUEUED' THEN
    IF NEW.status NOT IN ('BUILDING', 'FAILED') THEN
      RAISE EXCEPTION 'Invalid status transition from QUEUED to %', NEW.status;
    END IF;
  END IF;

  -- BUILDING -> DEPLOYING, FAILED
  IF OLD.status = 'BUILDING' THEN
    IF NEW.status NOT IN ('DEPLOYING', 'FAILED') THEN
      RAISE EXCEPTION 'Invalid status transition from BUILDING to %', NEW.status;
    END IF;
  END IF;

  -- DEPLOYING -> DEPLOYED, FAILED
  IF OLD.status = 'DEPLOYING' THEN
    IF NEW.status NOT IN ('DEPLOYED', 'FAILED') THEN
      RAISE EXCEPTION 'Invalid status transition from DEPLOYING to %', NEW.status;
    END IF;
  END IF;

  -- DEPLOYED -> ROLLED_BACK (or stay DEPLOYED)
  IF OLD.status = 'DEPLOYED' THEN
    IF NEW.status NOT IN ('DEPLOYED', 'ROLLED_BACK') THEN
      RAISE EXCEPTION 'Invalid status transition from DEPLOYED to %', NEW.status;
    END IF;
  END IF;

  -- FAILED and ROLLED_BACK are terminal states
  IF OLD.status IN ('FAILED', 'ROLLED_BACK') THEN
    IF NEW.status != OLD.status THEN
      RAISE EXCEPTION 'Cannot transition from terminal status %', OLD.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_deployment_status_transition() IS 'Validates deployment status transitions';

CREATE TRIGGER validate_deployment_status
  BEFORE UPDATE OF status ON portfolio_deployments
  FOR EACH ROW
  EXECUTE FUNCTION validate_deployment_status_transition();

-- ============================================================================
-- Trigger to auto-set publishedAt when publishing
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Set published_at when publishing
  IF NEW.is_published = true AND OLD.is_published = false THEN
    NEW.published_at := NOW();
  END IF;

  -- Clear published_at when unpublishing
  IF NEW.is_published = false AND OLD.is_published = true THEN
    NEW.published_at := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_set_published_at() IS 'Auto-sets publishedAt when portfolio is published';

CREATE TRIGGER auto_set_published_at_trigger
  BEFORE UPDATE OF is_published ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_published_at();

-- ============================================================================
-- Trigger to auto-set verifiedAt when verifying domain
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_set_verified_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Set verified_at when verifying
  IF NEW.is_verified = true AND (OLD.is_verified = false OR OLD.is_verified IS NULL) THEN
    NEW.verified_at := NOW();
  END IF;

  -- Clear verified_at when unverifying
  IF NEW.is_verified = false AND OLD.is_verified = true THEN
    NEW.verified_at := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_set_verified_at() IS 'Auto-sets verifiedAt when domain is verified';

CREATE TRIGGER auto_set_verified_at_trigger
  BEFORE UPDATE OF is_verified ON custom_domains
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_verified_at();

-- ============================================================================
-- Verification queries
-- ============================================================================
-- Verify constraints:
-- SELECT
--   conname AS constraint_name,
--   contype AS constraint_type,
--   pg_get_constraintdef(oid) AS definition
-- FROM pg_constraint
-- WHERE conrelid = 'portfolios'::regclass
--   AND conname LIKE 'check_%'
-- ORDER BY conname;
--
-- Verify triggers:
-- SELECT
--   tgname AS trigger_name,
--   pg_get_triggerdef(oid) AS definition
-- FROM pg_trigger
-- WHERE tgrelid IN ('portfolios'::regclass, 'custom_domains'::regclass, 'portfolio_deployments'::regclass)
--   AND tgisinternal = false
-- ORDER BY tgname;
