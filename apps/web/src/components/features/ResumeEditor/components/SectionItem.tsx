'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ThemeColors } from '../../../contexts/ThemeContext';

interface SectionItemProps {
  section: string;
  index: number;
  totalSections: number;
  isVisible: boolean;
  displayName: string;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  colors: ThemeColors;
}

function SectionItem({
  section,
  index,
  totalSections,
  isVisible,
  displayName,
  onToggle,
  onMoveUp,
  onMoveDown,
  colors,
}: SectionItemProps) {
  return (
    <div 
      key={section} 
      className="p-3 border rounded-lg flex items-center justify-between group transition-all duration-200"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 2px 4px ${colors.border}20`;
        e.currentTarget.style.borderColor = colors.borderFocused;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = colors.border;
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="p-1 rounded transition-colors"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {isVisible ? (
            <Eye size={16} style={{ color: colors.primaryBlue }} />
          ) : (
            <EyeOff size={16} style={{ color: colors.tertiaryText }} />
          )}
        </button>
        <span className="text-sm font-medium" style={{ color: colors.primaryText }}>
          {displayName.charAt(0).toUpperCase() + displayName.slice(1)}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {index > 0 && (
          <button 
            onClick={onMoveUp}
            className="p-1 rounded transition-colors"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.tertiaryText;
            }}
            title="Move Up"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
        {index < totalSections - 1 && (
          <button 
            onClick={onMoveDown}
            className="p-1 rounded transition-colors"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.tertiaryText;
            }}
            title="Move Down"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ✅ PERFORMANCE: Memoize to prevent unnecessary re-renders
export default React.memo(SectionItem, (prevProps, nextProps) => {
  return (
    prevProps.section === nextProps.section &&
    prevProps.index === nextProps.index &&
    prevProps.totalSections === nextProps.totalSections &&
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.displayName === nextProps.displayName
    // colors and callbacks are assumed stable
  );
});

