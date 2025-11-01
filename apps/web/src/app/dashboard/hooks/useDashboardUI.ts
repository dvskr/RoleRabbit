/**
 * Custom hook for managing dashboard UI state
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  // Valid tab names for validation
  const validTabs: DashboardTab[] = ['dashboard', 'profile', 'storage', 'editor', 'templates', 'jobs', 'email', 'discussion', 'cover-letter', 'portfolio', 'learning', 'ai-agents'];

  const [activeTab, setActiveTab] = useState<DashboardTab>(DEFAULT_TAB);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(DEFAULT_SIDEBAR_STATE);
  const [resumePanelCollapsed, setResumePanelCollapsed] = useState(DEFAULT_PANEL_STATE);
  const [showRightPanel, setShowRightPanel] = useState(DEFAULT_PANEL_STATE);
  const [previousSidebarState, setPreviousSidebarState] = useState(DEFAULT_SIDEBAR_STATE);
  const [previousMainSidebarState, setPreviousMainSidebarState] = useState(DEFAULT_SIDEBAR_STATE);
  const [isPreviewMode, setIsPreviewMode] = useState(DEFAULT_PREVIEW_MODE);

  // Load tab from URL or localStorage on mount (after hydration)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // First priority: URL parameter
        const params = new URLSearchParams(window.location.search);
        const tabFromUrl = params.get('tab') as DashboardTab;
        if (tabFromUrl && validTabs.includes(tabFromUrl)) {
          setActiveTab(tabFromUrl);
          setIsInitialized(true);
          return;
        }
        
        // Second priority: localStorage
        const saved = localStorage.getItem('dashboard_activeTab');
        if (saved && validTabs.includes(saved as DashboardTab)) {
          setActiveTab(saved as DashboardTab);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error reading tab state:', error);
        setIsInitialized(true);
      }
    }
  }, []);

  // Persist activeTab to localStorage and URL when it changes (only after initial load)
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        // Save to localStorage
        localStorage.setItem('dashboard_activeTab', activeTab);
        
        // Update URL without page reload
        const params = new URLSearchParams(window.location.search);
        params.set('tab', activeTab);
        router.push(`/dashboard?${params.toString()}`, { scroll: false });
      } catch (error) {
        console.error('Error saving tab state:', error);
      }
    }
  }, [activeTab, router, isInitialized]);

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

