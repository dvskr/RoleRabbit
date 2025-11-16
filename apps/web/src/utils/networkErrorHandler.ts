/**
 * Network Error Handler Utilities
 * FE-033: Network error handling with user-friendly messages
 */

export interface NetworkError {
  message: string;
  code?: string;
  status?: number;
  retryable: boolean;
  timeout?: boolean;
}

export function parseNetworkError(error: any): NetworkError {
  // Timeout errors
  if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
    return {
      message: 'The request took too long. Please check your connection and try again.',
      code: 'TIMEOUT',
      retryable: true,
      timeout: true,
    };
  }

  // Network errors (no connection)
  if (error?.message?.includes('Failed to fetch') || 
      error?.message?.includes('NetworkError') ||
      !navigator.onLine) {
    return {
      message: 'No internet connection. Please check your network and try again.',
      code: 'NETWORK_ERROR',
      retryable: true,
    };
  }

  // HTTP status errors
  if (error?.status || error?.response?.status) {
    const status = error.status || error.response?.status;
    
    switch (status) {
      case 400:
        return {
          message: error?.message || 'Invalid request. Please check your input and try again.',
          status: 400,
          retryable: false,
        };
      case 401:
        return {
          message: 'Your session has expired. Please refresh the page and try again.',
          status: 401,
          retryable: false,
        };
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          status: 403,
          retryable: false,
        };
      case 404:
        return {
          message: 'The requested resource was not found.',
          status: 404,
          retryable: false,
        };
      case 408:
        return {
          message: 'The request timed out. Please try again.',
          status: 408,
          retryable: true,
          timeout: true,
        };
      case 429:
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          status: 429,
          retryable: true,
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          message: 'Server error. Please try again in a moment.',
          status,
          retryable: true,
        };
      default:
        return {
          message: error?.message || `Request failed with status ${status}. Please try again.`,
          status,
          retryable: status >= 500 || status === 429,
        };
    }
  }

  // Generic error
  return {
    message: error?.message || 'An unexpected error occurred. Please try again.',
    retryable: true,
  };
}

export function getUserFriendlyErrorMessage(error: any): string {
  return parseNetworkError(error).message;
}

export function isRetryableError(error: any): boolean {
  return parseNetworkError(error).retryable;
}

