'use client';

import React from 'react';
import { Cloud } from 'lucide-react';
import { StorageInfo } from '../../types/cloudStorage';
import { useTheme } from '../../contexts/ThemeContext';

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

  const storageBarColor = getStorageBarColor(Number.isFinite(storageInfo.percentage) ? storageInfo.percentage : 0);
  const safeUsed = Number.isFinite(storageInfo.used) ? storageInfo.used : 0;
  const safeLimit = Number.isFinite(storageInfo.limit) ? storageInfo.limit : 0;
  const safePercentage = Number.isFinite(storageInfo.percentage) ? storageInfo.percentage : 0;
  const limitLabel = safeLimit > 0 ? `${safeLimit.toFixed(2)} GB` : '—';
  const usedLabel = safeUsed.toFixed(2);
  const percentageLabel = safeLimit > 0 ? safePercentage.toFixed(1) : '0.0';
  const progressWidth = safeLimit > 0 ? Math.min(safePercentage, 100) : 0;
  
  return (
    <div 
      className="backdrop-blur-sm px-6 py-3 flex-shrink-0 shadow-sm"
      style={{
        background: colors.headerBackground,
        borderBottom: `1px solid ${colors.border}`,
      }}
      data-testid="storage-header"
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
            data-testid="storage-usage-card"
          >
            {/* Storage Text - Compact & Elegant */}
            <div className="flex flex-col items-start min-w-[80px]">
              <div
                className="text-sm font-semibold leading-tight"
                style={{ color: colors.primaryText }}
              >
                {usedLabel} GB <span style={{ color: colors.tertiaryText, fontWeight: 'normal' }}> / {limitLabel}</span>
              </div>
              <div
                className="text-xs font-semibold mt-0.5"
                style={{ color: storageBarColor }}
              >
                {percentageLabel}%
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
                    width: `${progressWidth}%`,
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              style={{
                background: colors.inputBackground,
                color: colors.secondaryText,
                border: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackgroundStrong;
                e.currentTarget.style.color = colors.primaryText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.color = colors.secondaryText;
              }}
              data-testid="storage-refresh-button"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={onUpload}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              style={{
                background: colors.primaryBlue,
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              data-testid="storage-upload-button"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
