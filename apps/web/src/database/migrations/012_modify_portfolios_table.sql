-- ============================================================================
-- Migration: 012_modify_portfolios_table
-- Section 3.9: Existing Table Modifications
-- ============================================================================
-- Description: Add new columns to portfolios table and create availability status enum
-- Run in: Supabase SQL Editor (run AFTER migrations 001-011)
-- ============================================================================

-- ============================================================================
-- Create availability status enum
-- ============================================================================

CREATE TYPE availability_status AS ENUM (
  'AVAILABLE',
  'NOT_AVAILABLE',
  'OPEN_TO_OPPORTUNITIES'
);

COMMENT ON TYPE availability_status IS 'User availability status for job opportunities';

-- ============================================================================
-- Add new columns to portfolios table
-- ============================================================================

-- DB-046: Add tagline column
ALTER TABLE portfolios
  ADD COLUMN tagline VARCHAR(200);

COMMENT ON COLUMN portfolios.tagline IS 'Short tagline or headline (max 200 chars)';

-- DB-047: Add location column
ALTER TABLE portfolios
  ADD COLUMN location VARCHAR(100);

COMMENT ON COLUMN portfolios.location IS 'User location (city, country)';

-- DB-048: Add availability_status column
ALTER TABLE portfolios
  ADD COLUMN availability_status availability_status;

COMMENT ON COLUMN portfolios.availability_status IS 'Current availability for opportunities';

-- ============================================================================
-- Create indexes for new columns
-- ============================================================================

-- Index for location queries (e.g., finding portfolios by location)
CREATE INDEX idx_portfolios_location ON portfolios(location)
  WHERE location IS NOT NULL AND deleted_at IS NULL;

-- Index for availability status queries
CREATE INDEX idx_portfolios_availability ON portfolios(availability_status)
  WHERE availability_status IS NOT NULL AND deleted_at IS NULL;

-- ============================================================================
-- Verify modifications
-- ============================================================================
-- Query to verify new columns:
-- SELECT
--   column_name,
--   data_type,
--   character_maximum_length,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'portfolios'
--   AND column_name IN ('tagline', 'location', 'availability_status')
-- ORDER BY column_name;
