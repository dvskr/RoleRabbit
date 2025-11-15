/**
 * Portfolio Types & Data Structures
 * Complete TypeScript interfaces matching backend DTOs exactly
 */

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
