'use client';

import React from 'react';
import { Mail, Star, Edit, Trash2, FileText } from 'lucide-react';
import { EmailTemplate } from '../types';
import { useTheme } from '../../../contexts/ThemeContext';

interface TemplateCardProps {
  template: EmailTemplate;
  onUse?: (template: EmailTemplate) => void;
  onEdit?: (template: EmailTemplate) => void;
  onDelete?: (template: EmailTemplate) => void;
}

export default function TemplateCard({ template, onUse, onEdit, onDelete }: TemplateCardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div 
      className="rounded-lg p-4 transition-all"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.borderFocused;
        e.currentTarget.style.boxShadow = `0 4px 12px rgba(0, 0, 0, 0.1)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={20} style={{ color: colors.primaryBlue }} />
          <div>
            <h3 className="font-semibold" style={{ color: colors.primaryText }}>{template.name}</h3>
            <p className="text-xs" style={{ color: colors.secondaryText }}>{template.category}</p>
          </div>
        </div>
        {template.isCustom && (
          <span 
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{
              background: colors.badgePurpleBg,
              color: colors.badgePurpleText,
            }}
          >
            Custom
          </span>
        )}
      </div>

      {/* Subject Preview */}
      <div className="mb-3">
        <p className="text-sm font-medium mb-1" style={{ color: colors.primaryText }}>Subject:</p>
        <p className="text-sm truncate" style={{ color: colors.secondaryText }}>{template.subject}</p>
      </div>

      {/* Body Preview */}
      <div className="mb-3">
        <p className="text-sm font-medium mb-1" style={{ color: colors.primaryText }}>Body:</p>
        <p className="text-sm line-clamp-2" style={{ color: colors.secondaryText }}>{template.body}</p>
      </div>

      {/* Usage Stats */}
      <div 
        className="flex items-center justify-between mb-3 pt-3"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        <div className="flex items-center gap-1 text-xs" style={{ color: colors.secondaryText }}>
          <Mail size={14} />
          <span>{template.usageCount} uses</span>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(template)}
                className="p-1.5 rounded transition-colors"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Edit"
              >
                <Edit size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(template)}
                className="p-1.5 rounded transition-colors"
                style={{ color: colors.errorRed }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.badgeErrorBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {onUse && (
        <button
          onClick={() => onUse(template)}
          className="w-full px-4 py-2 rounded-lg transition-all text-sm font-medium"
          style={{
            background: colors.primaryBlue,
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Use Template
        </button>
      )}
    </div>
  );
}
