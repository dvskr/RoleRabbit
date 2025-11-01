'use client';

import React from 'react';
import { Eye, Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react';
import type { DeviceView, ThemeColors } from '../types/aiPortfolioBuilder';

interface PreviewPanelProps {
  deviceView: DeviceView;
  onDeviceViewChange: (view: DeviceView) => void;
  colors: ThemeColors;
}

export function PreviewPanel({ deviceView, onDeviceViewChange, colors }: PreviewPanelProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden" suppressHydrationWarning>
      {/* Preview Header */}
      <div 
        className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
        style={{
          background: colors.headerBackground,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center gap-2">
          <Eye size={18} strokeWidth={2} style={{ color: colors.activeBlueText }} />
          <span 
            className="text-sm font-medium"
            style={{ color: colors.primaryText }}
          >
            Live Preview
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Device View Buttons */}
          <div className="flex items-center gap-1">
            {(['desktop', 'tablet', 'mobile'] as DeviceView[]).map((device) => (
              <button
                key={device}
                onClick={() => onDeviceViewChange(device)}
                className="px-3 py-1.5 rounded text-xs font-medium transition-all"
                style={{
                  background: deviceView === device
                    ? colors.badgeInfoBg
                    : 'transparent',
                  color: deviceView === device ? colors.badgeInfoText : colors.secondaryText,
                  border: deviceView === device ? `1px solid ${colors.badgeInfoBorder}` : 'none',
                }}
                suppressHydrationWarning
              >
                {device === 'desktop' && <Monitor size={14} strokeWidth={2} style={{ color: deviceView === device ? colors.badgeInfoText : colors.secondaryText }} />}
                {device === 'tablet' && <Tablet size={14} strokeWidth={2} style={{ color: deviceView === device ? colors.badgeInfoText : colors.secondaryText }} />}
                {device === 'mobile' && <Smartphone size={14} strokeWidth={2} style={{ color: deviceView === device ? colors.badgeInfoText : colors.secondaryText }} />}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              window.open('/portfolio-preview', '_blank');
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackgroundStrong;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
            }}
          >
            <ExternalLink size={14} strokeWidth={2} style={{ color: colors.primaryText }} />
            Open in New Tab
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div 
        className="flex-1 flex items-center justify-center p-8"
        style={{
          background: colors.background === '#0f0a1e' ? '#1a1a1a' : '#f5f5f5',
        }}
      >
        <div 
          className="w-full h-full rounded-lg flex flex-col items-center justify-center"
          style={{
            background: colors.background === '#0f0a1e' ? '#2a2a2a' : 'white',
            border: `2px dashed ${colors.border}`,
          }}
        >
          <div 
            className="w-32 h-32 rounded-lg flex items-center justify-center mb-4"
            style={{
              background: colors.badgePurpleBg,
              border: `1px solid ${colors.badgePurpleBorder}`,
            }}
            suppressHydrationWarning
          >
            <Eye size={48} strokeWidth={2} style={{ color: colors.badgePurpleText }} />
          </div>
          <p 
            className="text-lg font-medium mb-2"
            style={{ color: colors.primaryText }}
          >
            Preview Area
          </p>
          <p 
            className="text-sm text-center max-w-md"
            style={{ color: colors.secondaryText }}
          >
            Your portfolio website will appear here once you start the setup process.
          </p>
        </div>
      </div>
    </div>
  );
}

