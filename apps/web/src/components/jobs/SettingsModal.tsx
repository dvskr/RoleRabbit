'use client';

import React from 'react';
import { X, Bell, Moon, Palette } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { theme, themeMode, setThemeMode } = useTheme();
  const colors = theme.colors;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <div 
        className="rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl"
        style={{
          background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground,
          border: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`,
          backdropFilter: 'blur(20px)',
          boxShadow: theme.mode === 'light' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ borderBottom: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}` }}
        >
          <h2 
            className="text-lg font-semibold"
            style={{ color: colors.primaryText }}
          >
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded transition-all"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.tertiaryText;
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Bell size={18} style={{ color: colors.tertiaryText }} />
              <h3 
                className="text-base font-semibold"
                style={{ color: colors.primaryText }}
              >
                Notifications
              </h3>
            </div>
            
            <div className="pl-8 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="rounded transition-all"
                  style={{ accentColor: colors.primaryBlue }}
                />
                <span style={{ color: colors.secondaryText }}>Email notifications for job updates</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="rounded transition-all"
                  style={{ accentColor: colors.primaryBlue }}
                />
                <span style={{ color: colors.secondaryText }}>Reminder notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded transition-all"
                  style={{ accentColor: colors.primaryBlue }}
                />
                <span style={{ color: colors.secondaryText }}>Interview reminders</span>
              </label>
            </div>
          </div>

          {/* Display Preferences */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Palette size={18} style={{ color: colors.tertiaryText }} />
              <h3 
                className="text-base font-semibold"
                style={{ color: colors.primaryText }}
              >
                Display Preferences
              </h3>
            </div>
            
            <div className="pl-8 space-y-3">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.secondaryText }}
                >
                  Default View Mode
                </label>
                <select 
                  className="w-full px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.secondaryText,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  <option style={{ background: colors.background, color: colors.secondaryText }}>Table</option>
                  <option style={{ background: colors.background, color: colors.secondaryText }}>Kanban</option>
                  <option style={{ background: colors.background, color: colors.secondaryText }}>List</option>
                  <option style={{ background: colors.background, color: colors.secondaryText }}>Grid</option>
                </select>
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.secondaryText }}
                >
                  Items Per Page
                </label>
                <select 
                  className="w-full px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.secondaryText,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  <option style={{ background: colors.background, color: colors.secondaryText }}>10</option>
                  <option style={{ background: colors.background, color: colors.secondaryText }}>25</option>
                  <option style={{ background: colors.background, color: colors.secondaryText }}>50</option>
                  <option style={{ background: colors.background, color: colors.secondaryText }}>100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Moon size={18} style={{ color: colors.tertiaryText }} />
              <h3 
                className="text-base font-semibold"
                style={{ color: colors.primaryText }}
              >
                Theme
              </h3>
            </div>
            
            <div className="pl-8">
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="light" 
                    checked={themeMode === 'light'}
                    onChange={() => setThemeMode('light')}
                    style={{ accentColor: colors.primaryBlue }}
                  />
                  <span style={{ color: colors.secondaryText }}>Light</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="dark" 
                    checked={themeMode === 'dark'}
                    onChange={() => setThemeMode('dark')}
                    style={{ accentColor: colors.primaryBlue }}
                  />
                  <span style={{ color: colors.secondaryText }}>Dark</span>
                </label>
              </div>
            </div>
          </div>

          {/* Note */}
          <div 
            className="rounded-lg p-4"
            style={{
              background: colors.badgeWarningBg,
              border: `1px solid ${colors.badgeWarningBorder}`,
            }}
          >
            <p 
              className="text-sm"
              style={{ color: colors.badgeWarningText }}
            >
              <strong>Note:</strong> Settings are currently stored locally. To persist settings across devices, 
              connect your account to sync preferences.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex gap-3 p-4"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg transition-all font-medium"
            style={{
              background: colors.inputBackground,
              color: colors.secondaryText,
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackgroundStrong;
              e.currentTarget.style.borderColor = colors.borderFocused;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg transition-all font-medium"
            style={{
              background: colors.primaryBlue,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.primaryBlueHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.primaryBlue;
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

