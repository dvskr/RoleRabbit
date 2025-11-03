/**
 * Centralized API Service
 * Connects frontend to backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Authentication token is now managed via httpOnly cookies
   * No need to get/manage token in JavaScript
   */
  private getAuthToken(): string | null {
    // Token is in httpOnly cookie, automatically sent by browser
    return null;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      
      // httpOnly cookie is automatically sent by browser
      // No need to manually add Authorization header

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Important: Include cookies in all requests
      });

      // If unauthorized (401), try to refresh token
      if (response.status === 401 && retryCount === 0 && endpoint !== '/api/auth/refresh') {
        try {
          // Attempt to refresh access token
          const refreshResponse = await fetch(`${this.baseUrl}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          // If refresh successful, retry original request
          if (refreshResponse.ok) {
            return this.request<T>(endpoint, options, retryCount + 1);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Token refresh failed, let it fall through to error handling
        }
      }

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `API error: ${response.statusText}`;
        let errorDetails: any = undefined;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          if (errorData.details) {
            errorDetails = errorData.details;
            if (typeof errorData.details === 'string' && !errorMessage.includes(errorData.details)) {
              errorMessage += ` - ${errorData.details}`;
            }
          }
        } catch (e) {
          // If response isn't JSON, use status text
        }

        const error: any = new Error(errorMessage);
        error.statusCode = response.status;
        if (errorDetails !== undefined) {
          error.details = errorDetails;
        }
        throw error;
      }

      return await response.json();
    } catch (error: any) {
      console.error('API request failed:', error);
      // Provide more helpful error messages
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        throw new Error('Failed to connect to server. Please check if the API server is running on http://localhost:3001');
      }
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.request('/health');
  }

  /**
   * Get API status
   */
  async getStatus() {
    return this.request('/api/status');
  }

  // ===== USER ENDPOINTS =====

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<any> {
    return this.request('/api/users/profile', {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Update user profile
   */
  async updateUserProfile(data: any): Promise<any> {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/api/users/profile/picture`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload profile picture');
    }

    return await response.json();
  }


  // ===== AUTHENTICATION ENDPOINTS =====

  /**
   * Login
   */
  async login(email: string, password: string): Promise<any> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
  }

  /**
   * Register
   */
  async register(userData: any): Promise<any> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      credentials: 'include',
    });
  }

  /**
   * Logout
   */
  async logout(): Promise<any> {
    return this.request('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  }

}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

