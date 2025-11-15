/**
 * Tabs Component for AI Portfolio Builder
 * Section 1.8 requirement #8: Keyboard navigation for tabs
 * - Arrow Left/Right to navigate between tabs
 * - Enter/Space to activate tab
 * - Home/End to jump to first/last tab
 */

'use client';

import React from 'react';
import type { TabType, ThemeColors } from '../types/aiPortfolioBuilder';
import { useKeyboardNavigation } from '../../../../hooks/useA11y';

interface TabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  colors: ThemeColors;
}

export function Tabs({ activeTab, onTabChange, colors }: TabsProps) {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'ai-chat', label: 'AI Chat' },
    { id: 'style', label: 'Style' },
    { id: 'sections', label: 'Sections' },
  ];

  // Keyboard navigation (Section 1.8 requirement #8)
  const { handleKeyDown, setCurrentIndex } = useKeyboardNavigation(
    tabs,
    (index) => {
      onTabChange(tabs[index].id);
    },
    {
      orientation: 'horizontal',
      initialIndex: tabs.findIndex(t => t.id === activeTab),
    }
  );

  // Update current index when active tab changes
  React.useEffect(() => {
    const index = tabs.findIndex(t => t.id === activeTab);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [activeTab, setCurrentIndex]);

  return (
    <div
      className="flex border-b"
      style={{ borderBottom: `1px solid ${colors.border}` }}
      role="tablist"
      aria-label="Portfolio builder sections"
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          className="flex-1 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          style={{
            background: activeTab === tab.id
              ? colors.badgeInfoBg
              : 'transparent',
            color: activeTab === tab.id ? colors.badgeInfoText : colors.secondaryText,
            borderBottom: activeTab === tab.id ? `2px solid ${colors.badgeInfoBorder}` : 'none',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

