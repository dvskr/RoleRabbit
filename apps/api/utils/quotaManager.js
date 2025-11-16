/**
 * Quota Management with Error Handling
 * BE-033: Quota calculation error handling (fallback to recalculating from files)
 */

const logger = require('./logger');
const { v4: uuidv4 } = require('uuid');
const { ERROR_CODES } = require('./errorCodes');

/**
 * Recalculate quota from actual files
 * BE-033: Fallback to recalculating from files
 */
async function recalculateQuotaFromFiles(userId, prisma) {
  try {
    logger.info(`Recalculating quota for user ${userId} from actual files...`);
    
    // Get all non-deleted files for user
    const files = await prisma.storage_files.findMany({
      where: {
        userId,
        deletedAt: null
      },
      select: {
        size: true
      }
    });
    
    // Calculate total size
    const totalSize = files.reduce((sum, file) => {
      return sum + BigInt(file.size || 0);
    }, BigInt(0));
    
    logger.info(`Recalculated quota: ${files.length} files, ${totalSize} bytes`);
    
    return {
      fileCount: files.length,
      totalSize: totalSize,
      success: true
    };
  } catch (error) {
    logger.error('Failed to recalculate quota from files:', error);
    throw error;
  }
}

/**
 * Update quota with error handling and fallback
 * BE-033: Quota calculation error handling
 */
async function updateQuotaSafely(userId, fileSize, operation, prisma) {
  try {
    // Get current quota
    let quota = await prisma.storage_quotas.findUnique({
      where: { userId }
    });
    
    if (!quota) {
      // Create quota if it doesn't exist
      const defaultLimit = BigInt(process.env.DEFAULT_STORAGE_LIMIT || 5 * 1024 * 1024 * 1024); // 5GB
      quota = await prisma.storage_quotas.create({
        data: {
          userId,
          usedBytes: BigInt(0),
          limitBytes: defaultLimit,
          id: uuidv4(),
          updatedAt: new Date()
        }
      });
    }
    
    // Calculate new used bytes
    let newUsedBytes;
    if (operation === 'add') {
      newUsedBytes = BigInt(quota.usedBytes) + BigInt(fileSize);
    } else if (operation === 'remove') {
      newUsedBytes = BigInt(quota.usedBytes) - BigInt(fileSize);
      if (newUsedBytes < 0) {
        newUsedBytes = BigInt(0);
      }
    } else {
      throw new Error(`Invalid operation: ${operation}`);
    }
    
    // Update quota
    await prisma.storage_quotas.update({
      where: { userId },
      data: {
        usedBytes: newUsedBytes
      }
    });
    
    return {
      success: true,
      usedBytes: newUsedBytes
    };
  } catch (error) {
    logger.error('Failed to update quota:', error);
    
    // BE-033: Fallback to recalculating from files
    try {
      logger.warn('Attempting to recalculate quota from files as fallback...');
      const recalculated = await recalculateQuotaFromFiles(userId, prisma);
      
      // Update quota with recalculated value
      await prisma.storage_quotas.update({
        where: { userId },
        data: {
          usedBytes: recalculated.totalSize
        }
      });
      
      logger.info('Successfully recalculated and updated quota from files');
      
      return {
        success: true,
        usedBytes: recalculated.totalSize,
        recalculated: true
      };
    } catch (recalcError) {
      logger.error('Failed to recalculate quota from files:', recalcError);
      
      // Return error but don't fail the operation
      return {
        success: false,
        error: recalcError.message,
        errorCode: ERROR_CODES.DATABASE_ERROR
      };
    }
  }
}

module.exports = {
  updateQuotaSafely,
  recalculateQuotaFromFiles
};

