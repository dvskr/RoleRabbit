import React from 'react';
import { Plus } from 'lucide-react';
import type { PortfolioSection, ThemeColors } from '../types/aiPortfolioBuilder';
import { SectionItem } from './SectionItem';

interface SectionsPanelProps {
  sections: PortfolioSection[];
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  colors: ThemeColors;
}

export function SectionsPanel({
  sections,
  onToggleVisibility,
  onDelete,
  onAdd,
  colors
}: SectionsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p 
          className="text-sm font-medium"
          style={{ color: colors.primaryText }}
        >
          Website Sections
        </p>
        <button
          onClick={onAdd}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
          style={{
            background: `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.activeBlueText})`,
          }}
        >
          <Plus size={16} />
          Add Section
        </button>
      </div>

      <div className="space-y-2">
        {sections.map((section) => (
          <SectionItem
            key={section.id}
            section={section}
            onToggleVisibility={() => onToggleVisibility(section.id)}
            onDelete={() => onDelete(section.id)}
            colors={colors}
          />
        ))}
      </div>
    </div>
  );
}

