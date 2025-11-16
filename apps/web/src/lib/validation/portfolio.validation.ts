/**
 * Portfolio Validation Schemas & Type Guards
 * Zod schemas for runtime validation of all user inputs and API responses
 */

import { z } from 'zod';
import type {
  Portfolio,
  PortfolioData,
  PortfolioTemplate,
  PortfolioVersion,
  CustomDomain,
  PortfolioAnalytics,
  PortfolioShare,
  PortfolioDeployment,
} from '../../types/portfolio';

// ========================================
// ZOD SCHEMAS - USER INPUTS
// ========================================

// URL validation
const urlSchema = z.string().url().max(2048);
const optionalUrlSchema = z.string().url().max(2048).optional().or(z.literal(''));

// Email validation
const emailSchema = z.string().email().max(255);

// Date validation
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// ========================================
// HERO SECTION SCHEMA
// ========================================

export const heroSectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  subtitle: z.string().min(1, 'Subtitle is required').max(200, 'Subtitle must be 200 characters or less'),
  tagline: z.string().max(200).optional(),
  image: optionalUrlSchema,
  backgroundImage: optionalUrlSchema,
  ctaText: z.string().max(50).optional(),
  ctaLink: optionalUrlSchema,
});

// ========================================
// ABOUT SECTION SCHEMA
// ========================================

export const languageSkillSchema = z.object({
  language: z.string().min(1).max(50),
  proficiency: z.enum(['native', 'fluent', 'professional', 'intermediate', 'basic']),
});

export const aboutSectionSchema = z.object({
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(5000, 'Bio must be 5000 characters or less'),
  image: optionalUrlSchema,
  highlights: z.array(z.string().max(200)).max(10).optional(),
  interests: z.array(z.string().max(100)).max(20).optional(),
  languages: z.array(languageSkillSchema).max(10).optional(),
});

// ========================================
// EXPERIENCE SCHEMA
// ========================================

export const experienceItemSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, 'Company is required').max(100),
  role: z.string().min(1, 'Role is required').max(100),
  location: z.string().max(100).optional(),
  startDate: dateSchema,
  endDate: dateSchema.nullable().optional(),
  current: z.boolean().optional(),
  description: z.string().min(1, 'Description is required').max(5000),
  technologies: z.array(z.string().max(50)).max(50).optional(),
  achievements: z.array(z.string().max(500)).max(20).optional(),
  order: z.number().int().min(0).optional(),
});

// ========================================
// PROJECT SCHEMA
// ========================================

export const projectItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
  technologies: z.array(z.string().max(50)).min(1, 'At least one technology is required').max(50),
  category: z.string().max(50).optional(),
  link: optionalUrlSchema,
  github: optionalUrlSchema,
  image: optionalUrlSchema,
  images: z.array(urlSchema).max(10).optional(),
  featured: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['completed', 'in-progress', 'planned']).optional(),
  order: z.number().int().min(0).optional(),
});

// ========================================
// SKILL SCHEMA
// ========================================

export const skillItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Skill name is required').max(50),
  proficiency: z.number().int().min(1, 'Proficiency must be at least 1').max(5, 'Proficiency must be at most 5'),
  category: z.string().min(1, 'Category is required').max(50),
  yearsOfExperience: z.number().int().min(0).max(100).optional(),
  order: z.number().int().min(0).optional(),
});

// ========================================
// EDUCATION SCHEMA
// ========================================

export const educationItemSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, 'Institution is required').max(100),
  degree: z.string().min(1, 'Degree is required').max(100),
  field: z.string().min(1, 'Field of study is required').max(100),
  location: z.string().max(100).optional(),
  startDate: dateSchema,
  endDate: dateSchema.nullable().optional(),
  current: z.boolean().optional(),
  description: z.string().max(1000).optional(),
  gpa: z.string().max(20).optional(),
  honors: z.array(z.string().max(100)).max(10).optional(),
  order: z.number().int().min(0).optional(),
});

// ========================================
// CONTACT SECTION SCHEMA
// ========================================

export const socialLinkSchema = z.object({
  id: z.string().optional(),
  platform: z.enum([
    'linkedin',
    'github',
    'twitter',
    'facebook',
    'instagram',
    'youtube',
    'behance',
    'dribbble',
    'medium',
    'stackoverflow',
    'website',
    'other',
  ]),
  url: urlSchema,
  username: z.string().max(100).optional(),
  order: z.number().int().min(0).optional(),
});

export const contactSectionSchema = z.object({
  email: emailSchema,
  phone: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
  website: optionalUrlSchema,
  socialLinks: z.array(socialLinkSchema).max(20),
  availability: z.string().max(100).optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'linkedin']).optional(),
});

// ========================================
// OPTIONAL SECTIONS SCHEMAS
// ========================================

export const achievementItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  date: dateSchema,
  issuer: z.string().max(100).optional(),
  link: optionalUrlSchema,
  order: z.number().int().min(0).optional(),
});

export const certificationItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Certification name is required').max(100),
  issuer: z.string().min(1, 'Issuer is required').max(100),
  issueDate: dateSchema,
  expiryDate: dateSchema.nullable().optional(),
  credentialId: z.string().max(100).optional(),
  credentialUrl: optionalUrlSchema,
  order: z.number().int().min(0).optional(),
});

export const testimonialItemSchema = z.object({
  id: z.string().optional(),
  author: z.string().min(1, 'Author is required').max(100),
  role: z.string().min(1, 'Role is required').max(100),
  company: z.string().max(100).optional(),
  content: z.string().min(1, 'Content is required').max(1000),
  image: optionalUrlSchema,
  rating: z.number().int().min(1).max(5).optional(),
  date: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const publicationItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(500).optional(),
  publisher: z.string().min(1, 'Publisher is required').max(100),
  publishDate: dateSchema,
  url: optionalUrlSchema,
  authors: z.array(z.string().max(100)).max(20).optional(),
  order: z.number().int().min(0).optional(),
});

// ========================================
// PORTFOLIO DATA SCHEMA
// ========================================

export const portfolioDataSchema = z.object({
  hero: heroSectionSchema,
  about: aboutSectionSchema,
  experience: z.array(experienceItemSchema).max(50),
  projects: z.array(projectItemSchema).max(100),
  skills: z.array(skillItemSchema).max(100),
  education: z.array(educationItemSchema).max(20),
  contact: contactSectionSchema,
  // Optional sections
  achievements: z.array(achievementItemSchema).max(50).optional(),
  certifications: z.array(certificationItemSchema).max(50).optional(),
  testimonials: z.array(testimonialItemSchema).max(50).optional(),
  publications: z.array(publicationItemSchema).max(50).optional(),
});

// ========================================
// SUBDOMAIN VALIDATION
// ========================================

export const subdomainSchema = z
  .string()
  .min(3, 'Subdomain must be at least 3 characters')
  .max(63, 'Subdomain must be at most 63 characters')
  .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, 'Subdomain must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen')
  .refine((val) => !val.includes('--'), 'Subdomain cannot contain consecutive hyphens')
  .refine(
    (val) => {
      const reserved = ['www', 'api', 'admin', 'app', 'blog', 'dashboard', 'mail', 'ftp', 'cdn', 'assets', 'static', 'files', 'upload', 'download'];
      return !reserved.includes(val);
    },
    'This subdomain is reserved'
  );

// ========================================
// CUSTOM DOMAIN VALIDATION
// ========================================

export const customDomainSchema = z
  .string()
  .min(3, 'Domain must be at least 3 characters')
  .max(253, 'Domain must be at most 253 characters')
  .regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/, 'Invalid domain format');

// ========================================
// REQUEST DTOs SCHEMAS
// ========================================

export const createPortfolioRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  description: z.string().max(5000).optional(),
  templateId: z.string().uuid('Invalid template ID'),
  data: portfolioDataSchema.partial().optional(),
});

export const updatePortfolioRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  data: portfolioDataSchema.partial().optional(),
  templateId: z.string().uuid().optional(),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE', 'PASSWORD_PROTECTED']).optional(),
  metaTitle: z.string().max(60).nullable().optional(),
  metaDescription: z.string().max(160).nullable().optional(),
  ogImage: optionalUrlSchema.nullable().optional(),
});

export const publishPortfolioRequestSchema = z.object({
  subdomain: subdomainSchema.optional(),
  customDomain: customDomainSchema.optional(),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE', 'PASSWORD_PROTECTED']).optional(),
});

export const createShareLinkRequestSchema = z.object({
  expiresAt: z.string().datetime().optional(),
  password: z.string().min(4, 'Password must be at least 4 characters').max(100).optional(),
  maxViews: z.number().int().min(1).max(10000).optional(),
});

export const importResumeRequestSchema = z.object({
  resumeId: z.string().uuid('Invalid resume ID'),
});

// ========================================
// RESPONSE DTOs SCHEMAS
// ========================================

export const portfolioResponseSchema = z.object({
  portfolio: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    data: portfolioDataSchema,
    templateId: z.string().uuid(),
    isPublished: z.boolean(),
    isDraft: z.boolean(),
    visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE', 'PASSWORD_PROTECTED']),
    subdomain: z.string().nullable(),
    customDomains: z.array(z.string()),
    metaTitle: z.string().nullable(),
    metaDescription: z.string().nullable(),
    ogImage: z.string().nullable(),
    viewCount: z.number().int().min(0),
    lastViewedAt: z.string().nullable(),
    buildStatus: z.enum(['PENDING', 'BUILDING', 'SUCCESS', 'FAILED']),
    buildArtifactPath: z.string().nullable(),
    lastBuildAt: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    publishedAt: z.string().datetime().nullable(),
    deletedAt: z.string().datetime().nullable(),
    createdBy: z.string().uuid().nullable(),
    updatedBy: z.string().uuid().nullable(),
  }),
});

export const portfolioListResponseSchema = z.object({
  portfolios: z.array(portfolioResponseSchema.shape.portfolio),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().min(0),
});

export const templateResponseSchema = z.object({
  template: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    category: z.enum(['DEVELOPER', 'DESIGNER', 'MARKETING', 'BUSINESS', 'CREATIVE', 'ACADEMIC', 'GENERAL']),
    thumbnail: z.string().nullable(),
    previewUrl: z.string().nullable(),
    htmlTemplate: z.string().nullable(),
    cssTemplate: z.string().nullable(),
    jsTemplate: z.string().nullable(),
    config: z.any().nullable(),
    defaultData: z.any().nullable(),
    isPremium: z.boolean(),
    isActive: z.boolean(),
    usageCount: z.number().int().min(0),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
});

export const templateListResponseSchema = z.object({
  templates: z.array(templateResponseSchema.shape.template),
});

// ========================================
// TYPE GUARDS
// ========================================

export function isPortfolio(obj: unknown): obj is Portfolio {
  try {
    portfolioResponseSchema.shape.portfolio.parse(obj);
    return true;
  } catch {
    return false;
  }
}

export function isPortfolioData(obj: unknown): obj is PortfolioData {
  try {
    portfolioDataSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

export function isPortfolioTemplate(obj: unknown): obj is PortfolioTemplate {
  try {
    templateResponseSchema.shape.template.parse(obj);
    return true;
  } catch {
    return false;
  }
}

export function isPortfolioVersion(obj: unknown): obj is PortfolioVersion {
  if (!obj || typeof obj !== 'object') return false;
  const version = obj as any;
  return (
    typeof version.id === 'string' &&
    typeof version.portfolioId === 'string' &&
    typeof version.version === 'number' &&
    typeof version.createdAt === 'string' &&
    isPortfolioData(version.data)
  );
}

export function isCustomDomain(obj: unknown): obj is CustomDomain {
  if (!obj || typeof obj !== 'object') return false;
  const domain = obj as any;
  return (
    typeof domain.id === 'string' &&
    typeof domain.portfolioId === 'string' &&
    typeof domain.domain === 'string' &&
    typeof domain.isVerified === 'boolean' &&
    typeof domain.sslStatus === 'string' &&
    ['PENDING', 'PROVISIONING', 'ACTIVE', 'FAILED', 'EXPIRED'].includes(domain.sslStatus)
  );
}

export function isPortfolioAnalytics(obj: unknown): obj is PortfolioAnalytics {
  if (!obj || typeof obj !== 'object') return false;
  const analytics = obj as any;
  return (
    typeof analytics.id === 'string' &&
    typeof analytics.portfolioId === 'string' &&
    typeof analytics.date === 'string' &&
    typeof analytics.views === 'number' &&
    typeof analytics.uniqueVisitors === 'number'
  );
}

export function isPortfolioShare(obj: unknown): obj is PortfolioShare {
  if (!obj || typeof obj !== 'object') return false;
  const share = obj as any;
  return (
    typeof share.id === 'string' &&
    typeof share.portfolioId === 'string' &&
    typeof share.token === 'string' &&
    typeof share.viewCount === 'number'
  );
}

export function isPortfolioDeployment(obj: unknown): obj is PortfolioDeployment {
  if (!obj || typeof obj !== 'object') return false;
  const deployment = obj as any;
  return (
    typeof deployment.id === 'string' &&
    typeof deployment.portfolioId === 'string' &&
    typeof deployment.status === 'string' &&
    ['QUEUED', 'BUILDING', 'DEPLOYING', 'DEPLOYED', 'FAILED', 'ROLLED_BACK'].includes(deployment.status)
  );
}

// ========================================
// VALIDATION HELPERS
// ========================================

export function validatePortfolioData(data: unknown): { success: true; data: PortfolioData } | { success: false; errors: string[] } {
  try {
    const validatedData = portfolioDataSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error: any) {
    const errors = error.errors?.map((err: any) => `${err.path.join('.')}: ${err.message}`) || ['Validation failed'];
    return { success: false, errors };
  }
}

export function validateCreatePortfolioRequest(data: unknown): { success: true; data: any } | { success: false; errors: string[] } {
  try {
    const validatedData = createPortfolioRequestSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error: any) {
    const errors = error.errors?.map((err: any) => `${err.path.join('.')}: ${err.message}`) || ['Validation failed'];
    return { success: false, errors };
  }
}

export function validateUpdatePortfolioRequest(data: unknown): { success: true; data: any } | { success: false; errors: string[] } {
  try {
    const validatedData = updatePortfolioRequestSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error: any) {
    const errors = error.errors?.map((err: any) => `${err.path.join('.')}: ${err.message}`) || ['Validation failed'];
    return { success: false, errors };
  }
}

export function validateSubdomain(subdomain: unknown): { success: true; subdomain: string } | { success: false; error: string } {
  try {
    const validated = subdomainSchema.parse(subdomain);
    return { success: true, subdomain: validated };
  } catch (error: any) {
    const errorMessage = error.errors?.[0]?.message || 'Invalid subdomain';
    return { success: false, error: errorMessage };
  }
}

export function validateCustomDomain(domain: unknown): { success: true; domain: string } | { success: false; error: string } {
  try {
    const validated = customDomainSchema.parse(domain);
    return { success: true, domain: validated };
  } catch (error: any) {
    const errorMessage = error.errors?.[0]?.message || 'Invalid domain';
    return { success: false, error: errorMessage };
  }
}

// ========================================
// API RESPONSE VALIDATORS
// ========================================

export function validatePortfolioResponse(response: unknown): Portfolio {
  const result = portfolioResponseSchema.parse(response);
  return result.portfolio;
}

export function validatePortfolioListResponse(response: unknown) {
  return portfolioListResponseSchema.parse(response);
}

export function validateTemplateResponse(response: unknown): PortfolioTemplate {
  const result = templateResponseSchema.parse(response);
  return result.template;
}

export function validateTemplateListResponse(response: unknown) {
  return templateListResponseSchema.parse(response);
}

// ========================================
// EXPORT TYPES
// ========================================

export type CreatePortfolioRequest = z.infer<typeof createPortfolioRequestSchema>;
export type UpdatePortfolioRequest = z.infer<typeof updatePortfolioRequestSchema>;
export type PublishPortfolioRequest = z.infer<typeof publishPortfolioRequestSchema>;
export type CreateShareLinkRequest = z.infer<typeof createShareLinkRequestSchema>;
export type ImportResumeRequest = z.infer<typeof importResumeRequestSchema>;

export type PortfolioResponse = z.infer<typeof portfolioResponseSchema>;
export type PortfolioListResponse = z.infer<typeof portfolioListResponseSchema>;
export type TemplateResponse = z.infer<typeof templateResponseSchema>;
export type TemplateListResponse = z.infer<typeof templateListResponseSchema>;
