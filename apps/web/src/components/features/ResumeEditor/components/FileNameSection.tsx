'use client';

import React from 'react';
import { FileText, Sparkles, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { ThemeColors } from '../../../contexts/ThemeContext';

interface FileNameSectionProps {
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  onGenerateSmartFileName: () => string;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  colors: ThemeColors;
}

export default function FileNameSection({
  resumeFileName,
  setResumeFileName,
  onGenerateSmartFileName,
  colors,
  isSidebarCollapsed,
  onToggleSidebar
}: FileNameSectionProps) {
  return (
    <div className="mb-6 flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold flex items-center gap-2 text-sm" style={{ color: colors.primaryText }}>
          <FileText size={16} style={{ color: colors.primaryBlue }} />
          File Name
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setResumeFileName(onGenerateSmartFileName())}
            className="p-1.5 rounded-lg transition-all"
            style={{
              background: colors.badgePurpleBg,
              border: `1px solid ${colors.badgePurpleBorder}`,
              color: colors.badgePurpleText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.badgePurpleBorder;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.badgePurpleBg;
            }}
            title="Generate Smart Filename"
          >
            <Sparkles size={12} />
          </button>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg transition-all flex items-center justify-center"
              style={{
                background: colors.cardBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryBlue,
              }}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 2px 6px ${colors.primaryBlue}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            </button>
          )}
        </div>
      </div>
      <input
        type="text"
        value={resumeFileName}
        onChange={(e) => setResumeFileName(e.target.value)}
        placeholder="Enter filename..."
        className="w-full px-3 py-2 text-sm rounded-lg transition-all"
        style={{
          background: colors.inputBackground,
          border: `2px solid ${colors.border}`,
          color: colors.primaryText,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = colors.primaryBlue;
          e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = colors.border;
          e.target.style.outline = 'none';
        }}
      />
      <p className="text-xs mt-1" style={{ color: colors.tertiaryText }}>
        💡 AI generates: Name_Title_YYYY-MM format
      </p>
    </div>
  );
}

