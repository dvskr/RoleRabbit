/**
 * Data Retention Cleanup Script
 * 
 * Run this script daily to clean up old data according to retention policies
 * Usage: node scripts/data-retention-cleanup.js
 */

const { runDataRetentionCleanup } = require('../utils/dataRetention');
const { cleanupExpiredSessions, cleanupInactiveSessions } = require('../utils/sessionManagement');
const { cleanupOldLoginAttempts } = require('../middleware/ipRateLimit');

async function main() {
  console.log('========================================');
  console.log('Data Retention Cleanup Started');
  console.log(new Date().toISOString());
  console.log('========================================\n');
  
  try {
    // Run data retention cleanup
    const retentionSummary = await runDataRetentionCleanup();
    
    // Clean up expired sessions
    console.log('\nCleaning up expired sessions...');
    const expiredSessions = await cleanupExpiredSessions();
    console.log(`Cleaned up ${expiredSessions} expired sessions`);
    
    // Clean up inactive sessions
    console.log('\nCleaning up inactive sessions...');
    const inactiveSessions = await cleanupInactiveSessions();
    console.log(`Cleaned up ${inactiveSessions} inactive sessions`);
    
    // Clean up old login attempts
    console.log('\nCleaning up old login attempts...');
    const oldAttempts = await cleanupOldLoginAttempts();
    console.log(`Cleaned up ${oldAttempts} old login attempts`);
    
    console.log('\n========================================');
    console.log('Data Retention Cleanup Completed');
    console.log('========================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Data retention cleanup failed:', error);
    process.exit(1);
  }
}

main();

