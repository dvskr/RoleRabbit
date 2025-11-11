'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { ResumeFile } from '../../../../types/cloudStorage';
import { ThemeColors } from '../../../../contexts/ThemeContext';

interface FileCardActionsProps {
  file: ResumeFile;
  isEditing: boolean;
  editingType: ResumeFile['type'];
  isSaving: boolean;
  editingName: string;
  colors: ThemeColors;
  onEditingTypeChange: (type: ResumeFile['type']) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEdit?: (fileId: string) => void;
}

const FILE_TYPE_OPTIONS: ResumeFile['type'][] = [
  'resume',
  'template',
  'backup',
  'cover_letter',
  'transcript',
  'certification',
  'reference',
  'portfolio',
  'work_sample',
  'document',
];

const formatTypeLabel = (type: ResumeFile['type']) =>
  type
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const FileCardActions: React.FC<FileCardActionsProps> = ({
  file,
  isEditing,
  editingType,
  isSaving,
  editingName,
  colors,
  onEditingTypeChange,
  onSaveEdit,
  onCancelEdit,
  onEdit,
}) => {
  return (
    <div className="flex items-center gap-2">
      {!isEditing && (
        <button
          className="px-3 py-1 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          style={{
            background: colors.primaryBlue,
            color: colors.primaryText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onClick={() => {
            if (onEdit && file.type === 'resume') {
              // Navigate to resume editor or handle resume action
            }
          }}
          aria-label={`Open ${file.name} in resume editor`}
        >
          Resume
        </button>
      )}

      {isEditing && (
        <div className="flex items-center gap-2">
          <label htmlFor={`file-type-${file.id}`} className="sr-only">
            File type
          </label>
          <select
            id={`file-type-${file.id}`}
            value={editingType}
            onChange={(e) => onEditingTypeChange(e.target.value as ResumeFile['type'])}
            className="text-xs px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              background: colors.inputBackground,
              color: colors.primaryText,
              border: `1px solid ${colors.primaryBlue}`,
            }}
            aria-label="Select file type"
          >
            {FILE_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {formatTypeLabel(option)}
              </option>
            ))}
          </select>
          <button
            onClick={onSaveEdit}
            disabled={isSaving || !editingName.trim()}
            className="p-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            style={{
              color: isSaving || !editingName.trim() ? colors.tertiaryText : colors.successGreen,
              background: isSaving || !editingName.trim() ? 'transparent' : colors.badgeSuccessBg,
            }}
            aria-label={`Save changes to ${file.name}`}
            title="Save (Ctrl/Cmd + Enter)"
          >
            <Check size={14} aria-hidden="true" />
          </button>
          <button
            onClick={onCancelEdit}
            disabled={isSaving}
            className="p-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            style={{
              color: colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.color = colors.errorRed;
                e.currentTarget.style.background = colors.badgeErrorBg;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.currentTarget.style.color = colors.secondaryText;
                e.currentTarget.style.background = 'transparent';
              }
            }}
            aria-label="Cancel editing"
            title="Cancel (Esc)"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};
