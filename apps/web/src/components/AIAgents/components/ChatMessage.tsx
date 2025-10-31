import React from 'react';
import { Bot } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  const isUser = message.sender === 'user';

  return (
    <div 
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {isUser ? (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: colors.primaryBlue }}
        >
          <span className="text-xs font-bold text-white">U</span>
        </div>
      ) : (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: colors.badgePurpleBg }}
        >
          <Bot size={16} style={{ color: colors.badgePurpleText }} />
        </div>
      )}
      <div className={`flex-1 ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div 
          className="rounded-lg px-4 py-3 mb-1"
          style={{ 
            background: isUser ? colors.primaryBlue : colors.cardBackground,
            border: isUser ? 'none' : `1px solid ${colors.border}`
          }}
        >
          <p 
            className="text-sm"
            style={{ color: isUser ? 'white' : colors.primaryText }}
          >
            {message.message}
          </p>
        </div>
        <p 
          className="text-xs"
          style={{ color: colors.tertiaryText }}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  );
};

