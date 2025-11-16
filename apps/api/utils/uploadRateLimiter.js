/**
 * Upload Rate Limiting and Concurrent Upload Tracking
 * BE-011: Rate limiting per user (max 10 uploads per minute)
 * BE-012: Concurrent upload limit per user (max 3 simultaneous uploads)
 */

const logger = require('./logger');

// BE-011: Rate limiting configuration
const UPLOAD_RATE_LIMIT = {
  max: 10, // Max 10 uploads
  timeWindow: 60 * 1000 // Per minute (60 seconds)
};

// BE-012: Concurrent upload limit
const MAX_CONCURRENT_UPLOADS = 3;

// In-memory stores (in production, use Redis)
const uploadRateLimitStore = new Map(); // userId -> { count, resetTime }
const concurrentUploadsStore = new Map(); // userId -> Set of upload IDs

/**
 * BE-011: Check upload rate limit for user
 */
function checkUploadRateLimit(userId) {
  const now = Date.now();
  const key = `upload_rate:${userId}`;
  const limitData = uploadRateLimitStore.get(key);

  if (limitData) {
    // Check if time window has passed
    if (now - limitData.resetTime > UPLOAD_RATE_LIMIT.timeWindow) {
      // Reset counter
      uploadRateLimitStore.set(key, {
        count: 1,
        resetTime: now
      });
      return {
        allowed: true,
        remaining: UPLOAD_RATE_LIMIT.max - 1,
        resetTime: now + UPLOAD_RATE_LIMIT.timeWindow
      };
    }

    // Check if limit exceeded
    if (limitData.count >= UPLOAD_RATE_LIMIT.max) {
      const ttl = UPLOAD_RATE_LIMIT.timeWindow - (now - limitData.resetTime);
      return {
        allowed: false,
        error: `Upload rate limit exceeded. Maximum ${UPLOAD_RATE_LIMIT.max} uploads per minute. Please wait ${Math.ceil(ttl / 1000)} seconds.`,
        resetTime: limitData.resetTime + UPLOAD_RATE_LIMIT.timeWindow
      };
    }

    // Increment counter
    limitData.count++;
    uploadRateLimitStore.set(key, limitData);
    return {
      allowed: true,
      remaining: UPLOAD_RATE_LIMIT.max - limitData.count,
      resetTime: limitData.resetTime + UPLOAD_RATE_LIMIT.timeWindow
    };
  } else {
    // First upload
    uploadRateLimitStore.set(key, {
      count: 1,
      resetTime: now
    });
    return {
      allowed: true,
      remaining: UPLOAD_RATE_LIMIT.max - 1,
      resetTime: now + UPLOAD_RATE_LIMIT.timeWindow
    };
  }
}

/**
 * BE-012: Check concurrent upload limit for user
 */
function checkConcurrentUploadLimit(userId) {
  const uploads = concurrentUploadsStore.get(userId) || new Set();
  
  if (uploads.size >= MAX_CONCURRENT_UPLOADS) {
    return {
      allowed: false,
      error: `Concurrent upload limit exceeded. Maximum ${MAX_CONCURRENT_UPLOADS} simultaneous uploads allowed.`,
      current: uploads.size
    };
  }

  return {
    allowed: true,
    current: uploads.size,
    remaining: MAX_CONCURRENT_UPLOADS - uploads.size
  };
}

/**
 * BE-012: Register concurrent upload
 */
function registerConcurrentUpload(userId, uploadId) {
  if (!concurrentUploadsStore.has(userId)) {
    concurrentUploadsStore.set(userId, new Set());
  }
  concurrentUploadsStore.get(userId).add(uploadId);
  logger.debug(`Registered concurrent upload ${uploadId} for user ${userId}. Current: ${concurrentUploadsStore.get(userId).size}`);
}

/**
 * BE-012: Unregister concurrent upload
 */
function unregisterConcurrentUpload(userId, uploadId) {
  const uploads = concurrentUploadsStore.get(userId);
  if (uploads) {
    uploads.delete(uploadId);
    if (uploads.size === 0) {
      concurrentUploadsStore.delete(userId);
    }
    logger.debug(`Unregistered concurrent upload ${uploadId} for user ${userId}. Remaining: ${uploads.size}`);
  }
}

/**
 * Cleanup old rate limit entries
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, data] of uploadRateLimitStore.entries()) {
    if (now - data.resetTime > UPLOAD_RATE_LIMIT.timeWindow * 2) {
      uploadRateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

module.exports = {
  checkUploadRateLimit,
  checkConcurrentUploadLimit,
  registerConcurrentUpload,
  unregisterConcurrentUpload,
  UPLOAD_RATE_LIMIT,
  MAX_CONCURRENT_UPLOADS
};

