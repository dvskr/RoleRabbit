'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(true); // Collapsed by default
  
  // Profile sidebar uses blue accent color (similar to Prepare section)
  const profileAccentColor = '#3b82f6'; // Blue

  return (
    <div 
      className={`backdrop-blur-sm flex-shrink-0 shadow-lg flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
      style={{
        background: colors.sidebarBackground,
        borderRight: `1px solid ${colors.border}`,
      }}
    >
      <nav className={`flex-1 overflow-y-auto transition-all duration-300 ${
        isCollapsed ? 'p-2' : 'p-6'
      }`}>
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
                  isCollapsed={isCollapsed}
                  sectionColor={profileAccentColor}
                  onClick={() => onTabChange(tab.id)}
                  colors={colors}
                />
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle Button - Arrow Only */}
      <div className="flex justify-center p-1.5 border-t flex-shrink-0" style={{ borderColor: colors.border }}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded transition-all duration-200 flex items-center justify-center"
          style={{ 
            color: colors.secondaryText,
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.hoverBackground || colors.badgeInfoBg || 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.color = colors.primaryText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = colors.secondaryText;
          }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
