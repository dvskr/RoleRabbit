/**
 * Custom hook for handling dashboard tab changes
 */

import { useCallback } from 'react';
import type { DashboardTab } from '../constants/dashboard.constants';
import { mapTabName } from '../utils/dashboardHandlers';

export interface UseDashboardTabChangeReturn {
  handleTabChange: (tab: string) => void;
}

/**
 * Hook for handling tab changes with legacy name mapping
 */
export function useDashboardTabChange(
  setActiveTab: (tab: DashboardTab) => void
): UseDashboardTabChangeReturn {
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(mapTabName(tab));
  }, [setActiveTab]);

  return {
    handleTabChange,
  };
}

