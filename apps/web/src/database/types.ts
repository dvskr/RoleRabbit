/**
 * Database Types
 * Section 3: Database Schema Types
 *
 * TypeScript types matching the PostgreSQL schema
 * Auto-generated from migrations 001-004
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Portfolio visibility level
 */
export enum PortfolioVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  UNLISTED = 'UNLISTED',
  PASSWORD_PROTECTED = 'PASSWORD_PROTECTED',
}

/**
 * Portfolio build status
 */
export enum PortfolioBuildStatus {
  PENDING = 'PENDING',
  BUILDING = 'BUILDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

/**
 * Template category
 */
export enum TemplateCategory {
  PROFESSIONAL = 'PROFESSIONAL',
  CREATIVE = 'CREATIVE',
  MINIMAL = 'MINIMAL',
  MODERN = 'MODERN',
  CLASSIC = 'CLASSIC',
  PORTFOLIO = 'PORTFOLIO',
  RESUME = 'RESUME',
  LANDING_PAGE = 'LANDING_PAGE',
  BLOG = 'BLOG',
  OTHER = 'OTHER',
}

// ============================================================================
// Table Types
// ============================================================================

/**
 * Portfolio table (Section 3.1)
 * Stores user portfolio data with versioning and publishing support
 */
export interface Portfolio {
  // Primary identifier
  id: string; // UUID

  // User relationship
  userId: string; // UUID, foreign key to auth.users

  // Basic information
  name: string; // VARCHAR(200), 1-200 chars
  slug: string; // VARCHAR(200), unique per user
  description: string | null; // TEXT

  // Portfolio data
  data: PortfolioData; // JSONB

  // Template relationship
  templateId: string | null; // UUID, foreign key to portfolio_templates

  // Publishing status
  isPublished: boolean; // Default: false
  isDraft: boolean; // Default: true
  visibility: PortfolioVisibility; // Default: PRIVATE

  // Custom domain
  subdomain: string | null; // VARCHAR(63), 3-63 chars, lowercase, hyphens

  // SEO metadata
  metaTitle: string | null; // VARCHAR(255)
  metaDescription: string | null; // TEXT
  ogImage: string | null; // VARCHAR(500)

  // Analytics
  viewCount: number; // INTEGER, Default: 0
  lastViewedAt: Date | null; // TIMESTAMPTZ

  // Build information
  buildStatus: PortfolioBuildStatus; // Default: PENDING
  buildArtifactPath: string | null; // VARCHAR(500)
  lastBuildAt: Date | null; // TIMESTAMPTZ

  // Timestamps
  createdAt: Date; // TIMESTAMPTZ
  updatedAt: Date; // TIMESTAMPTZ
  publishedAt: Date | null; // TIMESTAMPTZ
  deletedAt: Date | null; // TIMESTAMPTZ (soft delete)

  // Audit fields
  createdBy: string | null; // UUID
  updatedBy: string | null; // UUID
}

/**
 * Portfolio data structure (stored in JSONB)
 */
export interface PortfolioData {
  about?: {
    name?: string;
    title?: string;
    summary?: string;
    bio?: string;
    avatar?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    social?: {
      linkedin?: string;
      github?: string;
      twitter?: string;
      instagram?: string;
      [key: string]: string | undefined;
    };
  };
  experience?: Array<{
    id?: string;
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
    responsibilities?: string[];
  }>;
  education?: Array<{
    id?: string;
    degree: string;
    institution: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    gpa?: string;
    description?: string;
  }>;
  skills?: Array<{
    id?: string;
    name: string;
    category?: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }>;
  projects?: Array<{
    id?: string;
    name: string;
    description: string;
    url?: string;
    github?: string;
    image?: string;
    tags?: string[];
    startDate?: string;
    endDate?: string;
  }>;
  certifications?: Array<{
    id?: string;
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    credentialId?: string;
    url?: string;
  }>;
  awards?: Array<{
    id?: string;
    title: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
  languages?: Array<{
    id?: string;
    name: string;
    proficiency?: 'basic' | 'conversational' | 'fluent' | 'native';
  }>;
  interests?: string[];
  customSections?: Record<string, any>;
}

/**
 * Portfolio Template table (Section 3.2)
 * Predefined templates for creating portfolios
 */
export interface PortfolioTemplate {
  // Primary identifier
  id: string; // UUID

  // Basic information
  name: string; // VARCHAR(200), unique
  slug: string; // VARCHAR(200), unique
  description: string | null; // TEXT

  // Categorization
  category: TemplateCategory; // Default: OTHER

  // Media
  thumbnail: string | null; // VARCHAR(500)
  previewUrl: string | null; // VARCHAR(500)

  // Template content
  htmlTemplate: string; // TEXT, required
  cssTemplate: string; // TEXT, required
  jsTemplate: string | null; // TEXT

  // Configuration
  config: TemplateConfig; // JSONB
  defaultData: Partial<PortfolioData>; // JSONB

  // Premium status
  isPremium: boolean; // Default: false
  isActive: boolean; // Default: true

  // Usage tracking
  usageCount: number; // INTEGER, Default: 0

  // Timestamps
  createdAt: Date; // TIMESTAMPTZ
  updatedAt: Date; // TIMESTAMPTZ
}

/**
 * Template configuration (stored in JSONB)
 */
export interface TemplateConfig {
  // Available sections in this template
  sections?: string[];

  // Color scheme options
  colorSchemes?: Array<{
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  }>;

  // Font options
  fonts?: {
    heading?: string;
    body?: string;
  };

  // Layout options
  layout?: {
    maxWidth?: string;
    spacing?: 'compact' | 'normal' | 'spacious';
  };

  // Feature flags
  features?: {
    darkMode?: boolean;
    animations?: boolean;
    responsiveImages?: boolean;
    [key: string]: boolean | undefined;
  };

  // Custom fields
  [key: string]: any;
}

/**
 * Portfolio Version table (Section 3.3)
 * Version history for portfolio data
 */
export interface PortfolioVersion {
  // Primary identifier
  id: string; // UUID

  // Portfolio relationship
  portfolioId: string; // UUID, foreign key to portfolios

  // Version information
  version: number; // INTEGER, sequential (1, 2, 3, ...)
  name: string | null; // VARCHAR(200)

  // Version data
  data: PortfolioData; // JSONB, snapshot
  metadata: VersionMetadata; // JSONB

  // Audit fields
  createdBy: string | null; // UUID
  createdAt: Date; // TIMESTAMPTZ
}

/**
 * Version metadata (stored in JSONB)
 */
export interface VersionMetadata {
  operation?: 'INSERT' | 'UPDATE' | 'DELETE';
  isPublished?: boolean;
  buildStatus?: PortfolioBuildStatus;
  changesDescription?: string;
  [key: string]: any;
}

// ============================================================================
// Input Types (for API/Forms)
// ============================================================================

/**
 * Input for creating a new portfolio
 */
export interface CreatePortfolioInput {
  name: string;
  slug?: string; // Auto-generated if not provided
  description?: string;
  data?: Partial<PortfolioData>;
  templateId?: string;
  visibility?: PortfolioVisibility;
}

/**
 * Input for updating a portfolio
 */
export interface UpdatePortfolioInput {
  name?: string;
  slug?: string;
  description?: string;
  data?: Partial<PortfolioData>;
  templateId?: string;
  isPublished?: boolean;
  isDraft?: boolean;
  visibility?: PortfolioVisibility;
  subdomain?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

/**
 * Input for creating a portfolio template
 */
export interface CreateTemplateInput {
  name: string;
  slug: string;
  description?: string;
  category: TemplateCategory;
  thumbnail?: string;
  previewUrl?: string;
  htmlTemplate: string;
  cssTemplate: string;
  jsTemplate?: string;
  config?: TemplateConfig;
  defaultData?: Partial<PortfolioData>;
  isPremium?: boolean;
}

/**
 * Input for updating a portfolio template
 */
export interface UpdateTemplateInput {
  name?: string;
  slug?: string;
  description?: string;
  category?: TemplateCategory;
  thumbnail?: string;
  previewUrl?: string;
  htmlTemplate?: string;
  cssTemplate?: string;
  jsTemplate?: string;
  config?: TemplateConfig;
  defaultData?: Partial<PortfolioData>;
  isPremium?: boolean;
  isActive?: boolean;
}

// ============================================================================
// Database Function Types
// ============================================================================

/**
 * Result from get_portfolio_version_history function
 */
export interface PortfolioVersionHistory {
  version: number;
  name: string | null;
  createdAt: Date;
  createdBy: string | null;
  changesSummary: string;
}

/**
 * Result from compare_portfolio_versions function
 */
export interface VersionComparisonResult {
  field: string;
  version1Value: any;
  version2Value: any;
  isDifferent: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Portfolio with related template
 */
export interface PortfolioWithTemplate extends Portfolio {
  template?: PortfolioTemplate;
}

/**
 * Portfolio with version count
 */
export interface PortfolioWithVersionCount extends Portfolio {
  versionCount: number;
}

/**
 * Partial update type for portfolios
 */
export type PartialPortfolio = Partial<Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>>;

// ============================================================================
// Additional Enums (Sections 3.4-3.8)
// ============================================================================

/**
 * SSL certificate status for custom domains
 */
export enum SSLStatus {
  PENDING = 'PENDING',
  PROVISIONING = 'PROVISIONING',
  ACTIVE = 'ACTIVE',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

/**
 * Deployment status through the deployment pipeline
 */
export enum DeploymentStatus {
  QUEUED = 'QUEUED',
  BUILDING = 'BUILDING',
  DEPLOYING = 'DEPLOYING',
  DEPLOYED = 'DEPLOYED',
  FAILED = 'FAILED',
  ROLLED_BACK = 'ROLLED_BACK',
}

/**
 * Portfolio category for classification
 */
export enum PortfolioCategory {
  DEVELOPER = 'DEVELOPER',
  DESIGNER = 'DESIGNER',
  MARKETING = 'MARKETING',
  BUSINESS = 'BUSINESS',
  CREATIVE = 'CREATIVE',
  ACADEMIC = 'ACADEMIC',
  GENERAL = 'GENERAL',
}

// ============================================================================
// Additional Table Types (Sections 3.4-3.7)
// ============================================================================

/**
 * Custom Domain table (Section 3.4)
 * Custom domains configured for portfolios with DNS and SSL management
 */
export interface CustomDomain {
  id: string; // UUID
  portfolioId: string; // UUID, foreign key to portfolios
  domain: string; // VARCHAR(255), unique
  isVerified: boolean; // Default: false
  verificationToken: string; // VARCHAR(255)
  sslStatus: SSLStatus; // Default: PENDING
  sslCertPath: string | null; // TEXT
  sslExpiresAt: Date | null; // TIMESTAMPTZ
  dnsRecords: DNSRecord[]; // JSONB
  lastCheckedAt: Date | null; // TIMESTAMPTZ
  verifiedAt: Date | null; // TIMESTAMPTZ
  createdAt: Date; // TIMESTAMPTZ
  updatedAt: Date; // TIMESTAMPTZ
}

/**
 * DNS record structure (stored in JSONB)
 */
export interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX';
  name: string;
  value: string;
  ttl?: number;
  priority?: number;
}

/**
 * Portfolio Analytics table (Section 3.5)
 * Daily analytics data for portfolios with monthly partitioning
 */
export interface PortfolioAnalytics {
  id: string; // UUID
  portfolioId: string; // UUID, foreign key to portfolios
  date: Date; // DATE, indexed
  views: number; // INTEGER, default 0
  uniqueVisitors: number; // INTEGER, default 0
  avgTimeOnPage: number | null; // INTEGER (seconds)
  bounceRate: number | null; // NUMERIC(5,2) percentage (0-100)
  referrers: Record<string, number>; // JSONB
  countries: Record<string, number>; // JSONB
  devices: Record<string, number>; // JSONB
  createdAt: Date; // TIMESTAMPTZ
  updatedAt: Date; // TIMESTAMPTZ
}

/**
 * Portfolio Share table (Section 3.6)
 * Secure sharing links for portfolios with password protection and expiry
 */
export interface PortfolioShare {
  id: string; // UUID
  portfolioId: string; // UUID, foreign key to portfolios
  token: string; // VARCHAR(255), unique
  expiresAt: Date | null; // TIMESTAMPTZ
  password: string | null; // TEXT (hashed)
  viewCount: number; // INTEGER, default 0
  maxViews: number | null; // INTEGER
  createdAt: Date; // TIMESTAMPTZ
  lastAccessedAt: Date | null; // TIMESTAMPTZ
}

/**
 * Portfolio Deployment table (Section 3.7)
 * Deployment history and tracking for portfolios
 */
export interface PortfolioDeployment {
  id: string; // UUID
  portfolioId: string; // UUID, foreign key to portfolios
  status: DeploymentStatus; // Default: QUEUED
  buildLog: string | null; // TEXT
  errorMessage: string | null; // TEXT
  deployedUrl: string | null; // TEXT
  buildDuration: number | null; // INTEGER (seconds)
  deployedBy: string | null; // UUID
  deployedAt: Date | null; // TIMESTAMPTZ
  createdAt: Date; // TIMESTAMPTZ
}

// ============================================================================
// Input Types for New Tables
// ============================================================================

/**
 * Input for creating a custom domain
 */
export interface CreateCustomDomainInput {
  portfolioId: string;
  domain: string;
  verificationToken?: string; // Auto-generated if not provided
}

/**
 * Input for upserting analytics
 */
export interface UpsertAnalyticsInput {
  portfolioId: string;
  date: Date;
  views?: number;
  uniqueVisitors?: number;
  avgTimeOnPage?: number;
  bounceRate?: number;
  referrer?: string;
  country?: string;
  device?: string;
}

/**
 * Input for creating a share link
 */
export interface CreateShareInput {
  portfolioId: string;
  expiresInDays?: number;
  password?: string;
  maxViews?: number;
}

/**
 * Input for starting a deployment
 */
export interface StartDeploymentInput {
  portfolioId: string;
  deployedBy?: string;
}

// ============================================================================
// Database Function Return Types
// ============================================================================

/**
 * Result from get_portfolio_analytics_summary function
 */
export interface AnalyticsSummary {
  totalViews: number;
  totalUniqueVisitors: number;
  avgTimeOnPage: number;
  avgBounceRate: number;
  topReferrers: Record<string, number>;
  topCountries: Record<string, number>;
  topDevices: Record<string, number>;
  dailyData: Array<{
    date: Date;
    views: number;
    uniqueVisitors: number;
    avgTimeOnPage: number | null;
    bounceRate: number | null;
  }>;
}

/**
 * Result from validate_share_access function
 */
export interface ShareAccessValidation {
  isValid: boolean;
  portfolioId: string | null;
  requiresPassword: boolean;
  passwordCorrect: boolean;
  isExpired: boolean;
  viewsRemaining: number | null;
  errorMessage: string | null;
}

/**
 * Result from get_deployment_stats function
 */
export interface DeploymentStats {
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  avgBuildDuration: number;
  lastDeploymentAt: Date | null;
  lastSuccessfulDeploymentAt: Date | null;
}

/**
 * Result from get_domains_needing_ssl_renewal function
 */
export interface DomainSSLRenewal {
  id: string;
  portfolioId: string;
  domain: string;
  sslExpiresAt: Date;
  daysUntilExpiry: number;
}

// ============================================================================
// Updated Table Names
// ============================================================================

/**
 * Database table names
 */
export const TableName = {
  PORTFOLIOS: 'portfolios',
  PORTFOLIO_TEMPLATES: 'portfolio_templates',
  PORTFOLIO_VERSIONS: 'portfolio_versions',
  CUSTOM_DOMAINS: 'custom_domains',
  PORTFOLIO_ANALYTICS: 'portfolio_analytics',
  PORTFOLIO_SHARES: 'portfolio_shares',
  PORTFOLIO_DEPLOYMENTS: 'portfolio_deployments',
} as const;

/**
 * Type-safe table name type
 */
export type TableName = typeof TableName[keyof typeof TableName];
