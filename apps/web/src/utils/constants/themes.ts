/**
 * Application Themes
 */

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const;

export type Theme = typeof THEMES[keyof typeof THEMES];

export const DEFAULT_THEME: Theme = THEMES.AUTO;

/**
 * Color palettes for different themes
 */
export const COLORS = {
  [THEMES.LIGHT]: {
    background: '#ffffff',
    foreground: '#111827',
    primary: '#2563eb',
    secondary: '#6b7280',
    accent: '#f59e0b',
    border: '#e5e7eb',
    card: '#ffffff',
    muted: '#f9fafb'
  },
  [THEMES.DARK]: {
    background: '#111827',
    foreground: '#f9fafb',
    primary: '#3b82f6',
    secondary: '#9ca3af',
    accent: '#fbbf24',
    border: '#374151',
    card: '#1f2937',
    muted: '#111827'
  }
};

