/**
 * Portfolio Versions API Routes
 * Section 2.5: Version Control Endpoints
 *
 * GET /api/portfolios/:id/versions - List all versions
 * POST /api/portfolios/:id/versions - Create new version snapshot
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

interface Portfolio {
  id: string;
  userId: string;
  name: string;
  data: any;
  updatedAt: string;
  version: number;
}

interface PortfolioVersion {
  id: string;
  portfolioId: string;
  version: number;
  name: string | null;
  data: any;
  metadata: VersionMetadata | null;
  createdBy: string | null;
  createdAt: string;
}

interface VersionMetadata {
  changeDescription?: string;
  tags?: string[];
  isAutoSave?: boolean;
  dataSize?: number;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CreateVersionSchema = z.object({
  name: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
});

const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ============================================================================
// MOCK DATABASE
// ============================================================================

const portfolios: Portfolio[] = [];
const portfolioVersions: PortfolioVersion[] = [];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCurrentUserId(request: NextRequest): string {
  const authHeader = request.headers.get('authorization');
  return authHeader?.replace('Bearer ', '') || 'test-user-id';
}

function verifyOwnership(portfolio: Portfolio, userId: string): boolean {
  return portfolio.userId === userId;
}

/**
 * Calculate data size in bytes
 */
function calculateDataSize(data: any): number {
  return JSON.stringify(data).length;
}

/**
 * Get next version number
 * Requirement #6: Auto-increment version number
 */
function getNextVersionNumber(portfolioId: string): number {
  const versions = portfolioVersions.filter((v) => v.portfolioId === portfolioId);

  if (versions.length === 0) {
    return 1;
  }

  const maxVersion = Math.max(...versions.map((v) => v.version));
  return maxVersion + 1;
}

// ============================================================================
// GET /api/portfolios/:id/versions
// Requirements #1-3: List all versions with pagination
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId } = params;

    const { searchParams } = new URL(request.url);

    const paginationValidation = PaginationSchema.safeParse({
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    });

    if (!paginationValidation.success) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters', details: paginationValidation.error.errors },
        { status: 400 }
      );
    }

    const { page, limit } = paginationValidation.data;

    // Find portfolio
    const portfolio = portfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (!verifyOwnership(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this portfolio' },
        { status: 403 }
      );
    }

    // Get versions for portfolio
    // TODO: Replace with actual database query
    // const versions = await db.portfolioVersion.findMany({
    //   where: { portfolioId },
    //   orderBy: { version: 'desc' },
    //   skip: (page - 1) * limit,
    //   take: limit,
    // });

    const allVersions = portfolioVersions
      .filter((v) => v.portfolioId === portfolioId)
      .sort((a, b) => b.version - a.version); // Requirement #1: Sort by version DESC

    const total = allVersions.length;

    // Requirement #3: Implement pagination if >50 versions
    const paginatedVersions = allVersions.slice((page - 1) * limit, page * limit);

    // Requirement #2: Return version metadata (exclude full data from list)
    const versionMetadata = paginatedVersions.map((v) => ({
      id: v.id,
      version: v.version,
      name: v.name,
      createdAt: v.createdAt,
      createdBy: v.createdBy,
      dataSize: v.metadata?.dataSize || calculateDataSize(v.data),
      metadata: {
        changeDescription: v.metadata?.changeDescription,
        tags: v.metadata?.tags,
        isAutoSave: v.metadata?.isAutoSave,
      },
    }));

    return NextResponse.json({
      versions: versionMetadata,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasPagination: total > 50,
      },
    });

  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/portfolios/:id/versions
// Requirements #4-7: Create new version snapshot
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId } = params;

    const body = await request.json().catch(() => ({}));

    const validation = CreateVersionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid version data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, description, tags } = validation.data;

    // Find portfolio
    const portfolio = portfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (!verifyOwnership(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this portfolio' },
        { status: 403 }
      );
    }

    // Requirement #6: Auto-increment version number from max existing version
    const versionNumber = getNextVersionNumber(portfolioId);

    // Requirement #7: Store full portfolio.data JSON snapshot
    const dataSnapshot = JSON.parse(JSON.stringify(portfolio.data)); // Deep copy

    const newVersion: PortfolioVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      portfolioId,
      version: versionNumber,
      name: name || null, // Requirement #5: Optional name for version label
      data: dataSnapshot,
      metadata: {
        changeDescription: description,
        tags,
        isAutoSave: false,
        dataSize: calculateDataSize(dataSnapshot),
      },
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    // TODO: Save to database
    // await db.portfolioVersion.create({ data: newVersion });

    portfolioVersions.push(newVersion);

    return NextResponse.json(
      {
        message: 'Version created successfully',
        version: {
          id: newVersion.id,
          version: newVersion.version,
          name: newVersion.name,
          createdAt: newVersion.createdAt,
          createdBy: newVersion.createdBy,
          dataSize: newVersion.metadata?.dataSize,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
