/**
 * Banner component to show tailoring diff summary and toggle highlighting
 */

import React from 'react';
import { GitCompare, X, Eye, EyeOff } from 'lucide-react';

interface DiffHighlightBannerProps {
  diffChanges: Array<{
    type: 'added' | 'removed' | 'modified' | 'unchanged';
    section: string;
    field?: string;
    index?: number;
    oldValue?: string;
    newValue?: string;
    path: string;
  }>;
  showHighlighting: boolean;
  onToggleHighlighting: () => void;
  onClose: () => void;
  colors: any;
}

export function DiffHighlightBanner({
  diffChanges,
  showHighlighting,
  onToggleHighlighting,
  onClose,
  colors,
}: DiffHighlightBannerProps) {
  const addedCount = diffChanges.filter(c => c.type === 'added').length;
  const modifiedCount = diffChanges.filter(c => c.type === 'modified').length;
  const removedCount = diffChanges.filter(c => c.type === 'removed').length;
  const totalChanges = addedCount + modifiedCount + removedCount;

  if (totalChanges === 0) return null;

  return (
    <div
      className="flex items-center justify-between px-4 py-3 border-b"
      style={{
        background: colors.cardBackground,
        borderColor: colors.border,
      }}
    >
      <div className="flex items-center gap-3">
        <GitCompare size={20} style={{ color: colors.primaryBlue }} />
        <div className="flex flex-col">
          <span className="text-sm font-semibold" style={{ color: colors.primaryText }}>
            Resume Tailored
          </span>
          <div className="flex items-center gap-3 text-xs" style={{ color: colors.secondaryText }}>
            {addedCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {addedCount} added
              </span>
            )}
            {modifiedCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                {modifiedCount} modified
              </span>
            )}
            {removedCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {removedCount} removed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleHighlighting}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{
            background: showHighlighting ? colors.badgePurpleBg : colors.inputBackground,
            color: showHighlighting ? colors.badgePurpleText : colors.primaryText,
            border: `1px solid ${showHighlighting ? colors.badgePurpleBorder : colors.border}`,
          }}
          onMouseEnter={(e) => {
            if (!showHighlighting) {
              e.currentTarget.style.background = colors.hoverBackground;
            }
          }}
          onMouseLeave={(e) => {
            if (!showHighlighting) {
              e.currentTarget.style.background = colors.inputBackground;
            }
          }}
        >
          {showHighlighting ? (
            <>
              <Eye size={14} />
              <span>Highlighting On</span>
            </>
          ) : (
            <>
              <EyeOff size={14} />
              <span>Show Changes</span>
            </>
          )}
        </button>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: colors.tertiaryText }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

