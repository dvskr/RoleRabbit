'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Edit, X, Check, Tag } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';

interface InlineEditProps {
  fileId: string;
  currentName: string;
  currentTags: string[];
  onSave: (fileId: string, name: string, tags: string[]) => Promise<void>;
  onCancel?: () => void;
  buttonStyle?: React.CSSProperties;
  hoverHandlers?: {
    applyHoverStyles: (
      event: React.MouseEvent<HTMLButtonElement>,
      color: string,
      background: string,
      borderColor?: string
    ) => void;
    resetHoverStyles: (
      event: React.MouseEvent<HTMLButtonElement>,
      color: string,
      background: string,
      borderColor?: string
    ) => void;
  };
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  fileId,
  currentName,
  currentTags,
  onSave,
  onCancel,
  buttonStyle,
  hoverHandlers,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [tags, setTags] = useState(currentTags.join(', '));
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setName(currentName);
    setTags(currentTags.join(', '));
  }, [currentName, currentTags]);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isEditing) {
          handleCancel();
        }
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setName(currentName);
    setTags(currentTags.join(', '));
    setIsEditing(false);
    onCancel?.();
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const tagsList = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      await onSave(fileId, trimmedName, tagsList);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={handleStartEdit}
        className="flex items-center gap-2 transition-all"
        style={
          buttonStyle ?? {
            color: colors.secondaryText,
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            padding: '0.5rem 0.75rem',
          }
        }
        onMouseEnter={(e) => {
          if (hoverHandlers) {
            hoverHandlers.applyHoverStyles(e, colors.primaryBlue, colors.hoverBackground, colors.primaryBlue);
          } else {
            e.currentTarget.style.color = colors.primaryBlue;
            e.currentTarget.style.background = colors.hoverBackground;
            e.currentTarget.style.borderColor = colors.primaryBlue;
          }
        }}
        onMouseLeave={(e) => {
          if (hoverHandlers) {
            hoverHandlers.resetHoverStyles(e, colors.secondaryText, colors.inputBackground, colors.border);
          } else {
            e.currentTarget.style.color = colors.secondaryText;
            e.currentTarget.style.background = colors.inputBackground;
            e.currentTarget.style.borderColor = colors.border;
          }
        }}
        title="Edit name and tags"
      >
        <Edit size={18} />
        <span className="text-sm font-medium">Edit</span>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-2 p-2 rounded-lg"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
        minWidth: '300px',
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="flex-1 space-y-2">
        {/* Name Input */}
        <div className="relative">
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="File name"
            className="w-full px-2 py-1 text-sm rounded focus:outline-none"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            disabled={isSaving}
          />
        </div>

        {/* Tags Input */}
        <div className="relative">
          <Tag size={12} className="absolute left-2 top-1.5" style={{ color: colors.tertiaryText }} />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="w-full pl-7 pr-2 py-1 text-sm rounded focus:outline-none"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
          className="p-1.5 rounded transition-colors"
          style={{
            color: isSaving || !name.trim() ? colors.tertiaryText : colors.successGreen,
            background: isSaving || !name.trim() ? 'transparent' : colors.badgeSuccessBg,
          }}
          title="Save (Ctrl/Cmd + Enter)"
        >
          <Check size={14} />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1.5 rounded transition-colors"
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
          title="Cancel (Esc)"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};


