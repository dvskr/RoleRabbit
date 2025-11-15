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

/**
 * Database table names
 */
export const TableName = {
  PORTFOLIOS: 'portfolios',
  PORTFOLIO_TEMPLATES: 'portfolio_templates',
  PORTFOLIO_VERSIONS: 'portfolio_versions',
} as const;

/**
 * Type-safe table name type
 */
export type TableName = typeof TableName[keyof typeof TableName];
