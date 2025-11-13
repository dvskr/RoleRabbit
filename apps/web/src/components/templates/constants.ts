// Constants for Templates component

import { TemplateSortBy } from './types';

/**
 * Sort options for templates
 */
export const SORT_OPTIONS: Array<{ value: TemplateSortBy; label: string }> = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name (A-Z)' },
];

/**
 * Difficulty level filter options
 */
export const DIFFICULTY_LEVELS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Difficulties' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

/**
 * Layout type filter options
 */
export const LAYOUT_TYPES: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Layouts' },
  { value: 'single-column', label: 'Single Column' },
  { value: 'two-column', label: 'Two Column' },
  { value: 'hybrid', label: 'Hybrid' },
];

/**
 * Color scheme filter options
 */
export const COLOR_SCHEMES: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Colors' },
  { value: 'monochrome', label: 'Monochrome' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'red', label: 'Red' },
  { value: 'orange', label: 'Orange' },
  { value: 'custom', label: 'Custom' },
];

/**
 * Debounce delay for search input (in milliseconds)
 */
export const DEBOUNCE_DELAY = 300;

/**
 * Number of templates to display per page
 */
export const TEMPLATES_PER_PAGE = 12;

/**
 * Duration for success animation after adding template (in milliseconds)
 *
 * @deprecated Use getSuccessAnimationDuration() from utils/accessibility instead
 * This respects user's prefers-reduced-motion setting for better accessibility
 *
 * Normal: 2000ms, Reduced motion: 200ms
 */
export const SUCCESS_ANIMATION_DURATION = 2000;

/**
 * Sample resume data for template previews
 */
export const SAMPLE_RESUME_DATA = {
  name: 'John Doe',
  title: 'Senior Software Engineer',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  summary: 'Experienced software engineer with a passion for building scalable web applications. Expert in React, Node.js, and cloud technologies. Proven track record of leading teams and delivering high-quality products.',
  experiences: [
    {
      role: 'Senior Software Engineer',
      company: 'Tech Corp Inc.',
      period: '2020 - Present',
      bullets: [
        'Led development of core features for a SaaS platform serving 100K+ users',
        'Architected and implemented microservices infrastructure using AWS',
        'Mentored junior developers and improved team productivity by 40%',
        'Optimized application performance resulting in 50% reduction in load time',
      ],
    },
    {
      role: 'Software Engineer',
      company: 'StartupXYZ',
      period: '2018 - 2020',
      bullets: [
        'Developed full-stack web applications using React and Node.js',
        'Collaborated with cross-functional teams to deliver features on time',
        'Implemented automated testing increasing code coverage to 85%',
      ],
    },
    {
      role: 'Junior Developer',
      company: 'WebDev Solutions',
      period: '2016 - 2018',
      bullets: [
        'Built responsive web interfaces using HTML, CSS, and JavaScript',
        'Fixed bugs and improved application stability',
        'Participated in code reviews and agile development processes',
      ],
    },
  ],
  education: {
    degree: 'Bachelor of Science in Computer Science',
    school: 'University of California, Berkeley',
    year: '2016',
  },
  skills: [
    'React',
    'TypeScript',
    'Node.js',
    'AWS',
    'Docker',
    'PostgreSQL',
    'MongoDB',
    'GraphQL',
    'Git',
    'CI/CD',
    'Agile',
    'Leadership',
  ],
};
