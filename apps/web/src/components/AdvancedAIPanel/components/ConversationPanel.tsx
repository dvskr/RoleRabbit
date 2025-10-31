import React from 'react';
import { ConversationMessage } from '../types';

interface ConversationPanelProps {
  messages: ConversationMessage[];
  isStreaming?: boolean;
  streamingResponse?: string;
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  messages,
  isStreaming = false,
  streamingResponse = ''
}) => {
  return (
    <div className="flex-1 p-4 space-y-4 max-h-96 overflow-y-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            <div className="text-xs opacity-70 mt-1">
              {message.timestamp.toLocaleTimeString()}
              {message.model && ` • ${message.model}`}
            </div>
          </div>
        </div>
      ))}
      
      {/* Streaming response */}
      {isStreaming && streamingResponse && (
        <div className="flex justify-start">
          <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
            <div className="text-sm whitespace-pre-wrap">
              {streamingResponse}
              <span className="animate-pulse">|</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

