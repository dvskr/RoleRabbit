export interface UserData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  profilePicture: string | null;
  
  // Professional Info
  currentRole: string;
  currentCompany: string;
  experience: string;
  industry: string;
  jobLevel: string;
  employmentType: string;
  availability: string;
  salaryExpectation: string;
  workPreference: string;
  
  // Skills & Expertise
  skills: string[];
  certifications: string[];
  languages: string[];
  
  // Career Goals
  careerGoals: string;
  targetRoles: string[];
  targetCompanies: string[];
  relocationWillingness: string;
  
  // Portfolio & Links
  portfolio: string;
  linkedin: string;
  github: string;
  website: string;
  
  // Preferences
  jobAlerts: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  privacyLevel: string;
  profileVisibility: string;
  
  // Analytics & Insights
  profileViews: number;
  applicationsSent: number;
  interviewsScheduled: number;
  offersReceived: number;
  successRate: number;
}

import { LucideIcon } from 'lucide-react';

export interface ProfileTabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface ProfileHeaderProps {
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export interface ProfileSidebarProps {
  activeTab: string;
  tabs: ProfileTabConfig[];
  onTabChange: (tabId: string) => void;
}

export interface FormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
}
