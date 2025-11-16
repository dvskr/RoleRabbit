/**
 * BE-053: Idempotency keys for file uploads
 * Prevents duplicate uploads when client retries
 */

const { prisma } = require('./db');
const logger = require('./logger');
const { ERROR_CODES } = require('./errorCodes');

// In-memory cache for idempotency keys (in production, use Redis)
const idempotencyCache = new Map(); // key -> { result, expiresAt }

// Cleanup expired keys every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of idempotencyCache.entries()) {
    if (data.expiresAt < now) {
      idempotencyCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if idempotency key exists and return cached result
 * BE-053: Idempotency keys for file uploads
 */
async function checkIdempotencyKey(key, userId) {
  if (!key) {
    return { exists: false };
  }

  // Check in-memory cache first
  const cached = idempotencyCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    // Verify it belongs to the same user
    if (cached.userId === userId) {
      logger.info(`Idempotency key ${key} found in cache, returning cached result`);
      return {
        exists: true,
        result: cached.result
      };
    } else {
      logger.warn(`Idempotency key ${key} belongs to different user`);
      return { exists: false };
    }
  }

  // Check database for persistent idempotency keys
  try {
    const idempotencyRecord = await prisma.idempotency_keys.findUnique({
      where: { key }
    });

    if (idempotencyRecord) {
      // Verify it belongs to the same user
      if (idempotencyRecord.userId === userId) {
        // Check if it's still valid (e.g., within 24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() - idempotencyRecord.createdAt.getTime() < maxAge) {
          logger.info(`Idempotency key ${key} found in database, returning cached result`);
          return {
            exists: true,
            result: idempotencyRecord.result ? JSON.parse(idempotencyRecord.result) : null
          };
        } else {
          // Expired, delete it
          await prisma.idempotency_keys.delete({ where: { key } });
        }
      } else {
        logger.warn(`Idempotency key ${key} belongs to different user`);
        return { exists: false };
      }
    }
  } catch (error) {
    // If IdempotencyKey table doesn't exist, just log and continue
    logger.warn('IdempotencyKey table not found, using in-memory cache only:', error.message);
  }

  return { exists: false };
}

/**
 * Store idempotency key result
 */
async function storeIdempotencyKey(key, userId, result, ttl = 24 * 60 * 60 * 1000) {
  if (!key) return;

  const expiresAt = Date.now() + ttl;

  // Store in memory cache
  idempotencyCache.set(key, {
    userId,
    result,
    expiresAt
  });

  // Store in database for persistence (if table exists)
  try {
    await prisma.idempotency_keys.upsert({
      where: { key },
      update: {
        userId,
        result: JSON.stringify(result),
        expiresAt: new Date(expiresAt)
      },
      create: {
        key,
        userId,
        result: JSON.stringify(result),
        expiresAt: new Date(expiresAt)
      }
    });
  } catch (error) {
    // If IdempotencyKey table doesn't exist, just use in-memory cache
    logger.warn('IdempotencyKey table not found, using in-memory cache only:', error.message);
  }
}

/**
 * Generate idempotency key from request
 */
function generateIdempotencyKey(request) {
  // Client should send Idempotency-Key header
  const headerKey = request.headers['idempotency-key'];
  if (headerKey) {
    return headerKey;
  }

  // Fallback: generate from request body hash (less reliable)
  const crypto = require('crypto');
  const bodyHash = crypto.createHash('sha256')
    .update(JSON.stringify(request.body || {}))
    .digest('hex')
    .substring(0, 32);
  
  return `auto_${bodyHash}`;
}

module.exports = {
  checkIdempotencyKey,
  storeIdempotencyKey,
  generateIdempotencyKey
};

