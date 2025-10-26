'use client';

import React, { useState } from 'react';
import { Send, Paperclip, X, Wand2, Sparkles, RefreshCw, Check, MessageSquare } from 'lucide-react';

interface EmailComposerAIProps {
  recipientEmail?: string;
  recipientName?: string;
  onSend?: (emailData: any) => void;
  onCancel?: () => void;
}

export default function EmailComposerAI({
  recipientEmail = '',
  recipientName = '',
  onSend,
  onCancel,
}: EmailComposerAIProps) {
  const [to, setTo] = useState(recipientEmail);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  
  // AI Assistant states
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);

  const handleSend = () => {
    if (onSend) {
      onSend({
        to,
        cc: cc ? cc.split(',').map(e => e.trim()) : [],
        bcc: bcc ? bcc.split(',').map(e => e.trim()) : [],
        subject,
        body,
        attachments,
      });
    }
  };

  const handleAttach = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        setAttachments([...attachments, ...Array.from(files).map(f => f.name)]);
      }
    };
    input.click();
  };

  const generateFromPrompt = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedContent = `Dear ${recipientName || 'Recipient'},

${aiPrompt}

${'I hope this message finds you well. I wanted to reach out regarding the above matter and would appreciate your input.'.substring(0, 100)}

Thank you for your time and consideration.

Best regards,
[Your Name]`;
    
    setBody(generatedContent);
    setSubject(aiPrompt.substring(0, 50) + (aiPrompt.length > 50 ? '...' : ''));
    setAiPrompt('');
    setShowPromptInput(false);
    setIsGenerating(false);
  };

  const improveWithAI = async () => {
    setIsGenerating(true);
    
    // Simulate AI improvement
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const improved = body + '\n\n[AI-Enhanced: This is an improved version with better clarity and professionalism.]';
    setBody(improved);
    setIsGenerating(false);
  };

  const generateSubject = async () => {
    setIsGenerating(true);
    
    // Simulate subject generation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setSubject('Follow-up on Application - ' + recipientName || 'Hello');
    setIsGenerating(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAttach}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Attach File"
          >
            <Paperclip size={18} className="text-gray-600" />
          </button>
          
          {/* AI Assistant Button */}
          <button
            onClick={() => setShowPromptInput(true)}
            className="p-2 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-2"
            title="AI Generate Email from Prompt"
          >
            <Sparkles size={18} className="text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">Generate</span>
          </button>

          {/* Improve with AI */}
          {body && (
            <button
              onClick={improveWithAI}
              disabled={isGenerating}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title="Improve with AI"
            >
              {isGenerating ? (
                <RefreshCw size={18} className="text-blue-600 animate-spin" />
              ) : (
                <Wand2 size={18} className="text-blue-600" />
              )}
            </button>
          )}

          {/* Generate Subject */}
          {!subject && (
            <button
              onClick={generateSubject}
              disabled={isGenerating}
              className="p-2 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
              title="AI Generate Subject"
            >
              {isGenerating ? (
                <RefreshCw size={18} className="text-green-600 animate-spin" />
              ) : (
                <span className="text-green-600 text-xs font-semibold">AI</span>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!to || !subject || !body}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            <Send size={16} />
            Send
          </button>
        </div>
      </div>

      {/* AI Prompt Input Modal */}
      {showPromptInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-purple-600" />
              AI Generate Email from Prompt
            </h3>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe what you want to write about... e.g., 'Follow up on my job application for the senior developer position'"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowPromptInput(false);
                  setAiPrompt('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={generateFromPrompt}
                disabled={!aiPrompt.trim() || isGenerating}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-4">
          {/* To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To *</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipient email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* CC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CC</label>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc1@example.com, cc2@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* BCC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">BCC</label>
            <input
              type="text"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              placeholder="bcc1@example.com, bcc2@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
                    <Paperclip size={14} />
                    <span>{file}</span>
                    <button
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                      className="ml-2 hover:text-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Body *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email... Click the sparkles icon for AI suggestions!"
              required
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Use AI buttons above for smart suggestions, improvement, and subject generation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

