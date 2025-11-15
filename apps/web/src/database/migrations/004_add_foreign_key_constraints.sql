-- ============================================================================
-- Migration: 004_add_foreign_key_constraints
-- Section 3.1 & 3.3: Add foreign key constraints
-- ============================================================================
-- Description: Add all foreign key constraints between tables
-- Run in: Supabase SQL Editor (run AFTER migrations 001, 002, and 003)
-- ============================================================================

-- ============================================================================
-- Foreign keys for portfolios table
-- ============================================================================

-- Requirement #2: portfolios.user_id → auth.users.id ON DELETE CASCADE
-- When a user is deleted, all their portfolios are automatically deleted
ALTER TABLE portfolios
  ADD CONSTRAINT fk_portfolios_user_id
  FOREIGN KEY (user_id)
  REFERENCES auth.users (id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Requirement #3: portfolios.template_id → portfolio_templates.id ON DELETE RESTRICT
-- Prevents deletion of templates that are in use by portfolios
ALTER TABLE portfolios
  ADD CONSTRAINT fk_portfolios_template_id
  FOREIGN KEY (template_id)
  REFERENCES portfolio_templates (id)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- Optional: Foreign keys for audit fields (created_by, updated_by)
-- These reference auth.users but allow NULL and don't cascade delete
ALTER TABLE portfolios
  ADD CONSTRAINT fk_portfolios_created_by
  FOREIGN KEY (created_by)
  REFERENCES auth.users (id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE portfolios
  ADD CONSTRAINT fk_portfolios_updated_by
  FOREIGN KEY (updated_by)
  REFERENCES auth.users (id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- ============================================================================
-- Foreign keys for portfolio_versions table
-- ============================================================================

-- Requirement #2 (Section 3.3): portfolio_versions.portfolio_id → portfolios.id ON DELETE CASCADE
-- When a portfolio is deleted, all its versions are automatically deleted
ALTER TABLE portfolio_versions
  ADD CONSTRAINT fk_portfolio_versions_portfolio_id
  FOREIGN KEY (portfolio_id)
  REFERENCES portfolios (id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Optional: Foreign key for created_by
ALTER TABLE portfolio_versions
  ADD CONSTRAINT fk_portfolio_versions_created_by
  FOREIGN KEY (created_by)
  REFERENCES auth.users (id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- ============================================================================
-- Create function to prevent template deletion if in use
-- ============================================================================
CREATE OR REPLACE FUNCTION prevent_template_deletion_if_in_use()
RETURNS TRIGGER AS $$
DECLARE
  portfolio_count INTEGER;
BEGIN
  -- Count portfolios using this template
  SELECT COUNT(*) INTO portfolio_count
  FROM portfolios
  WHERE template_id = OLD.id
  AND deleted_at IS NULL;

  -- If template is in use, prevent deletion
  IF portfolio_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete template "%" because it is used by % portfolio(s). Please assign a different template to these portfolios first.',
      OLD.name,
      portfolio_count;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_template_deletion
  BEFORE DELETE ON portfolio_templates
  FOR EACH ROW
  EXECUTE FUNCTION prevent_template_deletion_if_in_use();

-- ============================================================================
-- Create function to update template usage count
-- ============================================================================
CREATE OR REPLACE FUNCTION update_template_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  -- When a portfolio is created with a template, increment usage count
  IF TG_OP = 'INSERT' AND NEW.template_id IS NOT NULL THEN
    UPDATE portfolio_templates
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_id;
  END IF;

  -- When template is changed, update both old and new template counts
  IF TG_OP = 'UPDATE' AND OLD.template_id IS DISTINCT FROM NEW.template_id THEN
    -- Decrement old template count
    IF OLD.template_id IS NOT NULL THEN
      UPDATE portfolio_templates
      SET usage_count = GREATEST(usage_count - 1, 0)
      WHERE id = OLD.template_id;
    END IF;

    -- Increment new template count
    IF NEW.template_id IS NOT NULL THEN
      UPDATE portfolio_templates
      SET usage_count = usage_count + 1
      WHERE id = NEW.template_id;
    END IF;
  END IF;

  -- When a portfolio is deleted (hard delete), decrement usage count
  IF TG_OP = 'DELETE' AND OLD.template_id IS NOT NULL THEN
    UPDATE portfolio_templates
    SET usage_count = GREATEST(usage_count - 1, 0)
    WHERE id = OLD.template_id;
  END IF;

  -- When a portfolio is soft deleted, decrement usage count
  IF TG_OP = 'UPDATE' AND OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    IF NEW.template_id IS NOT NULL THEN
      UPDATE portfolio_templates
      SET usage_count = GREATEST(usage_count - 1, 0)
      WHERE id = NEW.template_id;
    END IF;
  END IF;

  -- When a portfolio is restored from soft delete, increment usage count
  IF TG_OP = 'UPDATE' AND OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
    IF NEW.template_id IS NOT NULL THEN
      UPDATE portfolio_templates
      SET usage_count = usage_count + 1
      WHERE id = NEW.template_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_template_usage
  AFTER INSERT OR UPDATE OR DELETE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_template_usage_count();

-- ============================================================================
-- Add validation function for cascading deletes
-- ============================================================================
CREATE OR REPLACE FUNCTION log_cascade_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when a user deletion will cascade to portfolios
  IF TG_TABLE_NAME = 'users' THEN
    RAISE NOTICE 'User % deleted. Cascading to % portfolio(s).',
      OLD.id,
      (SELECT COUNT(*) FROM portfolios WHERE user_id = OLD.id);
  END IF;

  -- Log when a portfolio deletion will cascade to versions
  IF TG_TABLE_NAME = 'portfolios' THEN
    RAISE NOTICE 'Portfolio % deleted. Cascading to % version(s).',
      OLD.id,
      (SELECT COUNT(*) FROM portfolio_versions WHERE portfolio_id = OLD.id);
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Optional: Enable cascade logging (can be noisy in production)
-- CREATE TRIGGER log_portfolio_cascade
--   BEFORE DELETE ON portfolios
--   FOR EACH ROW
--   EXECUTE FUNCTION log_cascade_deletion();

-- ============================================================================
-- Verify foreign key constraints
-- ============================================================================
-- Query to list all foreign key constraints:
-- SELECT
--   tc.table_name,
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name,
--   rc.delete_rule,
--   rc.update_rule
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
--   AND tc.table_schema = kcu.table_schema
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
--   AND ccu.table_schema = tc.table_schema
-- JOIN information_schema.referential_constraints AS rc
--   ON rc.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_name IN ('portfolios', 'portfolio_versions')
-- ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- Test foreign key constraints
-- ============================================================================
-- Test template deletion prevention:
-- INSERT INTO portfolio_templates (name, slug, html_template, css_template, category)
-- VALUES ('Test Template', 'test-template', '<html></html>', 'body{}', 'OTHER');
--
-- INSERT INTO portfolios (user_id, name, slug, template_id, data)
-- VALUES (auth.uid(), 'Test Portfolio', 'test-portfolio', (SELECT id FROM portfolio_templates WHERE slug = 'test-template'), '{}');
--
-- DELETE FROM portfolio_templates WHERE slug = 'test-template';
-- Should fail with: "Cannot delete template because it is used by 1 portfolio(s)"
