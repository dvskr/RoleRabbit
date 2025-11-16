/**
 * Portfolio Types & Data Structures
 * Complete TypeScript interfaces matching backend DTOs exactly
 * Includes Zod schemas for validation (Section 1.3)
 */

import { z } from 'zod';

// ========================================
// PORTFOLIO INTERFACE (Exact Backend DTO Match)
// ========================================

export interface Portfolio {
  // Primary fields
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;

  // Data & Template
  data: PortfolioData;
  templateId: string;

  // Publication status
  isPublished: boolean;
  isDraft: boolean;
  visibility: PortfolioVisibility;

  // Domain configuration
  subdomain: string | null;
  customDomains: string[];

  // SEO & Meta
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;

  // Analytics
  viewCount: number;
  lastViewedAt: string | null;

  // Build status
  buildStatus: BuildStatus;
  buildArtifactPath: string | null;
  lastBuildAt: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  deletedAt: string | null;

  // Audit fields
  createdBy: string | null;
  updatedBy: string | null;
}

// ========================================
// PORTFOLIO DATA INTERFACE (Exact Structure)
// ========================================

export interface PortfolioData {
  hero: HeroSection;
  about: AboutSection;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  education: EducationItem[];
  contact: ContactSection;
  // Optional custom sections
  achievements?: AchievementItem[];
  certifications?: CertificationItem[];
  testimonials?: TestimonialItem[];
  publications?: PublicationItem[];
}

// ========================================
// SECTION INTERFACES
// ========================================

export interface HeroSection {
  title: string;
  subtitle: string;
  tagline?: string;
  image?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface AboutSection {
  bio: string;
  image?: string;
  highlights?: string[];
  interests?: string[];
  languages?: LanguageSkill[];
}

export interface ExperienceItem {
  id?: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  description: string;
  technologies?: string[];
  achievements?: string[];
  order?: number;
}

export interface ProjectItem {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  category?: string;
  link?: string;
  github?: string;
  image?: string;
  images?: string[];
  featured?: boolean;
  startDate?: string;
  endDate?: string;
  status?: 'completed' | 'in-progress' | 'planned';
  order?: number;
}

export interface SkillItem {
  id?: string;
  name: string;
  proficiency: number; // 1-5
  category: string;
  yearsOfExperience?: number;
  order?: number;
}

export interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  description?: string;
  gpa?: string;
  honors?: string[];
  order?: number;
}

export interface ContactSection {
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  socialLinks: SocialLink[];
  availability?: string;
  preferredContactMethod?: 'email' | 'phone' | 'linkedin';
}

export interface SocialLink {
  id?: string;
  platform: SocialPlatform;
  url: string;
  username?: string;
  order?: number;
}

export interface AchievementItem {
  id?: string;
  title: string;
  description: string;
  date: string;
  issuer?: string;
  link?: string;
  order?: number;
}

export interface CertificationItem {
  id?: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string | null;
  credentialId?: string;
  credentialUrl?: string;
  order?: number;
}

export interface TestimonialItem {
  id?: string;
  author: string;
  role: string;
  company?: string;
  content: string;
  image?: string;
  rating?: number;
  date?: string;
  order?: number;
}

export interface PublicationItem {
  id?: string;
  title: string;
  description?: string;
  publisher: string;
  publishDate: string;
  url?: string;
  authors?: string[];
  order?: number;
}

export interface LanguageSkill {
  language: string;
  proficiency: 'native' | 'fluent' | 'professional' | 'intermediate' | 'basic';
}

// ========================================
// ENUMS & TYPES
// ========================================

export type PortfolioVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE' | 'PASSWORD_PROTECTED';

export type BuildStatus = 'PENDING' | 'BUILDING' | 'SUCCESS' | 'FAILED';

export type SSLStatus = 'PENDING' | 'PROVISIONING' | 'ACTIVE' | 'FAILED' | 'EXPIRED';

export type DeploymentStatus = 'QUEUED' | 'BUILDING' | 'DEPLOYING' | 'DEPLOYED' | 'FAILED' | 'ROLLED_BACK';

export type TemplateCategory = 'DEVELOPER' | 'DESIGNER' | 'MARKETING' | 'BUSINESS' | 'CREATIVE' | 'ACADEMIC' | 'GENERAL';

export type SocialPlatform =
  | 'linkedin'
  | 'github'
  | 'twitter'
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'behance'
  | 'dribbble'
  | 'medium'
  | 'stackoverflow'
  | 'website'
  | 'other';

// ========================================
// TEMPLATE INTERFACES
// ========================================

export interface PortfolioTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: TemplateCategory;
  thumbnail: string | null;
  previewUrl: string | null;
  htmlTemplate: string | null;
  cssTemplate: string | null;
  jsTemplate: string | null;
  config: TemplateConfig | null;
  defaultData: Partial<PortfolioData> | null;
  isPremium: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateConfig {
  sections: string[];
  colorSchemes: ColorScheme[];
  fonts: FontOption[];
  layouts: LayoutOption[];
  customizableElements: string[];
}

export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface FontOption {
  name: string;
  headingFont: string;
  bodyFont: string;
}

export interface LayoutOption {
  name: string;
  description: string;
  preview?: string;
}

// ========================================
// VERSION CONTROL
// ========================================

export interface PortfolioVersion {
  id: string;
  portfolioId: string;
  version: number;
  name: string | null;
  data: PortfolioData;
  metadata: VersionMetadata | null;
  createdBy: string | null;
  createdAt: string;
}

export interface VersionMetadata {
  changeDescription?: string;
  tags?: string[];
  isAutoSave?: boolean;
}

// ========================================
// CUSTOM DOMAINS
// ========================================

export interface CustomDomain {
  id: string;
  portfolioId: string;
  domain: string;
  isVerified: boolean;
  verificationToken: string;
  sslStatus: SSLStatus;
  sslCertPath: string | null;
  dnsRecords: DNSRecords | null;
  lastCheckedAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DNSRecords {
  a?: string[];
  cname?: string[];
  txt?: string[];
  verification?: {
    type: 'TXT' | 'CNAME';
    name: string;
    value: string;
    verified: boolean;
  };
}

// ========================================
// ANALYTICS
// ========================================

export interface PortfolioAnalytics {
  id: string;
  portfolioId: string;
  date: string;
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage: number | null;
  bounceRate: number | null;
  referrers: Record<string, number> | null;
  countries: Record<string, number> | null;
  devices: Record<string, number> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalUniqueVisitors: number;
  avgViewsPerDay: number;
  avgTimeOnPage: number;
  bounceRate: number;
  topReferrers: { source: string; count: number }[];
  topCountries: { country: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
}

// ========================================
// SHARING
// ========================================

export interface PortfolioShare {
  id: string;
  portfolioId: string;
  token: string;
  expiresAt: string | null;
  password: string | null; // Hashed
  viewCount: number;
  maxViews: number | null;
  createdAt: string;
  lastAccessedAt: string | null;
}

// ========================================
// DEPLOYMENTS
// ========================================

export interface PortfolioDeployment {
  id: string;
  portfolioId: string;
  status: DeploymentStatus;
  buildLog: string | null;
  errorMessage: string | null;
  deployedUrl: string | null;
  buildDuration: number | null; // milliseconds
  deployedBy: string | null;
  deployedAt: string | null;
  createdAt: string;
}

// ========================================
// API ERROR
// ========================================

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  originalResponse?: string;
}

// ========================================
// UTILITY TYPES
// ========================================

export type PartialPortfolioData = {
  [K in keyof PortfolioData]?: PortfolioData[K] extends Array<infer U>
    ? Array<Partial<U>>
    : Partial<PortfolioData[K]>;
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ========================================
// VALIDATION CONSTANTS (Section 1.4)
// ========================================

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
export const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'admin',
  'app',
  'mail',
  'ftp',
  'localhost',
  'staging',
  'dev',
  'test',
  'blog',
  'docs',
  'help',
  'support',
  'status',
  'about',
  'contact',
  'login',
  'signup',
  'register',
  'dashboard',
  'settings',
  'account',
  'profile',
  'cdn',
  'static',
  'assets',
  'media',
  'images',
  'uploads',
];

export const CHAR_LIMITS = {
  NAME: { min: 1, max: 200 },
  TITLE: { min: 1, max: 100 },
  SUBTITLE: { min: 1, max: 200 },
  BIO: { min: 10, max: 2000 },
  DESCRIPTION: { min: 1, max: 1000 },
  SHORT_TEXT: { min: 1, max: 500 },
  EMAIL: { max: 255 },
  URL: { max: 2048 },
  SUBDOMAIN: { min: 3, max: 63 },
  SLUG: { min: 1, max: 100 },
} as const;

export const FILE_LIMITS = {
  IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  },
  DOCUMENT: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedExtensions: ['.pdf', '.doc', '.docx'],
  },
} as const;

// ========================================
// ZOD SCHEMAS (Section 1.3 & 1.4)
// ========================================

// Social Link Schema
export const SocialLinkSchema = z.object({
  id: z.string().uuid().optional(),
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
  url: z.string().regex(URL_REGEX, 'Invalid URL format'),
  username: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

// Language Skill Schema
export const LanguageSkillSchema = z.object({
  language: z.string().min(1).max(50),
  proficiency: z.enum(['native', 'fluent', 'professional', 'intermediate', 'basic']),
});

// Hero Section Schema
export const HeroSectionSchema = z.object({
  title: z.string().min(CHAR_LIMITS.TITLE.min).max(CHAR_LIMITS.TITLE.max),
  subtitle: z.string().min(CHAR_LIMITS.SUBTITLE.min).max(CHAR_LIMITS.SUBTITLE.max),
  tagline: z.string().max(CHAR_LIMITS.SHORT_TEXT.max).optional(),
  image: z.string().regex(URL_REGEX).optional(),
  backgroundImage: z.string().regex(URL_REGEX).optional(),
  ctaText: z.string().max(50).optional(),
  ctaLink: z.string().regex(URL_REGEX).optional(),
});

// About Section Schema
export const AboutSectionSchema = z.object({
  bio: z.string().min(CHAR_LIMITS.BIO.min).max(CHAR_LIMITS.BIO.max),
  image: z.string().regex(URL_REGEX).optional(),
  highlights: z.array(z.string().max(CHAR_LIMITS.SHORT_TEXT.max)).optional(),
  interests: z.array(z.string().max(100)).optional(),
  languages: z.array(LanguageSkillSchema).optional(),
});

// Experience Item Schema
export const ExperienceItemSchema = z.object({
  id: z.string().uuid().optional(),
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  startDate: z.string(), // ISO date
  endDate: z.string().nullable().optional(),
  current: z.boolean().optional(),
  description: z.string().min(1).max(CHAR_LIMITS.DESCRIPTION.max),
  technologies: z.array(z.string().max(100)).optional(),
  achievements: z.array(z.string().max(CHAR_LIMITS.SHORT_TEXT.max)).optional(),
  order: z.number().int().min(0).optional(),
});

// Project Item Schema
export const ProjectItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(CHAR_LIMITS.DESCRIPTION.max),
  technologies: z.array(z.string().max(100)),
  category: z.string().max(100).optional(),
  link: z.string().regex(URL_REGEX).optional(),
  github: z.string().regex(URL_REGEX).optional(),
  image: z.string().regex(URL_REGEX).optional(),
  images: z.array(z.string().regex(URL_REGEX)).optional(),
  featured: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['completed', 'in-progress', 'planned']).optional(),
  order: z.number().int().min(0).optional(),
});

// Skill Item Schema
export const SkillItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  proficiency: z.number().int().min(1).max(5),
  category: z.string().min(1).max(100),
  yearsOfExperience: z.number().int().min(0).optional(),
  order: z.number().int().min(0).optional(),
});

// Education Item Schema
export const EducationItemSchema = z.object({
  id: z.string().uuid().optional(),
  institution: z.string().min(1).max(200),
  degree: z.string().min(1).max(200),
  field: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  current: z.boolean().optional(),
  description: z.string().max(CHAR_LIMITS.DESCRIPTION.max).optional(),
  gpa: z.string().max(20).optional(),
  honors: z.array(z.string().max(200)).optional(),
  order: z.number().int().min(0).optional(),
});

// Contact Section Schema
export const ContactSectionSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, 'Invalid email format').max(CHAR_LIMITS.EMAIL.max),
  phone: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  website: z.string().regex(URL_REGEX).optional(),
  socialLinks: z.array(SocialLinkSchema),
  availability: z.string().max(200).optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'linkedin']).optional(),
});

// Achievement Item Schema
export const AchievementItemSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(CHAR_LIMITS.DESCRIPTION.max),
  date: z.string(),
  issuer: z.string().max(200).optional(),
  link: z.string().regex(URL_REGEX).optional(),
  order: z.number().int().min(0).optional(),
});

// Certification Item Schema
export const CertificationItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  issuer: z.string().min(1).max(200),
  issueDate: z.string(),
  expiryDate: z.string().nullable().optional(),
  credentialId: z.string().max(200).optional(),
  credentialUrl: z.string().regex(URL_REGEX).optional(),
  order: z.number().int().min(0).optional(),
});

// Testimonial Item Schema
export const TestimonialItemSchema = z.object({
  id: z.string().uuid().optional(),
  author: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  company: z.string().max(200).optional(),
  content: z.string().min(1).max(CHAR_LIMITS.DESCRIPTION.max),
  image: z.string().regex(URL_REGEX).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  date: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

// Publication Item Schema
export const PublicationItemSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(CHAR_LIMITS.DESCRIPTION.max).optional(),
  publisher: z.string().min(1).max(200),
  publishDate: z.string(),
  url: z.string().regex(URL_REGEX).optional(),
  authors: z.array(z.string().max(200)).optional(),
  order: z.number().int().min(0).optional(),
});

// Portfolio Data Schema (Complete)
export const PortfolioDataSchema = z.object({
  hero: HeroSectionSchema,
  about: AboutSectionSchema,
  experience: z.array(ExperienceItemSchema),
  projects: z.array(ProjectItemSchema),
  skills: z.array(SkillItemSchema),
  education: z.array(EducationItemSchema),
  contact: ContactSectionSchema,
  achievements: z.array(AchievementItemSchema).optional(),
  certifications: z.array(CertificationItemSchema).optional(),
  testimonials: z.array(TestimonialItemSchema).optional(),
  publications: z.array(PublicationItemSchema).optional(),
});

// Portfolio Schema (Complete)
export const PortfolioSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(CHAR_LIMITS.NAME.min).max(CHAR_LIMITS.NAME.max),
  slug: z.string().regex(SLUG_REGEX).min(CHAR_LIMITS.SLUG.min).max(CHAR_LIMITS.SLUG.max),
  description: z.string().nullable(),
  data: PortfolioDataSchema,
  templateId: z.string().uuid(),
  isPublished: z.boolean(),
  isDraft: z.boolean(),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE', 'PASSWORD_PROTECTED']),
  subdomain: z.string().regex(SUBDOMAIN_REGEX).nullable(),
  customDomains: z.array(z.string()),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  ogImage: z.string().nullable(),
  viewCount: z.number().int().min(0),
  lastViewedAt: z.string().nullable(),
  buildStatus: z.enum(['PENDING', 'BUILDING', 'SUCCESS', 'FAILED']),
  buildArtifactPath: z.string().nullable(),
  lastBuildAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
  deletedAt: z.string().nullable(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
});

// Create Portfolio Request Schema
export const CreatePortfolioRequestSchema = z.object({
  name: z.string().min(CHAR_LIMITS.NAME.min).max(CHAR_LIMITS.NAME.max),
  templateId: z.string().uuid().optional(),
  description: z.string().max(CHAR_LIMITS.DESCRIPTION.max).optional(),
  data: PortfolioDataSchema.partial(),
});

// Update Portfolio Request Schema
export const UpdatePortfolioRequestSchema = z.object({
  name: z.string().min(CHAR_LIMITS.NAME.min).max(CHAR_LIMITS.NAME.max).optional(),
  description: z.string().max(CHAR_LIMITS.DESCRIPTION.max).nullable().optional(),
  templateId: z.string().uuid().optional(),
  data: PortfolioDataSchema.partial().optional(),
  isPublished: z.boolean().optional(),
  isDraft: z.boolean().optional(),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE', 'PASSWORD_PROTECTED']).optional(),
  metaTitle: z.string().max(100).nullable().optional(),
  metaDescription: z.string().max(300).nullable().optional(),
  ogImage: z.string().regex(URL_REGEX).nullable().optional(),
  version: z.number().int().optional(), // For optimistic locking
});

// Publish Portfolio Request Schema
export const PublishPortfolioRequestSchema = z.object({
  action: z.enum(['publish', 'unpublish']),
  subdomain: z.string().regex(SUBDOMAIN_REGEX).min(CHAR_LIMITS.SUBDOMAIN.min).max(CHAR_LIMITS.SUBDOMAIN.max).optional(),
});

// Portfolio List Response Schema
export const PortfolioListResponseSchema = z.object({
  data: z.array(PortfolioSchema),
  meta: z.object({
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    totalPages: z.number().int(),
  }),
});

// ========================================
// VALIDATION FUNCTIONS (Section 1.4)
// ========================================

/**
 * Validate email address
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  if (email.length > CHAR_LIMITS.EMAIL.max) {
    return { isValid: false, error: `Email must not exceed ${CHAR_LIMITS.EMAIL.max} characters` };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
}

/**
 * Validate URL
 */
export function validateURL(url: string): { isValid: boolean; error?: string } {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' };
  }

  if (url.length > CHAR_LIMITS.URL.max) {
    return { isValid: false, error: `URL must not exceed ${CHAR_LIMITS.URL.max} characters` };
  }

  if (!URL_REGEX.test(url)) {
    return { isValid: false, error: 'Invalid URL format (must start with http:// or https://)' };
  }

  return { isValid: true };
}

/**
 * Validate subdomain
 * Requirements:
 * - 3-63 characters
 * - Lowercase letters, numbers, hyphens only
 * - Cannot start or end with hyphen
 * - Not reserved
 */
export function validateSubdomain(subdomain: string): { isValid: boolean; error?: string } {
  if (!subdomain || subdomain.trim().length === 0) {
    return { isValid: false, error: 'Subdomain is required' };
  }

  if (subdomain.length < CHAR_LIMITS.SUBDOMAIN.min) {
    return { isValid: false, error: `Subdomain must be at least ${CHAR_LIMITS.SUBDOMAIN.min} characters` };
  }

  if (subdomain.length > CHAR_LIMITS.SUBDOMAIN.max) {
    return { isValid: false, error: `Subdomain must not exceed ${CHAR_LIMITS.SUBDOMAIN.max} characters` };
  }

  if (!SUBDOMAIN_REGEX.test(subdomain)) {
    return {
      isValid: false,
      error: 'Subdomain must contain only lowercase letters, numbers, and hyphens (cannot start or end with hyphen)',
    };
  }

  if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
    return { isValid: false, error: 'This subdomain is reserved and cannot be used' };
  }

  return { isValid: true };
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  type: 'IMAGE' | 'DOCUMENT'
): { isValid: boolean; error?: string } {
  const limits = FILE_LIMITS[type];

  // Check size
  if (file.size > limits.maxSize) {
    const maxSizeMB = limits.maxSize / (1024 * 1024);
    return { isValid: false, error: `File size must not exceed ${maxSizeMB}MB` };
  }

  // Check type
  if (!limits.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${limits.allowedExtensions.join(', ')}`,
    };
  }

  // Check extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!limits.allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `Invalid file extension. Allowed extensions: ${limits.allowedExtensions.join(', ')}`,
    };
  }

  return { isValid: true };
}

/**
 * Sanitize HTML to prevent XSS (placeholder - use DOMPurify in actual implementation)
 */
export function sanitizeHTML(html: string): string {
  // TODO: Implement with DOMPurify in browser context
  // For now, basic escape
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate character limit with counter
 */
export function validateCharLimit(
  text: string,
  limit: { min?: number; max: number }
): { isValid: boolean; error?: string; remaining: number; percentage: number } {
  const length = text.length;
  const remaining = limit.max - length;
  const percentage = (length / limit.max) * 100;

  if (limit.min && length < limit.min) {
    return {
      isValid: false,
      error: `Minimum ${limit.min} characters required`,
      remaining,
      percentage,
    };
  }

  if (length > limit.max) {
    return {
      isValid: false,
      error: `Maximum ${limit.max} characters exceeded`,
      remaining,
      percentage,
    };
  }

  return { isValid: true, remaining, percentage };
}

// ========================================
// TYPE GUARDS (Section 1.3)
// ========================================

/**
 * Type guard for Portfolio
 */
export function isPortfolio(obj: unknown): obj is Portfolio {
  try {
    PortfolioSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard for PortfolioData
 */
export function isPortfolioData(obj: unknown): obj is PortfolioData {
  try {
    PortfolioDataSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard for ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof Error &&
    ('statusCode' in error || 'code' in error || 'details' in error)
  );
}
