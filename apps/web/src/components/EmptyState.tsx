'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  illustration?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  illustration,
  className = ''
}: EmptyStateProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {illustration ? (
        <div className="mb-8">{illustration}</div>
      ) : (
        <div 
          className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
          style={{
            background: `linear-gradient(135deg, ${colors.badgePurpleBg}, ${colors.badgeInfoBg})`,
            border: `2px solid ${colors.badgePurpleBorder}`,
            opacity: 0.9,
          }}
        >
          <Icon 
            size={48} 
            style={{ color: colors.badgePurpleText }}
          />
        </div>
      )}
      
      <h3 
        className="text-xl font-semibold mb-3"
        style={{ color: colors.primaryText }}
      >
        {title}
      </h3>
      <p 
        className="text-center max-w-md mb-8 text-sm"
        style={{ color: colors.secondaryText }}
      >
        {description}
      </p>
      
      {actionLabel && onAction && (
        <div className="flex gap-3">
          <button
            onClick={onAction}
            className="px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {actionLabel}
          </button>
          
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-6 py-3 rounded-lg transition-all font-medium"
              style={{
                border: `1px solid ${colors.border}`,
                background: colors.inputBackground,
                color: colors.primaryText,
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
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

