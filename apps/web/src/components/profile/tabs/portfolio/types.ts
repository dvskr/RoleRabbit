/**
 * Portfolio Tab - Type Definitions
 * 
 * Component-specific types for the Portfolio tab
 */

export interface PortfolioTabProps {
  userData: import('../types/profile').UserData;
  isEditing: boolean;
  onUserDataChange: (data: Partial<import('../types/profile').UserData>) => void;
}

// Form State Types
export interface LinkFormState {
  platform: string;
  url: string;
}

export interface ProjectFormState {
  title: string;
  description: string;
  technologies: string[];
  date: string;
  link?: string;
  github?: string;
}

export interface AchievementFormState {
  type: string;
  title: string;
  description: string;
  date: string;
  link?: string;
}

// Re-export commonly used types for convenience
export type { 
  SocialLink, 
  Project, 
  Achievement 
} from '../types/profile';
