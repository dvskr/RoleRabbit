import { ReactNode } from 'react';

export interface Skill {
  name: string;
  yearsOfExperience?: number;
  verified?: boolean;
}

export interface Certification {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialUrl?: string;
  verified?: boolean;
}

export interface Education {
  id?: string;
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  honors?: string;
  location?: string;
  description?: string;
}

export interface Project {
  id?: string;
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
  platform: string;
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

export interface WorkExperience {
  id?: string;
  company: string;
  role: string;
  client?: string; // For client work/projects
  location?: string;
  startDate: string;
  endDate?: string; // Empty string or null if current role
  isCurrent: boolean;
  description?: string;
  achievements?: string[];
  technologies?: string[];
  projectType?: 'Client Project' | 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Consulting';
}

export interface VolunteerExperience {
  id?: string;
  organization: string;
  role: string;
  cause?: string; // e.g., Education, Environment, Health
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  hoursPerWeek?: number;
  totalHours?: number;
}

export interface Recommendation {
  id?: string;
  recommenderName: string;
  recommenderTitle?: string;
  recommenderCompany?: string;
  recommenderRelationship?: string; // e.g., "Managed", "Colleague", "Client"
  content: string;
  date: string;
  isPending?: boolean; // If request is pending
  skills?: string[]; // Skills endorsed in this recommendation
}

export interface Publication {
  id?: string;
  title: string;
  publisher?: string;
  publicationDate: string;
  authors?: string[]; // Co-authors
  type?: 'Article' | 'Paper' | 'Book' | 'Chapter' | 'Conference' | 'Journal';
  url?: string;
  description?: string;
}

export interface Patent {
  id?: string;
  title: string;
  patentNumber?: string;
  issueDate: string;
  inventors?: string[]; // Co-inventors
  status?: 'Filed' | 'Pending' | 'Granted' | 'Expired';
  url?: string;
  description?: string;
}

export interface Organization {
  id?: string;
  name: string;
  type?: 'Professional Association' | 'Club' | 'Society' | 'Non-profit' | 'Other';
  role?: string; // e.g., "Member", "Board Member", "President"
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface TestScore {
  id?: string;
  testName: string; // e.g., "SAT", "GRE", "GMAT", "TOEFL"
  score?: string; // Can be numeric or composite score
  percentile?: number;
  testDate: string;
  expiresDate?: string;
  description?: string;
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
  email: string;  // Login email (read-only, used for authentication)
  personalEmail?: string;  // Personal/contact email (editable, separate from login email)
  phone: string;
  location: string;
  bio: string;
  professionalBio?: string;
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
  
  // Skills and Education
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
  
  // Work Experience History
  workExperiences: WorkExperience[];
  
  // Volunteer Experience
  volunteerExperiences: VolunteerExperience[];
  
  // Recommendations & Endorsements
  recommendations: Recommendation[];
  
  // Publications & Research
  publications: Publication[];
  patents: Patent[];
  
  // Organizations & Associations
  organizations: Organization[];
  
  // Test Scores
  testScores: TestScore[];
  
  // Preferences
  emailNotifications: boolean;
  smsNotifications: boolean;
  privacyLevel: string;
  profileVisibility: string;
  
  // Analytics & Insights (Enhanced)
  profileViews: number;
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
  profileCompleteness?: number;
}

export interface ProfileSidebarProps {
  activeTab: string;
  tabs: ProfileTabConfig[];
  onTabChange: (tabId: string) => void;
}

export interface FormFieldProps {
  label: string | ReactNode;
  type?: 'text' | 'email' | 'tel' | 'url' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  showCounter?: boolean;
  autoResize?: boolean;
  allowBullets?: boolean;
  className?: string;
  id?: string;
  name?: string;
}
