/**
 * Application Routes
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LANDING: '/landing',
  LOGIN: '/login',
  SIGNUP: '/signup',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Features
  PROFILE: '/profile',
  RESUME_EDITOR: '/resume-editor',
  JOBS: '/jobs',
  EMAILS: '/emails',
  COVER_LETTERS: '/cover-letters',
  PORTFOLIO: '/portfolio',
  STORAGE: '/storage',
  DISCUSSION: '/discussion',
  SETTINGS: '/settings',
  
  // AI Features
  AI_AGENTS: '/ai-agents',
  AI_CHAT: '/ai-chat',
  
  // Resources
  COURSES: '/courses',
  TEMPLATES: '/templates',
  
  // Help
  HELP: '/help',
  CONTACT: '/contact',
  ABOUT: '/about',
  PRIVACY: '/privacy',
  TERMS: '/terms'
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];
