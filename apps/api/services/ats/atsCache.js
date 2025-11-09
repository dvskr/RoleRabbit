const crypto = require('crypto');
const logger = require('../../utils/logger');

/**
 * INTELLIGENT CACHING SYSTEM
 * 
 * Caches AI results to make the system:
 * - Fast (instant results for cached JDs)
 * - Cost-effective ($0.02 first time, $0.00 after)
 * - Scalable (handles millions of users)
 * 
 * Cache Strategy:
 * - In-memory cache (LRU, max 1000 entries)
 * - TTL: 7 days (jobs don't change often)
 * - Smart invalidation (detect JD changes)
 */

class ATSCache {
  constructor(maxSize = 1000, ttl = 7 * 24 * 60 * 60 * 1000) { // 7 days
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Generate cache key from job description
   * @param {string} jobDescription 
   * @returns {string} SHA-256 hash
   */
  generateKey(jobDescription) {
    return crypto
      .createHash('sha256')
      .update(jobDescription.trim().toLowerCase())
      .digest('hex')
      .substring(0, 16); // First 16 chars is enough
  }

  /**
   * Get cached result
   * @param {string} jobDescription 
   * @returns {Object|null}
   */
  get(jobDescription) {
    const key = this.generateKey(jobDescription);
    const cached = this.cache.get(key);

    if (!cached) {
      this.misses++;
      logger.debug('💾 Cache MISS', { key, hit_rate: this.getHitRate() });
      return null;
    }

    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      this.misses++;
      logger.debug('💾 Cache EXPIRED', { key, age_hours: Math.floor((Date.now() - cached.timestamp) / (1000 * 60 * 60)) });
      return null;
    }

    this.hits++;
    logger.info('💾 Cache HIT', { 
      key, 
      hit_rate: this.getHitRate(),
      cost_saved: '$0.02'
    });

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, cached);

    return cached.data;
  }

  /**
   * Store result in cache
   * @param {string} jobDescription 
   * @param {Object} data 
   */
  set(jobDescription, data) {
    const key = this.generateKey(jobDescription);

    // Implement LRU: remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      logger.debug('💾 Cache EVICTION', { evicted_key: firstKey, reason: 'max_size' });
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key
    });

    logger.debug('💾 Cache SET', { key, cache_size: this.cache.size });
  }

  /**
   * Get cache statistics
   * @returns {Object}
   */
  getStats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      total_requests: total,
      hit_rate: this.getHitRate(),
      cache_size: this.cache.size,
      max_size: this.maxSize,
      estimated_cost_saved: `$${(this.hits * 0.02).toFixed(2)}`
    };
  }

  /**
   * Get hit rate
   * @returns {string} Percentage
   */
  getHitRate() {
    const total = this.hits + this.misses;
    if (total === 0) return '0%';
    return `${Math.round((this.hits / total) * 100)}%`;
  }

  /**
   * Clear cache
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    logger.info('💾 Cache CLEARED', { cleared_entries: size });
  }

  /**
   * Manually invalidate a specific job description
   * @param {string} jobDescription 
   */
  invalidate(jobDescription) {
    const key = this.generateKey(jobDescription);
    const existed = this.cache.has(key);
    this.cache.delete(key);
    
    if (existed) {
      logger.info('💾 Cache INVALIDATED', { key });
    }
    
    return existed;
  }
}

// Global cache instance
const atsCache = new ATSCache();

/**
 * Cache middleware for AI operations
 * @param {string} operation - Operation name
 * @param {string} key - Cache key
 * @param {Function} fn - Function to execute if not cached
 * @returns {Promise<Object>}
 */
async function withCache(operation, key, fn) {
  // Check cache first
  const cached = atsCache.get(key);
  if (cached) {
    logger.info(`🚀 ${operation}: Using cached result`);
    return {
      ...cached,
      from_cache: true,
      cost: '$0.00'
    };
  }

  // Execute function
  logger.info(`🤖 ${operation}: Calling AI (not cached)`);
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    // Cache the result
    atsCache.set(key, result);
    
    logger.info(`✅ ${operation}: Completed in ${duration}ms`, {
      cost: '$0.02',
      cached: true
    });
    
    return {
      ...result,
      from_cache: false,
      cost: '$0.02',
      duration_ms: duration
    };
    
  } catch (error) {
    logger.error(`❌ ${operation}: Failed`, { error: error.message });
    throw error;
  }
}

module.exports = {
  ATSCache,
  atsCache,
  withCache
};

