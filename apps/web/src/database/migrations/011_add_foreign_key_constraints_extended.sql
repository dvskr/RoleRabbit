-- ============================================================================
-- Migration: 011_add_foreign_key_constraints_extended
-- Sections 3.4-3.7: Add foreign key constraints for new tables
-- ============================================================================
-- Description: Add foreign key constraints for custom_domains, portfolio_analytics,
--              portfolio_shares, and portfolio_deployments tables
-- Run in: Supabase SQL Editor (run AFTER migrations 007-010)
-- ============================================================================

-- ============================================================================
-- Foreign keys for custom_domains table (Section 3.4)
-- ============================================================================

-- Requirement #2 (Section 3.4): custom_domains.portfolio_id → portfolios.id ON DELETE CASCADE
ALTER TABLE custom_domains
  ADD CONSTRAINT fk_custom_domains_portfolio_id
  FOREIGN KEY (portfolio_id)
  REFERENCES portfolios (id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

COMMENT ON CONSTRAINT fk_custom_domains_portfolio_id ON custom_domains
  IS 'Cascade delete custom domains when portfolio is deleted';

-- ============================================================================
-- Foreign keys for portfolio_analytics table (Section 3.5)
-- ============================================================================

-- Requirement #2 (Section 3.5): portfolio_analytics.portfolio_id → portfolios.id ON DELETE CASCADE
ALTER TABLE portfolio_analytics
  ADD CONSTRAINT fk_portfolio_analytics_portfolio_id
  FOREIGN KEY (portfolio_id)
  REFERENCES portfolios (id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

COMMENT ON CONSTRAINT fk_portfolio_analytics_portfolio_id ON portfolio_analytics
  IS 'Cascade delete analytics when portfolio is deleted';

-- ============================================================================
-- Foreign keys for portfolio_shares table (Section 3.6)
-- ============================================================================

-- Requirement #2 (Section 3.6): portfolio_shares.portfolio_id → portfolios.id ON DELETE CASCADE
ALTER TABLE portfolio_shares
  ADD CONSTRAINT fk_portfolio_shares_portfolio_id
  FOREIGN KEY (portfolio_id)
  REFERENCES portfolios (id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

COMMENT ON CONSTRAINT fk_portfolio_shares_portfolio_id ON portfolio_shares
  IS 'Cascade delete share links when portfolio is deleted';

-- ============================================================================
-- Foreign keys for portfolio_deployments table (Section 3.7)
-- ============================================================================

-- Requirement #2 (Section 3.7): portfolio_deployments.portfolio_id → portfolios.id ON DELETE CASCADE
ALTER TABLE portfolio_deployments
  ADD CONSTRAINT fk_portfolio_deployments_portfolio_id
  FOREIGN KEY (portfolio_id)
  REFERENCES portfolios (id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

COMMENT ON CONSTRAINT fk_portfolio_deployments_portfolio_id ON portfolio_deployments
  IS 'Cascade delete deployment history when portfolio is deleted';

-- Optional: Foreign key for deployed_by
ALTER TABLE portfolio_deployments
  ADD CONSTRAINT fk_portfolio_deployments_deployed_by
  FOREIGN KEY (deployed_by)
  REFERENCES auth.users (id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

COMMENT ON CONSTRAINT fk_portfolio_deployments_deployed_by ON portfolio_deployments
  IS 'Set NULL when user who deployed is deleted';

-- ============================================================================
-- Verify foreign key constraints
-- ============================================================================
-- Query to list all foreign key constraints for new tables:
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
--   AND tc.table_name IN (
--     'custom_domains',
--     'portfolio_analytics',
--     'portfolio_shares',
--     'portfolio_deployments'
--   )
-- ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- Test cascade deletions
-- ============================================================================
-- WARNING: These are destructive tests. Only run in development!

-- Test portfolio deletion cascades:
-- BEGIN;
--   -- Insert test portfolio
--   INSERT INTO portfolios (id, user_id, name, slug, data)
--   VALUES ('test-portfolio-id', auth.uid(), 'Test', 'test', '{}');
--
--   -- Insert related records
--   INSERT INTO custom_domains (portfolio_id, domain, verification_token)
--   VALUES ('test-portfolio-id', 'test.example.com', 'test-token-123');
--
--   INSERT INTO portfolio_analytics (portfolio_id, date, views)
--   VALUES ('test-portfolio-id', CURRENT_DATE, 10);
--
--   INSERT INTO portfolio_shares (portfolio_id, token)
--   VALUES ('test-portfolio-id', 'test-share-token-123456789012345');
--
--   INSERT INTO portfolio_deployments (portfolio_id, status)
--   VALUES ('test-portfolio-id', 'DEPLOYED');
--
--   -- Check records exist
--   SELECT 'Domains:', COUNT(*) FROM custom_domains WHERE portfolio_id = 'test-portfolio-id';
--   SELECT 'Analytics:', COUNT(*) FROM portfolio_analytics WHERE portfolio_id = 'test-portfolio-id';
--   SELECT 'Shares:', COUNT(*) FROM portfolio_shares WHERE portfolio_id = 'test-portfolio-id';
--   SELECT 'Deployments:', COUNT(*) FROM portfolio_deployments WHERE portfolio_id = 'test-portfolio-id';
--
--   -- Delete portfolio (should cascade to all related records)
--   DELETE FROM portfolios WHERE id = 'test-portfolio-id';
--
--   -- Check all related records are gone
--   SELECT 'Domains after delete:', COUNT(*) FROM custom_domains WHERE portfolio_id = 'test-portfolio-id';
--   SELECT 'Analytics after delete:', COUNT(*) FROM portfolio_analytics WHERE portfolio_id = 'test-portfolio-id';
--   SELECT 'Shares after delete:', COUNT(*) FROM portfolio_shares WHERE portfolio_id = 'test-portfolio-id';
--   SELECT 'Deployments after delete:', COUNT(*) FROM portfolio_deployments WHERE portfolio_id = 'test-portfolio-id';
--
-- ROLLBACK;
