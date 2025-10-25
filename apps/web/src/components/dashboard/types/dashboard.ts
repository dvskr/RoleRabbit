export interface DashboardActivity {
  id: string;
  type: 'application' | 'response' | 'interview' | 'follow_up' | 'reminder';
  title: string;
  description: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'overdue';
  relatedJobId?: string;
  actionUrl?: string;
  // Frontend-only fields for now
  mockData?: boolean;
}

export interface DashboardTodo {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  category: 'application' | 'follow_up' | 'preparation' | 'research' | 'networking';
  isCompleted: boolean;
  estimatedTime: number; // minutes
  relatedJobId?: string;
  // Frontend-only fields
  mockData?: boolean;
  aiGenerated?: boolean;
}

export interface DashboardMetrics {
  totalApplications: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  averageResponseTime: number; // days
  pipelineHealth: {
    applied: number;
    phoneScreen: number;
    interview: number;
    offer: number;
    rejected: number;
  };
  weeklyActivity: {
    applications: number;
    responses: number;
    interviews: number;
  };
  // Frontend-only fields
  mockData?: boolean;
  lastCalculated?: Date;
}

export interface DashboardAlert {
  id: string;
  type: 'follow_up' | 'interview' | 'deadline' | 'suggestion' | 'achievement';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  timestamp: Date;
  actionUrl?: string;
  dismissible: boolean;
  // Frontend-only fields
  mockData?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  action: () => void;
  category: 'application' | 'communication' | 'preparation' | 'research';
  isEnabled: boolean;
  // Frontend-only fields
  mockData?: boolean;
}

export interface DashboardData {
  activities: DashboardActivity[];
  todos: DashboardTodo[];
  metrics: DashboardMetrics;
  alerts: DashboardAlert[];
  quickActions: QuickAction[];
  lastUpdated: Date;
}

// Configuration for easy backend integration later
export interface DashboardConfig {
  // Data source configuration
  dataSource: 'mock' | 'api' | 'hybrid';
  refreshInterval: number; // minutes
  enableRealTimeUpdates: boolean;
  
  // Feature toggles
  showActivityFeed: boolean;
  showSmartTodos: boolean;
  showProgressMetrics: boolean;
  showIntelligentAlerts: boolean;
  showQuickActions: boolean;
  
  // UI preferences
  layout: 'grid' | 'list' | 'compact';
  theme: 'light' | 'dark' | 'auto';
  density: 'comfortable' | 'compact' | 'spacious';
  
  // Future backend integration
  apiEndpoints?: {
    activities: string;
    todos: string;
    metrics: string;
    alerts: string;
  };
}

export interface UseDashboardReturn {
  // Data (mock for now)
  dashboardData: DashboardData;
  isLoading: boolean;
  error: string | null;
  
  // Actions (frontend-only for now)
  refreshDashboard: () => void;
  completeTodo: (todoId: string) => void;
  dismissAlert: (alertId: string) => void;
  executeQuickAction: (actionId: string) => void;
  
  // Filters
  activityFilter: string;
  setActivityFilter: (filter: string) => void;
  todoFilter: string;
  setTodoFilter: (filter: string) => void;
  
  // Settings
  showCompletedTodos: boolean;
  setShowCompletedTodos: (show: boolean) => void;
  config: DashboardConfig;
  updateConfig: (config: Partial<DashboardConfig>) => void;
}
