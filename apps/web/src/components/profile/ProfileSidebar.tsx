'use client';

import React from 'react';
import { ProfileSidebarProps } from './types/profile';
import { useTheme } from '../../contexts/ThemeContext';
import NavigationItem from '../layout/NavigationItem';

export default function ProfileSidebar({
  activeTab,
  tabs,
  onTabChange
}: ProfileSidebarProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  // Profile sidebar uses blue accent color (similar to Prepare section)
  const profileAccentColor = '#3b82f6'; // Blue

  return (
    <div 
      className="w-72 backdrop-blur-sm flex-shrink-0 shadow-lg flex flex-col"
      style={{
        background: colors.sidebarBackground,
        borderRight: `1px solid ${colors.border}`,
      }}
    >
      <nav className="flex-1 overflow-y-auto p-6 pb-8">
        <ul className="space-y-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <NavigationItem
                  id={tab.id}
                  icon={Icon}
                  label={tab.label}
                  isActive={isActive}
                  isCollapsed={false}
                  sectionColor={profileAccentColor}
                  onClick={() => onTabChange(tab.id)}
                  colors={colors}
                />
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
