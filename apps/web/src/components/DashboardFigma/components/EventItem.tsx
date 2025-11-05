import React from 'react';
import type { Event, ThemeColors } from '../types/dashboardFigma';

interface EventItemProps {
  event: Event;
  colors: ThemeColors;
}

export function EventItem({ event, colors }: EventItemProps) {
  const Icon = event.icon;
  const isDark = (
    colors.background.includes('#000000') ||
    colors.background === '#000' ||
    colors.background.toLowerCase().includes('black')
  );

  return (
    <div
      className="p-2.5 rounded-lg border transition-all"
      style={{
        border: isDark ? `1px solid ${event.urgent ? colors.badgeWarningBorder : 'rgba(255, 255, 255, 0.1)'}` : `1px solid ${event.urgent ? colors.badgeWarningBorder : colors.border}`,
        background: isDark ? (event.urgent ? colors.badgeWarningBg : '#111111') : (event.urgent ? colors.badgeWarningBg : colors.inputBackground),
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark ? '#1a1a1a' : colors.hoverBackground;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isDark ? (event.urgent ? colors.badgeWarningBg : '#111111') : (event.urgent ? colors.badgeWarningBg : colors.inputBackground);
      }}
    >
      <div className="flex items-start gap-2.5">
        <div 
          className="p-1.5 rounded-lg flex-shrink-0"
          style={{
            background: event.urgent ? colors.badgeWarningBg : colors.badgeInfoBg,
            color: event.urgent ? colors.badgeWarningText : colors.badgeInfoText,
          }}
        >
          <Icon
            size={16}
            style={{
              color: event.urgent ? colors.badgeWarningText : colors.badgeInfoText,
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-0.5" style={{ color: colors.primaryText }}>
            {event.title}
          </p>
          <p className="text-xs" style={{ color: colors.secondaryText }}>{event.date}</p>
        </div>
        {event.urgent && (
          <span 
            className="px-1.5 py-0.5 text-xs font-medium rounded-full"
            style={{
              background: colors.badgeErrorBg,
              color: colors.errorRed,
            }}
          >
            Urgent
          </span>
        )}
      </div>
    </div>
  );
}

