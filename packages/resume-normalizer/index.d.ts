export interface NormalizedContact {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  links?: string[];
}

export interface NormalizedExperience {
  id: string;
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  environment: string[];
  bullets: string[];
  technologies: string[];
}

export interface NormalizedEducation {
  id: string;
  institution?: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
}

export interface NormalizedProject {
  id: string;
  name?: string;
  summary?: string;
  link?: string;
  bullets: string[];
  technologies: string[];
}

export interface NormalizedCertification {
  id: string;
  name?: string;
  issuer?: string;
  link?: string;
  skills: string[];
}

export interface NormalizedSkillGroup {
  technical: string[];
  tools?: string[];
  soft?: string[];
}

export interface NormalizedResumeData {
  summary: string;
  contact?: NormalizedContact;
  skills: NormalizedSkillGroup;
  experience: NormalizedExperience[];
  education: NormalizedEducation[];
  projects: NormalizedProject[];
  certifications: NormalizedCertification[];
}

export declare function normalizeResumeData(input: unknown): NormalizedResumeData;

