/**
 * Email Template Type Definitions
 * Used for email template management
 */

import { EmailCategory } from '../../../data/categories';

export type TemplateCategory = EmailCategory;

export interface EmailTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  subject: string;
  body: string;
  variables: string[];
  isCustom: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  name: string;
  placeholder: string;
  description: string;
  example: string;
}

export interface TemplateFilters {
  searchTerm: string;
  category?: TemplateCategory | 'All';
  isCustom?: boolean;
  sortBy: 'name' | 'usage' | 'category' | 'created';
}

