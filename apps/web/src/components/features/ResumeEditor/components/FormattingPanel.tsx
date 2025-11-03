'use client';

import React from 'react';
import { Type, Palette } from 'lucide-react';
import { ThemeColors } from '../../../../contexts/ThemeContext';
import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  LINE_SPACING_OPTIONS,
  SECTION_SPACING_OPTIONS,
  MARGIN_OPTIONS,
  HEADING_STYLE_OPTIONS,
  BULLET_STYLE_OPTIONS,
} from '../constants';

interface FormattingPanelProps {
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  lineSpacing: string;
  setLineSpacing: (spacing: string) => void;
  sectionSpacing: string;
  setSectionSpacing: (spacing: string) => void;
  margins: string;
  setMargins: (margins: string) => void;
  headingStyle: string;
  setHeadingStyle: (style: string) => void;
  bulletStyle: string;
  setBulletStyle: (style: string) => void;
  onResetToDefault: () => void;
  colors: ThemeColors;
}

export default function FormattingPanel({
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  lineSpacing,
  setLineSpacing,
  sectionSpacing,
  setSectionSpacing,
  margins,
  setMargins,
  headingStyle,
  setHeadingStyle,
  bulletStyle,
  setBulletStyle,
  onResetToDefault,
  colors,
}: FormattingPanelProps) {
  return (
    <div className="mb-6 flex-1 min-h-0 overflow-y-auto">
      <h3 className="font-bold flex items-center gap-2 text-base mb-4" style={{ color: colors.primaryText }}>
        <Palette size={18} style={{ color: colors.badgePurpleText }} />
        Formatting
      </h3>

      {/* Font Family */}
      <div className="mb-4">
        <h4 className="font-semibold flex items-center gap-2 text-sm mb-2" style={{ color: colors.secondaryText }}>
          <Type size={14} style={{ color: colors.tertiaryText }} />
          FONT FAMILY
        </h4>
        <select 
          value={fontFamily} 
          onChange={(e) => setFontFamily(e.target.value)} 
          className="w-full px-3 py-2 text-sm border-2 rounded-lg transition-all"
          aria-label="Font family"
          title="Font family"
          style={{
            background: colors.inputBackground,
            border: `2px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = colors.badgePurpleText;
            e.target.style.outline = `2px solid ${colors.badgePurpleText}40`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = colors.border;
            e.target.style.outline = 'none';
          }}
        >
          {FONT_FAMILY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2" style={{ color: colors.secondaryText }}>FONT SIZE</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FONT_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setFontSize(option.value)}
              className="p-3 rounded-lg text-sm font-medium transition-all"
              style={{
                background: fontSize === option.value 
                  ? colors.badgeInfoBg
                  : colors.inputBackground,
                color: fontSize === option.value ? colors.badgeInfoText : colors.primaryText,
                border: fontSize === option.value ? `1px solid ${colors.badgeInfoBorder}` : `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                if (fontSize !== option.value) {
                  e.currentTarget.style.background = colors.hoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                if (fontSize !== option.value) {
                  e.currentTarget.style.background = colors.inputBackground;
                }
              }}
            >
              <div className="flex items-center justify-center gap-1">
                <span>{option.label}</span>
                <div className="w-2 h-2 rounded-full" style={{ background: colors.successGreen }}></div>
              </div>
              <div className="text-xs mt-1">{option.badge}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Line Spacing */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2" style={{ color: colors.secondaryText }}>LINE SPACING</h4>
        <select 
          value={lineSpacing} 
          onChange={(e) => setLineSpacing(e.target.value)} 
          className="w-full px-3 py-2 text-sm border-2 rounded-lg transition-all"
          aria-label="Line spacing"
          title="Line spacing"
          style={{
            background: colors.inputBackground,
            border: `2px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = colors.badgePurpleText;
            e.target.style.outline = `2px solid ${colors.badgePurpleText}40`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = colors.border;
            e.target.style.outline = 'none';
          }}
        >
          {LINE_SPACING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Section Spacing */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2" style={{ color: colors.secondaryText }}>SECTION SPACING</h4>
        <div className="flex gap-2">
          {SECTION_SPACING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSectionSpacing(option.value)}
              className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
              style={{
                background: sectionSpacing === option.value 
                  ? colors.badgeInfoBg
                  : colors.inputBackground,
                color: sectionSpacing === option.value ? colors.badgeInfoText : colors.primaryText,
                border: sectionSpacing === option.value ? `1px solid ${colors.badgeInfoBorder}` : `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                if (sectionSpacing !== option.value) {
                  e.currentTarget.style.background = colors.hoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                if (sectionSpacing !== option.value) {
                  e.currentTarget.style.background = colors.inputBackground;
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page Margins */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2" style={{ color: colors.secondaryText }}>PAGE MARGINS</h4>
        <div className="flex gap-2">
          {MARGIN_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setMargins(option.value)}
              className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
              style={{
                background: margins === option.value 
                  ? colors.badgeInfoBg
                  : colors.inputBackground,
                color: margins === option.value ? colors.badgeInfoText : colors.primaryText,
                border: margins === option.value ? `1px solid ${colors.badgeInfoBorder}` : `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                if (margins !== option.value) {
                  e.currentTarget.style.background = colors.hoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                if (margins !== option.value) {
                  e.currentTarget.style.background = colors.inputBackground;
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Heading Weight */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2" style={{ color: colors.secondaryText }}>HEADING WEIGHT</h4>
        <select 
          value={headingStyle} 
          onChange={(e) => setHeadingStyle(e.target.value)} 
          className="w-full px-3 py-2 text-sm border-2 rounded-lg transition-all"
          aria-label="Heading weight"
          title="Heading weight"
          style={{
            background: colors.inputBackground,
            border: `2px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = colors.badgePurpleText;
            e.target.style.outline = `2px solid ${colors.badgePurpleText}40`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = colors.border;
            e.target.style.outline = 'none';
          }}
        >
          {HEADING_STYLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Bullet Style */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2" style={{ color: colors.secondaryText }}>BULLET STYLE</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {BULLET_STYLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setBulletStyle(option.value)}
              className="p-3 rounded-lg text-sm font-medium transition-all"
              style={{
                background: bulletStyle === option.value 
                  ? colors.badgePurpleBg
                  : colors.inputBackground,
                color: bulletStyle === option.value ? colors.badgePurpleText : colors.primaryText,
                border: bulletStyle === option.value ? `1px solid ${colors.badgePurpleBorder}` : `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                if (bulletStyle !== option.value) {
                  e.currentTarget.style.background = colors.hoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                if (bulletStyle !== option.value) {
                  e.currentTarget.style.background = colors.inputBackground;
                }
              }}
            >
              <div className="text-lg">{option.symbol}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Reset to Default */}
      <button
        onClick={onResetToDefault}
        className="w-full py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
        style={{
          background: colors.inputBackground,
          border: `1px solid ${colors.border}`,
          color: colors.secondaryText,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.hoverBackground;
          e.currentTarget.style.borderColor = colors.borderFocused;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.inputBackground;
          e.currentTarget.style.borderColor = colors.border;
        }}
      >
        <div className="w-4 h-4 border-2 rounded-full flex items-center justify-center" style={{ borderColor: colors.tertiaryText }}>
          <div className="w-2 h-2 rounded-full" style={{ background: colors.tertiaryText }}></div>
        </div>
        Reset to Default
      </button>
    </div>
  );
}

