'use client';

import React from 'react';
import { Eye, Sparkles, GripVertical } from 'lucide-react';
import { ResumeData } from '../../types/resume';
import { useTheme } from '../../contexts/ThemeContext';

interface SummarySectionProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  sectionVisibility: { [key: string]: boolean };
  onHideSection: (section: string) => void;
  onOpenAIGenerateModal: (section: string) => void;
}

export default function SummarySection({
  resumeData,
  setResumeData,
  sectionVisibility,
  onHideSection,
  onOpenAIGenerateModal
}: SummarySectionProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div className="mb-8 p-1 sm:p-2 lg:p-4" style={{ contentVisibility: 'auto' }}>
      <div 
        className="rounded-2xl p-6 transition-all"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 4px 6px ${colors.border}10`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 8px 12px ${colors.border}20`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 4px 6px ${colors.border}10`;
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <GripVertical size={18} className="cursor-move" style={{ color: colors.tertiaryText }} />
            <h3 className="text-lg font-bold uppercase tracking-wide" style={{ color: colors.primaryText }}>
              SUMMARY
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onHideSection('summary')}
              className="p-2 rounded-xl transition-colors"
              style={{ color: colors.tertiaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackground;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title={sectionVisibility.summary ? "Hide summary section" : "Show summary section"}
            >
              <Eye size={18} style={{ color: sectionVisibility.summary ? colors.secondaryText : colors.tertiaryText }} />
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <textarea
            className="w-full text-sm rounded-xl p-2 sm:p-4 outline-none resize-none break-words overflow-wrap-anywhere transition-all"
            rows={4}
            value={resumeData.summary}
            onChange={(e) => setResumeData((prev: any) => ({...prev, summary: (e.target as HTMLTextAreaElement).value}))}
            placeholder="Write a compelling professional summary..."
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
          <div className="flex justify-end">
            <button 
              onClick={() => onOpenAIGenerateModal('summary')}
              className="text-sm flex items-center gap-2 font-semibold px-3 py-2 rounded-lg transition-colors"
              style={{
                color: colors.badgePurpleText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.badgePurpleBg;
                e.currentTarget.style.color = colors.badgePurpleText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = colors.badgePurpleText;
              }}
            >
              <Sparkles size={16} />
              AI Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
