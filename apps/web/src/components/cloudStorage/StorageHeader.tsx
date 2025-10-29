'use client';

import React from 'react';
import { Cloud } from 'lucide-react';
import { StorageInfo } from '../../types/cloudStorage';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ThemeToggle';

// Add shimmer animation style
const shimmerStyle = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
`;

interface StorageHeaderProps {
  storageInfo: StorageInfo;
  onUpload: () => void;
  onRefresh: () => void;
}

export default function StorageHeader({ 
  storageInfo, 
  onUpload, 
  onRefresh 
}: StorageHeaderProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  // Inject shimmer animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = shimmerStyle;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const getStorageBarColor = (percentage: number) => {
    if (percentage >= 90) return colors.errorRed;
    if (percentage >= 75) return colors.badgeWarningText;
    return colors.successGreen;
  };

  const storageBarColor = getStorageBarColor(storageInfo.percentage);
  
  return (
    <div 
      className="backdrop-blur-sm px-6 py-3 flex-shrink-0 shadow-sm"
      style={{
        background: colors.headerBackground,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left Section: Title and Subtitle */}
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center justify-center w-12 h-12 rounded-xl"
            style={{
              background: colors.badgeInfoBg,
              border: `1px solid ${colors.badgeInfoBorder}`,
            }}
          >
            <Cloud size={24} style={{ color: colors.primaryBlue }} />
          </div>
          <div>
            <h1 
              className="text-2xl font-bold"
              style={{ color: colors.primaryText }}
            >
              Storage
            </h1>
            <p 
              className="text-sm"
              style={{ color: colors.secondaryText }}
            >
              Manage your files and documents
            </p>
          </div>
        </div>

        {/* Right Section: Storage Usage and Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Storage Usage Info - Elegant Card Design */}
          <div 
            className="flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.borderFocused;
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.background = colors.cardBackground;
            }}
          >
            {/* Storage Text - Compact & Elegant */}
            <div className="flex flex-col items-start min-w-[80px]">
              <div 
                className="text-sm font-semibold leading-tight"
                style={{ color: colors.primaryText }}
              >
                {storageInfo.used} <span style={{ color: colors.tertiaryText, fontWeight: 'normal' }}>/ {storageInfo.limit} GB</span>
              </div>
              <div 
                className="text-xs font-semibold mt-0.5"
                style={{ color: storageBarColor }}
              >
                {storageInfo.percentage.toFixed(1)}%
              </div>
            </div>
            
            {/* Progress Bar - Elegant Style */}
            <div className="flex items-center">
              <div 
                className="w-24 h-2 rounded-full relative overflow-hidden shadow-inner"
                style={{ 
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out relative"
                  style={{
                    width: `${Math.min(storageInfo.percentage, 100)}%`,
                    background: storageInfo.percentage >= 90
                      ? `linear-gradient(90deg, ${storageBarColor} 0%, ${colors.errorRed} 100%)`
                      : storageInfo.percentage >= 75
                      ? `linear-gradient(90deg, ${storageBarColor} 0%, ${colors.badgeWarningText} 100%)`
                      : `linear-gradient(90deg, ${colors.successGreen} 0%, ${storageBarColor} 100%)`,
                    boxShadow: `0 0 8px ${storageBarColor}40`,
                  }}
                >
                  {/* Animated shine effect */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-30"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: 'shimmer 2s infinite',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
