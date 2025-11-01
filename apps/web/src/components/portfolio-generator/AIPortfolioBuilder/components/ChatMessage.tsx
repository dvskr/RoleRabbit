'use client';

import React from 'react';
import { Bot, User as UserIcon } from 'lucide-react';
import type { Message, ThemeColors } from '../types/aiPortfolioBuilder';

interface ChatMessageProps {
  message: Message;
  colors: ThemeColors;
}

export function ChatMessage({ message, colors }: ChatMessageProps) {
  return (
    <div className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`} suppressHydrationWarning>
      {message.role === 'assistant' ? (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: colors.badgePurpleBg,
            border: `1px solid ${colors.badgePurpleBorder}`,
          }}
          suppressHydrationWarning
        >
          <Bot size={16} strokeWidth={2} style={{ color: colors.badgePurpleText }} />
        </div>
      ) : (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: colors.inputBackground }}
          suppressHydrationWarning
        >
          <UserIcon size={16} strokeWidth={2} style={{ color: colors.secondaryText }} />
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
              ? colors.badgeInfoBg
              : colors.inputBackground,
            color: message.role === 'user' ? colors.badgeInfoText : colors.primaryText,
            border: message.role === 'user' ? `1px solid ${colors.badgeInfoBorder}` : 'none',
          }}
        >
          <p className="text-sm">{message.content}</p>
          <p 
            className="text-xs mt-1"
            style={{ 
              color: message.role === 'user' 
                ? colors.badgeInfoText 
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

