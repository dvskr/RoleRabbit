import React from 'react';
import { Send } from 'lucide-react';
import { QUICK_ACTIONS } from '../constants';

interface ChatInterfaceProps {
  aiConversation: any[];
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  onSendAIMessage: () => void;
}

export default function ChatInterface({
  aiConversation,
  aiPrompt,
  setAiPrompt,
  onSendAIMessage
}: ChatInterfaceProps) {
  return (
    <div className="space-y-4">
      {/* Initial AI Message */}
      {aiConversation.length === 0 && (
        <div className="flex justify-start">
          <div className="max-w-xs px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-800">
            Hi! I'm your AI Resume Assistant. Tell me about your experience and I'll help you craft professional resume content. What position are you applying for?
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {aiConversation.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
              message.role === 'user' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Ask me anything about your resume..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          onKeyPress={(e) => e.key === 'Enter' && onSendAIMessage()}
        />
        <button
          onClick={onSendAIMessage}
          className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-md transition-all"
          title="Send message"
          aria-label="Send AI chat message"
        >
          <Send size={14} />
        </button>
      </div>

      {/* Quick Actions */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_ACTIONS.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button 
                key={index}
                className="p-2 bg-gray-50 text-gray-700 rounded-md text-xs hover:bg-gray-100 transition-all text-left border border-gray-100"
              >
                <IconComponent size={12} className="inline mr-1.5" />
                {action.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

