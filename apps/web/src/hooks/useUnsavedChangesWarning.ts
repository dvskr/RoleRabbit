/**
 * Unsaved Changes Warning Hook
 * Warns users before leaving page with unsaved changes
 */

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseUnsavedChangesWarningOptions {
  hasUnsavedChanges: boolean;
  message?: string;
  onBeforeUnload?: () => void;
  onRouteChange?: () => boolean; // Return false to prevent navigation
}

/**
 * Hook to warn users about unsaved changes
 * @param options Configuration options
 */
export function useUnsavedChangesWarning({
  hasUnsavedChanges,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  onBeforeUnload,
  onRouteChange
}: UseUnsavedChangesWarningOptions) {
  const router = useRouter();
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);

  // Update ref when hasUnsavedChanges changes
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Handle browser/tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChangesRef.current) {
        // Call custom handler if provided
        if (onBeforeUnload) {
          onBeforeUnload();
        }

        // Modern browsers ignore custom message, but we still need to set it
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [message, onBeforeUnload]);

  // Handle route changes (Next.js navigation)
  // Note: Next.js App Router doesn't have built-in route change events
  // This is a placeholder for potential future implementation
  useEffect(() => {
    // In Next.js App Router, we can't easily intercept route changes
    // Consider using a custom navigation wrapper or modal confirmation
    // when user clicks navigation links
  }, [onRouteChange]);

  return {
    hasUnsavedChanges: hasUnsavedChangesRef.current
  };
}

/**
 * Hook to prompt user before navigation
 * Returns a function to wrap navigation actions
 */
export function useNavigationPrompt(hasUnsavedChanges: boolean, message?: string) {
  const promptMessage = message || 'You have unsaved changes. Are you sure you want to leave?';

  const confirmNavigation = useCallback(() => {
    if (hasUnsavedChanges) {
      return window.confirm(promptMessage);
    }
    return true;
  }, [hasUnsavedChanges, promptMessage]);

  return confirmNavigation;
}

/**
 * Higher-order function to wrap navigation functions with unsaved changes check
 * @param hasUnsavedChanges Whether there are unsaved changes
 * @param navigationFn Function to execute if user confirms
 * @param message Custom warning message
 */
export function withUnsavedChangesCheck<T extends (...args: any[]) => any>(
  hasUnsavedChanges: boolean,
  navigationFn: T,
  message?: string
): T {
  return ((...args: Parameters<T>) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        message || 'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmed) {
        return;
      }
    }
    return navigationFn(...args);
  }) as T;
}

// ============================================
// EXPORTS
// ============================================

export default useUnsavedChangesWarning;



