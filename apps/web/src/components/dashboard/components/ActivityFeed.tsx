'use client';

import React from 'react';
import { Clock, CheckCircle, AlertCircle, ArrowRight, Filter } from 'lucide-react';
import { DashboardActivity } from '../../types/dashboard';

interface ActivityFeedProps {
  activities: DashboardActivity[];
  filter: string;
  onFilterChange: (filter: string) => void;
  isLoading: boolean;
  onNavigateToTab: (tab: string) => void;
}

export function ActivityFeed({
  activities,
  filter,
  onFilterChange,
  isLoading,
  onNavigateToTab
}: ActivityFeedProps) {
  const getActivityIcon = (type: DashboardActivity['type']) => {
    switch (type) {
      case 'application':
        return <ArrowRight size={16} className="text-blue-600" />;
      case 'response':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'interview':
        return <Clock size={16} className="text-purple-600" />;
      case 'follow_up':
        return <AlertCircle size={16} className="text-orange-600" />;
      case 'reminder':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: DashboardActivity['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  const filterOptions = [
    { value: 'all', label: 'All Activity' },
    { value: 'application', label: 'Applications' },
    { value: 'response', label: 'Responses' },
    { value: 'interview', label: 'Interviews' },
    { value: 'follow_up', label: 'Follow-ups' },
    { value: 'reminder', label: 'Reminders' }
  ];

  // Calculate dynamic height to fill ALL available space
  const getDynamicHeight = () => {
    if (typeof window !== 'undefined') {
      return window.innerHeight * 0.9; // Use 90% of viewport height
    }
    return 600; // Fallback height for SSR
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-full">
      {/* Header - Compact */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">Activity Feed</h3>
          <button
            onClick={() => onNavigateToTab('tracker')}
            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
          >
            View All
          </button>
        </div>

        {/* Filter - Compact */}
        <div className="flex items-center gap-2">
          <Filter size={12} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="text-xs border border-gray-300 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity List - Dynamic Scrollable with Hidden Scrollbar */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-3 text-center text-gray-500">
            <Clock size={20} className="mx-auto mb-1 text-gray-400" />
            <p className="text-xs">No activities found</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {filteredActivities.map(activity => (
              <div
                key={activity.id}
                className={`p-2 rounded border-l-3 ${getPriorityColor(activity.priority)} hover:shadow-sm transition-shadow cursor-pointer`}
                onClick={() => activity.actionUrl && onNavigateToTab(activity.actionUrl.replace('/', ''))}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-gray-900 mb-0.5 line-clamp-2">
                      {activity.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        activity.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : activity.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
