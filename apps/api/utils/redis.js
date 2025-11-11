/**
 * Redis Cache Service
 * Provides caching layer for API responses
 */

const Redis = require('ioredis');
const logger = require('./logger');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 300; // 5 minutes default TTL
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      // Check if Redis URL is provided
      const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING;

      if (!redisUrl) {
        logger.warn('⚠️ Redis URL not configured - caching disabled');
        return false;
      }

      this.client = new Redis(redisUrl, {
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
      });

      await this.client.connect();

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('✅ Redis connected successfully');
      });

      this.client.on('error', (err) => {
        logger.error('❌ Redis error:', err.message);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('⚠️  Redis connection closed');
      });

      return true;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Cached value or null
   */
  async get(key) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (value) {
        logger.debug('✅ Cache HIT:', key);
        return JSON.parse(value);
      }
      logger.debug('❌ Cache MISS:', key);
      return null;
    } catch (error) {
      logger.error('Redis GET error:', error.message);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 300)
   */
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttl, serialized);
      logger.debug('✅ Cache SET:', key, `(TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error.message);
      return false;
    }
  }

  /**
   * Delete key from cache
   * @param {string|string[]} keys - Cache key(s) to delete
   */
  async del(keys) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      const result = await this.client.del(...keysArray);
      logger.debug('✅ Cache DEL:', keysArray.join(', '));
      return result;
    } catch (error) {
      logger.error('Redis DEL error:', error.message);
      return false;
    }
  }

  /**
   * Delete keys matching pattern
   * @param {string} pattern - Pattern to match (e.g., 'files:user-123:*')
   */
  async deletePattern(pattern) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        logger.debug(`✅ Cache DEL pattern: ${pattern} (${keys.length} keys)`);
      }
      return true;
    } catch (error) {
      logger.error('Redis DELETE PATTERN error:', error.message);
      return false;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error.message);
      return false;
    }
  }

  /**
   * Get TTL of a key
   * @param {string} key - Cache key
   * @returns {Promise<number>} - TTL in seconds, -1 if no expiry, -2 if doesn't exist
   */
  async ttl(key) {
    if (!this.isConnected || !this.client) {
      return -2;
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis TTL error:', error.message);
      return -2;
    }
  }

  /**
   * Increment a counter
   * @param {string} key - Cache key
   * @returns {Promise<number>} - New value
   */
  async incr(key) {
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Redis INCR error:', error.message);
      return 0;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('✅ Redis disconnected');
    }
  }

  /**
   * Generate cache key for files
   * @param {string} userId - User ID
   * @param {object} options - Query options
   * @returns {string} - Cache key
   */
  generateFilesCacheKey(userId, options = {}) {
    const { folderId, includeDeleted, type, search, limit, cursor } = options;
    const parts = ['files', userId];

    if (folderId) parts.push(`folder:${folderId}`);
    if (includeDeleted) parts.push('deleted');
    if (type) parts.push(`type:${type}`);
    if (search) parts.push(`search:${search}`);
    if (limit) parts.push(`limit:${limit}`);
    if (cursor) parts.push(`cursor:${cursor}`);

    return parts.join(':');
  }

  /**
   * Invalidate all file caches for a user
   * @param {string} userId - User ID
   */
  async invalidateUserFiles(userId) {
    await this.deletePattern(`files:${userId}:*`);
    await this.del(`quota:${userId}`);
  }
}

// Create singleton instance
const redisService = new RedisService();

module.exports = redisService;
