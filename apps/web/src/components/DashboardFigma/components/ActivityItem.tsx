import React from 'react';
import type { Activity, ThemeColors } from '../types/dashboardFigma';
import { getStatusColor } from '../utils/dashboardFigmaHelpers';

interface ActivityItemProps {
  activity: Activity;
  colors: ThemeColors;
}

export function ActivityItem({ activity, colors }: ActivityItemProps) {
  const Icon = activity.icon;
  const statusColor = getStatusColor(activity.status);

  return (
    <div
      className="flex items-start gap-2 p-1.5 sm:p-2 rounded-lg transition-colors"
      style={{
        background: 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.hoverBackground;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <div className={`p-1 rounded-full flex-shrink-0 ${
        activity.status === 'completed' ? 'bg-emerald-500/20' :
        activity.status === 'pending' ? 'bg-blue-500/20' :
        'bg-amber-500/20'
      }`}>
        <Icon 
          size={14} 
          className={`${
            activity.status === 'completed' ? 'text-emerald-400' :
            activity.status === 'pending' ? 'text-blue-400' :
            'text-amber-400'
          }`} 
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-0.5 truncate" style={{ color: colors.primaryText }}>
          {activity.title}
        </p>
        <p className="text-xs mb-0.5 line-clamp-1" style={{ color: colors.secondaryText }}>
          {activity.subtitle}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs" style={{ color: colors.tertiaryText }}>
            {activity.time}
          </span>
          <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${statusColor}`}>
            {activity.status}
          </span>
        </div>
      </div>
    </div>
  );
}

