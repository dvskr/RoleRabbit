/**
 * Data normalization utilities for profile data
 * @module components/profile/utils/dataNormalizer
 */

/**
 * Normalize any value to an array
 * Handles arrays, objects, strings, null/undefined, Sets, Maps
 * @template T
 * @param {any} value - Value to normalize
 * @returns {T[]} Normalized array
 */
export function normalizeToArray<T = any>(value: any): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }
  if (value === null || value === undefined) {
    return [];
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return normalizeToArray<T>(parsed);
    } catch {
      return [];
    }
  }
  if (value instanceof Set) {
    return Array.from(value.values()) as T[];
  }
  if (value instanceof Map) {
    return Array.from(value.values()) as T[];
  }
  if (typeof value === 'object') {
    // Handle objects with numeric string keys (e.g., {"0": {...}, "1": {...}})
    // Sort by numeric key to maintain order
    const keys = Object.keys(value);
    const hasNumericKeys = keys.every(key => /^\d+$/.test(key));
    if (hasNumericKeys && keys.length > 0) {
      // Sort by numeric key to maintain order
      const sortedKeys = keys.sort((a, b) => parseInt(a) - parseInt(b));
      return sortedKeys.map(key => (value as any)[key]).filter((item) => item !== undefined && item !== null) as T[];
    }
    return Object.values(value).filter((item) => item !== undefined && item !== null) as T[];
  }
  return [];
}

