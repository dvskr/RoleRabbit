'use client';

import React, { useState } from 'react';
import { DashboardConfig, DashboardWidget } from './types/dashboard';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardGrid } from './components/DashboardGrid';
import { Target, TrendingUp, Settings, Download, BarChart3, Eye, X, Palette, Sparkles, Search, Bell } from 'lucide-react';
import { DashboardCustomizer } from './components/DashboardCustomizer';
import { DataExport } from './components/DataExport';
import { GoalSetting } from './components/GoalSetting';
import { Analytics } from './components/Analytics';
import { ThemeCustomizer } from './components/ThemeCustomizer';
import { DashboardTour } from './components/DashboardTour';

interface MissionControlDashboardProps {
  config?: Partial<DashboardConfig>;
  onQuickAction?: (actionId: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenApplicationAnalytics?: () => void;
}

export default function MissionControlDashboard({
  config,
  onQuickAction,
  onNavigateToTab,
  onOpenApplicationAnalytics
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
    density: 'comfortable' as 'comfortable' | 'compact' | 'spacious',
    layout: 'grid' as 'grid' | 'list' | 'compact'
  });

  // Widget state management
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: 'activity-feed', type: 'activity', title: 'Activity Feed', description: 'Track job search activities', isVisible: true, order: 0, size: 'large' },
    { id: 'intelligent-alerts', type: 'alerts', title: 'Intelligent Alerts', description: 'Proactive reminders', isVisible: true, order: 2, size: 'medium' },
    { id: 'progress-metrics', type: 'metrics', title: 'Progress Metrics', description: 'Track your progress', isVisible: true, order: 3, size: 'large' },
    { id: 'todos', type: 'todos', title: 'Todos', description: 'Your tasks and todos', isVisible: true, order: 4, size: 'medium' },
    { id: 'quick-actions', type: 'actions', title: 'Quick Actions', description: 'One-click actions', isVisible: true, order: 5, size: 'medium' },
    { id: 'premium-features', type: 'premium', title: 'Premium Features', description: 'RoleReady premium tools', isVisible: true, order: 6, size: 'large' }
  ]);

  // Real-time notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Dashboard search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Keyboard shortcuts state
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);

  // Dashboard tour state
  const [showTour, setShowTour] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  // Handle widget changes from customizer
  const handleWidgetsChange = (newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets);
  };

  // Handle quick actions with external callback
  const handleQuickAction = (actionId: string) => {
    executeQuickAction(actionId);
    onQuickAction?.(actionId);
  };

  // Handle navigation to other tabs
  const handleNavigateToTab = (tab: string) => {
    onNavigateToTab?.(tab);
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!shortcutsEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setShowSearch(true);
      }
      
      // Ctrl/Cmd + , for settings
      if ((event.ctrlKey || event.metaKey) && event.key === ',') {
        event.preventDefault();
        setShowCustomizer(true);
      }
      
      // Ctrl/Cmd + E for export
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        setShowDataExport(true);
      }
      
      // Ctrl/Cmd + G for goals
      if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault();
        setShowGoalSetting(true);
      }
      
      // Ctrl/Cmd + A for analytics
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        setShowAnalytics(true);
      }
      
      // Escape to close modals
      if (event.key === 'Escape') {
        setShowSearch(false);
        setShowCustomizer(false);
        setShowDataExport(false);
        setShowGoalSetting(false);
        setShowAnalytics(false);
        setShowThemeCustomizer(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcutsEnabled]);

  // Check if user is new and show tour
  React.useEffect(() => {
    const hasSeenTour = localStorage.getItem('dashboard-tour-completed');
    if (!hasSeenTour) {
      // Show tour after a short delay
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTourComplete = () => {
    setHasCompletedTour(true);
    localStorage.setItem('dashboard-tour-completed', 'true');
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
      {/* Stats and Actions Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2" data-tour="mission-control-header">
        {/* Compact Stats - More Efficient Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5" data-tour="quick-stats">
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
              className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-1.5 hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-center gap-1">
                <div className={`p-1 rounded-md ${stat.bgColor}`}>
                  <stat.icon size={12} className={stat.color} />
                </div>
                <div>
                  <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-[9px] text-gray-600">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compact Action Bar */}
        <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-gray-200">
          <button
            onClick={() => setShowCustomizer(true)}
            className="flex items-center gap-0.5 px-2 py-0.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-[10px]"
          >
            <Settings size={11} />
            Customize
          </button>
          <button
            onClick={() => setShowDataExport(true)}
            className="flex items-center gap-0.5 px-2 py-0.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-[10px]"
          >
            <Download size={11} />
            Export
          </button>
          <button
            onClick={() => onOpenApplicationAnalytics ? onOpenApplicationAnalytics() : setShowAnalytics(true)}
            className="flex items-center gap-0.5 px-2 py-0.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-[10px]"
          >
            <BarChart3 size={11} />
            Analytics
          </button>
          <button
            onClick={() => setShowGoalSetting(true)}
            className="flex items-center gap-0.5 px-2 py-0.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-[10px]"
          >
            <Target size={11} />
            Goals
          </button>
          <button
            onClick={() => setShowThemeCustomizer(true)}
            className="flex items-center gap-0.5 px-2 py-0.5 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors text-[10px]"
          >
            <Palette size={11} />
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
            config={dashboardConfig}
            widgets={widgets}
            onCompleteTodo={completeTodo}
            onDismissAlert={dismissAlert}
            onQuickAction={handleQuickAction}
            onNavigateToTab={handleNavigateToTab}
          />
        </div>

        {/* Modals */}
        {showCustomizer && (
          <DashboardCustomizer
            widgets={widgets}
            onWidgetsChange={handleWidgetsChange}
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

        {/* Search Modal */}
        {showSearch && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Search Dashboard</h3>
                  <button
                    onClick={() => setShowSearch(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close search"
                    title="Close"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search activities, todos, alerts..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Search across all dashboard content including:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Job applications and activities</li>
                    <li>• Smart todos and tasks</li>
                    <li>• Alerts and notifications</li>
                    <li>• Progress metrics and goals</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="fixed top-16 right-4 bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 overflow-hidden z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Close notifications"
                  title="Close"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dashboard Tour */}
        <DashboardTour
          isOpen={showTour}
          onClose={() => setShowTour(false)}
          onComplete={handleTourComplete}
        />
      </div>
    );
  }
