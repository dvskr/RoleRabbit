/**
 * Custom hook for managing dashboard UI state
 */

import { useState, useEffect } from 'react';
import {
  DEFAULT_TAB,
  DEFAULT_SIDEBAR_STATE,
  DEFAULT_PANEL_STATE,
  DEFAULT_PREVIEW_MODE,
  type DashboardTab,
} from '../constants/dashboard.constants';

export interface UseDashboardUIReturn {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  resumePanelCollapsed: boolean;
  setResumePanelCollapsed: (collapsed: boolean) => void;
  showRightPanel: boolean;
  setShowRightPanel: (show: boolean) => void;
  previousSidebarState: boolean;
  setPreviousSidebarState: (state: boolean) => void;
  previousMainSidebarState: boolean;
  setPreviousMainSidebarState: (state: boolean) => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (mode: boolean) => void;
}

/**
 * Hook for managing dashboard UI state including tabs, sidebars, and panels
 */
export function useDashboardUI(): UseDashboardUIReturn {
  const [activeTab, setActiveTab] = useState<DashboardTab>(DEFAULT_TAB);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(DEFAULT_SIDEBAR_STATE);
  const [resumePanelCollapsed, setResumePanelCollapsed] = useState(DEFAULT_PANEL_STATE);
  const [showRightPanel, setShowRightPanel] = useState(DEFAULT_PANEL_STATE);
  const [previousSidebarState, setPreviousSidebarState] = useState(DEFAULT_SIDEBAR_STATE);
  const [previousMainSidebarState, setPreviousMainSidebarState] = useState(DEFAULT_SIDEBAR_STATE);
  const [isPreviewMode, setIsPreviewMode] = useState(DEFAULT_PREVIEW_MODE);

  // Restore sidebar when leaving editor with AI panel open
  useEffect(() => {
    if (activeTab !== 'editor' && showRightPanel && previousMainSidebarState !== undefined) {
      // When navigating away from editor with AI panel open, restore the main sidebar
      setSidebarCollapsed(previousMainSidebarState);
    }
  }, [activeTab, showRightPanel, previousMainSidebarState]);

  return {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    resumePanelCollapsed,
    setResumePanelCollapsed,
    showRightPanel,
    setShowRightPanel,
    previousSidebarState,
    setPreviousSidebarState,
    previousMainSidebarState,
    setPreviousMainSidebarState,
    isPreviewMode,
    setIsPreviewMode,
  };
}

