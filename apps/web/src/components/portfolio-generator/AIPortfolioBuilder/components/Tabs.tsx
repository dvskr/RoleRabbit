'use client';

import React from 'react';
import type { TabType, ThemeColors } from '../types/aiPortfolioBuilder';

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

  return (
    <div className="flex border-b" style={{ borderBottom: `1px solid ${colors.border}` }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="flex-1 px-4 py-3 text-sm font-medium transition-all"
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

