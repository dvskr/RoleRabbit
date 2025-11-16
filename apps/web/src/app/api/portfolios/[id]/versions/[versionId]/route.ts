/**
 * Individual Portfolio Version API Routes
 * Section 2.5: Version Control Endpoints
 *
 * GET /api/portfolios/:id/versions/:versionId - Get full version data
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

interface Portfolio {
  id: string;
  userId: string;
}

interface PortfolioVersion {
  id: string;
  portfolioId: string;
  version: number;
  name: string | null;
  data: any;
  metadata: any;
  createdBy: string | null;
  createdAt: string;
}

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

// ============================================================================
// GET /api/portfolios/:id/versions/:versionId
// Requirement #8: Get full version data
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId, versionId } = params;

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

    // Find version
    // TODO: Replace with actual database query
    // const version = await db.portfolioVersion.findUnique({
    //   where: { id: versionId, portfolioId },
    // });

    const version = portfolioVersions.find(
      (v) => v.id === versionId && v.portfolioId === portfolioId
    );

    if (!version) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    // Requirement #8: Return full version data
    return NextResponse.json({
      version: {
        id: version.id,
        portfolioId: version.portfolioId,
        version: version.version,
        name: version.name,
        data: version.data, // Full data snapshot
        metadata: version.metadata,
        createdBy: version.createdBy,
        createdAt: version.createdAt,
      },
    });

  } catch (error) {
    console.error('Error fetching version:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
