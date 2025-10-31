import React from 'react';
import { Bot, User as UserIcon } from 'lucide-react';
import type { Message, ThemeColors } from '../types/aiPortfolioBuilder';

interface ChatMessageProps {
  message: Message;
  colors: ThemeColors;
}

export function ChatMessage({ message, colors }: ChatMessageProps) {
  return (
    <div className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
      {message.role === 'assistant' ? (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.activeBlueText})`,
          }}
        >
          <Bot size={16} className="text-white" />
        </div>
      ) : (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: colors.inputBackground }}
        >
          <UserIcon size={16} style={{ color: colors.secondaryText }} />
        </div>
      )}
      <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
        <div
          className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] ${
            message.role === 'user'
              ? 'rounded-tr-sm'
              : 'rounded-tl-sm'
          }`}
          style={{
            background: message.role === 'user'
              ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.activeBlueText})`
              : colors.inputBackground,
            color: message.role === 'user' ? 'white' : colors.primaryText,
          }}
        >
          <p className="text-sm">{message.content}</p>
          <p 
            className="text-xs mt-1"
            style={{ 
              color: message.role === 'user' 
                ? 'rgba(255,255,255,0.7)' 
                : colors.tertiaryText 
            }}
          >
            {message.timestamp}
          </p>
        </div>
      </div>
    </div>
  );
}

