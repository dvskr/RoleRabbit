export interface Skill {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience?: number;
  verified?: boolean;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialUrl?: string;
  verified?: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
  description?: string;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  media?: string[];
  date: string;
}

export interface Achievement {
  title: string;
  description: string;
  date: string;
  type: 'Award' | 'Publication' | 'Speaking' | 'Certification' | 'Other';
  link?: string;
}

export interface SocialLink {
  platform: 'LinkedIn' | 'GitHub' | 'Twitter' | 'Behance' | 'Dribbble' | 'Medium' | 'Personal Website';
  url: string;
}

export interface CareerGoal {
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  category: 'Role' | 'Company' | 'Location' | 'Skill' | 'Education' | 'Other';
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'Education' | 'Work' | 'Achievement' | 'Certification' | 'Project' | 'Milestone';
  icon?: string;
  color?: string;
}

export interface ProfessionalSummary {
  overview: string;
  keyStrengths: string[];
  currentFocus: string;
  achievements: string[];
  lookingFor?: string;
}

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
  professionalSummary?: ProfessionalSummary;
  
  // Skills & Expertise (Enhanced with Proficiency)
  skills: Skill[];
  certifications: Certification[];
  languages: Array<{ name: string; proficiency: string }>;
  
  // Education History
  education: Education[];
  
  // Career Goals (Enhanced)
  careerGoals: CareerGoal[];
  targetRoles: string[];
  targetCompanies: string[];
  relocationWillingness: string;
  
  // Portfolio & Links (Enhanced)
  portfolio: string;
  linkedin: string;
  github: string;
  website: string;
  socialLinks: SocialLink[];
  projects: Project[];
  achievements: Achievement[];
  
  // Career Timeline
  careerTimeline: TimelineEvent[];
  
  // Preferences
  jobAlerts: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  privacyLevel: string;
  profileVisibility: string;
  
  // Analytics & Insights (Enhanced)
  profileViews: number;
  applicationsSent: number;
  interviewsScheduled: number;
  offersReceived: number;
  successRate: number;
  profileCompleteness: number;
  skillMatchRate: number;
  avgResponseTime: number;
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
  isSaved?: boolean;
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
