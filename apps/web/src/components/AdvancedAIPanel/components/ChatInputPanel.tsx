import React from 'react';
import { Sparkles } from 'lucide-react';

interface ChatInputPanelProps {
  prompt: string;
  isStreaming?: boolean;
  onPromptChange: (prompt: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSendMessage: () => void;
  promptRef?: React.RefObject<HTMLTextAreaElement>;
}

export const ChatInputPanel: React.FC<ChatInputPanelProps> = ({
  prompt,
  isStreaming = false,
  onPromptChange,
  onKeyPress,
  onSendMessage,
  promptRef
}) => {
  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex gap-2">
        <textarea
          ref={promptRef}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Ask AI to help with your resume..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={2}
          disabled={isStreaming}
        />
        <button
          onClick={onSendMessage}
          disabled={!prompt.trim() || isStreaming}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
          title="Send message"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};

