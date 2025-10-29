/**
 * API Error Handling Utilities
 */

export interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
}

export class ApiErrorHandler extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiErrorHandler';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'An error occurred',
      statusCode: error.response.status,
      details: error.response.data
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'No response from server',
      statusCode: 0,
      details: error.request
    };
  } else {
    // Error setting up request
    return {
      message: error.message || 'Unknown error',
      statusCode: 0,
      details: error
    };
  }
};

export const getErrorMessage = (error: any): string => {
  if (error instanceof ApiErrorHandler) {
    return error.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: any): boolean => {
  return error?.code === 'NETWORK_ERROR' || 
         error?.message?.includes('Network Error');
};

