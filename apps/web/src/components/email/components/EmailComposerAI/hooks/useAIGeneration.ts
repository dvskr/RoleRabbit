import { useState } from 'react';
import { AI_GENERATION_DELAYS } from '../utils/emailComposerAI.constants';
import {
  generateEmailFromPrompt,
  improveEmailContent,
  generateSubjectFromRecipient,
} from '../utils/emailComposerAI.utils';

interface UseAIGenerationReturn {
  isGenerating: boolean;
  generateFromPrompt: (prompt: string, recipientName: string) => Promise<{ subject: string; body: string }>;
  improveEmail: (body: string) => Promise<string>;
  generateSubject: (recipientName: string) => Promise<string>;
}

export function useAIGeneration(): UseAIGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateFromPrompt = async (prompt: string, recipientName: string) => {
    if (!prompt.trim()) {
      return { subject: '', body: '' };
    }
    
    setIsGenerating(true);
    
    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, AI_GENERATION_DELAYS.GENERATE_FROM_PROMPT));
    
    const result = generateEmailFromPrompt(prompt, recipientName);
    setIsGenerating(false);
    
    return result;
  };

  const improveEmail = async (body: string) => {
    setIsGenerating(true);
    
    // Simulate improvement
    await new Promise(resolve => setTimeout(resolve, AI_GENERATION_DELAYS.IMPROVE_EMAIL));
    
    const improved = improveEmailContent(body);
    setIsGenerating(false);
    
    return improved;
  };

  const generateSubject = async (recipientName: string) => {
    setIsGenerating(true);
    
    // Simulate subject generation
    await new Promise(resolve => setTimeout(resolve, AI_GENERATION_DELAYS.GENERATE_SUBJECT));
    
    const subject = generateSubjectFromRecipient(recipientName);
    setIsGenerating(false);
    
    return subject;
  };

  return {
    isGenerating,
    generateFromPrompt,
    improveEmail,
    generateSubject,
  };
}

