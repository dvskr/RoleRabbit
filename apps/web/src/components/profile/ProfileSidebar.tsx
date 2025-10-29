'use client';

import React from 'react';
import { ProfileSidebarProps } from './types/profile';
import { useTheme } from '../../contexts/ThemeContext';

export default function ProfileSidebar({
  activeTab,
  tabs,
  onTabChange
}: ProfileSidebarProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div 
      className="w-72 backdrop-blur-sm flex-shrink-0 shadow-lg flex flex-col"
      style={{
        background: colors.sidebarBackground,
        borderRight: `1px solid ${colors.border}`,
      }}
    >
      <nav className="flex-1 overflow-y-auto p-6 pb-8">
        <ul className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200"
                  style={{
                    background: isActive ? colors.badgeInfoBg : 'transparent',
                    color: isActive ? colors.badgeInfoText : colors.secondaryText,
                    border: `1px solid ${isActive ? colors.badgeInfoBorder : 'transparent'}`,
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = colors.hoverBackground;
                      e.currentTarget.style.color = colors.primaryText;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = colors.secondaryText;
                    }
                  }}
                >
                  <div 
                    className="p-1.5 rounded-lg flex-shrink-0"
                    style={{
                      background: isActive ? colors.badgeInfoBg : colors.inputBackground,
                      color: isActive ? colors.badgeInfoText : colors.tertiaryText,
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="font-medium text-sm truncate">{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
