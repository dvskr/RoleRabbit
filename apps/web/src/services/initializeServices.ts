/**
 * Service Initialization
 *
 * Centralized initialization for all services.
 * Call this once at app startup to set up the service layer.
 */

import { resumeTemplates } from '../data/templates';
import { initializeTemplateService } from './templateService';
import { LocalTemplateStorage } from './templateService';
import { CachedTemplateStorage } from './storageAdapters/CachedTemplateStorage';
import { TemplateService } from './templateService';
import { logger } from '../utils/logger';

/**
 * Configuration for service initialization
 */
export interface ServiceConfig {
  /**
   * Enable caching for template service
   * @default true
   */
  enableCache?: boolean;

  /**
   * Cache configuration (if caching enabled)
   */
  cacheConfig?: {
    maxSize?: number;
    ttl?: number;
    enableStats?: boolean;
  };
}

/**
 * Initialize all application services
 * Call this once at app startup (e.g., in layout.tsx or app root)
 *
 * @param config Service configuration
 * @returns Initialized template service
 */
export function initializeServices(config: ServiceConfig = {}): TemplateService {
  const {
    enableCache = true,
    cacheConfig = {
      maxSize: 100,
      ttl: 300000, // 5 minutes
      enableStats: false,
    },
  } = config;

  try {
    logger.info('Initializing application services...');

    // Create storage adapter
    let storage = new LocalTemplateStorage(resumeTemplates);

    // Wrap with caching if enabled
    if (enableCache) {
      storage = new CachedTemplateStorage(storage, cacheConfig) as any;
      logger.info('Template caching enabled with config:', cacheConfig);
    }

    // Initialize template service
    const templateService = new TemplateService(storage);

    // Set as default instance
    initializeTemplateService(resumeTemplates);

    logger.info('Services initialized successfully');
    logger.debug(`Loaded ${resumeTemplates.length} templates`);

    return templateService;
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    throw new Error('Service initialization failed');
  }
}

/**
 * Example usage in app layout:
 *
 * ```typescript
 * // In app/layout.tsx or _app.tsx
 * import { initializeServices } from '@/services/initializeServices';
 *
 * // Development - with stats
 * if (process.env.NODE_ENV === 'development') {
 *   initializeServices({
 *     enableCache: true,
 *     cacheConfig: {
 *       maxSize: 50,
 *       ttl: 60000, // 1 minute for dev
 *       enableStats: true,
 *     },
 *   });
 * }
 *
 * // Production - optimized
 * if (process.env.NODE_ENV === 'production') {
 *   initializeServices({
 *     enableCache: true,
 *     cacheConfig: {
 *       maxSize: 200,
 *       ttl: 600000, // 10 minutes
 *       enableStats: false,
 *     },
 *   });
 * }
 * ```
 */
