-- ============================================================================
-- Migration: 014_data_migrations
-- Section 3.10: Data Migrations
-- ============================================================================
-- Description: Migrate existing data and backfill new columns
-- Run in: Supabase SQL Editor (run AFTER migrations 012-013)
-- WARNING: Review and test in staging before running in production!
-- ============================================================================

-- ============================================================================
-- DB-056: Backfill tagline from bio field
-- ============================================================================

-- Function to extract first sentence or generate short tagline from bio
CREATE OR REPLACE FUNCTION extract_tagline_from_bio(bio_text TEXT)
RETURNS VARCHAR(200) AS $$
DECLARE
  first_sentence TEXT;
  tagline VARCHAR(200);
BEGIN
  IF bio_text IS NULL OR trim(bio_text) = '' THEN
    RETURN NULL;
  END IF;

  -- Extract first sentence (up to first period, exclamation, or question mark)
  first_sentence := substring(bio_text from '^[^.!?]+[.!?]?');

  -- Trim and limit to 200 characters
  tagline := left(trim(first_sentence), 200);

  -- Remove trailing punctuation if it was cut off
  IF length(first_sentence) > 200 THEN
    tagline := regexp_replace(tagline, '[.!?,;:]$', '');
    tagline := tagline || '...';
  END IF;

  RETURN tagline;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION extract_tagline_from_bio(TEXT) IS 'Extract tagline from bio text';

-- Backfill tagline from bio field in portfolio data
UPDATE portfolios
SET tagline = extract_tagline_from_bio(data->'about'->>'bio')
WHERE tagline IS NULL
  AND data->'about'->>'bio' IS NOT NULL
  AND length(trim(data->'about'->>'bio')) > 0;

-- Log the update
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Backfilled tagline for % portfolios from bio field', updated_count;
END $$;

-- ============================================================================
-- DB-057: Backfill location from work experience
-- ============================================================================

-- Function to extract location from most recent work experience
CREATE OR REPLACE FUNCTION extract_location_from_experience(portfolio_data JSONB)
RETURNS VARCHAR(100) AS $$
DECLARE
  experience_array JSONB;
  most_recent JSONB;
  location TEXT;
BEGIN
  -- Get experience array
  experience_array := portfolio_data->'experience';

  IF experience_array IS NULL OR jsonb_array_length(experience_array) = 0 THEN
    -- Try to get location from about section
    location := portfolio_data->'contact'->>'location';
    IF location IS NOT NULL AND trim(location) != '' THEN
      RETURN left(trim(location), 100);
    END IF;
    RETURN NULL;
  END IF;

  -- Find most recent experience (current job or latest end date)
  SELECT e INTO most_recent
  FROM jsonb_array_elements(experience_array) e
  WHERE (e->>'current')::boolean = true
     OR e->>'endDate' IS NULL
  ORDER BY
    CASE WHEN (e->>'current')::boolean = true THEN 1 ELSE 2 END,
    e->>'endDate' DESC NULLS FIRST
  LIMIT 1;

  -- If no current job, get the one with latest end date
  IF most_recent IS NULL THEN
    SELECT e INTO most_recent
    FROM jsonb_array_elements(experience_array) e
    ORDER BY e->>'endDate' DESC NULLS LAST
    LIMIT 1;
  END IF;

  -- Extract location
  location := most_recent->>'location';

  IF location IS NOT NULL AND trim(location) != '' THEN
    RETURN left(trim(location), 100);
  END IF;

  -- Fallback to contact location
  location := portfolio_data->'contact'->>'location';
  IF location IS NOT NULL AND trim(location) != '' THEN
    RETURN left(trim(location), 100);
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION extract_location_from_experience(JSONB) IS 'Extract location from work experience or contact info';

-- Backfill location
UPDATE portfolios
SET location = extract_location_from_experience(data)
WHERE location IS NULL;

-- Log the update
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Backfilled location for % portfolios from experience/contact', updated_count;
END $$;

-- ============================================================================
-- DB-050: Migrate GeneratedDocument records to Portfolio table
-- ============================================================================
-- NOTE: This section assumes a GeneratedDocument table exists
-- If your schema doesn't have this table, you can skip this section

-- Check if generated_documents table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'generated_documents'
  ) THEN

    -- Create a migration log table
    CREATE TEMP TABLE migration_log (
      old_id UUID,
      new_id UUID,
      migrated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Insert portfolios from generated_documents
    WITH migrated AS (
      INSERT INTO portfolios (
        user_id,
        name,
        slug,
        description,
        data,
        template_id,
        is_published,
        is_draft,
        visibility,
        created_at,
        updated_at,
        created_by
      )
      SELECT
        gd.user_id,
        COALESCE(gd.title, 'My Portfolio') AS name,
        -- Generate unique slug
        lower(regexp_replace(
          COALESCE(gd.title, 'portfolio-' || substr(gd.id::text, 1, 8)),
          '[^a-z0-9\s-]', '', 'g'
        )) AS slug,
        gd.description,
        COALESCE(gd.data, '{}'::jsonb) AS data,
        -- Use default template (will be set later)
        NULL AS template_id,
        -- If document was published
        CASE WHEN gd.status = 'PUBLISHED' THEN true ELSE false END AS is_published,
        CASE WHEN gd.status = 'DRAFT' THEN true ELSE false END AS is_draft,
        CASE WHEN gd.status = 'PUBLISHED' THEN 'PUBLIC'::portfolio_visibility ELSE 'PRIVATE'::portfolio_visibility END AS visibility,
        gd.created_at,
        gd.updated_at,
        gd.user_id AS created_by
      FROM generated_documents gd
      WHERE gd.type = 'PORTFOLIO_SECTION'
        AND NOT EXISTS (
          -- Don't migrate if already migrated
          SELECT 1 FROM portfolios p
          WHERE p.user_id = gd.user_id
          AND p.name = COALESCE(gd.title, 'My Portfolio')
        )
      ON CONFLICT (user_id, slug) DO NOTHING
      RETURNING id, created_at
    )
    INSERT INTO migration_log (new_id)
    SELECT id FROM migrated;

    -- DB-052: Create initial PortfolioVersion for each migrated portfolio
    INSERT INTO portfolio_versions (
      portfolio_id,
      version,
      name,
      data,
      metadata,
      created_by,
      created_at
    )
    SELECT
      p.id AS portfolio_id,
      1 AS version,
      'Initial version (migrated)' AS name,
      p.data,
      jsonb_build_object(
        'operation', 'INSERT',
        'isPublished', p.is_published,
        'buildStatus', p.build_status,
        'migratedFrom', 'generated_documents'
      ) AS metadata,
      p.created_by,
      p.created_at
    FROM portfolios p
    INNER JOIN migration_log ml ON ml.new_id = p.id
    ON CONFLICT (portfolio_id, version) DO NOTHING;

    -- DB-053: Soft-delete migrated GeneratedDocument records
    UPDATE generated_documents
    SET
      deleted_at = NOW(),
      updated_at = NOW()
    WHERE type = 'PORTFOLIO_SECTION'
      AND deleted_at IS NULL;

    -- Log results
    RAISE NOTICE 'Migrated % records from generated_documents to portfolios', (SELECT COUNT(*) FROM migration_log);
    RAISE NOTICE 'Created % initial versions', (SELECT COUNT(*) FROM migration_log);
    RAISE NOTICE 'Soft-deleted % generated_documents records', (SELECT COUNT(*) FROM generated_documents WHERE type = 'PORTFOLIO_SECTION' AND deleted_at IS NOT NULL);

  ELSE
    RAISE NOTICE 'Table generated_documents does not exist, skipping migration DB-050 to DB-053';
  END IF;
END $$;

-- ============================================================================
-- Cleanup temporary objects
-- ============================================================================

-- Drop temporary migration functions (keep extract functions for future use)
-- These can be dropped after migration is complete:
-- DROP FUNCTION IF EXISTS extract_tagline_from_bio(TEXT);
-- DROP FUNCTION IF EXISTS extract_location_from_experience(JSONB);

-- ============================================================================
-- Verification queries
-- ============================================================================
-- Verify tagline backfill:
-- SELECT
--   COUNT(*) FILTER (WHERE tagline IS NOT NULL) as with_tagline,
--   COUNT(*) FILTER (WHERE tagline IS NULL) as without_tagline,
--   COUNT(*) as total
-- FROM portfolios;
--
-- Verify location backfill:
-- SELECT
--   COUNT(*) FILTER (WHERE location IS NOT NULL) as with_location,
--   COUNT(*) FILTER (WHERE location IS NULL) as without_location,
--   COUNT(*) as total
-- FROM portfolios;
--
-- Verify migrated portfolios:
-- SELECT
--   COUNT(*) as migrated_count,
--   COUNT(*) FILTER (WHERE is_published = true) as published_count
-- FROM portfolios
-- WHERE created_by IS NOT NULL;
