/**
 * Feature Flags System
 *
 * Centralized feature flag management for the Files Tab refactoring.
 * Allows gradual rollout and easy rollback of new features.
 *
 * Usage:
 * ```typescript
 * import { getFeatureFlags, isFeatureEnabled } from '@/utils/featureFlags';
 *
 * const flags = getFeatureFlags();
 * if (flags.redisCache) {
 *   // Use Redis caching
 * }
 *
 * // Or use the helper function
 * if (isFeatureEnabled('redisCache')) {
 *   // Use Redis caching
 * }
 * ```
 */

export interface FeatureFlags {
  // Storage Features
  redisCache: boolean;
  infiniteScroll: boolean;
  optimisticUpdates: boolean;
  requestCancellation: boolean;

  // Security Features
  auditLogging: boolean;
  inputValidation: boolean;
  duplicateSharePrevention: boolean;

  // UI Features
  accessibility: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  liveRegions: boolean;

  // Performance Features
  debouncedSearch: boolean;
  cursorPagination: boolean;
  retryLogic: boolean;
  reactOptimizations: boolean;

  // Experimental Features (disabled by default)
  virtualScrolling: boolean;
  requestBatching: boolean;
  performanceMonitoring: boolean;
}

/**
 * Default feature flags configuration
 * All production-ready features are enabled by default
 * Experimental features are disabled by default
 */
const defaultFlags: FeatureFlags = {
  // Storage Features (all stable)
  redisCache: true,
  infiniteScroll: true,
  optimisticUpdates: true,
  requestCancellation: true,

  // Security Features (all stable)
  auditLogging: true,
  inputValidation: true,
  duplicateSharePrevention: true,

  // UI Features (all stable)
  accessibility: true,
  keyboardNavigation: true,
  focusIndicators: true,
  liveRegions: true,

  // Performance Features (all stable)
  debouncedSearch: true,
  cursorPagination: true,
  retryLogic: true,
  reactOptimizations: true,

  // Experimental Features (disabled by default)
  virtualScrolling: false,
  requestBatching: false,
  performanceMonitoring: false,
};

/**
 * Load feature flags from environment variables
 * Supports overriding defaults via NEXT_PUBLIC_FEATURE_* env vars
 *
 * Example:
 * NEXT_PUBLIC_FEATURE_REDIS_CACHE=false
 * NEXT_PUBLIC_FEATURE_VIRTUAL_SCROLLING=true
 */
export function getFeatureFlags(): FeatureFlags {
  // In browser environment, check process.env
  if (typeof window !== 'undefined' && typeof process !== 'undefined') {
    return {
      ...defaultFlags,
      // Storage Features
      redisCache: getEnvFlag('REDIS_CACHE', defaultFlags.redisCache),
      infiniteScroll: getEnvFlag('INFINITE_SCROLL', defaultFlags.infiniteScroll),
      optimisticUpdates: getEnvFlag('OPTIMISTIC_UPDATES', defaultFlags.optimisticUpdates),
      requestCancellation: getEnvFlag('REQUEST_CANCELLATION', defaultFlags.requestCancellation),

      // Security Features
      auditLogging: getEnvFlag('AUDIT_LOGGING', defaultFlags.auditLogging),
      inputValidation: getEnvFlag('INPUT_VALIDATION', defaultFlags.inputValidation),
      duplicateSharePrevention: getEnvFlag('DUPLICATE_SHARE_PREVENTION', defaultFlags.duplicateSharePrevention),

      // UI Features
      accessibility: getEnvFlag('ACCESSIBILITY', defaultFlags.accessibility),
      keyboardNavigation: getEnvFlag('KEYBOARD_NAVIGATION', defaultFlags.keyboardNavigation),
      focusIndicators: getEnvFlag('FOCUS_INDICATORS', defaultFlags.focusIndicators),
      liveRegions: getEnvFlag('LIVE_REGIONS', defaultFlags.liveRegions),

      // Performance Features
      debouncedSearch: getEnvFlag('DEBOUNCED_SEARCH', defaultFlags.debouncedSearch),
      cursorPagination: getEnvFlag('CURSOR_PAGINATION', defaultFlags.cursorPagination),
      retryLogic: getEnvFlag('RETRY_LOGIC', defaultFlags.retryLogic),
      reactOptimizations: getEnvFlag('REACT_OPTIMIZATIONS', defaultFlags.reactOptimizations),

      // Experimental Features
      virtualScrolling: getEnvFlag('VIRTUAL_SCROLLING', defaultFlags.virtualScrolling),
      requestBatching: getEnvFlag('REQUEST_BATCHING', defaultFlags.requestBatching),
      performanceMonitoring: getEnvFlag('PERFORMANCE_MONITORING', defaultFlags.performanceMonitoring),
    };
  }

  // Server-side or fallback: return defaults
  return defaultFlags;
}

/**
 * Helper function to get a boolean flag from environment
 * @param flagName - Name of the flag (without NEXT_PUBLIC_FEATURE_ prefix)
 * @param defaultValue - Default value if env var not set
 */
function getEnvFlag(flagName: string, defaultValue: boolean): boolean {
  const envKey = `NEXT_PUBLIC_FEATURE_${flagName.toUpperCase()}`;
  const envValue = process.env[envKey];

  if (envValue === undefined || envValue === null) {
    return defaultValue;
  }

  // Parse as boolean
  const lowerValue = envValue.toLowerCase();
  if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
    return true;
  }
  if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
    return false;
  }

  return defaultValue;
}

/**
 * Check if a specific feature is enabled
 * @param featureName - Name of the feature flag
 */
export function isFeatureEnabled(featureName: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[featureName];
}

/**
 * Get all enabled feature names (useful for debugging)
 */
export function getEnabledFeatures(): string[] {
  const flags = getFeatureFlags();
  return Object.entries(flags)
    .filter(([_, enabled]) => enabled)
    .map(([name, _]) => name);
}

/**
 * Get all disabled feature names (useful for debugging)
 */
export function getDisabledFeatures(): string[] {
  const flags = getFeatureFlags();
  return Object.entries(flags)
    .filter(([_, enabled]) => !enabled)
    .map(([name, _]) => name);
}

/**
 * Log current feature flag status (useful for debugging)
 */
export function logFeatureFlags(): void {
  const flags = getFeatureFlags();
  const enabled = getEnabledFeatures();
  const disabled = getDisabledFeatures();

  console.group('🚩 Feature Flags Status');
  console.log('Enabled features:', enabled.length);
  enabled.forEach(name => console.log(`  ✅ ${name}`));
  console.log('Disabled features:', disabled.length);
  disabled.forEach(name => console.log(`  ❌ ${name}`));
  console.groupEnd();
}
