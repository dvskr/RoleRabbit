'use client';

import React from 'react';
import { Plus, X, LucideIcon } from 'lucide-react';
import { ThemeColors } from '../../../contexts/ThemeContext';

interface TagItem {
  name: string;
  [key: string]: any; // Allow additional properties
}

interface TagSectionProps {
  title: string;
  items: TagItem[];
  isEditing: boolean;
  colors: ThemeColors;
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  inputId: string;
  inputPlaceholder: string;
  emptyIcon: LucideIcon;
  emptyMessage: string;
  emptyHint?: string;
}

export const TagSection: React.FC<TagSectionProps> = ({
  title,
  items,
  isEditing,
  colors,
  onAdd,
  onRemove,
  inputId,
  inputPlaceholder,
  emptyIcon: EmptyIcon,
  emptyMessage,
  emptyHint,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as HTMLInputElement;
      const value = target.value.trim();
      if (value) {
        onAdd(value);
        target.value = '';
      }
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input && input.value.trim()) {
      onAdd(input.value.trim());
      input.value = '';
    }
  };

  return (
    <div
      className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-xl font-semibold"
          style={{ color: colors.primaryText }}
        >
          {title}
        </h3>
        {isEditing && items.length === 0 && emptyHint && (
          <span className="text-sm" style={{ color: colors.secondaryText }}>
            {emptyHint}
          </span>
        )}
      </div>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-6" style={{ maxWidth: '100%' }}>
          {items.map((item, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all group flex-shrink-0"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                maxWidth: '100%',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              <span
                className="font-medium text-sm break-words"
                style={{
                  color: colors.primaryText,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto',
                }}
              >
                {item.name}
              </span>
              {isEditing && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove(index);
                  }}
                  className="opacity-70 group-hover:opacity-100 transition-opacity ml-1 p-0.5 rounded flex-shrink-0"
                  style={{
                    color: colors.errorRed,
                    background: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.badgeErrorBg;
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.opacity = '0.7';
                  }}
                  aria-label={`Remove ${item.name}`}
                  title={`Remove ${item.name}`}
                  type="button"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8" style={{ color: colors.tertiaryText }}>
          <EmptyIcon size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText, opacity: 0.5 }} />
          <p>{emptyMessage}</p>
        </div>
      )}

      {isEditing && (
        <div className="flex gap-3">
          <input
            id={inputId}
            name={inputId}
            type="text"
            placeholder={inputPlaceholder}
            className="flex-1 px-4 py-3 rounded-xl transition-all duration-200"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.borderFocused;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={handleAddClick}
            className="px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            style={{
              background: colors.primaryBlue,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.primaryBlueHover || colors.primaryBlue;
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.primaryBlue;
              e.currentTarget.style.opacity = '1';
            }}
          >
            <Plus size={18} className="inline mr-1" />
            Add
          </button>
        </div>
      )}
    </div>
  );
};
