const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('./logger');

const DEFAULT_STORAGE_LIMIT_BYTES = Number(process.env.DEFAULT_STORAGE_LIMIT_BYTES || 1073741824); // 1GB

const BYTES_IN_GB = 1024 ** 3;

function toPercentage(used, limit) {
  if (!limit || limit <= 0) {
    return 0;
  }
  return (used / limit) * 100;
}

function formatNumber(value, precision = 2) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Number.parseFloat(value.toFixed(precision));
}

function normalizeStorageResponse({ used, limit }) {
  return {
    usedBytes: used,
    limitBytes: limit,
    usedGB: formatNumber(used / BYTES_IN_GB),
    limitGB: formatNumber(limit / BYTES_IN_GB),
    percentage: formatNumber(toPercentage(used, limit)),
  };
}

async function getUserStorageInfo(userId) {
  try {
    const [user, usage] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { storageLimit: true },
      }),
      prisma.cloudFile.aggregate({
        _sum: { size: true },
        where: {
          userId,
        },
      }),
    ]);

    const limit = user?.storageLimit ?? DEFAULT_STORAGE_LIMIT_BYTES;
    const used = usage?._sum?.size ?? 0;

    return normalizeStorageResponse({ used, limit });
  } catch (error) {
    logger.error('Failed to compute storage info:', error);
    throw error;
  }
}

async function ensureWithinQuota(userId, fileSize) {
  const storageInfo = await getUserStorageInfo(userId);
  const projectedUsage = storageInfo.usedBytes + fileSize;

  if (projectedUsage > storageInfo.limitBytes) {
    const error = new Error('Storage quota exceeded');
    error.code = 'STORAGE_QUOTA_EXCEEDED';
    error.meta = {
      usedBytes: storageInfo.usedBytes,
      limitBytes: storageInfo.limitBytes,
      attemptedBytes: fileSize,
    };
    throw error;
  }

  return storageInfo;
}

module.exports = {
  getUserStorageInfo,
  ensureWithinQuota,
  DEFAULT_STORAGE_LIMIT_BYTES,
};


