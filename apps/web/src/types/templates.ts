/**
 * Shared Template Type Definitions
 *
 * This file provides a base template interface and utilities to work with
 * different template types (Resume, Email, CoverLetter) in a consistent way.
 *
 * Purpose: Address inconsistent naming across template types and enable
 * shared utility functions.
 */

/**
 * Base template interface with common fields across all template types
 * All specific template types should ideally extend this base
 */
export interface BaseTemplate {
  id: string;
  name: string;
  category: string; // Specific types can narrow this
  description?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Extended base with usage tracking (common pattern across templates)
 */
export interface BaseTemplateWithUsage extends BaseTemplate {
  usageCount: number;
}

/**
 * Extended base with metadata (common in resume templates)
 */
export interface BaseTemplateWithMetadata extends BaseTemplate {
  author?: string;
  rating?: number;
  isPremium?: boolean;
  isCustom?: boolean;
}

/**
 * Type guard to check if an object is a valid base template
 */
export function isBaseTemplate(obj: any): obj is BaseTemplate {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.category === 'string'
  );
}

/**
 * Extract common fields from any template type
 * Useful for generic operations that only need basic info
 */
export function getTemplateBasicInfo(template: any): BaseTemplate {
  return {
    id: template.id,
    name: template.name,
    category: template.category,
    description: template.description,
    tags: template.tags,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

/**
 * Get usage count from any template type
 * Handles different field names (downloads, usageCount)
 */
export function getTemplateUsageCount(template: any): number {
  return template.usageCount || template.downloads || 0;
}

/**
 * Check if template is premium/custom/special
 * Handles different field names (isPremium, isCustom, aiGenerated)
 */
export function isSpecialTemplate(template: any): boolean {
  return Boolean(
    template.isPremium ||
    template.isCustom ||
    template.aiGenerated
  );
}

/**
 * Get template rating/success rate
 * Handles different field names (rating, successRate)
 */
export function getTemplateQualityScore(template: any): number | null {
  if (typeof template.rating === 'number') {
    return template.rating;
  }
  if (typeof template.successRate === 'number') {
    return template.successRate / 20; // Convert 0-100 to 0-5 scale
  }
  return null;
}

/**
 * Filter templates by search term (works with any template type)
 * Searches in name, description, and tags
 */
export function filterTemplatesBySearch<T extends BaseTemplate>(
  templates: T[],
  searchTerm: string
): T[] {
  const lowerSearch = searchTerm.toLowerCase().trim();
  if (!lowerSearch) return templates;

  return templates.filter(template => {
    const nameMatch = template.name.toLowerCase().includes(lowerSearch);
    const descMatch = template.description?.toLowerCase().includes(lowerSearch);
    const tagMatch = template.tags?.some(tag =>
      tag.toLowerCase().includes(lowerSearch)
    );

    return nameMatch || descMatch || tagMatch;
  });
}

/**
 * Filter templates by category (works with any template type)
 */
export function filterTemplatesByCategory<T extends BaseTemplate>(
  templates: T[],
  category: string
): T[] {
  if (category === 'all' || !category) return templates;
  return templates.filter(t => t.category === category);
}

/**
 * Sort templates by various criteria
 */
export type TemplateSortKey = 'name' | 'usage' | 'rating' | 'created';

export function sortTemplates<T extends any>(
  templates: T[],
  sortBy: TemplateSortKey
): T[] {
  const sorted = [...templates];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case 'usage':
      return sorted.sort((a, b) =>
        getTemplateUsageCount(b) - getTemplateUsageCount(a)
      );

    case 'rating':
      return sorted.sort((a, b) => {
        const ratingA = getTemplateQualityScore(a) || 0;
        const ratingB = getTemplateQualityScore(b) || 0;
        return ratingB - ratingA;
      });

    case 'created':
      return sorted.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

    default:
      return sorted;
  }
}

/**
 * Get template by ID from any collection
 */
export function findTemplateById<T extends BaseTemplate>(
  templates: T[],
  id: string
): T | undefined {
  return templates.find(t => t.id === id);
}

/**
 * Template comparison utility
 * Returns true if two templates have the same ID
 */
export function isSameTemplate(
  template1: BaseTemplate | null | undefined,
  template2: BaseTemplate | null | undefined
): boolean {
  if (!template1 || !template2) return false;
  return template1.id === template2.id;
}

/**
 * Format template for display
 * Returns a consistent display object regardless of template type
 */
export interface TemplateDisplayInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  usageCount: number;
  qualityScore: number | null;
  isSpecial: boolean;
  tags: string[];
}

export function getTemplateDisplayInfo(template: any): TemplateDisplayInfo {
  return {
    id: template.id,
    name: template.name,
    category: template.category,
    description: template.description || '',
    usageCount: getTemplateUsageCount(template),
    qualityScore: getTemplateQualityScore(template),
    isSpecial: isSpecialTemplate(template),
    tags: template.tags || [],
  };
}

/**
 * Migration guide for future refactoring:
 *
 * 1. Update ResumeTemplate to extend BaseTemplateWithMetadata
 * 2. Update EmailTemplate to extend BaseTemplateWithUsage
 * 3. Update CoverLetterTemplate to extend BaseTemplateWithUsage
 * 4. Standardize field names:
 *    - Use 'usageCount' instead of 'downloads'
 *    - Use 'rating' (0-5 scale) instead of 'successRate' (0-100 scale)
 *    - Add createdAt/updatedAt to CoverLetterTemplate
 * 5. Update all references to use these utility functions
 * 6. Add comprehensive tests for backward compatibility
 */
