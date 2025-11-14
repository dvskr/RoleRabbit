/**
 * Template validation utilities
 * Validates template data structure and field values
 */

import { ResumeTemplate } from '../data/templates';
import { logger } from './logger';

// Valid enum values
const VALID_CATEGORIES = ['ats', 'creative', 'modern', 'classic', 'executive', 'minimal', 'academic', 'technical', 'startup', 'freelance'] as const;
const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
const VALID_LAYOUTS = ['single-column', 'two-column', 'hybrid'] as const;
const VALID_COLOR_SCHEMES = ['monochrome', 'blue', 'green', 'purple', 'red', 'orange', 'custom'] as const;

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a resume template against the schema
 */
export function validateResumeTemplate(template: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Check required fields exist
  if (!template) {
    return { isValid: false, errors: [{ field: 'template', message: 'Template is null or undefined' }] };
  }

  // ID validation
  if (typeof template.id !== 'string' || template.id.trim() === '') {
    errors.push({ field: 'id', message: 'ID must be a non-empty string' });
  }

  // Name validation
  if (typeof template.name !== 'string' || template.name.trim() === '') {
    errors.push({ field: 'name', message: 'Name must be a non-empty string' });
  }

  // Category validation
  if (!VALID_CATEGORIES.includes(template.category)) {
    errors.push({ field: 'category', message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }

  // Description validation
  if (typeof template.description !== 'string' || template.description.trim() === '') {
    errors.push({ field: 'description', message: 'Description must be a non-empty string' });
  }

  // Preview validation
  if (typeof template.preview !== 'string') {
    errors.push({ field: 'preview', message: 'Preview must be a string' });
  }

  // Features validation
  if (!Array.isArray(template.features)) {
    errors.push({ field: 'features', message: 'Features must be an array' });
  } else if (template.features.length === 0) {
    errors.push({ field: 'features', message: 'Features array cannot be empty' });
  } else if (!template.features.every((f: any) => typeof f === 'string')) {
    errors.push({ field: 'features', message: 'All features must be strings' });
  }

  // Difficulty validation
  if (!VALID_DIFFICULTIES.includes(template.difficulty)) {
    errors.push({ field: 'difficulty', message: `Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}` });
  }

  // Industry validation
  if (!Array.isArray(template.industry)) {
    errors.push({ field: 'industry', message: 'Industry must be an array' });
  } else if (template.industry.length === 0) {
    errors.push({ field: 'industry', message: 'Industry array cannot be empty' });
  } else if (!template.industry.every((i: any) => typeof i === 'string')) {
    errors.push({ field: 'industry', message: 'All industries must be strings' });
  }

  // Layout validation
  if (!VALID_LAYOUTS.includes(template.layout)) {
    errors.push({ field: 'layout', message: `Layout must be one of: ${VALID_LAYOUTS.join(', ')}` });
  }

  // Color scheme validation
  if (!VALID_COLOR_SCHEMES.includes(template.colorScheme)) {
    errors.push({ field: 'colorScheme', message: `Color scheme must be one of: ${VALID_COLOR_SCHEMES.join(', ')}` });
  }

  // isPremium validation
  if (typeof template.isPremium !== 'boolean') {
    errors.push({ field: 'isPremium', message: 'isPremium must be a boolean' });
  }

  // Rating validation
  if (typeof template.rating !== 'number') {
    errors.push({ field: 'rating', message: 'Rating must be a number' });
  } else if (template.rating < 0 || template.rating > 5) {
    errors.push({ field: 'rating', message: 'Rating must be between 0 and 5' });
  }

  // Downloads validation
  if (typeof template.downloads !== 'number') {
    errors.push({ field: 'downloads', message: 'Downloads must be a number' });
  } else if (template.downloads < 0) {
    errors.push({ field: 'downloads', message: 'Downloads cannot be negative' });
  }

  // CreatedAt validation
  if (typeof template.createdAt !== 'string' || template.createdAt.trim() === '') {
    errors.push({ field: 'createdAt', message: 'createdAt must be a non-empty string' });
  }

  // UpdatedAt validation
  if (typeof template.updatedAt !== 'string' || template.updatedAt.trim() === '') {
    errors.push({ field: 'updatedAt', message: 'updatedAt must be a non-empty string' });
  }

  // Author validation
  if (typeof template.author !== 'string' || template.author.trim() === '') {
    errors.push({ field: 'author', message: 'Author must be a non-empty string' });
  }

  // Tags validation
  if (!Array.isArray(template.tags)) {
    errors.push({ field: 'tags', message: 'Tags must be an array' });
  } else if (!template.tags.every((t: any) => typeof t === 'string')) {
    errors.push({ field: 'tags', message: 'All tags must be strings' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates an array of templates and returns only valid ones
 * Logs validation errors for debugging
 */
export function validateAndFilterTemplates(templates: any[]): ResumeTemplate[] {
  const validTemplates: ResumeTemplate[] = [];

  templates.forEach((template, index) => {
    const result = validateResumeTemplate(template);

    if (result.isValid) {
      validTemplates.push(template as ResumeTemplate);
    } else {
      logger.error(`Template at index ${index} (id: ${template?.id || 'unknown'}) failed validation:`, result.errors);
    }
  });

  return validTemplates;
}

/**
 * Type guard to check if template is valid
 */
export function isValidResumeTemplate(template: any): template is ResumeTemplate {
  return validateResumeTemplate(template).isValid;
}
