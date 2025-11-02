/**
 * Dashboard constants and default configuration values
 */

export const DEFAULT_TAB = 'dashboard' as const;
export const DEFAULT_TEMPLATE_ID = 'ats-classic' as const;
export const DEFAULT_ADDED_TEMPLATES = ['ats-classic', 'ats-modern'] as const;

export type DashboardTab = 
  | 'dashboard'
  | 'profile'
  | 'storage'
  | 'editor'
  | 'templates'
  | 'jobs'
  | 'tracker'  // Alias for jobs (legacy support)
  | 'email'
  | 'discussion'
  | 'cover-letter'
  | 'portfolio'
  | 'ai-agents'
  | 'agents';  // Alias for ai-agents (legacy support)

export const DASHBOARD_TABS: DashboardTab[] = [
  'dashboard',
  'profile',
  'storage',
  'editor',
  'templates',
  'jobs',
  'email',
  'discussion',
  'cover-letter',
  'portfolio',
  'ai-agents',
];

export const DEFAULT_SIDEBAR_STATE = false;
export const DEFAULT_PANEL_STATE = false;
export const DEFAULT_PREVIEW_MODE = false;

