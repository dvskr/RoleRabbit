/**
 * Portfolio Tab - Constants
 * 
 * Constants used throughout the Portfolio tab component
 */

export const ACHIEVEMENT_TYPES = [
  'Award',
  'Publication',
  'Speaking',
  'Certification'
] as const;

export const ACHIEVEMENT_TYPE_OPTIONS = [
  { value: 'Award', label: 'Award' },
  { value: 'Publication', label: 'Publication' },
  { value: 'Speaking', label: 'Speaking Engagement' },
  { value: 'Certification', label: 'Certification' }
] as const;

export const PLATFORM_OPTIONS = [
  'LinkedIn',
  'GitHub',
  'Twitter',
  'Medium',
  'Personal Website'
] as const;

// Default form values
export const DEFAULT_LINK_FORM: { platform: string; url: string } = {
  platform: 'LinkedIn',
  url: ''
};

export const DEFAULT_PROJECT_FORM: {
  title: string;
  description: string;
  technologies: string[];
  date: string;
  link?: string;
  github?: string;
} = {
  title: '',
  description: '',
  technologies: [],
  date: '',
  link: '',
  github: ''
};

export const DEFAULT_ACHIEVEMENT_FORM: {
  type: string;
  title: string;
  description: string;
  date: string;
  link?: string;
} = {
  type: 'Award',
  title: '',
  description: '',
  date: '',
  link: ''
};

// Date format
export const DATE_FORMAT_PATTERN = 'YYYY-MM';

// Placeholder texts
export const PLACEHOLDERS = {
  portfolio: 'https://yourportfolio.com',
  linkedin: 'https://linkedin.com/in/yourname',
  github: 'https://github.com/yourusername',
  website: 'https://yourwebsite.com',
  platform: 'e.g., LinkedIn, GitHub',
  url: 'https://',
  projectTitle: 'Project Title',
  projectDescription: 'Description',
  achievementTitle: 'Achievement Title',
  achievementDescription: 'Description',
  date: 'Date (YYYY-MM)',
  tech: 'Add technology',
  liveDemo: 'Live Demo URL (optional)',
  githubUrl: 'GitHub URL (optional)',
  linkOptional: 'Link (optional)'
} as const;
