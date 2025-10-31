'use client';

import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { PLACEHOLDERS, MODAL_STYLES } from '../utils/emailComposerAI.constants';

interface PromptInputModalProps {
  isOpen: boolean;
  prompt: string;
  isGenerating: boolean;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  onClose: () => void;
  colors: {
    cardBackground: string;
    border: string;
    primaryText: string;
    badgePurpleText: string;
    inputBackground: string;
    secondaryText: string;
    hoverBackground: string;
    borderFocused: string;
  };
}

export function PromptInputModal({
  isOpen,
  prompt,
  isGenerating,
  onPromptChange,
  onGenerate,
  onClose,
  colors,
}: PromptInputModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
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
        className="rounded-lg shadow-xl w-full max-w-2xl p-6"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.primaryText }}>
          <Sparkles size={20} style={{ color: colors.badgePurpleText }} />
          Generate Email from Prompt
        </h3>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={PLACEHOLDERS.AI_PROMPT}
          rows={6}
          className="w-full px-3 py-2 rounded-lg resize-none transition-colors"
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
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg transition-colors font-medium"
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
          <button
            onClick={onGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            style={{
              background: colors.badgePurpleText,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              if (!(!prompt.trim() || isGenerating)) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

