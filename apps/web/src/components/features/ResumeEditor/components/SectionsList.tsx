'use client';

import React from 'react';
import { Layers, Plus } from 'lucide-react';
import { ThemeColors } from '../../../contexts/ThemeContext';
import SectionItem from './SectionItem';

interface SectionsListProps {
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  customSections: any[];
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
            background: `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`,
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.badgePurpleText}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
          title="Add Custom Section"
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div className="space-y-2">
        {sectionOrder.map((section, index) => {
          const isCustom = customSections.find((s: any) => s.id === section);
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

