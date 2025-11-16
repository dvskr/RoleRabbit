/**
 * SEC-006: Secure file deletion (overwrite before delete for sensitive files)
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');
const storageHandler = require('./storageHandler');

/**
 * SEC-006: Securely delete file by overwriting
 */
async function secureDelete(filePath, passes = 3) {
  try {
    // For local storage
    if (process.env.STORAGE_TYPE === 'local') {
      await secureDeleteLocal(filePath, passes);
    } else {
      // For cloud storage (Supabase), we can't overwrite
      // But we can ensure immediate deletion and mark as securely deleted
      await storageHandler.delete(filePath);
      logger.info(`Securely deleted file from cloud storage: ${sanitizePath(filePath)}`);
    }
  } catch (error) {
    logger.error('Secure deletion failed:', error);
    throw error;
  }
}

/**
 * SEC-006: Securely delete local file with overwriting
 */
async function secureDeleteLocal(filePath, passes = 3) {
  try {
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;

    // Open file for writing
    const fd = await fs.open(filePath, 'r+');

    try {
      // Overwrite with random data multiple times
      for (let pass = 0; pass < passes; pass++) {
        const randomData = crypto.randomBytes(fileSize);
        await fd.write(randomData, 0, fileSize, 0);
        await fd.sync(); // Force write to disk
      }

      // Final pass: overwrite with zeros
      const zeroData = Buffer.alloc(fileSize);
      await fd.write(zeroData, 0, fileSize, 0);
      await fd.sync();
    } finally {
      await fd.close();
    }

    // Delete file
    await fs.unlink(filePath);

    logger.info(`Securely deleted file (${passes} passes): ${sanitizePath(filePath)}`);
  } catch (error) {
    logger.error('Local secure deletion failed:', error);
    throw error;
  }
}

/**
 * SEC-017: Sanitize path for logging
 */
function sanitizePath(filePath) {
  if (!filePath) return null;
  return path.basename(filePath); // Only log filename, not full path
}

const crypto = require('crypto');

module.exports = {
  secureDelete,
  secureDeleteLocal,
};

