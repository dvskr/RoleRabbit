import { useState, useCallback } from 'react';

export function useSidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [previousSidebarState, setPreviousSidebarState] = useState(false);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    // Collapse sidebar only when Resume Editor is selected
    setSidebarCollapsed(tab === 'editor');
  }, []);

  const toggleSidebar = useCallback(() => {
    setPreviousSidebarState(sidebarCollapsed);
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed]);

  const restoreSidebarState = useCallback(() => {
    setSidebarCollapsed(previousSidebarState);
  }, [previousSidebarState]);

  return {
    sidebarCollapsed,
    activeTab,
    previousSidebarState,
    handleTabChange,
    toggleSidebar,
    restoreSidebarState,
    setSidebarCollapsed,
    setActiveTab
  };
}
