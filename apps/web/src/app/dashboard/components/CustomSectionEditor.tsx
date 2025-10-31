/**
 * Component for rendering and editing custom resume sections
 */

import React from 'react';
import { GripVertical, Eye, Trash2, Sparkles } from 'lucide-react';
import { CustomSection, SectionVisibility } from '../../../types/resume';

interface CustomSectionEditorProps {
  customSection: CustomSection;
  sectionVisibility: SectionVisibility;
  colors: {
    cardBackground: string;
    border: string;
    primaryText: string;
    tertiaryText: string;
    secondaryText: string;
    errorRed: string;
    badgeErrorBg: string;
    inputBackground: string;
    hoverBackground: string;
    primaryBlue: string;
    badgePurpleText: string;
    badgePurpleBg: string;
  };
  onHide: (sectionId: string) => void;
  onDelete: (sectionId: string) => void;
  onUpdate: (sectionId: string, content: string) => void;
  onAIGenerate: (sectionId: string) => void;
}

export const CustomSectionEditor: React.FC<CustomSectionEditorProps> = ({
  customSection,
  sectionVisibility,
  colors,
  onHide,
  onDelete,
  onUpdate,
  onAIGenerate,
}) => {
  const isVisible = sectionVisibility[customSection.id];

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
              {customSection.name.toUpperCase()}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onHide(customSection.id)}
              className="p-2 rounded-xl transition-colors"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackground;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title={isVisible ? `Hide ${customSection.name} section` : `Show ${customSection.name} section`}
            >
              <Eye size={18} style={{ color: isVisible ? colors.secondaryText : colors.tertiaryText }} />
            </button>
            <button 
              onClick={() => onDelete(customSection.id)}
              className="p-2 rounded-xl transition-colors"
              style={{ color: colors.errorRed }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.badgeErrorBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Delete Section"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div 
          className="mb-4 p-4 border-2 rounded-2xl transition-all"
          style={{
            background: colors.inputBackground,
            border: `2px solid ${colors.border}`,
          }}
        >
          <textarea
            value={customSection.content}
            onChange={(e) => onUpdate(customSection.id, e.target.value)}
            className="w-full min-h-[120px] px-3 py-2 rounded-lg resize-none break-words overflow-wrap-anywhere transition-all"
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.primaryText,
              outline: 'none',
            }}
            placeholder={`Add your ${customSection.name.toLowerCase()} content here...`}
            onFocus={(e) => {
              e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
            }}
            onBlur={(e) => {
              e.target.style.outline = 'none';
            }}
          />
        </div>

        {/* AI Generate Button - Always visible */}
        <div className="flex justify-end mt-3">
          <button 
            onClick={() => onAIGenerate(customSection.id)}
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
};

