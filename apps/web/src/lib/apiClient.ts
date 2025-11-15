/**
 * Portfolio API Client
 * Section 1.2: API Integration with error handling, retries, and cancellation
 *
 * Features:
 * - Try-catch error handling
 * - AbortController for request cancellation
 * - Exponential backoff retry logic
 * - Request timeout handling
 * - Type-safe API calls with Zod validation
 */

import {
  Portfolio,
  PortfolioListResponseSchema,
  PortfolioSchema,
  CreatePortfolioRequestSchema,
  UpdatePortfolioRequestSchema,
  PublishPortfolioRequestSchema,
  ApiError,
} from '@/types/portfolio';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Initial retry delay in ms

// HTTP methods that should be retried on failure
const RETRYABLE_METHODS = ['GET', 'PUT', 'PATCH', 'DELETE'];

// HTTP status codes that should trigger a retry
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// ============================================================================
// TYPES
// ============================================================================

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

interface ListParams {
  page?: number;
  limit?: number;
  isPublished?: boolean;
  isDraft?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

interface PublishRequest {
  action: 'publish' | 'unpublish';
  subdomain?: string;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Create ApiError from various error types
 */
function createApiError(error: unknown, statusCode?: number): ApiError {
  if (error instanceof Error && 'statusCode' in error) {
    return error as ApiError;
  }

  const apiError = new Error(
    error instanceof Error ? error.message : 'An unknown error occurred'
  ) as ApiError;

  apiError.statusCode = statusCode;

  if (error instanceof Error) {
    apiError.stack = error.stack;
  }

  return apiError;
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response): Promise<ApiError> {
  let errorMessage = response.statusText || 'Request failed';
  let details: unknown;

  try {
    const errorData = await response.json();
    errorMessage = errorData.error || errorMessage;
    details = errorData.details;
  } catch {
    // If response is not JSON, use status text
  }

  const error = new Error(errorMessage) as ApiError;
  error.statusCode = response.status;
  error.details = details;
  error.originalResponse = await response.text().catch(() => undefined);

  return error;
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number): number {
  return RETRY_DELAY * Math.pow(2, attempt);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if request should be retried
 */
function shouldRetry(
  method: string,
  statusCode?: number,
  attempt?: number
): boolean {
  if (attempt && attempt >= MAX_RETRIES) {
    return false;
  }

  if (!RETRYABLE_METHODS.includes(method)) {
    return false;
  }

  if (statusCode && RETRYABLE_STATUS_CODES.includes(statusCode)) {
    return true;
  }

  return false;
}

// ============================================================================
// HTTP CLIENT
// ============================================================================

/**
 * Make HTTP request with timeout, retry, and error handling
 */
async function makeRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
    signal,
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  // Create AbortController for timeout
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

  // Combine signals if external signal provided
  const combinedSignal = signal
    ? combineAbortSignals([signal, timeoutController.signal])
    : timeoutController.signal;

  let lastError: ApiError | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const error = await parseErrorResponse(response);

        // Check if we should retry
        if (shouldRetry(method, response.status, attempt)) {
          lastError = error;
          const delay = getRetryDelay(attempt);
          console.warn(
            `Request failed (${response.status}), retrying in ${delay}ms (attempt ${attempt + 1}/${retries})...`
          );
          await sleep(delay);
          continue;
        }

        throw error;
      }

      // Parse successful response
      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort
      if (error instanceof Error && error.name === 'AbortError') {
        if (signal?.aborted) {
          throw createApiError(new Error('Request was cancelled'), 0);
        }
        throw createApiError(new Error('Request timeout'), 408);
      }

      // Network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        lastError = createApiError(
          new Error('Network error - please check your connection'),
          0
        );

        // Retry network errors
        if (attempt < retries) {
          const delay = getRetryDelay(attempt);
          console.warn(
            `Network error, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})...`
          );
          await sleep(delay);
          continue;
        }

        throw lastError;
      }

      // Other errors
      throw createApiError(error);
    }
  }

  // If all retries failed, throw last error
  throw lastError || createApiError(new Error('Request failed after retries'));
}

/**
 * Combine multiple AbortSignals
 */
function combineAbortSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }

    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  return controller.signal;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class PortfolioApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ==========================================================================
  // PORTFOLIO CRUD
  // ==========================================================================

  /**
   * Create a new portfolio
   * POST /api/portfolios
   */
  async createPortfolio(
    data: {
      name: string;
      templateId?: string;
      description?: string;
      data?: Record<string, unknown>;
    },
    signal?: AbortSignal
  ): Promise<Portfolio> {
    // Validate request
    const validated = CreatePortfolioRequestSchema.parse(data);

    const response = await makeRequest<Portfolio>('/portfolios', {
      method: 'POST',
      body: validated,
      signal,
    });

    // Validate response
    return PortfolioSchema.parse(response);
  }

  /**
   * List portfolios with pagination and filtering
   * GET /api/portfolios
   */
  async listPortfolios(
    params: ListParams = {},
    signal?: AbortSignal
  ): Promise<{ data: Portfolio[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.isPublished !== undefined) queryParams.set('isPublished', params.isPublished.toString());
    if (params.isDraft !== undefined) queryParams.set('isDraft', params.isDraft.toString());
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);

    const endpoint = `/portfolios${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await makeRequest<{
      data: Portfolio[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(endpoint, { signal });

    // Validate response
    return PortfolioListResponseSchema.parse(response);
  }

  /**
   * Get single portfolio by ID
   * GET /api/portfolios/:id
   */
  async getPortfolio(id: string, signal?: AbortSignal): Promise<Portfolio> {
    const response = await makeRequest<Portfolio>(`/portfolios/${id}`, {
      signal,
    });

    // Validate response
    return PortfolioSchema.parse(response);
  }

  /**
   * Update portfolio (full update)
   * PUT /api/portfolios/:id
   */
  async updatePortfolio(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      templateId?: string;
      data?: Record<string, unknown>;
      isPublished?: boolean;
      isDraft?: boolean;
      visibility?: 'PUBLIC' | 'UNLISTED' | 'PRIVATE' | 'PASSWORD_PROTECTED';
      metaTitle?: string | null;
      metaDescription?: string | null;
      ogImage?: string | null;
      version?: number;
    },
    signal?: AbortSignal
  ): Promise<Portfolio> {
    // Validate request
    const validated = UpdatePortfolioRequestSchema.parse(data);

    const response = await makeRequest<Portfolio>(`/portfolios/${id}`, {
      method: 'PUT',
      body: validated,
      signal,
    });

    // Validate response
    return PortfolioSchema.parse(response);
  }

  /**
   * Partial update portfolio
   * PATCH /api/portfolios/:id
   */
  async patchPortfolio(
    id: string,
    data: Partial<{
      name: string;
      data: Record<string, unknown>;
      isPublished: boolean;
      isDraft: boolean;
      visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE' | 'PASSWORD_PROTECTED';
    }>,
    signal?: AbortSignal
  ): Promise<Portfolio> {
    const response = await makeRequest<Portfolio>(`/portfolios/${id}`, {
      method: 'PATCH',
      body: data,
      signal,
    });

    // Validate response
    return PortfolioSchema.parse(response);
  }

  /**
   * Delete portfolio (soft delete)
   * DELETE /api/portfolios/:id
   */
  async deletePortfolio(
    id: string,
    signal?: AbortSignal
  ): Promise<{ message: string }> {
    return makeRequest<{ message: string }>(`/portfolios/${id}`, {
      method: 'DELETE',
      signal,
    });
  }

  /**
   * Duplicate portfolio
   * POST /api/portfolios/:id/duplicate
   */
  async duplicatePortfolio(
    id: string,
    signal?: AbortSignal
  ): Promise<Portfolio> {
    const response = await makeRequest<Portfolio>(
      `/portfolios/${id}/duplicate`,
      {
        method: 'POST',
        signal,
      }
    );

    // Validate response
    return PortfolioSchema.parse(response);
  }

  /**
   * Publish portfolio
   * POST /api/portfolios/:id/publish
   */
  async publishPortfolio(
    id: string,
    data: PublishRequest,
    signal?: AbortSignal
  ): Promise<{
    message: string;
    portfolio: Portfolio;
    deploymentUrl?: string;
  }> {
    // Validate request
    const validated = PublishPortfolioRequestSchema.parse(data);

    return makeRequest<{
      message: string;
      portfolio: Portfolio;
      deploymentUrl?: string;
    }>(`/portfolios/${id}/publish`, {
      method: 'POST',
      body: validated,
      signal,
    });
  }

  /**
   * Unpublish portfolio
   * POST /api/portfolios/:id/publish
   */
  async unpublishPortfolio(
    id: string,
    signal?: AbortSignal
  ): Promise<{ message: string; portfolio: Portfolio }> {
    return makeRequest<{ message: string; portfolio: Portfolio }>(
      `/portfolios/${id}/publish`,
      {
        method: 'POST',
        body: { action: 'unpublish' },
        signal,
      }
    );
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Default API client instance
 */
export const apiClient = new PortfolioApiClient();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create portfolio (convenience function)
 */
export async function createPortfolio(
  data: Parameters<PortfolioApiClient['createPortfolio']>[0],
  signal?: AbortSignal
): Promise<Portfolio> {
  return apiClient.createPortfolio(data, signal);
}

/**
 * List portfolios (convenience function)
 */
export async function listPortfolios(
  params?: ListParams,
  signal?: AbortSignal
): Promise<ReturnType<PortfolioApiClient['listPortfolios']>> {
  return apiClient.listPortfolios(params, signal);
}

/**
 * Get portfolio (convenience function)
 */
export async function getPortfolio(
  id: string,
  signal?: AbortSignal
): Promise<Portfolio> {
  return apiClient.getPortfolio(id, signal);
}

/**
 * Update portfolio (convenience function)
 */
export async function updatePortfolio(
  id: string,
  data: Parameters<PortfolioApiClient['updatePortfolio']>[1],
  signal?: AbortSignal
): Promise<Portfolio> {
  return apiClient.updatePortfolio(id, data, signal);
}

/**
 * Delete portfolio (convenience function)
 */
export async function deletePortfolio(
  id: string,
  signal?: AbortSignal
): Promise<{ message: string }> {
  return apiClient.deletePortfolio(id, signal);
}

/**
 * Duplicate portfolio (convenience function)
 */
export async function duplicatePortfolio(
  id: string,
  signal?: AbortSignal
): Promise<Portfolio> {
  return apiClient.duplicatePortfolio(id, signal);
}

/**
 * Publish portfolio (convenience function)
 */
export async function publishPortfolio(
  id: string,
  data: PublishRequest,
  signal?: AbortSignal
): Promise<ReturnType<PortfolioApiClient['publishPortfolio']>> {
  return apiClient.publishPortfolio(id, data, signal);
}

/**
 * Unpublish portfolio (convenience function)
 */
export async function unpublishPortfolio(
  id: string,
  signal?: AbortSignal
): Promise<{ message: string; portfolio: Portfolio }> {
  return apiClient.unpublishPortfolio(id, signal);
}
