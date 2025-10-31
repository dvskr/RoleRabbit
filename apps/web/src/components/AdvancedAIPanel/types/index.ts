export type AIProvider = 'openai' | 'anthropic' | 'google' | 'local';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: AIProvider;
  capabilities: string[];
  maxTokens: number;
  costPerToken: number;
  isAvailable: boolean;
}

export interface AIRequest {
  id: string;
  prompt: string;
  model: string;
  context?: any;
  userId: string;
  timestamp: Date;
  status: 'pending' | 'streaming' | 'completed' | 'error';
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface AISettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  description: string;
  disabled?: boolean;
}

export interface AdvancedAIPanelProps {
  userId: string;
  resumeData?: any;
  jobDescription?: string;
  className?: string;
}

