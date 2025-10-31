import { Briefcase, Settings, Palette, Crown, BarChart3, FileText, Lightbulb, Shield, Star, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

export const TONE_OPTIONS = [
  { id: 'professional', name: 'Professional', icon: Briefcase, description: 'Formal and polished', color: 'text-amber-600' },
  { id: 'technical', name: 'Technical', icon: Settings, description: 'Detailed and precise', color: 'text-gray-600' },
  { id: 'creative', name: 'Creative', icon: Palette, description: 'Dynamic and engaging', color: 'text-pink-600' },
  { id: 'executive', name: 'Executive', icon: Crown, description: 'Strategic and leadership-focused', color: 'text-blue-600' },
  { id: 'results', name: 'Results', icon: BarChart3, description: 'Metrics and impact-focused', color: 'text-green-600' }
];

export const LENGTH_OPTIONS = [
  { id: 'concise', name: 'Concise', description: 'Short and punchy' },
  { id: 'medium', name: 'Medium', description: 'Balanced detail' },
  { id: 'detailed', name: 'Detailed', description: 'Full detail' }
];

export const QUICK_ACTIONS = [
  { name: 'Write Summary', icon: FileText },
  { name: 'Suggest Skills', icon: Lightbulb },
  { name: 'Make it ATS-friendly', icon: Shield },
  { name: 'Optimize for [job title]', icon: Briefcase },
  { name: 'Improve Bullets', icon: Star },
  { name: 'Review Resume', icon: CheckCircle },
  { name: 'Add Achievements', icon: TrendingUp },
  { name: 'Check for Errors', icon: AlertCircle }
];

export const AI_MODELS = [
  { id: 'gpt-5', name: 'GPT-5', description: 'Latest OpenAI model with advanced reasoning', capabilities: ['multimodal', 'code-generation', 'creative-writing'] },
  { id: 'sonnet-4.5', name: 'Sonnet 4.5', description: 'Anthropic\'s latest model with enhanced safety', capabilities: ['safety', 'long-context', 'creative-writing'] },
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model for complex tasks', capabilities: ['text-generation', 'analysis', 'reasoning'] },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks', capabilities: ['text-generation', 'analysis'] },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Anthropic\'s most powerful model', capabilities: ['text-generation', 'analysis', 'reasoning'] }
];

export const TONE_ICON_MAP: Record<string, string> = {
  professional: '💼',
  technical: '⚙️',
  creative: '🎨',
  casual: '😊'
};

export const TONE_LABEL_MAP: Record<string, string> = {
  professional: 'Professional',
  technical: 'Technical',
  creative: 'Creative',
  casual: 'Casual'
};

export const LENGTH_COMPACT_OPTIONS = [
  { id: 'concise', label: 'Brief', desc: 'Short' },
  { id: 'detailed', label: 'Thorough', desc: 'Medium' },
  { id: 'comprehensive', label: 'Complete', desc: 'Full' }
];

export const REQUIRED_SECTIONS = ['summary', 'experience', 'education', 'skills'];

export const COMMON_KEYWORDS = [
  'experience', 'skills', 'years', 'work', 'project', 'team', 
  'leadership', 'communication', 'technical', 'development', 
  'management', 'strategy'
];

