import { useState, useEffect, useCallback } from 'react';
import { DashboardData, DashboardConfig, UseDashboardReturn, DashboardTodo, DashboardAlert } from '../components/dashboard/types/dashboard';
import { DEFAULT_DASHBOARD_CONFIG } from '../components/dashboard/config/dashboardConfig';
import { generateRealisticMockData } from '../components/dashboard/data/mockData';
import apiService from '../services/apiService';

export const useDashboard = (initialConfig?: Partial<DashboardConfig>): UseDashboardReturn => {
  const [config, setConfig] = useState<DashboardConfig>({
    ...DEFAULT_DASHBOARD_CONFIG,
    ...initialConfig
  });
  
  const [dashboardData, setDashboardData] = useState<DashboardData>(generateRealisticMockData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [todoFilter, setTodoFilter] = useState<string>('all');
  const [showCompletedTodos, setShowCompletedTodos] = useState(false);
  
  // Refresh dashboard data from API
  const refreshDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (config.dataSource === 'api' || config.dataSource === 'hybrid') {
        // Fetch from real API
        const [activitiesRes, todosRes, metricsRes, alertsRes] = await Promise.all([
          apiService.getDashboardActivities(20).catch(() => ({ activities: [] })),
          apiService.getDashboardTodos().catch(() => ({ todos: [] })),
          apiService.getDashboardMetrics().catch(() => ({ metrics: null })),
          apiService.getDashboardAlerts().catch(() => ({ alerts: [] }))
        ]);
        
        // Transform API data to DashboardData format
        const newData: DashboardData = {
          activities: activitiesRes.activities || [],
          todos: todosRes.todos || [],
          metrics: metricsRes.metrics || dashboardData.metrics,
          alerts: alertsRes.alerts || [],
          quickActions: dashboardData.quickActions, // Keep existing quick actions
          lastUpdated: new Date()
        };
        
        setDashboardData(newData);
      } else {
        // Use mock data
        setDashboardData(generateRealisticMockData());
      }
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('Dashboard refresh error:', err);
      setError(err.message || 'Failed to refresh dashboard data');
      setIsLoading(false);
      // Fallback to mock data on error
      if (config.dataSource === 'api') {
        setDashboardData(generateRealisticMockData());
      }
    }
  }, [config.dataSource, dashboardData.metrics]);
  
  // Complete a todo
  const completeTodo = useCallback(async (todoId: string) => {
    // Optimistic update
    setDashboardData(prev => ({
      ...prev,
      todos: prev.todos.map(todo => 
        todo.id === todoId 
          ? { ...todo, isCompleted: !todo.isCompleted }
          : todo
      )
    }));
    
    // Sync with API if using real data
    if (config.dataSource === 'api' || config.dataSource === 'hybrid') {
      try {
        await apiService.completeTodo(todoId, true);
      } catch (err) {
        console.error('Failed to complete todo:', err);
        // Revert on error
        setDashboardData(prev => ({
          ...prev,
          todos: prev.todos.map(todo => 
            todo.id === todoId 
              ? { ...todo, isCompleted: !todo.isCompleted }
              : todo
          )
        }));
      }
    }
  }, [config.dataSource]);
  
  // Dismiss an alert
  const dismissAlert = useCallback(async (alertId: string) => {
    // Optimistic update
    setDashboardData(prev => ({
      ...prev,
      alerts: prev.alerts.filter(alert => alert.id !== alertId)
    }));
    
    // Sync with API if using real data
    if (config.dataSource === 'api' || config.dataSource === 'hybrid') {
      try {
        await apiService.dismissAlert(alertId);
      } catch (err) {
        console.error('Failed to dismiss alert:', err);
        // Revert by refreshing
        refreshDashboard();
      }
    }
  }, [config.dataSource, refreshDashboard]);
  
  // Execute quick action
  const executeQuickAction = useCallback((actionId: string) => {
    const action = dashboardData.quickActions.find(a => a.id === actionId);
    if (action && action.isEnabled) {
      action.action();
    }
  }, [dashboardData.quickActions]);
  
  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<DashboardConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);
  
  // Auto-refresh based on config
  useEffect(() => {
    if (config.enableRealTimeUpdates && config.refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshDashboard();
      }, config.refreshInterval * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [config.enableRealTimeUpdates, config.refreshInterval, refreshDashboard]);
  
  // Initial data load
  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);
  
  return {
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
    config,
    updateConfig
  };
};
