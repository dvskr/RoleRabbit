import React from 'react';
import type { DesignStyle, ThemeColor, ThemeColors } from '../types/aiPortfolioBuilder';
import { DESIGN_STYLES, THEME_COLORS, FONTS } from '../constants/aiPortfolioBuilder';
import { DesignStyleOption } from './DesignStyleOption';

interface StylePanelProps {
  designStyle: DesignStyle;
  themeColor: string;
  typography: string;
  onDesignStyleChange: (style: DesignStyle) => void;
  onThemeColorChange: (color: string) => void;
  onTypographyChange: (font: string) => void;
  colors: ThemeColors;
}

export function StylePanel({
  designStyle,
  themeColor,
  typography,
  onDesignStyleChange,
  onThemeColorChange,
  onTypographyChange,
  colors
}: StylePanelProps) {
  return (
    <div className="space-y-6">
      {/* Design Style Options */}
      <div>
        <p 
          className="text-sm font-medium mb-3"
          style={{ color: colors.primaryText }}
        >
          Design Style
        </p>
        <div className="space-y-3">
          {DESIGN_STYLES.map((style) => (
            <DesignStyleOption
              key={style.id}
              style={style}
              isSelected={designStyle === style.id}
              onSelect={onDesignStyleChange}
              colors={colors}
            />
          ))}
        </div>
      </div>

      {/* Theme Colors */}
      <div>
        <p 
          className="text-sm font-medium mb-3"
          style={{ color: colors.primaryText }}
        >
          Theme Colors
        </p>
        <div className="grid grid-cols-4 gap-2">
          {THEME_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => onThemeColorChange(color.value)}
              className={`w-full h-12 rounded-lg border-2 transition-all ${
                themeColor === color.value ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{
                background: color.color,
                borderColor: themeColor === color.value ? color.color : colors.border,
                ringColor: themeColor === color.value ? color.color : 'transparent',
              }}
              title={color.name}
              aria-label={`Select ${color.name} theme color`}
            />
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <p 
          className="text-sm font-medium mb-3"
          style={{ color: colors.primaryText }}
        >
          Typography
        </p>
        <select
          value={typography}
          onChange={(e) => onTypographyChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg text-sm"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          aria-label="Select typography font"
        >
          {FONTS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

