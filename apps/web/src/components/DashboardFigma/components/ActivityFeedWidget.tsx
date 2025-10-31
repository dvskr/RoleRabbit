import React from 'react';
import type { Activity, ThemeColors } from '../types/dashboardFigma';
import { ActivityItem } from './ActivityItem';

interface ActivityFeedWidgetProps {
  activities: Activity[];
  activityFilter: string;
  onFilterChange: (filter: string) => void;
  colors: ThemeColors;
}

export function ActivityFeedWidget({
  activities,
  activityFilter,
  onFilterChange,
  colors
}: ActivityFeedWidgetProps) {
  return (
    <div
      className="rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl flex flex-col overflow-hidden"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h2 className="text-base sm:text-lg font-semibold" style={{ color: colors.primaryText }}>
          Activity Feed
        </h2>
        <button 
          className="text-xs font-medium transition-colors"
          style={{ color: colors.primaryBlue }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.primaryBlueHover || colors.primaryBlue;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.primaryBlue;
          }}
        >
          View All
        </button>
      </div>
      
      {/* Filter Dropdown */}
      <div className="mb-2">
        <select
          value={activityFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full sm:w-auto rounded-lg px-2 sm:px-3 py-1 text-xs focus:outline-none transition-colors"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.borderFocused;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.border;
          }}
          title="Filter activities"
        >
          <option>All Activity</option>
          <option>Applications</option>
          <option>Interviews</option>
          <option>Follow-ups</option>
        </select>
      </div>

      {/* Activity List */}
      <div className="space-y-1.5">
        {activities.slice(0, 3).map((activity) => (
          <ActivityItem key={activity.id} activity={activity} colors={colors} />
        ))}
      </div>
    </div>
  );
}

