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
    <div className="h-full p-8">
      <div className="h-full max-w-8xl mx-auto">
        {/* Larger Layout with Better Visibility */}
        <div className="h-full flex flex-col gap-8">
          {/* Top Row - Activity Feed and Smart Todos */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">
            {/* Activity Feed - Takes 2 columns */}
            {config.showActivityFeed && (
              <div className="lg:col-span-2 min-h-0">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 h-full overflow-hidden">
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
              <div className="lg:col-span-1 min-h-0">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 h-full overflow-hidden">
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
          </div>

          {/* Bottom Row - Premium Features and Quick Stats */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[400px]">
            {/* RoleReady Premium Features */}
            <div className="min-h-0">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-200 hover:shadow-xl transition-shadow duration-300 h-full overflow-hidden">
                <SponsoredAdPlaceholder />
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="min-h-0">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 h-full overflow-hidden">
                <div className="p-8 h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Stats</h3>
                  <div className="flex-1 grid grid-cols-2 gap-6">
                    <div className="p-6 bg-blue-50 rounded-xl border border-blue-200 flex flex-col justify-center hover:bg-blue-100 transition-colors">
                      <div className="text-4xl font-bold text-blue-600 mb-2">{dashboardData.metrics.totalApplications}</div>
                      <div className="text-lg text-blue-600 font-medium">Applications</div>
                    </div>
                    <div className="p-6 bg-green-50 rounded-xl border border-green-200 flex flex-col justify-center hover:bg-green-100 transition-colors">
                      <div className="text-4xl font-bold text-green-600 mb-2">{dashboardData.metrics.responseRate}%</div>
                      <div className="text-lg text-green-600 font-medium">Response Rate</div>
                    </div>
                    <div className="p-6 bg-purple-50 rounded-xl border border-purple-200 flex flex-col justify-center hover:bg-purple-100 transition-colors">
                      <div className="text-4xl font-bold text-purple-600 mb-2">{dashboardData.metrics.pipelineHealth.interview}</div>
                      <div className="text-lg text-purple-600 font-medium">Interviews</div>
                    </div>
                    <div className="p-6 bg-orange-50 rounded-xl border border-orange-200 flex flex-col justify-center hover:bg-orange-100 transition-colors">
                      <div className="text-4xl font-bold text-orange-600 mb-2">{dashboardData.metrics.pipelineHealth.offer}</div>
                      <div className="text-lg text-orange-600 font-medium">Offers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}