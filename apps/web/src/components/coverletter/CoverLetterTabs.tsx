'use client';

import React from 'react';
import { FileText, Sparkles, Edit3 } from 'lucide-react';
import { CoverLetterTabsProps } from './types/coverletter';
import { useTheme } from '../../contexts/ThemeContext';

export default function CoverLetterTabs({ activeTab, onTabChange }: CoverLetterTabsProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const tabs = [
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'ai', label: 'AI Generator', icon: Sparkles },
    { id: 'custom', label: 'My Letters', icon: Edit3 }
  ] as const;

  return (
    <div className="flex items-center gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative"
            style={{
              color: isActive ? colors.primaryText : colors.secondaryText,
              fontWeight: isActive ? 600 : 500,
            }}
          >
            <Icon size={16} />
            {tab.label}
            {isActive && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: colors.primaryBlue }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
