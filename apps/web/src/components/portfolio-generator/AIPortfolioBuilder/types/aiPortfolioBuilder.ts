// Main component props
export interface AIPortfolioBuilderProps {
  onClose?: () => void;
  profileData?: any;
}

// Portfolio section types
export interface PortfolioSection {
  id: string;
  name: string;
  visible: boolean;
  required?: boolean;
}

// Chat message types
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Step types
export type Step = 'setup' | 'generate' | 'edit' | 'deploy';

export interface StepConfig {
  id: Step;
  label: string;
}

// Tab types
export type TabType = 'ai-chat' | 'style' | 'sections';

// Device view types
export type DeviceView = 'desktop' | 'tablet' | 'mobile';

// Design style types
export type DesignStyle = 'clean' | 'moderate' | 'creative';

export interface DesignStyleConfig {
  id: DesignStyle;
  label: string;
  description: string;
  features: string;
}

// Theme color types
export interface ThemeColor {
  name: string;
  value: string;
  color: string;
}

// Quick action types
export type QuickActionType = 'upload-resume' | 'use-profile' | 'start-scratch';

// Export ThemeColors for component use
export type { ThemeColors } from '../../../../contexts/ThemeContext';

