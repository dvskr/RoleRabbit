/**
 * Template Validation Schemas
 * Section 2.8: Input Validation & Schema Definitions
 *
 * Zod schemas for portfolio templates
 */

import { z } from 'zod';
import { colorValidator, urlValidator, slugValidator } from './portfolio.schemas';

// ============================================================================
// TEMPLATE SCHEMAS
// ============================================================================

/**
 * Template category enum
 */
export const TemplateCategoryEnum = z.enum([
  'developer',
  'designer',
  'writer',
  'photographer',
  'business',
  'creative',
  'academic',
  'general',
]);

/**
 * Template layout enum
 */
export const TemplateLayoutEnum = z.enum([
  'single-page',
  'multi-page',
  'sidebar',
  'minimal',
  'creative',
  'grid',
  'timeline',
]);

/**
 * Template section configuration
 */
export const TemplateSectionConfigSchema = z.object({
  id: z.string(),
  type: z.enum(['about', 'contact', 'experience', 'education', 'skills', 'projects', 'certifications', 'awards', 'publications', 'testimonials', 'custom']),
  enabled: z.boolean(),
  required: z.boolean().optional(),
  order: z.number().int().min(0),
  title: z.string().max(200).optional(),
  customConfig: z.record(z.any()).optional(),
});

/**
 * Template theme configuration
 */
export const TemplateThemeSchema = z.object({
  primaryColor: colorValidator,
  secondaryColor: colorValidator.optional(),
  backgroundColor: colorValidator,
  textColor: colorValidator,
  accentColor: colorValidator.optional(),
  fontFamily: z.enum(['inter', 'roboto', 'open-sans', 'lato', 'montserrat', 'poppins', 'playfair', 'merriweather', 'system']),
  fontSize: z.enum(['small', 'medium', 'large']).optional(),
  spacing: z.enum(['compact', 'normal', 'relaxed']).optional(),
  borderRadius: z.enum(['none', 'small', 'medium', 'large', 'full']).optional(),
});

/**
 * Template component style
 */
export const ComponentStyleSchema = z.object({
  component: z.string(),
  className: z.string().optional(),
  customCss: z.string().max(10000).optional(),
  props: z.record(z.any()).optional(),
});

/**
 * Template metadata
 */
export const TemplateMetadataSchema = z.object({
  author: z.string().max(200).optional(),
  version: z.string().max(20).optional(),
  lastUpdated: z.string().datetime().optional(),
  compatibilityVersion: z.string().max(20).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

/**
 * Template preview configuration
 */
export const TemplatePreviewSchema = z.object({
  thumbnailUrl: urlValidator,
  previewUrl: urlValidator.optional(),
  screenshots: z.array(urlValidator).max(10).optional(),
  demoUrl: urlValidator.optional(),
});

/**
 * Complete Template schema
 */
export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Template name is required').max(200),
  slug: slugValidator,
  description: z.string().max(1000).optional(),
  category: TemplateCategoryEnum,
  layout: TemplateLayoutEnum,
  isPremium: z.boolean(),
  isPublished: z.boolean(),

  // Theme and styling
  theme: TemplateThemeSchema,
  componentStyles: z.array(ComponentStyleSchema).max(100).optional(),
  customCss: z.string().max(50000).optional(),

  // Section configuration
  sections: z.array(TemplateSectionConfigSchema).min(1).max(50),

  // Preview
  preview: TemplatePreviewSchema,

  // Metadata
  metadata: TemplateMetadataSchema.optional(),

  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  createdBy: z.string().optional(),
});

/**
 * Create template schema (admin only)
 */
export const CreateTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(200),
  slug: slugValidator,
  description: z.string().max(1000).optional(),
  category: TemplateCategoryEnum,
  layout: TemplateLayoutEnum,
  isPremium: z.boolean().default(false),
  theme: TemplateThemeSchema,
  sections: z.array(TemplateSectionConfigSchema).min(1).max(50),
  preview: TemplatePreviewSchema,
  metadata: TemplateMetadataSchema.optional(),
  customCss: z.string().max(50000).optional(),
});

/**
 * Update template schema (admin only)
 */
export const UpdateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: slugValidator.optional(),
  description: z.string().max(1000).optional(),
  category: TemplateCategoryEnum.optional(),
  layout: TemplateLayoutEnum.optional(),
  isPremium: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  theme: TemplateThemeSchema.optional(),
  sections: z.array(TemplateSectionConfigSchema).min(1).max(50).optional(),
  preview: TemplatePreviewSchema.optional(),
  metadata: TemplateMetadataSchema.optional(),
  customCss: z.string().max(50000).optional(),
});

/**
 * Template preview generation schema
 */
export const GenerateTemplatePreviewSchema = z.object({
  sampleData: z.record(z.any()).optional(),
  format: z.enum(['html', 'screenshot', 'pdf']).default('html'),
  width: z.number().int().min(320).max(3840).optional(),
  height: z.number().int().min(240).max(2160).optional(),
});

/**
 * Template filter schema (for listing)
 */
export const TemplateFilterSchema = z.object({
  category: TemplateCategoryEnum.optional(),
  layout: TemplateLayoutEnum.optional(),
  isPremium: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  search: z.string().max(200).optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'popularity']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ============================================================================
// TEMPLATE CUSTOMIZATION SCHEMAS
// ============================================================================

/**
 * Apply template schema
 */
export const ApplyTemplateSchema = z.object({
  templateId: z.string(),
  preserveData: z.boolean().default(false),
  customizations: z.object({
    theme: TemplateThemeSchema.partial().optional(),
    sections: z.array(z.object({
      id: z.string(),
      enabled: z.boolean().optional(),
      order: z.number().int().min(0).optional(),
    })).optional(),
  }).optional(),
});

/**
 * Template customization schema
 */
export const CustomizeTemplateSchema = z.object({
  theme: TemplateThemeSchema.partial().optional(),
  enabledSections: z.array(z.string()).optional(),
  sectionOrder: z.record(z.number().int().min(0)).optional(),
  customCss: z.string().max(50000).optional(),
});

// ============================================================================
// TEMPLATE VALIDATION HELPERS
// ============================================================================

/**
 * Validate template sections are unique
 */
export function validateUniqueSections(sections: Array<{ id: string }>): boolean {
  const ids = sections.map((s) => s.id);
  return new Set(ids).size === ids.length;
}

/**
 * Validate section order is sequential
 */
export function validateSectionOrder(sections: Array<{ order: number }>): boolean {
  const orders = sections.map((s) => s.order).sort((a, b) => a - b);
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== i) return false;
  }
  return true;
}

/**
 * Validate required sections are present
 */
export function validateRequiredSections(
  sections: Array<{ type: string; required?: boolean }>,
  requiredTypes: string[]
): boolean {
  const presentTypes = sections
    .filter((s) => s.required !== false)
    .map((s) => s.type);

  return requiredTypes.every((type) => presentTypes.includes(type));
}

/**
 * Validate theme colors have sufficient contrast
 */
export function validateThemeContrast(theme: {
  backgroundColor: string;
  textColor: string;
}): boolean {
  // TODO: Implement actual contrast check using WCAG guidelines
  // For now, basic validation that colors are different
  return theme.backgroundColor.toLowerCase() !== theme.textColor.toLowerCase();
}

/**
 * Sanitize custom CSS (remove dangerous properties)
 */
export function sanitizeCustomCss(css: string): string {
  // Remove potentially dangerous CSS
  const dangerous = [
    /@import/gi,
    /javascript:/gi,
    /expression\(/gi,
    /behavior:/gi,
    /-moz-binding/gi,
  ];

  let sanitized = css;
  for (const pattern of dangerous) {
    sanitized = sanitized.replace(pattern, '');
  }

  return sanitized;
}

/**
 * Validate template slug uniqueness
 */
export async function validateTemplateSlugUnique(
  slug: string,
  checkExists: (slug: string) => Promise<boolean>,
  excludeId?: string
): Promise<boolean> {
  const exists = await checkExists(slug);
  return !exists;
}

/**
 * Generate template slug from name
 */
export function generateTemplateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// ============================================================================
// TEMPLATE PREVIEW DATA SCHEMAS
// ============================================================================

/**
 * Sample data for template preview
 */
export const TemplateSampleDataSchema = z.object({
  about: z.object({
    fullName: z.string(),
    title: z.string(),
    bio: z.string(),
    profileImage: urlValidator.optional(),
  }).optional(),

  contact: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string().optional(),
  }).optional(),

  experience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string().optional(),
  })).optional(),

  projects: z.array(z.object({
    title: z.string(),
    description: z.string(),
    thumbnailUrl: urlValidator.optional(),
    technologies: z.array(z.string()).optional(),
  })).optional(),

  skills: z.array(z.object({
    name: z.string(),
    category: z.string(),
    proficiency: z.string().optional(),
  })).optional(),
});

/**
 * Default sample data for templates
 */
export const DEFAULT_SAMPLE_DATA = {
  about: {
    fullName: 'John Doe',
    title: 'Full Stack Developer',
    bio: 'Passionate developer with 5+ years of experience building web applications.',
    profileImage: 'https://via.placeholder.com/150',
  },
  contact: {
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
  },
  experience: [
    {
      company: 'Tech Company',
      position: 'Senior Developer',
      startDate: '2020-01',
      endDate: 'present',
      description: 'Leading development of web applications using React and Node.js',
    },
  ],
  projects: [
    {
      title: 'Portfolio Website',
      description: 'Personal portfolio showcasing my work and skills',
      thumbnailUrl: 'https://via.placeholder.com/400x300',
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    },
  ],
  skills: [
    { name: 'JavaScript', category: 'technical', proficiency: 'expert' },
    { name: 'React', category: 'framework', proficiency: 'advanced' },
    { name: 'Node.js', category: 'technical', proficiency: 'advanced' },
  ],
};
