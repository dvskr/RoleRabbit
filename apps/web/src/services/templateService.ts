/**
 * Template Service Layer
 *
 * Provides a centralized, abstracted API for all template operations.
 * Decouples business logic from data access, enabling easy storage swapping
 * and caching strategies.
 *
 * Architecture:
 * - ITemplateStorage: Interface for storage backends
 * - LocalTemplateStorage: Default implementation (static data)
 * - TemplateService: Main service with business logic
 * - Future: APITemplateStorage, IndexedDBStorage, CachedStorage
 */

import type { ResumeTemplate } from '../data/templates';
import type { ResumeCategory, Industry } from '../data/categories';
import { logger } from '../utils/logger';
import { isValidResumeTemplate } from '../utils/templateValidator';

// ============================================================================
// STORAGE INTERFACE
// ============================================================================

/**
 * Abstract storage interface for template data access
 * Allows swapping storage backends (static, API, IndexedDB, etc.)
 */
export interface ITemplateStorage {
  /**
   * Get all templates
   */
  getAll(): Promise<ResumeTemplate[]>;

  /**
   * Get template by ID
   */
  getById(id: string): Promise<ResumeTemplate | null>;

  /**
   * Get templates by category
   */
  getByCategory(category: ResumeCategory): Promise<ResumeTemplate[]>;

  /**
   * Search templates by query
   */
  search(query: string): Promise<ResumeTemplate[]>;

  /**
   * Get templates by industry
   */
  getByIndustry(industry: Industry): Promise<ResumeTemplate[]>;

  /**
   * Get premium templates only
   */
  getPremium(): Promise<ResumeTemplate[]>;

  /**
   * Get templates by difficulty
   */
  getByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<ResumeTemplate[]>;

  /**
   * Get templates by layout
   */
  getByLayout(layout: 'single-column' | 'two-column' | 'hybrid'): Promise<ResumeTemplate[]>;
}

// ============================================================================
// LOCAL STORAGE IMPLEMENTATION
// ============================================================================

/**
 * Local storage implementation using static template data
 * This is the default implementation for static template data
 */
export class LocalTemplateStorage implements ITemplateStorage {
  private templates: ResumeTemplate[];

  constructor(templates: ResumeTemplate[]) {
    this.templates = templates;
  }

  async getAll(): Promise<ResumeTemplate[]> {
    return [...this.templates]; // Return copy to prevent mutation
  }

  async getById(id: string): Promise<ResumeTemplate | null> {
    const template = this.templates.find(t => t.id === id);
    return template ? { ...template } : null;
  }

  async getByCategory(category: ResumeCategory): Promise<ResumeTemplate[]> {
    return this.templates.filter(t => t.category === category);
  }

  async search(query: string): Promise<ResumeTemplate[]> {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return this.getAll();

    return this.templates.filter(template => {
      const nameMatch = template.name.toLowerCase().includes(lowerQuery);
      const descMatch = template.description.toLowerCase().includes(lowerQuery);
      const tagMatch = template.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      const industryMatch = template.industry.some(ind => ind.toLowerCase().includes(lowerQuery));
      const featureMatch = template.features.some(feat => feat.toLowerCase().includes(lowerQuery));

      return nameMatch || descMatch || tagMatch || industryMatch || featureMatch;
    });
  }

  async getByIndustry(industry: Industry): Promise<ResumeTemplate[]> {
    return this.templates.filter(template =>
      template.industry.some(ind => ind.toLowerCase().includes(industry.toLowerCase()))
    );
  }

  async getPremium(): Promise<ResumeTemplate[]> {
    return this.templates.filter(t => t.isPremium);
  }

  async getByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<ResumeTemplate[]> {
    return this.templates.filter(t => t.difficulty === difficulty);
  }

  async getByLayout(layout: 'single-column' | 'two-column' | 'hybrid'): Promise<ResumeTemplate[]> {
    return this.templates.filter(t => t.layout === layout);
  }
}

// ============================================================================
// TEMPLATE SERVICE
// ============================================================================

/**
 * Options for filtering templates
 */
export interface TemplateFilterOptions {
  category?: ResumeCategory | 'all';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  layout?: 'single-column' | 'two-column' | 'hybrid' | 'all';
  isPremium?: boolean;
  industries?: Industry[];
  tags?: string[];
  searchQuery?: string;
  minRating?: number;
  maxRating?: number;
}

/**
 * Options for sorting templates
 */
export type TemplateSortOption =
  | 'name-asc'
  | 'name-desc'
  | 'rating-desc'
  | 'rating-asc'
  | 'downloads-desc'
  | 'downloads-asc'
  | 'date-desc'
  | 'date-asc';

/**
 * Main template service
 * Provides high-level business logic for template operations
 */
export class TemplateService {
  private storage: ITemplateStorage;

  constructor(storage: ITemplateStorage) {
    this.storage = storage;
  }

  /**
   * Get all templates
   */
  async getAll(): Promise<ResumeTemplate[]> {
    try {
      return await this.storage.getAll();
    } catch (error) {
      logger.error('Error fetching all templates:', error);
      return [];
    }
  }

  /**
   * Get template by ID with validation
   */
  async getById(id: string): Promise<ResumeTemplate | null> {
    try {
      const template = await this.storage.getById(id);

      if (!template) {
        logger.warn(`Template not found: ${id}`);
        return null;
      }

      if (!isValidResumeTemplate(template)) {
        logger.error(`Invalid template data for: ${id}`);
        return null;
      }

      return template;
    } catch (error) {
      logger.error(`Error fetching template ${id}:`, error);
      return null;
    }
  }

  /**
   * Get templates by category
   */
  async getByCategory(category: ResumeCategory): Promise<ResumeTemplate[]> {
    try {
      return await this.storage.getByCategory(category);
    } catch (error) {
      logger.error(`Error fetching templates by category ${category}:`, error);
      return [];
    }
  }

  /**
   * Search templates
   */
  async search(query: string): Promise<ResumeTemplate[]> {
    try {
      if (!query || query.trim().length === 0) {
        return await this.getAll();
      }
      return await this.storage.search(query);
    } catch (error) {
      logger.error('Error searching templates:', error);
      return [];
    }
  }

  /**
   * Get templates with advanced filtering
   */
  async filter(options: TemplateFilterOptions): Promise<ResumeTemplate[]> {
    try {
      let templates = await this.getAll();

      // Apply search query
      if (options.searchQuery) {
        templates = await this.search(options.searchQuery);
      }

      // Apply category filter
      if (options.category && options.category !== 'all') {
        templates = templates.filter(t => t.category === options.category);
      }

      // Apply difficulty filter
      if (options.difficulty && options.difficulty !== 'all') {
        templates = templates.filter(t => t.difficulty === options.difficulty);
      }

      // Apply layout filter
      if (options.layout && options.layout !== 'all') {
        templates = templates.filter(t => t.layout === options.layout);
      }

      // Apply premium filter
      if (options.isPremium !== undefined) {
        templates = templates.filter(t => t.isPremium === options.isPremium);
      }

      // Apply industries filter
      if (options.industries && options.industries.length > 0) {
        templates = templates.filter(t =>
          options.industries!.some(industry =>
            t.industry.some(tInd => tInd.toLowerCase().includes(industry.toLowerCase()))
          )
        );
      }

      // Apply tags filter
      if (options.tags && options.tags.length > 0) {
        templates = templates.filter(t =>
          options.tags!.some(tag =>
            t.tags.some(tTag => tTag.toLowerCase().includes(tag.toLowerCase()))
          )
        );
      }

      // Apply rating filter
      if (options.minRating !== undefined) {
        templates = templates.filter(t => t.rating >= options.minRating!);
      }
      if (options.maxRating !== undefined) {
        templates = templates.filter(t => t.rating <= options.maxRating!);
      }

      return templates;
    } catch (error) {
      logger.error('Error filtering templates:', error);
      return [];
    }
  }

  /**
   * Sort templates
   */
  sort(templates: ResumeTemplate[], sortBy: TemplateSortOption): ResumeTemplate[] {
    const sorted = [...templates]; // Don't mutate original array

    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));

      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));

      case 'rating-desc':
        return sorted.sort((a, b) => b.rating - a.rating);

      case 'rating-asc':
        return sorted.sort((a, b) => a.rating - b.rating);

      case 'downloads-desc':
        return sorted.sort((a, b) => b.downloads - a.downloads);

      case 'downloads-asc':
        return sorted.sort((a, b) => a.downloads - b.downloads);

      case 'date-desc':
        return sorted.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

      case 'date-asc':
        return sorted.sort((a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );

      default:
        return sorted;
    }
  }

  /**
   * Get templates with filtering and sorting
   */
  async query(
    filterOptions: TemplateFilterOptions,
    sortBy: TemplateSortOption = 'rating-desc'
  ): Promise<ResumeTemplate[]> {
    const filtered = await this.filter(filterOptions);
    return this.sort(filtered, sortBy);
  }

  /**
   * Get premium templates only
   */
  async getPremiumTemplates(): Promise<ResumeTemplate[]> {
    try {
      return await this.storage.getPremium();
    } catch (error) {
      logger.error('Error fetching premium templates:', error);
      return [];
    }
  }

  /**
   * Get templates by difficulty
   */
  async getByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<ResumeTemplate[]> {
    try {
      return await this.storage.getByDifficulty(difficulty);
    } catch (error) {
      logger.error(`Error fetching templates by difficulty ${difficulty}:`, error);
      return [];
    }
  }

  /**
   * Get templates by layout
   */
  async getByLayout(layout: 'single-column' | 'two-column' | 'hybrid'): Promise<ResumeTemplate[]> {
    try {
      return await this.storage.getByLayout(layout);
    } catch (error) {
      logger.error(`Error fetching templates by layout ${layout}:`, error);
      return [];
    }
  }

  /**
   * Get templates by industry
   */
  async getByIndustry(industry: Industry): Promise<ResumeTemplate[]> {
    try {
      return await this.storage.getByIndustry(industry);
    } catch (error) {
      logger.error(`Error fetching templates by industry ${industry}:`, error);
      return [];
    }
  }

  /**
   * Get template statistics
   */
  async getStats(): Promise<{
    total: number;
    premium: number;
    free: number;
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
    byLayout: Record<string, number>;
    avgRating: number;
    totalDownloads: number;
  }> {
    try {
      const templates = await this.getAll();

      const stats = {
        total: templates.length,
        premium: templates.filter(t => t.isPremium).length,
        free: templates.filter(t => !t.isPremium).length,
        byCategory: {} as Record<string, number>,
        byDifficulty: {} as Record<string, number>,
        byLayout: {} as Record<string, number>,
        avgRating: 0,
        totalDownloads: 0,
      };

      // Calculate category distribution
      templates.forEach(t => {
        stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + 1;
        stats.byDifficulty[t.difficulty] = (stats.byDifficulty[t.difficulty] || 0) + 1;
        stats.byLayout[t.layout] = (stats.byLayout[t.layout] || 0) + 1;
        stats.totalDownloads += t.downloads;
      });

      // Calculate average rating
      stats.avgRating = templates.length > 0
        ? templates.reduce((sum, t) => sum + t.rating, 0) / templates.length
        : 0;

      return stats;
    } catch (error) {
      logger.error('Error calculating template stats:', error);
      throw error;
    }
  }

  /**
   * Validate a template
   */
  validate(template: ResumeTemplate): boolean {
    return isValidResumeTemplate(template);
  }

  /**
   * Check if template exists
   */
  async exists(id: string): Promise<boolean> {
    const template = await this.getById(id);
    return template !== null;
  }
}

// ============================================================================
// DEFAULT INSTANCE
// ============================================================================

// This will be initialized with actual templates data
let defaultServiceInstance: TemplateService | null = null;

/**
 * Initialize the default template service
 * Call this once at app startup with your template data
 */
export function initializeTemplateService(templates: ResumeTemplate[]): TemplateService {
  const storage = new LocalTemplateStorage(templates);
  defaultServiceInstance = new TemplateService(storage);
  logger.debug('Template service initialized with', templates.length, 'templates');
  return defaultServiceInstance;
}

/**
 * Get the default template service instance
 * @throws {Error} if service not initialized
 */
export function getTemplateService(): TemplateService {
  if (!defaultServiceInstance) {
    throw new Error(
      'Template service not initialized. Call initializeTemplateService() first.'
    );
  }
  return defaultServiceInstance;
}

/**
 * Check if service is initialized
 */
export function isTemplateServiceInitialized(): boolean {
  return defaultServiceInstance !== null;
}
