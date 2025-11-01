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
import { mapTabName } from '../utils/dashboardHandlers';

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
const VALID_TABS: DashboardTab[] = [
  'dashboard',
  'profile',
  'storage',
  'editor',
  'templates',
  'jobs',
  'email',
  'discussion',
  'cover-letter',
  'portfolio',
  'learning',
  'ai-agents',
];

const normalizeTab = (tab?: string | null): DashboardTab | null => {
  if (!tab) return null;
  const normalized = mapTabName(tab);
  return VALID_TABS.includes(normalized) ? normalized : null;
};

const updateUrlTabParam = (tab: DashboardTab) => {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const currentTab = params.get('tab');
  if (currentTab === tab) return;

  params.set('tab', tab);
  const queryString = params.toString();
  const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
  window.history.replaceState(null, '', newUrl);
};

export function useDashboardUI(initialTab?: DashboardTab): UseDashboardUIReturn {
  const normalizedInitialTab = initialTab && VALID_TABS.includes(initialTab)
    ? initialTab
    : DEFAULT_TAB;

  const [activeTab, setActiveTab] = useState<DashboardTab>(normalizedInitialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(DEFAULT_SIDEBAR_STATE);
  const [resumePanelCollapsed, setResumePanelCollapsed] = useState(DEFAULT_PANEL_STATE);
  const [showRightPanel, setShowRightPanel] = useState(DEFAULT_PANEL_STATE);
  const [previousSidebarState, setPreviousSidebarState] = useState(DEFAULT_SIDEBAR_STATE);
  const [previousMainSidebarState, setPreviousMainSidebarState] = useState(DEFAULT_SIDEBAR_STATE);
  const [isPreviewMode, setIsPreviewMode] = useState(DEFAULT_PREVIEW_MODE);

  // Initialize tab from URL/localStorage after hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const tabFromUrl = normalizeTab(params.get('tab'));
    if (tabFromUrl) {
      setActiveTab((prev) => (prev === tabFromUrl ? prev : tabFromUrl));
      return;
    }

    try {
      const saved = window.localStorage.getItem('dashboard_activeTab');
      const savedTab = normalizeTab(saved);
      if (savedTab) {
        setActiveTab((prev) => (prev === savedTab ? prev : savedTab));
        updateUrlTabParam(savedTab);
      }
    } catch (error) {
      console.error('Error reading dashboard tab from localStorage:', error);
    }
  }, []);

  // Listen for browser navigation (back/forward)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = normalizeTab(params.get('tab'));
      if (tabFromUrl) {
        setActiveTab((prev) => (prev === tabFromUrl ? prev : tabFromUrl));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Persist activeTab to storage and cookie whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem('dashboard_activeTab', activeTab);
      document.cookie = `dashboardTab=${activeTab}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (error) {
      console.error('Error persisting dashboard tab state:', error);
    }

    updateUrlTabParam(activeTab);
  }, [activeTab]);

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

