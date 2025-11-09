import { ResumeData, SectionVisibility } from '../types/resume';

export const DEFAULT_SECTION_ORDER: string[] = [
  'summary',
  'skills',
  'experience',
  'education',
  'projects',
  'certifications'
];

export const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  summary: true,
  skills: true,
  experience: true,
  education: true,
  projects: true,
  certifications: true
};

export const DEFAULT_FORMATTING = {
  fontFamily: 'arial',
  fontSize: 'ats11pt',
  lineSpacing: 'normal',
  sectionSpacing: 'medium',
  margins: 'normal',
  headingStyle: 'bold',
  bulletStyle: 'disc'
} as const;

export const createDefaultResumeData = (): ResumeData => ({
  name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: []
});
