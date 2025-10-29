/**
 * Portfolio Types
 */

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
