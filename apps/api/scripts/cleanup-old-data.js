#!/usr/bin/env node

/**
 * Data Retention Cleanup Script
 * 
 * Runs all data retention cleanup tasks.
 * Should be scheduled to run daily at 2 AM.
 * 
 * Usage:
 *   node apps/api/scripts/cleanup-old-data.js
 * 
 * Or via cron:
 *   0 2 * * * cd /path/to/project && node apps/api/scripts/cleanup-old-data.js
 */

const { runAllCleanupTasks } = require('../utils/dataRetention');
const { cleanupExpiredTokens } = require('../middleware/sessionManagement');

async function main() {
  console.log('Starting scheduled data cleanup...\n');

  try {
    // Run data retention cleanup
    await runAllCleanupTasks();

    // Cleanup expired tokens
    console.log('\nCleaning up expired tokens...');
    const tokensDeleted = await cleanupExpiredTokens();
    console.log(`✅ Deleted ${tokensDeleted} expired tokens\n`);

    console.log('✅ Data cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Data cleanup failed:', error);
    process.exit(1);
  }
}

main();
