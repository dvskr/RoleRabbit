/**
 * Cached Template Storage Adapter
 *
 * Decorator pattern implementation that adds caching to any ITemplateStorage.
 * Demonstrates extensibility of the service layer architecture.
 *
 * Features:
 * - In-memory caching with TTL (Time To Live)
 * - Cache invalidation
 * - LRU (Least Recently Used) eviction
 * - Configurable cache size and TTL
 * - Cache statistics
 */

import type { ITemplateStorage } from '../templateService';
import type { ResumeTemplate } from '../../data/templates';
import type { ResumeCategory, Industry } from '../../data/categories';
import { logger } from '../../utils/logger';

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /**
   * Maximum number of cache entries
   * @default 100
   */
  maxSize?: number;

  /**
   * Time to live in milliseconds
   * @default 300000 (5 minutes)
   */
  ttl?: number;

  /**
   * Enable cache statistics logging
   * @default false
   */
  enableStats?: boolean;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}

/**
 * Cached storage decorator
 * Wraps any ITemplateStorage implementation with caching
 */
export class CachedTemplateStorage implements ITemplateStorage {
  private storage: ITemplateStorage;
  private cache: Map<string, CacheEntry<any>>;
  private config: Required<CacheConfig>;
  private stats: CacheStats;

  constructor(storage: ITemplateStorage, config: CacheConfig = {}) {
    this.storage = storage;
    this.cache = new Map();
    this.config = {
      maxSize: config.maxSize ?? 100,
      ttl: config.ttl ?? 300000, // 5 minutes default
      enableStats: config.enableStats ?? false,
    };
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      hitRate: 0,
    };

    logger.debug('CachedTemplateStorage initialized with config:', this.config);
  }

  /**
   * Get item from cache or fetch from storage
   */
  private async getCached<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    // Check if cache entry exists and is not expired
    if (cached && now - cached.timestamp < this.config.ttl) {
      cached.hits++;
      this.stats.hits++;
      this.updateHitRate();

      if (this.config.enableStats) {
        logger.debug(`Cache HIT for key: ${key}`);
      }

      return cached.data as T;
    }

    // Cache miss - fetch from storage
    this.stats.misses++;
    this.updateHitRate();

    if (this.config.enableStats) {
      logger.debug(`Cache MISS for key: ${key}`);
    }

    const data = await fetchFn();

    // Store in cache
    this.setCache(key, data);

    return data;
  }

  /**
   * Set cache entry with LRU eviction
   */
  private setCache<T>(key: string, data: T): void {
    // If cache is full, evict least recently used entry
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
    });

    this.stats.size = this.cache.size;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruHits = Infinity;
    let oldestTimestamp = Infinity;

    // Find entry with least hits (and oldest if tie)
    for (const [key, entry] of this.cache.entries()) {
      if (
        entry.hits < lruHits ||
        (entry.hits === lruHits && entry.timestamp < oldestTimestamp)
      ) {
        lruKey = key;
        lruHits = entry.hits;
        oldestTimestamp = entry.timestamp;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.stats.evictions++;
      this.stats.size = this.cache.size;

      if (this.config.enableStats) {
        logger.debug(`Evicted LRU cache entry: ${lruKey}`);
      }
    }
  }

  /**
   * Update hit rate statistic
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    this.cache.clear();
    this.stats.size = 0;
    logger.debug('Cache cleared');
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.config.ttl) {
        this.cache.delete(key);
        cleared++;
      }
    }

    this.stats.size = this.cache.size;

    if (cleared > 0) {
      logger.debug(`Cleared ${cleared} expired cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: this.cache.size,
      hitRate: 0,
    };
    logger.debug('Cache statistics reset');
  }

  // ========================================================================
  // ITemplateStorage Implementation (with caching)
  // ========================================================================

  async getAll(): Promise<ResumeTemplate[]> {
    return this.getCached('all', () => this.storage.getAll());
  }

  async getById(id: string): Promise<ResumeTemplate | null> {
    return this.getCached(`id:${id}`, () => this.storage.getById(id));
  }

  async getByCategory(category: ResumeCategory): Promise<ResumeTemplate[]> {
    return this.getCached(`category:${category}`, () => this.storage.getByCategory(category));
  }

  async search(query: string): Promise<ResumeTemplate[]> {
    // Don't cache search results (they can be very dynamic)
    // Or use a shorter TTL if needed
    return this.storage.search(query);
  }

  async getByIndustry(industry: Industry): Promise<ResumeTemplate[]> {
    return this.getCached(`industry:${industry}`, () => this.storage.getByIndustry(industry));
  }

  async getPremium(): Promise<ResumeTemplate[]> {
    return this.getCached('premium', () => this.storage.getPremium());
  }

  async getByDifficulty(
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<ResumeTemplate[]> {
    return this.getCached(`difficulty:${difficulty}`, () => this.storage.getByDifficulty(difficulty));
  }

  async getByLayout(
    layout: 'single-column' | 'two-column' | 'hybrid'
  ): Promise<ResumeTemplate[]> {
    return this.getCached(`layout:${layout}`, () => this.storage.getByLayout(layout));
  }
}
