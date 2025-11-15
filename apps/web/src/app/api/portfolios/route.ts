/**
 * Portfolio CRUD API Endpoints
 * Section 2.1: Core Portfolio CRUD Endpoints (#1-30)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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
// MOCK DATABASE (Replace with actual database in production)
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

// Mock in-memory database
const portfolios: Portfolio[] = [];

// Helper: Get current user ID (replace with actual auth)
function getCurrentUserId(): string {
  // TODO: Replace with actual authentication
  return 'user-123';
}

// Helper: Generate unique slug
function generateSlug(name: string, userId: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Check for collision
  const existingSlugs = portfolios
    .filter((p) => p.userId === userId && !p.deletedAt)
    .map((p) => p.slug);

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Append random suffix
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${suffix}`;
}

// Helper: Verify ownership
function verifyOwnership(portfolio: Portfolio, userId: string): boolean {
  return portfolio.userId === userId;
}

// ============================================================================
// POST /api/portfolios - Create Portfolio
// Requirements: #1-6
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const userId = getCurrentUserId();
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
      // TODO: Check if template exists in database
      // const templateExists = await db.template.findUnique({ where: { id: templateId } });
      // if (!templateExists) {
      //   return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      // }
    }

    // Generate unique slug (#5)
    const slug = generateSlug(name, userId);

    // Create portfolio with defaults (#6)
    const portfolio: Portfolio = {
      id: crypto.randomUUID(),
      userId,
      name,
      slug,
      templateId,
      data,
      isPublished: false,
      isDraft: true,
      visibility: 'PRIVATE',
      customDomains: [],
      viewCount: 0,
      createdBy: userId, // #4
      updatedBy: userId, // #4
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    portfolios.push(portfolio);

    // TODO: Save to actual database
    // const createdPortfolio = await db.portfolio.create({ data: portfolio });

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
    const userId = getCurrentUserId();
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

    // Filter portfolios by user (#10)
    let filtered = portfolios.filter(
      (p) => p.userId === userId && !p.deletedAt
    );

    // Apply filters (#7)
    if (isPublished !== undefined) {
      filtered = filtered.filter((p) => p.isPublished === (isPublished === 'true'));
    }
    if (isDraft !== undefined) {
      filtered = filtered.filter((p) => p.isDraft === (isDraft === 'true'));
    }

    // Sort (#7)
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Portfolio];
      const bValue = b[sortBy as keyof Portfolio];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    // Pagination (#8-9)
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = filtered.slice(startIndex, endIndex);

    // Return with metadata (#9)
    return NextResponse.json({
      data: paginatedResults,
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
