'use client';

import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import type { EmailComposerAIProps, EmailTemplate } from './EmailComposerAI/types/EmailComposerAI.types';
import {
  extractTemplateVariables,
  applyTemplateVariables,
  formatEmailData,
} from './EmailComposerAI/utils/emailComposerAI.utils';
import { useEmailTemplates } from './EmailComposerAI/hooks/useEmailTemplates';
import { useAIGeneration } from './EmailComposerAI/hooks/useAIGeneration';
import { AttachmentList } from './EmailComposerAI/components/AttachmentList';
import { EmailFormFields } from './EmailComposerAI/components/EmailFormFields';
import { EmailToolbar } from './EmailComposerAI/components/EmailToolbar';
import { PromptInputModal } from './EmailComposerAI/components/PromptInputModal';
import { TemplateSelectionModal } from './EmailComposerAI/components/TemplateSelectionModal';

export default function EmailComposerAI({
  recipientEmail = '',
  recipientName = '',
  onSend,
  onCancel,
}: EmailComposerAIProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [to, setTo] = useState(recipientEmail);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  
  // Assistant states
  const [aiPrompt, setAiPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const aiGeneration = useAIGeneration();
  const { isGenerating, generateFromPrompt: generateFromPromptHook, improveEmail, generateSubject: generateSubjectHook } = aiGeneration;
  
  // Template states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const { templates } = useEmailTemplates();

  const handleSend = () => {
    if (onSend) {
      onSend(formatEmailData({ to, cc, bcc, subject, body, attachments }));
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

  const handleGenerateFromPrompt = async () => {
    if (!aiPrompt.trim()) return;
    
    const { subject: generatedSubject, body: generatedBody } = await generateFromPromptHook(aiPrompt, recipientName);
    
    setBody(generatedBody);
    setSubject(generatedSubject);
    setAiPrompt('');
    setShowPromptInput(false);
  };

  const handleImproveWithAI = async () => {
    const improved = await improveEmail(body);
    setBody(improved);
  };

  const handleGenerateSubject = async () => {
    const generatedSubject = await generateSubjectHook(recipientName);
    setSubject(generatedSubject);
  };

  const applyTemplate = (template: EmailTemplate, values: Record<string, string> = {}) => {
    const { subject: finalSubject, body: finalBody } = applyTemplateVariables(template, values);
    setSubject(finalSubject);
    setBody(finalBody);
    setShowTemplateModal(false);
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    const vars = extractTemplateVariables(template);
    if (vars.length === 0) {
      applyTemplate(template);
    } else {
      // TODO: support variable prompts; for now apply with empty values
      applyTemplate(template);
    }
  };


  return (
    <div className="h-full flex flex-col" style={{ background: colors.background }}>
      {/* Toolbar */}
      <EmailToolbar
        onAttach={handleAttach}
        onUseTemplate={() => setShowTemplateModal(true)}
        onGenerate={() => setShowPromptInput(true)}
        onImprove={handleImproveWithAI}
        onGenerateSubject={handleGenerateSubject}
        onCancel={onCancel}
        onSend={handleSend}
        isGenerating={isGenerating}
        hasBody={!!body}
        hasSubject={!!subject}
        canSend={!!(to && subject && body)}
        colors={colors}
      />

      {/* Prompt Input Modal */}
      <PromptInputModal
        isOpen={showPromptInput}
        prompt={aiPrompt}
        isGenerating={isGenerating}
        onPromptChange={setAiPrompt}
        onGenerate={handleGenerateFromPrompt}
        onClose={() => {
          setShowPromptInput(false);
          setAiPrompt('');
        }}
        colors={colors}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ background: colors.background }}>
        <div className="p-6">
          <EmailFormFields
            to={to}
            cc={cc}
            bcc={bcc}
            subject={subject}
            body={body}
            onToChange={setTo}
            onCcChange={setCc}
            onBccChange={setBcc}
            onSubjectChange={setSubject}
            onBodyChange={setBody}
            colors={colors}
          />
          <AttachmentList
            attachments={attachments}
            onRemove={(idx) => setAttachments(attachments.filter((_, i) => i !== idx))}
            colors={colors}
          />
        </div>
      </div>

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        isOpen={showTemplateModal}
        templates={templates}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleSelectTemplate}
        colors={colors}
      />
    </div>
  );
}

