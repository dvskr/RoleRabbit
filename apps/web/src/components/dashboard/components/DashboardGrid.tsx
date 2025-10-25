'use client';

import React from 'react';
import { DashboardData, DashboardConfig } from '../types/dashboard';
import { ActivityFeed } from './ActivityFeed';
import { SmartTodoSystem } from './SmartTodoSystem';
import { ProgressMetrics } from './ProgressMetrics';
import { IntelligentAlerts } from './IntelligentAlerts';
import { QuickActionsPanel } from './QuickActionsPanel';
import { SponsoredAdPlaceholder } from './SponsoredAdPlaceholder';

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
  onCompleteTodo,
  onDismissAlert,
  onQuickAction,
  onNavigateToTab
}: DashboardGridProps) {
  return (
    <div className="h-full p-4">
      <div className="h-full max-w-7xl mx-auto">
        {/* Complete Dashboard Layout with All Components */}
        <div className="h-full flex flex-col gap-4">
          {/* Top Row - Activity Feed, Smart Todos, and Intelligent Alerts */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[400px]">
            {/* Activity Feed - Takes 2 columns */}
            {config.showActivityFeed && (
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
            {config.showSmartTodos && (
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
            <div className="lg:col-span-1 min-h-0" data-tour="intelligent-alerts">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-full overflow-hidden">
                <IntelligentAlerts
                  alerts={dashboardData.alerts}
                  onDismissAlert={onDismissAlert}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Middle Row - Progress Metrics and Quick Actions */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[300px]">
            {/* Progress Metrics */}
            <div className="min-h-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-full overflow-hidden">
                <ProgressMetrics
                  metrics={dashboardData.metrics}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="min-h-0" data-tour="quick-actions">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-full overflow-hidden">
                <QuickActionsPanel
                  actions={dashboardData.quickActions}
                  onQuickAction={onQuickAction}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Bottom Row - Premium Features */}
          <div className="flex-1 grid grid-cols-1 gap-4 min-h-[200px]">
            {/* RoleReady Premium Features */}
            <div className="min-h-0">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 hover:shadow-md transition-shadow duration-200 h-full overflow-hidden">
                <SponsoredAdPlaceholder />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}