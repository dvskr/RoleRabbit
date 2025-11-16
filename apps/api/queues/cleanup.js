/**
 * Queue Cleanup Service
 * 
 * Automatically cleans up old completed and failed jobs
 */

const cron = require('node-cron');
const { cleanAllQueues, getAllQueueStats } = require('./index');

/**
 * Cleanup configuration
 */
const CLEANUP_CONFIG = {
  // Run cleanup daily at 2 AM
  schedule: '0 2 * * *',
  
  // Keep completed jobs for 7 days
  completedJobsAge: 7 * 24 * 60 * 60 * 1000,
  
  // Keep failed jobs for 30 days
  failedJobsAge: 30 * 24 * 60 * 60 * 1000
};

/**
 * Cleanup task
 */
async function runCleanup() {
  console.log('🧹 Starting queue cleanup...');

  try {
    // Get stats before cleanup
    const statsBefore = await getAllQueueStats();
    console.log('Stats before cleanup:', statsBefore);

    // Run cleanup
    await cleanAllQueues();

    // Get stats after cleanup
    const statsAfter = await getAllQueueStats();
    console.log('Stats after cleanup:', statsAfter);

    // Calculate cleaned jobs
    const totalBefore = Object.values(statsBefore).reduce((sum, stats) => sum + stats.total, 0);
    const totalAfter = Object.values(statsAfter).reduce((sum, stats) => sum + stats.total, 0);
    const cleaned = totalBefore - totalAfter;

    console.log(`✅ Cleanup completed. Removed ${cleaned} jobs.`);

    return {
      success: true,
      cleaned,
      statsBefore,
      statsAfter
    };

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Schedule cleanup
 */
function scheduleCleanup() {
  console.log(`📅 Scheduling queue cleanup: ${CLEANUP_CONFIG.schedule}`);

  const task = cron.schedule(CLEANUP_CONFIG.schedule, async () => {
    await runCleanup();
  });

  console.log('✅ Queue cleanup scheduled');

  return task;
}

/**
 * Manual cleanup trigger
 */
async function manualCleanup() {
  console.log('🧹 Running manual cleanup...');
  return runCleanup();
}

module.exports = {
  runCleanup,
  scheduleCleanup,
  manualCleanup,
  CLEANUP_CONFIG
};

