/**
 * Centralized API Service
 * Connects frontend to backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

import { logger } from '../utils/logger';
import { retryWithBackoff, isOnline, waitForOnline } from '../utils/retryHandler';
import type { Job } from '../types/job';
import type { CoverLetterDraft } from '../components/coverletter/types/coverletter';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private resolveUrl(endpoint: string): string {
    if (!endpoint) {
      return this.baseUrl;
    }
    const trimmed = endpoint.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('/api/proxy/')) {
      return trimmed;
    }
    return `${this.baseUrl}${trimmed}`;
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
   * Generic fetch wrapper with error handling and retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0,
    skipRetry = false
  ): Promise<T> {
    // If retry is skipped (e.g., token refresh), use direct request
    if (skipRetry) {
      return this.directRequest<T>(endpoint, options, retryCount);
    }

    // Use retry handler with exponential backoff
    const result = await retryWithBackoff(
      () => this.directRequest<T>(endpoint, options, 0),
      {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
        retryableErrors: ['NetworkError', 'Failed to fetch', 'timeout'],
      }
    );

    if (result.success && result.data !== undefined) {
      return result.data;
    }

    // If retry failed and we're offline, wait for online status
    if (!isOnline()) {
      logger.info('Device is offline, waiting for connection...');
      const cameOnline = await waitForOnline(5000);
      if (cameOnline) {
        // Try once more after coming online
        return this.directRequest<T>(endpoint, options, 0);
      }
    }

    throw result.error || new Error('Request failed after retries');
  }

  /**
   * Direct request without retry (used internally)
   */
  private async directRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    try {
      const headers: HeadersInit = {
        ...options.headers,
      };
      
      // Only add Content-Type header if there's a body
      if (options.body && typeof options.body === 'string') {
        headers['Content-Type'] = 'application/json';
      }
      
      // httpOnly cookie is automatically sent by browser
      // No need to manually add Authorization header

      const url = this.resolveUrl(endpoint);
      const response = await fetch(url, {
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

          // If refresh successful, retry original request (skip retry wrapper to avoid double retry)
          if (refreshResponse.ok) {
            return this.directRequest<T>(endpoint, options, retryCount + 1);
          }
        } catch (refreshError) {
          logger.error('Token refresh failed:', refreshError);
          // Token refresh failed, let it fall through to error handling
        }
      }

      if (!response.ok) {
        // Try to get error details from response
        const statusCode = typeof response.status === 'number' ? response.status : 500;
        const statusText = (response.statusText && typeof response.statusText === 'string') ? response.statusText : 'Unknown error';
        let errorMessage: string = `API error (${statusCode}): ${statusText}`;
        let errorDetails: any = undefined;
        
        try {
          // Try to read response body for error details
          let text = '';
          try {
            // Try cloning first (works for most responses)
            const clonedResponse = response.clone();
            text = await clonedResponse.text();
          } catch (cloneError) {
            // If cloning fails, try reading directly (will consume response)
            try {
              text = await response.text();
            } catch (textError) {
              // If we can't read text, use default message
              text = '';
            }
          }
          
          if (text && typeof text === 'string' && text.trim()) {
            try {
              const errorData = JSON.parse(text);
              const parsedMessage = errorData.error || errorData.message;
              if (parsedMessage && typeof parsedMessage === 'string') {
                errorMessage = parsedMessage;
              } else if (parsedMessage && typeof parsedMessage === 'object') {
                try {
                  const jsonStr = JSON.stringify(parsedMessage);
                  errorMessage = `API error (${statusCode}): ${jsonStr.substring(0, 100)}`;
                } catch (stringifyError) {
                  errorMessage = `API error (${statusCode}): Invalid error format`;
                }
              }
              if (errorData.details) {
                errorDetails = errorData.details;
                if (typeof errorData.details === 'string' && errorMessage && !errorMessage.includes(errorData.details)) {
                  errorMessage += ` - ${errorData.details}`;
                }
              }
            } catch (jsonError) {
              // If not JSON, use the text as error message if it's meaningful
              if (text.length < 500 && text.trim()) {
                errorMessage = `API error (${statusCode}): ${text.substring(0, 200).trim()}`;
              }
            }
          }
        } catch (readError: any) {
          // If we can't read response, use status-based message
          const errorMsg = (readError?.message && typeof readError.message === 'string') 
            ? readError.message 
            : 'Could not read error response';
          errorMessage = `API request failed with status ${statusCode}: ${statusText}. ${errorMsg}`;
        }

        // Final safety check: Ensure errorMessage is always a valid string
        if (!errorMessage || typeof errorMessage !== 'string') {
          errorMessage = `An unexpected error occurred (HTTP ${statusCode})`;
        }
        
        // Ensure errorMessage is not empty and is a valid string
        if (typeof errorMessage !== 'string' || errorMessage.trim() === '') {
          errorMessage = `An unexpected error occurred (HTTP ${statusCode})`;
        }

        // Create error object with guaranteed valid error message
        // Use try-catch as final safety net
        let finalErrorMessage: string;
        try {
          finalErrorMessage = String(errorMessage);
          if (!finalErrorMessage || finalErrorMessage.trim() === '') {
            finalErrorMessage = `An unexpected error occurred (HTTP ${statusCode})`;
          }
        } catch (stringError) {
          finalErrorMessage = `An unexpected error occurred (HTTP ${statusCode})`;
        }

        // Provide explicit guidance for authentication failures
        if (statusCode === 401) {
          finalErrorMessage = 'Your session has expired. Please log in again to continue editing.';
        }

        try {
          const errorObj: any = new Error(finalErrorMessage);
          errorObj.statusCode = statusCode;
          errorObj.originalResponse = statusText;
          if (statusCode === 401) {
            errorObj.code = 'AUTH_REQUIRED';
          }
          if (errorDetails !== undefined) {
            errorObj.details = errorDetails;
          }
          throw errorObj;
        } catch (errorCreationError) {
          // If Error constructor fails, create a plain object
          const fallbackError: any = {
            message: finalErrorMessage,
            statusCode: statusCode,
            originalResponse: statusText,
            name: 'APIError'
          };
          if (statusCode === 401) {
            fallbackError.code = 'AUTH_REQUIRED';
          }
          if (errorDetails !== undefined) {
            fallbackError.details = errorDetails;
          }
          throw fallbackError;
        }
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        try {
          return await response.json();
        } catch (parseError) {
          logger.warn('Response JSON parse failed, returning empty object', parseError);
          return {} as T;
        }
      }

      if (response.status === 204 || response.status === 205) {
        return undefined as T;
      }

      const textResponse = await response.text();
      if (!textResponse) {
        return undefined as T;
      }
      return (textResponse as unknown) as T;
    } catch (error: any) {
      logger.error('API request failed:', error);
      
      // Provide more helpful error messages for common issues
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        const friendlyError: any = new Error('Unable to connect to the server. Please check your internet connection and ensure the API server is running.');
        friendlyError.statusCode = 0;
        friendlyError.originalError = error;
        throw friendlyError;
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
  async uploadProfilePicture(file: File | Blob): Promise<any> {
    const formData = new FormData();
    // Ensure we have a File object (Blob might need conversion)
    const fileToUpload = file instanceof File ? file : new File([file], 'profile.jpg', { type: 'image/jpeg' });
    formData.append('file', fileToUpload);
    
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

  /**
   * Delete profile picture
   */
  async deleteProfilePicture(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/users/profile/picture`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete profile picture');
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

  // ===== STORAGE ENDPOINTS =====

  /**
   * Upload storage file
   */
  async uploadStorageFile(formData: FormData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/storage/files/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to upload file');
    }

    return await response.json();
  }

  /**
   * Get cloud storage files
   */
  async getCloudFiles(folderId?: string, includeDeleted?: boolean): Promise<any> {
    const params = new URLSearchParams();
    if (folderId) params.append('folderId', folderId);
    if (includeDeleted) params.append('includeDeleted', 'true');
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/storage/files?${queryString}` : '/api/storage/files';
    
    return this.request(endpoint, {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Download cloud file
   */
  async downloadCloudFile(fileId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/storage/files/${fileId}/download`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to download file');
    }

    return await response.blob();
  }

  /**
   * Update cloud file
   */
  async updateCloudFile(fileId: string, updates: any): Promise<any> {
    return this.request(`/api/storage/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      credentials: 'include',
    });
  }

  /**
   * Delete cloud file (soft delete)
   */
  async deleteCloudFile(fileId: string): Promise<any> {
    return this.request(`/api/storage/files/${fileId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

  /**
   * Move cloud file to folder
   */
  async moveCloudFile(fileId: string, folderId: string | null): Promise<any> {
    return this.request(`/api/storage/files/${fileId}/move`, {
      method: 'POST',
      body: JSON.stringify({ folderId }),
      credentials: 'include',
    });
  }

  /**
   * Restore cloud file from trash
   */
  async restoreCloudFile(fileId: string): Promise<any> {
    return this.request(`/api/storage/files/${fileId}/restore`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  /**
   * Permanently delete cloud file
   */
  async permanentlyDeleteCloudFile(fileId: string): Promise<any> {
    return this.request(`/api/storage/files/${fileId}/permanent`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

  /**
   * Get storage folders
   */
  async getFolders(): Promise<any> {
    return this.request('/api/storage/folders', {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Create folder
   */
  async createFolder(data: { name: string; color?: string; parentId?: string }): Promise<any> {
    return this.request('/api/storage/folders', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  }

  /**
   * Update folder
   */
  async updateFolder(folderId: string, updates: { name?: string; color?: string }): Promise<any> {
    return this.request(`/api/storage/folders/${folderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      credentials: 'include',
    });
  }

  /**
   * Delete folder
   */
  async deleteFolder(folderId: string): Promise<any> {
    return this.request(`/api/storage/folders/${folderId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

  /**
   * Get shared file by token
   */
  async getSharedFile(token: string, password?: string): Promise<any> {
    const endpoint = password 
      ? `/api/storage/shared/${token}?password=${encodeURIComponent(password)}`
      : `/api/storage/shared/${token}`;
    
    return this.request(endpoint, {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Download shared file
   */
  async downloadSharedFile(token: string, password?: string): Promise<Blob> {
    const endpoint = password
      ? `/api/storage/shared/${token}/download?password=${encodeURIComponent(password)}`
      : `/api/storage/shared/${token}/download`;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to download file');
    }

    return await response.blob();
  }

  /**
   * Share file with user
   */
  async shareFile(fileId: string, data: {
    userEmail: string;
    permission: string;
    expiresAt?: string;
    maxDownloads?: number;
  }): Promise<any> {
    return this.request(`/api/storage/files/${fileId}/share`, {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  }

  /**
   * Delete file share
   */
  async deleteFileShare(shareId: string): Promise<any> {
    return this.request(`/api/storage/shares/${shareId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

  /**
   * Update file share permission
   */
  async updateFileShare(shareId: string, updates: { permission: string }): Promise<any> {
    return this.request(`/api/storage/shares/${shareId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      credentials: 'include',
    });
  }

  /**
   * Create share link
   */
  async createShareLink(fileId: string, options?: {
    password?: string;
    expiresAt?: string;
    maxDownloads?: number;
  }): Promise<any> {
    return this.request(`/api/storage/files/${fileId}/share-link`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
      credentials: 'include',
    });
  }

  /**
   * Get file comments
   */
  async getFileComments(fileId: string): Promise<any> {
    return this.request(`/api/storage/files/${fileId}/comments`, {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Add file comment
   */
  async addFileComment(fileId: string, data: {
    content: string;
    parentId?: string;
  }): Promise<any> {
    return this.request(`/api/storage/files/${fileId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  }

  /**
   * Get credentials
   */
  async getCredentials(): Promise<any> {
    return this.request('/api/storage/credentials', {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Get expiring credentials
   */
  async getExpiringCredentials(days: number): Promise<any> {
    return this.request(`/api/storage/credentials/expiring?days=${days}`, {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Create credential
   */
  async createCredential(credential: any): Promise<any> {
    return this.request('/api/storage/credentials', {
      method: 'POST',
      body: JSON.stringify(credential),
      credentials: 'include',
    });
  }

  /**
   * Update credential
   */
  async updateCredential(id: string, updates: any): Promise<any> {
    return this.request(`/api/storage/credentials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      credentials: 'include',
    });
  }

  /**
   * Delete credential
   */
  async deleteCredential(id: string): Promise<any> {
    return this.request(`/api/storage/credentials/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

  /**
   * Generate credential QR code
   */
  async generateCredentialQRCode(id: string): Promise<any> {
    return this.request(`/api/storage/credentials/${id}/qr-code`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  /**
   * Get storage quota
   */
  async getStorageQuota(): Promise<any> {
    return this.request('/api/storage/quota', {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<any> {
    return this.request('/api/storage/stats', {
      method: 'GET',
      credentials: 'include',
    });
  }

  // ===== RESUME ENDPOINTS =====

  async getBaseResumes(): Promise<any> {
    return this.request('/api/base-resumes', {
      method: 'GET',
      credentials: 'include',
    });
  }

  async getBaseResume(id: string): Promise<any> {
    return this.request(`/api/base-resumes/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
  }

  async createBaseResume(payload: { name?: string; data?: any; formatting?: any; metadata?: any }): Promise<any> {
    return this.request('/api/base-resumes', {
      method: 'POST',
      body: JSON.stringify(payload),
      credentials: 'include',
    });
  }

  async activateBaseResume(id: string): Promise<any> {
    return this.request(`/api/base-resumes/${id}/activate`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  async deleteBaseResume(id: string): Promise<any> {
    return this.request(`/api/base-resumes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

  async updateBaseResume(id: string, payload: { name?: string; data?: any; metadata?: any; formatting?: any; lastKnownServerUpdatedAt?: string }): Promise<any> {
    return this.request(`/api/base-resumes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      credentials: 'include'
    });
  }

  async generateEditorAIContent(payload: {
    resumeId: string;
    sectionPath: string;
    sectionType: string;
    currentContent?: any;
    jobContext?: any;
    tone?: string;
    length?: string;
    instructions?: string;
  }): Promise<any> {
    return this.request('/api/proxy/editor/ai/generate-content', {
      method: 'POST',
      body: JSON.stringify(payload),
      credentials: 'include'
    });
  }

  async applyAIDraft(draftId: string): Promise<any> {
    return this.request('/api/proxy/editor/ai/apply-draft', {
      method: 'POST',
      body: JSON.stringify({ draftId }),
      credentials: 'include'
    });
  }

  async runATSCheck(payload: { resumeId: string; jobDescription: string }): Promise<any> {
    return this.request('/api/proxy/editor/ai/ats-check', {
      method: 'POST',
      body: JSON.stringify(payload),
      credentials: 'include'
    });
  }

  async tailorResume(payload: {
    resumeId: string;
    jobDescription: string;
    mode?: 'PARTIAL' | 'FULL';
    tone?: string;
    length?: string;
  }): Promise<any> {
    return this.request('/api/proxy/editor/ai/tailor', {
      method: 'POST',
      body: JSON.stringify(payload),
      credentials: 'include'
    });
  }

  async applyAIRecommendations(payload: {
    resumeId: string;
    jobDescription: string;
    focusAreas?: string[];
    tone?: string;
  }): Promise<any> {
    return this.request('/api/proxy/editor/ai/apply-recommendations', {
      method: 'POST',
      body: JSON.stringify(payload),
      credentials: 'include'
    });
  }

  async generateCoverLetter(payload: {
    resumeId: string;
    jobTitle?: string;
    company?: string;
    jobDescription: string;
    tone?: string;
  }): Promise<any> {
    return this.request('/api/proxy/editor/ai/cover-letter', {
      method: 'POST',
      body: JSON.stringify(payload),
      credentials: 'include'
    });
  }

  async generatePortfolio(payload: { resumeId: string; tone?: string }): Promise<any> {
    return this.request('/api/proxy/editor/ai/portfolio', {
      method: 'POST',
      body: JSON.stringify(payload),
      credentials: 'include'
    });
  }

  /**
   * Parse resume file (PDF/DOC/DOCX) on the server
   */
  async parseResumeFile(file: File | Blob): Promise<any> {
    const formData = new FormData();
    const fileToUpload = file instanceof File ? file : new File([file], 'resume-upload');
    formData.append('file', fileToUpload);

    const response = await fetch(`${this.baseUrl}/api/resumes/parse`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      let message = 'Failed to parse resume';
      try {
        const err = await response.json();
        message = err?.error || err?.message || message;
      } catch (_) {
        // ignore
      }
      throw new Error(message);
    }
    return await response.json();
  }

  /**
   * Update base resume (replace data when re-importing)
   */
  async updateBaseResume(id: string, payload: { name?: string; data?: any; metadata?: any; formatting?: any; lastKnownServerUpdatedAt?: string }): Promise<any> {
    return this.request(`/api/base-resumes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      credentials: 'include'
    });
  }

  async getResumes(): Promise<any> {
    return this.getBaseResumes();
  }

  async createResume(data: {
    fileName: string;
    templateId?: string;
    data: any;
  }): Promise<any> {
    return this.createBaseResume({ name: data.fileName, data: data.data });
  }

  async updateResume(id: string, data: {
    fileName?: string;
    templateId?: string;
    data?: any;
    lastKnownServerUpdatedAt?: string;
  }): Promise<any> {
    return this.request(`/api/resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  }

  async deleteResume(id: string): Promise<any> {
    return this.deleteBaseResume(id);
  }

  /**
   * Duplicate/Copy a resume
   */
  async duplicateResume(id: string, fileName?: string): Promise<any> {
    return this.request(`/api/resumes/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ fileName }),
      credentials: 'include',
    });
  }

  // ===== JOBS ENDPOINTS =====

  /**
   * Fetch all jobs for the authenticated user
   */
  async getJobs(): Promise<any> {
    return this.request('/api/jobs', {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Create a new job entry
   */
  async saveJob(job: Omit<Job, 'id'>): Promise<any> {
    return this.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
      credentials: 'include',
    });
  }

  /**
   * Update an existing job
   */
  async updateJob(id: string, updates: Partial<Job>): Promise<any> {
    return this.request(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      credentials: 'include',
    });
  }

  /**
   * Permanently delete a job entry
   */
  async deleteJob(id: string): Promise<any> {
    return this.request(`/api/jobs/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

  // ===== COVER LETTER ENDPOINTS =====

  /**
   * Fetch cover letters for the authenticated user
   */
  async getCoverLetters(): Promise<any> {
    return this.request('/api/cover-letters', {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Create/save a new cover letter draft
   */
  async saveCoverLetter(data: Partial<CoverLetterDraft>): Promise<any> {
    return this.request('/api/cover-letters', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  }

  /**
   * Update an existing cover letter draft
   */
  async updateCoverLetter(id: string, updates: Partial<CoverLetterDraft>): Promise<any> {
    return this.request(`/api/cover-letters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      credentials: 'include',
    });
  }

}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

