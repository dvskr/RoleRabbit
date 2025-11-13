/**
 * Accessibility utilities for respecting user preferences
 */

/**
 * Checks if user prefers reduced motion via system settings
 * @returns true if user has enabled reduced motion preference
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Gets animation duration based on user's motion preferences
 * @param normalDuration - Duration in ms for users without reduced motion preference
 * @param reducedDuration - Duration in ms for users with reduced motion preference (default: 0)
 * @returns Appropriate duration based on user preference
 */
export function getAnimationDuration(
  normalDuration: number,
  reducedDuration: number = 0
): number {
  return prefersReducedMotion() ? reducedDuration : normalDuration;
}

/**
 * Gets success animation duration based on user's motion preferences
 * Default: 1000ms normal, 100ms reduced
 * Optimized for power users who need to perform quick successive actions
 * @returns Appropriate success animation duration
 */
export function getSuccessAnimationDuration(): number {
  return getAnimationDuration(1000, 100);
}

/**
 * Listens for changes to reduced motion preference
 * @param callback - Function to call when preference changes
 * @returns Cleanup function to remove the listener
 */
export function watchReducedMotionPreference(
  callback: (prefersReduced: boolean) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // No-op for SSR
  }

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const handler = (event: MediaQueryListEvent) => {
    callback(event.matches);
  };

  // Use addEventListener for modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }

  // Fallback for older browsers
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}
