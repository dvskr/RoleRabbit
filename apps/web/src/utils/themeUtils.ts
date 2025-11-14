/**
 * Theme Utilities - Decoupled Theme Access
 *
 * Provides theme colors in a way that works with or without React context.
 * Enables template components to work in:
 * - React components (with context)
 * - Email templates (no context)
 * - PDF generation (no context)
 * - Server-side rendering
 * - Standalone usage
 *
 * Architecture:
 * 1. Try React context first (if available)
 * 2. Fall back to CSS variables (if in browser)
 * 3. Fall back to default theme (for SSR/non-browser)
 */

import type { ThemeColors } from '../contexts/ThemeContext';

/**
 * Default theme colors (light mode)
 * Used as fallback when context and CSS variables unavailable
 */
export const DEFAULT_THEME_COLORS: ThemeColors = {
  // Backgrounds
  background: '#ffffff',
  cardBackground: '#ffffff',
  hoverBackground: '#f3f4f6',
  activeBackground: '#e5e7eb',

  // Text
  primaryText: '#111827',
  secondaryText: '#6b7280',
  tertiaryText: '#9ca3af',
  placeholderText: '#d1d5db',

  // Borders
  border: '#e5e7eb',
  focusBorder: '#3b82f6',

  // Primary Colors
  primaryBlue: '#3b82f6',
  primaryBlueHover: '#2563eb',

  // Status Colors
  successGreen: '#10b981',
  errorRed: '#ef4444',
  warningYellow: '#f59e0b',
  infoBlue: '#06b6d4',

  // Badge Colors
  badgeSuccessBg: '#d1fae5',
  badgeSuccessText: '#065f46',
  badgeSuccessBorder: '#6ee7b7',

  badgeErrorBg: '#fee2e2',
  badgeErrorText: '#991b1b',
  badgeErrorBorder: '#fca5a5',

  badgeWarningBg: '#fef3c7',
  badgeWarningText: '#92400e',
  badgeWarningBorder: '#fcd34d',

  badgeInfoBg: '#dbeafe',
  badgeInfoText: '#1e40af',
  badgeInfoBorder: '#93c5fd',

  // Modal & Overlay
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  modalBackground: '#ffffff',

  // Additional Colors
  linkColor: '#3b82f6',
  linkHoverColor: '#2563eb',
  disabledBackground: '#f3f4f6',
  disabledText: '#9ca3af',
  shadowColor: 'rgba(0, 0, 0, 0.1)',

  // Specific UI Elements
  sidebarBackground: '#f9fafb',
  sidebarHoverBackground: '#f3f4f6',
  headerBackground: '#ffffff',
  footerBackground: '#f9fafb',

  // Charts & Data Visualization
  chartPrimary: '#3b82f6',
  chartSecondary: '#8b5cf6',
  chartTertiary: '#ec4899',
  chartQuaternary: '#f59e0b',

  // Premium/Special
  premiumGold: '#f59e0b',
  premiumGoldHover: '#d97706',
};

/**
 * CSS variable names mapping to ThemeColors keys
 * Update these if CSS variable names change
 */
const CSS_VAR_MAP: Record<keyof ThemeColors, string> = {
  background: '--color-background',
  cardBackground: '--color-card-background',
  hoverBackground: '--color-hover-background',
  activeBackground: '--color-active-background',

  primaryText: '--color-text-primary',
  secondaryText: '--color-text-secondary',
  tertiaryText: '--color-text-tertiary',
  placeholderText: '--color-text-placeholder',

  border: '--color-border',
  focusBorder: '--color-border-focus',

  primaryBlue: '--color-primary-blue',
  primaryBlueHover: '--color-primary-blue-hover',

  successGreen: '--color-success',
  errorRed: '--color-error',
  warningYellow: '--color-warning',
  infoBlue: '--color-info',

  badgeSuccessBg: '--color-badge-success-bg',
  badgeSuccessText: '--color-badge-success-text',
  badgeSuccessBorder: '--color-badge-success-border',

  badgeErrorBg: '--color-badge-error-bg',
  badgeErrorText: '--color-badge-error-text',
  badgeErrorBorder: '--color-badge-error-border',

  badgeWarningBg: '--color-badge-warning-bg',
  badgeWarningText: '--color-badge-warning-text',
  badgeWarningBorder: '--color-badge-warning-border',

  badgeInfoBg: '--color-badge-info-bg',
  badgeInfoText: '--color-badge-info-text',
  badgeInfoBorder: '--color-badge-info-border',

  modalOverlay: '--color-modal-overlay',
  modalBackground: '--color-modal-background',

  linkColor: '--color-link',
  linkHoverColor: '--color-link-hover',
  disabledBackground: '--color-disabled-background',
  disabledText: '--color-disabled-text',
  shadowColor: '--color-shadow',

  sidebarBackground: '--color-sidebar-background',
  sidebarHoverBackground: '--color-sidebar-hover-background',
  headerBackground: '--color-header-background',
  footerBackground: '--color-footer-background',

  chartPrimary: '--color-chart-primary',
  chartSecondary: '--color-chart-secondary',
  chartTertiary: '--color-chart-tertiary',
  chartQuaternary: '--color-chart-quaternary',

  premiumGold: '--color-premium-gold',
  premiumGoldHover: '--color-premium-gold-hover',
};

/**
 * Get theme colors from CSS variables (browser only)
 * Returns null if not in browser or CSS vars not set
 */
export function getColorsFromCSSVariables(): ThemeColors | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  try {
    const styles = getComputedStyle(document.documentElement);
    const colors: Partial<ThemeColors> = {};

    // Try to read each CSS variable
    for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
      const value = styles.getPropertyValue(cssVar).trim();
      if (value) {
        colors[key as keyof ThemeColors] = value;
      }
    }

    // Only return if we got at least some colors
    return Object.keys(colors).length > 10 ? (colors as ThemeColors) : null;
  } catch (error) {
    console.warn('Failed to read CSS variables:', error);
    return null;
  }
}

/**
 * Get theme colors with fallback chain:
 * 1. Provided colors (explicit prop)
 * 2. CSS variables (browser with :root vars)
 * 3. Default theme (fallback)
 *
 * This allows components to work in any environment
 */
export function getThemeColors(providedColors?: ThemeColors | null): ThemeColors {
  // 1. Use provided colors if available
  if (providedColors) {
    return providedColors;
  }

  // 2. Try CSS variables (browser only)
  const cssColors = getColorsFromCSSVariables();
  if (cssColors) {
    return cssColors;
  }

  // 3. Fall back to default theme
  return DEFAULT_THEME_COLORS;
}

/**
 * Generate inline styles from theme colors
 * Useful for email templates and PDFs where CSS variables don't work
 */
export function generateInlineStyles(colors: ThemeColors): Record<string, React.CSSProperties> {
  return {
    card: {
      background: colors.cardBackground,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
    },
    primaryText: {
      color: colors.primaryText,
    },
    secondaryText: {
      color: colors.secondaryText,
    },
    primaryButton: {
      background: colors.primaryBlue,
      color: '#ffffff',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    successBadge: {
      background: colors.badgeSuccessBg,
      color: colors.badgeSuccessText,
      border: `1px solid ${colors.badgeSuccessBorder}`,
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
    },
    errorBadge: {
      background: colors.badgeErrorBg,
      color: colors.badgeErrorText,
      border: `1px solid ${colors.badgeErrorBorder}`,
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
    },
    warningBadge: {
      background: colors.badgeWarningBg,
      color: colors.badgeWarningText,
      border: `1px solid ${colors.badgeWarningBorder}`,
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
    },
    infoBadge: {
      background: colors.badgeInfoBg,
      color: colors.badgeInfoText,
      border: `1px solid ${colors.badgeInfoBorder}`,
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
    },
  };
}

/**
 * Convert ThemeColors to CSS variable declarations
 * Useful for dynamically setting theme via JavaScript
 */
export function themeToCSSVariables(colors: ThemeColors): string {
  return Object.entries(CSS_VAR_MAP)
    .map(([key, cssVar]) => {
      const value = colors[key as keyof ThemeColors];
      return `${cssVar}: ${value};`;
    })
    .join('\n');
}

/**
 * Apply theme colors to document root
 * Sets CSS variables on :root element
 */
export function applyThemeToRoot(colors: ThemeColors): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
    const value = colors[key as keyof ThemeColors];
    root.style.setProperty(cssVar, value);
  }
}

/**
 * Check if we're in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Generate CSS string for email templates
 * Returns complete CSS that can be inlined in <style> tags
 */
export function generateEmailCSS(colors: ThemeColors): string {
  return `
    /* Reset */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    /* Base */
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: ${colors.background};
      color: ${colors.primaryText};
      line-height: 1.6;
    }

    /* Card */
    .card {
      background: ${colors.cardBackground};
      border: 1px solid ${colors.border};
      border-radius: 12px;
      padding: 16px;
    }

    /* Text */
    .text-primary { color: ${colors.primaryText}; }
    .text-secondary { color: ${colors.secondaryText}; }
    .text-tertiary { color: ${colors.tertiaryText}; }

    /* Buttons */
    .btn-primary {
      background: ${colors.primaryBlue};
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }
    .btn-primary:hover {
      background: ${colors.primaryBlueHover};
    }

    /* Badges */
    .badge-success {
      background: ${colors.badgeSuccessBg};
      color: ${colors.badgeSuccessText};
      border: 1px solid ${colors.badgeSuccessBorder};
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      display: inline-block;
    }
    .badge-error {
      background: ${colors.badgeErrorBg};
      color: ${colors.badgeErrorText};
      border: 1px solid ${colors.badgeErrorBorder};
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      display: inline-block;
    }
    .badge-warning {
      background: ${colors.badgeWarningBg};
      color: ${colors.badgeWarningText};
      border: 1px solid ${colors.badgeWarningBorder};
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      display: inline-block;
    }
    .badge-info {
      background: ${colors.badgeInfoBg};
      color: ${colors.badgeInfoText};
      border: 1px solid ${colors.badgeInfoBorder};
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      display: inline-block;
    }

    /* Links */
    a {
      color: ${colors.linkColor};
      text-decoration: none;
    }
    a:hover {
      color: ${colors.linkHoverColor};
      text-decoration: underline;
    }
  `.trim();
}
