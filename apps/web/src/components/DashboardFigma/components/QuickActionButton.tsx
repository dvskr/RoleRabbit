import React from 'react';
import type { QuickAction, ThemeColors } from '../types/dashboardFigma';

interface QuickActionButtonProps {
  action: QuickAction;
  colors: ThemeColors;
}

export function QuickActionButton({ action, colors }: QuickActionButtonProps) {
  const Icon = action.icon;

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={action.action}
        className="aspect-square w-full flex items-center justify-center rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110"
        style={{
          background: colors.inputBackground,
          border: `1px solid ${colors.border}`,
          color: colors.secondaryText,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.hoverBackground;
          e.currentTarget.style.borderColor = colors.borderFocused;
          e.currentTarget.style.color = colors.primaryText;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.inputBackground;
          e.currentTarget.style.borderColor = colors.border;
          e.currentTarget.style.color = colors.secondaryText;
        }}
        title={action.label}
        aria-label={action.label}
      >
        <Icon size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>
      <span className="text-[10px] sm:text-xs text-center truncate w-full" style={{ color: colors.secondaryText }}>
        {action.label}
      </span>
    </div>
  );
}

