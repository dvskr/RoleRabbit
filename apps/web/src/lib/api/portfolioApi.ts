/**
 * Portfolio API Client
 * Comprehensive API integration with error handling, retry logic, request cancellation, and validation
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

import { logger } from '../../utils/logger';

// Import centralized types
import type {
  Portfolio,
  PortfolioData,
  PortfolioTemplate,
  PortfolioVersion,
  CustomDomain,
  PortfolioAnalytics,
  PortfolioShare,
  PortfolioDeployment,
  ApiError,
} from '../../types/portfolio';

// Import validation schemas and type guards
import {
  validateCreatePortfolioRequest,
  validateUpdatePortfolioRequest,
  validateSubdomain,
  validateCustomDomain,
  validatePortfolioResponse,
  validatePortfolioListResponse,
  validateTemplateResponse,
  validateTemplateListResponse,
  isPortfolio,
  isPortfolioData,
  type CreatePortfolioRequest,
  type UpdatePortfolioRequest,
  type PublishPortfolioRequest,
  type CreateShareLinkRequest,
  type PortfolioListResponse as PortfolioListResponseType,
  type PortfolioResponse as PortfolioResponseType,
} from '../validation/portfolio.validation';

// Re-export types for convenience
export type {
  Portfolio,
  PortfolioData,
  PortfolioTemplate,
  PortfolioVersion,
  CustomDomain,
  PortfolioAnalytics,
  PortfolioShare,
  PortfolioDeployment,
  CreatePortfolioRequest,
  UpdatePortfolioRequest,
  PublishPortfolioRequest,
  CreateShareLinkRequest,
  ApiError,
};

// Response DTOs (local to this file)
export interface PortfolioListResponse {
  portfolios: Portfolio[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PortfolioResponse {
  portfolio: Portfolio;
}

export interface TemplateListResponse {
  templates: PortfolioTemplate[];
}

export interface AnalyticsResponse {
  analytics: PortfolioAnalytics[];
  summary: {
    totalViews: number;
    totalUniqueVisitors: number;
    avgViewsPerDay: number;
  };
}

export interface ShareLinkResponse {
  shareLink: PortfolioShare;
  url: string;
}

export interface SubdomainCheckResponse {
  available: boolean;
  subdomain: string;
}

// ========================================
// RETRY UTILITY WITH EXPONENTIAL BACKOFF
// ========================================

interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if it's the last attempt
      if (attempt === options.maxRetries) {
        break;
      }

      // Don't retry if status code is not retryable
      if (error.statusCode && !options.retryableStatusCodes.includes(error.statusCode)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        options.initialDelay * Math.pow(options.backoffMultiplier, attempt),
        options.maxDelay
      );

      logger.warn(`Request failed (attempt ${attempt + 1}/${options.maxRetries + 1}), retrying in ${delay}ms...`, error);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ========================================
// API CLIENT CLASS
// ========================================

class PortfolioApiClient {
  private baseUrl: string;
  private abortControllers: Map<string, AbortController>;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.abortControllers = new Map();
  }

  /**
   * Create an abort controller for a request and store it
   */
  private createAbortController(key: string): AbortSignal {
    // Cancel previous request with same key if exists
    this.cancelRequest(key);

    const controller = new AbortController();
    this.abortControllers.set(key, controller);
    return controller.signal;
  }

  /**
   * Cancel a specific request by key
   */
  public cancelRequest(key: string): void {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(key);
    }
  }

  /**
   * Cancel all pending requests
   */
  public cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  /**
   * Clean up abort controller after request completes
   */
  private cleanupAbortController(key: string): void {
    this.abortControllers.delete(key);
  }

  /**
   * Generic request wrapper with timeout, retry, and error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    config: {
      timeout?: number;
      retry?: boolean;
      abortKey?: string;
    } = {}
  ): Promise<T> {
    const {
      timeout = 30000, // 30 seconds default
      retry = true,
      abortKey = endpoint
    } = config;

    const requestFn = async (): Promise<T> => {
      // Create abort signal if abort key provided
      const signal = abortKey ? this.createAbortController(abortKey) : undefined;

      // Create timeout controller
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...options.headers,
        };

        const url = `${this.baseUrl}${endpoint}`;

        // Combine abort signals if both exist
        let finalSignal: AbortSignal | undefined = signal;
        if (signal && options.signal) {
          // Both signals exist, need to combine them
          const combinedController = new AbortController();
          signal.addEventListener('abort', () => combinedController.abort());
          options.signal.addEventListener('abort', () => combinedController.abort());
          timeoutController.signal.addEventListener('abort', () => combinedController.abort());
          finalSignal = combinedController.signal;
        } else if (signal || options.signal) {
          // One exists
          const controller = new AbortController();
          const existingSignal = signal || options.signal!;
          existingSignal.addEventListener('abort', () => controller.abort());
          timeoutController.signal.addEventListener('abort', () => controller.abort());
          finalSignal = controller.signal;
        } else {
          // Neither exists, just use timeout
          finalSignal = timeoutController.signal;
        }

        const response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
          signal: finalSignal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage = `API error (${response.status}): ${response.statusText}`;
          let errorDetails: any = undefined;

          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
            errorDetails = errorData.details || errorData.meta;
          } catch {
            // Failed to parse error response
          }

          const error: ApiError = new Error(errorMessage) as ApiError;
          error.statusCode = response.status;
          error.details = errorDetails;

          // Map status codes to error codes
          if (response.status === 404) error.code = 'NOT_FOUND';
          else if (response.status === 403) error.code = 'FORBIDDEN';
          else if (response.status === 429) error.code = 'RATE_LIMITED';
          else if (response.status === 409) error.code = 'CONFLICT';
          else if (response.status === 400) error.code = 'VALIDATION_ERROR';
          else if (response.status >= 500) error.code = 'SERVER_ERROR';

          throw error;
        }

        // Handle empty responses
        if (response.status === 204 || response.status === 205) {
          return undefined as T;
        }

        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return await response.json();
        }

        const text = await response.text();
        return (text as unknown) as T;
      } catch (error: any) {
        clearTimeout(timeoutId);

        // Handle abort errors
        if (error.name === 'AbortError') {
          const abortError: ApiError = new Error('Request was cancelled') as ApiError;
          abortError.code = 'ABORTED';
          throw abortError;
        }

        // Handle timeout errors
        if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
          const timeoutError: ApiError = new Error(`Request timed out after ${timeout}ms`) as ApiError;
          timeoutError.code = 'TIMEOUT';
          throw timeoutError;
        }

        // Network errors
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
          const networkError: ApiError = new Error('Network error. Please check your connection.') as ApiError;
          networkError.code = 'NETWORK_ERROR';
          throw networkError;
        }

        throw error;
      } finally {
        clearTimeout(timeoutId);
        if (abortKey) {
          this.cleanupAbortController(abortKey);
        }
      }
    };

    try {
      if (retry) {
        return await retryWithExponentialBackoff(requestFn, {
          maxRetries: 3,
          initialDelay: 1000,
          maxDelay: 10000,
          backoffMultiplier: 2,
          retryableStatusCodes: [408, 429, 500, 502, 503, 504],
        });
      } else {
        return await requestFn();
      }
    } catch (error: any) {
      logger.error(`Portfolio API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ========================================
  // PORTFOLIO CRUD OPERATIONS
  // ========================================

  /**
   * Get all portfolios for the current user
   * ✅ Validates response structure
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    isPublished?: boolean;
    isDraft?: boolean;
    sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'views';
    sortOrder?: 'asc' | 'desc';
  }): Promise<PortfolioListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isPublished !== undefined) queryParams.append('isPublished', params.isPublished.toString());
    if (params?.isDraft !== undefined) queryParams.append('isDraft', params.isDraft.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const query = queryParams.toString();
    const endpoint = query ? `/api/portfolios?${query}` : '/api/portfolios';

    const response = await this.request<PortfolioListResponse>(endpoint, {
      method: 'GET',
    }, { abortKey: 'getPortfolios' });

    // Validate response structure
    const validation = validatePortfolioListResponse(response);
    if (!validation.success) {
      logger.warn('Portfolio list response validation failed', validation.errors);
      // Return response anyway but log the issue
    }

    return response;
  }

  /**
   * Get a single portfolio by ID
   * ✅ Validates response structure
   */
  async getById(id: string): Promise<PortfolioResponse> {
    const response = await this.request<PortfolioResponse>(`/api/portfolios/${id}`, {
      method: 'GET',
    }, { abortKey: `getPortfolio-${id}` });

    // Validate response structure
    const validation = validatePortfolioResponse(response);
    if (!validation.success) {
      logger.warn('Portfolio response validation failed', validation.errors);
      // Return response anyway but log the issue
    }

    return response;
  }

  /**
   * Create a new portfolio
   * ✅ Validates input before sending to backend
   * ✅ Validates response structure
   */
  async create(data: CreatePortfolioRequest): Promise<PortfolioResponse> {
    // Validate input data
    const validation = validateCreatePortfolioRequest(data);
    if (!validation.success) {
      const error: ApiError = new Error(validation.errors.join(', ')) as ApiError;
      error.code = 'VALIDATION_ERROR';
      error.details = validation.errors;
      throw error;
    }

    const response = await this.request<PortfolioResponse>('/api/portfolios', {
      method: 'POST',
      body: JSON.stringify(validation.data),
    }, { timeout: 30000, retry: true, abortKey: 'createPortfolio' });

    // Validate response structure
    const responseValidation = validatePortfolioResponse(response);
    if (!responseValidation.success) {
      logger.warn('Create portfolio response validation failed', responseValidation.errors);
    }

    return response;
  }

  /**
   * Update an existing portfolio
   * ✅ Validates input before sending to backend
   * ✅ Validates response structure
   */
  async update(id: string, data: UpdatePortfolioRequest): Promise<PortfolioResponse> {
    // Validate input data
    const validation = validateUpdatePortfolioRequest(data);
    if (!validation.success) {
      const error: ApiError = new Error(validation.errors.join(', ')) as ApiError;
      error.code = 'VALIDATION_ERROR';
      error.details = validation.errors;
      throw error;
    }

    const response = await this.request<PortfolioResponse>(`/api/portfolios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(validation.data),
    }, { timeout: 30000, retry: true, abortKey: `updatePortfolio-${id}` });

    // Validate response structure
    const responseValidation = validatePortfolioResponse(response);
    if (!responseValidation.success) {
      logger.warn('Update portfolio response validation failed', responseValidation.errors);
    }

    return response;
  }

  /**
   * Partially update a portfolio (PATCH)
   * ✅ Validates input before sending to backend
   * ✅ Validates response structure
   */
  async patch(id: string, data: Partial<UpdatePortfolioRequest>): Promise<PortfolioResponse> {
    // Validate input data
    const validation = validateUpdatePortfolioRequest(data);
    if (!validation.success) {
      const error: ApiError = new Error(validation.errors.join(', ')) as ApiError;
      error.code = 'VALIDATION_ERROR';
      error.details = validation.errors;
      throw error;
    }

    const response = await this.request<PortfolioResponse>(`/api/portfolios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(validation.data),
    }, { timeout: 30000, retry: true, abortKey: `patchPortfolio-${id}` });

    // Validate response structure
    const responseValidation = validatePortfolioResponse(response);
    if (!responseValidation.success) {
      logger.warn('Patch portfolio response validation failed', responseValidation.errors);
    }

    return response;
  }

  /**
   * Delete a portfolio (soft delete)
   */
  async delete(id: string): Promise<void> {
    return this.request<void>(`/api/portfolios/${id}`, {
      method: 'DELETE',
    }, { retry: true, abortKey: `deletePortfolio-${id}` });
  }

  /**
   * Duplicate a portfolio
   */
  async duplicate(id: string, name?: string): Promise<PortfolioResponse> {
    return this.request<PortfolioResponse>(`/api/portfolios/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }, { timeout: 30000, retry: true });
  }

  /**
   * Toggle portfolio published status
   */
  async togglePublish(id: string): Promise<PortfolioResponse> {
    return this.request<PortfolioResponse>(`/api/portfolios/${id}/toggle-publish`, {
      method: 'POST',
    }, { timeout: 90000, retry: true }); // Longer timeout for publish operations
  }

  // ========================================
  // PUBLISHING & DEPLOYMENT
  // ========================================

  /**
   * Publish portfolio with deployment configuration
   */
  async publish(id: string, config: PublishPortfolioRequest): Promise<PortfolioResponse> {
    return this.request<PortfolioResponse>(`/api/portfolios/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify(config),
    }, { timeout: 90000, retry: true, abortKey: `publishPortfolio-${id}` }); // 90s for deploy ops
  }

  /**
   * Unpublish portfolio
   */
  async unpublish(id: string): Promise<PortfolioResponse> {
    return this.request<PortfolioResponse>(`/api/portfolios/${id}/unpublish`, {
      method: 'POST',
    }, { timeout: 60000, retry: true });
  }

  /**
   * Deploy portfolio (trigger build and deployment)
   */
  async deploy(id: string, config?: PublishPortfolioRequest): Promise<{ deploymentId: string; status: string }> {
    return this.request<{ deploymentId: string; status: string }>(`/api/portfolios/${id}/deploy`, {
      method: 'POST',
      body: JSON.stringify(config || {}),
    }, { timeout: 90000, retry: true, abortKey: `deployPortfolio-${id}` });
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(id: string, deploymentId: string): Promise<PortfolioDeployment> {
    return this.request<PortfolioDeployment>(`/api/portfolios/${id}/deployments/${deploymentId}`, {
      method: 'GET',
    }, { retry: false }); // Don't retry status checks
  }

  /**
   * Get deployment history
   */
  async getDeploymentHistory(id: string): Promise<{ deployments: PortfolioDeployment[] }> {
    return this.request<{ deployments: PortfolioDeployment[] }>(`/api/portfolios/${id}/deployments`, {
      method: 'GET',
    });
  }

  // ========================================
  // SUBDOMAIN & CUSTOM DOMAIN
  // ========================================

  /**
   * Check subdomain availability
   * ✅ Validates subdomain format before checking
   */
  async checkSubdomain(subdomain: string): Promise<SubdomainCheckResponse> {
    // Validate subdomain format
    const validation = validateSubdomain(subdomain);
    if (!validation.success) {
      const error: ApiError = new Error(validation.error || 'Invalid subdomain format') as ApiError;
      error.code = 'VALIDATION_ERROR';
      error.details = { subdomain: validation.error };
      throw error;
    }

    return this.request<SubdomainCheckResponse>(`/api/portfolios/subdomain/check?subdomain=${encodeURIComponent(subdomain)}`, {
      method: 'GET',
    }, { retry: false, abortKey: 'checkSubdomain' });
  }

  /**
   * Add custom domain
   * ✅ Validates domain format before adding
   */
  async addCustomDomain(id: string, domain: string): Promise<CustomDomain> {
    // Validate custom domain format
    const validation = validateCustomDomain(domain);
    if (!validation.success) {
      const error: ApiError = new Error(validation.error || 'Invalid custom domain format') as ApiError;
      error.code = 'VALIDATION_ERROR';
      error.details = { domain: validation.error };
      throw error;
    }

    return this.request<CustomDomain>(`/api/portfolios/${id}/domains`, {
      method: 'POST',
      body: JSON.stringify({ domain }),
    }, { timeout: 30000, retry: true });
  }

  /**
   * Verify custom domain
   */
  async verifyDomain(id: string, domainId: string): Promise<CustomDomain> {
    return this.request<CustomDomain>(`/api/portfolios/${id}/domains/${domainId}/verify`, {
      method: 'POST',
    }, { timeout: 60000, retry: true });
  }

  /**
   * Remove custom domain
   */
  async removeDomain(id: string, domainId: string): Promise<void> {
    return this.request<void>(`/api/portfolios/${id}/domains/${domainId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get custom domains for portfolio
   */
  async getDomains(id: string): Promise<{ domains: CustomDomain[] }> {
    return this.request<{ domains: CustomDomain[] }>(`/api/portfolios/${id}/domains`, {
      method: 'GET',
    });
  }

  // ========================================
  // TEMPLATES
  // ========================================

  /**
   * Get all portfolio templates
   * ✅ Validates response structure
   */
  async getTemplates(category?: string): Promise<TemplateListResponse> {
    const endpoint = category
      ? `/api/portfolio-templates?category=${encodeURIComponent(category)}`
      : '/api/portfolio-templates';

    const response = await this.request<TemplateListResponse>(endpoint, {
      method: 'GET',
    }, { abortKey: 'getTemplates' });

    // Validate response structure
    const validation = validateTemplateListResponse(response);
    if (!validation.success) {
      logger.warn('Template list response validation failed', validation.errors);
    }

    return response;
  }

  /**
   * Get single template by ID
   * ✅ Validates response structure
   */
  async getTemplate(id: string): Promise<{ template: PortfolioTemplate }> {
    const response = await this.request<{ template: PortfolioTemplate }>(`/api/portfolio-templates/${id}`, {
      method: 'GET',
    });

    // Validate response structure
    const validation = validateTemplateResponse(response);
    if (!validation.success) {
      logger.warn('Template response validation failed', validation.errors);
    }

    return response;
  }

  /**
   * Preview template with data
   */
  async previewTemplate(id: string, data?: Partial<PortfolioData>): Promise<{ html: string; css: string }> {
    return this.request<{ html: string; css: string }>(`/api/portfolio-templates/${id}/preview`, {
      method: 'POST',
      body: JSON.stringify({ data: data || {} }),
    }, { timeout: 60000, retry: false });
  }

  // ========================================
  // DATA IMPORT
  // ========================================

  /**
   * Import data from user profile
   */
  async importFromProfile(id: string): Promise<PortfolioResponse> {
    return this.request<PortfolioResponse>(`/api/portfolios/${id}/import/profile`, {
      method: 'POST',
    }, { timeout: 30000, retry: true });
  }

  /**
   * Import data from resume
   */
  async importFromResume(id: string, resumeId: string): Promise<PortfolioResponse> {
    return this.request<PortfolioResponse>(`/api/portfolios/${id}/import/resume`, {
      method: 'POST',
      body: JSON.stringify({ resumeId }),
    }, { timeout: 90000, retry: true }); // Longer timeout for AI processing
  }

  /**
   * Import portfolio from JSON
   */
  async importFromJSON(data: any): Promise<PortfolioResponse> {
    return this.request<PortfolioResponse>('/api/portfolios/import/json', {
      method: 'POST',
      body: JSON.stringify(data),
    }, { timeout: 30000, retry: true });
  }

  // ========================================
  // EXPORT
  // ========================================

  /**
   * Export portfolio as HTML
   */
  async exportHTML(id: string): Promise<{ html: string; css: string; js?: string }> {
    return this.request<{ html: string; css: string; js?: string }>(`/api/portfolios/${id}/export/html`, {
      method: 'GET',
    }, { timeout: 60000, retry: false });
  }

  /**
   * Export portfolio as PDF
   */
  async exportPDF(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/portfolios/${id}/export/pdf`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to export PDF');
    }

    return await response.blob();
  }

  /**
   * Export portfolio as JSON
   */
  async exportJSON(id: string): Promise<{ portfolio: Portfolio }> {
    return this.request<{ portfolio: Portfolio }>(`/api/portfolios/${id}/export/json`, {
      method: 'GET',
    });
  }

  /**
   * Export portfolio as ZIP
   */
  async exportZIP(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/portfolios/${id}/export/zip`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to export ZIP');
    }

    return await response.blob();
  }

  // ========================================
  // VERSION CONTROL
  // ========================================

  /**
   * Get version history
   */
  async getVersions(id: string): Promise<{ versions: PortfolioVersion[] }> {
    return this.request<{ versions: PortfolioVersion[] }>(`/api/portfolios/${id}/versions`, {
      method: 'GET',
    });
  }

  /**
   * Create a new version
   */
  async createVersion(id: string, name?: string): Promise<{ version: PortfolioVersion }> {
    return this.request<{ version: PortfolioVersion }>(`/api/portfolios/${id}/versions`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  /**
   * Restore from version
   */
  async restoreVersion(id: string, versionId: string): Promise<PortfolioResponse> {
    return this.request<PortfolioResponse>(`/api/portfolios/${id}/versions/${versionId}/restore`, {
      method: 'POST',
    }, { timeout: 30000, retry: true });
  }

  /**
   * Compare versions
   */
  async compareVersions(id: string, versionId: string): Promise<{ changes: any }> {
    return this.request<{ changes: any }>(`/api/portfolios/${id}/versions/${versionId}/compare`, {
      method: 'GET',
    });
  }

  // ========================================
  // ANALYTICS
  // ========================================

  /**
   * Track portfolio view (public endpoint)
   */
  async trackView(id: string, metadata?: { referrer?: string; userAgent?: string }): Promise<void> {
    return this.request<void>(`/api/portfolios/${id}/track-view`, {
      method: 'POST',
      body: JSON.stringify(metadata || {}),
    }, { retry: false }); // Don't retry analytics
  }

  /**
   * Get analytics for date range
   */
  async getAnalytics(id: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AnalyticsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    const endpoint = query
      ? `/api/portfolios/${id}/analytics?${query}`
      : `/api/portfolios/${id}/analytics`;

    return this.request<AnalyticsResponse>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(id: string): Promise<{
    totalViews: number;
    totalVisitors: number;
    avgViewsPerDay: number;
  }> {
    return this.request<{
      totalViews: number;
      totalVisitors: number;
      avgViewsPerDay: number;
    }>(`/api/portfolios/${id}/analytics/summary`, {
      method: 'GET',
    });
  }

  // ========================================
  // SHARING & COLLABORATION
  // ========================================

  /**
   * Create share link
   */
  async createShareLink(id: string, options?: CreateShareLinkRequest): Promise<ShareLinkResponse> {
    return this.request<ShareLinkResponse>(`/api/portfolios/${id}/share`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  }

  /**
   * Get portfolio via share link (public)
   */
  async getByShareToken(token: string, password?: string): Promise<PortfolioResponse> {
    const body = password ? JSON.stringify({ password }) : undefined;
    return this.request<PortfolioResponse>(`/api/portfolios/shared/${token}`, {
      method: password ? 'POST' : 'GET',
      body,
    }, { retry: false });
  }

  /**
   * Revoke share link
   */
  async revokeShareLink(id: string, shareId: string): Promise<void> {
    return this.request<void>(`/api/portfolios/${id}/share/${shareId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get all share links for portfolio
   */
  async getShareLinks(id: string): Promise<{ shares: PortfolioShare[] }> {
    return this.request<{ shares: PortfolioShare[] }>(`/api/portfolios/${id}/share`, {
      method: 'GET',
    });
  }
}

// Export singleton instance
export const portfolioApi = new PortfolioApiClient();
export default portfolioApi;
