-- ============================================================================
-- Migration: 013_create_portfolio_media_table
-- Section 3.9: Portfolio Media Table (DB-049)
-- ============================================================================
-- Description: Create portfolio_media table for better media management
-- Run in: Supabase SQL Editor (run AFTER migration 012)
-- ============================================================================

-- ============================================================================
-- Create media type enum
-- ============================================================================

CREATE TYPE media_type AS ENUM (
  'IMAGE',
  'VIDEO'
);

COMMENT ON TYPE media_type IS 'Type of media file';

-- ============================================================================
-- Create portfolio_media table
-- ============================================================================

CREATE TABLE portfolio_media (
  -- Primary identifier
  id VARCHAR(30) PRIMARY KEY DEFAULT ('pm_' || lower(replace(gen_random_uuid()::text, '-', ''))),

  -- Portfolio relationship
  portfolio_id UUID NOT NULL,

  -- Media details
  type media_type NOT NULL,
  url VARCHAR(500) NOT NULL,
  caption TEXT,

  -- Ordering
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Media metadata
  width INTEGER,
  height INTEGER,
  file_size INTEGER, -- Size in bytes
  mime_type VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT check_url_not_empty CHECK (length(trim(url)) > 0),
  CONSTRAINT check_display_order_positive CHECK (display_order >= 0)
);

-- ============================================================================
-- Add foreign key constraint
-- ============================================================================

ALTER TABLE portfolio_media
  ADD CONSTRAINT fk_portfolio_media_portfolio_id
  FOREIGN KEY (portfolio_id)
  REFERENCES portfolios (id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

COMMENT ON CONSTRAINT fk_portfolio_media_portfolio_id ON portfolio_media
  IS 'Cascade delete media when portfolio is deleted';

-- ============================================================================
-- Create indexes
-- ============================================================================

-- Index for querying media by portfolio (most common query)
CREATE INDEX idx_portfolio_media_portfolio ON portfolio_media(portfolio_id, display_order);

-- Index for querying by media type
CREATE INDEX idx_portfolio_media_type ON portfolio_media(type);

-- Index for updated_at for sorting
CREATE INDEX idx_portfolio_media_updated_at ON portfolio_media(updated_at DESC);

-- ============================================================================
-- Add table and column comments
-- ============================================================================

COMMENT ON TABLE portfolio_media IS 'Media files (images/videos) associated with portfolios';

COMMENT ON COLUMN portfolio_media.id IS 'Media identifier (pm_ prefix + cuid)';
COMMENT ON COLUMN portfolio_media.portfolio_id IS 'Parent portfolio ID';
COMMENT ON COLUMN portfolio_media.type IS 'Media type (IMAGE or VIDEO)';
COMMENT ON COLUMN portfolio_media.url IS 'Full URL to media file';
COMMENT ON COLUMN portfolio_media.caption IS 'Optional caption/alt text';
COMMENT ON COLUMN portfolio_media.display_order IS 'Order for displaying media (0-based)';
COMMENT ON COLUMN portfolio_media.width IS 'Media width in pixels';
COMMENT ON COLUMN portfolio_media.height IS 'Media height in pixels';
COMMENT ON COLUMN portfolio_media.file_size IS 'File size in bytes';
COMMENT ON COLUMN portfolio_media.mime_type IS 'MIME type (e.g., image/jpeg)';

-- ============================================================================
-- Create updated_at trigger
-- ============================================================================

CREATE TRIGGER update_portfolio_media_updated_at
  BEFORE UPDATE ON portfolio_media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE portfolio_media ENABLE ROW LEVEL SECURITY;

-- Users can view media for their own portfolios
CREATE POLICY "Users can view own portfolio media"
  ON portfolio_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_media.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Users can view media for published portfolios
CREATE POLICY "Anyone can view published portfolio media"
  ON portfolio_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_media.portfolio_id
      AND portfolios.is_published = true
      AND portfolios.visibility IN ('PUBLIC', 'UNLISTED')
    )
  );

-- Users can insert media for their own portfolios
CREATE POLICY "Users can insert own portfolio media"
  ON portfolio_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_media.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Users can update their own portfolio media
CREATE POLICY "Users can update own portfolio media"
  ON portfolio_media FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_media.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Users can delete their own portfolio media
CREATE POLICY "Users can delete own portfolio media"
  ON portfolio_media FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_media.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Helper functions
-- ============================================================================

-- Function to reorder media after deletion
CREATE OR REPLACE FUNCTION reorder_portfolio_media()
RETURNS TRIGGER AS $$
BEGIN
  -- Reorder remaining media for the portfolio
  WITH ordered_media AS (
    SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY display_order, created_at) - 1 AS new_order
    FROM portfolio_media
    WHERE portfolio_id = OLD.portfolio_id
  )
  UPDATE portfolio_media pm
  SET display_order = om.new_order
  FROM ordered_media om
  WHERE pm.id = om.id
    AND pm.display_order != om.new_order;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reorder_portfolio_media() IS 'Reorder media after deletion to maintain sequential order';

CREATE TRIGGER reorder_media_on_delete
  AFTER DELETE ON portfolio_media
  FOR EACH ROW
  EXECUTE FUNCTION reorder_portfolio_media();

-- Function to get media count for a portfolio
CREATE OR REPLACE FUNCTION get_portfolio_media_count(p_portfolio_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM portfolio_media
  WHERE portfolio_id = p_portfolio_id;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION get_portfolio_media_count(UUID) IS 'Get total media count for a portfolio';

-- ============================================================================
-- Verification queries
-- ============================================================================
-- Query to verify table structure:
-- SELECT
--   column_name,
--   data_type,
--   character_maximum_length,
--   is_nullable,
--   column_default
-- FROM information_schema.columns
-- WHERE table_name = 'portfolio_media'
-- ORDER BY ordinal_position;
--
-- Query to verify RLS policies:
-- SELECT
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd
-- FROM pg_policies
-- WHERE tablename = 'portfolio_media'
-- ORDER BY policyname;
