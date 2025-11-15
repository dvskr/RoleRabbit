/**
 * Accessibility Hooks
 * Section 1.8: WCAG 2.1 AA Compliance utilities
 *
 * Provides reusable hooks for:
 * - Focus trap in modals (requirement #9)
 * - Initial focus management (requirement #10)
 * - Return focus on close (requirement #11)
 * - Keyboard navigation helpers
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Focus Trap Hook
 * Section 1.8 requirement #9: Trap focus within modal dialogs
 * Ensures Tab/Shift+Tab cycles only within the modal
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Initial Focus Hook
 * Section 1.8 requirement #10: Set initial focus when modal opens
 */
export function useInitialFocus<T extends HTMLElement = HTMLElement>(
  isOpen: boolean,
  selector: string = 'input, button, [tabindex]:not([tabindex="-1"])'
) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (!isOpen) return;

    const element = elementRef.current;
    if (!element) return;

    // Try to find the first focusable element
    const firstFocusable = element.querySelector<HTMLElement>(selector);

    if (firstFocusable) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        firstFocusable.focus();
      }, 0);
    }
  }, [isOpen, selector]);

  return elementRef;
}

/**
 * Return Focus Hook
 * Section 1.8 requirement #11: Return focus to trigger element when modal closes
 */
export function useReturnFocus(isOpen: boolean) {
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element when modal opens
      triggerElementRef.current = document.activeElement as HTMLElement;
    } else {
      // Return focus when modal closes
      if (triggerElementRef.current) {
        setTimeout(() => {
          triggerElementRef.current?.focus();
        }, 0);
      }
    }
  }, [isOpen]);

  return triggerElementRef;
}

/**
 * Keyboard Navigation Hook
 * Section 1.8 requirement #7 & #8: Handle arrow key navigation
 */
export function useKeyboardNavigation(
  items: unknown[],
  onSelect: (index: number) => void,
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    wrap?: boolean;
    initialIndex?: number;
  } = {}
) {
  const { orientation = 'both', wrap = true, initialIndex = 0 } = options;
  const currentIndexRef = useRef(initialIndex);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const totalItems = items.length;
      if (totalItems === 0) return;

      let newIndex = currentIndexRef.current;

      switch (e.key) {
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            e.preventDefault();
            newIndex = wrap
              ? (newIndex + 1) % totalItems
              : Math.min(newIndex + 1, totalItems - 1);
          }
          break;

        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            e.preventDefault();
            newIndex = wrap
              ? (newIndex - 1 + totalItems) % totalItems
              : Math.max(newIndex - 1, 0);
          }
          break;

        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            e.preventDefault();
            newIndex = wrap
              ? (newIndex + 1) % totalItems
              : Math.min(newIndex + 1, totalItems - 1);
          }
          break;

        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            e.preventDefault();
            newIndex = wrap
              ? (newIndex - 1 + totalItems) % totalItems
              : Math.max(newIndex - 1, 0);
          }
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect(currentIndexRef.current);
          return;

        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;

        case 'End':
          e.preventDefault();
          newIndex = totalItems - 1;
          break;

        default:
          return;
      }

      currentIndexRef.current = newIndex;
      onSelect(newIndex);
    },
    [items.length, onSelect, orientation, wrap]
  );

  const setCurrentIndex = (index: number) => {
    currentIndexRef.current = index;
  };

  return { handleKeyDown, setCurrentIndex, currentIndex: currentIndexRef.current };
}

/**
 * Announce to Screen Readers
 * Programmatically announce messages to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Generate unique ID for accessibility attributes
 */
let idCounter = 0;
export function useUniqueId(prefix: string = 'a11y'): string {
  const idRef = useRef<string>();

  if (!idRef.current) {
    idRef.current = `${prefix}-${++idCounter}`;
  }

  return idRef.current;
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabindex = element.getAttribute('tabindex');
  const isInteractive =
    element.tagName === 'BUTTON' ||
    element.tagName === 'A' ||
    element.tagName === 'INPUT' ||
    element.tagName === 'SELECT' ||
    element.tagName === 'TEXTAREA';

  return isInteractive || (tabindex !== null && tabindex !== '-1');
}

export default {
  useFocusTrap,
  useInitialFocus,
  useReturnFocus,
  useKeyboardNavigation,
  announceToScreenReader,
  useUniqueId,
  isKeyboardAccessible,
};
