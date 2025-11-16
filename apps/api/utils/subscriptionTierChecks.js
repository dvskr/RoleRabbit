/**
 * SEC-022, SEC-023, SEC-024: Subscription tier checks for file size, storage quota, and file count limits
 */

const { prisma } = require('./db');
const logger = require('./logger');
const { getStorageQuotaLimits, getQuotaLimitForTier } = require('../config/scaling');

/**
 * SEC-022: Check file size limit by subscription tier
 */
async function checkFileSizeLimit(userId, fileSize) {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    if (!user) {
      return { allowed: false, error: 'User not found' };
    }

    const limits = getQuotaLimitForTier(user.subscriptionTier);
    
    if (fileSize > limits.maxFileSize) {
      return {
        allowed: false,
        error: `File size exceeds limit for ${user.subscriptionTier} tier: ${(limits.maxFileSize / 1024 / 1024).toFixed(0)}MB`,
        limit: limits.maxFileSize,
        tier: user.subscriptionTier,
      };
    }

    return { allowed: true, limit: limits.maxFileSize, tier: user.subscriptionTier };
  } catch (error) {
    logger.error('File size limit check failed:', error);
    return { allowed: false, error: 'Failed to check file size limit' };
  }
}

/**
 * SEC-023: Check storage quota limit by subscription tier
 */
async function checkStorageQuotaLimit(userId, additionalBytes = 0) {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    if (!user) {
      return { allowed: false, error: 'User not found' };
    }

    const limits = getQuotaLimitForTier(user.subscriptionTier);
    
    let quota = await prisma.storage_quotas.findUnique({
      where: { userId },
    });

    // Create quota if it doesn't exist
    if (!quota) {
      quota = await prisma.storage_quotas.create({
        data: {
          userId,
          usedBytes: BigInt(0),
          limitBytes: BigInt(limits.limitBytes),
          tier: user.subscriptionTier || 'FREE',
          id: require('uuid').v4(),
          updatedAt: new Date()
        },
      });
    }

    // Update limitBytes if user tier changed or limit is wrong
    if (Number(quota.limitBytes) !== limits.limitBytes) {
      quota = await prisma.storage_quotas.update({
        where: { userId },
        data: {
          limitBytes: BigInt(limits.limitBytes),
          tier: user.subscriptionTier || 'FREE',
        },
      });
    }

    const currentUsed = Number(quota.usedBytes);
    const newUsed = currentUsed + additionalBytes;
    const available = limits.limitBytes - newUsed;

    if (newUsed > limits.limitBytes) {
      return {
        allowed: false,
        error: `Uploading this file would exceed your storage limit. Available: ${(available / 1024).toFixed(2)} KB, Required: ${(additionalBytes / 1024).toFixed(2)} KB`,
        limit: limits.limitBytes,
        current: currentUsed,
        available: available < 0 ? 0 : available,
        tier: user.subscriptionTier,
      };
    }

    return {
      allowed: true,
      limit: limits.limitBytes,
      current: currentUsed,
      available: available,
      tier: user.subscriptionTier,
    };
  } catch (error) {
    logger.error('Storage quota limit check failed:', error);
    return { allowed: false, error: 'Failed to check storage quota limit' };
  }
}

/**
 * SEC-024: Check file count limit by subscription tier
 */
async function checkFileCountLimit(userId) {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    if (!user) {
      return { allowed: false, error: 'User not found' };
    }

    const limits = getQuotaLimitForTier(user.subscriptionTier);
    
    const fileCount = await prisma.storage_files.count({
      where: {
        userId,
        deletedAt: null,
      },
    });

    if (fileCount >= limits.maxFiles) {
      return {
        allowed: false,
        error: `File count limit reached for ${user.subscriptionTier} tier: ${limits.maxFiles} files`,
        limit: limits.maxFiles,
        current: fileCount,
        tier: user.subscriptionTier,
      };
    }

    return {
      allowed: true,
      limit: limits.maxFiles,
      current: fileCount,
      available: limits.maxFiles - fileCount,
      tier: user.subscriptionTier,
    };
  } catch (error) {
    logger.error('File count limit check failed:', error);
    return { allowed: false, error: 'Failed to check file count limit' };
  }
}

module.exports = {
  checkFileSizeLimit,
  checkStorageQuotaLimit,
  checkFileCountLimit,
};

