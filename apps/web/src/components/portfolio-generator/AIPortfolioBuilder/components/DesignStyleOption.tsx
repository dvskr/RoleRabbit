'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { DesignStyleConfig, DesignStyle, ThemeColors } from '../types/aiPortfolioBuilder';

interface DesignStyleOptionProps {
  style: DesignStyleConfig;
  isSelected: boolean;
  onSelect: (id: DesignStyle) => void;
  colors: ThemeColors;
}

export function DesignStyleOption({ style, isSelected, onSelect, colors }: DesignStyleOptionProps) {
  return (
    <button
      onClick={() => onSelect(style.id)}
      className="w-full p-4 rounded-lg text-left border-2 transition-all"
      style={{
        background: isSelected
          ? colors.badgePurpleBg
          : colors.inputBackground,
        borderColor: isSelected
          ? colors.badgePurpleBorder
          : colors.border,
        color: isSelected ? colors.badgePurpleText : colors.primaryText,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{style.label}</span>
            {isSelected && (
              <Check size={16} strokeWidth={2} style={{ color: colors.badgePurpleText }} />
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: isSelected ? colors.badgePurpleText : colors.tertiaryText }}>
            {style.description}
          </p>
        </div>
      </div>
      <p className="text-xs" style={{ color: isSelected ? colors.badgePurpleText : colors.tertiaryText }}>
            {style.features}
      </p>
    </button>
  );
}

