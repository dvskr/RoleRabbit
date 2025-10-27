'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, Send, Wand2, Loader, Check, X, RotateCcw, Paperclip, FileText, Image } from 'lucide-react';

interface AIPromptPanelProps {
  onPromptSubmit: (prompt: string, attachments?: File[]) => Promise<any>;
  isLoading: boolean;
  onReset: () => void;
  onClose: () => void;
}

export default function AIPromptPanel({ onPromptSubmit, isLoading, onReset, onClose }: AIPromptPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!prompt.trim() && attachments.length === 0) || isLoading) return;

    await onPromptSubmit(prompt, attachments);
    setRecentPrompts(prev => [prompt, ...prev.slice(0, 4)]);
    setPrompt('');
    setAttachments([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image size={16} className="text-blue-500" />;
    return <FileText size={16} className="text-gray-500" />;
  };

  const quickPrompts = [
    'Make it more professional',
    'Add a modern design',
    'Make it more colorful',
    'Simplify the layout',
    'Make it stand out more',
    'Add more personality'
  ];

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-purple-600" size={20} />
            <h3 className="font-semibold text-gray-900">AI Customization</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            title="Close panel"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Describe changes and AI will customize your portfolio
        </p>
      </div>

      {/* Prompt Input */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Make it more modern and minimal... (or attach a reference image)"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-20 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={isLoading}
            />
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf,application/msword"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="absolute bottom-3 right-3 flex gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>
              <button
                type="submit"
                disabled={(!prompt.trim() && attachments.length === 0) || isLoading}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Submit prompt"
              >
                {isLoading ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
          
          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">Attachments:</p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                    {getFileIcon(file)}
                    <span className="text-xs text-gray-700 max-w-[120px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Loader size={16} className="animate-spin" />
              <span>AI is customizing your portfolio...</span>
            </div>
          )}
        </form>
      </div>

      {/* Quick Prompts */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-xs font-medium text-gray-600 mb-2">Quick Prompts</h4>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((quickPrompt, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(quickPrompt)}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors disabled:opacity-50"
            >
              {quickPrompt}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Prompts */}
      {recentPrompts.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-600">Recent</h4>
            <button
              onClick={onReset}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1">
            {recentPrompts.slice(0, 3).map((rp, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(rp)}
                disabled={isLoading}
                className="w-full text-left px-2 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 rounded text-gray-600 truncate transition-colors disabled:opacity-50"
              >
                {rp}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
        <h4 className="text-xs font-medium text-gray-600 mb-2">How it works</h4>
        <ul className="space-y-2 text-xs text-gray-600">
          <li className="flex items-start gap-2">
            <Wand2 size={14} className="text-purple-600 flex-shrink-0 mt-0.5" />
            <span>Describe the changes you want</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles size={14} className="text-purple-600 flex-shrink-0 mt-0.5" />
            <span>AI analyzes and applies changes</span>
          </li>
          <li className="flex items-start gap-2">
            <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
            <span>Review and accept updates</span>
          </li>
        </ul>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> Be specific! "Make it modern with blue colors" works better than just "make it better".
          </p>
        </div>
      </div>
    </div>
  );
}

