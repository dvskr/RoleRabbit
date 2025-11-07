'use client';

import React, { useMemo } from 'react';
import { Eye, Sparkles, GripVertical, AlertCircle } from 'lucide-react';
import { ResumeData } from '../../types/resume';
import { useTheme } from '../../contexts/ThemeContext';
import { MAX_LENGTHS, validateMaxLength } from '../../utils/validation';

interface SummarySectionProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  sectionVisibility: { [key: string]: boolean };
  onHideSection: (section: string) => void;
  onOpenAIGenerateModal: (section: string) => void;
}

const SummarySection = React.memo(function SummarySection({
  resumeData,
  setResumeData,
  sectionVisibility,
  onHideSection,
  onOpenAIGenerateModal
}: SummarySectionProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  // Memoize character count calculations
  const characterInfo = useMemo(() => {
    const length = resumeData.summary?.length || 0;
    const isNearLimit = length > MAX_LENGTHS.SUMMARY * 0.9;
    const isOverLimit = length > MAX_LENGTHS.SUMMARY;
    const color = isOverLimit 
      ? colors.errorRed 
      : isNearLimit 
        ? colors.warningYellow || '#f59e0b'
        : colors.tertiaryText;
    return { length, isNearLimit, isOverLimit, color };
  }, [resumeData.summary, colors]);

  return (
    <div className="mb-4 p-1 sm:p-2 lg:p-4" style={{ contentVisibility: 'auto' }}>
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
        <div className="relative">
            <textarea
            className="w-full text-sm rounded-xl p-2 sm:p-4 outline-none resize-none break-words overflow-wrap-anywhere transition-all"
            rows={4}
            value={resumeData.summary}
            maxLength={MAX_LENGTHS.SUMMARY}
            aria-label="Professional summary"
            aria-describedby="summary-character-count"
            onChange={(e) => {
              const value = e.target.value;
              // Enforce max length
              if (value.length <= MAX_LENGTHS.SUMMARY) {
                setResumeData((prev: any) => ({...prev, summary: value}));
              }
            }}
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
              const validation = validateMaxLength(e.target.value, MAX_LENGTHS.SUMMARY);
              e.target.style.borderColor = !validation.isValid ? colors.errorRed : colors.border;
              e.target.style.outline = 'none';
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span 
              id="summary-character-count"
              className="text-xs"
              style={{ color: characterInfo.color }}
              aria-live="polite"
            >
              {characterInfo.length} / {MAX_LENGTHS.SUMMARY} characters
            </span>
            {resumeData.summary && characterInfo.isOverLimit && (
              <div className="flex items-center gap-1 text-xs" style={{ color: colors.tertiaryText }}>
                <AlertCircle size={12} />
                <span>Character limit reached</span>
              </div>
            )}
          </div>
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
  );
});

export default SummarySection;
