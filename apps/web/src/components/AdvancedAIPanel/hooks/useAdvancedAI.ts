import { useState, useCallback, useRef } from 'react';
import { useAIStreaming } from '../../../services/webSocketService';
import {
  ConversationMessage,
  AISettings,
  QuickAction
} from '../types';
import { DEFAULT_AI_SETTINGS } from '../constants';
import { Bot, Target, Zap } from 'lucide-react';

interface UseAdvancedAIProps {
  userId: string;
  resumeData?: any;
  jobDescription?: string;
  selectedModel: string;
}

export const useAdvancedAI = ({
  userId,
  resumeData,
  jobDescription,
  selectedModel
}: UseAdvancedAIProps) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);

  const { requestAIResponse } = useAIStreaming();
  const promptRef = useRef<HTMLTextAreaElement>(null);

  // AI Analysis functions
  const analyzeResume = useCallback(async () => {
    if (!resumeData) return;

    const analysisPrompt = `
      Analyze this resume for the following aspects:
      1. Overall structure and formatting
      2. Content quality and completeness
      3. Keyword optimization
      4. ATS compatibility
      5. Areas for improvement
      
      Resume data: ${JSON.stringify(resumeData)}
      
      Provide specific, actionable recommendations.
    `;

    requestAIResponse(analysisPrompt, userId);
  }, [resumeData, userId, requestAIResponse]);

  const optimizeForJob = useCallback(async () => {
    if (!resumeData || !jobDescription) return;

    const optimizationPrompt = `
      Optimize this resume for the following job description:
      
      Job Description: ${jobDescription}
      
      Resume: ${JSON.stringify(resumeData)}
      
      Provide:
      1. Keyword optimization suggestions
      2. Content adjustments
      3. Skills to highlight
      4. Experience to emphasize
      5. Missing elements to add
    `;

    requestAIResponse(optimizationPrompt, userId);
  }, [resumeData, jobDescription, userId, requestAIResponse]);

  const generateCoverLetter = useCallback(async () => {
    if (!resumeData || !jobDescription) return;

    const coverLetterPrompt = `
      Generate a professional cover letter based on:
      
      Resume: ${JSON.stringify(resumeData)}
      Job Description: ${jobDescription}
      
      Make it:
      - Professional and engaging
      - Specific to the role
      - Highlight relevant experience
      - Show enthusiasm for the position
    `;

    requestAIResponse(coverLetterPrompt, userId);
  }, [resumeData, jobDescription, userId, requestAIResponse]);

  const handleSendMessage = useCallback(async () => {
    if (!aiPrompt.trim()) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: aiPrompt,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);

    // Add context if available
    let contextualPrompt = aiPrompt;
    if (resumeData) {
      contextualPrompt = `Resume context: ${JSON.stringify(resumeData)}\n\nUser question: ${aiPrompt}`;
    }

    requestAIResponse(contextualPrompt, userId);
    setIsStreaming(true);
    setStreamingResponse('');
    setAiPrompt('');
  }, [aiPrompt, resumeData, userId, requestAIResponse]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Quick action buttons
  const quickActions: QuickAction[] = [
    {
      id: 'analyze',
      label: 'Analyze Resume',
      icon: Target,
      action: analyzeResume,
      description: 'Get detailed analysis and recommendations'
    },
    {
      id: 'optimize',
      label: 'Optimize for Job',
      icon: Zap,
      action: optimizeForJob,
      description: 'Tailor resume for specific job',
      disabled: !jobDescription
    },
    {
      id: 'cover-letter',
      label: 'Generate Cover Letter',
      icon: Bot,
      action: generateCoverLetter,
      description: 'Create personalized cover letter',
      disabled: !jobDescription
    }
  ];

  return {
    aiPrompt,
    conversation,
    isStreaming,
    streamingResponse,
    aiSettings,
    promptRef,
    setAiPrompt,
    setAiSettings,
    handleSendMessage,
    handleKeyPress,
    quickActions
  };
};

