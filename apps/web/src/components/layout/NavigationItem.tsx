'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface NavigationItemProps {
  id: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  sectionColor: string;
  onClick: () => void;
  colors?: Record<string, string>;
}

export default function NavigationItem({
  id: _id,
  icon: Icon,
  label,
  isActive,
  isCollapsed,
  sectionColor,
  onClick,
  colors,
}: NavigationItemProps) {
  const { theme } = useTheme();
  const isLightTheme = theme.mode === 'light';
  
  // Determine text color based on theme and active state
  // In light theme, active items should use section color for better visibility
  // In dark theme, active items can use white
  const activeTextColor = isLightTheme 
    ? (sectionColor || colors?.primaryText || '#111827') 
    : '#ffffff';
  
  const inactiveTextColor = colors?.secondaryText || (isLightTheme ? '#4b5563' : '#9ca3af');
  
  // Background color for active state - use section color with low opacity in light theme
  // This creates a subtle tint that works with the colored text
  let activeBackground = 'rgba(255, 255, 255, 0.08)'; // Default for dark theme
  
  if (isLightTheme) {
    // For light theme, use a subtle background based on section color
    // Extract RGB from common section colors or use a neutral gray
    if (sectionColor === '#a855f7') { // WORKSPACE - purple
      activeBackground = 'rgba(168, 85, 247, 0.15)';
    } else if (sectionColor === '#3b82f6') { // Blue (PREPARE)
      activeBackground = 'rgba(59, 130, 246, 0.1)';
    } else if (sectionColor === '#14b8a6') { // Teal (APPLY)
      activeBackground = 'rgba(20, 184, 166, 0.1)';
    } else if (sectionColor === '#8b5cf6') { // CONNECT - purple
      activeBackground = 'rgba(139, 92, 246, 0.15)';
    } else {
      // Default to a subtle gray background
      activeBackground = 'rgba(107, 114, 128, 0.08)';
    }
  }
  
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`nav-item w-full flex items-center rounded-lg relative overflow-hidden ${
        isCollapsed ? 'justify-center px-3 py-2.5' : 'gap-3 px-3 py-2.5'
      } ${isActive ? 'nav-item-active' : ''}`}
      data-section-color={sectionColor}
      style={{
        background: isActive ? activeBackground : 'transparent',
      }}
      title={isCollapsed ? label : ''}
    >
      {/* Content Container */}
      <div
        className="nav-item-content flex items-center gap-3 flex-1"
        style={{
          transform: 'translateX(0)',
        }}
      >
        {/* Icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon 
            size={18} 
            style={{ 
              color: isActive ? activeTextColor : inactiveTextColor,
            }} 
          />
        </div>
        
        {/* Label */}
        {!isCollapsed && (
          <span
            className="text-sm font-medium flex-1 text-left"
            style={{
              color: isActive ? activeTextColor : inactiveTextColor,
            }}
          >
            {label}
          </span>
        )}
      </div>
    </button>
  );
}
