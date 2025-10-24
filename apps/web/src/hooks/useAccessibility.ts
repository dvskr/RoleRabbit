import { useCallback, useEffect, useRef, useState } from 'react';

// Hook for managing focus
export const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  const focusHistory = useRef<HTMLElement[]>([]);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, []);

  const focusElement = useCallback((element: HTMLElement) => {
    element.focus();
    setFocusedElement(element);
    focusHistory.current.push(element);
  }, []);

  const focusPrevious = useCallback(() => {
    const previous = focusHistory.current.pop();
    if (previous) {
      previous.focus();
      setFocusedElement(previous);
    }
  }, []);

  return {
    focusedElement,
    setFocusedElement,
    trapFocus,
    focusElement,
    focusPrevious
  };
};

// Hook for keyboard navigation
export const useKeyboardNavigation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState<HTMLElement[]>([]);

  const registerItems = useCallback((newItems: HTMLElement[]) => {
    setItems(newItems);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setCurrentIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Home':
        e.preventDefault();
        setCurrentIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setCurrentIndex(items.length - 1);
        break;
    }
  }, [items.length]);

  useEffect(() => {
    if (items[currentIndex]) {
      items[currentIndex].focus();
    }
  }, [currentIndex, items]);

  return {
    currentIndex,
    registerItems,
    handleKeyDown
  };
};

// Hook for ARIA live regions
export const useLiveRegion = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = useCallback((message: string) => {
    setAnnouncements(prev => [...prev, message]);
    
    // Clear announcement after screen reader has time to read it
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 1000);
  }, []);

  return {
    announcements,
    announce
  };
};

// Hook for screen reader announcements
export const useScreenReader = () => {
  const { announce } = useLiveRegion();

  const announcePageChange = useCallback((pageName: string) => {
    announce(`Navigated to ${pageName} page`);
  }, [announce]);

  const announceAction = useCallback((action: string) => {
    announce(action);
  }, [announce]);

  const announceError = useCallback((error: string) => {
    announce(`Error: ${error}`);
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`);
  }, [announce]);

  return {
    announcePageChange,
    announceAction,
    announceError,
    announceSuccess
  };
};

// Hook for high contrast mode detection
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
};

// Hook for reduced motion detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Hook for color scheme detection
export const useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | 'no-preference'>('no-preference');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setColorScheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setColorScheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return colorScheme;
};

// Hook for touch device detection
export const useTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };

    checkTouchDevice();
    
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    mediaQuery.addEventListener('change', checkTouchDevice);
    
    return () => mediaQuery.removeEventListener('change', checkTouchDevice);
  }, []);

  return isTouchDevice;
};

// Hook for accessible button behavior
export const useAccessibleButton = (onClick: () => void, disabled = false) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick();
    }
  }, [onClick, disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      onClick();
    }
  }, [onClick, disabled]);

  return {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    role: 'button',
    tabIndex: disabled ? -1 : 0,
    'aria-disabled': disabled
  };
};

// Hook for accessible form validation
export const useAccessibleForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setTouchedField = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const getFieldProps = useCallback((field: string) => {
    const hasError = touched[field] && errors[field];
    
    return {
      'aria-invalid': hasError,
      'aria-describedby': hasError ? `${field}-error` : undefined,
      'aria-required': true
    };
  }, [errors, touched]);

  const getErrorProps = useCallback((field: string) => {
    return {
      id: `${field}-error`,
      role: 'alert',
      'aria-live': 'polite'
    };
  }, []);

  return {
    errors,
    touched,
    setError,
    clearError,
    setTouchedField,
    getFieldProps,
    getErrorProps
  };
};
