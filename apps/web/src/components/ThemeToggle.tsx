'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { themeMode, toggleTheme, theme } = useTheme();
  const isDark = themeMode === 'dark';
  const colors = theme.colors;

  // Dark Mode styling - subtle dark background matching UI
  const darkModeStyles = {
    background: '#1a1625', // Subtle dark purple matching the theme
    border: '#5C4E80',
    iconColor: '#B088F9',
    textColor: '#D0D0D0',
  };

  // Light Mode styling - subtle light background matching UI
  const lightModeStyles = {
    background: '#f9fafb', // Subtle off-white matching the theme
    border: '#4A495E',
    iconColor: '#FFD700',
    textColor: '#374151', // Dark gray matching UI text
  };

  const styles = isDark ? darkModeStyles : lightModeStyles;

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2"
      style={{
        background: styles.background,
        border: `1px solid ${styles.border}`,
        color: styles.textColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.9';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <>
          <Moon size={16} style={{ color: styles.iconColor }} />
          <span className="text-sm font-medium">Dark Mode</span>
        </>
      ) : (
        <>
          <Sun size={16} style={{ color: styles.iconColor }} />
          <span className="text-sm font-medium">Light Mode</span>
        </>
      )}
    </button>
  );
}

