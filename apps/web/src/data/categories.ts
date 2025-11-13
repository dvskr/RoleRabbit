/**
 * Template Categories - Single Source of Truth
 *
 * This file centralizes all template category definitions to prevent sync issues.
 * All category types and constants should reference this file.
 */

import { Code, Briefcase, Lightbulb, TrendingUp, GraduationCap, FileText, LucideIcon } from 'lucide-react';

// =============================================================================
// RESUME TEMPLATE CATEGORIES
// =============================================================================

/**
 * Resume template category IDs (single source of truth)
 */
export const RESUME_CATEGORIES = [
  'ats',
  'creative',
  'modern',
  'classic',
  'executive',
  'minimal',
  'academic',
  'technical',
  'startup',
  'freelance',
] as const;

/**
 * Resume template category type derived from constant
 */
export type ResumeCategory = typeof RESUME_CATEGORIES[number];

/**
 * Resume category metadata
 */
export interface ResumeCategoryInfo {
  id: ResumeCategory;
  name: string;
  description: string;
  count: number;
}

/**
 * Resume category metadata with count placeholders
 * Counts should be updated dynamically based on actual template data
 */
export const RESUME_CATEGORY_INFO: ResumeCategoryInfo[] = [
  { id: 'ats', name: 'ATS-Friendly', description: 'Optimized for Applicant Tracking Systems', count: 0 },
  { id: 'creative', name: 'Creative', description: 'Bold, artistic designs for creative professionals', count: 0 },
  { id: 'modern', name: 'Modern', description: 'Contemporary, sleek designs', count: 0 },
  { id: 'classic', name: 'Classic', description: 'Traditional, timeless designs', count: 0 },
  { id: 'executive', name: 'Executive', description: 'Sophisticated designs for leadership roles', count: 0 },
  { id: 'minimal', name: 'Minimal', description: 'Clean, simple designs focusing on content', count: 0 },
  { id: 'academic', name: 'Academic', description: 'Designed for researchers and educators', count: 0 },
  { id: 'technical', name: 'Technical', description: 'Tech-focused designs for engineers and developers', count: 0 },
  { id: 'startup', name: 'Startup', description: 'Dynamic designs for entrepreneurs', count: 0 },
  { id: 'freelance', name: 'Freelance', description: 'Portfolio-focused designs for freelancers', count: 0 },
];

// =============================================================================
// COVER LETTER CATEGORIES
// =============================================================================

/**
 * Cover letter category IDs (single source of truth)
 */
export const COVER_LETTER_CATEGORIES = [
  'tech',
  'business',
  'creative',
  'executive',
  'academic',
  'general',
] as const;

/**
 * Cover letter category type derived from constant
 */
export type CoverLetterCategory = typeof COVER_LETTER_CATEGORIES[number];

/**
 * Cover letter category metadata
 */
export interface CoverLetterCategoryInfo {
  id: CoverLetterCategory | 'all';
  label: string;
  icon: LucideIcon;
}

/**
 * Cover letter category metadata with icons
 */
export const COVER_LETTER_CATEGORY_INFO: CoverLetterCategoryInfo[] = [
  { id: 'all', label: 'All Templates', icon: FileText },
  { id: 'tech', label: 'Tech', icon: Code },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'creative', label: 'Creative', icon: Lightbulb },
  { id: 'executive', label: 'Executive', icon: TrendingUp },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
];

// =============================================================================
// EMAIL TEMPLATE CATEGORIES
// =============================================================================

/**
 * Email template category IDs (single source of truth)
 */
export const EMAIL_CATEGORIES = [
  'Follow-up',
  'Thank You',
  'Introduction',
  'Networking',
  'Application',
  'Custom',
] as const;

/**
 * Email template category type derived from constant
 */
export type EmailCategory = typeof EMAIL_CATEGORIES[number];

/**
 * Email category metadata
 */
export interface EmailCategoryInfo {
  id: EmailCategory;
  label: string;
  description: string;
}

/**
 * Email category metadata
 */
export const EMAIL_CATEGORY_INFO: EmailCategoryInfo[] = [
  { id: 'Follow-up', label: 'Follow-up', description: 'Follow up on applications or interviews' },
  { id: 'Thank You', label: 'Thank You', description: 'Express gratitude after interviews or networking' },
  { id: 'Introduction', label: 'Introduction', description: 'Introduce yourself to recruiters or hiring managers' },
  { id: 'Networking', label: 'Networking', description: 'Build professional connections' },
  { id: 'Application', label: 'Application', description: 'Submit job applications' },
  { id: 'Custom', label: 'Custom', description: 'Create your own template from scratch' },
];

// =============================================================================
// PORTFOLIO CATEGORIES
// =============================================================================

/**
 * Portfolio category IDs (single source of truth)
 */
export const PORTFOLIO_CATEGORIES = [
  'creative',
  'tech',
  'professional',
] as const;

/**
 * Portfolio category type derived from constant
 */
export type PortfolioCategory = typeof PORTFOLIO_CATEGORIES[number];

/**
 * Portfolio category metadata
 */
export interface PortfolioCategoryInfo {
  id: PortfolioCategory;
  label: string;
  description: string;
}

/**
 * Portfolio category metadata
 */
export const PORTFOLIO_CATEGORY_INFO: PortfolioCategoryInfo[] = [
  { id: 'creative', label: 'Creative', description: 'For designers, artists, and creative professionals' },
  { id: 'tech', label: 'Tech', description: 'For developers, engineers, and tech professionals' },
  { id: 'professional', label: 'Professional', description: 'For business and corporate professionals' },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a string is a valid resume category
 */
export function isResumeCategory(value: string): value is ResumeCategory {
  return RESUME_CATEGORIES.includes(value as ResumeCategory);
}

/**
 * Check if a string is a valid cover letter category
 */
export function isCoverLetterCategory(value: string): value is CoverLetterCategory {
  return COVER_LETTER_CATEGORIES.includes(value as CoverLetterCategory);
}

/**
 * Check if a string is a valid email category
 */
export function isEmailCategory(value: string): value is EmailCategory {
  return EMAIL_CATEGORIES.includes(value as EmailCategory);
}

/**
 * Check if a string is a valid portfolio category
 */
export function isPortfolioCategory(value: string): value is PortfolioCategory {
  return PORTFOLIO_CATEGORIES.includes(value as PortfolioCategory);
}

/**
 * Get resume category info by ID
 */
export function getResumeCategoryInfo(id: ResumeCategory | 'all'): ResumeCategoryInfo | null {
  if (id === 'all') return null;
  return RESUME_CATEGORY_INFO.find(cat => cat.id === id) || null;
}

/**
 * Get cover letter category info by ID
 */
export function getCoverLetterCategoryInfo(id: CoverLetterCategory | 'all'): CoverLetterCategoryInfo | null {
  return COVER_LETTER_CATEGORY_INFO.find(cat => cat.id === id) || null;
}

/**
 * Get email category info by ID
 */
export function getEmailCategoryInfo(id: EmailCategory): EmailCategoryInfo | null {
  return EMAIL_CATEGORY_INFO.find(cat => cat.id === id) || null;
}

/**
 * Get portfolio category info by ID
 */
export function getPortfolioCategoryInfo(id: PortfolioCategory): PortfolioCategoryInfo | null {
  return PORTFOLIO_CATEGORY_INFO.find(cat => cat.id === id) || null;
}

// =============================================================================
// INDUSTRY DEFINITIONS
// =============================================================================

/**
 * Standard industry identifiers (single source of truth)
 * Replaces inconsistent string arrays with validated enum
 */
export const INDUSTRIES = [
  // Core Industries
  'Technology',
  'Software',
  'Engineering',
  'IT',
  'Finance',
  'Banking',
  'Investment',
  'Healthcare',
  'Medical',
  'Nursing',
  'Pharmacy',
  'Education',
  'Teaching',
  'Training',
  'Marketing',
  'Advertising',
  'Digital Marketing',
  'Brand Management',
  'Sales',
  'Business Development',
  'Design',
  'Creative',
  'Art',
  'Visual Arts',
  'Consulting',
  'Professional Services',
  'Advisory',
  'Law',
  'Legal',
  'Compliance',
  'Government',
  'Public Sector',
  'Policy',

  // Career Stages & Types
  'Executive',
  'Leadership',
  'Management',
  'C-Suite',
  'Senior Management',
  'Startup',
  'Entrepreneurship',
  'Innovation',
  'Freelance',
  'Independent Contractor',
  'Student',
  'Graduate',
  'Academia',
  'Research',
  'Science',
  'Higher Education',

  // Specializations
  'Data Science',
  'Analytics',
  'DevOps',
  'Cloud',
  'Infrastructure',
  'Cybersecurity',
  'Information Security',
  'Product Management',
  'Strategy',
  'UX Design',
  'UI Design',
  'User Experience',
  'Product Design',
  'Writing',
  'Content',
  'Journalism',
  'Publishing',
  'Photography',
  'Nonprofit',
  'Social Impact',
  'Community',

  // Additional Common Industries
  'Retail',
  'Manufacturing',
  'Construction',
  'Real Estate',
  'Hospitality',
  'Transportation',
  'Logistics',
  'Media',
  'Entertainment',
  'Telecommunications',
  'Energy',
  'Utilities',
  'Agriculture',
  'Environmental',
  'Human Resources',
  'Operations',
  'Quality Assurance',
  'Customer Service',
  'Administration',
] as const;

/**
 * Industry type derived from constant
 */
export type Industry = typeof INDUSTRIES[number];

/**
 * Check if a string is a valid industry
 */
export function isIndustry(value: string): value is Industry {
  return INDUSTRIES.includes(value as Industry);
}

/**
 * Validate an array of industries
 */
export function validateIndustries(industries: string[]): Industry[] {
  return industries.filter(isIndustry);
}

/**
 * Get industries that contain a search term (case-insensitive)
 */
export function searchIndustries(term: string): Industry[] {
  const lowerTerm = term.toLowerCase();
  return INDUSTRIES.filter(industry => industry.toLowerCase().includes(lowerTerm));
}
