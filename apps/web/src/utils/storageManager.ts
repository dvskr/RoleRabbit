/**
 * localStorage Management Utility
 *
 * Provides storage quota management, size tracking, and cleanup strategies
 * to prevent localStorage from growing indefinitely and hitting browser limits.
 *
 * Features:
 * - Storage quota tracking and enforcement
 * - Size limits per key and total storage
 * - LRU (Least Recently Used) cleanup
 * - Automatic cleanup when quota exceeded
 * - Storage usage statistics
 * - Namespace support for different features
 *
 * Browser localStorage limits:
 * - Chrome/Edge: ~10 MB
 * - Firefox: ~10 MB
 * - Safari: ~5 MB
 * - Mobile browsers: ~5 MB
 *
 * Usage:
 * ```ts
 * import { managedStorage } from '@/utils/storageManager';
 *
 * // Set item with automatic quota management
 * managedStorage.setItem('myKey', data);
 *
 * // Get item
 * const data = managedStorage.getItem('myKey');
 *
 * // Check storage usage
 * const usage = managedStorage.getUsageStats();
 * console.log(`Using ${usage.usedBytes} of ${usage.maxBytes}`);
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export interface StorageConfig {
  maxTotalSize?: number;        // Maximum total storage size in bytes (default: 4 MB)
  maxItemSize?: number;          // Maximum size per item in bytes (default: 500 KB)
  maxItems?: number;             // Maximum number of items (default: 100)
  enableLRU?: boolean;           // Enable LRU cleanup (default: true)
  namespace?: string;            // Namespace prefix for keys
  onQuotaExceeded?: (error: QuotaExceededError) => void;
  onCleanup?: (removedKeys: string[]) => void;
}

export interface StorageItem<T = any> {
  key: string;
  value: T;
  size: number;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export interface StorageUsageStats {
  usedBytes: number;
  maxBytes: number;
  usagePercent: number;
  itemCount: number;
  maxItems: number;
  largestItems: Array<{ key: string; size: number }>;
  oldestItems: Array<{ key: string; age: number }>;
}

export interface QuotaExceededError {
  message: string;
  attemptedSize: number;
  currentSize: number;
  maxSize: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default storage limits (conservative to avoid browser limits)
 */
const DEFAULT_MAX_TOTAL_SIZE = 4 * 1024 * 1024; // 4 MB
const DEFAULT_MAX_ITEM_SIZE = 500 * 1024;       // 500 KB
const DEFAULT_MAX_ITEMS = 100;

/**
 * Storage metadata key (stores LRU info)
 */
const METADATA_KEY = '__storage_metadata__';

/**
 * Browser localStorage limit estimates (bytes)
 */
export const BROWSER_LIMITS = {
  chrome: 10 * 1024 * 1024,   // ~10 MB
  firefox: 10 * 1024 * 1024,  // ~10 MB
  safari: 5 * 1024 * 1024,    // ~5 MB
  mobile: 5 * 1024 * 1024,    // ~5 MB
  conservative: 4 * 1024 * 1024, // 4 MB (safe limit)
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get size of data in bytes
 */
export function getDataSize(data: any): number {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  // UTF-16: each character is 2 bytes
  return new Blob([str]).size;
}

/**
 * Format bytes for display
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get estimated browser storage limit
 */
export function getBrowserLimit(): number {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
    return BROWSER_LIMITS.mobile;
  }

  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return BROWSER_LIMITS.safari;
  }

  if (userAgent.includes('firefox')) {
    return BROWSER_LIMITS.firefox;
  }

  if (userAgent.includes('chrome') || userAgent.includes('edge')) {
    return BROWSER_LIMITS.chrome;
  }

  return BROWSER_LIMITS.conservative;
}

// ============================================================================
// STORAGE METADATA MANAGER
// ============================================================================

interface StorageMetadata {
  items: Record<string, {
    size: number;
    timestamp: number;
    lastAccessed: number;
    accessCount: number;
  }>;
  totalSize: number;
  version: number;
}

class MetadataManager {
  private metadata: StorageMetadata;

  constructor() {
    this.metadata = this.load();
  }

  private load(): StorageMetadata {
    try {
      const stored = localStorage.getItem(METADATA_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          items: parsed.items || {},
          totalSize: parsed.totalSize || 0,
          version: parsed.version || 1,
        };
      }
    } catch (error) {
      console.error('Error loading storage metadata:', error);
    }

    return {
      items: {},
      totalSize: 0,
      version: 1,
    };
  }

  private save(): void {
    try {
      localStorage.setItem(METADATA_KEY, JSON.stringify(this.metadata));
    } catch (error) {
      console.error('Error saving storage metadata:', error);
    }
  }

  addItem(key: string, size: number): void {
    const now = Date.now();
    this.metadata.items[key] = {
      size,
      timestamp: now,
      lastAccessed: now,
      accessCount: 0,
    };
    this.recalculateTotalSize();
    this.save();
  }

  updateAccess(key: string): void {
    if (this.metadata.items[key]) {
      this.metadata.items[key].lastAccessed = Date.now();
      this.metadata.items[key].accessCount++;
      this.save();
    }
  }

  removeItem(key: string): void {
    delete this.metadata.items[key];
    this.recalculateTotalSize();
    this.save();
  }

  getItem(key: string) {
    return this.metadata.items[key];
  }

  getAllItems() {
    return this.metadata.items;
  }

  getTotalSize(): number {
    return this.metadata.totalSize;
  }

  recalculateTotalSize(): void {
    this.metadata.totalSize = Object.values(this.metadata.items).reduce(
      (total, item) => total + item.size,
      0
    );
  }

  clear(): void {
    this.metadata = {
      items: {},
      totalSize: 0,
      version: 1,
    };
    this.save();
  }

  /**
   * Get least recently used keys
   */
  getLRUKeys(count: number): string[] {
    return Object.entries(this.metadata.items)
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
      .slice(0, count)
      .map(([key]) => key);
  }

  /**
   * Get largest items
   */
  getLargestKeys(count: number): string[] {
    return Object.entries(this.metadata.items)
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, count)
      .map(([key]) => key);
  }
}

// ============================================================================
// MANAGED STORAGE CLASS
// ============================================================================

export class ManagedStorage {
  private config: Required<StorageConfig>;
  private metadata: MetadataManager;

  constructor(config: StorageConfig = {}) {
    this.config = {
      maxTotalSize: config.maxTotalSize || DEFAULT_MAX_TOTAL_SIZE,
      maxItemSize: config.maxItemSize || DEFAULT_MAX_ITEM_SIZE,
      maxItems: config.maxItems || DEFAULT_MAX_ITEMS,
      enableLRU: config.enableLRU !== false,
      namespace: config.namespace || '',
      onQuotaExceeded: config.onQuotaExceeded || (() => {}),
      onCleanup: config.onCleanup || (() => {}),
    };

    this.metadata = new MetadataManager();

    // Clean up if necessary on initialization
    if (this.metadata.getTotalSize() > this.config.maxTotalSize) {
      this.cleanup();
    }
  }

  /**
   * Get prefixed key with namespace
   */
  private getKey(key: string): string {
    return this.config.namespace ? `${this.config.namespace}:${key}` : key;
  }

  /**
   * Remove namespace prefix from key
   */
  private removeKeyPrefix(prefixedKey: string): string {
    if (this.config.namespace && prefixedKey.startsWith(this.config.namespace + ':')) {
      return prefixedKey.substring(this.config.namespace.length + 1);
    }
    return prefixedKey;
  }

  /**
   * Set item in storage with quota management
   */
  setItem<T>(key: string, value: T): boolean {
    const prefixedKey = this.getKey(key);

    try {
      // Calculate size
      const dataStr = JSON.stringify(value);
      const size = getDataSize(dataStr);

      // Check item size limit
      if (size > this.config.maxItemSize) {
        const error: QuotaExceededError = {
          message: `Item size (${formatBytes(size)}) exceeds maximum (${formatBytes(this.config.maxItemSize)})`,
          attemptedSize: size,
          currentSize: this.metadata.getTotalSize(),
          maxSize: this.config.maxItemSize,
        };
        this.config.onQuotaExceeded(error);
        console.error(error.message);
        return false;
      }

      // Check if we need to make room
      const currentSize = this.metadata.getTotalSize();
      const existingItemSize = this.metadata.getItem(prefixedKey)?.size || 0;
      const newTotalSize = currentSize - existingItemSize + size;

      if (newTotalSize > this.config.maxTotalSize) {
        // Try to cleanup to make room
        const spaceNeeded = newTotalSize - this.config.maxTotalSize;
        const cleaned = this.cleanup(spaceNeeded);

        if (!cleaned) {
          const error: QuotaExceededError = {
            message: `Storage quota exceeded. Current: ${formatBytes(currentSize)}, Max: ${formatBytes(this.config.maxTotalSize)}`,
            attemptedSize: size,
            currentSize,
            maxSize: this.config.maxTotalSize,
          };
          this.config.onQuotaExceeded(error);
          console.error(error.message);
          return false;
        }
      }

      // Check item count limit
      const itemCount = Object.keys(this.metadata.getAllItems()).length;
      if (itemCount >= this.config.maxItems && !this.metadata.getItem(prefixedKey)) {
        // New item and at limit
        this.cleanup(); // Remove one LRU item
      }

      // Store the item
      localStorage.setItem(prefixedKey, dataStr);
      this.metadata.addItem(prefixedKey, size);

      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        const quotaError: QuotaExceededError = {
          message: 'Browser storage quota exceeded',
          attemptedSize: 0,
          currentSize: this.metadata.getTotalSize(),
          maxSize: this.config.maxTotalSize,
        };
        this.config.onQuotaExceeded(quotaError);
        console.error(quotaError.message);
        // Try emergency cleanup
        this.cleanup();
      } else {
        console.error('Error setting storage item:', error);
      }
      return false;
    }
  }

  /**
   * Get item from storage
   */
  getItem<T>(key: string): T | null {
    const prefixedKey = this.getKey(key);

    try {
      const item = localStorage.getItem(prefixedKey);
      if (item) {
        this.metadata.updateAccess(prefixedKey);
        return JSON.parse(item) as T;
      }
      return null;
    } catch (error) {
      console.error('Error getting storage item:', error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    const prefixedKey = this.getKey(key);
    localStorage.removeItem(prefixedKey);
    this.metadata.removeItem(prefixedKey);
  }

  /**
   * Clear all items in namespace
   */
  clear(): void {
    const prefix = this.config.namespace;
    const keysToRemove: string[] = [];

    // Find all keys with our namespace
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (!prefix || key.startsWith(prefix + ':'))) {
        keysToRemove.push(key);
      }
    }

    // Remove all keys
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      this.metadata.removeItem(key);
    });
  }

  /**
   * Cleanup storage using LRU strategy
   *
   * @param spaceNeeded - Optional bytes needed, will remove items until this space is freed
   * @returns true if cleanup successful
   */
  cleanup(spaceNeeded?: number): boolean {
    if (!this.config.enableLRU) {
      return false;
    }

    const removedKeys: string[] = [];
    let freedSpace = 0;

    // Get LRU keys (oldest accessed)
    const lruKeys = this.metadata.getLRUKeys(10); // Get 10 candidates

    for (const prefixedKey of lruKeys) {
      // Don't remove metadata
      if (prefixedKey === METADATA_KEY) continue;

      const itemMeta = this.metadata.getItem(prefixedKey);
      if (!itemMeta) continue;

      // Remove item
      localStorage.removeItem(prefixedKey);
      this.metadata.removeItem(prefixedKey);

      freedSpace += itemMeta.size;
      removedKeys.push(this.removeKeyPrefix(prefixedKey));

      // Check if we've freed enough space
      if (spaceNeeded && freedSpace >= spaceNeeded) {
        break;
      }

      // Or if we've freed 20% of max size
      if (!spaceNeeded && freedSpace >= this.config.maxTotalSize * 0.2) {
        break;
      }
    }

    if (removedKeys.length > 0) {
      this.config.onCleanup(removedKeys);
      console.log(`Cleaned up ${removedKeys.length} items, freed ${formatBytes(freedSpace)}`);
    }

    return freedSpace >= (spaceNeeded || 0);
  }

  /**
   * Get storage usage statistics
   */
  getUsageStats(): StorageUsageStats {
    const items = this.metadata.getAllItems();
    const usedBytes = this.metadata.getTotalSize();
    const maxBytes = this.config.maxTotalSize;
    const itemCount = Object.keys(items).length;

    // Get largest items
    const largestItems = Object.entries(items)
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 5)
      .map(([key, meta]) => ({
        key: this.removeKeyPrefix(key),
        size: meta.size,
      }));

    // Get oldest items
    const now = Date.now();
    const oldestItems = Object.entries(items)
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, 5)
      .map(([key, meta]) => ({
        key: this.removeKeyPrefix(key),
        age: now - meta.timestamp,
      }));

    return {
      usedBytes,
      maxBytes,
      usagePercent: (usedBytes / maxBytes) * 100,
      itemCount,
      maxItems: this.config.maxItems,
      largestItems,
      oldestItems,
    };
  }

  /**
   * Check if storage is near capacity
   */
  isNearCapacity(threshold = 0.8): boolean {
    const usedBytes = this.metadata.getTotalSize();
    return usedBytes >= this.config.maxTotalSize * threshold;
  }

  /**
   * Get all keys in namespace
   */
  getAllKeys(): string[] {
    const prefix = this.config.namespace;
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (!prefix || key.startsWith(prefix + ':'))) {
        keys.push(this.removeKeyPrefix(key));
      }
    }

    return keys;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Default managed storage instance
 */
export const managedStorage = new ManagedStorage();

/**
 * Create namespaced storage instance
 */
export function createNamespacedStorage(namespace: string, config?: Omit<StorageConfig, 'namespace'>): ManagedStorage {
  return new ManagedStorage({
    ...config,
    namespace,
  });
}

/**
 * Email templates storage with specific limits
 */
export const emailStorage = createNamespacedStorage('email_templates', {
  maxTotalSize: 1 * 1024 * 1024,  // 1 MB for email templates
  maxItemSize: 100 * 1024,          // 100 KB per template
  maxItems: 50,                     // Maximum 50 custom templates
  enableLRU: true,
});

/**
 * User preferences storage
 */
export const preferencesStorage = createNamespacedStorage('user_preferences', {
  maxTotalSize: 256 * 1024,         // 256 KB for preferences
  maxItemSize: 50 * 1024,           // 50 KB per preference
  maxItems: 20,
  enableLRU: false,                 // Don't auto-cleanup preferences
});

export default {
  ManagedStorage,
  managedStorage,
  createNamespacedStorage,
  emailStorage,
  preferencesStorage,
  getDataSize,
  formatBytes,
  isLocalStorageAvailable,
  getBrowserLimit,
  BROWSER_LIMITS,
};
