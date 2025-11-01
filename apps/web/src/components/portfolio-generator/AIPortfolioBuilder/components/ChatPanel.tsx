'use client';

import React from 'react';
import { Send } from 'lucide-react';
import type { Message, QuickActionType, ThemeColors } from '../types/aiPortfolioBuilder';
import { ChatMessage } from './ChatMessage';
import { QuickActionButton } from './QuickActionButton';

interface ChatPanelProps {
  messages: Message[];
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onQuickAction: (action: QuickActionType) => void;
  colors: ThemeColors;
}

export function ChatPanel({
  messages,
  inputMessage,
  onInputChange,
  onSendMessage,
  onQuickAction,
  colors
}: ChatPanelProps) {
  return (
    <div className="space-y-4" suppressHydrationWarning>
      {/* Chat Messages */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto" suppressHydrationWarning>
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} colors={colors} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <p 
          className="text-xs font-medium mb-2"
          style={{ color: colors.tertiaryText }}
        >
          QUICK ACTIONS
        </p>
        <div className="space-y-2">
          <QuickActionButton
            action="upload-resume"
            onClick={() => onQuickAction('upload-resume')}
            colors={colors}
          />
          <QuickActionButton
            action="use-profile"
            onClick={() => onQuickAction('use-profile')}
            colors={colors}
          />
          <QuickActionButton
            action="start-scratch"
            onClick={() => onQuickAction('start-scratch')}
            colors={colors}
          />
        </div>
      </div>

      {/* Input Field */}
      <div className="pt-4 border-t" style={{ borderTop: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Describe your portfolio or ask for changes..."
            className="flex-1 px-4 py-2 rounded-lg text-sm"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
          />
          <button
            onClick={onSendMessage}
            className="p-2 rounded-lg transition-all"
            style={{
              background: colors.badgeInfoBg,
              border: `1px solid ${colors.badgeInfoBorder}`,
              color: colors.badgeInfoText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.badgeInfoBorder;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.badgeInfoBg;
            }}
            title="Send message"
            aria-label="Send message"
          >
            <Send size={18} strokeWidth={2} style={{ color: colors.badgeInfoText }} />
          </button>
        </div>
      </div>
    </div>
  );
}

