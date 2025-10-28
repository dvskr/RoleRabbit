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
   * Get all emails
   */
  async getEmails(jobId?: string): Promise<any> {
    const url = jobId ? `/api/emails?jobId=${jobId}` : '/api/emails';
    return this.request(url, {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Get a specific email
   */
  async getEmail(id: string): Promise<any> {
    return this.request(`/api/emails/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Save/create an email
   */
  async saveEmail(emailData: any): Promise<any> {
    return this.request('/api/emails', {
      method: 'POST',
      body: JSON.stringify(emailData),
      credentials: 'include',
    });
  }

  /**
   * Update an email
   */
  async updateEmail(id: string, emailData: any): Promise<any> {
    return this.request(`/api/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify(emailData),
      credentials: 'include',
    });
  }

  /**
   * Delete an email
   */
  async deleteEmail(id: string): Promise<any> {
    return this.request(`/api/emails/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

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

  // ===== COVER LETTER ENDPOINTS =====

  /**
   * Get all cover letters
   */
  async getCoverLetters(jobId?: string): Promise<any> {
    const url = jobId ? `/api/cover-letters?jobId=${jobId}` : '/api/cover-letters';
    return this.request(url, {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Get a specific cover letter
   */
  async getCoverLetter(id: string): Promise<any> {
    return this.request(`/api/cover-letters/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Save/create a cover letter
   */
  async saveCoverLetter(coverLetterData: any): Promise<any> {
    return this.request('/api/cover-letters', {
      method: 'POST',
      body: JSON.stringify(coverLetterData),
      credentials: 'include',
    });
  }

  /**
   * Update a cover letter
   */
  async updateCoverLetter(id: string, coverLetterData: any): Promise<any> {
    return this.request(`/api/cover-letters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(coverLetterData),
      credentials: 'include',
    });
  }

  /**
   * Delete a cover letter
   */
  async deleteCoverLetter(id: string): Promise<any> {
    return this.request(`/api/cover-letters/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

  // ===== PORTFOLIO ENDPOINTS =====

  /**
   * Get all portfolios
   */
  async getPortfolios(): Promise<any> {
    return this.request('/api/portfolios', {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Get a specific portfolio
   */
  async getPortfolio(id: string): Promise<any> {
    return this.request(`/api/portfolios/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
  }

  /**
   * Save/create a portfolio
   */
  async savePortfolio(portfolioData: any): Promise<any> {
    return this.request('/api/portfolios', {
      method: 'POST',
      body: JSON.stringify(portfolioData),
      credentials: 'include',
    });
  }

  /**
   * Update a portfolio
   */
  async updatePortfolio(id: string, portfolioData: any): Promise<any> {
    return this.request(`/api/portfolios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(portfolioData),
      credentials: 'include',
    });
  }

  /**
   * Delete a portfolio
   */
  async deletePortfolio(id: string): Promise<any> {
    return this.request(`/api/portfolios/${id}`, {
      method: 'DELETE',
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

  // ===== AI AGENTS ENDPOINTS =====

  /**
   * Get all AI agents
   */
  async getAgents(): Promise<any> {
    return this.request('/api/agents');
  }

  /**
   * Get agent stats
   */
  async getAgentStats(): Promise<any> {
    return this.request('/api/agents/stats');
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId: string): Promise<any> {
    return this.request(`/api/agents/${agentId}`);
  }

  /**
   * Create a new AI agent
   */
  async createAgent(agentData: any): Promise<any> {
    return this.request('/api/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  }

  /**
   * Update an AI agent
   */
  async updateAgent(agentId: string, updates: any): Promise<any> {
    return this.request(`/api/agents/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete an AI agent
   */
  async deleteAgent(agentId: string): Promise<any> {
    return this.request(`/api/agents/${agentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get agent tasks
   */
  async getAgentTasks(agentId: string): Promise<any> {
    return this.request(`/api/agents/${agentId}/tasks`);
  }

  /**
   * Create an agent task
   */
  async createAgentTask(agentId: string, taskData: any): Promise<any> {
    return this.request(`/api/agents/${agentId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  /**
   * Update an agent task
   */
  async updateAgentTask(taskId: string, updates: any): Promise<any> {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

