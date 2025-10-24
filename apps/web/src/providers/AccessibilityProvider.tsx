import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useFocusManagement, useKeyboardNavigation, useScreenReader, useHighContrast, useReducedMotion, useColorScheme, useTouchDevice, useAccessibleButton, useAccessibleForm } from '../hooks/useAccessibility';

interface AccessibilityContextType {
  // Focus management
  focusedElement: HTMLElement | null;
  trapFocus: (container: HTMLElement) => () => void;
  focusElement: (element: HTMLElement) => void;
  focusPrevious: () => void;
  
  // Keyboard navigation
  currentIndex: number;
  registerItems: (items: HTMLElement[]) => void;
  handleKeyDown: (e: KeyboardEvent) => void;
  
  // Screen reader
  announcePageChange: (pageName: string) => void;
  announceAction: (action: string) => void;
  announceError: (error: string) => void;
  announceSuccess: (message: string) => void;
  
  // Accessibility preferences
  isHighContrast: boolean;
  prefersReducedMotion: boolean;
  colorScheme: 'light' | 'dark' | 'no-preference';
  isTouchDevice: boolean;
  
  // Form accessibility
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  setTouchedField: (field: string) => void;
  getFieldProps: (field: string) => any;
  getErrorProps: (field: string) => any;
  
  // Accessible button
  getButtonProps: (onClick: () => void, disabled?: boolean) => any;
  
  // Global accessibility state
  skipLinks: boolean;
  setSkipLinks: (enabled: boolean) => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  // Hooks
  const focusManagement = useFocusManagement();
  const keyboardNavigation = useKeyboardNavigation();
  const screenReader = useScreenReader();
  const isHighContrast = useHighContrast();
  const prefersReducedMotion = useReducedMotion();
  const colorScheme = useColorScheme();
  const isTouchDevice = useTouchDevice();
  const formAccessibility = useAccessibleForm();
  
  // Global accessibility state
  const [skipLinks, setSkipLinks] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [highContrast, setHighContrast] = useState(false);

  // Apply accessibility preferences to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.style.setProperty('--font-size-multiplier', 
      fontSize === 'small' ? '0.875' : fontSize === 'large' ? '1.125' : '1'
    );
    
    // High contrast
    if (highContrast || isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (prefersReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Color scheme
    root.setAttribute('data-color-scheme', colorScheme);
    
    // Touch device
    if (isTouchDevice) {
      root.classList.add('touch-device');
    } else {
      root.classList.remove('touch-device');
    }
  }, [fontSize, highContrast, isHighContrast, prefersReducedMotion, colorScheme, isTouchDevice]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Skip links activation
      if (e.key === 'Tab' && !e.shiftKey) {
        const firstFocusable = document.querySelector('[data-skip-link]') as HTMLElement;
        if (firstFocusable && document.activeElement === document.body) {
          firstFocusable.focus();
        }
      }
      
      // Accessibility shortcuts
      if (e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            screenReader.announcePageChange('Home');
            break;
          case '2':
            e.preventDefault();
            screenReader.announcePageChange('Resume Editor');
            break;
          case '3':
            e.preventDefault();
            screenReader.announcePageChange('Job Tracker');
            break;
          case 'h':
            e.preventDefault();
            setHighContrast(!highContrast);
            screenReader.announceAction(`High contrast ${highContrast ? 'disabled' : 'enabled'}`);
            break;
          case 'f':
            e.preventDefault();
            const fontSizeOrder = ['small', 'medium', 'large'] as const;
            const currentIndex = fontSizeOrder.indexOf(fontSize);
            const nextIndex = (currentIndex + 1) % fontSizeOrder.length;
            setFontSize(fontSizeOrder[nextIndex]);
            screenReader.announceAction(`Font size set to ${fontSizeOrder[nextIndex]}`);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [screenReader, highContrast, fontSize]);

  const getButtonProps = useCallback((onClick: () => void, disabled = false) => {
    return useAccessibleButton(onClick, disabled);
  }, []);

  const contextValue: AccessibilityContextType = {
    // Focus management
    ...focusManagement,
    
    // Keyboard navigation
    ...keyboardNavigation,
    
    // Screen reader
    ...screenReader,
    
    // Accessibility preferences
    isHighContrast,
    prefersReducedMotion,
    colorScheme,
    isTouchDevice,
    
    // Form accessibility
    ...formAccessibility,
    
    // Accessible button
    getButtonProps,
    
    // Global accessibility state
    skipLinks,
    setSkipLinks,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Skip Links Component
export const SkipLinks: React.FC = () => {
  const { skipLinks } = useAccessibilityContext();
  
  if (!skipLinks) return null;

  return (
    <div className="skip-links">
      <a 
        href="#main-content" 
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
        data-skip-link
      >
        Skip to main content
      </a>
      <a 
        href="#navigation" 
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 bg-blue-600 text-white px-4 py-2 rounded z-50"
        data-skip-link
      >
        Skip to navigation
      </a>
      <a 
        href="#ai-panel" 
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-60 bg-blue-600 text-white px-4 py-2 rounded z-50"
        data-skip-link
      >
        Skip to AI panel
      </a>
    </div>
  );
};

// Accessibility Toolbar
export const AccessibilityToolbar: React.FC = () => {
  const { 
    fontSize, 
    setFontSize, 
    highContrast, 
    setHighContrast,
    announceAction 
  } = useAccessibilityContext();

  const handleFontSizeChange = useCallback((size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    announceAction(`Font size set to ${size}`);
  }, [setFontSize, announceAction]);

  const handleHighContrastToggle = useCallback(() => {
    setHighContrast(!highContrast);
    announceAction(`High contrast ${highContrast ? 'disabled' : 'enabled'}`);
  }, [highContrast, setHighContrast, announceAction]);

  return (
    <div className="accessibility-toolbar fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-40">
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-gray-700">Accessibility:</div>
        
        {/* Font Size Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleFontSizeChange('small')}
            className={`px-2 py-1 text-xs rounded ${
              fontSize === 'small' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-label="Small font size"
          >
            A
          </button>
          <button
            onClick={() => handleFontSizeChange('medium')}
            className={`px-2 py-1 text-sm rounded ${
              fontSize === 'medium' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-label="Medium font size"
          >
            A
          </button>
          <button
            onClick={() => handleFontSizeChange('large')}
            className={`px-2 py-1 text-base rounded ${
              fontSize === 'large' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-label="Large font size"
          >
            A
          </button>
        </div>

        {/* High Contrast Toggle */}
        <button
          onClick={handleHighContrastToggle}
          className={`px-3 py-1 text-sm rounded ${
            highContrast 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-label={`${highContrast ? 'Disable' : 'Enable'} high contrast`}
        >
          {highContrast ? 'High Contrast On' : 'High Contrast Off'}
        </button>
      </div>
    </div>
  );
};

// Accessible Modal Component
export const AccessibleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { trapFocus, announceAction } = useAccessibilityContext();
  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      announceAction(`Modal opened: ${title}`);
      
      // Trap focus when modal opens
      if (modalRef.current) {
        const cleanup = trapFocus(modalRef.current);
        
        // Focus first focusable element
        const firstFocusable = modalRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        
        if (firstFocusable) {
          firstFocusable.focus();
        }
        
        return cleanup;
      }
    }
  }, [isOpen, title, trapFocus, announceAction]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl w-full mx-4 ${sizeClasses[size]}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccessibilityProvider;
