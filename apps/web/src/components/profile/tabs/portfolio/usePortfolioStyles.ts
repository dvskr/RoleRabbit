/**
 * Portfolio Tab - Style Utilities
 * 
 * Utilities to convert inline styles to CSS classes using theme variables
 */

import { useMemo } from 'react';

interface ThemeColors {
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;
  background: string;
  cardBackground: string;
  inputBackground: string;
  hoverBackground: string;
  hoverBackgroundStrong: string;
  border: string;
  borderFocused: string;
  primaryBlue: string;
  primaryBlueHover: string;
  successGreen: string;
  errorRed: string;
  badgeInfoBg: string;
  badgeInfoText: string;
  badgeInfoBorder: string;
  badgeWarningBg: string;
  badgeWarningText: string;
  badgeWarningBorder: string;
  badgeErrorBg: string;
  badgePurpleText: string;
}

/**
 * Hook to generate CSS variable style object from theme
 */
export const usePortfolioStyles = (colors: ThemeColors) => {
  return useMemo(() => ({
    '--portfolio-primary-text': colors.primaryText,
    '--portfolio-secondary-text': colors.secondaryText,
    '--portfolio-tertiary-text': colors.tertiaryText,
    '--portfolio-background': colors.background,
    '--portfolio-card-bg': colors.cardBackground,
    '--portfolio-input-bg': colors.inputBackground,
    '--portfolio-hover-bg': colors.hoverBackground,
    '--portfolio-hover-bg-strong': colors.hoverBackgroundStrong,
    '--portfolio-border': colors.border,
    '--portfolio-border-focused': colors.borderFocused,
    '--portfolio-primary-blue': colors.primaryBlue,
    '--portfolio-primary-blue-hover': colors.primaryBlueHover,
    '--portfolio-success-green': colors.successGreen,
    '--portfolio-error-red': colors.errorRed,
    '--portfolio-badge-info-bg': colors.badgeInfoBg,
    '--portfolio-badge-info-text': colors.badgeInfoText,
    '--portfolio-badge-info-border': colors.badgeInfoBorder,
    '--portfolio-badge-warning-bg': colors.badgeWarningBg,
    '--portfolio-badge-warning-text': colors.badgeWarningText,
    '--portfolio-badge-warning-border': colors.badgeWarningBorder,
    '--portfolio-badge-error-bg': colors.badgeErrorBg,
    '--portfolio-badge-purple-text': colors.badgePurpleText,
  } as React.CSSProperties), [colors]);
};

/**
 * Helper to create style object for text colors
 */
export const getTextColor = (type: 'primary' | 'secondary' | 'tertiary', colors: ThemeColors) => {
  return { color: colors[`${type}Text`] };
};

/**
 * Helper to create style object for backgrounds
 */
export const getBackground = (type: 'card' | 'input' | 'hover', colors: ThemeColors) => {
  const map = {
    card: colors.cardBackground,
    input: colors.inputBackground,
    hover: colors.hoverBackground,
  };
  return { background: map[type] };
};

/**
 * Helper to create style object for borders
 */
export const getBorder = (focused: boolean, colors: ThemeColors) => {
  return {
    border: `1px solid ${focused ? colors.borderFocused : colors.border}`
  };
};

