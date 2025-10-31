import React from 'react';
import { Bookmark, Flag } from 'lucide-react';

interface FilterToggleButtonsProps {
  colors: any;
  showBookmarkedOnly: boolean;
  showReportedOnly: boolean;
  bookmarkedPostsCount: number;
  flaggedPostsCount: number;
  onToggleBookmarked: () => void;
  onToggleReported: () => void;
}

export default function FilterToggleButtons({
  colors,
  showBookmarkedOnly,
  showReportedOnly,
  bookmarkedPostsCount,
  flaggedPostsCount,
  onToggleBookmarked,
  onToggleReported,
}: FilterToggleButtonsProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={onToggleBookmarked}
        className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        style={{
          background: showBookmarkedOnly ? colors.primaryBlue : colors.inputBackground,
          color: showBookmarkedOnly ? 'white' : colors.primaryText,
        }}
        onMouseEnter={(e) => {
          if (!showBookmarkedOnly) {
            e.currentTarget.style.background = colors.hoverBackground;
          }
        }}
        onMouseLeave={(e) => {
          if (!showBookmarkedOnly) {
            e.currentTarget.style.background = colors.inputBackground;
          }
        }}
      >
        <Bookmark size={16} />
        <span>Bookmarked ({bookmarkedPostsCount})</span>
      </button>
      <button
        onClick={onToggleReported}
        className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        style={{
          background: showReportedOnly ? colors.badgeErrorText : colors.inputBackground,
          color: showReportedOnly ? 'white' : colors.primaryText,
        }}
        onMouseEnter={(e) => {
          if (!showReportedOnly) {
            e.currentTarget.style.background = colors.hoverBackground;
          }
        }}
        onMouseLeave={(e) => {
          if (!showReportedOnly) {
            e.currentTarget.style.background = colors.inputBackground;
          }
        }}
      >
        <Flag size={16} />
        <span>Reported ({flaggedPostsCount})</span>
      </button>
    </div>
  );
}

