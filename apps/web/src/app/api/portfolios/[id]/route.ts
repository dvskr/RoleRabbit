/**
 * Individual Portfolio API Endpoints
 * Section 2.1: GET, PUT, PATCH, DELETE operations (#11-24)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const PortfolioUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  templateId: z.string().uuid().optional(),
  data: z.object({
    hero: z.object({}).passthrough().optional(),
    about: z.object({}).passthrough().optional(),
    experience: z.array(z.object({}).passthrough()).optional(),
    projects: z.array(z.object({}).passthrough()).optional(),
    skills: z.array(z.string()).optional(),
    contact: z.object({}).passthrough().optional(),
  }).passthrough().optional(),
  isPublished: z.boolean().optional(),
  isDraft: z.boolean().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).optional(),
});

const PortfolioPatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  data: z.object({}).passthrough().optional(),
  isPublished: z.boolean().optional(),
  isDraft: z.boolean().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).optional(),
}).partial();

// ============================================================================
// MOCK DATABASE (Replace with actual database)
// ============================================================================

interface Portfolio {
  id: string;
  userId: string;
  name: string;
  slug: string;
  templateId?: string;
  data: any;
  isPublished: boolean;
  isDraft: boolean;
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  subdomain?: string;
  customDomains: string[];
  viewCount: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  version: number;
}

// Mock in-memory database (shared with route.ts)
const portfolios: Portfolio[] = [];

function getCurrentUserId(): string {
  return 'user-123';
}

function verifyOwnership(portfolio: Portfolio, userId: string): boolean {
  return portfolio.userId === userId;
}

// ============================================================================
// GET /api/portfolios/[id] - Get Single Portfolio
// Requirements: #11-13
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId();
    const { id } = params;

    // Find portfolio
    const portfolio = portfolios.find(
      (p) => p.id === id && !p.deletedAt
    );

    // Return 404 if not found (#13)
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Verify ownership (#12)
    if (!verifyOwnership(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this portfolio' },
        { status: 403 }
      );
    }

    // Return with related entities (#11)
    // TODO: Fetch actual related data from database
    const enrichedPortfolio = {
      ...portfolio,
      template: portfolio.templateId ? { id: portfolio.templateId, name: 'Template Name' } : null,
      versionsCount: 5, // TODO: Get actual count
      analytics: {
        totalViews: portfolio.viewCount,
        uniqueVisitors: Math.floor(portfolio.viewCount * 0.7),
        avgTimeOnPage: 120,
        bounceRate: 35,
      },
    };

    return NextResponse.json(enrichedPortfolio);
  } catch (error) {
    console.error('Failed to get portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/portfolios/[id] - Update Portfolio (Full)
// Requirements: #14-18
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId();
    const { id } = params;
    const body = await request.json();

    // Find portfolio
    const portfolioIndex = portfolios.findIndex(
      (p) => p.id === id && !p.deletedAt
    );

    if (portfolioIndex === -1) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    const portfolio = portfolios[portfolioIndex];

    // Verify ownership (#15)
    if (!verifyOwnership(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Validate update data (#16)
    const validationResult = PortfolioUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Optimistic locking check (#18)
    const requestVersion = body.version;
    if (requestVersion && requestVersion !== portfolio.version) {
      return NextResponse.json(
        {
          error: 'Conflict - Portfolio was modified by another process',
          currentVersion: portfolio.version,
        },
        { status: 409 }
      );
    }

    // Update portfolio
    const updatedPortfolio = {
      ...portfolio,
      ...validationResult.data,
      updatedBy: userId, // #17
      updatedAt: new Date().toISOString(), // #17
      version: portfolio.version + 1, // #18
    };

    portfolios[portfolioIndex] = updatedPortfolio;

    // TODO: Save to actual database
    // await db.portfolio.update({ where: { id }, data: updatedPortfolio });

    return NextResponse.json(updatedPortfolio);
  } catch (error) {
    console.error('Failed to update portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/portfolios/[id] - Partial Update
// Requirements: #19-20
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId();
    const { id } = params;
    const body = await request.json();

    // Find portfolio
    const portfolioIndex = portfolios.findIndex(
      (p) => p.id === id && !p.deletedAt
    );

    if (portfolioIndex === -1) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    const portfolio = portfolios[portfolioIndex];

    // Verify ownership
    if (!verifyOwnership(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Validate partial update
    const validationResult = PortfolioPatchSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Merge provided fields without overwriting unspecified fields (#20)
    const updatedPortfolio = {
      ...portfolio,
      ...validationResult.data,
      // Deep merge data object if provided
      data: validationResult.data.data
        ? { ...portfolio.data, ...validationResult.data.data }
        : portfolio.data,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
      version: portfolio.version + 1,
    };

    portfolios[portfolioIndex] = updatedPortfolio;

    return NextResponse.json(updatedPortfolio);
  } catch (error) {
    console.error('Failed to patch portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/portfolios/[id] - Delete Portfolio (Soft Delete)
// Requirements: #21-24
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId();
    const { id } = params;

    // Find portfolio
    const portfolioIndex = portfolios.findIndex(
      (p) => p.id === id && !p.deletedAt
    );

    if (portfolioIndex === -1) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    const portfolio = portfolios[portfolioIndex];

    // Verify ownership (#22)
    if (!verifyOwnership(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // If published, unpublish first (#24)
    if (portfolio.isPublished) {
      // TODO: Remove from hosting
      // await hostingService.unpublish(portfolio.id);

      portfolio.isPublished = false;
      portfolio.subdomain = undefined;
    }

    // Soft delete (#23)
    portfolios[portfolioIndex] = {
      ...portfolio,
      deletedAt: new Date().toISOString(),
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    };

    // TODO: Cascade delete related records (#24)
    // await db.portfolioVersion.deleteMany({ where: { portfolioId: id } });
    // await db.portfolioAnalytics.deleteMany({ where: { portfolioId: id } });
    // await db.portfolioShare.deleteMany({ where: { portfolioId: id } });
    // await db.deployment.deleteMany({ where: { portfolioId: id } });

    return NextResponse.json(
      { message: 'Portfolio deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
