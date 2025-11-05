import React from 'react';
import type { Alert, ThemeColors } from '../types/dashboardFigma';

interface AlertItemProps {
  alert: Alert;
  colors: ThemeColors;
}

export function AlertItem({ alert, colors }: AlertItemProps) {
  const Icon = alert.icon;
  const isUrgent = alert.priority === 'urgent';
  const isDark = (
    colors.background.includes('#000000') ||
    colors.background === '#000' ||
    colors.background.toLowerCase().includes('black')
  );
  
  const iconBg = isUrgent 
    ? colors.badgeErrorBg 
    : colors.badgeWarningBg;
  const iconColor = isUrgent 
    ? colors.errorRed 
    : colors.badgeWarningText;

  return (
    <div 
      className="flex items-start gap-1.5 p-1 rounded transition-colors"
      style={{
        background: 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark ? '#111111' : colors.hoverBackground;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <div 
        className="p-0.5 rounded-full flex-shrink-0"
        style={{
          background: iconBg,
        }}
      >
        <Icon 
          size={12} 
          style={{ color: iconColor }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p 
          className="text-xs font-medium truncate"
          style={{ color: colors.primaryText }}
        >
          {alert.title}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <span 
            className="text-xs"
            style={{ color: colors.tertiaryText }}
          >
            {alert.time}
          </span>
        </div>
      </div>
    </div>
  );
}

