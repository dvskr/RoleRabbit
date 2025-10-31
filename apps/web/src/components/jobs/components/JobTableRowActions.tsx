/**
 * JobTable row actions component - handles action buttons (view, restore, delete)
 */

import React from 'react';
import { Eye, RotateCcw, Trash, Trash2 } from 'lucide-react';
import { Job } from '../../../types/job';
import { useTheme } from '../../../contexts/ThemeContext';

interface JobTableRowActionsProps {
  job: Job;
  showDeleted?: boolean;
  onView?: (job: Job) => void;
  onRestore?: (jobId: string) => void;
  onDelete?: (jobId: string, permanent?: boolean) => void;
}

export default function JobTableRowActions({
  job,
  showDeleted = false,
  onView,
  onRestore,
  onDelete,
}: JobTableRowActionsProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div className="flex items-center gap-1 justify-end">
      {onView && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(job);
          }}
          className="p-1.5 rounded transition-opacity duration-200 opacity-0 group-hover:opacity-100"
          style={{ color: colors.tertiaryText }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
            e.currentTarget.style.color = colors.primaryBlue;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = colors.tertiaryText;
          }}
          title="View Details"
        >
          <Eye size={14} />
        </button>
      )}
      {showDeleted && onRestore && job.deletedAt && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRestore(job.id);
          }}
          className="p-1.5 rounded transition-opacity duration-200 opacity-0 group-hover:opacity-100"
          style={{ color: colors.tertiaryText }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
            e.currentTarget.style.color = colors.badgeSuccessText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = colors.tertiaryText;
          }}
          title="Restore"
        >
          <RotateCcw size={14} />
        </button>
      )}
      {onDelete && (!showDeleted || !job.deletedAt) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (showDeleted) {
              onDelete(job.id, true);
            } else {
              onDelete(job.id, false);
            }
          }}
          className="p-1.5 rounded transition-opacity duration-200 opacity-0 group-hover:opacity-100"
          style={{ color: colors.tertiaryText }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
            e.currentTarget.style.color = colors.badgeErrorText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = colors.tertiaryText;
          }}
          title={showDeleted ? "Permanently Delete" : "Delete"}
        >
          {showDeleted ? <Trash size={14} /> : <Trash2 size={14} />}
        </button>
      )}
    </div>
  );
}

