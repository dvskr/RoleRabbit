/**
 * Portfolio JSON Import API Route
 * Section 2.3: Data Import/Export Endpoints
 *
 * POST /api/portfolios/:id/import - Import portfolio data from JSON
 */

import { NextRequest, NextResponse } from 'next/server';
import { PortfolioDataSchema } from '@/types/portfolio';

// ============================================================================
// TYPES
// ============================================================================

interface Portfolio {
  id: string;
  userId: string;
  name: string;
  data: any;
  updatedAt: string;
  updatedBy: string | null;
  version: number;
}

// ============================================================================
// MOCK DATABASE
// ============================================================================

const portfolios: Portfolio[] = [];

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
// POST /api/portfolios/:id/import
// Requirement #11: Accept JSON export and validate against schema
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId } = params;

    const body = await request.json();

    // Validate imported data against PortfolioData schema
    const validation = PortfolioDataSchema.safeParse(body.data || body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid portfolio data format',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Find portfolio
    // TODO: Replace with actual database query
    const portfolio = portfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Verify portfolio ownership
    if (!verifyOwnership(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this portfolio' },
        { status: 403 }
      );
    }

    // Update portfolio with validated data
    // TODO: Replace with actual database update
    const portfolioIndex = portfolios.findIndex((p) => p.id === portfolioId);
    portfolios[portfolioIndex] = {
      ...portfolio,
      data: validation.data,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
      version: portfolio.version + 1,
    };

    return NextResponse.json({
      message: 'Portfolio data imported successfully',
      portfolio: portfolios[portfolioIndex],
    });

  } catch (error) {
    console.error('Error importing portfolio data:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
