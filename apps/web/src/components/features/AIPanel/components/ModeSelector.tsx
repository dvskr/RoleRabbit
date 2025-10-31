import React from 'react';
import { Target, Bot } from 'lucide-react';

interface ModeSelectorProps {
  aiMode: string;
  setAiMode: (mode: string) => void;
  colors: any;
}

export default function ModeSelector({ aiMode, setAiMode, colors }: ModeSelectorProps) {
  return (
    <div>
      <div className="flex rounded-lg p-1" style={{ background: colors.inputBackground }}>
        <button
          onClick={() => setAiMode('tailor')}
          className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all"
          style={{
            background: aiMode === 'tailor' ? colors.cardBackground : 'transparent',
            color: aiMode === 'tailor' ? colors.badgePurpleText : colors.secondaryText,
            border: aiMode === 'tailor' ? `1px solid ${colors.badgePurpleBorder}` : 'none',
            boxShadow: aiMode === 'tailor' ? `0 1px 2px ${colors.border}20` : 'none',
          }}
          onMouseEnter={(e) => {
            if (aiMode !== 'tailor') {
              e.currentTarget.style.color = colors.primaryText;
            }
          }}
          onMouseLeave={(e) => {
            if (aiMode !== 'tailor') {
              e.currentTarget.style.color = colors.secondaryText;
            }
          }}
        >
          <Target size={14} className="inline mr-1.5" />
          Tailor for Job
        </button>
        <button
          onClick={() => setAiMode('chat')}
          className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all"
          style={{
            background: aiMode === 'chat' ? colors.cardBackground : 'transparent',
            color: aiMode === 'chat' ? colors.badgePurpleText : colors.secondaryText,
            border: aiMode === 'chat' ? `1px solid ${colors.badgePurpleBorder}` : 'none',
            boxShadow: aiMode === 'chat' ? `0 1px 2px ${colors.border}20` : 'none',
          }}
          onMouseEnter={(e) => {
            if (aiMode !== 'chat') {
              e.currentTarget.style.color = colors.primaryText;
            }
          }}
          onMouseLeave={(e) => {
            if (aiMode !== 'chat') {
              e.currentTarget.style.color = colors.secondaryText;
            }
          }}
        >
          <Bot size={14} className="inline mr-1.5" />
          AI Chat
        </button>
      </div>
    </div>
  );
}

