// Main Dashboard Component
export { default as MissionControlDashboard } from './MissionControlDashboard';

// Sub-components
export { DashboardHeader } from './components/DashboardHeader';
export { DashboardGrid } from './components/DashboardGrid';
export { ActivityFeed } from './components/ActivityFeed';
export { SmartTodoSystem } from './components/SmartTodoSystem';
export { ProgressMetrics } from './components/ProgressMetrics';
export { IntelligentAlerts } from './components/IntelligentAlerts';
export { QuickActionsPanel } from './components/QuickActionsPanel';
export { DashboardFooter } from './components/DashboardFooter';

// Types
export type {
  DashboardActivity,
  DashboardTodo,
  DashboardMetrics,
  DashboardAlert,
  QuickAction,
  DashboardData,
  DashboardConfig,
  UseDashboardReturn
} from './types/dashboard';

// Configuration
export { DEFAULT_DASHBOARD_CONFIG, createDashboardConfig, DASHBOARD_PRESETS } from './config/dashboardConfig';

// Data
export { generateRealisticMockData } from './data/mockData';
