/**
 * Redis Cache Utility
 * Provides caching layer for file lists, folder structures, and storage queries
 */

const Redis = require('ioredis');
const logger = require('./logger');

// Redis client instance
let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis connection
 */
function initializeRedis() {
  try {
    // Check if Redis is enabled
    if (process.env.REDIS_ENABLED === 'false') {
      logger.info('Redis caching is disabled via environment variable');
      return null;
    }

    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB) || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true
    };

    redisClient = new Redis(redisConfig);

    redisClient.on('connect', () => {
      logger.info('✅ Redis cache connected successfully');
      isConnected = true;
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis cache is ready');
    });

    redisClient.on('error', (error) => {
      logger.warn('⚠️ Redis cache error (will fallback to no-cache):', error.message);
      isConnected = false;
    });

    redisClient.on('close', () => {
      logger.warn('⚠️ Redis cache connection closed');
      isConnected = false;
    });

    redisClient.on('reconnecting', () => {
      logger.info('🔄 Redis cache reconnecting...');
    });

    // Attempt to connect
    redisClient.connect().catch((error) => {
      logger.warn('⚠️ Failed to connect to Redis cache (will operate without cache):', error.message);
      isConnected = false;
    });

    return redisClient;
  } catch (error) {
    logger.warn('⚠️ Redis initialization failed (will operate without cache):', error.message);
    return null;
  }
}

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Cached value or null
 */
async function get(key) {
  if (!redisClient || !isConnected) {
    return null;
  }

  try {
    const value = await redisClient.get(key);
    if (!value) {
      return null;
    }

    const parsed = JSON.parse(value);
    logger.debug(`[CACHE HIT] ${key}`);
    return parsed;
  } catch (error) {
    logger.warn(`Redis cache get error for key "${key}":`, error.message);
    return null;
  }
}

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 * @returns {Promise<boolean>} - Success status
 */
async function set(key, value, ttl = 300) {
  if (!redisClient || !isConnected) {
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    await redisClient.setex(key, ttl, serialized);
    logger.debug(`[CACHE SET] ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    logger.warn(`Redis cache set error for key "${key}":`, error.message);
    return false;
  }
}

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Success status
 */
async function del(key) {
  if (!redisClient || !isConnected) {
    return false;
  }

  try {
    await redisClient.del(key);
    logger.debug(`[CACHE DEL] ${key}`);
    return true;
  } catch (error) {
    logger.warn(`Redis cache delete error for key "${key}":`, error.message);
    return false;
  }
}

/**
 * Delete all keys matching a pattern
 * @param {string} pattern - Key pattern (e.g., "user:123:*")
 * @returns {Promise<number>} - Number of keys deleted
 */
async function delPattern(pattern) {
  if (!redisClient || !isConnected) {
    return 0;
  }

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }

    const deletedCount = await redisClient.del(...keys);
    logger.debug(`[CACHE DEL PATTERN] ${pattern} (${deletedCount} keys deleted)`);
    return deletedCount;
  } catch (error) {
    logger.warn(`Redis cache delete pattern error for "${pattern}":`, error.message);
    return 0;
  }
}

/**
 * Invalidate all cache for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of keys deleted
 */
async function invalidateUser(userId) {
  return delPattern(`user:${userId}:*`);
}

/**
 * Invalidate file list cache for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of keys deleted
 */
async function invalidateFileList(userId) {
  return delPattern(`user:${userId}:files:*`);
}

/**
 * Invalidate folder cache for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of keys deleted
 */
async function invalidateFolders(userId) {
  return delPattern(`user:${userId}:folders:*`);
}

/**
 * Invalidate specific file cache
 * @param {string} userId - User ID
 * @param {string} fileId - File ID
 * @returns {Promise<boolean>} - Success status
 */
async function invalidateFile(userId, fileId) {
  return del(`user:${userId}:file:${fileId}`);
}

/**
 * Check if Redis is available
 * @returns {boolean} - Connection status
 */
function isAvailable() {
  return isConnected && redisClient !== null;
}

/**
 * Close Redis connection
 */
async function close() {
  if (redisClient) {
    await redisClient.quit();
    logger.info('✅ Redis cache connection closed');
    isConnected = false;
  }
}

/**
 * Generate cache key for file list
 * @param {string} userId - User ID
 * @param {object} filters - Query filters
 * @returns {string} - Cache key
 */
function getFileListKey(userId, filters = {}) {
  const { folderId, type, page, limit, showDeleted, showArchived } = filters;
  const parts = [
    'user', userId, 'files',
    `folder:${folderId || 'all'}`,
    `type:${type || 'all'}`,
    `page:${page || 1}`,
    `limit:${limit || 50}`,
    `deleted:${showDeleted || false}`,
    `archived:${showArchived || false}`
  ];
  return parts.join(':');
}

/**
 * Generate cache key for folder list
 * @param {string} userId - User ID
 * @returns {string} - Cache key
 */
function getFolderListKey(userId) {
  return `user:${userId}:folders:list`;
}

/**
 * Generate cache key for single file
 * @param {string} userId - User ID
 * @param {string} fileId - File ID
 * @returns {string} - Cache key
 */
function getFileKey(userId, fileId) {
  return `user:${userId}:file:${fileId}`;
}

/**
 * Generate cache key for storage analytics
 * @param {string} userId - User ID
 * @returns {string} - Cache key
 */
function getAnalyticsKey(userId) {
  return `user:${userId}:analytics`;
}

/**
 * Cache TTL constants (in seconds)
 */
const TTL = {
  FILE_LIST: 300,      // 5 minutes
  FOLDER_LIST: 600,    // 10 minutes (folders change less frequently)
  FILE_DETAIL: 300,    // 5 minutes
  ANALYTICS: 900,      // 15 minutes (heavy query, cache longer)
  SEARCH: 180          // 3 minutes (search results may change)
};

module.exports = {
  initializeRedis,
  get,
  set,
  del,
  delPattern,
  invalidateUser,
  invalidateFileList,
  invalidateFolders,
  invalidateFile,
  isAvailable,
  close,
  getFileListKey,
  getFolderListKey,
  getFileKey,
  getAnalyticsKey,
  TTL
};
