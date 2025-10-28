/**
 * Redis-based caching utility
 * Falls back to PM2 memory cache if Redis not available
 */

class Cache {
  constructor() {
    this.localCache = new Map();
    this.useLocal = true; // Use local cache by default
  }

  /**
   * Get value from cache
   */
  async get(key) {
    try {
      return this.localCache.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = 3600) {
    try {
      this.localCache.set(key, value);
      
      // Set expiration
      setTimeout(() => {
        this.localCache.delete(key);
      }, ttl * 1000);
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key) {
    try {
      return this.localCache.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      this.localCache.clear();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache stats
   */
  async getStats() {
    return {
      size: this.localCache.size,
      type: 'local-memory'
    };
  }
}

const cache = new Cache();

module.exports = cache;

