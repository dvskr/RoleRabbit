import React from 'react';
import { Send } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface ChatInputProps {
  chatMessage: string;
  setChatMessage: (message: string) => void;
  onSendMessage: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  chatMessage, 
  setChatMessage, 
  onSendMessage 
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  return (
    <div 
      className="px-6 py-4 border-t"
      style={{ borderTop: `1px solid ${colors.border}` }}
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          placeholder="Ask AI to automate your job search... (e.g., 'Generate 3 resumes for this JD', 'Research companies and send cold emails')"
          className="flex-1 px-4 py-2 rounded-lg text-sm transition-all outline-none"
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
        <button
          onClick={onSendMessage}
          className="p-2 rounded-lg transition-all"
          style={{
            background: colors.badgePurpleBg,
            color: colors.badgePurpleText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.badgePurpleText;
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.badgePurpleBg;
            e.currentTarget.style.color = colors.badgePurpleText;
          }}
          title="Send message"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

