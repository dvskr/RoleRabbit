/**
 * Caching Strategy
 * Advanced caching with TTL, invalidation, and multi-layer support
 */

const NodeCache = require('node-cache');

class CacheManager {
  constructor(defaultTTL = 3600) {
    this.cache = new NodeCache({ 
      stdTTL: defaultTTL,
      checkperiod: 600 
    });
    
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Get from cache
   */
  get(key) {
    const value = this.cache.get(key);
    
    if (value !== undefined) {
      this.stats.hits++;
      return value;
    }
    
    this.stats.misses++;
    return null;
  }

  /**
   * Set to cache
   */
  set(key, value, ttl) {
    this.cache.set(key, value, ttl);
    this.stats.sets++;
    return true;
  }

  /**
   * Delete from cache
   */
  delete(key) {
    this.cache.del(key);
    this.stats.deletes++;
    return true;
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.flushAll();
    return true;
  }

  /**
   * Get cache stats
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      keys: this.cache.keys().length
    };
  }
}

// Export singleton instance
module.exports = new CacheManager();

