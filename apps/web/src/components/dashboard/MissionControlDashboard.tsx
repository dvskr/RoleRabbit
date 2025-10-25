'use client';

import React, { useState } from 'react';
import { DashboardConfig } from './types/dashboard';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardGrid } from './components/DashboardGrid';
import { Lightbulb, Target, Clock, TrendingUp, Settings, Download, BarChart3, Eye, X, Palette, Sparkles } from 'lucide-react';
import { DashboardCustomizer } from './components/DashboardCustomizer';
import { DataExport } from './components/DataExport';
import { GoalSetting } from './components/GoalSetting';
import { Analytics } from './components/Analytics';
import { ThemeCustomizer } from './components/ThemeCustomizer';

interface MissionControlDashboardProps {
  config?: Partial<DashboardConfig>;
  onQuickAction?: (actionId: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export default function MissionControlDashboard({
  config,
  onQuickAction,
  onNavigateToTab
}: MissionControlDashboardProps) {
  const {
    dashboardData,
    isLoading,
    error,
    refreshDashboard,
    completeTodo,
    dismissAlert,
    executeQuickAction,
    activityFilter,
    setActivityFilter,
    todoFilter,
    setTodoFilter,
    showCompletedTodos,
    setShowCompletedTodos,
    config: dashboardConfig,
    updateConfig
  } = useDashboard(config);

  // State for new dashboard features
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  const [showGoalSetting, setShowGoalSetting] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [currentTheme, setCurrentTheme] = useState({
    id: 'light',
    name: 'Light Theme',
    description: 'Clean and bright interface',
    colors: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: '#111827',
      accent: '#10B981'
    },
    density: 'comfortable' as const,
    layout: 'grid' as const
  });

  // Handle quick actions with external callback
  const handleQuickAction = (actionId: string) => {
    executeQuickAction(actionId);
    onQuickAction?.(actionId);
  };

  // Handle navigation to other tabs
  const handleNavigateToTab = (tab: string) => {
    onNavigateToTab?.(tab);
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshDashboard}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Clean Notion-style Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mission Control</h1>
              <p className="text-sm text-gray-600">Your job search command center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshDashboard}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <TrendingUp size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Quick Stats - Notion Style */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Applications',
              value: dashboardData.metrics.totalApplications,
              icon: Target,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50',
              borderColor: 'border-blue-200'
            },
            {
              label: 'Response Rate',
              value: `${dashboardData.metrics.responseRate}%`,
              icon: TrendingUp,
              color: 'text-green-600',
              bgColor: 'bg-green-50',
              borderColor: 'border-green-200'
            },
            {
              label: 'Interviews',
              value: dashboardData.metrics.pipelineHealth.interview,
              icon: Eye,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50',
              borderColor: 'border-purple-200'
            },
            {
              label: 'Offers',
              value: dashboardData.metrics.pipelineHealth.offer,
              icon: Sparkles,
              color: 'text-orange-600',
              bgColor: 'bg-orange-50',
              borderColor: 'border-orange-200'
            }
          ].map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-4 hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar - Clean Design */}
      <div className="px-8 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCustomizer(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings size={16} />
            Customize
          </button>
          <button
            onClick={() => setShowDataExport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BarChart3 size={16} />
            Analytics
          </button>
          <button
            onClick={() => setShowGoalSetting(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Target size={16} />
            Goals
          </button>
          <button
            onClick={() => setShowThemeCustomizer(true)}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Palette size={16} />
            Themes
          </button>
        </div>
      </div>

        {/* Main Dashboard Content - Scrollable with Proper Height */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <DashboardGrid
            dashboardData={dashboardData}
            isLoading={isLoading}
            activityFilter={activityFilter}
            setActivityFilter={setActivityFilter}
            todoFilter={todoFilter}
            setTodoFilter={setTodoFilter}
            showCompletedTodos={showCompletedTodos}
            setShowCompletedTodos={setShowCompletedTodos}
            config={dashboardConfig}
            onCompleteTodo={completeTodo}
            onDismissAlert={dismissAlert}
            onQuickAction={handleQuickAction}
            onNavigateToTab={handleNavigateToTab}
          />
        </div>

        {/* Modals */}
        {showCustomizer && (
          <DashboardCustomizer
            widgets={[]} // TODO: Implement widget state management
            onWidgetsChange={() => {}}
            onClose={() => setShowCustomizer(false)}
          />
        )}

        {showDataExport && (
          <DataExport
            dashboardData={dashboardData}
            onClose={() => setShowDataExport(false)}
          />
        )}

        {showGoalSetting && (
          <GoalSetting
            goals={goals}
            onGoalsChange={setGoals}
            onClose={() => setShowGoalSetting(false)}
          />
        )}

        {showAnalytics && (
          <Analytics
            dashboardData={dashboardData}
            onClose={() => setShowAnalytics(false)}
          />
        )}

        {showThemeCustomizer && (
          <ThemeCustomizer
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            onClose={() => setShowThemeCustomizer(false)}
          />
        )}
      </div>
    );
  }
