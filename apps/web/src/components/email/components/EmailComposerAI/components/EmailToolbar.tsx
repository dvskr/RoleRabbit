'use client';

import React from 'react';
import { Send, Paperclip, Wand2, Sparkles, RefreshCw, FileText } from 'lucide-react';

interface EmailToolbarProps {
  onAttach: () => void;
  onUseTemplate: () => void;
  onGenerate: () => void;
  onImprove: () => void;
  onGenerateSubject: () => void;
  onCancel?: () => void;
  onSend: () => void;
  isGenerating: boolean;
  hasBody: boolean;
  hasSubject: boolean;
  canSend: boolean;
  colors: {
    cardBackground: string;
    border: string;
    secondaryText: string;
    primaryText: string;
    hoverBackground: string;
    primaryBlue: string;
    primaryBlueHover?: string;
    badgeInfoBg: string;
    badgePurpleText: string;
    badgePurpleBg: string;
    successGreen: string;
    badgeSuccessBg: string;
    inputBackground: string;
  };
}

export function EmailToolbar({
  onAttach,
  onUseTemplate,
  onGenerate,
  onImprove,
  onGenerateSubject,
  onCancel,
  onSend,
  isGenerating,
  hasBody,
  hasSubject,
  canSend,
  colors,
}: EmailToolbarProps) {
  return (
    <div
      className="px-4 py-3 flex items-center justify-between flex-shrink-0"
      style={{
        background: colors.cardBackground,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onAttach}
          className="p-2 rounded-lg transition-colors"
          style={{
            color: colors.secondaryText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
            e.currentTarget.style.color = colors.primaryText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = colors.secondaryText;
          }}
          title="Attach File"
        >
          <Paperclip size={18} />
        </button>

        {/* Use Template Button */}
        <button
          onClick={onUseTemplate}
          className="p-2 rounded-lg transition-colors flex items-center gap-2"
          style={{
            color: colors.primaryBlue,
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.badgeInfoBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title="Use Email Template"
        >
          <FileText size={18} />
          <span className="text-xs font-medium">Template</span>
        </button>

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          className="p-2 rounded-lg transition-colors flex items-center gap-2"
          style={{
            color: colors.badgePurpleText,
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.badgePurpleBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title="Generate Email from Prompt"
        >
          <Sparkles size={18} />
          <span className="text-xs font-medium">Generate</span>
        </button>

        {/* Improve Email */}
        {hasBody && (
          <button
            onClick={onImprove}
            disabled={isGenerating}
            className="p-2 rounded-lg transition-colors disabled:opacity-50"
            style={{
              color: colors.primaryBlue,
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!isGenerating) {
                e.currentTarget.style.background = colors.badgeInfoBg;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title="Improve Email"
          >
            {isGenerating ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Wand2 size={18} />
            )}
          </button>
        )}

        {/* Generate Subject */}
        {!hasSubject && (
          <button
            onClick={onGenerateSubject}
            disabled={isGenerating}
            className="p-2 rounded-lg transition-colors disabled:opacity-50"
            style={{
              color: colors.successGreen,
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!isGenerating) {
                e.currentTarget.style.background = colors.badgeSuccessBg;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title="Generate Subject"
          >
            {isGenerating ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <span className="text-xs font-semibold">Auto</span>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg transition-colors font-medium"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.primaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={onSend}
          disabled={!canSend}
          className="px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          style={{
            background: colors.primaryBlue,
            color: 'white',
          }}
          onMouseEnter={(e) => {
            if (canSend) {
              e.currentTarget.style.background = colors.primaryBlueHover || colors.primaryBlue;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.primaryBlue;
          }}
        >
          <Send size={16} />
          Send
        </button>
      </div>
    </div>
  );
}

