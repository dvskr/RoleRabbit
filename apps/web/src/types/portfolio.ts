// Portfolio Generator Types

export interface PortfolioWebsite {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  templateId: string;
  sections: PortfolioSection[];
  theme: ThemeConfig;
  seoConfig: SEOConfig;
  analytics: AnalyticsConfig;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSection {
  id: string;
  type: SectionType;
  order: number;
  visible: boolean;
  data: SectionData;
  customData?: Record<string, any>;
}

export type SectionType =
  | 'hero'
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'certifications'
  | 'testimonials'
  | 'contact'
  | 'blog';

export interface SectionData {
  hero?: HeroData;
  about?: AboutData;
  experience?: ExperienceData[];
  projects?: ProjectData[];
  skills?: SkillData[];
  education?: EducationData[];
  certifications?: CertificationData[];
  testimonials?: TestimonialData[];
  contact?: ContactData;
  blog?: BlogData;
}

export interface HeroData {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
  backgroundVideo?: string;
}

export interface AboutData {
  title: string;
  bio: string;
  profileImage?: string;
  customFields?: Record<string, any>;
}

export interface ExperienceData {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string[];
  achievements?: string[];
  technologies?: string[];
}

export interface ProjectData {
  title: string;
  description: string;
  imageUrl?: string;
  technologies: string[];
  demoLink?: string;
  githubLink?: string;
  featured: boolean;
}

export interface SkillData {
  name: string;
  category: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  icon?: string;
}

export interface EducationData {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  honors?: string;
}

export interface CertificationData {
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  verified: boolean;
}

export interface TestimonialData {
  author: string;
  role: string;
  company: string;
  content: string;
  imageUrl?: string;
}

export interface ContactData {
  email: string;
  phone?: string;
  location?: string;
  socialLinks: SocialLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface BlogData {
  posts: BlogPost[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  tags: string[];
  imageUrl?: string;
  author: string;
}

export interface ThemeConfig {
  colorScheme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  layout: 'single-column' | 'two-column';
}

export interface TypographyConfig {
  fontFamily: string;
  headingFont: string;
  bodyFont: string;
  fontSize: 'small' | 'medium' | 'large';
}

export interface SpacingConfig {
  sectionPadding: 'tight' | 'normal' | 'relaxed';
  cardSpacing: 'compact' | 'normal' | 'generous';
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  ogImage?: string;
  twitterHandle?: string;
  customMeta?: Record<string, string>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackingId?: string;
  goals?: AnalyticsGoal[];
}

export interface AnalyticsGoal {
  name: string;
  event: string;
  value: number;
}

export interface HostingConfig {
  subdomain: string;
  customDomain?: string;
  sslEnabled: boolean;
  cdnEnabled: boolean;
  analyticsEnabled: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'tech' | 'creative' | 'business' | 'academic' | 'modern' | 'minimalist';
  previewImage: string;
  colorScheme: ThemeConfig;
  layout: 'single-column' | 'two-column';
  features: string[];
}

export interface ExportOptions {
  format: 'html' | 'zip' | 'github' | 'vercel' | 'netlify';
  includeAssets: boolean;
  optimizeImages: boolean;
  minifyCode: boolean;
}

export interface GeneratedSite {
  html: string;
  css: string;
  js: string;
  assets: Asset[];
  metadata: SiteMetadata;
}

export interface Asset {
  type: 'image' | 'font' | 'video' | 'document';
  url: string;
  localPath: string;
}

export interface SiteMetadata {
  url: string;
  subdomain: string;
  customDomain?: string;
  deployedAt: string;
  version: string;
}


