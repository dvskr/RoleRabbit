import React from 'react';
import type { ThemeColors } from '../types/dashboardFigma';
import { EVENTS } from '../constants/dashboardFigma';
import { EventItem } from './EventItem';

interface UpcomingEventsWidgetProps {
  colors: ThemeColors;
}

export function UpcomingEventsWidget({ colors }: UpcomingEventsWidgetProps) {
  return (
    <div
      className="rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl flex flex-col overflow-hidden"
      style={{
        background: colors.cardBackground,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold" style={{ color: colors.primaryText }}>
          Upcoming Events
        </h2>
        <span 
          className="px-2 py-0.5 text-xs font-medium rounded-full"
          style={{
            background: colors.badgePurpleBg,
            color: colors.badgePurpleText,
          }}
        >
          {EVENTS.length} events
        </span>
      </div>
      
      <div className="space-y-2.5">
        {EVENTS.map((event) => (
          <EventItem key={event.id} event={event} colors={colors} />
        ))}
      </div>
      
      <button 
        className="w-full mt-3 py-2 text-xs font-medium rounded-lg transition-colors border"
        style={{
          color: colors.primaryBlue,
          borderColor: colors.border,
          background: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.badgeInfoBg;
          e.currentTarget.style.color = colors.badgeInfoText;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = colors.primaryBlue;
        }}
      >
        View All Events
      </button>
    </div>
  );
}

