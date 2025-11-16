/**
 * Template Validation Utilities
 * 
 * ✅ TEMPLATE HANDLING: Validates templates before application and provides fallback logic.
 * Ensures robust template handling when templates are missing or incompatible.
 */

import { resumeTemplates, DEFAULT_TEMPLATE_ID } from '../data/templates';
import type { ResumeTemplate } from '../data/templates';
import type { ResumeData, CustomSection } from '../types/resume';
import { logger } from './logger';

/**
 * Validate if a template ID exists in the templates array
 */
export function validateTemplateExists(templateId: string | null | undefined): boolean {
  if (!templateId) return false;
  return resumeTemplates.some(template => template.id === templateId);
}

/**
 * Get a template by ID with fallback to default
 */
export function getTemplateWithFallback(templateId: string | null | undefined): {
  template: ResumeTemplate;
  usedFallback: boolean;
  warning?: string;
} {
  // If no template ID provided, use default
  if (!templateId) {
    const defaultTemplate = resumeTemplates.find(t => t.id === DEFAULT_TEMPLATE_ID);
    return {
      template: defaultTemplate || resumeTemplates[0],
      usedFallback: true,
      warning: 'No template selected, using default template'
    };
  }

  // Try to find the requested template
  const template = resumeTemplates.find(t => t.id === templateId);
  
  if (template) {
    return {
      template,
      usedFallback: false
    };
  }

  // Template not found - use default
  logger.warn(`Template "${templateId}" not found, falling back to default`, {
    requestedId: templateId,
    defaultId: DEFAULT_TEMPLATE_ID
  });

  const defaultTemplate = resumeTemplates.find(t => t.id === DEFAULT_TEMPLATE_ID);
  
  return {
    template: defaultTemplate || resumeTemplates[0],
    usedFallback: true,
    warning: `Template "${templateId}" is no longer available. Using default template instead.`
  };
}

/**
 * Check if a template supports all sections in the resume
 */
export function checkTemplateCompatibility(
  template: ResumeTemplate,
  resumeData: ResumeData,
  customSections: CustomSection[]
): {
  isCompatible: boolean;
  warnings: string[];
  unsupportedSections: string[];
} {
  const warnings: string[] = [];
  const unsupportedSections: string[] = [];

  // Check if template has section restrictions
  // Most templates support all standard sections, but some specialized ones might not
  
  // Check for custom sections (some templates may not render them well)
  if (customSections.length > 0) {
    // Templates in 'minimal' or 'classic' categories might not handle custom sections well
    if (template.category === 'minimal' || template.category === 'classic') {
      warnings.push(
        `This template may not display custom sections optimally. Consider using a more flexible template.`
      );
      unsupportedSections.push(...customSections.map(s => s.name));
    }
  }

  // Check for large amounts of content
  const totalExperience = resumeData.experience?.length || 0;
  const totalProjects = resumeData.projects?.length || 0;
  const totalEducation = resumeData.education?.length || 0;

  if (totalExperience + totalProjects + totalEducation > 10) {
    if (template.layout === 'single-column') {
      warnings.push(
        `This template uses a single-column layout which may result in a longer resume with your amount of content. Consider a two-column template.`
      );
    }
  }

  // Check for color scheme compatibility with ATS
  if (template.category === 'creative' && resumeData.summary?.toLowerCase().includes('ats')) {
    warnings.push(
      `This creative template may not be optimal for ATS systems. Consider using an ATS-optimized template for better results.`
      );
  }

  return {
    isCompatible: warnings.length === 0,
    warnings,
    unsupportedSections
  };
}

/**
 * Validate template before applying to resume
 */
export function validateTemplateBeforeApply(
  templateId: string | null | undefined,
  resumeData: ResumeData,
  customSections: CustomSection[]
): {
  isValid: boolean;
  template: ResumeTemplate;
  usedFallback: boolean;
  warnings: string[];
  error?: string;
} {
  // Get template with fallback
  const { template, usedFallback, warning } = getTemplateWithFallback(templateId);
  
  const warnings: string[] = [];
  if (warning) {
    warnings.push(warning);
  }

  // Check compatibility
  const compatibility = checkTemplateCompatibility(template, resumeData, customSections);
  warnings.push(...compatibility.warnings);

  return {
    isValid: true, // Always valid because we have fallback
    template,
    usedFallback,
    warnings
  };
}

/**
 * Get default template
 */
export function getDefaultTemplate(): ResumeTemplate {
  const defaultTemplate = resumeTemplates.find(t => t.id === DEFAULT_TEMPLATE_ID);
  return defaultTemplate || resumeTemplates[0];
}

/**
 * Reset template to default
 */
export function resetToDefaultTemplate(): {
  templateId: string;
  template: ResumeTemplate;
  message: string;
} {
  const template = getDefaultTemplate();
  
  return {
    templateId: template.id,
    template,
    message: 'Template reset to default successfully'
  };
}

/**
 * Get template compatibility score (0-100)
 */
export function getTemplateCompatibilityScore(
  template: ResumeTemplate,
  resumeData: ResumeData,
  customSections: CustomSection[]
): number {
  let score = 100;

  const compatibility = checkTemplateCompatibility(template, resumeData, customSections);
  
  // Deduct points for each warning
  score -= compatibility.warnings.length * 15;
  
  // Deduct points for unsupported sections
  score -= compatibility.unsupportedSections.length * 10;

  return Math.max(0, Math.min(100, score));
}

