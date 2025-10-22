// Resume Data Types and Interfaces
export interface Experience {
  id: number;
  company: string;
  role: string;
  period: string;
  endPeriod: string;
  location: string;
  skills: string[];
  bullets: string[];
}

export interface Project {
  id: number;
  name: string;
  subtitle: string;
  link: string;
  description: string;
  skills: string[];
  bullets: string[];
}

export interface Education {
  id: number;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  gpa: string;
  location: string;
}

export interface Certification {
  id: number;
  name: string;
  issuer: string;
  link: string;
  skills: string[];
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
}

export interface Version {
  id: string;
  name: string;
  timestamp: string;
  description: string;
  tags: string[];
  parent: string | null;
  snapshot: ResumeData | null;
  metadata: {
    appliedTo: string[];
    responses: string;
    lastModified: string;
    autoSaved: boolean;
  };
}

export interface AIRecommendation {
  type: 'add' | 'modify' | 'remove';
  section: string;
  content: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AIConversationMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp?: string;
}