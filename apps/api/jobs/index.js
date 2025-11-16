/**
 * Background Jobs
 * INFRA-005 to INFRA-012: All background jobs for My Files feature
 */

const { Worker } = require('bullmq');
const { queues, redisConnection, defaultJobOptions } = require('../config/queue');
const logger = require('../utils/logger');
const { 
  syncStorageQuota, 
  cleanupExpiredShares, 
  cleanupExpiredShareLinks,
  cleanupOldAccessLogs,
  cleanupOrphanedFiles
} = require('../utils/databaseCleanup');
const { sendQuotaWarningEmail } = require('../utils/emailService');
const { generateThumbnail } = require('../utils/thumbnailGenerator');
const { scanFile } = require('../utils/virusScanner');
const { scanFileForSensitiveData } = require('../utils/contentScanner');
const { prisma } = require('../utils/db');

/**
 * INFRA-005: Background job to sync storage quota with actual file sizes (run daily)
 */
const quotaSyncWorker = new Worker(
  'quota-sync-queue',
  async (job) => {
    logger.info(`[QuotaSync] Starting quota sync job ${job.id}`);
    try {
      const result = await syncStorageQuota();
      logger.info(`[QuotaSync] Job ${job.id} completed successfully`);
      return result;
    } catch (error) {
      logger.error(`[QuotaSync] Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1 // Only one quota sync at a time
  }
);

/**
 * INFRA-006: Background job to clean up expired shares and share links (run hourly)
 */
const cleanupWorker = new Worker(
  'cleanup-queue',
  async (job) => {
    logger.info(`[Cleanup] Starting cleanup job ${job.id}`);
    try {
      const [expiredShares, expiredLinks, oldLogs] = await Promise.all([
        cleanupExpiredShares(),
        cleanupExpiredShareLinks(),
        cleanupOldAccessLogs(90) // 90 day retention
      ]);
      
      logger.info(`[Cleanup] Job ${job.id} completed:`, {
        expiredShares: expiredShares.expiredCount,
        expiredLinks: expiredLinks.deletedCount,
        oldLogs: oldLogs.deletedCount
      });
      
      return { expiredShares, expiredLinks, oldLogs };
    } catch (error) {
      logger.error(`[Cleanup] Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1
  }
);

/**
 * INFRA-007: Background job to generate thumbnails for image files (async processing)
 */
const thumbnailWorker = new Worker(
  'thumbnail-queue',
  async (job) => {
    const { fileId, filePath, contentType } = job.data;
    logger.info(`[Thumbnail] Processing thumbnail for file ${fileId}`);
    
    try {
      const thumbnailPath = await generateThumbnail(filePath, contentType);
      
      // Update file record with thumbnail path
      await prisma.storageFile.update({
        where: { id: fileId },
        data: { thumbnail: thumbnailPath }
      });
      
      logger.info(`[Thumbnail] Thumbnail generated for file ${fileId}: ${thumbnailPath}`);
      return { fileId, thumbnailPath };
    } catch (error) {
      logger.error(`[Thumbnail] Failed to generate thumbnail for file ${fileId}:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5 // Process 5 thumbnails concurrently
  }
);

/**
 * INFRA-008: Background job to scan files for viruses (async processing)
 */
const virusScanWorker = new Worker(
  'virus-scan-queue',
  async (job) => {
    const { fileId, fileBuffer, fileName, contentType } = job.data;
    logger.info(`[VirusScan] Scanning file ${fileId} for viruses`);
    
    try {
      const scanResult = await scanFile(fileBuffer, fileName, contentType);
      
      if (scanResult.isInfected) {
        // Mark file as corrupted
        await prisma.storageFile.update({
          where: { id: fileId },
          data: { isCorrupted: true }
        });
        
        logger.warn(`[VirusScan] File ${fileId} is infected: ${scanResult.virus}`);
        throw new Error(`File is infected: ${scanResult.virus}`);
      }
      
      logger.info(`[VirusScan] File ${fileId} passed virus scan`);
      return { fileId, clean: true };
    } catch (error) {
      logger.error(`[VirusScan] Virus scan failed for file ${fileId}:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3 // Process 3 virus scans concurrently
  }
);

/**
 * INFRA-009: Background job to scan files for sensitive data (async processing)
 */
const sensitiveDataScanWorker = new Worker(
  'sensitive-data-scan-queue',
  async (job) => {
    const { fileId, fileBuffer, fileName, contentType } = job.data;
    logger.info(`[SensitiveDataScan] Scanning file ${fileId} for sensitive data`);
    
    try {
      const scanResult = await scanFileForSensitiveData(fileBuffer, contentType, fileName);
      
      if (scanResult.hasSensitiveData) {
        logger.warn(`[SensitiveDataScan] File ${fileId} contains sensitive data:`, scanResult.findings);
        // Store findings in metadata
        await prisma.storageFile.update({
          where: { id: fileId },
          data: {
            metadata: {
              ...(await prisma.storageFile.findUnique({ where: { id: fileId }, select: { metadata: true } }))?.metadata || {},
              sensitiveDataScan: {
                hasSensitiveData: true,
                findings: scanResult.findings,
                scannedAt: new Date().toISOString()
              }
            }
          }
        });
      }
      
      logger.info(`[SensitiveDataScan] File ${fileId} scan completed`);
      return { fileId, scanResult };
    } catch (error) {
      logger.error(`[SensitiveDataScan] Scan failed for file ${fileId}:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3
  }
);

/**
 * INFRA-010: Background job to clean up orphaned files (files in storage but not in DB)
 */
const orphanedFilesWorker = new Worker(
  'cleanup-queue',
  async (job) => {
    logger.info(`[OrphanedFiles] Starting orphaned files cleanup job ${job.id}`);
    try {
      const result = await cleanupOrphanedFiles();
      logger.info(`[OrphanedFiles] Job ${job.id} completed: ${result.orphanedCount} orphaned files found`);
      return result;
    } catch (error) {
      logger.error(`[OrphanedFiles] Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1
  }
);

/**
 * INFRA-011: Background job to clean up old FileAccessLog entries (retention policy)
 * (Already included in cleanupWorker above)
 */

/**
 * INFRA-012: Background job to send quota warning emails (when >80% used)
 */
const quotaWarningWorker = new Worker(
  'quota-warning-queue',
  async (job) => {
    const { userId, quota } = job.data;
    logger.info(`[QuotaWarning] Sending quota warning to user ${userId}`);
    
    try {
      await sendQuotaWarningEmail(userId, quota);
      logger.info(`[QuotaWarning] Quota warning email sent to user ${userId}`);
      return { userId, sent: true };
    } catch (error) {
      logger.error(`[QuotaWarning] Failed to send quota warning to user ${userId}:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 10 // Can send multiple emails concurrently
  }
);

// Worker error handlers
const workers = [
  quotaSyncWorker,
  cleanupWorker,
  thumbnailWorker,
  virusScanWorker,
  sensitiveDataScanWorker,
  orphanedFilesWorker,
  quotaWarningWorker
];

workers.forEach(worker => {
  worker.on('completed', (job) => {
    logger.debug(`Worker ${worker.name}: Job ${job.id} completed`);
  });
  
  worker.on('failed', (job, err) => {
    logger.error(`Worker ${worker.name}: Job ${job.id} failed:`, err);
  });
  
  worker.on('error', (err) => {
    logger.error(`Worker ${worker.name} error:`, err);
  });
});

/**
 * Schedule recurring jobs
 */
/**
 * INFRA-005 to INFRA-012: Schedule all recurring background jobs
 * Uses node-cron for cron scheduling (already in package.json)
 */
async function scheduleRecurringJobs() {
  let cron;
  try {
    cron = require('node-cron');
  } catch (error) {
    logger.warn('node-cron not available, using setInterval fallback:', error);
    // Fallback to setInterval if node-cron is not available
    return scheduleRecurringJobsFallback();
  }
  
  // INFRA-005: Daily quota sync (at 2 AM)
  cron.schedule('0 2 * * *', async () => {
    logger.info('[Cron] Starting daily quota sync...');
    try {
      const result = await syncStorageQuota();
      logger.info(`[Cron] Quota sync completed: ${JSON.stringify(result)}`);
    } catch (error) {
      logger.error('[Cron] Quota sync failed:', error);
    }
  });
  
  // INFRA-006: Hourly cleanup of expired shares and share links
  cron.schedule('0 * * * *', async () => {
    logger.info('[Cron] Starting hourly cleanup...');
    try {
      const [expiredShares, expiredLinks, oldLogs] = await Promise.all([
        cleanupExpiredShares(),
        cleanupExpiredShareLinks(),
        cleanupOldAccessLogs(90) // 90 day retention
      ]);
      logger.info(`[Cron] Cleanup completed: ${expiredShares.expiredCount || 0} expired shares, ${expiredLinks.deletedCount || 0} expired links, ${oldLogs.deletedCount || 0} old logs`);
    } catch (error) {
      logger.error('[Cron] Cleanup failed:', error);
    }
  });
  
  // INFRA-010: Daily orphaned files cleanup (at 3 AM)
  cron.schedule('0 3 * * *', async () => {
    logger.info('[Cron] Starting orphaned files cleanup...');
    try {
      const result = await cleanupOrphanedFiles();
      logger.info(`[Cron] Orphaned files cleanup completed: ${result.orphanedCount || 0} orphaned files found`);
    } catch (error) {
      logger.error('[Cron] Orphaned files cleanup failed:', error);
    }
  });
  
  // INFRA-011: Weekly cleanup of old FileAccessLog entries (Sundays at 4 AM)
  cron.schedule('0 4 * * 0', async () => {
    logger.info('[Cron] Starting weekly access log cleanup...');
    try {
      const result = await cleanupOldAccessLogs(90); // 90 day retention
      logger.info(`[Cron] Access log cleanup completed: ${result.deletedCount || 0} old entries deleted`);
    } catch (error) {
      logger.error('[Cron] Access log cleanup failed:', error);
    }
  });
  
  // INFRA-012: Check quota warnings and send emails (daily at 9 AM)
  cron.schedule('0 9 * * *', async () => {
    logger.info('[Cron] Starting quota warning check...');
    try {
      const { prisma } = require('../utils/db');
      const { sendQuotaWarningEmail } = require('../utils/emailService');
      
      const allQuotas = await prisma.storageQuota.findMany({
        where: {
          warnedAt: null // Haven't warned yet
        },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });
      
      // Filter quotas >80% used
      const quotas = allQuotas.filter(quota => {
        const usagePercent = Number(quota.usedBytes) / Number(quota.limitBytes);
        return usagePercent > 0.8;
      });
      
      for (const quota of quotas) {
        try {
          await sendQuotaWarningEmail(quota.userId, quota);
          await prisma.storageQuota.update({
            where: { id: quota.id },
            data: { warnedAt: new Date() }
          });
          logger.info(`[Cron] Quota warning email sent to user ${quota.userId}`);
        } catch (error) {
          logger.error(`[Cron] Failed to send quota warning to user ${quota.userId}:`, error);
        }
      }
      
      logger.info(`[Cron] Quota warning check completed: ${quotas.length} warnings sent`);
    } catch (error) {
      logger.error('[Cron] Quota warning check failed:', error);
    }
  });
  
  logger.info('✅ All recurring background jobs scheduled');
}

module.exports = {
  quotaSyncWorker,
  cleanupWorker,
  thumbnailWorker,
  virusScanWorker,
  sensitiveDataScanWorker,
  orphanedFilesWorker,
  quotaWarningWorker,
  scheduleRecurringJobs
};

