'use client';

import React, { useState } from 'react';
import { X, Bot, Sparkles, Target, MessageSquare, Send } from 'lucide-react';

interface AIOptimizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiMode: 'tailor' | 'chat';
  onModeChange: (mode: 'tailor' | 'chat') => void;
  onTailorResume: (jobDescription: string) => void;
  onChatMessage: (message: string) => void;
  chatMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  isProcessing: boolean;
}

export default function AIOptimizeModal({
  isOpen,
  onClose,
  aiMode,
  onModeChange,
  onTailorResume,
  onChatMessage,
  chatMessages,
  isProcessing
}: AIOptimizeModalProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [chatInput, setChatInput] = useState('');

  const handleTailorSubmit = () => {
    if (jobDescription.trim()) {
      onTailorResume(jobDescription.trim());
    }
  };

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      onChatMessage(chatInput.trim());
      setChatInput('');
    }
  };

  const handleClose = () => {
    setJobDescription('');
    setChatInput('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Resume Assistant
          </h3>
          <button 
            onClick={handleClose} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => onModeChange('tailor')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              aiMode === 'tailor'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Target size={16} className="inline mr-2" />
            Tailor for Job
          </button>
          <button
            onClick={() => onModeChange('chat')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              aiMode === 'chat'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MessageSquare size={16} className="inline mr-2" />
            AI Chat
          </button>
        </div>

        {/* Tailor Mode */}
        {aiMode === 'tailor' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Target size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Job Tailoring</h4>
                  <p className="text-sm text-gray-600">Optimize your resume for a specific job</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    rows={6}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleTailorSubmit}
                  disabled={!jobDescription.trim() || isProcessing}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Tailoring Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Tailor Resume
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Mode */}
        {aiMode === 'chat' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">AI Chat Assistant</h4>
                  <p className="text-sm text-gray-600">Get personalized resume advice</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                  placeholder="Ask me anything about your resume..."
                  className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || isProcessing}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
