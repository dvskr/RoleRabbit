/**
 * AdvancedFilters - Advanced filter panel with difficulty, layout, color, and type filters
 */

import React from 'react';
import { DIFFICULTY_LEVELS, LAYOUT_TYPES, COLOR_SCHEMES } from '../constants';
import type { ThemeColors } from '../types';

interface AdvancedFiltersProps {
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  selectedLayout: string;
  setSelectedLayout: (layout: string) => void;
  selectedColorScheme: string;
  setSelectedColorScheme: (colorScheme: string) => void;
  showFreeOnly: boolean;
  setShowFreeOnly: (show: boolean) => void;
  showPremiumOnly: boolean;
  setShowPremiumOnly: (show: boolean) => void;
  colors: ThemeColors;
}

export default function AdvancedFilters({
  selectedDifficulty,
  setSelectedDifficulty,
  selectedLayout,
  setSelectedLayout,
  selectedColorScheme,
  setSelectedColorScheme,
  showFreeOnly,
  setShowFreeOnly,
  showPremiumOnly,
  setShowPremiumOnly,
  colors,
}: AdvancedFiltersProps) {
  return (
    <div className="mt-2 p-2 rounded-lg" style={{ background: colors.cardBackground }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: colors.secondaryText }}
          >
            Difficulty
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-2 py-1.5 rounded-md text-sm"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            aria-label="Filter by difficulty level"
            title="Difficulty level"
          >
            {DIFFICULTY_LEVELS.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: colors.secondaryText }}
          >
            Layout
          </label>
          <select
            value={selectedLayout}
            onChange={(e) => setSelectedLayout(e.target.value)}
            className="w-full px-2 py-1.5 rounded-md text-sm"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            aria-label="Filter by layout type"
            title="Layout type"
          >
            {LAYOUT_TYPES.map(layout => (
              <option key={layout.value} value={layout.value}>
                {layout.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: colors.secondaryText }}
          >
            Color
          </label>
          <select
            value={selectedColorScheme}
            onChange={(e) => setSelectedColorScheme(e.target.value)}
            className="w-full px-2 py-1.5 rounded-md text-sm"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            aria-label="Filter by color scheme"
            title="Color scheme"
          >
            {COLOR_SCHEMES.map(scheme => (
              <option key={scheme.value} value={scheme.value}>
                {scheme.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: colors.secondaryText }}
          >
            Type
          </label>
          <div className="space-y-1">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showFreeOnly}
                onChange={(e) => setShowFreeOnly(e.target.checked)}
                className="rounded"
                style={{ borderColor: colors.border }}
              />
              <span className="ml-1.5 text-xs" style={{ color: colors.secondaryText }}>
                Free Only
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showPremiumOnly}
                onChange={(e) => setShowPremiumOnly(e.target.checked)}
                className="rounded"
                style={{ borderColor: colors.border }}
              />
              <span className="ml-1.5 text-xs" style={{ color: colors.secondaryText }}>
                Premium Only
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

