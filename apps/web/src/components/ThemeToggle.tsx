'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { themeMode, toggleTheme, theme } = useTheme();
  const colors = theme.colors;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-all duration-200 flex items-center justify-center"
      style={{
        background: colors.inputBackground,
        color: colors.tertiaryText,
        border: `1px solid ${colors.border}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.hoverBackgroundStrong;
        e.currentTarget.style.color = colors.secondaryText;
        e.currentTarget.style.borderColor = colors.borderFocused;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = colors.inputBackground;
        e.currentTarget.style.color = colors.tertiaryText;
        e.currentTarget.style.borderColor = colors.border;
      }}
      title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {themeMode === 'dark' ? (
        <Sun size={16} />
      ) : (
        <Moon size={16} />
      )}
    </button>
  );
}

