// Modal constants
export const MODAL_BACKDROP_STYLE = 'rgba(0, 0, 0, 0.5)';
export const MODAL_MAX_WIDTH = 'max-w-md';

// API endpoints
export const API_ENDPOINTS = {
  TWO_FA_SETUP: 'http://localhost:3001/api/auth/2fa/setup',
  TWO_FA_DISABLE: 'http://localhost:3001/api/auth/2fa/disable',
  TWO_FA_VERIFY: 'http://localhost:3001/api/auth/2fa/verify',
  TWO_FA_ENABLE: 'http://localhost:3001/api/auth/2fa/enable',
  TWO_FA_STATUS: 'http://localhost:3001/api/auth/2fa/status',
  PASSWORD_CHANGE: 'http://localhost:3001/api/auth/password',
  SESSIONS: 'http://localhost:3001/api/users/sessions',
} as const;

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
} as const;

// Default values
export const DEFAULT_PROFILE_VISIBILITY: 'public' | 'recruiters' | 'private' = 'public';
export const DEFAULT_SHOW_CONTACT_INFO = true;

// 2FA code length
export const TWO_FA_CODE_LENGTH = 6;

// Security header defaults
export const SECURITY_TITLE = 'Security Settings';
export const SECURITY_DESCRIPTION = 'Manage your account security and privacy settings';

// Password last changed (mock data)
export const PASSWORD_LAST_CHANGED = '3 months ago';

// Password requirements text
export const PASSWORD_REQUIREMENTS_TEXT = [
  'At least 8 characters',
  'Include uppercase and lowercase letters',
  'Include at least one number',
] as const;

