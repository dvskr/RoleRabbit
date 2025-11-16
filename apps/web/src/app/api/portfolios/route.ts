/**
 * Portfolio CRUD API Endpoints
 * Section 2.1: Core Portfolio CRUD Endpoints (#1-30)
 * Updated to use Prisma Database
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const PortfolioCreateSchema = z.object({
  name: z.string().min(1).max(200),
  templateId: z.string().uuid().optional(),
  data: z.object({
    hero: z.object({}).passthrough().optional(),
    about: z.object({}).passthrough().optional(),
    experience: z.array(z.object({}).passthrough()).optional(),
    projects: z.array(z.object({}).passthrough()).optional(),
    skills: z.array(z.string()).optional(),
    contact: z.object({}).passthrough().optional(),
  }).passthrough(),
});

const PortfolioUpdateSchema = PortfolioCreateSchema.extend({
  isPublished: z.boolean().optional(),
  isDraft: z.boolean().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).optional(),
  subdomain: z.string().optional(),
  customDomains: z.array(z.string()).optional(),
});

const PortfolioPatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  data: z.object({}).passthrough().optional(),
  isPublished: z.boolean().optional(),
  isDraft: z.boolean().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).optional(),
});

const PaginationSchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).default('1'),
  limit: z.string().transform((val) => Math.min(parseInt(val, 10), 100)).default('20'),
  isPublished: z.enum(['true', 'false']).optional(),
  isDraft: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper: Get current user ID (replace with actual auth)
async function getCurrentUserId(): Promise<string> {
  // TODO: Implement proper authentication
  // For now, return a test user ID
  // In production, get from session/JWT/auth token
  return 'user-123';
}

// Helper: Generate unique slug
async function generateUniqueSlug(title: string, userId: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  while (await prisma.portfolio.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}


// ============================================================================
// POST /api/portfolios - Create Portfolio
// Requirements: #1-6
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();

    // Validate request body (#2-3)
    const validationResult = PortfolioCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { name, templateId, data } = validationResult.data;

    // Validate template exists (if provided) (#2)
    if (templateId) {
      const templateExists = await prisma.portfolioTemplate.findUnique({ 
        where: { id: templateId } 
      });
      if (!templateExists) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
    }

    // Generate unique slug (#5)
    const slug = await generateUniqueSlug(name, userId);

    // Create portfolio in database (#6)
    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        title: name,
        slug,
        templateId,
        content: data as Prisma.InputJsonValue,
        status: 'DRAFT',
        visibility: 'PRIVATE',
        viewCount: 0,
        shareCount: 0,
      },
      include: {
        template: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    console.error('Failed to create portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/portfolios - List Portfolios
// Requirements: #7-10
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters (#8-9)
    const params = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      isPublished: searchParams.get('isPublished'),
      isDraft: searchParams.get('isDraft'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validationResult = PaginationSchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { page, limit, isPublished, isDraft, sortBy, sortOrder } =
      validationResult.data;

    // Build Prisma where clause
    const where: Prisma.PortfolioWhereInput = {
      userId,
    };

    // Apply status filters
    if (isPublished === 'true') {
      where.status = 'PUBLISHED';
    } else if (isDraft === 'true') {
      where.status = 'DRAFT';
    }

    // Get total count for pagination
    const total = await prisma.portfolio.count({ where });
    const totalPages = Math.ceil(total / limit);

    // Fetch paginated results with sorting
    const portfolios = await prisma.portfolio.findMany({
      where,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            thumbnail: true,
          },
        },
        _count: {
          select: {
            versions: true,
            shares: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Return with metadata (#9)
    return NextResponse.json({
      data: portfolios,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Failed to list portfolios:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
