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
    secondaryText: '#94a3b8',
    tertiaryText: '#64748b',
    activeText: '#e9d5ff',
    activeBlueText: '#60a5fa',
    
    // Border colors
    border: 'rgba(148, 163, 184, 0.1)',
    borderFocused: 'rgba(148, 163, 184, 0.3)',
    
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
    badgePurpleBg: 'rgba(168, 85, 247, 0.15)',
    badgePurpleText: '#a855f7',
    badgePurpleBorder: 'rgba(168, 85, 247, 0.3)',
    badgeNeutralBg: 'rgba(148, 163, 184, 0.15)',
    badgeNeutralText: '#94a3b8',
    badgeNeutralBorder: 'rgba(148, 163, 184, 0.3)',
    
    // Status colors
    errorRed: '#ef4444',
    successGreen: '#10b981',
    warningYellow: '#eab308',
  },
};

// Light Theme
const lightTheme: ThemeConfig = {
  mode: 'light',
  colors: {
    // Backgrounds
    background: '#ffffff',
    sidebarBackground: 'linear-gradient(180deg, rgba(249, 250, 251, 0.95) 0%, rgba(243, 244, 246, 0.95) 100%)',
    headerBackground: 'rgba(255, 255, 255, 0.8)',
    toolbarBackground: 'rgba(249, 250, 251, 0.8)',
    cardBackground: 'rgba(0, 0, 0, 0.02)',
    hoverBackground: 'rgba(0, 0, 0, 0.02)',
    hoverBackgroundStrong: 'rgba(0, 0, 0, 0.04)',
    inputBackground: 'rgba(0, 0, 0, 0.03)',
    
    // Text colors
    primaryText: '#111827',
    secondaryText: '#4b5563',
    tertiaryText: '#6b7280',
    activeText: '#7c3aed',
    activeBlueText: '#2563eb',
    
    // Border colors
    border: 'rgba(107, 114, 128, 0.2)',
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
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<'light' | 'dark'>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('themeMode');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
      
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'dark'; // Default to dark (glossy theme)
  });

  const [theme, setTheme] = useState<ThemeConfig>(
    themeMode === 'dark' ? darkTheme : lightTheme
  );

  // Update theme when mode changes
  useEffect(() => {
    setTheme(themeMode === 'dark' ? darkTheme : lightTheme);
    
    // Apply theme class to document
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(themeMode);
      document.documentElement.setAttribute('data-theme', themeMode);
      
      // Store in localStorage
      localStorage.setItem('themeMode', themeMode);
    }
  }, [themeMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
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
  }, []);

  const toggleTheme = () => {
    setThemeModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setThemeMode = (mode: 'light' | 'dark') => {
    setThemeModeState(mode);
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    toggleTheme,
    setThemeMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

