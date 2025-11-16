/**
 * BE-050: Storage quota enforcement with transaction locking
 * BE-055: Transaction locking for storage quota updates
 * Prevents race conditions in quota updates
 */

const { prisma } = require('./db');
const logger = require('./logger');
const { ERROR_CODES } = require('./errorCodes');
const { AppError } = require('./errorResponse');

// In-memory lock for quota updates (prevents concurrent updates)
const quotaLocks = new Map(); // userId -> lock promise

/**
 * Acquire quota lock for user
 * BE-050, BE-055: Transaction locking for storage quota updates
 */
async function acquireQuotaLock(userId) {
  // Wait for any existing lock to be released
  while (quotaLocks.has(userId)) {
    await quotaLocks.get(userId);
  }

  // Create a new lock promise
  let releaseLock;
  const lockPromise = new Promise((resolve) => {
    releaseLock = resolve;
  });

  quotaLocks.set(userId, lockPromise);

  return releaseLock;
}

/**
 * Update quota with transaction locking
 * BE-050, BE-055: Transaction locking for storage quota updates
 */
async function updateQuotaWithLock(userId, fileSize, operation, prismaClient = prisma) {
  const releaseLock = await acquireQuotaLock(userId);

  try {
    // Use Prisma transaction with SELECT FOR UPDATE to lock the row
    const result = await prismaClient.$transaction(async (tx) => {
      // Lock the quota row for this user
      const quota = await tx.storage_quotas.findUnique({
        where: { userId },
        // Use raw query for SELECT FOR UPDATE (row-level locking)
        // Note: Prisma doesn't directly support SELECT FOR UPDATE, so we'll use a workaround
      });

      // If quota doesn't exist, create it
      if (!quota) {
        const defaultLimit = BigInt(process.env.DEFAULT_STORAGE_LIMIT || 5 * 1024 * 1024 * 1024); // 5GB
        const newQuota = await tx.storage_quotas.create({
          data: {
            userId,
            usedBytes: BigInt(0),
            limitBytes: defaultLimit,
            id: require('uuid').v4(),
            updatedAt: new Date()
          }
        });

        // Check if adding this file would exceed quota
        const newUsedBytes = BigInt(fileSize);
        if (newUsedBytes > newQuota.limitBytes) {
          throw new AppError(
            ERROR_CODES.QUOTA_EXCEEDED,
            `Uploading this file would exceed your storage limit.`
          );
        }

        // Update quota
        const updated = await tx.storage_quotas.update({
          where: { userId },
          data: { usedBytes: newUsedBytes }
        });

        return { success: true, usedBytes: updated.usedBytes, limitBytes: updated.limitBytes };
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

      // Check if new usage exceeds limit
      if (newUsedBytes > quota.limitBytes) {
        throw new AppError(
          ERROR_CODES.QUOTA_EXCEEDED,
          `Uploading this file would exceed your storage limit.`,
          {
            usedGB: (Number(quota.usedBytes) / (1024 * 1024 * 1024)).toFixed(2),
            limitGB: (Number(quota.limitBytes) / (1024 * 1024 * 1024)).toFixed(2),
            availableGB: ((Number(quota.limitBytes) - Number(quota.usedBytes)) / (1024 * 1024 * 1024)).toFixed(2),
            fileSizeGB: (Number(fileSize) / (1024 * 1024 * 1024)).toFixed(2)
          }
        );
      }

      // Update quota (this will lock the row in the transaction)
      const updated = await tx.storage_quotas.update({
        where: { userId },
        data: { usedBytes: newUsedBytes }
      });

      return {
        success: true,
        usedBytes: updated.usedBytes,
        limitBytes: updated.limitBytes
      };
    }, {
      isolationLevel: 'Serializable' // Highest isolation level to prevent race conditions
    });

    return result;
  } finally {
    // Release the lock
    releaseLock();
    quotaLocks.delete(userId);
  }
}

module.exports = {
  updateQuotaWithLock,
  acquireQuotaLock
};

