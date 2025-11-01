'use client';

import React from 'react';
import { DashboardData, DashboardConfig } from '../types/dashboard';
import { ActivityFeed } from './ActivityFeed';
import { SmartTodoSystem } from './SmartTodoSystem';
import { ProgressMetrics } from './ProgressMetrics';
import { IntelligentAlerts } from './IntelligentAlerts';
import { QuickActionsPanel } from './QuickActionsPanel';
import { SponsoredAdPlaceholder } from './SponsoredAdPlaceholder';
import { ProfileAnalytics } from './ProfileAnalytics';

interface DashboardGridProps {
  dashboardData: DashboardData;
  isLoading: boolean;
  activityFilter: string;
  setActivityFilter: (filter: string) => void;
  todoFilter: string;
  setTodoFilter: (filter: string) => void;
  showCompletedTodos: boolean;
  setShowCompletedTodos: (show: boolean) => void;
  config: DashboardConfig;
  widgets?: Array<{ id: string; type: string; isVisible: boolean; order: number; size: string }>;
  onCompleteTodo: (todoId: string) => void;
  onDismissAlert: (alertId: string) => void;
  onQuickAction: (actionId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export function DashboardGrid({
  dashboardData,
  isLoading,
  activityFilter,
  setActivityFilter,
  todoFilter,
  setTodoFilter,
  showCompletedTodos,
  setShowCompletedTodos,
  config,
  widgets = [],
  onCompleteTodo,
  onDismissAlert,
  onQuickAction,
  onNavigateToTab
}: DashboardGridProps) {
  return (
    <div className="h-full p-3">
      <div className="h-full max-w-7xl mx-auto">
        {/* Complete Dashboard Layout with All Components */}
        <div className="h-full flex flex-col gap-3">
          {/* Top Row - Activity Feed, Smart Todos, and Intelligent Alerts */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-3 min-h-[400px]">
            {/* Activity Feed - Takes 2 columns */}
            {config.showActivityFeed && widgets.find(w => w.id === 'activity-feed')?.isVisible !== false && (
              <div className="lg:col-span-2 min-h-0" data-tour="activity-feed">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-full overflow-hidden">
                  <ActivityFeed
                    activities={dashboardData.activities}
                    filter={activityFilter}
                    onFilterChange={setActivityFilter}
                    isLoading={isLoading}
                    onNavigateToTab={onNavigateToTab}
                  />
                </div>
              </div>
            )}

            {/* Smart Todo System - Takes 1 column */}
            {config.showSmartTodos && widgets.find(w => w.id === 'smart-todos')?.isVisible !== false && (
              <div className="lg:col-span-1 min-h-0" data-tour="smart-todos">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-full overflow-hidden">
                  <SmartTodoSystem
                    todos={dashboardData.todos}
                    filter={todoFilter}
                    onFilterChange={setTodoFilter}
                    showCompleted={showCompletedTodos}
                    onShowCompletedChange={setShowCompletedTodos}
                    onCompleteTodo={onCompleteTodo}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Intelligent Alerts - Takes 1 column */}
            {widgets.find(w => w.id === 'intelligent-alerts')?.isVisible !== false && (
              <div className="lg:col-span-1 min-h-0" data-tour="intelligent-alerts">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-full overflow-hidden">
                  <IntelligentAlerts
                    alerts={dashboardData.alerts}
                    onDismissAlert={onDismissAlert}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Middle Row - Progress Metrics, Profile Analytics, and Quick Actions */}
          <div className="flex-shrink-0 grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Progress Metrics */}
            {widgets.find(w => w.id === 'progress-metrics')?.isVisible !== false && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-[350px] overflow-hidden">
                  <ProgressMetrics
                    metrics={dashboardData.metrics}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Profile Analytics */}
            <div className="lg:col-span-1" data-tour="profile-analytics">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-[350px] overflow-hidden">
                <ProfileAnalytics isLoading={isLoading} />
              </div>
            </div>

            {/* Quick Actions Panel */}
            {widgets.find(w => w.id === 'quick-actions')?.isVisible !== false && (
              <div className="lg:col-span-1" data-tour="quick-actions">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-[350px] overflow-hidden">
                  <QuickActionsPanel
                    actions={dashboardData.quickActions}
                    onQuickAction={onQuickAction}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Row - Premium Features */}
          {widgets.find(w => w.id === 'premium-features')?.isVisible !== false && (
            <div className="flex-shrink-0 grid grid-cols-1 gap-3">
              {/* RoleReady Premium Features */}
              <div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 hover:shadow-md transition-shadow duration-200 h-[400px] overflow-hidden">
                  <SponsoredAdPlaceholder />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}