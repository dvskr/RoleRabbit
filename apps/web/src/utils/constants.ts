/**
 * Application constants
 */

export const APP_NAME = 'RoleReady';
export const APP_VERSION = '1.0.0';

// API URLs
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  RESUMES: '/resumes',
  JOBS: '/jobs',
  EMAIL: '/email',
  PORTFOLIO: '/portfolio',
  COMMUNITY: '/community',
  SETTINGS: '/settings',
  LOGIN: '/login',
  SIGNUP: '/signup',
  LANDING: '/landing'
} as const;

// Job Statuses
export const JOB_STATUSES = {
  NEW: 'new',
  APPLIED: 'applied',
  SCREENING: 'screening',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  REJECTED: 'rejected'
} as const;

// Resume Templates
export const RESUME_TEMPLATES = {
  MODERN: 'modern',
  CLASSIC: 'classic',
  CREATIVE: 'creative',
  PROFESSIONAL: 'professional'
} as const;

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

