/**
 * CategoryTabs - Category navigation tabs
 */

import React from 'react';
import type { ThemeColors } from '../types';
import { templateCategories, resumeTemplates } from '../../../data/templates';
import { getCategoryIcon } from '../utils/templateHelpers';

interface CategoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  colors: ThemeColors;
}

export default function CategoryTabs({
  selectedCategory,
  onSelectCategory,
  colors,
}: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
      <button
        onClick={() => onSelectCategory('all')}
        className="px-2 py-1 rounded-lg whitespace-nowrap transition-colors text-xs border"
        style={{
          background: selectedCategory === 'all' ? colors.badgeInfoBg : 'transparent',
          color: selectedCategory === 'all' ? colors.badgeInfoText : colors.secondaryText,
          border: `1px solid ${selectedCategory === 'all' ? colors.badgeInfoBorder : colors.border}`,
        }}
        onMouseEnter={(e) => {
          if (selectedCategory !== 'all') {
            e.currentTarget.style.background = colors.hoverBackground;
          }
        }}
        onMouseLeave={(e) => {
          if (selectedCategory !== 'all') {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        All ({resumeTemplates.length})
      </button>
      {templateCategories.map(category => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className="px-2 py-1 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 text-xs border"
          style={{
            background: selectedCategory === category.id ? colors.badgeInfoBg : 'transparent',
            color: selectedCategory === category.id ? colors.badgeInfoText : colors.secondaryText,
            border: `1px solid ${selectedCategory === category.id ? colors.badgeInfoBorder : colors.border}`,
          }}
          onMouseEnter={(e) => {
            if (selectedCategory !== category.id) {
              e.currentTarget.style.background = colors.hoverBackground;
            }
          }}
          onMouseLeave={(e) => {
            if (selectedCategory !== category.id) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          {getCategoryIcon(category.id)}
          {category.name} ({category.count})
        </button>
      ))}
    </div>
  );
}

