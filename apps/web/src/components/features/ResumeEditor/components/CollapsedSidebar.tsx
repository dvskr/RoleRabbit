'use client';

import React from 'react';
import { PanelLeftOpen, FileText, Layers, Palette } from 'lucide-react';
import { ThemeColors } from '../../../contexts/ThemeContext';

interface CollapsedSidebarProps {
  colors: ThemeColors;
  onToggleSidebar?: () => void;
}

export default function CollapsedSidebar({ colors, onToggleSidebar }: CollapsedSidebarProps) {
  return (
    <div className="flex flex-col gap-2">
      <button 
        className="p-2 border rounded-lg transition-all" 
        title="Expand sidebar"
        onClick={onToggleSidebar}
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 2px 4px ${colors.border}20`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <PanelLeftOpen size={16} className="mx-auto" style={{ color: colors.primaryBlue }} />
      </button>
      <button 
        className="p-2 border rounded-lg transition-all" 
        title="Sections"
        onClick={onToggleSidebar}
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 2px 4px ${colors.border}20`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Layers size={16} className="mx-auto" style={{ color: colors.badgePurpleText }} />
      </button>
      <button 
        className="p-2 border rounded-lg transition-all" 
        title="Formatting"
        onClick={onToggleSidebar}
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 2px 4px ${colors.border}20`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Palette size={16} className="mx-auto" style={{ color: colors.badgePurpleText }} />
      </button>
    </div>
  );
}

