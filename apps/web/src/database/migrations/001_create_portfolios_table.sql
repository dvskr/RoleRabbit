-- ============================================================================
-- Migration: 001_create_portfolios_table
-- Section 3.1: Core Portfolio Tables
-- ============================================================================
-- Description: Create portfolios table with all columns, constraints, and indexes
-- Run in: Supabase SQL Editor
-- ============================================================================

-- Create enum types
-- Requirement: visibility enum
CREATE TYPE portfolio_visibility AS ENUM ('PRIVATE', 'PUBLIC', 'UNLISTED');

-- Requirement: buildStatus enum
CREATE TYPE portfolio_build_status AS ENUM ('PENDING', 'BUILDING', 'SUCCESS', 'FAILED');

-- ============================================================================
-- Create portfolios table
-- Requirement #1: Create portfolios table with all specified columns
-- ============================================================================
CREATE TABLE IF NOT EXISTS portfolios (
  -- Primary identifier
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User relationship (Requirement #1)
  user_id UUID NOT NULL,

  -- Basic information (Requirement #1)
  name VARCHAR(200) NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
  slug VARCHAR(200) NOT NULL,
  description TEXT,

  -- Portfolio data (Requirement #1)
  data JSONB NOT NULL DEFAULT '{}',

  -- Template relationship (Requirement #1)
  template_id UUID,

  -- Publishing status (Requirement #1)
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_draft BOOLEAN NOT NULL DEFAULT true,
  visibility portfolio_visibility NOT NULL DEFAULT 'PRIVATE',

  -- Custom domain (Requirement #1)
  subdomain VARCHAR(63),

  -- SEO metadata (Requirement #1)
  meta_title VARCHAR(255),
  meta_description TEXT,
  og_image VARCHAR(500),

  -- Analytics (Requirement #1)
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,

  -- Build information (Requirement #1)
  build_status portfolio_build_status NOT NULL DEFAULT 'PENDING',
  build_artifact_path VARCHAR(500),
  last_build_at TIMESTAMPTZ,

  -- Timestamps (Requirement #1)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  -- Audit fields (Requirement #1)
  created_by UUID,
  updated_by UUID
);

-- ============================================================================
-- Add constraints
-- ============================================================================

-- Requirement #4: Unique constraint (userId, slug)
ALTER TABLE portfolios
  ADD CONSTRAINT unique_user_slug UNIQUE (user_id, slug);

-- Requirement #5: Unique constraint on subdomain (excluding deleted and null)
CREATE UNIQUE INDEX unique_active_subdomain
  ON portfolios (subdomain)
  WHERE subdomain IS NOT NULL AND deleted_at IS NULL;

-- Requirement #6: Check constraint for subdomain regex
-- Subdomain must be 3-63 chars, lowercase letters, numbers, hyphens
-- Cannot start or end with hyphen
ALTER TABLE portfolios
  ADD CONSTRAINT valid_subdomain_format
  CHECK (
    subdomain IS NULL OR (
      subdomain ~ '^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$' AND
      char_length(subdomain) >= 3 AND
      char_length(subdomain) <= 63
    )
  );

-- ============================================================================
-- Add indexes
-- ============================================================================

-- Requirement #7: Composite index on (userId, isPublished)
CREATE INDEX idx_portfolios_user_published
  ON portfolios (user_id, is_published);

-- Requirement #8: Index on slug
CREATE INDEX idx_portfolios_slug
  ON portfolios (slug);

-- Requirement #9: Index on subdomain (non-null only)
CREATE INDEX idx_portfolios_subdomain
  ON portfolios (subdomain)
  WHERE subdomain IS NOT NULL;

-- Requirement #10: Index on createdAt (descending for recent first)
CREATE INDEX idx_portfolios_created_at
  ON portfolios (created_at DESC);

-- Requirement #11: Index on updatedAt (descending for recent first)
CREATE INDEX idx_portfolios_updated_at
  ON portfolios (updated_at DESC);

-- Additional recommended indexes
CREATE INDEX idx_portfolios_user_id
  ON portfolios (user_id);

CREATE INDEX idx_portfolios_template_id
  ON portfolios (template_id)
  WHERE template_id IS NOT NULL;

CREATE INDEX idx_portfolios_build_status
  ON portfolios (build_status);

CREATE INDEX idx_portfolios_deleted_at
  ON portfolios (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- ============================================================================
-- Create updated_at trigger
-- Automatically update updated_at timestamp on row modification
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Add Row Level Security (RLS)
-- ============================================================================
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own portfolios
CREATE POLICY "Users can view own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id OR is_published = true);

-- Policy: Users can insert their own portfolios
CREATE POLICY "Users can create own portfolios"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own portfolios
CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own portfolios (soft delete)
CREATE POLICY "Users can delete own portfolios"
  ON portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Public can view published portfolios
CREATE POLICY "Public can view published portfolios"
  ON portfolios FOR SELECT
  USING (is_published = true AND visibility = 'PUBLIC' AND deleted_at IS NULL);

-- ============================================================================
-- Add comments for documentation
-- ============================================================================
COMMENT ON TABLE portfolios IS 'Stores user portfolio data with versioning and publishing support';
COMMENT ON COLUMN portfolios.id IS 'Unique portfolio identifier (UUID)';
COMMENT ON COLUMN portfolios.user_id IS 'Owner of the portfolio (foreign key to auth.users)';
COMMENT ON COLUMN portfolios.name IS 'Portfolio name (1-200 characters)';
COMMENT ON COLUMN portfolios.slug IS 'URL-friendly identifier unique per user';
COMMENT ON COLUMN portfolios.subdomain IS 'Custom subdomain (e.g., "john" for john.rolerabbit.com)';
COMMENT ON COLUMN portfolios.data IS 'Portfolio content in JSON format';
COMMENT ON COLUMN portfolios.template_id IS 'Template used for this portfolio';
COMMENT ON COLUMN portfolios.build_status IS 'Status of the last build (PENDING, BUILDING, SUCCESS, FAILED)';
COMMENT ON COLUMN portfolios.deleted_at IS 'Soft delete timestamp (NULL if not deleted)';

-- ============================================================================
-- Verify migration
-- ============================================================================
-- SELECT
--   column_name,
--   data_type,
--   is_nullable,
--   column_default
-- FROM information_schema.columns
-- WHERE table_name = 'portfolios'
-- ORDER BY ordinal_position;
