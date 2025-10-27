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
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
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

  // ===== RESUME ENDPOINTS =====

  /**
   * Get all resumes
   */
  async getResumes(): Promise<any> {
    return this.request('/api/resumes', {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Get a specific resume
   */
  async getResume(id: string): Promise<any> {
    return this.request(`/api/resumes/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Save/create a resume
   */
  async saveResume(resumeData: any): Promise<any> {
    return this.request('/api/resumes', {
      method: 'POST',
      body: JSON.stringify(resumeData),
      credentials: 'include',
    });
  }

  /**
   * Update a resume
   */
  async updateResume(id: string, resumeData: any): Promise<any> {
    return this.request(`/api/resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resumeData),
      credentials: 'include',
    });
  }

  /**
   * Delete a resume
   */
  async deleteResume(id: string): Promise<any> {
    return this.request(`/api/resumes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

  // ===== JOB ENDPOINTS =====

  /**
   * Get all jobs
   */
  async getJobs(): Promise<any> {
    return this.request('/api/jobs', {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Get a specific job
   */
  async getJob(id: string): Promise<any> {
    return this.request(`/api/jobs/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Save/create a job
   */
  async saveJob(jobData: any): Promise<any> {
    return this.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
      credentials: 'include',
    });
  }

  /**
   * Update a job
   */
  async updateJob(id: string, jobData: any): Promise<any> {
    return this.request(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
      credentials: 'include',
    });
  }

  /**
   * Delete a job
   */
  async deleteJob(id: string): Promise<any> {
    return this.request(`/api/jobs/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

  // ===== CLOUD STORAGE ENDPOINTS =====

  /**
   * Save resume to cloud
   */
  async saveToCloud(resumeData: any, name: string): Promise<any> {
    return this.request('/api/cloud/save', {
      method: 'POST',
      body: JSON.stringify({ resumeData, name }),
      credentials: 'include',
    });
  }

  /**
   * List all cloud resumes
   */
  async listCloudResumes(): Promise<any> {
    return this.request('/api/cloud/list', {
      method: 'GET',
      credentials: 'include',
    });
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

  // ===== EMAIL ENDPOINTS =====

  /**
   * Send email
   */
  async sendEmail(emailData: any): Promise<any> {
    return this.request('/api/email/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
      credentials: 'include',
    });
  }

  /**
   * Get email campaigns
   */
  async getCampaigns(): Promise<any> {
    return this.request('/api/email/campaigns', {
      method: 'GET',
      credentials: 'include',
    });
  }

  // ===== AI ENDPOINTS =====

  /**
   * Generate AI content
   */
  async generateAIContent(prompt: string, context?: any): Promise<any> {
    return this.request('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
      credentials: 'include',
    });
  }

  /**
   * Check ATS score
   */
  async checkATSScore(resume: string, jobDescription: string): Promise<any> {
    return this.request('/api/ai/ats-check', {
      method: 'POST',
      body: JSON.stringify({ resume, jobDescription }),
      credentials: 'include',
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

