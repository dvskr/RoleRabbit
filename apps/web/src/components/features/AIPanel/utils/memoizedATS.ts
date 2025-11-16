/**
 * Memoized ATS Score Calculator
 * 
 * ✅ PERFORMANCE: Caches ATS calculations to avoid redundant expensive operations.
 * ATS score calculation involves:
 * - JSON.stringify of entire resume data
 * - Multiple string operations and regex matching
 * - Array filtering and mapping
 * 
 * By memoizing based on resume data and job description, we can skip recalculation
 * when the inputs haven't changed.
 */

import { calculateATSScore } from './atsHelpers';
import type { ResumeData } from '../../../types/resume';
import type { ATSAnalysisResult } from '../types/AIPanel.types';

// Simple cache implementation
interface CacheEntry {
  resumeHash: string;
  jobDescHash: string;
  result: ATSAnalysisResult;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50;

/**
 * Generate a simple hash for cache key
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Clean up expired cache entries
 */
function cleanupCache() {
  const now = Date.now();
  const expiredKeys: string[] = [];

  cache.forEach((entry, key) => {
    if (now - entry.timestamp > CACHE_TTL) {
      expiredKeys.push(key);
    }
  });

  expiredKeys.forEach(key => cache.delete(key));

  // If still too large, remove oldest entries
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, cache.size - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => cache.delete(key));
  }
}

/**
 * Memoized ATS score calculator
 * 
 * @param data - Resume data to analyze
 * @param jobDesc - Job description to match against
 * @returns ATS analysis result (cached if available)
 */
export function calculateATSScoreMemoized(
  data: ResumeData,
  jobDesc: string
): ATSAnalysisResult {
  // Generate hashes for cache key
  const resumeHash = simpleHash(JSON.stringify(data));
  const jobDescHash = simpleHash(jobDesc);
  const cacheKey = `${resumeHash}-${jobDescHash}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    // Cache hit!
    return cached.result;
  }

  // Cache miss - calculate
  const result = calculateATSScore(data, jobDesc);

  // Store in cache
  cache.set(cacheKey, {
    resumeHash,
    jobDescHash,
    result,
    timestamp: Date.now(),
  });

  // Cleanup old entries
  cleanupCache();

  return result;
}

/**
 * Clear the ATS calculation cache
 * Useful when you want to force recalculation
 */
export function clearATSCache() {
  cache.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getATSCacheStats() {
  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    ttl: CACHE_TTL,
  };
}

