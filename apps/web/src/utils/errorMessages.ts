/**
 * User-friendly error message utilities
 * Converts technical errors into actionable user messages
 */

export interface ErrorContext {
  action?: string; // e.g., 'saving resume', 'loading data'
  feature?: string; // e.g., 'resume builder', 'profile'
  errorCode?: string | number;
  originalError?: any;
}

/**
 * Gets user-friendly error message based on error type
 */
export const getUserFriendlyError = (
  error: any,
  context: ErrorContext = {}
): { message: string; action?: string; canRetry?: boolean } => {
  const errorMessage = error?.message || error?.error || String(error || 'Unknown error');
  const lowerMessage = errorMessage.toLowerCase();
  const statusCode = error?.statusCode || error?.status;

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

