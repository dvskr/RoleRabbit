'use client';

import React from 'react';
import { Upload, User, Sparkles } from 'lucide-react';
import type { QuickActionType, ThemeColors } from '../types/aiPortfolioBuilder';

interface QuickActionButtonProps {
  action: QuickActionType;
  onClick: () => void;
  colors: ThemeColors;
}

const actionConfig = {
  'upload-resume': { icon: Upload, label: 'Upload Resume' },
  'use-profile': { icon: User, label: 'Use Profile' },
  'start-scratch': { icon: Sparkles, label: 'Start from Scratch' },
};

/**
 * QuickActionButton Component
 * Section 1.9 requirement #6: Memoized presentational component
 */
export const QuickActionButton = React.memo(function QuickActionButton({ action, onClick, colors }: QuickActionButtonProps) {
  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all"
      style={{
        background: colors.inputBackground,
        color: colors.primaryText,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.hoverBackgroundStrong;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = colors.inputBackground;
      }}
    >
      <Icon size={18} strokeWidth={2} style={{ color: colors.activeBlueText }} />
      <span className="text-sm font-medium">{config.label}</span>
    </button>
  );
});

