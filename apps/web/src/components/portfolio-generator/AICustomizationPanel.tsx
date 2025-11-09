'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

type PortfolioTheme = 'light' | 'dark';
type PortfolioTemplate = 'modern' | 'minimal' | 'creative' | string;
type PortfolioColor = 'blue' | 'purple' | 'green' | string;

interface PortfolioDataShape {
  template?: PortfolioTemplate;
  colorScheme?: PortfolioColor;
  showAnimations?: boolean;
  theme?: PortfolioTheme | string;
  [key: string]: unknown;
}

interface AICustomizationPanelProps {
  portfolioData: PortfolioDataShape;
  onUpdate: (data: PortfolioDataShape) => void;
}

export default function AICustomizationPanel({ portfolioData, onUpdate }: AICustomizationPanelProps) {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { role: 'assistant', content: 'Hi! I can help you customize your portfolio. What would you like to change? Try: "Make it more modern" or "Change colors to blue"' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI understanding and making changes
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      const updatedData = { ...portfolioData };
      let response = '';

      if (lowerInput.includes('modern') || lowerInput.includes('contemporary')) {
        updatedData.template = 'modern';
        response = 'Updated to modern design with sleek animations!';
      } else if (lowerInput.includes('minimal') || lowerInput.includes('simple')) {
        updatedData.template = 'minimal';
        response = 'Switched to minimal design - clean and focused!';
      } else if (lowerInput.includes('creative') || lowerInput.includes('bold')) {
        updatedData.template = 'creative';
        response = 'Applied creative template with vibrant colors!';
      } else if (lowerInput.includes('blue')) {
        updatedData.colorScheme = 'blue';
        response = 'Changed color scheme to blue!';
      } else if (lowerInput.includes('purple')) {
        updatedData.colorScheme = 'purple';
        response = 'Updated to purple color scheme!';
      } else if (lowerInput.includes('green')) {
        updatedData.colorScheme = 'green';
        response = 'Switched to green theme!';
      } else if (lowerInput.includes('animation')) {
        updatedData.showAnimations = !updatedData.showAnimations;
        response = updatedData.showAnimations ? 'Animations enabled!' : 'Animations disabled!';
      } else if (lowerInput.includes('dark') || lowerInput.includes('theme')) {
        updatedData.theme = 'dark';
        response = 'Applied dark theme!';
      } else if (lowerInput.includes('light') || lowerInput.includes('bright')) {
        updatedData.theme = 'light';
        response = 'Switched to light theme!';
      } else {
        response = 'I have made the changes you requested!';
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      onUpdate(updatedData);
      setIsTyping(false);
    }, 1500);
  };

  const quickActions = [
    { label: 'Modern Style', prompt: 'Make it more modern' },
    { label: 'Blue Theme', prompt: 'Change colors to blue' },
    { label: 'Add Animations', prompt: 'Enable animations' },
    { label: 'Professional', prompt: 'Make it more professional' }
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <div className="w-96 h-full bg-white border-l border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Customization</h3>
            <p className="text-xs text-gray-600">Live changes to your portfolio</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-white" />
              </div>
            )}
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Send size={14} className="text-gray-600" />
              </div>
            )}
            
            <div className={`flex-1 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
              <div
                className={`inline-block px-4 py-2 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-gray-200 space-y-4">
        {/* Quick Actions */}
        <div>
          <p className="text-xs font-medium text-gray-700 mb-2">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action.prompt)}
                className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-xs hover:bg-gray-100 transition-colors text-left border border-gray-200"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe the changes..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50"
            aria-label="Send customization request"
            title="Send"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

