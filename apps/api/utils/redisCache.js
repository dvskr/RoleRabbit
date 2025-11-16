/**
 * Redis Cache Utility
 * 
 * Caches frequently accessed data to reduce database load.
 * Supports TTL, invalidation, and cache warming.
 */

const { handleCacheError } = require('./errorHandler');

/**
 * Cache TTL (Time To Live) in seconds
 */
const CacheTTL = {
  RESUME_DATA: 300, // 5 minutes
  TEMPLATE_LIST: 3600, // 1 hour
  ATS_RESULT: 1800, // 30 minutes
  USER_PROFILE: 600, // 10 minutes
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600 // 1 hour
};

/**
 * Cache key prefixes
 */
const CachePrefix = {
  RESUME: 'resume:',
  TEMPLATE: 'template:',
  ATS: 'ats:',
  USER: 'user:',
  LIST: 'list:'
};

/**
 * Redis Cache Manager
 */
class RedisCache {
  constructor(redisClient) {
    this.redis = redisClient;
    this.enabled = !!redisClient;
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.enabled) return null;

    try {
      const value = await this.redis.get(key);
      if (!value) return null;

      return JSON.parse(value);
    } catch (error) {
      handleCacheError(error, 'get cache');
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = CacheTTL.MEDIUM) {
    if (!this.enabled) return false;

    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      handleCacheError(error, 'set cache');
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key) {
    if (!this.enabled) return false;

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      handleCacheError(error, 'delete cache');
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern) {
    if (!this.enabled) return 0;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;

      await this.redis.del(...keys);
      return keys.length;
    } catch (error) {
      handleCacheError(error, 'delete pattern');
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!this.enabled) return false;

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      handleCacheError(error, 'check exists');
      return false;
    }
  }

  /**
   * Get remaining TTL for key
   */
  async ttl(key) {
    if (!this.enabled) return -1;

    try {
      return await this.redis.ttl(key);
    } catch (error) {
      handleCacheError(error, 'get ttl');
      return -1;
    }
  }

  /**
   * Increment counter
   */
  async incr(key, ttl = null) {
    if (!this.enabled) return 0;

    try {
      const value = await this.redis.incr(key);
      if (ttl && value === 1) {
        await this.redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      handleCacheError(error, 'increment');
      return 0;
    }
  }
}

/**
 * Resume cache operations
 */
class ResumeCache {
  constructor(cache) {
    this.cache = cache;
  }

  /**
   * Get resume from cache
   */
  async getResume(resumeId) {
    const key = `${CachePrefix.RESUME}${resumeId}`;
    return this.cache.get(key);
  }

  /**
   * Cache resume data
   */
  async setResume(resumeId, resumeData) {
    const key = `${CachePrefix.RESUME}${resumeId}`;
    return this.cache.set(key, resumeData, CacheTTL.RESUME_DATA);
  }

  /**
   * Invalidate resume cache
   */
  async invalidateResume(resumeId) {
    const key = `${CachePrefix.RESUME}${resumeId}`;
    return this.cache.del(key);
  }

  /**
   * Get user's active resume
   */
  async getActiveResume(userId) {
    const key = `${CachePrefix.USER}${userId}:active`;
    return this.cache.get(key);
  }

  /**
   * Cache user's active resume
   */
  async setActiveResume(userId, resumeData) {
    const key = `${CachePrefix.USER}${userId}:active`;
    return this.cache.set(key, resumeData, CacheTTL.RESUME_DATA);
  }

  /**
   * Invalidate all caches for user
   */
  async invalidateUserCaches(userId) {
    const pattern = `${CachePrefix.USER}${userId}:*`;
    return this.cache.delPattern(pattern);
  }
}

/**
 * ATS cache operations
 */
class ATSCache {
  constructor(cache) {
    this.cache = cache;
  }

  /**
   * Generate cache key for ATS result
   */
  getCacheKey(resumeId, jobDescriptionHash) {
    return `${CachePrefix.ATS}${resumeId}:${jobDescriptionHash}`;
  }

  /**
   * Get ATS result from cache
   */
  async getATSResult(resumeId, jobDescriptionHash) {
    const key = this.getCacheKey(resumeId, jobDescriptionHash);
    return this.cache.get(key);
  }

  /**
   * Cache ATS result
   */
  async setATSResult(resumeId, jobDescriptionHash, result) {
    const key = this.getCacheKey(resumeId, jobDescriptionHash);
    return this.cache.set(key, result, CacheTTL.ATS_RESULT);
  }

  /**
   * Invalidate all ATS results for resume
   */
  async invalidateResumeATS(resumeId) {
    const pattern = `${CachePrefix.ATS}${resumeId}:*`;
    return this.cache.delPattern(pattern);
  }
}

/**
 * Template cache operations
 */
class TemplateCache {
  constructor(cache) {
    this.cache = cache;
  }

  /**
   * Get template list from cache
   */
  async getTemplateList() {
    const key = `${CachePrefix.TEMPLATE}list`;
    return this.cache.get(key);
  }

  /**
   * Cache template list
   */
  async setTemplateList(templates) {
    const key = `${CachePrefix.TEMPLATE}list`;
    return this.cache.set(key, templates, CacheTTL.TEMPLATE_LIST);
  }

  /**
   * Get specific template
   */
  async getTemplate(templateId) {
    const key = `${CachePrefix.TEMPLATE}${templateId}`;
    return this.cache.get(key);
  }

  /**
   * Cache specific template
   */
  async setTemplate(templateId, template) {
    const key = `${CachePrefix.TEMPLATE}${templateId}`;
    return this.cache.set(key, template, CacheTTL.TEMPLATE_LIST);
  }
}

/**
 * Cache-aside pattern helper
 * Tries cache first, falls back to database, then caches result
 */
async function cacheAside(cache, key, fetchFn, ttl = CacheTTL.MEDIUM) {
  // Try cache first
  const cached = await cache.get(key);
  if (cached !== null) {
    return { data: cached, fromCache: true };
  }

  // Cache miss, fetch from database
  const data = await fetchFn();

  // Cache the result
  if (data !== null && data !== undefined) {
    await cache.set(key, data, ttl);
  }

  return { data, fromCache: false };
}

/**
 * Middleware: Cache response
 */
function cacheMiddleware(cache, options = {}) {
  const {
    ttl = CacheTTL.MEDIUM,
    keyGenerator = (req) => `${req.method}:${req.originalUrl}`,
    skip = () => false
  } = options;

  return async (req, res, next) => {
    // Skip if condition met or not GET request
    if (skip(req) || req.method !== 'GET') {
      return next();
    }

    const key = keyGenerator(req);

    // Try to get from cache
    const cached = await cache.get(key);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Cache miss
    res.setHeader('X-Cache', 'MISS');

    // Store original send function
    const originalJson = res.json;

    // Override json function to cache response
    res.json = function(data) {
      // Cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, data, ttl).catch(error => {
          handleCacheError(error, 'cache response');
        });
      }

      return originalJson.call(this, data);
    };

    next();
  };
}

/**
 * Create cache instance
 */
function createCache(redisClient) {
  const baseCache = new RedisCache(redisClient);
  
  return {
    base: baseCache,
    resume: new ResumeCache(baseCache),
    ats: new ATSCache(baseCache),
    template: new TemplateCache(baseCache),
    cacheAside: (key, fetchFn, ttl) => cacheAside(baseCache, key, fetchFn, ttl)
  };
}

module.exports = {
  RedisCache,
  ResumeCache,
  ATSCache,
  TemplateCache,
  CacheTTL,
  CachePrefix,
  cacheAside,
  cacheMiddleware,
  createCache
};

