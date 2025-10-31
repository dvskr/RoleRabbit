'use client';

import React from 'react';
import { Mail, Send, FileText, Users, BarChart3 } from 'lucide-react';
import { EmailTabsProps } from './types/email';
import { useTheme } from '../../contexts/ThemeContext';

export default function EmailTabs({ activeTab, onTabChange }: EmailTabsProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const tabs = [
    { id: 'inbox', label: 'Inbox', icon: Mail },
    { id: 'compose', label: 'Compose', icon: Send },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'campaigns', label: 'Campaigns', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ] as const;

  return (
    <div className="flex items-center gap-1 mb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: activeTab === tab.id ? `${colors.primaryBlue}20` : 'transparent',
              color: activeTab === tab.id ? colors.activeBlueText : colors.secondaryText,
              border: activeTab === tab.id ? `1px solid ${colors.primaryBlue}40` : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = colors.hoverBackground;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <Icon size={14} className="inline mr-1" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
