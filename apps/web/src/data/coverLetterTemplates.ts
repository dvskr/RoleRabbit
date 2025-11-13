/**
 * Cover Letter Templates Data
 *
 * This file contains all predefined cover letter templates with their metadata.
 * Templates are used in the Cover Letter Generator feature.
 */

import { CoverLetterTemplate } from '../components/coverletter/types/coverletter';
import { Code, Briefcase, Lightbulb, TrendingUp, GraduationCap, FileText, LucideIcon } from 'lucide-react';

export interface CoverLetterCategory {
  id: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Available template categories
 */
export const coverLetterCategories: CoverLetterCategory[] = [
  { id: 'all', label: 'All Templates', icon: FileText },
  { id: 'tech', label: 'Tech', icon: Code },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'creative', label: 'Creative', icon: Lightbulb },
  { id: 'executive', label: 'Executive', icon: TrendingUp },
  { id: 'academic', label: 'Academic', icon: GraduationCap }
];

/**
 * Predefined cover letter templates
 * These templates serve as starting points for users to create their cover letters
 */
export const coverLetterTemplates: CoverLetterTemplate[] = [
  {
    id: '1',
    name: 'Professional Modern',
    category: 'tech',
    description: 'Clean and modern design perfect for tech roles. ATS-optimized with clear sections.',
    content: 'Dear Hiring Manager,\n\nI am writing to express my strong interest...',
    wordCount: 280,
    aiGenerated: true,
    successRate: 98,
    usageCount: 45,
    tags: ['Tech', 'Modern', 'ATS-Friendly']
  },
  {
    id: '2',
    name: 'Executive Classic',
    category: 'executive',
    description: 'Traditional format ideal for senior positions. Emphasizes leadership and achievements.',
    content: 'Dear Hiring Manager,\n\nI am writing to express my strong interest...',
    wordCount: 320,
    aiGenerated: true,
    successRate: 96,
    usageCount: 32,
    tags: ['Executive', 'Classic', 'Leadership']
  },
  {
    id: '3',
    name: 'Creative Bold',
    category: 'creative',
    description: 'Eye-catching design for creative industries. Balances style with professionalism.',
    content: 'Dear Hiring Manager,\n\nI am excited to apply...',
    wordCount: 290,
    aiGenerated: false,
    successRate: 92,
    usageCount: 28,
    tags: ['Creative', 'Design', 'Unique']
  },
  {
    id: '4',
    name: 'Business Professional',
    category: 'business',
    description: 'Straightforward and professional for business roles. Clean typography and layout.',
    content: 'Dear Hiring Manager,\n\nI am writing to apply...',
    wordCount: 300,
    aiGenerated: true,
    successRate: 95,
    usageCount: 38,
    tags: ['Business', 'Corporate', 'Professional']
  },
  {
    id: '5',
    name: 'Academic Formal',
    category: 'academic',
    description: 'Formal template for academic and research positions. Emphasizes publications.',
    content: 'Dear Hiring Manager,\n\nI am writing to express my interest...',
    wordCount: 350,
    aiGenerated: true,
    successRate: 94,
    usageCount: 22,
    tags: ['Academic', 'Research', 'Formal']
  },
  {
    id: '6',
    name: 'Startup Ready',
    category: 'tech',
    description: 'Dynamic format for startup environments. Highlights innovation and adaptability.',
    content: 'Dear Hiring Manager,\n\nI am excited to apply...',
    wordCount: 275,
    aiGenerated: true,
    successRate: 93,
    usageCount: 55,
    tags: ['Startup', 'Tech', 'Dynamic']
  }
];

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: string): CoverLetterTemplate[] => {
  if (category === 'all') {
    return coverLetterTemplates;
  }
  return coverLetterTemplates.filter(t => t.category === category);
};

/**
 * Get template by ID
 */
export const getTemplateById = (id: string): CoverLetterTemplate | undefined => {
  return coverLetterTemplates.find(t => t.id === id);
};

/**
 * Search templates by name, description, or tags
 */
export const searchTemplates = (query: string): CoverLetterTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return coverLetterTemplates.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
