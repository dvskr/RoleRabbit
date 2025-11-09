'use client';

/* eslint-disable react/forbid-dom-props */
/* eslint-disable @next/next/no-inline-styles */
/* stylelint-disable */
// Inline styles are required for dynamic theming with ThemeContext
import React, { useMemo } from 'react';
import { Eye, Sparkles, GripVertical, X, Plus } from 'lucide-react';
import { ResumeData } from '../../types/resume';
import { useTheme } from '../../contexts/ThemeContext';

interface SkillsSectionProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  sectionVisibility: { [key: string]: boolean };
  onHideSection: (section: string) => void;
  onOpenAIGenerateModal: (section: string) => void;
}

const SkillsSection = React.memo(function SkillsSection({
  resumeData,
  setResumeData,
  sectionVisibility,
  onHideSection,
  onOpenAIGenerateModal
}: SkillsSectionProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  // Memoize skills array to prevent unnecessary re-renders
  const skills = useMemo(() => {
    return Array.isArray(resumeData.skills) ? resumeData.skills : [];
  }, [resumeData.skills]);

  return (
    <div className="mb-4 p-1 sm:p-2 lg:p-4" style={{ contentVisibility: 'auto' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GripVertical size={18} className="cursor-move" style={{ color: colors.tertiaryText }} />
          <h3 className="text-lg font-bold uppercase tracking-wide" style={{ color: colors.primaryText }}>
            SKILLS
          </h3>
        </div>
        <button
          onClick={() => onHideSection('skills')}
          className="p-2 rounded-xl transition-colors"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title={sectionVisibility.skills ? "Hide skills section" : "Show skills section"}
        >
          <Eye size={18} style={{ color: sectionVisibility.skills ? colors.secondaryText : colors.tertiaryText }} />
        </button>
      </div>
      
      {/* Skills Container */}
      <div 
        className="p-1 sm:p-2 lg:p-4 rounded-xl border-2 transition-all"
        style={{
          background: colors.inputBackground,
          border: `2px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: colors.secondaryText }}>Skills</h4>
        </div>
        
        <div className="flex flex-wrap gap-2 min-w-0 w-full">
          {skills.map((skill, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border group min-w-0 max-w-full flex-shrink-0 transition-all"
              style={{
                background: colors.cardBackground,
                border: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              <span className="text-xs font-medium break-words overflow-wrap-anywhere min-w-0" style={{ color: colors.primaryText }}>{skill}</span>
              <button
                onClick={() => {
                  const updatedSkills = skills.filter((_, index) => index !== idx);
                  setResumeData(prev => ({ ...prev, skills: updatedSkills }));
                }}
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"
                style={{ color: colors.errorRed }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.errorRed;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.errorRed;
                }}
                aria-label={`Remove skill ${skill}`}
                title={`Remove skill ${skill}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          
          {/* Inline skill input */}
          <div 
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 min-w-0 max-w-full flex-shrink-0"
            style={{
              background: colors.cardBackground,
              border: `2px solid ${colors.border}`,
            }}
          >
            <input
              type="text"
              placeholder="Enter skill..."
              className="text-xs font-medium bg-transparent border-none outline-none w-24 min-w-0 max-w-full break-words overflow-wrap-anywhere"
              style={{ color: colors.primaryText }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if ((e.target as HTMLInputElement).value.trim()) {
                    setResumeData(prev => ({ ...prev, skills: [...(Array.isArray(prev.skills) ? prev.skills : []), (e.target as HTMLInputElement).value.trim()] }));
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
              onBlur={(e) => {
                if ((e.target as HTMLInputElement).value.trim()) {
                  setResumeData(prev => ({ ...prev, skills: [...(Array.isArray(prev.skills) ? prev.skills : []), (e.target as HTMLInputElement).value.trim()] }));
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                if (input && input.value.trim()) {
                  setResumeData(prev => ({ ...prev, skills: [...(Array.isArray(prev.skills) ? prev.skills : []), input.value.trim()] }));
                  input.value = '';
                }
              }}
              className="flex-shrink-0 transition-colors"
              style={{ color: colors.primaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.secondaryText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.primaryText;
              }}
              aria-label="Add skill"
              title="Add skill"
            >
              <Plus size={12} />
            </button>
          </div>
          
          {skills.length === 0 && (
            <span className="text-xs italic" style={{ color: colors.tertiaryText }}>No skills added yet</span>
          )}
        </div>
      </div>
      
      <div className="flex justify-end mt-3">
        <button 
          onClick={() => onOpenAIGenerateModal('skills')}
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
  );
});

export default SkillsSection;
