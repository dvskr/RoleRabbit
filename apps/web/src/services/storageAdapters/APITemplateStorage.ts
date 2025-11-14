/**
 * API Template Storage Adapter (Skeleton)
 *
 * Example implementation showing how to create an API-backed storage adapter.
 * This demonstrates the extensibility of the service layer architecture.
 *
 * To use this adapter:
 * 1. Implement the actual API calls
 * 2. Add error handling and retry logic
 * 3. Add request/response caching if needed
 * 4. Initialize service: new TemplateService(new APITemplateStorage(config))
 */

import type { ITemplateStorage } from '../templateService';
import type { ResumeTemplate } from '../../data/templates';
import type { ResumeCategory, Industry } from '../../data/categories';
import { logger } from '../../utils/logger';

/**
 * API configuration
 */
export interface APIConfig {
  /**
   * Base URL for the API
   */
  baseUrl: string;

  /**
   * API authentication token
   */
  authToken?: string;

  /**
   * Request timeout in milliseconds
   * @default 10000
   */
  timeout?: number;

  /**
   * Number of retry attempts
   * @default 3
   */
  retries?: number;
}

/**
 * API storage adapter
 * Fetches templates from a REST API
 *
 * NOTE: This is a skeleton implementation. Add your actual API logic.
 */
export class APITemplateStorage implements ITemplateStorage {
  private config: Required<APIConfig>;

  constructor(config: APIConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      authToken: config.authToken,
      timeout: config.timeout ?? 10000,
      retries: config.retries ?? 3,
    };

    logger.debug('APITemplateStorage initialized with baseUrl:', this.config.baseUrl);
  }

  /**
   * Make an API request with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.config.authToken && { Authorization: `Bearer ${this.config.authToken}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get all templates from API
   */
  async getAll(): Promise<ResumeTemplate[]> {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await this.request<{ templates: ResumeTemplate[] }>('/templates');
      return response.templates;
    } catch (error) {
      logger.error('Failed to fetch all templates:', error);
      return [];
    }
  }

  /**
   * Get template by ID from API
   */
  async getById(id: string): Promise<ResumeTemplate | null> {
    try {
      // TODO: Replace with your actual API endpoint
      const template = await this.request<ResumeTemplate>(`/templates/${id}`);
      return template;
    } catch (error) {
      logger.error(`Failed to fetch template ${id}:`, error);
      return null;
    }
  }

  /**
   * Get templates by category from API
   */
  async getByCategory(category: ResumeCategory): Promise<ResumeTemplate[]> {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await this.request<{ templates: ResumeTemplate[] }>(
        `/templates?category=${category}`
      );
      return response.templates;
    } catch (error) {
      logger.error(`Failed to fetch templates by category ${category}:`, error);
      return [];
    }
  }

  /**
   * Search templates via API
   */
  async search(query: string): Promise<ResumeTemplate[]> {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await this.request<{ templates: ResumeTemplate[] }>(
        `/templates/search?q=${encodeURIComponent(query)}`
      );
      return response.templates;
    } catch (error) {
      logger.error('Failed to search templates:', error);
      return [];
    }
  }

  /**
   * Get templates by industry from API
   */
  async getByIndustry(industry: Industry): Promise<ResumeTemplate[]> {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await this.request<{ templates: ResumeTemplate[] }>(
        `/templates?industry=${encodeURIComponent(industry)}`
      );
      return response.templates;
    } catch (error) {
      logger.error(`Failed to fetch templates by industry ${industry}:`, error);
      return [];
    }
  }

  /**
   * Get premium templates from API
   */
  async getPremium(): Promise<ResumeTemplate[]> {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await this.request<{ templates: ResumeTemplate[] }>(
        '/templates?premium=true'
      );
      return response.templates;
    } catch (error) {
      logger.error('Failed to fetch premium templates:', error);
      return [];
    }
  }

  /**
   * Get templates by difficulty from API
   */
  async getByDifficulty(
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<ResumeTemplate[]> {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await this.request<{ templates: ResumeTemplate[] }>(
        `/templates?difficulty=${difficulty}`
      );
      return response.templates;
    } catch (error) {
      logger.error(`Failed to fetch templates by difficulty ${difficulty}:`, error);
      return [];
    }
  }

  /**
   * Get templates by layout from API
   */
  async getByLayout(
    layout: 'single-column' | 'two-column' | 'hybrid'
  ): Promise<ResumeTemplate[]> {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await this.request<{ templates: ResumeTemplate[]>(
        `/templates?layout=${layout}`
      );
      return response.templates;
    } catch (error) {
      logger.error(`Failed to fetch templates by layout ${layout}:`, error);
      return [];
    }
  }
}

/**
 * Example usage:
 *
 * ```typescript
 * // Initialize with API storage
 * const apiStorage = new APITemplateStorage({
 *   baseUrl: 'https://api.example.com',
 *   authToken: 'your-token-here',
 *   timeout: 5000,
 *   retries: 3
 * });
 *
 * const templateService = new TemplateService(apiStorage);
 *
 * // Or with caching
 * const cachedApiStorage = new CachedTemplateStorage(apiStorage, {
 *   maxSize: 100,
 *   ttl: 300000, // 5 minutes
 *   enableStats: true
 * });
 *
 * const templateService = new TemplateService(cachedApiStorage);
 * ```
 */
