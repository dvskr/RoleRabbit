/**
 * Portfolio Types
 */

import { PortfolioCategory } from '../data/categories';

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  data: PortfolioData;
  templateId: string;
  isPublished: boolean;
  subdomain?: string;
  customDomain?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface PortfolioData {
  hero: {
    title: string;
    subtitle: string;
    image?: string;
  };
  about: {
    bio: string;
    image?: string;
  };
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  contact: {
    email: string;
    phone?: string;
    location?: string;
    socialLinks?: SocialLink[];
  };
}

export interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string;
  achievements?: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  image?: string;
}

export interface Skill {
  name: string;
  proficiency: number; // 1-5
  category: string;
}

export interface SocialLink {
  platform: 'linkedin' | 'github' | 'twitter' | 'website';
  url: string;
}

export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
}

export type TemplateCategory = PortfolioCategory;

export interface PortfolioTemplateDefinition extends PortfolioTemplate {
  category: TemplateCategory;
  accentColor: string;
  styles: Record<string, unknown>;
  darkMode?: boolean;
}

export type SectionType = 'hero' | 'about' | 'experience' | 'projects' | 'skills' | 'education' | 'contact';

export interface SectionItem {
  [key: string]: unknown;
}

export interface SectionConfig {
  headline?: string;
  subheading?: string;
  ctaText?: string;
  secondaryCta?: string;
  title?: string;
  description?: string;
  items?: SectionItem[];
  email?: string;
  socialLinks?: SectionItem[];
  [key: string]: unknown;
}

export interface Section {
  id: string;
  type: SectionType;
  title?: string;
  order: number;
  enabled: boolean;
  required?: boolean;
  config: SectionConfig;
}

export interface WebsiteTheme {
  templateId: string;
  primaryColor: string;
  colors: string[];
  [key: string]: unknown;
}

export interface WebsiteConfig {
  sections: Section[];
  theme: WebsiteTheme;
  settings?: Record<string, unknown>;
}