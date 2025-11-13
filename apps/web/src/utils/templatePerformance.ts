/**
 * Template Performance Optimizations
 *
 * Provides memoized/cached versions of expensive template operations.
 * Improves performance by avoiding unnecessary re-computations.
 */

import type { ResumeTemplate } from '../data/templates';
import type { TemplateSortBy } from '../components/templates/types';

// ============================================================================
// MEMOIZATION CACHE
// ============================================================================

/**
 * Simple memoization cache with LRU eviction
 */
class MemoCache<K, V> {
  private cache = new Map<string, { value: V; timestamp: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 50, ttl = 60000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: K): V | undefined {
    const cacheKey = JSON.stringify(key);
    const entry = this.cache.get(cacheKey);

    if (!entry) return undefined;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(cacheKey);
      return undefined;
    }

    return entry.value;
  }

  set(key: K, value: V): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    const cacheKey = JSON.stringify(key);
    this.cache.set(cacheKey, {
      value,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
    };
  }
}

// ============================================================================
// FILTER CACHES
// ============================================================================

const filterCache = new MemoCache<any, ResumeTemplate[]>(100, 30000); // 30s TTL
const searchCache = new MemoCache<string, ResumeTemplate[]>(50, 60000); // 60s TTL
const sortCache = new MemoCache<any, ResumeTemplate[]>(50, 30000); // 30s TTL

// ============================================================================
// OPTIMIZED FILTER FUNCTIONS
// ============================================================================

/**
 * Memoized filter by category
 */
export function filterByCategory(
  templates: ResumeTemplate[],
  category: string
): ResumeTemplate[] {
  const cacheKey = { fn: 'category', category, count: templates.length };
  const cached = filterCache.get(cacheKey);
  if (cached) return cached;

  const result = templates.filter(t => t.category === category);
  filterCache.set(cacheKey, result);
  return result;
}

/**
 * Memoized filter by difficulty
 */
export function filterByDifficulty(
  templates: ResumeTemplate[],
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): ResumeTemplate[] {
  const cacheKey = { fn: 'difficulty', difficulty, count: templates.length };
  const cached = filterCache.get(cacheKey);
  if (cached) return cached;

  const result = templates.filter(t => t.difficulty === difficulty);
  filterCache.set(cacheKey, result);
  return result;
}

/**
 * Memoized filter by layout
 */
export function filterByLayout(
  templates: ResumeTemplate[],
  layout: 'single-column' | 'two-column' | 'hybrid'
): ResumeTemplate[] {
  const cacheKey = { fn: 'layout', layout, count: templates.length };
  const cached = filterCache.get(cacheKey);
  if (cached) return cached;

  const result = templates.filter(t => t.layout === layout);
  filterCache.set(cacheKey, result);
  return result;
}

/**
 * Memoized filter by color scheme
 */
export function filterByColorScheme(
  templates: ResumeTemplate[],
  colorScheme: string
): ResumeTemplate[] {
  const cacheKey = { fn: 'colorScheme', colorScheme, count: templates.length };
  const cached = filterCache.get(cacheKey);
  if (cached) return cached;

  const result = templates.filter(t => t.colorScheme === colorScheme);
  filterCache.set(cacheKey, result);
  return result;
}

/**
 * Memoized premium filter
 */
export function filterPremiumOnly(templates: ResumeTemplate[]): ResumeTemplate[] {
  const cacheKey = { fn: 'premium', count: templates.length };
  const cached = filterCache.get(cacheKey);
  if (cached) return cached;

  const result = templates.filter(t => t.isPremium);
  filterCache.set(cacheKey, result);
  return result;
}

/**
 * Memoized free filter
 */
export function filterFreeOnly(templates: ResumeTemplate[]): ResumeTemplate[] {
  const cacheKey = { fn: 'free', count: templates.length };
  const cached = filterCache.get(cacheKey);
  if (cached) return cached;

  const result = templates.filter(t => !t.isPremium);
  filterCache.set(cacheKey, result);
  return result;
}

/**
 * Memoized search
 */
export function searchTemplatesOptimized(
  templates: ResumeTemplate[],
  query: string
): ResumeTemplate[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return templates;

  const cacheKey = `${normalizedQuery}:${templates.length}`;
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  const result = templates.filter(template => {
    const nameMatch = template.name.toLowerCase().includes(normalizedQuery);
    const descMatch = template.description.toLowerCase().includes(normalizedQuery);
    const tagMatch = template.tags.some(tag =>
      tag.toLowerCase().includes(normalizedQuery)
    );
    const industryMatch = template.industry.some(ind =>
      ind.toLowerCase().includes(normalizedQuery)
    );
    const featureMatch = template.features.some(feat =>
      feat.toLowerCase().includes(normalizedQuery)
    );

    return nameMatch || descMatch || tagMatch || industryMatch || featureMatch;
  });

  searchCache.set(cacheKey, result);
  return result;
}

// ============================================================================
// OPTIMIZED SORT FUNCTIONS
// ============================================================================

/**
 * Sort comparator functions (immutable - don't mutate)
 */
const sortComparators = {
  popular: (a: ResumeTemplate, b: ResumeTemplate) => b.downloads - a.downloads,
  newest: (a: ResumeTemplate, b: ResumeTemplate) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  rating: (a: ResumeTemplate, b: ResumeTemplate) => b.rating - a.rating,
  name: (a: ResumeTemplate, b: ResumeTemplate) => a.name.localeCompare(b.name),
} as const;

/**
 * Memoized sort function (creates new array, doesn't mutate)
 */
export function sortTemplatesOptimized(
  templates: ResumeTemplate[],
  sortBy: TemplateSortBy
): ResumeTemplate[] {
  const cacheKey = { sortBy, ids: templates.map(t => t.id).join(',') };
  const cached = sortCache.get(cacheKey);
  if (cached) return cached;

  // Create a copy before sorting (immutable)
  const comparator = sortComparators[sortBy];
  const result = comparator ? [...templates].sort(comparator) : [...templates];

  sortCache.set(cacheKey, result);
  return result;
}

// ============================================================================
// COMBINED OPERATIONS
// ============================================================================

/**
 * Optimized filter + sort in one pass
 * More efficient than separate operations
 */
export interface TemplateFilterOptions {
  category?: string;
  difficulty?: string;
  layout?: string;
  colorScheme?: string;
  premiumOnly?: boolean;
  freeOnly?: boolean;
  searchQuery?: string;
  sortBy?: TemplateSortBy;
}

export function filterAndSortTemplates(
  templates: ResumeTemplate[],
  options: TemplateFilterOptions
): ResumeTemplate[] {
  let result = templates;

  // Apply search first (most selective)
  if (options.searchQuery) {
    result = searchTemplatesOptimized(result, options.searchQuery);
  }

  // Apply filters
  if (options.category && options.category !== 'all') {
    result = filterByCategory(result, options.category);
  }

  if (options.difficulty && options.difficulty !== 'all') {
    result = filterByDifficulty(
      result,
      options.difficulty as 'beginner' | 'intermediate' | 'advanced'
    );
  }

  if (options.layout && options.layout !== 'all') {
    result = filterByLayout(
      result,
      options.layout as 'single-column' | 'two-column' | 'hybrid'
    );
  }

  if (options.colorScheme && options.colorScheme !== 'all') {
    result = filterByColorScheme(result, options.colorScheme);
  }

  if (options.premiumOnly) {
    result = filterPremiumOnly(result);
  }

  if (options.freeOnly) {
    result = filterFreeOnly(result);
  }

  // Apply sort
  if (options.sortBy) {
    result = sortTemplatesOptimized(result, options.sortBy);
  }

  return result;
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Clear all caches (useful after data updates)
 */
export function clearAllCaches(): void {
  filterCache.clear();
  searchCache.clear();
  sortCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    filter: filterCache.getStats(),
    search: searchCache.getStats(),
    sort: sortCache.getStats(),
  };
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Measure execution time of a function
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T,
  shouldLog = false
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (shouldLog) {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Create a memoized version of any function
 */
export function memoize<Args extends any[], Result>(
  fn: (...args: Args) => Result,
  options: { maxSize?: number; ttl?: number } = {}
): (...args: Args) => Result {
  const cache = new MemoCache<Args, Result>(options.maxSize, options.ttl);

  return (...args: Args): Result => {
    const cached = cache.get(args);
    if (cached !== undefined) return cached;

    const result = fn(...args);
    cache.set(args, result);
    return result;
  };
}

/**
 * Batch multiple filter operations
 * Useful when applying multiple filters in sequence
 */
export function batchFilters(
  templates: ResumeTemplate[],
  filters: Array<(templates: ResumeTemplate[]) => ResumeTemplate[]>
): ResumeTemplate[] {
  return filters.reduce((acc, filter) => filter(acc), templates);
}

// ============================================================================
// COMPARISON UTILITIES
// ============================================================================

/**
 * Check if two template arrays have same IDs (for memoization deps)
 */
export function templatesEqual(a: ResumeTemplate[], b: ResumeTemplate[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((template, index) => template.id === b[index].id);
}

/**
 * Get hash of template IDs for memoization
 */
export function getTemplateHash(templates: ResumeTemplate[]): string {
  return templates.map(t => t.id).join(',');
}
