/**
 * Redis Caching Service
 * Provides caching layer for API responses and query results
 */

const Redis = require('ioredis');
const logger = require('./logger');

class RedisCache {
  constructor() {
    this.enabled = process.env.REDIS_ENABLED === 'true';
    this.client = null;
    this.defaultTTL = parseInt(process.env.REDIS_DEFAULT_TTL || '300'); // 5 minutes default
    this.connected = false;

    if (this.enabled) {
      this.initialize();
    }
  }

  /**
   * Initialize Redis connection
   */
  initialize() {
    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        enableOfflineQueue: true,
      };

      this.client = new Redis(redisConfig);

      this.client.on('connect', () => {
        logger.info('Redis client connecting...');
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
        this.connected = true;
      });

      this.client.on('error', (err) => {
        logger.error('Redis client error:', err);
        this.connected = false;
      });

      this.client.on('close', () => {
        logger.warn('Redis connection closed');
        this.connected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis client reconnecting...');
      });
    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
      this.enabled = false;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.enabled || !this.connected) {
      return null;
    }

    try {
      const value = await this.client.get(key);

      if (value) {
        logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(value);
      }

      logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.enabled || !this.connected) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);

      if (ttl > 0) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }

      logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key) {
    if (!this.enabled || !this.connected) {
      return false;
    }

    try {
      await this.client.del(key);
      logger.debug(`Cache DEL: ${key}`);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async delPattern(pattern) {
    if (!this.enabled || !this.connected) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);

      if (keys.length === 0) {
        return 0;
      }

      await this.client.del(...keys);
      logger.debug(`Cache DEL pattern: ${pattern} (${keys.length} keys)`);
      return keys.length;
    } catch (error) {
      logger.error('Redis DEL pattern error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!this.enabled || !this.connected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  /**
   * Set expiration on key
   */
  async expire(key, ttl) {
    if (!this.enabled || !this.connected) {
      return false;
    }

    try {
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  /**
   * Increment counter
   */
  async incr(key, amount = 1) {
    if (!this.enabled || !this.connected) {
      return null;
    }

    try {
      const result = await this.client.incrby(key, amount);
      return result;
    } catch (error) {
      logger.error('Redis INCR error:', error);
      return null;
    }
  }

  /**
   * Get or set (cache-aside pattern)
   */
  async getOrSet(key, fetchFn, ttl = this.defaultTTL) {
    // Try to get from cache
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch data
    try {
      const data = await fetchFn();

      // Store in cache
      await this.set(key, data, ttl);

      return data;
    } catch (error) {
      logger.error('getOrSet fetch error:', error);
      throw error;
    }
  }

  /**
   * Cache with tags for bulk invalidation
   */
  async setWithTags(key, value, tags = [], ttl = this.defaultTTL) {
    await this.set(key, value, ttl);

    // Store key in tag sets
    for (const tag of tags) {
      await this.client.sadd(`tag:${tag}`, key);
      await this.expire(`tag:${tag}`, ttl + 60); // Tag expires 1 min after data
    }
  }

  /**
   * Invalidate by tag
   */
  async invalidateTag(tag) {
    if (!this.enabled || !this.connected) {
      return 0;
    }

    try {
      const keys = await this.client.smembers(`tag:${tag}`);

      if (keys.length === 0) {
        return 0;
      }

      // Delete all keys with this tag
      await this.client.del(...keys);

      // Delete the tag set itself
      await this.client.del(`tag:${tag}`);

      logger.info(`Invalidated tag: ${tag} (${keys.length} keys)`);
      return keys.length;
    } catch (error) {
      logger.error('invalidateTag error:', error);
      return 0;
    }
  }

  /**
   * Flush all cache
   */
  async flushAll() {
    if (!this.enabled || !this.connected) {
      return false;
    }

    try {
      await this.client.flushdb();
      logger.warn('Cache flushed');
      return true;
    } catch (error) {
      logger.error('Redis FLUSHDB error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    if (!this.enabled || !this.connected) {
      return null;
    }

    try {
      const info = await this.client.info('stats');
      const dbsize = await this.client.dbsize();
      const memory = await this.client.info('memory');

      return {
        connected: this.connected,
        dbsize,
        info: info.split('\r\n').reduce((acc, line) => {
          const [key, value] = line.split(':');
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {}),
        memory: memory.split('\r\n').reduce((acc, line) => {
          const [key, value] = line.split(':');
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error('getStats error:', error);
      return null;
    }
  }

  /**
   * Close connection
   */
  async close() {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
      logger.info('Redis connection closed');
    }
  }
}

// Singleton instance
const redisCache = new RedisCache();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redisCache.close();
});

process.on('SIGINT', async () => {
  await redisCache.close();
});

module.exports = redisCache;
