/**
 * useThemeColors Hook - Decoupled Theme Access
 *
 * Provides theme colors with automatic fallback chain.
 * Works with or without ThemeContext.
 *
 * Fallback chain:
 * 1. React context (if available and in React tree)
 * 2. CSS variables (if in browser with :root vars)
 * 3. Default theme (always works)
 *
 * Usage:
 * ```tsx
 * // In React component with ThemeContext
 * const colors = useThemeColors(); // Uses context
 *
 * // In standalone component
 * const colors = useThemeColors(); // Uses CSS vars or default
 *
 * // Force specific colors
 * const colors = useThemeColors(customColors);
 * ```
 */

import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import type { ThemeColors } from '../contexts/ThemeContext';
import { getThemeColors } from '../utils/themeUtils';

/**
 * Hook to get theme colors with automatic fallback
 *
 * @param providedColors Optional colors to use instead of context/fallback
 * @returns ThemeColors object (always defined, never null)
 */
export function useThemeColors(providedColors?: ThemeColors | null): ThemeColors {
  // Try to get context (may be null if not in ThemeProvider tree)
  let contextColors: ThemeColors | null = null;

  try {
    const context = useContext(ThemeContext);
    contextColors = context?.theme?.colors || null;
  } catch (error) {
    // Context not available, will fall back
    contextColors = null;
  }

  // Use fallback chain
  return getThemeColors(providedColors || contextColors);
}

/**
 * Hook that returns theme colors or null if not available
 * Use this when you want to detect if theme context exists
 *
 * @returns ThemeColors from context, or null if no context
 */
export function useThemeColorsOptional(): ThemeColors | null {
  try {
    const context = useContext(ThemeContext);
    return context?.theme?.colors || null;
  } catch (error) {
    return null;
  }
}

/**
 * Hook that checks if ThemeContext is available
 *
 * @returns true if ThemeContext is available, false otherwise
 */
export function useHasThemeContext(): boolean {
  try {
    const context = useContext(ThemeContext);
    return context !== null && context !== undefined;
  } catch (error) {
    return false;
  }
}
