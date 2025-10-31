'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavigationItemProps {
  id: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  sectionColor: string;
  onClick: () => void;
  colors?: any;
}

export default function NavigationItem({
  id,
  icon: Icon,
  label,
  isActive,
  isCollapsed,
  sectionColor,
  onClick,
  colors,
}: NavigationItemProps) {
  return (
    <button
      onClick={onClick}
      className={`nav-item w-full flex items-center rounded-lg relative overflow-hidden ${
        isCollapsed ? 'justify-center px-3 py-2.5' : 'gap-3 px-3 py-2.5'
      } ${isActive ? 'nav-item-active' : ''}`}
      data-section-color={sectionColor}
      style={{
        background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
      }}
      title={isCollapsed ? label : ''}
    >
      {/* Accent Bar */}
      <div
        className="nav-item-accent"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '1px',
          background: sectionColor,
          borderRadius: '0 2px 2px 0',
          transform: isActive ? 'scaleY(1)' : 'scaleY(0)',
          transformOrigin: 'center',
        }}
      />
      
      {/* Content Container */}
      <div
        className="nav-item-content flex items-center gap-3 flex-1"
        style={{
          transform: isActive ? 'translateX(8px)' : 'translateX(0)',
        }}
      >
        {/* Icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon 
            size={18} 
            style={{ 
              color: isActive ? '#ffffff' : colors?.secondaryText || 'inherit',
            }} 
          />
        </div>
        
        {/* Label */}
        {!isCollapsed && (
          <span
            className="text-sm font-medium flex-1 text-left"
            style={{
              color: isActive ? '#ffffff' : colors?.secondaryText || 'inherit',
            }}
          >
            {label}
          </span>
        )}
      </div>
    </button>
  );
}
