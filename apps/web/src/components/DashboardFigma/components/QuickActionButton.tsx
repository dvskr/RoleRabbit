import React from 'react';
import type { QuickAction, ThemeColors } from '../types/dashboardFigma';

interface QuickActionButtonProps {
  action: QuickAction;
  colors: ThemeColors;
}

// Get icon color based on action ID
const getIconColor = (actionId: string): string => {
  switch (actionId) {
    case 'resume':
      return '#3b82f6'; // Blue
    case 'jobs':
      return '#10b981'; // Green
    case 'target':
      return '#f59e0b'; // Amber/Orange
    case 'analytics':
      return '#8b5cf6'; // Purple
    case 'notifications':
      return '#ef4444'; // Red
    case 'settings':
      return '#6b7280'; // Gray
    case 'calendar':
      return '#06b6d4'; // Cyan
    case 'messages':
      return '#6366f1'; // Indigo
    default:
      return '#6b7280'; // Default gray
  }
};

export function QuickActionButton({ action, colors }: QuickActionButtonProps) {
  const Icon = action.icon;
  const iconColor = getIconColor(action.id);
  const isDark = (
    colors.background.includes('#000000') ||
    colors.background === '#000' ||
    colors.background.toLowerCase().includes('black')
  );

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={action.action}
        className="aspect-square w-full flex items-center justify-center rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110"
        style={{
          background: isDark ? '#111111' : colors.inputBackground,
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : `1px solid ${colors.border}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDark ? '#1a1a1a' : colors.hoverBackground;
          e.currentTarget.style.borderColor = iconColor;
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isDark ? '#111111' : colors.inputBackground;
          e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border;
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={action.label}
        aria-label={action.label}
      >
        <Icon 
          size={18} 
          className="sm:w-5 sm:h-5 md:w-6 md:h-6" 
          style={{ color: iconColor }}
        />
      </button>
      <span className="text-[10px] sm:text-xs text-center truncate w-full" style={{ color: colors.secondaryText }}>
        {action.label}
      </span>
    </div>
  );
}

