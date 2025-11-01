'use client';

import React, { useState } from 'react';
import { Sparkles, Bot } from 'lucide-react';
import EmailComposer from '../components/EmailComposer';
import AIGenerator from '../components/AIGenerator';
import { EmailDraft, AIContext } from '../types/email';
import { logger } from '../../../utils/logger';

export default function ComposeTab() {
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [draft, setDraft] = useState<EmailDraft>({
    id: '1',
    toEmail: '',
    cc: [],
    bcc: [],
    subject: '',
    body: '',
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [aiContext, setAIContext] = useState<AIContext>({
    mode: 'generate',
    tone: 'professional',
    length: 'medium'
  });

  const [aiPrompt, setAiPrompt] = useState('');

  const handleDraftChange = (changes: Partial<EmailDraft>) => {
    setDraft((prev: EmailDraft) => ({ ...prev, ...changes }));
  };

  const handleSend = async (emailData: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          html: emailData.body
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send email');
      }

      const data = await response.json();
      logger.info('Email sent:', data);
      
      // Reset form
      handleCancel();
    } catch (error) {
      logger.error('Failed to send email:', error);
    }
  };

  const handleSave = () => {
    console.log('Saving draft:', draft);
    // In real app, this would save the draft
  };

  const handleCancel = () => {
    setDraft({
      id: '1',
      toEmail: '',
      cc: [],
      bcc: [],
      subject: '',
      body: '',
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const handleAIGenerate = (content: string) => {
    setDraft(prev => ({
      ...prev,
      content: content,
      aiGenerated: true
    }));
    setShowAIGenerator(false);
  };

  const handleAIContextChange = (changes: Partial<AIContext>) => {
    setAIContext(prev => ({ ...prev, ...changes }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Compose Email</h2>
          <p className="text-sm text-gray-600">Write professional emails with AI assistance</p>
        </div>
        <button
          onClick={() => setShowAIGenerator(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Sparkles size={16} />
          AI Generate
        </button>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Bot size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900">AI Email Assistant</h3>
            <p className="text-sm text-purple-700">
              Get personalized email suggestions based on recipient type, industry, and your goals
            </p>
          </div>
        </div>
      </div>

      {/* Email Composer */}
      <EmailComposer
        onSend={handleSend}
        onCancel={handleCancel}
      />

      {/* AI Generator Modal */}
      <AIGenerator
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
      />
    </div>
  );
}
