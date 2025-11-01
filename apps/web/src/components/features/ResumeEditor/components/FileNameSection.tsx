'use client';

import React from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { ThemeColors } from '../../../contexts/ThemeContext';

interface FileNameSectionProps {
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  onGenerateSmartFileName: () => string;
  colors: ThemeColors;
}

export default function FileNameSection({
  resumeFileName,
  setResumeFileName,
  onGenerateSmartFileName,
  colors,
}: FileNameSectionProps) {
  return (
    <div className="mb-6 flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold flex items-center gap-2 text-sm" style={{ color: colors.primaryText }}>
          <FileText size={16} style={{ color: colors.primaryBlue }} />
          File Name
        </h3>
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

