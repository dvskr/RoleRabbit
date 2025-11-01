/* eslint-disable react/forbid-dom-props */
'use client';

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Import types
import type { DashboardFigmaProps } from './DashboardFigma/types/dashboardFigma';

// Import constants
import {
  METRICS,
  ACTIVITIES,
  ALERTS,
  PROGRESS_METRICS,
  createQuickActions,
  createFilterTags
} from './DashboardFigma/constants/dashboardFigma';

// Import hooks
import { useDashboardFigma } from './DashboardFigma/hooks/useDashboardFigma';

// Import components
import { FilterTags } from './DashboardFigma/components/FilterTags';
import { MetricsGrid } from './DashboardFigma/components/MetricsGrid';
import { PremiumFeaturesWidget } from './DashboardFigma/components/PremiumFeaturesWidget';
import { ActivityFeedWidget } from './DashboardFigma/components/ActivityFeedWidget';
import { UpcomingEventsWidget } from './DashboardFigma/components/UpcomingEventsWidget';
import { QuickActionsWidget } from './DashboardFigma/components/QuickActionsWidget';
import { TodosWidget } from './DashboardFigma/components/TodosWidget';
import { IntelligentAlertsWidget } from './DashboardFigma/components/IntelligentAlertsWidget';
import { ProgressMetricsWidget } from './DashboardFigma/components/ProgressMetricsWidget';
import { ProfileAnalyticsWidget } from './DashboardFigma/components/ProfileAnalyticsWidget';

export default function DashboardFigma({ 
  onNavigateToTab,
  onQuickAction 
}: DashboardFigmaProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  // Use custom hooks for state management
  const {
    todos,
    filters,
    addTodoForm
  } = useDashboardFigma();

  // Create dynamic constants
  const quickActions = createQuickActions(onNavigateToTab);
  const filterTags = createFilterTags(onNavigateToTab, onQuickAction);

  // Calculate urgent alerts count
  const urgentAlertsCount = ALERTS.filter(a => a.priority === 'urgent').length;

  const isDark = theme.mode === 'dark';

  return (
    <div 
      className="min-h-screen transition-colors duration-300 w-full p-3 sm:p-4 md:p-6"
      style={{
        background: isDark 
          ? 'transparent'  // Let body gradient show through in dark mode
          : '#ffffff', // Pure white for light mode
      }}
    >
      <div className="w-full max-w-full mx-auto space-y-3 sm:space-y-4 md:space-y-6">
        {/* Filter Tags */}
        <FilterTags filterTags={filterTags} />

        {/* Metrics Grid */}
        <MetricsGrid metrics={METRICS} colors={colors} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
          {/* Left Side - Profile Analytics + Premium Features + Activity Feed + Events */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3 sm:gap-4">
            {/* Profile Analytics Widget */}
            <ProfileAnalyticsWidget />

            {/* Premium Features Widget */}
            <PremiumFeaturesWidget colors={colors} />

            {/* Activity Feed Widget */}
            <ActivityFeedWidget
              activities={ACTIVITIES}
              activityFilter={filters.activityFilter}
              onFilterChange={filters.setActivityFilter}
              colors={colors}
            />

            {/* Upcoming Events Widget */}
            <UpcomingEventsWidget colors={colors} />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 grid grid-cols-1 gap-3 sm:gap-4">
            {/* Quick Actions */}
            <QuickActionsWidget quickActions={quickActions} colors={colors} />

            {/* Smart To-Dos */}
            <TodosWidget
              todos={todos.filtered}
              todoFilter={filters.todoFilter}
              showCompleted={filters.showCompleted}
              todoProgress={todos.progress}
              showAddTodo={addTodoForm.showAddTodo}
              newTodoTitle={addTodoForm.newTodoTitle}
              newTodoSubtitle={addTodoForm.newTodoSubtitle}
              newTodoPriority={addTodoForm.newTodoPriority}
              onShowAddTodo={() => addTodoForm.setShowAddTodo(true)}
              onTitleChange={addTodoForm.setNewTodoTitle}
              onSubtitleChange={addTodoForm.setNewTodoSubtitle}
              onPriorityChange={addTodoForm.setNewTodoPriority}
              onAddTodo={addTodoForm.submitForm}
              onCancelAddTodo={addTodoForm.resetForm}
              onToggleTodo={todos.toggleTodoComplete}
              onDeleteTodo={todos.deleteTodo}
              colors={colors}
            />

            {/* Intelligent Alerts */}
            <IntelligentAlertsWidget
              alerts={ALERTS}
              urgentCount={urgentAlertsCount}
            />

            {/* Progress Metrics */}
            <ProgressMetricsWidget metrics={PROGRESS_METRICS} />
          </div>
        </div>
      </div>
    </div>
  );
}
