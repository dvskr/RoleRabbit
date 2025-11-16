/**
 * Cache Invalidation Utility
 * 
 * Manages cache invalidation for ATS scores and other cached data
 * when resume is edited.
 */

import { logger } from './logger';

interface CacheEntry {
  resumeId: string;
  type: 'ats' | 'tailor' | 'recommendations';
  timestamp: number;
  isStale: boolean;
}

class CacheInvalidationManager {
  private cache: Map<string, CacheEntry>;
  private staleThreshold: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
  }

  /**
   * Mark a cache entry as fresh
   */
  markFresh(resumeId: string, type: 'ats' | 'tailor' | 'recommendations'): void {
    const key = `${resumeId}:${type}`;
    this.cache.set(key, {
      resumeId,
      type,
      timestamp: Date.now(),
      isStale: false,
    });
    logger.debug('Cache marked as fresh', { resumeId, type });
  }

  /**
   * Mark a cache entry as stale (when resume is edited)
   */
  markStale(resumeId: string, type?: 'ats' | 'tailor' | 'recommendations'): void {
    if (type) {
      const key = `${resumeId}:${type}`;
      const entry = this.cache.get(key);
      if (entry) {
        entry.isStale = true;
        this.cache.set(key, entry);
        logger.debug('Cache marked as stale', { resumeId, type });
      }
    } else {
      // Mark all cache entries for this resume as stale
      for (const [key, entry] of this.cache.entries()) {
        if (entry.resumeId === resumeId) {
          entry.isStale = true;
          this.cache.set(key, entry);
        }
      }
      logger.debug('All cache entries marked as stale', { resumeId });
    }
  }

  /**
   * Check if a cache entry is stale
   */
  isStale(resumeId: string, type: 'ats' | 'tailor' | 'recommendations'): boolean {
    const key = `${resumeId}:${type}`;
    const entry = this.cache.get(key);
    
    if (!entry) {
      return true; // No cache entry = stale
    }
    
    // Check if manually marked as stale
    if (entry.isStale) {
      return true;
    }
    
    // Check if cache is too old
    const age = Date.now() - entry.timestamp;
    if (age > this.staleThreshold) {
      return true;
    }
    
    return false;
  }

  /**
   * Invalidate (remove) a cache entry
   */
  invalidate(resumeId: string, type?: 'ats' | 'tailor' | 'recommendations'): void {
    if (type) {
      const key = `${resumeId}:${type}`;
      this.cache.delete(key);
      logger.debug('Cache invalidated', { resumeId, type });
    } else {
      // Invalidate all cache entries for this resume
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${resumeId}:`)) {
          this.cache.delete(key);
        }
      }
      logger.debug('All cache entries invalidated', { resumeId });
    }
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
    logger.debug('All cache cleared');
  }

  /**
   * Get cache status for debugging
   */
  getStatus(resumeId: string): Record<string, boolean> {
    return {
      ats: this.isStale(resumeId, 'ats'),
      tailor: this.isStale(resumeId, 'tailor'),
      recommendations: this.isStale(resumeId, 'recommendations'),
    };
  }
}

// Export singleton instance
export const cacheInvalidation = new CacheInvalidationManager();

