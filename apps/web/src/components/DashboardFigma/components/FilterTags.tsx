import React from 'react';
import type { FilterTag } from '../types/dashboardFigma';

interface FilterTagsProps {
  filterTags: FilterTag[];
}

export function FilterTags({ filterTags }: FilterTagsProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {filterTags.map((tag, index) => (
        <button
          key={index}
          onClick={tag.action}
          className={`${tag.color} text-white px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 hover:shadow-lg hover:scale-105 flex-shrink-0`}
        >
          {tag.label}
        </button>
      ))}
    </div>
  );
}

