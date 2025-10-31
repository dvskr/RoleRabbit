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
      className={`w-full p-4 rounded-lg text-left border-2 transition-all ${
        isSelected ? 'border-purple-500' : ''
      }`}
      style={{
        background: isSelected
          ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.activeBlueText})`
          : colors.inputBackground,
        borderColor: isSelected
          ? colors.badgePurpleText
          : colors.border,
        color: isSelected ? 'white' : colors.primaryText,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{style.label}</span>
            {isSelected && (
              <Check size={16} className="text-white" />
            )}
          </div>
          <p className={`text-xs mt-1 ${isSelected ? 'text-white/80' : ''}`}>
            {style.description}
          </p>
        </div>
      </div>
      <p className={`text-xs ${isSelected ? 'text-white/70' : ''}`} style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : colors.tertiaryText }}>
        {style.features}
      </p>
    </button>
  );
}

