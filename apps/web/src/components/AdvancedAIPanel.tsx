import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, Sparkles, Settings, Zap, Brain, Target, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useAIStreaming } from '../services/webSocketService';

interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: 'openai' | 'anthropic' | 'google' | 'local';
  capabilities: string[];
  maxTokens: number;
  costPerToken: number;
  isAvailable: boolean;
}

interface AIRequest {
  id: string;
  prompt: string;
  model: string;
  context?: any;
  userId: string;
  timestamp: Date;
  status: 'pending' | 'streaming' | 'completed' | 'error';
}

interface AdvancedAIPanelProps {
  userId: string;
  resumeData?: any;
  jobDescription?: string;
  className?: string;
}

export const AdvancedAIPanel: React.FC<AdvancedAIPanelProps> = ({
  userId,
  resumeData,
  jobDescription,
  className = ''
}) => {
  const [selectedModel, setSelectedModel] = useState<string>('gpt-5');
  const [aiPrompt, setAiPrompt] = useState('');
  const [conversation, setConversation] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    model?: string;
  }>>([]);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [aiSettings, setAiSettings] = useState({
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [aiHistory, setAiHistory] = useState<AIRequest[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const { requestAIResponse } = useAIStreaming();
  const promptRef = useRef<HTMLTextAreaElement>(null);

  // Available AI models
  const availableModels: AIModel[] = [
    {
      id: 'gpt-5',
      name: 'GPT-5',
      description: 'Latest OpenAI model with advanced reasoning and multimodal capabilities',
      provider: 'openai',
      capabilities: ['text-generation', 'analysis', 'reasoning', 'multimodal', 'code-generation', 'creative-writing'],
      maxTokens: 128000,
      costPerToken: 0.00005,
      isAvailable: true
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      description: 'Enhanced GPT-4 with larger context window',
      provider: 'openai',
      capabilities: ['text-generation', 'analysis', 'reasoning', 'multimodal'],
      maxTokens: 128000,
      costPerToken: 0.00001,
      isAvailable: true
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Most capable model for complex tasks',
      provider: 'openai',
      capabilities: ['text-generation', 'analysis', 'reasoning'],
      maxTokens: 8192,
      costPerToken: 0.00003,
      isAvailable: true
    },
    {
      id: 'claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      description: 'Latest Anthropic model with enhanced reasoning and code capabilities',
      provider: 'anthropic',
      capabilities: ['text-generation', 'analysis', 'reasoning', 'code-generation', 'creative-writing'],
      maxTokens: 200000,
      costPerToken: 0.000003,
      isAvailable: true
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      description: 'Anthropic\'s most powerful model',
      provider: 'anthropic',
      capabilities: ['text-generation', 'analysis', 'reasoning'],
      maxTokens: 200000,
      costPerToken: 0.000015,
      isAvailable: true
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      description: 'Balanced performance and speed',
      provider: 'anthropic',
      capabilities: ['text-generation', 'analysis'],
      maxTokens: 200000,
      costPerToken: 0.000003,
      isAvailable: true
    },
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      description: 'Google\'s latest multimodal model with enhanced capabilities',
      provider: 'google',
      capabilities: ['text-generation', 'analysis', 'multimodal', 'code-generation'],
      maxTokens: 1000000,
      costPerToken: 0.00000075,
      isAvailable: true
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      description: 'Google\'s advanced language model',
      provider: 'google',
      capabilities: ['text-generation', 'analysis'],
      maxTokens: 30720,
      costPerToken: 0.0000005,
      isAvailable: true
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient for most tasks',
      provider: 'openai',
      capabilities: ['text-generation', 'analysis'],
      maxTokens: 4096,
      costPerToken: 0.000002,
      isAvailable: true
    }
  ];

  const selectedModelData = availableModels.find(m => m.id === selectedModel);

  // AI Analysis functions
  const analyzeResume = useCallback(async () => {
    if (!resumeData) return;

    setIsAnalyzing(true);
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

    const requestId = requestAIResponse(analysisPrompt, userId);
    if (requestId) {
      setCurrentRequestId(requestId);
    }
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

    const requestId = requestAIResponse(optimizationPrompt, userId);
    if (requestId) {
      setCurrentRequestId(requestId);
    }
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

    const requestId = requestAIResponse(coverLetterPrompt, userId);
    if (requestId) {
      setCurrentRequestId(requestId);
    }
  }, [resumeData, jobDescription, userId, requestAIResponse]);

  const handleSendMessage = useCallback(async () => {
    if (!aiPrompt.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: aiPrompt,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setAiPrompt('');

    // Add context if available
    let contextualPrompt = aiPrompt;
    if (resumeData) {
      contextualPrompt = `Resume context: ${JSON.stringify(resumeData)}\n\nUser question: ${aiPrompt}`;
    }

    const requestId = requestAIResponse(contextualPrompt, userId);
    if (requestId) {
      setCurrentRequestId(requestId);
      setIsStreaming(true);
      setStreamingResponse('');
    }
  }, [aiPrompt, resumeData, userId, requestAIResponse]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Quick action buttons
  const quickActions = [
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

  return (
    <div className={`advanced-ai-panel bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-sm text-gray-600">
                {selectedModelData?.name} • {selectedModelData?.provider}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="AI Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-1 text-sm text-gray-600">
              {isStreaming ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Ready</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="p-4 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Model
        </label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          {availableModels.map((model) => (
            <option key={model.id} value={model.id} disabled={!model.isAvailable}>
              {model.name} - {model.description}
            </option>
          ))}
        </select>
        
        {selectedModelData && (
          <div className="mt-2 text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>Max tokens: {selectedModelData.maxTokens.toLocaleString()}</span>
              <span>Cost: ${selectedModelData.costPerToken.toFixed(6)}/token</span>
              <span>Provider: {selectedModelData.provider}</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-1 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                disabled={action.disabled || isStreaming}
                className="flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={action.description}
              >
                <Icon className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{action.label}</div>
                  <div className="text-xs text-gray-600">{action.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Settings */}
      {showSettings && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">AI Settings</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Temperature: {aiSettings.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={aiSettings.temperature}
                onChange={(e) => setAiSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Max Tokens: {aiSettings.maxTokens}
              </label>
              <input
                type="range"
                min="100"
                max="4000"
                step="100"
                value={aiSettings.maxTokens}
                onChange={(e) => setAiSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Conversation */}
      <div className="flex-1 p-4 space-y-4 max-h-96 overflow-y-auto">
        {conversation.map((message) => (
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

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            ref={promptRef}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI to help with your resume..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={2}
            disabled={isStreaming}
          />
          <button
            onClick={handleSendMessage}
            disabled={!aiPrompt.trim() || isStreaming}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default AdvancedAIPanel;
