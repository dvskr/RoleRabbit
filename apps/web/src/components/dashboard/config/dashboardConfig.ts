import { DashboardConfig } from './types/dashboard';

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  // Data source (easy to change later)
  dataSource: 'mock',
  refreshInterval: 5, // minutes
  enableRealTimeUpdates: false,
  
  // Feature toggles (easy to customize)
  showActivityFeed: true,
  showSmartTodos: true,
  showProgressMetrics: true,
  showIntelligentAlerts: true,
  showQuickActions: true,
  
  // UI preferences
  layout: 'grid',
  theme: 'light',
  density: 'comfortable',
  
  // Future API endpoints (ready for backend)
  apiEndpoints: {
    activities: '/api/dashboard/activities',
    todos: '/api/dashboard/todos',
    metrics: '/api/dashboard/metrics',
    alerts: '/api/dashboard/alerts',
  }
};

// Easy to override for different users/environments
export const createDashboardConfig = (overrides: Partial<DashboardConfig>): DashboardConfig => {
  return { ...DEFAULT_DASHBOARD_CONFIG, ...overrides };
};

// Configuration presets for different user types
export const DASHBOARD_PRESETS = {
  beginner: createDashboardConfig({
    showActivityFeed: true,
    showSmartTodos: true,
    showProgressMetrics: true,
    showIntelligentAlerts: true,
    showQuickActions: true,
    density: 'comfortable'
  }),
  
  experienced: createDashboardConfig({
    showActivityFeed: true,
    showSmartTodos: false,
    showProgressMetrics: true,
    showIntelligentAlerts: true,
    showQuickActions: true,
    density: 'compact'
  }),
  
  minimal: createDashboardConfig({
    showActivityFeed: false,
    showSmartTodos: true,
    showProgressMetrics: true,
    showIntelligentAlerts: false,
    showQuickActions: true,
    density: 'compact'
  })
};
