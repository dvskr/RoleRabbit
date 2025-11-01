'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Theme color definitions
export interface ThemeColors {
  // Backgrounds
  background: string;
  sidebarBackground: string;
  headerBackground: string;
  toolbarBackground: string;
  cardBackground: string;
  hoverBackground: string;
  hoverBackgroundStrong: string;
  inputBackground: string;
  
  // Text colors
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;
  activeText: string;
  activeBlueText: string;
  
  // Border colors
  border: string;
  borderFocused: string;
  
  // Accent colors
  primaryBlue: string;
  primaryBlueHover: string;
  
  // Badge colors
  badgeInfoBg: string;
  badgeInfoText: string;
  badgeInfoBorder: string;
  badgeSuccessBg: string;
  badgeSuccessText: string;
  badgeSuccessBorder: string;
  badgeWarningBg: string;
  badgeWarningText: string;
  badgeWarningBorder: string;
  badgeErrorBg: string;
  badgeErrorText: string;
  badgeErrorBorder: string;
  badgePurpleBg: string;
  badgePurpleText: string;
  badgePurpleBorder: string;
  badgeNeutralBg: string;
  badgeNeutralText: string;
  badgeNeutralBorder: string;
  
  // Status colors
  errorRed: string;
  successGreen: string;
  warningYellow: string;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  colors: ThemeColors;
}

// Dark Theme (Glossy Design System)
const darkTheme: ThemeConfig = {
  mode: 'dark',
  colors: {
    // Backgrounds
    background: '#0f0a1e',
    sidebarBackground: 'linear-gradient(180deg, rgba(25, 15, 45, 0.6) 0%, rgba(15, 10, 30, 0.6) 100%)',
    headerBackground: 'rgba(15, 10, 30, 0.4)',
    toolbarBackground: 'rgba(15, 10, 30, 0.2)',
    cardBackground: 'rgba(255, 255, 255, 0.02)',
    hoverBackground: 'rgba(255, 255, 255, 0.02)',
    hoverBackgroundStrong: 'rgba(255, 255, 255, 0.04)',
    inputBackground: 'rgba(255, 255, 255, 0.03)',
    
    // Text colors
    primaryText: '#f1f5f9',
    secondaryText: '#cbd5e1',
    tertiaryText: '#94a3b8',
    activeText: '#e9d5ff',
    activeBlueText: '#60a5fa',
    
    // Border colors
    border: 'rgba(203, 213, 225, 0.15)',
    borderFocused: 'rgba(203, 213, 225, 0.4)',
    
    // Accent colors
    primaryBlue: '#3b82f6',
    primaryBlueHover: '#2563eb',
    
    // Badge colors
    badgeInfoBg: 'rgba(59, 130, 246, 0.15)',
    badgeInfoText: '#3b82f6',
    badgeInfoBorder: 'rgba(59, 130, 246, 0.3)',
    badgeSuccessBg: 'rgba(16, 185, 129, 0.15)',
    badgeSuccessText: '#10b981',
    badgeSuccessBorder: 'rgba(16, 185, 129, 0.3)',
    badgeWarningBg: 'rgba(234, 179, 8, 0.15)',
    badgeWarningText: '#eab308',
    badgeWarningBorder: 'rgba(234, 179, 8, 0.3)',
    badgeErrorBg: 'rgba(239, 68, 68, 0.15)',
    badgeErrorText: '#ef4444',
    badgeErrorBorder: 'rgba(239, 68, 68, 0.3)',
    badgePurpleBg: 'rgba(168, 85, 247, 0.2)',
    badgePurpleText: '#a855f7',
    badgePurpleBorder: 'rgba(168, 85, 247, 0.3)',
    badgeNeutralBg: 'rgba(148, 163, 184, 0.15)',
    badgeNeutralText: '#cbd5e1',
    badgeNeutralBorder: 'rgba(148, 163, 184, 0.3)',
    
    // Status colors
    errorRed: '#ef4444',
    successGreen: '#10b981',
    warningYellow: '#eab308',
  },
};

// Light Theme (Pure White Design System)
const lightTheme: ThemeConfig = {
  mode: 'light',
  colors: {
    // Backgrounds - Pure White
    background: '#ffffff',
    sidebarBackground: '#ffffff',
    headerBackground: '#ffffff',
    toolbarBackground: '#ffffff',
    cardBackground: '#ffffff', // Pure white
    hoverBackground: 'rgba(0, 0, 0, 0.02)',
    hoverBackgroundStrong: 'rgba(0, 0, 0, 0.04)',
    inputBackground: 'rgba(0, 0, 0, 0.03)',
    
    // Text colors
    primaryText: '#111827',
    secondaryText: '#4b5563',
    tertiaryText: '#6b7280',
    activeText: '#7c3aed',
    activeBlueText: '#2563eb',
    
    // Border colors - Very subtle for polished look
    border: 'rgba(0, 0, 0, 0.08)', // Reduced opacity for softer edges
    borderFocused: 'rgba(107, 114, 128, 0.4)',
    
    // Accent colors
    primaryBlue: '#3b82f6',
    primaryBlueHover: '#2563eb',
    
    // Badge colors
    badgeInfoBg: 'rgba(59, 130, 246, 0.1)',
    badgeInfoText: '#1e40af',
    badgeInfoBorder: 'rgba(59, 130, 246, 0.3)',
    badgeSuccessBg: 'rgba(16, 185, 129, 0.1)',
    badgeSuccessText: '#047857',
    badgeSuccessBorder: 'rgba(16, 185, 129, 0.3)',
    badgeWarningBg: 'rgba(234, 179, 8, 0.1)',
    badgeWarningText: '#a16207',
    badgeWarningBorder: 'rgba(234, 179, 8, 0.3)',
    badgeErrorBg: 'rgba(239, 68, 68, 0.1)',
    badgeErrorText: '#b91c1c',
    badgeErrorBorder: 'rgba(239, 68, 68, 0.3)',
    badgePurpleBg: 'rgba(168, 85, 247, 0.1)',
    badgePurpleText: '#6b21a8',
    badgePurpleBorder: 'rgba(168, 85, 247, 0.3)',
    badgeNeutralBg: 'rgba(107, 114, 128, 0.1)',
    badgeNeutralText: '#4b5563',
    badgeNeutralBorder: 'rgba(107, 114, 128, 0.3)',
    
    // Status colors
    errorRed: '#dc2626',
    successGreen: '#059669',
    warningYellow: '#ca8a04',
  },
};

interface ThemeContextType {
  theme: ThemeConfig;
  themeMode: 'light' | 'dark';
  isClient: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
  initialThemeMode?: 'light' | 'dark';
};

export function ThemeProvider({ children, initialThemeMode = 'dark' }: ThemeProviderProps) {
  // During SSR, always use dark theme to match server render
  // Client will sync after hydration
  const [isClient, setIsClient] = useState(false);
  const [themeMode, setThemeModeState] = useState<'light' | 'dark'>(initialThemeMode);
  const [theme, setTheme] = useState<ThemeConfig>(initialThemeMode === 'light' ? lightTheme : darkTheme);

  // Mark as client-side and sync theme after hydration
  useEffect(() => {
    setIsClient(true);
    
    // Re-read from DOM (set by blocking script) to sync React state
    const htmlElement = document.documentElement;
    const domThemeAttr = htmlElement.getAttribute('data-theme');
    const domThemeClass = htmlElement.classList.contains('light') ? 'light' :
                         htmlElement.classList.contains('dark') ? 'dark' : null;

    let finalTheme: 'light' | 'dark' = initialThemeMode;

    if (domThemeAttr === 'light' || domThemeAttr === 'dark') {
      finalTheme = domThemeAttr;
    } else if (domThemeClass) {
      finalTheme = domThemeClass;
    } else {
      const saved = localStorage.getItem('themeMode');
      if (saved === 'light' || saved === 'dark') {
        finalTheme = saved;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        finalTheme = 'dark';
      } else {
        finalTheme = 'light';
      }
    }

    if (finalTheme !== themeMode) {
      setThemeModeState(finalTheme);
      setTheme(finalTheme === 'dark' ? darkTheme : lightTheme);
    } else {
      setTheme(themeMode === 'dark' ? darkTheme : lightTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update theme when mode changes (only on client)
  useEffect(() => {
    if (!isClient) return;
    
    setTheme(themeMode === 'dark' ? darkTheme : lightTheme);
    
    // Apply theme class to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(themeMode);
    document.documentElement.setAttribute('data-theme', themeMode);
    
    // Store in localStorage
    localStorage.setItem('themeMode', themeMode);

    // Store in cookie for SSR hydration
    document.cookie = `themeMode=${themeMode}; path=/; max-age=31536000; SameSite=Lax`;
  }, [themeMode, isClient]);

  // Listen for system theme changes (only on client)
  useEffect(() => {
    if (!isClient) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if no manual preference is set
      const saved = localStorage.getItem('themeMode');
      if (!saved) {
        setThemeModeState(e.matches ? 'dark' : 'light');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [isClient]);

  const toggleTheme = () => {
    setThemeModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setThemeMode = (mode: 'light' | 'dark') => {
    setThemeModeState(mode);
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    isClient,
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

