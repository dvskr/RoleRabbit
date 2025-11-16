/**
 * Portfolio Validation Schemas
 * Section 2.8: Input Validation & Schema Definitions
 *
 * Comprehensive Zod schemas for all portfolio-related data structures
 * Requirements #1-13: Type-safe validation for all API inputs
 */

import { z } from 'zod';

// ============================================================================
// CUSTOM VALIDATORS
// Requirements #2-5: URL, subdomain, email validation
// ============================================================================

/**
 * Requirement #2: URL validator with protocol check
 */
export const urlValidator = z
  .string()
  .url('Must be a valid URL')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: 'URL must use HTTP or HTTPS protocol' }
  );

/**
 * Requirement #3: Subdomain validator (DNS-compliant)
 */
export const subdomainValidator = z
  .string()
  .min(3, 'Subdomain must be at least 3 characters')
  .max(63, 'Subdomain must not exceed 63 characters')
  .regex(
    /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/,
    'Subdomain must contain only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.'
  )
  .refine(
    (subdomain) => !subdomain.includes('--'),
    { message: 'Subdomain cannot contain consecutive hyphens' }
  );

/**
 * Requirement #4: Email validator with format check
 */
export const emailValidator = z
  .string()
  .email('Must be a valid email address')
  .min(3)
  .max(254) // RFC 5321
  .refine(
    (email) => {
      // Additional validation: no leading/trailing dots
      const localPart = email.split('@')[0];
      return !localPart?.startsWith('.') && !localPart?.endsWith('.');
    },
    { message: 'Email local part cannot start or end with a dot' }
  );

/**
 * Requirement #5: Phone number validator (international format)
 */
export const phoneValidator = z
  .string()
  .regex(
    /^\+?[1-9]\d{0,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
    'Must be a valid phone number'
  )
  .optional();

/**
 * Requirement #6: Slug validator (URL-safe)
 */
export const slugValidator = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(100, 'Slug must not exceed 100 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must contain only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.'
  );

/**
 * Color hex code validator
 */
export const colorValidator = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color code');

/**
 * Date string validator (ISO 8601)
 */
export const dateStringValidator = z
  .string()
  .datetime({ message: 'Must be a valid ISO 8601 datetime string' });

// ============================================================================
// FILE SIZE LIMITS
// Requirement #7: File size validation
// ============================================================================

export const FILE_SIZE_LIMITS = {
  PROFILE_IMAGE: 5 * 1024 * 1024, // 5 MB
  RESUME_PDF: 10 * 1024 * 1024, // 10 MB
  PROJECT_IMAGE: 10 * 1024 * 1024, // 10 MB
  PORTFOLIO_JSON: 50 * 1024 * 1024, // 50 MB
  EXPORT_ZIP: 100 * 1024 * 1024, // 100 MB
} as const;

/**
 * File size validator factory
 */
export const createFileSizeValidator = (maxSize: number) =>
  z.number().int().min(0).max(maxSize, `File size must not exceed ${formatFileSize(maxSize)}`);

/**
 * Format file size for error messages
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ============================================================================
// PORTFOLIO DATA SCHEMAS
// Requirement #1: Comprehensive schemas for all data structures
// ============================================================================

/**
 * Social link schema
 */
export const SocialLinkSchema = z.object({
  platform: z.enum(['linkedin', 'github', 'twitter', 'instagram', 'facebook', 'youtube', 'behance', 'dribbble', 'website', 'other']),
  url: urlValidator,
  label: z.string().max(100).optional(),
});

/**
 * Contact information schema
 */
export const ContactSchema = z.object({
  email: emailValidator.optional(),
  phone: phoneValidator,
  location: z.string().max(200).optional(),
  website: urlValidator.optional(),
  socialLinks: z.array(SocialLinkSchema).max(20).optional(),
});

/**
 * About section schema
 */
export const AboutSchema = z.object({
  bio: z.string().max(5000).optional(),
  tagline: z.string().max(200).optional(),
  fullName: z.string().min(1).max(200).optional(),
  title: z.string().max(200).optional(),
  profileImage: urlValidator.optional(),
});

/**
 * Work experience schema
 */
export const WorkExperienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1).max(200),
  position: z.string().min(1).max(200),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Must be in YYYY-MM format'),
  endDate: z.string().regex(/^\d{4}-\d{2}$/, 'Must be in YYYY-MM format').or(z.literal('present')).optional(),
  description: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  achievements: z.array(z.string().max(500)).max(20).optional(),
  technologies: z.array(z.string().max(50)).max(50).optional(),
  isCurrent: z.boolean().optional(),
});

/**
 * Education schema
 */
export const EducationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1).max(200),
  degree: z.string().min(1).max(200),
  field: z.string().max(200).optional(),
  startDate: z.string().regex(/^\d{4}$/, 'Must be a year (YYYY)'),
  endDate: z.string().regex(/^\d{4}$/, 'Must be a year (YYYY)').or(z.literal('present')).optional(),
  gpa: z.string().max(20).optional(),
  description: z.string().max(1000).optional(),
  achievements: z.array(z.string().max(500)).max(20).optional(),
});

/**
 * Skill schema
 */
export const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  category: z.enum(['technical', 'soft', 'language', 'tool', 'framework', 'other']),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  yearsOfExperience: z.number().int().min(0).max(100).optional(),
});

/**
 * Project image schema
 */
export const ProjectImageSchema = z.object({
  url: urlValidator,
  alt: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
});

/**
 * Project link schema
 */
export const ProjectLinkSchema = z.object({
  label: z.string().max(100),
  url: urlValidator,
  type: z.enum(['demo', 'github', 'documentation', 'other']).optional(),
});

/**
 * Project schema
 */
export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  shortDescription: z.string().max(500).optional(),
  thumbnailUrl: urlValidator.optional(),
  images: z.array(ProjectImageSchema).max(20).optional(),
  technologies: z.array(z.string().max(50)).max(100).optional(),
  links: z.array(ProjectLinkSchema).max(10).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Must be in YYYY-MM format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}$/, 'Must be in YYYY-MM format').or(z.literal('ongoing')).optional(),
  featured: z.boolean().optional(),
  category: z.string().max(100).optional(),
  role: z.string().max(200).optional(),
  teamSize: z.number().int().min(1).max(1000).optional(),
  status: z.enum(['completed', 'in-progress', 'planned', 'archived']).optional(),
});

/**
 * Certification schema
 */
export const CertificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  issuer: z.string().min(1).max(200),
  issueDate: z.string().regex(/^\d{4}-\d{2}$/, 'Must be in YYYY-MM format'),
  expiryDate: z.string().regex(/^\d{4}-\d{2}$/, 'Must be in YYYY-MM format').optional(),
  credentialId: z.string().max(200).optional(),
  credentialUrl: urlValidator.optional(),
  description: z.string().max(1000).optional(),
});

/**
 * Award schema
 */
export const AwardSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  issuer: z.string().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}$/, 'Must be in YYYY-MM format'),
  description: z.string().max(1000).optional(),
});

/**
 * Publication schema
 */
export const PublicationSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(300),
  publisher: z.string().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}$/, 'Must be in YYYY-MM format'),
  url: urlValidator.optional(),
  description: z.string().max(1000).optional(),
  authors: z.array(z.string().max(200)).max(50).optional(),
});

/**
 * Testimonial schema
 */
export const TestimonialSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  role: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  content: z.string().min(1).max(2000),
  image: urlValidator.optional(),
  date: z.string().regex(/^\d{4}-\d{2}$/, 'Must be in YYYY-MM format').optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

/**
 * Custom section schema (flexible for user-defined sections)
 */
export const CustomSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  type: z.enum(['text', 'list', 'grid', 'timeline', 'other']),
  content: z.any(), // Flexible content - can be validated further based on type
  order: z.number().int().min(0),
  visible: z.boolean().optional(),
});

/**
 * Requirement #8: Complete Portfolio Data Schema
 * Master schema for all portfolio data
 */
export const PortfolioDataSchema = z.object({
  about: AboutSchema.optional(),
  contact: ContactSchema.optional(),
  experience: z.array(WorkExperienceSchema).max(100).optional(),
  education: z.array(EducationSchema).max(50).optional(),
  skills: z.array(SkillSchema).max(200).optional(),
  projects: z.array(ProjectSchema).max(200).optional(),
  certifications: z.array(CertificationSchema).max(100).optional(),
  awards: z.array(AwardSchema).max(100).optional(),
  publications: z.array(PublicationSchema).max(100).optional(),
  testimonials: z.array(TestimonialSchema).max(100).optional(),
  customSections: z.array(CustomSectionSchema).max(50).optional(),
});

// ============================================================================
// PORTFOLIO METADATA SCHEMAS
// Requirement #9: Portfolio creation/update schemas
// ============================================================================

/**
 * Theme configuration schema
 */
export const ThemeSchema = z.object({
  primaryColor: colorValidator.optional(),
  secondaryColor: colorValidator.optional(),
  backgroundColor: colorValidator.optional(),
  textColor: colorValidator.optional(),
  fontFamily: z.enum(['inter', 'roboto', 'open-sans', 'lato', 'montserrat', 'poppins', 'playfair', 'merriweather']).optional(),
  layout: z.enum(['single-page', 'multi-page', 'sidebar', 'minimal', 'creative']).optional(),
});

/**
 * SEO metadata schema
 */
export const SeoMetadataSchema = z.object({
  title: z.string().max(70).optional(),
  description: z.string().max(160).optional(),
  keywords: z.array(z.string().max(50)).max(20).optional(),
  ogImage: urlValidator.optional(),
  twitterCard: z.enum(['summary', 'summary_large_image', 'app', 'player']).optional(),
});

/**
 * Portfolio creation schema
 */
export const CreatePortfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required').max(200),
  slug: slugValidator.optional(),
  templateId: z.string().optional(),
  data: PortfolioDataSchema.optional(),
  theme: ThemeSchema.optional(),
  seoMetadata: SeoMetadataSchema.optional(),
});

/**
 * Portfolio update schema (partial)
 */
export const UpdatePortfolioSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: slugValidator.optional(),
  data: PortfolioDataSchema.optional(),
  theme: ThemeSchema.optional(),
  seoMetadata: SeoMetadataSchema.optional(),
  isPublished: z.boolean().optional(),
  subdomain: subdomainValidator.optional(),
});

/**
 * Portfolio patch schema (deep partial for PATCH requests)
 */
export const PatchPortfolioSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  data: z.record(z.any()).optional(), // Allow partial updates to data
  theme: ThemeSchema.partial().optional(),
  seoMetadata: SeoMetadataSchema.partial().optional(),
}).strict();

// ============================================================================
// VERSION CONTROL SCHEMAS
// Requirement #10: Version management schemas
// ============================================================================

/**
 * Create version schema
 */
export const CreateVersionSchema = z.object({
  name: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

/**
 * Version comparison schema
 */
export const CompareVersionsSchema = z.object({
  fromVersion: z.string(),
  toVersion: z.string(),
});

// ============================================================================
// SHARING & COLLABORATION SCHEMAS
// Requirement #11: Share configuration schemas
// ============================================================================

/**
 * Create share schema
 */
export const CreateShareSchema = z.object({
  expiresAt: dateStringValidator.optional(),
  password: z.string().min(4).max(100).optional(),
  maxViews: z.number().int().min(1).max(1000000).optional(),
});

/**
 * Access share schema
 */
export const AccessShareSchema = z.object({
  password: z.string().optional(),
});

/**
 * Update share schema
 */
export const UpdateShareSchema = z.object({
  expiresAt: dateStringValidator.optional().nullable(),
  password: z.string().min(4).max(100).optional().nullable(),
  maxViews: z.number().int().min(1).max(1000000).optional().nullable(),
});

// ============================================================================
// DEPLOYMENT SCHEMAS
// Requirement #12: Deployment configuration schemas
// ============================================================================

/**
 * Deploy portfolio schema
 */
export const DeployPortfolioSchema = z.object({
  subdomain: subdomainValidator.optional(),
  customDomain: z.string().max(253).optional(),
  buildConfig: z.object({
    minify: z.boolean().optional(),
    optimizeImages: z.boolean().optional(),
    generateSitemap: z.boolean().optional(),
  }).optional(),
});

/**
 * Add custom domain schema
 */
export const AddCustomDomainSchema = z.object({
  domain: z
    .string()
    .min(3)
    .max(253)
    .regex(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/,
      'Must be a valid domain name'
    ),
  isPrimary: z.boolean().optional(),
});

/**
 * Verify domain schema
 */
export const VerifyDomainSchema = z.object({
  verificationMethod: z.enum(['dns-txt', 'dns-cname', 'file']).optional(),
});

// ============================================================================
// ANALYTICS SCHEMAS
// Requirement #13: Analytics tracking schemas
// ============================================================================

/**
 * Track view schema
 */
export const TrackViewSchema = z.object({
  referrer: urlValidator.optional(),
  sessionId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Analytics date range schema
 */
export const AnalyticsDateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format').optional(),
});

// ============================================================================
// IMPORT/EXPORT SCHEMAS
// ============================================================================

/**
 * Import profile schema
 */
export const ImportProfileSchema = z.object({
  profileId: z.string(),
  merge: z.boolean().optional(),
  sections: z.array(z.enum(['about', 'contact', 'experience', 'education', 'skills'])).optional(),
});

/**
 * Import resume schema (file upload)
 */
export const ImportResumeSchema = z.object({
  file: z.any(), // File validation happens at the multipart level
  extractSections: z.array(z.string()).optional(),
});

/**
 * Export format schema
 */
export const ExportFormatSchema = z.object({
  format: z.enum(['html', 'pdf', 'json', 'zip']),
  includeAssets: z.boolean().optional(),
  minify: z.boolean().optional(),
});

// ============================================================================
// PAGINATION SCHEMAS
// ============================================================================

/**
 * Standard pagination schema
 */
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * Cursor-based pagination schema
 */
export const CursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate and sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  // TODO: Use library like DOMPurify for production
  // For now, basic sanitization
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

/**
 * Validate file type by MIME type
 */
export function validateFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Validate image file
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

/**
 * Validate document file
 */
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validate JSON structure
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}
