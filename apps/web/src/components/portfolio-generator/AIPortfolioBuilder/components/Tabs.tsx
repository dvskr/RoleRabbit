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
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
            activeTab === tab.id ? 'text-white' : ''
          }`}
          style={{
            background: activeTab === tab.id
              ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.activeBlueText})`
              : 'transparent',
            color: activeTab === tab.id ? 'white' : colors.secondaryText,
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

