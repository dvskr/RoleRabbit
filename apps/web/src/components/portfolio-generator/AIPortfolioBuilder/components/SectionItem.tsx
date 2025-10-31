import React from 'react';
import { GripVertical, Eye, EyeOff, Settings, X } from 'lucide-react';
import type { PortfolioSection, ThemeColors } from '../types/aiPortfolioBuilder';

interface SectionItemProps {
  section: PortfolioSection;
  onToggleVisibility: () => void;
  onDelete: () => void;
  colors: ThemeColors;
}

export function SectionItem({ section, onToggleVisibility, onDelete, colors }: SectionItemProps) {
  return (
    <div
      className="flex items-center gap-2 p-3 rounded-lg"
      style={{
        background: colors.inputBackground,
      }}
    >
      <GripVertical 
        size={16} 
        style={{ 
          color: colors.tertiaryText,
          cursor: 'grab'
        }}
      />
      <span 
        className="flex-1 text-sm font-medium"
        style={{ color: colors.primaryText }}
      >
        {section.name}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleVisibility}
          className="p-1.5 rounded hover:bg-opacity-10 transition-colors"
          style={{
            color: section.visible ? colors.activeBlueText : colors.tertiaryText,
          }}
          title={section.visible ? 'Hide section' : 'Show section'}
        >
          {section.visible ? (
            <Eye size={16} />
          ) : (
            <EyeOff size={16} />
          )}
        </button>
        <button
          className="p-1.5 rounded hover:bg-opacity-10 transition-colors"
          style={{
            color: colors.tertiaryText,
          }}
          title="Settings"
        >
          <Settings size={16} />
        </button>
        {!section.required && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-opacity-10 transition-colors"
            style={{
              color: colors.errorRed,
            }}
            title="Delete"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

