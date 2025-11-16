/**
 * Local Storage Cache Utility
 * FE-043: Local storage caching for file list with TTL
 */

interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const CACHE_PREFIX = 'cloud_storage_cache_';

export function setCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
  try {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cached));
  } catch (error) {
    // Storage quota exceeded or other error
    console.warn('Failed to set cache:', error);
  }
}

export function getCache<T>(key: string): T | null {
  try {
    const cachedStr = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cachedStr) return null;

    const cached: CachedData<T> = JSON.parse(cachedStr);
    const age = Date.now() - cached.timestamp;

    if (age > cached.ttl) {
      // Cache expired
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return cached.data;
  } catch (error) {
    console.warn('Failed to get cache:', error);
    return null;
  }
}

export function clearCache(key: string): void {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear all cache:', error);
  }
}

export function isCacheValid(key: string): boolean {
  try {
    const cachedStr = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cachedStr) return false;

    const cached: CachedData<any> = JSON.parse(cachedStr);
    const age = Date.now() - cached.timestamp;
    return age <= cached.ttl;
  } catch {
    return false;
  }
}

