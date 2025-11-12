/**
 * Frontend Error Handling Utilities
 * Provides user-friendly error messages and recovery actions
 */

export interface ErrorDetails {
  message: string;
  code?: string;
  category?: string;
  retryable?: boolean;
  suggestions?: string[];
  details?: any;
}

export interface APIError {
  success: false;
  error: ErrorDetails;
}

/**
 * Error categories matching backend
 */
export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AI_SERVICE = 'AI_SERVICE',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  RATE_LIMIT = 'RATE_LIMIT',
  AUTHENTICATION = 'AUTHENTICATION',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Parse error response from API
 */
export function parseAPIError(error: any): ErrorDetails {
  // Already formatted error
  if (error?.error) {
    return error.error;
  }
  
  // Network error
  if (error.message === 'Failed to fetch' || error.message === 'Network request failed') {
    return {
      message: 'Network connection lost. Please check your internet and try again.',
      category: ErrorCategory.NETWORK,
      retryable: true,
      suggestions: [
        'Check your internet connection',
        'Try refreshing the page',
        'Wait a moment and retry'
      ]
    };
  }
  
  // Timeout error
  if (error.message?.includes('timeout')) {
    return {
      message: 'Request timed out. The operation took too long.',
      category: ErrorCategory.NETWORK,
      retryable: true,
      suggestions: [
        'Try again with a shorter resume or job description',
        'Use Partial mode instead of Full',
        'Wait a moment and retry'
      ]
    };
  }
  
  // Generic error
  return {
    message: error.message || 'An unexpected error occurred',
    category: ErrorCategory.UNKNOWN,
    retryable: true,
    suggestions: [
      'Try refreshing the page',
      'Wait a moment and try again',
      'Contact support if the problem persists'
    ]
  };
}

/**
 * Get user-friendly error title
 */
export function getErrorTitle(category?: string): string {
  const titles: Record<string, string> = {
    [ErrorCategory.VALIDATION]: 'Invalid Input',
    [ErrorCategory.AI_SERVICE]: 'AI Service Unavailable',
    [ErrorCategory.DATABASE]: 'Database Error',
    [ErrorCategory.NETWORK]: 'Connection Error',
    [ErrorCategory.RATE_LIMIT]: 'Too Many Requests',
    [ErrorCategory.AUTHENTICATION]: 'Authentication Required',
    [ErrorCategory.BUSINESS_LOGIC]: 'Operation Failed',
    [ErrorCategory.UNKNOWN]: 'Unexpected Error'
  };
  
  return titles[category || ErrorCategory.UNKNOWN] || 'Error';
}

/**
 * Get icon for error category
 */
export function getErrorIcon(category?: string): string {
  const icons: Record<string, string> = {
    [ErrorCategory.VALIDATION]: '⚠️',
    [ErrorCategory.AI_SERVICE]: '🤖',
    [ErrorCategory.DATABASE]: '💾',
    [ErrorCategory.NETWORK]: '🌐',
    [ErrorCategory.RATE_LIMIT]: '⏱️',
    [ErrorCategory.AUTHENTICATION]: '🔐',
    [ErrorCategory.BUSINESS_LOGIC]: '❌',
    [ErrorCategory.UNKNOWN]: '❓'
  };
  
  return icons[category || ErrorCategory.UNKNOWN] || '❌';
}

/**
 * Determine if error should show retry button
 */
export function shouldShowRetry(error: ErrorDetails): boolean {
  if (error.retryable === false) {
    return false;
  }
  
  const nonRetryableCategories = [
    ErrorCategory.VALIDATION,
    ErrorCategory.AUTHENTICATION
  ];
  
  return !nonRetryableCategories.includes(error.category as ErrorCategory);
}

/**
 * Format error for display
 */
export interface FormattedError {
  title: string;
  message: string;
  icon: string;
  showRetry: boolean;
  suggestions: string[];
  technicalDetails?: string;
}

export function formatErrorForDisplay(error: any): FormattedError {
  const errorDetails = parseAPIError(error);
  
  return {
    title: getErrorTitle(errorDetails.category),
    message: errorDetails.message,
    icon: getErrorIcon(errorDetails.category),
    showRetry: shouldShowRetry(errorDetails),
    suggestions: errorDetails.suggestions || [],
    technicalDetails: errorDetails.code || errorDetails.details
      ? JSON.stringify({ code: errorDetails.code, ...errorDetails.details }, null, 2)
      : undefined
  };
}

/**
 * Create error handler for async operations
 */
export function createErrorHandler(options: {
  operation: string;
  onError?: (error: FormattedError) => void;
  onRetry?: () => void;
  showToast?: (message: string, type: string) => void;
}) {
  return (error: any) => {
    const formatted = formatErrorForDisplay(error);
    
    // Show toast if provided
    if (options.showToast) {
      options.showToast(formatted.message, 'error');
    }
    
    // Call error callback
    if (options.onError) {
      options.onError(formatted);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${options.operation}] Error:`, {
        formatted,
        original: error
      });
    }
  };
}

/**
 * Retry with exponential backoff (frontend version)
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, delay: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    onRetry
  } = options;
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(
          initialDelay * Math.pow(2, attempt - 1),
          maxDelay
        );
        
        if (onRetry) {
          onRetry(attempt, delay);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return await fn();
    } catch (error) {
      lastError = error;
      
      const errorDetails = parseAPIError(error);
      
      // Don't retry non-retryable errors
      if (!shouldShowRetry(errorDetails)) {
        throw error;
      }
      
      // Don't retry after last attempt
      if (attempt >= maxRetries) {
        throw error;
      }
    }
  }
  
  throw lastError;
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  onError?: (error: any) => void
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (onError) {
      onError(error);
    }
    return fallback;
  }
}

/**
 * Check if error is specific type
 */
export function isErrorType(error: any, category: ErrorCategory): boolean {
  const details = parseAPIError(error);
  return details.category === category;
}

/**
 * Extract error message from various error formats
 */
export function extractErrorMessage(error: any, fallback = 'An error occurred'): string {
  if (typeof error === 'string') return error;
  if (error?.error?.message) return error.error.message;
  if (error?.message) return error.message;
  return fallback;
}

