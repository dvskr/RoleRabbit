/**
 * API Service Layer
 * Handles communication with both Python and Fastify backends
 */

const PYTHON_API_BASE = 'http://localhost:8000';
const NODE_API_BASE = 'http://localhost:3001';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('roleready_token');
};

// Generic API call function
const apiCall = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Python Backend API calls (AI and Authentication)
export const pythonApi = {
  // Authentication
  login: (email: string, password: string) =>
    apiCall(`${PYTHON_API_BASE}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    apiCall(`${PYTHON_API_BASE}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  getCurrentUser: () =>
    apiCall(`${PYTHON_API_BASE}/api/auth/me`),

  // AI Services
  generateContent: (prompt: string, context?: any, model?: string) =>
    apiCall(`${PYTHON_API_BASE}/api/ai/generate`, {
      method: 'POST',
      body: JSON.stringify({ prompt, context, model }),
    }),

  analyzeResume: (resumeData: any, jobDescription?: string) =>
    apiCall(`${PYTHON_API_BASE}/api/ai/analyze-resume`, {
      method: 'POST',
      body: JSON.stringify({ resume_data: resumeData, job_description: jobDescription }),
    }),
};

// Fastify Backend API calls (User Data and Resume Management)
export const nodeApi = {
  // User Profile
  getUserProfile: () =>
    apiCall(`${NODE_API_BASE}/api/users/profile`),

  // Resume Management
  getResumes: () =>
    apiCall(`${NODE_API_BASE}/api/resumes`),

  saveResume: (resumeData: any) =>
    apiCall(`${NODE_API_BASE}/api/resumes`, {
      method: 'POST',
      body: JSON.stringify(resumeData),
    }),

  // Job Tracking
  getJobs: () =>
    apiCall(`${NODE_API_BASE}/api/jobs`),

  saveJob: (jobData: any) =>
    apiCall(`${NODE_API_BASE}/api/jobs`, {
      method: 'POST',
      body: JSON.stringify(jobData),
    }),

  // Cloud Storage
  saveToCloud: (resumeData: any, name: string) =>
    apiCall(`${NODE_API_BASE}/api/cloud/save`, {
      method: 'POST',
      body: JSON.stringify({ resumeData, name }),
    }),

  getCloudResumes: () =>
    apiCall(`${NODE_API_BASE}/api/cloud/list`),
};

// Health checks
export const healthChecks = {
  pythonApi: () => apiCall(`${PYTHON_API_BASE}/health`),
  nodeApi: () => apiCall(`${NODE_API_BASE}/health`),
};
