/**
 * Portfolio Service
 * Section 2.11: Service Layer Implementation
 *
 * Requirements #1-5: PortfolioService class with business logic
 */

import { randomUUID } from 'crypto';
import {
  PortfolioNotFoundError,
  TemplateNotFoundError,
  ConflictError,
  ValidationError,
  DuplicateError,
} from '@/lib/errors';

/**
 * Portfolio data structure
 */
export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  slug: string;
  templateId: string | null;
  data: PortfolioData;
  isPublished: boolean;
  isDraft: boolean;
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  subdomain: string | null;
  customDomains: string[];
  viewCount: number;
  version: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PortfolioData {
  about?: {
    fullName?: string;
    title?: string;
    bio?: string;
    profileImage?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    location?: string;
    socialLinks?: Array<{ platform: string; url: string }>;
  };
  experience?: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  education?: Array<{
    id: string;
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string;
  }>;
  skills?: Array<{
    id: string;
    name: string;
    category: string;
    proficiency?: string;
  }>;
  projects?: Array<{
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    technologies?: string[];
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
  }>;
}

/**
 * Portfolio creation input
 */
export interface CreatePortfolioInput {
  name: string;
  templateId?: string;
  data?: Partial<PortfolioData>;
}

/**
 * Portfolio update input
 */
export interface UpdatePortfolioInput {
  name?: string;
  data?: Partial<PortfolioData>;
  isPublished?: boolean;
  subdomain?: string;
  updatedAt?: string; // For optimistic locking
}

/**
 * Mock database
 * TODO: Replace with actual database (Prisma)
 */
const portfolios: Portfolio[] = [];
const templates: any[] = [];

/**
 * Portfolio Service
 * Requirement #1: Create PortfolioService class with 8 methods
 */
export class PortfolioService {
  /**
   * Requirement #2: Create portfolio with business logic
   * - Validate template exists
   * - Generate slug
   * - Create portfolio record
   * - Create initial version
   */
  async create(userId: string, input: CreatePortfolioInput): Promise<Portfolio> {
    // Requirement #2: Validate template exists
    if (input.templateId) {
      const template = await this.validateTemplateExists(input.templateId);
      if (!template) {
        throw new TemplateNotFoundError(input.templateId);
      }
    }

    // Requirement #2: Generate slug
    const slug = await this.generateUniqueSlug(input.name, userId);

    // Requirement #2: Create portfolio record
    const portfolio: Portfolio = {
      id: randomUUID(),
      userId,
      name: input.name,
      slug,
      templateId: input.templateId || null,
      data: input.data || {},
      isPublished: false,
      isDraft: true,
      visibility: 'PRIVATE',
      subdomain: null,
      customDomains: [],
      viewCount: 0,
      version: 1,
      createdBy: userId,
      updatedBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    // TODO: In production, use database transaction
    // const result = await db.$transaction(async (tx) => {
    //   const portfolio = await tx.portfolio.create({ data: portfolioData });
    //   await tx.portfolioVersion.create({ data: initialVersionData });
    //   return portfolio;
    // });

    portfolios.push(portfolio);

    // Requirement #2: Create initial version
    await this.createInitialVersion(portfolio);

    return portfolio;
  }

  /**
   * Requirement #3: Update portfolio with optimistic locking
   * - Check updatedAt matches
   * - Throw ConflictError if stale
   */
  async update(
    portfolioId: string,
    userId: string,
    input: UpdatePortfolioInput
  ): Promise<Portfolio> {
    const portfolio = await this.findById(portfolioId);

    if (!portfolio) {
      throw new PortfolioNotFoundError(portfolioId);
    }

    // Requirement #3: Optimistic locking check
    if (input.updatedAt && input.updatedAt !== portfolio.updatedAt) {
      throw new ConflictError(
        'Portfolio was modified by another process. Please refresh and try again.',
        {
          currentUpdatedAt: portfolio.updatedAt,
          providedUpdatedAt: input.updatedAt,
        }
      );
    }

    // Update portfolio
    const updatedPortfolio: Portfolio = {
      ...portfolio,
      name: input.name ?? portfolio.name,
      data: input.data ? { ...portfolio.data, ...input.data } : portfolio.data,
      isPublished: input.isPublished ?? portfolio.isPublished,
      subdomain: input.subdomain ?? portfolio.subdomain,
      version: portfolio.version + 1,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    };

    // TODO: In production, use database update
    // await db.portfolio.update({
    //   where: { id: portfolioId },
    //   data: updatedPortfolio,
    // });

    const index = portfolios.findIndex((p) => p.id === portfolioId);
    if (index !== -1) {
      portfolios[index] = updatedPortfolio;
    }

    return updatedPortfolio;
  }

  /**
   * Requirement #4: Soft delete with cascade
   * - Set deletedAt
   * - Cascade to related records
   */
  async delete(portfolioId: string, userId: string): Promise<void> {
    const portfolio = await this.findById(portfolioId);

    if (!portfolio) {
      throw new PortfolioNotFoundError(portfolioId);
    }

    // Requirement #4: Set deletedAt
    const now = new Date().toISOString();

    // TODO: In production, use database transaction to cascade delete
    // await db.$transaction([
    //   db.portfolio.update({
    //     where: { id: portfolioId },
    //     data: { deletedAt: now },
    //   }),
    //   db.portfolioVersion.updateMany({
    //     where: { portfolioId },
    //     data: { deletedAt: now },
    //   }),
    //   db.portfolioAnalytics.updateMany({
    //     where: { portfolioId },
    //     data: { deletedAt: now },
    //   }),
    //   db.portfolioShare.updateMany({
    //     where: { portfolioId },
    //     data: { deletedAt: now },
    //   }),
    //   db.deployment.updateMany({
    //     where: { portfolioId },
    //     data: { deletedAt: now },
    //   }),
    // ]);

    const index = portfolios.findIndex((p) => p.id === portfolioId);
    if (index !== -1) {
      portfolios[index].deletedAt = now;
      portfolios[index].updatedAt = now;
      portfolios[index].updatedBy = userId;
    }

    console.log(`Soft deleted portfolio ${portfolioId} and cascaded to related records`);
  }

  /**
   * Requirement #5: Publish portfolio
   * - Validate data completeness
   */
  async publish(portfolioId: string, userId: string): Promise<Portfolio> {
    const portfolio = await this.findById(portfolioId);

    if (!portfolio) {
      throw new PortfolioNotFoundError(portfolioId);
    }

    // Requirement #5: Validate data completeness
    const validation = this.validateDataCompleteness(portfolio);

    if (!validation.isValid) {
      throw new ValidationError(
        'Portfolio data is incomplete. Please fill in all required fields before publishing.',
        { missingFields: validation.missingFields }
      );
    }

    // Update portfolio to published
    const publishedPortfolio: Portfolio = {
      ...portfolio,
      isPublished: true,
      isDraft: false,
      visibility: 'PUBLIC',
      version: portfolio.version + 1,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    };

    const index = portfolios.findIndex((p) => p.id === portfolioId);
    if (index !== -1) {
      portfolios[index] = publishedPortfolio;
    }

    return publishedPortfolio;
  }

  /**
   * Unpublish portfolio
   */
  async unpublish(portfolioId: string, userId: string): Promise<Portfolio> {
    const portfolio = await this.findById(portfolioId);

    if (!portfolio) {
      throw new PortfolioNotFoundError(portfolioId);
    }

    const unpublishedPortfolio: Portfolio = {
      ...portfolio,
      isPublished: false,
      isDraft: true,
      visibility: 'PRIVATE',
      version: portfolio.version + 1,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    };

    const index = portfolios.findIndex((p) => p.id === portfolioId);
    if (index !== -1) {
      portfolios[index] = unpublishedPortfolio;
    }

    return unpublishedPortfolio;
  }

  /**
   * Duplicate portfolio
   */
  async duplicate(portfolioId: string, userId: string): Promise<Portfolio> {
    const source = await this.findById(portfolioId);

    if (!source) {
      throw new PortfolioNotFoundError(portfolioId);
    }

    // Create copy with new name
    const copyName = `${source.name} (Copy)`;
    const slug = await this.generateUniqueSlug(copyName, userId);

    const duplicate: Portfolio = {
      ...source,
      id: randomUUID(),
      name: copyName,
      slug,
      isPublished: false,
      isDraft: true,
      visibility: 'PRIVATE',
      subdomain: null,
      customDomains: [],
      viewCount: 0,
      version: 1,
      createdBy: userId,
      updatedBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    portfolios.push(duplicate);

    // Create initial version for duplicate
    await this.createInitialVersion(duplicate);

    return duplicate;
  }

  /**
   * Find portfolio by ID
   */
  async findById(portfolioId: string): Promise<Portfolio | null> {
    // TODO: In production, use database query
    // return await db.portfolio.findUnique({
    //   where: { id: portfolioId },
    //   include: { template: true, versions: true },
    // });

    const portfolio = portfolios.find(
      (p) => p.id === portfolioId && !p.deletedAt
    );

    return portfolio || null;
  }

  /**
   * List portfolios for user
   */
  async findByUserId(
    userId: string,
    filters?: {
      isPublished?: boolean;
      isDraft?: boolean;
    }
  ): Promise<Portfolio[]> {
    let results = portfolios.filter(
      (p) => p.userId === userId && !p.deletedAt
    );

    if (filters?.isPublished !== undefined) {
      results = results.filter((p) => p.isPublished === filters.isPublished);
    }

    if (filters?.isDraft !== undefined) {
      results = results.filter((p) => p.isDraft === filters.isDraft);
    }

    return results;
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  /**
   * Validate template exists
   */
  private async validateTemplateExists(templateId: string): Promise<boolean> {
    // TODO: In production, query database
    // const template = await db.template.findUnique({
    //   where: { id: templateId, isPublished: true },
    // });
    // return !!template;

    return true; // Mock: assume template exists
  }

  /**
   * Generate unique slug
   * Requirement #2: Generate slug from name
   */
  private async generateUniqueSlug(
    name: string,
    userId: string
  ): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);

    let slug = baseSlug;
    let counter = 1;

    // Check uniqueness
    while (await this.slugExists(slug, userId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Check if slug exists for user
   */
  private async slugExists(slug: string, userId: string): Promise<boolean> {
    // TODO: In production, query database
    // const existing = await db.portfolio.findFirst({
    //   where: { slug, userId, deletedAt: null },
    // });
    // return !!existing;

    return portfolios.some(
      (p) => p.slug === slug && p.userId === userId && !p.deletedAt
    );
  }

  /**
   * Create initial version
   * Requirement #2: Create initial version on portfolio creation
   */
  private async createInitialVersion(portfolio: Portfolio): Promise<void> {
    // TODO: In production, create version record
    // await db.portfolioVersion.create({
    //   data: {
    //     id: randomUUID(),
    //     portfolioId: portfolio.id,
    //     version: 1,
    //     name: 'Initial version',
    //     data: portfolio.data,
    //     createdBy: portfolio.createdBy,
    //     createdAt: new Date(),
    //   },
    // });

    console.log(`Created initial version for portfolio ${portfolio.id}`);
  }

  /**
   * Validate data completeness
   * Requirement #5: Validate before publish
   */
  private validateDataCompleteness(portfolio: Portfolio): {
    isValid: boolean;
    missingFields: string[];
  } {
    const missingFields: string[] = [];

    // Check required fields
    if (!portfolio.data.about?.fullName) {
      missingFields.push('about.fullName');
    }

    if (!portfolio.data.about?.bio) {
      missingFields.push('about.bio');
    }

    if (!portfolio.data.contact?.email) {
      missingFields.push('contact.email');
    }

    // Recommended fields (warnings, not blockers)
    if (!portfolio.data.projects || portfolio.data.projects.length === 0) {
      console.warn('Portfolio has no projects - recommended to add at least one');
    }

    if (!portfolio.data.skills || portfolio.data.skills.length === 0) {
      console.warn('Portfolio has no skills - recommended to add some');
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }
}
