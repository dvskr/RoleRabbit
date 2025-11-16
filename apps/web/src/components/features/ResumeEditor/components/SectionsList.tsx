'use client';

import React, { useMemo } from 'react';
import { Layers, Plus, Eye, EyeOff } from 'lucide-react';
import { ThemeColors } from '../../../contexts/ThemeContext';
import { CustomSection } from '../../../types/resume';
import SectionItem from './SectionItem';

interface SectionsListProps {
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  customSections: CustomSection[];
  onToggleSection: (section: string) => void;
  onMoveSection: (index: number, direction: 'up' | 'down') => void;
  onShowAddSectionModal: () => void;
  colors: ThemeColors;
}

export default function SectionsList({
  sectionOrder,
  sectionVisibility,
  customSections,
  onToggleSection,
  onMoveSection,
  onShowAddSectionModal,
  colors,
}: SectionsListProps) {
  // Check if all sections are visible or hidden
  const allVisible = useMemo(() => {
    return sectionOrder.every((section) => sectionVisibility[section] !== false);
  }, [sectionOrder, sectionVisibility]);

  const allHidden = useMemo(() => {
    return sectionOrder.every((section) => sectionVisibility[section] === false);
  }, [sectionOrder, sectionVisibility]);

  const handleShowAll = () => {
    sectionOrder.forEach((section) => {
      if (sectionVisibility[section] === false) {
        onToggleSection(section);
      }
    });
  };

  const handleHideAll = () => {
    sectionOrder.forEach((section) => {
      if (sectionVisibility[section] !== false) {
        onToggleSection(section);
      }
    });
  };

  return (
    <div className="mb-6 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2 text-base" style={{ color: colors.primaryText }}>
          <Layers size={18} style={{ color: colors.badgePurpleText }} />
          Sections
        </h3>
        <button
          onClick={onShowAddSectionModal}
          className="p-2 rounded-lg transition-all"
          style={{
            background: colors.badgeSuccessBg,
            border: `1px solid ${colors.badgeSuccessBorder}`,
            color: colors.badgeSuccessText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.badgeSuccessBorder;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.badgeSuccessBg;
          }}
          title="Add Custom Section"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Bulk Toggle Buttons */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={handleShowAll}
          disabled={allVisible}
          className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onMouseEnter={(e) => {
            if (!allVisible) {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.borderColor = colors.activeBlueText;
            }
          }}
          onMouseLeave={(e) => {
            if (!allVisible) {
              e.currentTarget.style.background = colors.inputBackground;
              e.currentTarget.style.borderColor = colors.border;
            }
          }}
          title="Show all sections"
        >
          <Eye size={14} />
          Show All
        </button>
        <button
          onClick={handleHideAll}
          disabled={allHidden}
          className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onMouseEnter={(e) => {
            if (!allHidden) {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.borderColor = colors.errorRed;
            }
          }}
          onMouseLeave={(e) => {
            if (!allHidden) {
              e.currentTarget.style.background = colors.inputBackground;
              e.currentTarget.style.borderColor = colors.border;
            }
          }}
          title="Hide all sections"
        >
          <EyeOff size={14} />
          Hide All
        </button>
      </div>
      
      <div className="space-y-2">
        {sectionOrder.map((section, index) => {
          const isCustom = customSections.find((s: CustomSection) => s.id === section);
          const displayName = isCustom ? isCustom.name : section;
          
          return (
            <SectionItem
              key={section}
              section={section}
              index={index}
              totalSections={sectionOrder.length}
              isVisible={sectionVisibility[section] ?? true}
              displayName={displayName}
              onToggle={() => onToggleSection(section)}
              onMoveUp={() => onMoveSection(index, 'up')}
              onMoveDown={() => onMoveSection(index, 'down')}
              colors={colors}
            />
          );
        })}
      </div>
    </div>
  );
}

