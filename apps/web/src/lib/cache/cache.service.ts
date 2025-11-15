/**
 * Cache Service with Redis (Upstash)
 * Section 2.14: Performance Optimizations
 *
 * Requirement #1: Redis caching for portfolio templates (1-hour TTL)
 * Requirement #2: Redis caching for published portfolios (5-minute TTL, invalidate on update)
 *
 * Uses Upstash Redis (serverless) for zero-infrastructure caching
 */

import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger/logger';

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CacheTTL = {
  TEMPLATES: 3600, // 1 hour for templates
  PORTFOLIOS: 300, // 5 minutes for published portfolios
  ANALYTICS: 300, // 5 minutes for analytics
  SHARE_LINKS: 1800, // 30 minutes for share links
  USER_SESSION: 86400, // 24 hours for user sessions
  SHORT: 60, // 1 minute for short-lived data
  LONG: 86400, // 24 hours for long-lived data
};

/**
 * Cache key prefixes
 */
export const CachePrefix = {
  TEMPLATE: 'template:',
  TEMPLATES_LIST: 'templates:list:',
  PORTFOLIO: 'portfolio:',
  ANALYTICS: 'analytics:',
  SHARE: 'share:',
  USER: 'user:',
  RATE_LIMIT: 'ratelimit:',
};

/**
 * Cache Service
 */
export class CacheService {
  private redis: Redis | null = null;
  private isEnabled: boolean = false;

  constructor() {
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  private initializeRedis(): void {
    try {
      // Check if Upstash Redis is configured
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;

      if (url && token) {
        this.redis = new Redis({
          url,
          token,
        });
        this.isEnabled = true;
        logger.info('Cache service initialized with Upstash Redis');
      } else {
        logger.warn('Cache service disabled: Upstash Redis not configured');
        this.isEnabled = false;
      }
    } catch (error) {
      logger.error('Failed to initialize cache service', { error });
      this.isEnabled = false;
    }
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.redis) {
      return null;
    }

    try {
      const value = await this.redis.get<string>(key);

      if (!value) {
        logger.debug(`Cache miss: ${key}`);
        return null;
      }

      logger.debug(`Cache hit: ${key}`);
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl: number = CacheTTL.SHORT): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttl, serialized);
      logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      logger.error('Cache set error', { key, error });
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      await this.redis.del(key);
      logger.debug(`Cache delete: ${key}`);
    } catch (error) {
      logger.error('Cache delete error', { key, error });
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      // Upstash Redis REST API doesn't support SCAN
      // For pattern deletion, we need to track keys manually
      // Or use a different approach
      logger.warn('Pattern deletion not fully supported with Upstash Redis REST API', { pattern });

      // Alternative: Use a Set to track keys per pattern
      // This is a workaround for Upstash limitations
    } catch (error) {
      logger.error('Cache delete pattern error', { pattern, error });
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.redis) {
      return false;
    }

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error });
      return false;
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, by: number = 1): Promise<number> {
    if (!this.isEnabled || !this.redis) {
      return 0;
    }

    try {
      return await this.redis.incrby(key, by);
    } catch (error) {
      logger.error('Cache increment error', { key, error });
      return 0;
    }
  }

  /**
   * Get or set (cache-aside pattern)
   */
  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = CacheTTL.SHORT
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch from source
    const value = await factory();

    // Store in cache
    await this.set(key, value, ttl);

    return value;
  }

  /**
   * Invalidate portfolio cache
   * Requirement #2: Invalidate on update
   */
  async invalidatePortfolio(portfolioId: string): Promise<void> {
    await this.delete(`${CachePrefix.PORTFOLIO}${portfolioId}`);
    logger.info(`Invalidated portfolio cache: ${portfolioId}`);
  }

  /**
   * Invalidate template cache
   */
  async invalidateTemplate(templateId: string): Promise<void> {
    await this.delete(`${CachePrefix.TEMPLATE}${templateId}`);
    await this.delete(CachePrefix.TEMPLATES_LIST);
    logger.info(`Invalidated template cache: ${templateId}`);
  }

  /**
   * Clear all cache (use with caution)
   */
  async clearAll(): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      // Upstash doesn't support FLUSHALL via REST API
      // This would need to be done manually or via a different method
      logger.warn('Clear all cache not supported with Upstash Redis REST API');
    } catch (error) {
      logger.error('Cache clear all error', { error });
    }
  }
}

/**
 * Singleton instance
 */
let cacheService: CacheService | null = null;

export const getCacheService = (): CacheService => {
  if (!cacheService) {
    cacheService = new CacheService();
  }
  return cacheService;
};

/**
 * Helper functions for common cache operations
 */

/**
 * Cache portfolio templates
 * Requirement #1: Cache templates with 1-hour TTL
 */
export const cacheTemplates = async (templates: any[]): Promise<void> => {
  const cache = getCacheService();
  await cache.set(CachePrefix.TEMPLATES_LIST, templates, CacheTTL.TEMPLATES);
};

export const getCachedTemplates = async (): Promise<any[] | null> => {
  const cache = getCacheService();
  return cache.get<any[]>(CachePrefix.TEMPLATES_LIST);
};

/**
 * Cache published portfolio
 * Requirement #2: Cache portfolios with 5-minute TTL
 */
export const cachePortfolio = async (portfolioId: string, portfolio: any): Promise<void> => {
  const cache = getCacheService();
  await cache.set(
    `${CachePrefix.PORTFOLIO}${portfolioId}`,
    portfolio,
    CacheTTL.PORTFOLIOS
  );
};

export const getCachedPortfolio = async (portfolioId: string): Promise<any | null> => {
  const cache = getCacheService();
  return cache.get(`${CachePrefix.PORTFOLIO}${portfolioId}`);
};

/**
 * Invalidate portfolio cache on update
 * Requirement #2: Invalidate on update
 */
export const invalidatePortfolioCache = async (portfolioId: string): Promise<void> => {
  const cache = getCacheService();
  await cache.invalidatePortfolio(portfolioId);
};

/**
 * Cache analytics data
 */
export const cacheAnalytics = async (portfolioId: string, analytics: any): Promise<void> => {
  const cache = getCacheService();
  await cache.set(
    `${CachePrefix.ANALYTICS}${portfolioId}`,
    analytics,
    CacheTTL.ANALYTICS
  );
};

export const getCachedAnalytics = async (portfolioId: string): Promise<any | null> => {
  const cache = getCacheService();
  return cache.get(`${CachePrefix.ANALYTICS}${portfolioId}`);
};
