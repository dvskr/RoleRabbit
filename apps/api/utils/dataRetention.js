/**
 * SEC-005: Data retention policies (auto-delete files after expiration)
 */

const { prisma } = require('./db');
const logger = require('./logger');
const storageHandler = require('./storageHandler');

/**
 * SEC-005: Process expired files
 */
async function processExpiredFiles() {
  try {
    const now = new Date();
    
    // Find files that have expired
    const expiredFiles = await prisma.storage_files.findMany({
      where: {
        expiresAt: {
          lte: now,
        },
        deletedAt: null, // Not already deleted
      },
      select: {
        id: true,
        userId: true,
        size: true,
        storagePath: true,
      }
    });

    logger.info(`Found ${expiredFiles.length} expired files to process`);

    for (const file of expiredFiles) {
      try {
        // SEC-005: Auto-delete expired files
        await deleteExpiredFile(file);
      } catch (error) {
        logger.error(`Failed to delete expired file ${file.id}:`, error);
      }
    }

    return {
      processed: expiredFiles.length,
      deleted: expiredFiles.length,
    };
  } catch (error) {
    logger.error('Failed to process expired files:', error);
    throw error;
  }
}

/**
 * Delete expired file
 */
async function deleteExpiredFile(file) {
  try {
    // Delete from storage
    if (file.storagePath) {
      try {
        await storageHandler.delete(file.storagePath);
      } catch (error) {
        logger.warn(`Failed to delete file from storage ${file.storagePath}:`, error);
      }
    }

    // Delete from database
    await prisma.storage_files.delete({
      where: { id: file.id },
    });

    // Update quota
    const quota = await prisma.storage_quotas.findUnique({
      where: { userId: file.userId },
    });

    if (quota) {
      const newUsed = Math.max(0, Number(quota.usedBytes) - Number(file.size));
      await prisma.storage_quotas.update({
        where: { userId: file.userId },
        data: { usedBytes: BigInt(newUsed) },
      });
    }

    logger.info(`Deleted expired file: ${file.id}`);
  } catch (error) {
    logger.error(`Failed to delete expired file ${file.id}:`, error);
    throw error;
  }
}

/**
 * Schedule expired file cleanup (run daily)
 */
function scheduleExpiredFileCleanup() {
  // Run daily at 3 AM
  setInterval(async () => {
    try {
      await processExpiredFiles();
    } catch (error) {
      logger.error('Expired file cleanup job failed:', error);
    }
  }, 24 * 60 * 60 * 1000); // 24 hours

  // Also run immediately on startup
  processExpiredFiles().catch(error => {
    logger.error('Initial expired file cleanup failed:', error);
  });
}

module.exports = {
  processExpiredFiles,
  deleteExpiredFile,
  scheduleExpiredFileCleanup,
};
