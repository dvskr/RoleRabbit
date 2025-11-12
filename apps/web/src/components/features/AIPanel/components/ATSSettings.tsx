import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { TONE_ICON_MAP, TONE_LABEL_MAP, LENGTH_COMPACT_OPTIONS } from '../constants';

interface ATSSettingsColors {
  cardBackground: string;
  border: string;
  primaryText: string;
  inputBackground: string;
  badgePurpleBg: string;
  badgePurpleBorder: string;
  badgePurpleText: string;
  secondaryText: string;
}

interface ATSSettingsProps {
  colors: ATSSettingsColors;
  tailorEditMode: string;
  setTailorEditMode: (mode: string) => void;
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  selectedLength: string;
  setSelectedLength: (length: string) => void;
  onResetPreferences?: () => void;
}

export default function ATSSettings({
  colors,
  tailorEditMode,
  setTailorEditMode,
  selectedTone,
  setSelectedTone,
  selectedLength,
  setSelectedLength,
  onResetPreferences
}: ATSSettingsProps) {
  const [showAISettings, setShowAISettings] = useState(false);

  return (
    <div 
      className="rounded-xl border overflow-hidden transition-all"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 2px 8px ${colors.border}20`,
      }}
    >
      <button
        onClick={() => setShowAISettings(!showAISettings)}
        className="w-full flex items-center justify-between p-3 transition-all hover:bg-opacity-50"
        style={{
          background: showAISettings ? `${colors.inputBackground}80` : 'transparent',
        }}
      >
        <div className="flex items-center gap-2">
          <Settings 
            size={16} 
            style={{ 
              color: colors.primaryText,
              transform: showAISettings ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }} 
          />
          <span className="text-sm font-medium" style={{ color: colors.primaryText }}>
            AI Settings
          </span>
        </div>
        <div 
          style={{
            transform: showAISettings ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: colors.secondaryText,
            fontSize: '10px'
          }}
        >
          ▼
        </div>
      </button>
      
      {showAISettings && (
        <div className="px-3 pb-3 space-y-3 border-t" style={{ borderColor: colors.border }}>
          <div className="space-y-3 pt-3">
            <div>
              <p className="block text-xs font-medium mb-1.5" style={{ color: colors.secondaryText }}>
                Tailoring Mode
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setTailorEditMode('partial')}
                  className="w-full p-2.5 rounded-lg text-left transition-all"
                  style={{
                    background: tailorEditMode === 'partial' ? colors.badgePurpleBg : colors.inputBackground,
                    border: `1px solid ${tailorEditMode === 'partial' ? colors.badgePurpleBorder : colors.border}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ 
                      color: tailorEditMode === 'partial' ? colors.badgePurpleText : colors.primaryText 
                    }}>
                      ⚡ Quick Enhancement
                    </span>
                    {tailorEditMode === 'partial' && (
                      <span style={{ color: colors.badgePurpleText, fontSize: '10px' }}>✓</span>
                    )}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.8, color: colors.secondaryText, lineHeight: '1.3' }}>
                    ~15 seconds · Keyword optimization
                  </div>
                  <div style={{ fontSize: '9px', opacity: 0.7, color: colors.secondaryText, marginTop: '4px' }}>
                    Best for: Multiple applications, quick adjustments
                  </div>
                </button>
                
                <button
                  onClick={() => setTailorEditMode('full')}
                  className="w-full p-2.5 rounded-lg text-left transition-all"
                  style={{
                    background: tailorEditMode === 'full' ? colors.badgePurpleBg : colors.inputBackground,
                    border: `1px solid ${tailorEditMode === 'full' ? colors.badgePurpleBorder : colors.border}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ 
                      color: tailorEditMode === 'full' ? colors.badgePurpleText : colors.primaryText 
                    }}>
                      🚀 Complete Rewrite
                    </span>
                    {tailorEditMode === 'full' && (
                      <span style={{ color: colors.badgePurpleText, fontSize: '10px' }}>✓</span>
                    )}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.8, color: colors.secondaryText, lineHeight: '1.3' }}>
                    ~30 seconds · Comprehensive overhaul
                  </div>
                  <div style={{ fontSize: '9px', opacity: 0.7, color: colors.secondaryText, marginTop: '4px' }}>
                    Best for: Dream jobs, career pivots, weak resumes
                  </div>
                </button>
              </div>
            </div>

            <div>
              <p className="block text-xs font-medium mb-1.5" style={{ color: colors.secondaryText }}>
                Writing Tone
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(TONE_ICON_MAP).map((toneId) => (
                  <button
                    key={toneId}
                    onClick={() => setSelectedTone(toneId)}
                    className="px-2.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1"
                    style={{
                      background: selectedTone === toneId ? colors.badgePurpleBg : colors.inputBackground,
                      border: selectedTone === toneId ? `1px solid ${colors.badgePurpleBorder}` : `1px solid ${colors.border}`,
                    }}
                  >
                    <span>{TONE_ICON_MAP[toneId]}</span>
                    <span>{TONE_LABEL_MAP[toneId]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="block text-xs font-medium mb-1.5" style={{ color: colors.secondaryText }}>
              Length
            </p>
            <div className="flex rounded-lg p-1" style={{ background: colors.inputBackground }}>
              {LENGTH_COMPACT_OPTIONS.map((length) => (
                <button
                  key={length.id}
                  onClick={() => setSelectedLength(length.id)}
                  className="flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all"
                  style={{
                    background: selectedLength === length.id ? colors.badgePurpleBg : 'transparent',
                    color: selectedLength === length.id ? colors.badgePurpleText : colors.secondaryText,
                    border: selectedLength === length.id ? `1px solid ${colors.badgePurpleBorder}` : 'none',
                  }}
                >
                  <div className="text-center">
                    <div className="font-medium">{length.label}</div>
                    <div style={{ fontSize: '9px', opacity: 0.75 }}>{length.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reset to Defaults Button */}
          {onResetPreferences && (
            <div className="pt-2 border-t" style={{ borderColor: colors.border }}>
              <button
                onClick={onResetPreferences}
                className="w-full py-2 px-3 rounded-md text-xs font-medium transition-all hover:opacity-80"
                style={{
                  background: 'transparent',
                  color: colors.secondaryText,
                  border: `1px dashed ${colors.border}`,
                }}
              >
                🔄 Reset to Defaults
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

