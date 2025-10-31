'use client';

import React from 'react';
import { X, FileText, MessageSquare } from 'lucide-react';
import type { EmailTemplate } from '../types/EmailComposerAI.types';
import { MODAL_STYLES, TIPS } from '../utils/emailComposerAI.constants';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  templates: EmailTemplate[];
  onClose: () => void;
  onSelectTemplate: (template: EmailTemplate) => void;
  colors: {
    cardBackground: string;
    border: string;
    primaryText: string;
    secondaryText: string;
    tertiaryText: string;
    badgeInfoBg: string;
    badgeInfoText: string;
    inputBackground: string;
    hoverBackground: string;
    borderFocused: string;
    badgePurpleBg: string;
    badgePurpleText: string;
  };
}

export function TemplateSelectionModal({
  isOpen,
  templates,
  onClose,
  onSelectTemplate,
  colors,
}: TemplateSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: MODAL_STYLES.BACKDROP,
        backdropFilter: MODAL_STYLES.BACKDROP_FILTER,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                background: colors.badgeInfoBg,
                color: colors.badgeInfoText,
              }}
            >
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold" style={{ color: colors.primaryText }}>
                Select Email Template
              </h3>
              <p className="text-sm" style={{ color: colors.secondaryText }}>
                Choose a template to use in your email
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: colors.secondaryText,
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.primaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.secondaryText;
            }}
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className="p-4 rounded-lg cursor-pointer transition-all border"
              style={{
                background: colors.inputBackground,
                borderColor: colors.border,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
                e.currentTarget.style.background = colors.hoverBackground;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.background = colors.inputBackground;
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold" style={{ color: colors.primaryText }}>
                  {template.name}
                </h4>
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
              <p className="text-xs mb-2" style={{ color: colors.secondaryText }}>
                {template.category}
              </p>
              <p className="text-sm truncate mb-1" style={{ color: colors.primaryText }}>
                {template.subject}
              </p>
              <p className="text-xs line-clamp-2" style={{ color: colors.secondaryText }}>
                {template.body}
              </p>
              <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: colors.tertiaryText }}>
                <MessageSquare size={12} />
                <span>{template.usageCount || 0} uses</span>
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText }} />
            <p className="mb-2" style={{ color: colors.secondaryText }}>
              {TIPS.NO_TEMPLATES_MESSAGE}
            </p>
            <p className="text-sm" style={{ color: colors.tertiaryText }}>
              {TIPS.CREATE_TEMPLATES_MESSAGE}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

