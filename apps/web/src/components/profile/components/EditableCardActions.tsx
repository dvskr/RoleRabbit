'use client';

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { ThemeColors } from '../../../contexts/ThemeContext';

interface EditableCardActionsProps {
  colors: ThemeColors;
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

export const EditableCardActions: React.FC<EditableCardActionsProps> = ({
  colors,
  onEdit,
  onDelete,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
}) => {
  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        type="button"
        onClick={onEdit}
        className="p-2 rounded-lg transition-all text-theme-primary-blue hover:bg-theme-badge-info-bg"
        title={editLabel}
        aria-label={editLabel}
      >
        <Edit2 size={18} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-2 rounded-lg transition-all text-theme-error hover:bg-theme-badge-error-bg"
        title={deleteLabel}
        aria-label={deleteLabel}
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};
