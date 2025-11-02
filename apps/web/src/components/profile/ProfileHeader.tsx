'use client';

import React from 'react';
import { Save, Edit, UserCircle, Check } from 'lucide-react';
import { ProfileHeaderProps } from './types/profile';
import { useTheme } from '../../contexts/ThemeContext';


export default function ProfileHeader({
  isEditing,
  isSaving,
  isSaved = false,
  onEdit,
  onCancel,
  onSave
}: ProfileHeaderProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div 
      className="backdrop-blur-sm px-6 py-3 flex-shrink-0 shadow-sm"
      style={{
        background: colors.headerBackground,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left: Title and Description */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl"
            style={{
              background: colors.badgeInfoBg,
              border: `1px solid ${colors.badgeInfoBorder}`,
            }}
          >
            <UserCircle size={24} style={{ color: colors.primaryBlue }} />
          </div>
          <div>
            <h1 
              className="text-2xl font-bold"
              style={{ color: colors.primaryText }}
            >
              Personal Information
            </h1>
            <p 
              className="text-sm"
              style={{ color: colors.secondaryText }}
            >
              Update your personal details and profile information
            </p>
          </div>
        </div>
        
        {/* Right: All Action Buttons in One Bar */}
        <div className="flex items-center gap-2">
          {/* Unified Button Group */}
          {isEditing ? (
            <>
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                style={{
                  color: colors.secondaryText,
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackgroundStrong;
                  e.currentTarget.style.color = colors.primaryText;
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                  e.currentTarget.style.color = colors.secondaryText;
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={isSaving || isSaved}
                className="px-5 py-2 rounded-lg transition-all duration-300 ease-in-out flex items-center gap-2 text-sm font-medium"
                style={{
                  background: isSaved ? '#10b981' : colors.primaryBlue,
                  color: 'white',
                  opacity: 1,
                  cursor: (isSaving || isSaved) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s ease-in-out, transform 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  if (!isSaving && !isSaved) {
                    e.currentTarget.style.background = colors.primaryBlueHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (isSaved) {
                    e.currentTarget.style.background = '#10b981';
                  } else {
                    e.currentTarget.style.background = colors.primaryBlue;
                  }
                }}
              >
                {isSaved ? (
                  <>
                    <Check size={16} />
                    Saved
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isSaving ? 'Saving...' : 'Save'}
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Edit Profile Button */}
              <button
                onClick={onEdit}
                className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                style={{
                  background: colors.inputBackground,
                  color: colors.primaryText,
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
                <Edit size={16} />
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
