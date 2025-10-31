import { AIModel } from '../types';

export const DEFAULT_AI_SETTINGS = {
  temperature: 0.7,
  maxTokens: 2000,
  topP: 0.9,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0
};

export const AVAILABLE_MODELS: AIModel[] = [
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

export const DEFAULT_SELECTED_MODEL = 'gpt-5';

