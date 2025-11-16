/**
 * Database Cleanup Jobs
 * Section 3.14: Data Cleanup & Archival (DB-076 to DB-080)
 *
 * Scheduled jobs for data cleanup and archival using pg_cron or BullMQ
 */

import { createSupabaseServiceClient } from '@/database/client';

// ============================================================================
// DB-076: Soft-delete portfolios older than 90 days
// ============================================================================

export async function cleanupDeletedPortfolios() {
  const supabase = createSupabaseServiceClient();

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  console.log('[Cleanup] Permanently deleting soft-deleted portfolios older than 90 days...');

  // First, get count of portfolios to be deleted
  const { count } = await supabase
    .from('portfolios')
    .select('*', { count: 'exact', head: true })
    .not('deleted_at', 'is', null)
    .lt('deleted_at', ninetyDaysAgo.toISOString());

  if (!count || count === 0) {
    console.log('[Cleanup] No portfolios to delete');
    return { deleted: 0 };
  }

  console.log(`[Cleanup] Found ${count} portfolios to permanently delete`);

  // Delete permanently (this will cascade to all related tables due to foreign keys)
  const { error } = await supabase
    .from('portfolios')
    .delete()
    .not('deleted_at', 'is', null)
    .lt('deleted_at', ninetyDaysAgo.toISOString());

  if (error) {
    console.error('[Cleanup] Error deleting portfolios:', error);
    throw error;
  }

  console.log(`[Cleanup] Successfully deleted ${count} portfolios`);

  return { deleted: count };
}

// ============================================================================
// DB-077: Archive portfolio_versions older than 1 year
// ============================================================================

export async function archiveOldVersions() {
  const supabase = createSupabaseServiceClient();

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  console.log('[Cleanup] Archiving portfolio versions older than 1 year...');

  // Option 1: Move to archive table (if you have one)
  // This example just deletes old versions except the most recent 10 for each portfolio

  const { data: oldVersions, error: fetchError } = await supabase.rpc(
    'get_archivable_versions',
    { p_cutoff_date: oneYearAgo.toISOString() }
  );

  if (fetchError) {
    // If function doesn't exist, use alternative approach
    console.log('[Cleanup] Using alternative archival method...');

    // Delete old versions keeping at least 10 recent versions per portfolio
    const { data: portfolios } = await supabase
      .from('portfolios')
      .select('id');

    if (!portfolios) {
      console.log('[Cleanup] No portfolios found');
      return { archived: 0 };
    }

    let totalArchived = 0;

    for (const portfolio of portfolios) {
      // Get versions older than 1 year, excluding the 10 most recent
      const { data: versionsToDelete } = await supabase
        .from('portfolio_versions')
        .select('id, version')
        .eq('portfolio_id', portfolio.id)
        .lt('created_at', oneYearAgo.toISOString())
        .order('version', { ascending: false })
        .range(10, 1000); // Skip first 10, get rest

      if (versionsToDelete && versionsToDelete.length > 0) {
        const versionIds = versionsToDelete.map(v => v.id);

        const { error: deleteError } = await supabase
          .from('portfolio_versions')
          .delete()
          .in('id', versionIds);

        if (!deleteError) {
          totalArchived += versionsToDelete.length;
          console.log(`[Cleanup] Archived ${versionsToDelete.length} versions for portfolio ${portfolio.id}`);
        }
      }
    }

    console.log(`[Cleanup] Total versions archived: ${totalArchived}`);
    return { archived: totalArchived };
  }

  console.log(`[Cleanup] Found ${oldVersions?.length || 0} versions to archive`);

  // Archive versions (move to separate table or delete)
  // For now, we'll delete them
  if (oldVersions && oldVersions.length > 0) {
    const versionIds = oldVersions.map((v: any) => v.id);

    const { error: deleteError } = await supabase
      .from('portfolio_versions')
      .delete()
      .in('id', versionIds);

    if (deleteError) {
      console.error('[Cleanup] Error archiving versions:', deleteError);
      throw deleteError;
    }
  }

  return { archived: oldVersions?.length || 0 };
}

// ============================================================================
// DB-078: Delete portfolio_analytics older than 2 years
// ============================================================================

export async function cleanupOldAnalytics() {
  const supabase = createSupabaseServiceClient();

  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  console.log('[Cleanup] Deleting analytics data older than 2 years...');

  const { count, error } = await supabase
    .from('portfolio_analytics')
    .delete()
    .lt('date', twoYearsAgo.toISOString().split('T')[0]);

  if (error) {
    console.error('[Cleanup] Error deleting analytics:', error);
    throw error;
  }

  console.log(`[Cleanup] Deleted ${count || 0} analytics records`);

  // Drop old partitions
  const cutoffDate = new Date(twoYearsAgo);
  const year = cutoffDate.getFullYear();
  const month = String(cutoffDate.getMonth() + 1).padStart(2, '0');

  console.log(`[Cleanup] Dropping partitions older than ${year}_${month}...`);

  // Generate partition names to drop
  const partitionsToDrop: string[] = [];
  let currentDate = new Date(2020, 0); // Start from 2020

  while (currentDate < twoYearsAgo) {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    partitionsToDrop.push(`portfolio_analytics_${y}_${m}`);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Drop partitions using raw SQL
  for (const partition of partitionsToDrop) {
    try {
      await supabase.rpc('execute_sql', {
        sql: `DROP TABLE IF EXISTS ${partition} CASCADE;`
      });
      console.log(`[Cleanup] Dropped partition: ${partition}`);
    } catch (err) {
      console.warn(`[Cleanup] Could not drop partition ${partition}:`, err);
    }
  }

  return { deleted: count || 0, partitionsDropped: partitionsToDrop.length };
}

// ============================================================================
// DB-079: Delete expired portfolio_shares
// ============================================================================

export async function cleanupExpiredShares() {
  const supabase = createSupabaseServiceClient();

  console.log('[Cleanup] Deleting expired share links...');

  const { count: expiredCount, error: expiredError } = await supabase
    .from('portfolio_shares')
    .delete()
    .not('expires_at', 'is', null)
    .lt('expires_at', new Date().toISOString());

  if (expiredError) {
    console.error('[Cleanup] Error deleting expired shares:', expiredError);
    throw expiredError;
  }

  console.log(`[Cleanup] Deleted ${expiredCount || 0} expired shares`);

  // Also delete shares that have exceeded max views
  const { count: maxViewsCount, error: maxViewsError } = await supabase
    .from('portfolio_shares')
    .delete()
    .not('max_views', 'is', null)
    .filter('view_count', 'gte', 'max_views');

  if (maxViewsError) {
    console.error('[Cleanup] Error deleting max-view shares:', maxViewsError);
    throw maxViewsError;
  }

  console.log(`[Cleanup] Deleted ${maxViewsCount || 0} shares that exceeded max views`);

  return {
    expiredDeleted: expiredCount || 0,
    maxViewsDeleted: maxViewsCount || 0,
    total: (expiredCount || 0) + (maxViewsCount || 0)
  };
}

// ============================================================================
// DB-080: Orphan cleanup for custom_domains
// ============================================================================

export async function cleanupOrphanDomains() {
  const supabase = createSupabaseServiceClient();

  console.log('[Cleanup] Checking for orphaned custom domains...');

  // This shouldn't happen due to CASCADE foreign keys, but verify
  const { data: orphans } = await supabase
    .from('custom_domains')
    .select('id, domain, portfolio_id')
    .not('portfolio_id', 'in',
      supabase.from('portfolios').select('id')
    );

  if (!orphans || orphans.length === 0) {
    console.log('[Cleanup] No orphaned domains found');
    return { deleted: 0 };
  }

  console.log(`[Cleanup] Found ${orphans.length} orphaned domains`);

  const { error } = await supabase
    .from('custom_domains')
    .delete()
    .in('id', orphans.map(o => o.id));

  if (error) {
    console.error('[Cleanup] Error deleting orphaned domains:', error);
    throw error;
  }

  console.log(`[Cleanup] Deleted ${orphans.length} orphaned domains`);

  return { deleted: orphans.length };
}

// ============================================================================
// Master cleanup job - runs all cleanup tasks
// ============================================================================

export async function runAllCleanupJobs() {
  console.log('[Cleanup] Starting all cleanup jobs...');

  const results = {
    timestamp: new Date().toISOString(),
    portfolios: { deleted: 0 },
    versions: { archived: 0 },
    analytics: { deleted: 0, partitionsDropped: 0 },
    shares: { total: 0 },
    domains: { deleted: 0 },
    errors: [] as string[]
  };

  // Run cleanup jobs sequentially to avoid conflicts
  try {
    results.portfolios = await cleanupDeletedPortfolios();
  } catch (err) {
    results.errors.push(`Portfolios cleanup failed: ${err}`);
    console.error('[Cleanup] Portfolios cleanup failed:', err);
  }

  try {
    results.versions = await archiveOldVersions();
  } catch (err) {
    results.errors.push(`Versions archival failed: ${err}`);
    console.error('[Cleanup] Versions archival failed:', err);
  }

  try {
    results.analytics = await cleanupOldAnalytics();
  } catch (err) {
    results.errors.push(`Analytics cleanup failed: ${err}`);
    console.error('[Cleanup] Analytics cleanup failed:', err);
  }

  try {
    results.shares = await cleanupExpiredShares();
  } catch (err) {
    results.errors.push(`Shares cleanup failed: ${err}`);
    console.error('[Cleanup] Shares cleanup failed:', err);
  }

  try {
    results.domains = await cleanupOrphanDomains();
  } catch (err) {
    results.errors.push(`Domains cleanup failed: ${err}`);
    console.error('[Cleanup] Domains cleanup failed:', err);
  }

  console.log('[Cleanup] All cleanup jobs completed');
  console.log('[Cleanup] Results:', JSON.stringify(results, null, 2));

  return results;
}

// ============================================================================
// Schedule cleanup jobs using pg_cron (SQL)
// ============================================================================

export const CLEANUP_CRON_JOBS = `
-- Schedule cleanup jobs using pg_cron
-- Run these SQL commands in Supabase SQL Editor

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily cleanup of expired shares (runs at 3 AM daily)
SELECT cron.schedule(
  'cleanup-expired-shares',
  '0 3 * * *',
  $$
  DELETE FROM portfolio_shares
  WHERE (expires_at IS NOT NULL AND expires_at < NOW())
     OR (max_views IS NOT NULL AND view_count >= max_views);
  $$
);

-- Weekly cleanup of soft-deleted portfolios (runs Sunday at 2 AM)
SELECT cron.schedule(
  'cleanup-deleted-portfolios',
  '0 2 * * 0',
  $$
  DELETE FROM portfolios
  WHERE deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL '90 days';
  $$
);

-- Monthly archive of old versions (runs first day of month at 1 AM)
SELECT cron.schedule(
  'archive-old-versions',
  '0 1 1 * *',
  $$
  -- Delete old versions keeping last 10 per portfolio
  WITH ranked_versions AS (
    SELECT
      id,
      ROW_NUMBER() OVER (PARTITION BY portfolio_id ORDER BY version DESC) as rn,
      created_at
    FROM portfolio_versions
  )
  DELETE FROM portfolio_versions
  WHERE id IN (
    SELECT id FROM ranked_versions
    WHERE rn > 10 AND created_at < NOW() - INTERVAL '1 year'
  );
  $$
);

-- Quarterly cleanup of old analytics (runs first day of quarter at 1 AM)
SELECT cron.schedule(
  'cleanup-old-analytics',
  '0 1 1 1,4,7,10 *',
  $$
  DELETE FROM portfolio_analytics
  WHERE date < (CURRENT_DATE - INTERVAL '2 years');
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job;

-- View job execution history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
`;
