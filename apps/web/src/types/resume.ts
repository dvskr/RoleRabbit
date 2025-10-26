// TypeScript interfaces for resume management
export interface CustomField {
  id: string;
  name: string;
  icon?: string;
  value?: string;
}

export interface ExperienceItem {
  id: number;
  company: string;
  position: string;
  period: string;
  endPeriod: string;
  location: string;
  bullets: string[];
  environment: string[];
  customFields: CustomField[];
}

export interface ProjectItem {
  id: number;
  name: string;
  description: string;
  link: string;
  bullets: string[];
  skills: string[];
  customFields: CustomField[];
}

export interface EducationItem {
  id: number;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  customFields: CustomField[];
}

export interface CertificationItem {
  id: number;
  name: string;
  issuer: string;
  link: string;
  skills: string[];
  customFields: CustomField[];
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
}

export interface CustomSection {
  id: string;
  name: string;
  content: string;
}

export interface AIMessage {
  role: string;
  text: string;
}

export interface SectionVisibility {
  [key: string]: boolean;
}
