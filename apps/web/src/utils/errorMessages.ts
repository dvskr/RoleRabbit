/**
 * User-friendly error message utilities
 * Converts technical errors into actionable user messages
 * Maps backend error codes to user-friendly messages (Section 1.5)
 */

export interface ErrorContext {
  action?: string; // e.g., 'saving resume', 'loading data'
  feature?: string; // e.g., 'resume builder', 'profile'
  errorCode?: string | number;
  originalError?: any;
}

// HTTP Status Code to User-Friendly Message Mapping (Section 1.5 requirement)
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  // Client Errors (4xx)
  400: 'Invalid request. Please check your input and try again.',
  401: 'You need to be logged in to perform this action.',
  403: "You don't have permission to access this resource.",
  404: 'Portfolio not found.',
  405: 'This action is not allowed.',
  408: 'Request timeout. Please try again.',
  409: 'This action conflicts with the current state. Please refresh and try again.',
  413: 'The file is too large. Please upload a smaller file.',
  415: 'This file type is not supported.',
  422: 'Unable to process your request. Please check your input.',
  429: 'Too many requests, please wait a moment and try again.',

  // Server Errors (5xx)
  500: 'Server error, please try again.',
  502: 'Unable to connect to the server. Please try again.',
  503: 'The service is temporarily unavailable. Please try again later.',
  504: 'The request took too long. Please try again.',
};

// Backend Error Codes to User-Friendly Messages (Section 1.5 requirement)
export const ERROR_CODE_MESSAGES: Record<string, string> = {
  // Portfolio-specific errors
  PORTFOLIO_NOT_FOUND: 'Portfolio not found.',
  PORTFOLIO_NAME_TAKEN: 'This portfolio name is already taken.',
  PORTFOLIO_LIMIT_REACHED: 'You have reached the maximum number of portfolios.',
  SUBDOMAIN_NOT_AVAILABLE: 'This subdomain is already taken.',
  SUBDOMAIN_INVALID: 'Invalid subdomain format.',
  CUSTOM_DOMAIN_INVALID: 'Invalid custom domain.',
  TEMPLATE_NOT_FOUND: 'Template not found.',

  // General errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: "You don't have permission to perform this action.",
  RATE_LIMIT_EXCEEDED: 'Too many requests, please wait.',
  SERVER_ERROR: 'Server error, please try again.',
};

/**
 * Gets user-friendly error message based on error type
 * First checks specific error codes, then HTTP status codes, then falls back to pattern matching
 */
export const getUserFriendlyError = (
  error: any,
  context: ErrorContext = {}
): { message: string; action?: string; canRetry?: boolean } => {
  const errorMessage = error?.message || error?.error || String(error || 'Unknown error');
  const lowerMessage = errorMessage.toLowerCase();
  const statusCode = error?.statusCode || error?.status;
  const errorCode = error?.code || error?.errorCode || context.errorCode;

  // First, check for specific error codes (Section 1.5 requirement)
  if (errorCode && typeof errorCode === 'string' && ERROR_CODE_MESSAGES[errorCode]) {
    return {
      message: ERROR_CODE_MESSAGES[errorCode],
      action: getActionForErrorCode(errorCode),
      canRetry: isRetryableErrorCode(errorCode),
    };
  }

  // Second, check for HTTP status codes (Section 1.5 requirement)
  if (statusCode && HTTP_STATUS_MESSAGES[statusCode]) {
    return {
      message: HTTP_STATUS_MESSAGES[statusCode],
      action: getActionForStatusCode(statusCode),
      canRetry: isRetryableStatusCode(statusCode),
    };
  }

  // Network/Connection errors
  if (
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('networkerror') ||
    lowerMessage.includes('network error') ||
    lowerMessage.includes('connection') ||
    statusCode === 0
  ) {
    return {
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      action: 'Check your internet connection',
      canRetry: true,
    };
  }

  // Timeout errors
  if (lowerMessage.includes('timeout') || statusCode === 408) {
    return {
      message: 'The request took too long to complete. Please try again.',
      action: 'Try again in a moment',
      canRetry: true,
    };
  }

  // Authentication errors
  if (statusCode === 401 || lowerMessage.includes('unauthorized') || lowerMessage.includes('authentication')) {
    return {
      message: 'Your session has expired. Please log in again.',
      action: 'Log in again',
      canRetry: false,
    };
  }

  // Permission errors
  if (statusCode === 403 || lowerMessage.includes('forbidden') || lowerMessage.includes('permission')) {
    return {
      message: 'You don\'t have permission to perform this action.',
      action: 'Contact support if you believe this is an error',
      canRetry: false,
    };
  }

  // Not found errors
  if (statusCode === 404 || lowerMessage.includes('not found')) {
    return {
      message: 'The requested resource could not be found.',
      action: 'Refresh the page or check if the resource was deleted',
      canRetry: true,
    };
  }

  // Conflict errors (409)
  if (statusCode === 409 || lowerMessage.includes('conflict')) {
    return {
      message: 'This resume was updated by another device. Please refresh to see the latest changes.',
      action: 'Refresh the page to sync changes',
      canRetry: true,
    };
  }

  // Validation errors
  if (statusCode === 400 || lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    const validationMessage = error?.details || errorMessage;
    return {
      message: `Invalid data: ${validationMessage}. Please check your input and try again.`,
      action: 'Fix the errors highlighted in the form',
      canRetry: false,
    };
  }

  // Server errors
  if (statusCode >= 500 || lowerMessage.includes('server error') || lowerMessage.includes('internal error')) {
    return {
      message: 'Our servers are experiencing issues. We\'re working to fix this. Please try again in a few moments.',
      action: 'Try again in a few moments',
      canRetry: true,
    };
  }

  // Rate limiting
  if (statusCode === 429 || lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
    return {
      message: 'Too many requests. Please wait a moment before trying again.',
      action: 'Wait a moment and try again',
      canRetry: true,
    };
  }

  // AI quota/usage limits
  if (lowerMessage.includes('usage limit') || lowerMessage.includes('quota')) {
    return {
      message: 'You have reached the AI usage limit. Please wait a few minutes or upgrade your plan to continue.',
      action: 'Wait a few minutes or upgrade your plan',
      canRetry: false,
    };
  }

  // AI credentials misconfiguration
  if (lowerMessage.includes('ai service credentials') || lowerMessage.includes('invalid key')) {
    return {
      message: 'The AI service is misconfigured. Please contact support so we can resolve it quickly.',
      action: 'Contact support',
      canRetry: false,
    };
  }

  // AI service outage/unavailable
  if (lowerMessage.includes('temporarily unavailable')) {
    return {
      message: 'The AI service is temporarily unavailable. Please try again in a few minutes.',
      action: 'Try again in a few minutes',
      canRetry: true,
    };
  }

  // Generic API errors
  if (statusCode && statusCode >= 400) {
    return {
      message: `An error occurred (${statusCode}): ${errorMessage}. Please try again.`,
      action: 'Try again or contact support if the problem persists',
      canRetry: true,
    };
  }

  // Default fallback
  return {
    message: errorMessage || 'An unexpected error occurred. Please try again.',
    action: context.action ? `Retry ${context.action}` : 'Try again',
    canRetry: true,
  };
};

/**
 * Formats error message for display in UI
 */
export const formatErrorForDisplay = (error: any, context: ErrorContext = {}): string => {
  const friendly = getUserFriendlyError(error, context);
  return friendly.message;
};

/**
 * Gets actionable steps for error recovery
 */
export const getErrorRecoverySteps = (error: any, context: ErrorContext = {}): string[] => {
  const friendly = getUserFriendlyError(error, context);
  const steps: string[] = [];

  if (friendly.action) {
    steps.push(friendly.action);
  }

  // Add context-specific steps
  if (context.feature === 'resume builder') {
    if (friendly.canRetry) {
      steps.push('Your changes are saved locally and will be synced when connection is restored');
    }
  }

  return steps;
};

/**
 * Helper: Get action text for specific error codes
 */
function getActionForErrorCode(errorCode: string): string | undefined {
  const actions: Record<string, string> = {
    PORTFOLIO_NOT_FOUND: 'Go back to portfolios list',
    PORTFOLIO_NAME_TAKEN: 'Choose a different name',
    PORTFOLIO_LIMIT_REACHED: 'Upgrade your plan or delete unused portfolios',
    SUBDOMAIN_NOT_AVAILABLE: 'Try a different subdomain',
    SUBDOMAIN_INVALID: 'Check subdomain requirements',
    CUSTOM_DOMAIN_INVALID: 'Check domain format',
    TEMPLATE_NOT_FOUND: 'Go back to templates',
    VALIDATION_ERROR: 'Fix the errors and try again',
    UNAUTHORIZED: 'Log in or contact support',
    RATE_LIMIT_EXCEEDED: 'Wait a moment and try again',
    SERVER_ERROR: 'Try again in a few moments',
  };
  return actions[errorCode];
}

/**
 * Helper: Check if error code is retryable
 */
function isRetryableErrorCode(errorCode: string): boolean {
  const retryable = [
    'RATE_LIMIT_EXCEEDED',
    'SERVER_ERROR',
    'SUBDOMAIN_NOT_AVAILABLE',
  ];
  return retryable.includes(errorCode);
}

/**
 * Helper: Get action text for HTTP status codes
 */
function getActionForStatusCode(statusCode: number): string | undefined {
  if (statusCode === 401) return 'Log in again';
  if (statusCode === 403) return 'Contact support if you believe this is an error';
  if (statusCode === 404) return 'Check the URL or go back';
  if (statusCode === 429) return 'Wait a moment and try again';
  if (statusCode >= 500) return 'Try again in a few moments';
  return 'Try again';
}

/**
 * Helper: Check if HTTP status code is retryable
 */
function isRetryableStatusCode(statusCode: number): boolean {
  // 5xx server errors are retryable
  if (statusCode >= 500 && statusCode < 600) return true;
  // 408 (Timeout) and 429 (Rate Limit) are retryable
  if (statusCode === 408 || statusCode === 429) return true;
  // 404 can be retried (might be temporary)
  if (statusCode === 404) return true;
  return false;
}

