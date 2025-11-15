-- ============================================================================
-- Migration: 006_create_enums
-- Section 3.8: Enums
-- ============================================================================
-- Description: Create all enum types used across the database
-- Run in: Supabase SQL Editor (run BEFORE migrations 007-010)
-- ============================================================================

-- Note: Some enums were already created in earlier migrations:
-- - portfolio_visibility (in 001)
-- - portfolio_build_status (in 001)
-- - template_category (in 002)

-- ============================================================================
-- Requirement #1: PortfolioVisibility enum
-- Update existing enum to include PASSWORD_PROTECTED
-- ============================================================================
-- Since we already have portfolio_visibility from migration 001 with values:
-- PRIVATE, PUBLIC, UNLISTED
-- We need to add PASSWORD_PROTECTED

-- Drop and recreate with new value (safe if no data yet)
-- If you have existing data, use ALTER TYPE instead
DROP TYPE IF EXISTS portfolio_visibility CASCADE;
CREATE TYPE portfolio_visibility AS ENUM (
  'PRIVATE',
  'PUBLIC',
  'UNLISTED',
  'PASSWORD_PROTECTED'
);

COMMENT ON TYPE portfolio_visibility IS 'Portfolio visibility levels: PRIVATE (owner only), PUBLIC (anyone), UNLISTED (anyone with link), PASSWORD_PROTECTED (requires password)';

-- ============================================================================
-- Requirement #3: SSLStatus enum
-- ============================================================================
CREATE TYPE ssl_status AS ENUM (
  'PENDING',
  'PROVISIONING',
  'ACTIVE',
  'FAILED',
  'EXPIRED'
);

COMMENT ON TYPE ssl_status IS 'SSL certificate status for custom domains';

-- ============================================================================
-- Requirement #4: DeploymentStatus enum
-- ============================================================================
CREATE TYPE deployment_status AS ENUM (
  'QUEUED',
  'BUILDING',
  'DEPLOYING',
  'DEPLOYED',
  'FAILED',
  'ROLLED_BACK'
);

COMMENT ON TYPE deployment_status IS 'Portfolio deployment status through the deployment pipeline';

-- ============================================================================
-- Requirement #5: PortfolioCategory enum
-- ============================================================================
CREATE TYPE portfolio_category AS ENUM (
  'DEVELOPER',
  'DESIGNER',
  'MARKETING',
  'BUSINESS',
  'CREATIVE',
  'ACADEMIC',
  'GENERAL'
);

COMMENT ON TYPE portfolio_category IS 'Portfolio category for classification and filtering';

-- ============================================================================
-- Note: portfolio_build_status already exists from migration 001
-- Values: PENDING, BUILDING, SUCCESS, FAILED
-- This is different from deployment_status which tracks the full deployment lifecycle
-- ============================================================================

-- ============================================================================
-- Verify enums
-- ============================================================================
-- SELECT
--   t.typname as enum_name,
--   e.enumlabel as enum_value,
--   e.enumsortorder as sort_order
-- FROM pg_type t
-- JOIN pg_enum e ON t.oid = e.enumtypid
-- WHERE t.typname IN (
--   'portfolio_visibility',
--   'portfolio_build_status',
--   'ssl_status',
--   'deployment_status',
--   'portfolio_category',
--   'template_category'
-- )
-- ORDER BY enum_name, sort_order;
