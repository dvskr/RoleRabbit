/**
 * Zod validation schemas for Templates component
 * Ensures runtime type safety and data integrity
 */

import { z } from 'zod';

// Category schema
export const templateCategorySchema = z.enum([
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
]);

// Difficulty schema
export const templateDifficultySchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
]);

// Layout schema
export const templateLayoutSchema = z.enum([
  'single-column',
  'two-column',
  'hybrid',
]);

// Color scheme schema
export const templateColorSchemeSchema = z.enum([
  'monochrome',
  'blue',
  'green',
  'purple',
  'red',
  'orange',
  'custom',
]);

// Sort option schema
export const templateSortBySchema = z.enum([
  'popular',
  'newest',
  'rating',
  'name',
]);

// View mode schema
export const templateViewModeSchema = z.enum(['grid', 'list']);

// Upload source schema
export const uploadSourceSchema = z.enum(['cloud', 'system']);

// Resume Template schema
export const resumeTemplateSchema = z.object({
  id: z.string().min(1, 'Template ID is required'),
  name: z.string().min(1, 'Template name is required'),
  category: templateCategorySchema,
  description: z.string().min(10, 'Description must be at least 10 characters'),
  preview: z.string().url('Preview must be a valid URL').or(z.string().startsWith('data:', 'Preview must be a URL or base64 data')),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  difficulty: templateDifficultySchema,
  industry: z.array(z.string()).min(1, 'At least one industry is required'),
  layout: templateLayoutSchema,
  colorScheme: templateColorSchemeSchema,
  isPremium: z.boolean(),
  rating: z.number().min(0).max(5, 'Rating must be between 0 and 5'),
  downloads: z.number().int().min(0, 'Downloads must be a non-negative integer'),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Created date must be in YYYY-MM-DD format'),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Updated date must be in YYYY-MM-DD format'),
  author: z.string().min(1, 'Author is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
});

// Filter state schema
export const filterStateSchema = z.object({
  searchQuery: z.string(),
  sortBy: templateSortBySchema,
  selectedCategory: z.string(),
  selectedDifficulty: z.string(),
  selectedLayout: z.string(),
  selectedColorScheme: z.string(),
  showFreeOnly: z.boolean(),
  showPremiumOnly: z.boolean(),
});

// Templates props schema
export const templatesPropsSchema = z.object({
  onAddToEditor: z.function().args(z.string()).returns(z.void()).optional(),
  addedTemplates: z.array(z.string()).optional(),
  onRemoveTemplate: z.function().args(z.string()).returns(z.void()).optional(),
});

// Template action schema (for validation of actions)
export const templateActionSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  action: z.enum(['preview', 'use', 'download', 'share', 'favorite', 'remove']),
});

// Pagination state schema
export const paginationStateSchema = z.object({
  currentPage: z.number().int().min(1, 'Current page must be at least 1'),
  totalPages: z.number().int().min(0, 'Total pages must be non-negative'),
  itemsPerPage: z.number().int().min(1, 'Items per page must be at least 1'),
});

// Export types inferred from schemas
export type TemplateCategory = z.infer<typeof templateCategorySchema>;
export type TemplateDifficulty = z.infer<typeof templateDifficultySchema>;
export type TemplateLayout = z.infer<typeof templateLayoutSchema>;
export type TemplateColorScheme = z.infer<typeof templateColorSchemeSchema>;
export type TemplateSortBy = z.infer<typeof templateSortBySchema>;
export type TemplateViewMode = z.infer<typeof templateViewModeSchema>;
export type UploadSource = z.infer<typeof uploadSourceSchema>;
export type ResumeTemplateValidated = z.infer<typeof resumeTemplateSchema>;
export type FilterState = z.infer<typeof filterStateSchema>;
export type TemplatesProps = z.infer<typeof templatesPropsSchema>;
export type TemplateAction = z.infer<typeof templateActionSchema>;
export type PaginationState = z.infer<typeof paginationStateSchema>;

/**
 * Validates a template object
 */
export function validateTemplate(template: unknown): {
  success: boolean;
  data?: ResumeTemplateValidated;
  error?: z.ZodError;
} {
  try {
    const data = resumeTemplateSchema.parse(template);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Validates an array of templates
 */
export function validateTemplates(templates: unknown[]): {
  success: boolean;
  data?: ResumeTemplateValidated[];
  errors?: Array<{ index: number; error: z.ZodError }>;
} {
  const errors: Array<{ index: number; error: z.ZodError }> = [];
  const validatedTemplates: ResumeTemplateValidated[] = [];

  templates.forEach((template, index) => {
    const result = validateTemplate(template);
    if (result.success && result.data) {
      validatedTemplates.push(result.data);
    } else if (result.error) {
      errors.push({ index, error: result.error });
    }
  });

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedTemplates };
}

/**
 * Validates a template action
 */
export function validateTemplateAction(action: unknown): {
  success: boolean;
  data?: TemplateAction;
  error?: z.ZodError;
} {
  try {
    const data = templateActionSchema.parse(action);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Validates filter state
 */
export function validateFilterState(filterState: unknown): {
  success: boolean;
  data?: FilterState;
  error?: z.ZodError;
} {
  try {
    const data = filterStateSchema.parse(filterState);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Safe parse with default fallback
 */
export function safeParseWithDefault<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  defaultValue: T
): T {
  const result = schema.safeParse(data);
  return result.success ? result.data : defaultValue;
}
