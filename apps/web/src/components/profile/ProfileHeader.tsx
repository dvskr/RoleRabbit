'use client';

import React from 'react';
import { Save, Edit, UserCircle, Check, CheckCircle } from 'lucide-react';
import { ProfileHeaderProps } from './types/profile';
import { useTheme } from '../../contexts/ThemeContext';


export default function ProfileHeader({
  isEditing,
  isSaving,
  isSaved = false,
  onEdit,
  onCancel,
  onSave,
  profileCompleteness = 0
}: ProfileHeaderProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const completenessColor = profileCompleteness >= 75 ? colors.successGreen : 
                           profileCompleteness >= 50 ? colors.badgeWarningText : 
                           colors.errorRed;

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
              Profile
            </h1>
            <p 
              className="text-sm"
              style={{ color: colors.secondaryText }}
            >
              Manage your profile information
            </p>
          </div>
        </div>
        
        {/* Right: Completeness Indicator and Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Profile Completeness Indicator */}
          <div 
            className="backdrop-blur-sm rounded-xl p-2.5 shadow-sm flex-shrink-0"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              minWidth: '120px',
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={12} style={{ color: completenessColor }} />
                <span 
                  className="text-xs font-semibold"
                  style={{ color: colors.primaryText }}
                >
                  Profile
                </span>
              </div>
              <span 
                className="text-xs font-bold"
                style={{ color: completenessColor }}
              >
                {profileCompleteness}%
              </span>
            </div>
            <div 
              className="w-full rounded-full h-1"
              style={{ background: colors.inputBackground }}
            >
              <div 
                className="h-1 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${profileCompleteness}%`,
                  background: profileCompleteness >= 75 
                    ? `linear-gradient(90deg, ${colors.successGreen}, ${colors.badgeSuccessText})`
                    : profileCompleteness >= 50
                    ? `linear-gradient(90deg, ${colors.badgeWarningText}, ${colors.badgeWarningBorder})`
                    : `linear-gradient(90deg, ${colors.errorRed}, ${colors.badgeErrorText})`
                }}
              />
            </div>
          </div>
          
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
