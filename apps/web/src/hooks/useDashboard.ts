import { useState, useEffect, useCallback } from 'react';
import { DashboardData, DashboardConfig, UseDashboardReturn, DashboardTodo, DashboardAlert } from '../components/dashboard/types/dashboard';
import { DEFAULT_DASHBOARD_CONFIG } from '../components/dashboard/config/dashboardConfig';
import { generateRealisticMockData } from '../components/dashboard/data/mockData';

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
  
  // Refresh dashboard data
  const refreshDashboard = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      setTimeout(() => {
        setDashboardData(generateRealisticMockData());
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to refresh dashboard data');
      setIsLoading(false);
    }
  }, []);
  
  // Complete a todo
  const completeTodo = useCallback((todoId: string) => {
    setDashboardData(prev => ({
      ...prev,
      todos: prev.todos.map(todo => 
        todo.id === todoId 
          ? { ...todo, isCompleted: !todo.isCompleted }
          : todo
      )
    }));
  }, []);
  
  // Dismiss an alert
  const dismissAlert = useCallback((alertId: string) => {
    setDashboardData(prev => ({
      ...prev,
      alerts: prev.alerts.filter(alert => alert.id !== alertId)
    }));
  }, []);
  
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
