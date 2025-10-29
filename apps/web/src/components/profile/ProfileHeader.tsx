'use client';

import React, { ReactNode } from 'react';
import { Save, Edit, LogOut, UserCircle } from 'lucide-react';
import { ProfileHeaderProps } from './types/profile';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ThemeToggle';

interface ExtendedProfileHeaderProps extends ProfileHeaderProps {
  resumeImportButton?: ReactNode;
}

export default function ProfileHeader({
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
  resumeImportButton
}: ExtendedProfileHeaderProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

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
          {/* Theme Toggle */}
          <ThemeToggle />
          
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
                disabled={isSaving}
                className="px-5 py-2 rounded-lg disabled:opacity-50 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.background = colors.primaryBlueHover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.primaryBlue;
                }}
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              {/* Resume Import Button */}
              {resumeImportButton}
              
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
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                style={{
                  background: colors.inputBackground,
                  color: colors.errorRed,
                  border: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.badgeErrorBg;
                  e.currentTarget.style.borderColor = colors.badgeErrorBorder;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
