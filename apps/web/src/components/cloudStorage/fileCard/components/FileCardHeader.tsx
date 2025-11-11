'use client';

import React from 'react';
import { FileText, RotateCcw, Trash, Star, Check } from 'lucide-react';
import { ResumeFile } from '../../../../types/cloudStorage';
import { ThemeColors } from '../../../../contexts/ThemeContext';

interface FileCardHeaderProps {
  file: ResumeFile;
  isEditing: boolean;
  editingName: string;
  isSaving: boolean;
  isSelected: boolean;
  showDeleted: boolean;
  colors: ThemeColors;
  onEditingNameChange: (name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRestore?: (fileId: string) => void;
  onPermanentlyDelete?: (fileId: string) => void;
  onStar?: (fileId: string) => void;
  onSelect: (fileId: string) => void;
}

export const FileCardHeader: React.FC<FileCardHeaderProps> = ({
  file,
  isEditing,
  editingName,
  isSaving,
  isSelected,
  showDeleted,
  colors,
  onEditingNameChange,
  onSaveEdit,
  onCancelEdit,
  onRestore,
  onPermanentlyDelete,
  onStar,
  onSelect,
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-start gap-4">
        {/* Blue Square Icon */}
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: colors.primaryBlue,
          }}
        >
          <FileText size={24} color={colors.primaryText} />
        </div>

        {/* File Name and Resume Button Section */}
        <div className="flex-1 min-w-0">
          {/* File Name Row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => onEditingNameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      onSaveEdit();
                    } else if (e.key === 'Escape') {
                      onCancelEdit();
                    }
                  }}
                  className="font-bold text-lg w-full px-2 py-1 rounded-lg focus:outline-none"
                  style={{
                    color: colors.primaryText,
                    background: colors.inputBackground,
                    border: `2px solid ${colors.primaryBlue}`,
                  }}
                  autoFocus
                  disabled={isSaving}
                />
              ) : (
                <h3
                  className="font-bold text-lg break-words"
                  style={{ color: colors.primaryText }}
                  title={file.name}
                >
                  {file.name}
                </h3>
              )}
            </div>

            {/* Top Right Icons - Star and Square */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {showDeleted && file.deletedAt ? (
                <>
                  <button
                    onClick={() => onRestore?.(file.id)}
                    className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                    style={{
                      color: colors.successGreen,
                      background: colors.inputBackground,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.badgeSuccessBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.inputBackground;
                    }}
                    title="Restore"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => onPermanentlyDelete?.(file.id)}
                    className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                    style={{
                      color: colors.errorRed,
                      background: colors.inputBackground,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.errorRed;
                      e.currentTarget.style.background = colors.badgeErrorBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.errorRed;
                      e.currentTarget.style.background = colors.inputBackground;
                    }}
                    title="Permanently Delete"
                  >
                    <Trash size={14} />
                  </button>
                </>
              ) : (
                <>
                  {/* Star Icon */}
                  <button
                    className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                    style={{
                      color: file.isStarred ? colors.warningYellow : colors.secondaryText,
                      background: colors.inputBackground,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.hoverBackgroundStrong;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.inputBackground;
                    }}
                    onClick={() => {
                      if (onStar) {
                        onStar(file.id);
                      }
                    }}
                    title={file.isStarred ? 'Remove from starred' : 'Add to starred'}
                  >
                    <Star size={14} className={file.isStarred ? 'fill-current' : ''} />
                  </button>
                  {/* Square Icon (Checkbox/Menu) */}
                  <button
                    className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                    style={{
                      color: colors.secondaryText,
                      background: colors.inputBackground,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.hoverBackgroundStrong;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.inputBackground;
                    }}
                    onClick={() => onSelect(file.id)}
                    title="Select file"
                  >
                    <div
                      className="w-4 h-4 rounded border"
                      style={{
                        borderColor: isSelected ? colors.primaryBlue : colors.border,
                        background: isSelected ? colors.primaryBlue : 'transparent',
                      }}
                    >
                      {isSelected && <Check size={12} color={colors.primaryText} />}
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
