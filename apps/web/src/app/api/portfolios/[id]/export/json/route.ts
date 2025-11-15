/**
 * Portfolio JSON Export API Route
 * Section 2.3: Data Import/Export Endpoints
 *
 * GET /api/portfolios/:id/export/json - Export portfolio data as JSON
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

interface Portfolio {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  data: any;
  templateId: string;
  isPublished: boolean;
  isDraft: boolean;
  visibility: string;
  createdAt: string;
  updatedAt: string;
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
  return authHeader?.replace('Bearer ', '') || 'anonymous';
}

function canAccessPortfolio(portfolio: Portfolio, userId: string): boolean {
  if (portfolio.userId === userId) return true;
  if (portfolio.visibility === 'PUBLIC' && portfolio.isPublished) return true;
  return false;
}

// ============================================================================
// GET /api/portfolios/:id/export/json
// Requirement #15: Export portfolio data as JSON for backup/migration
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId } = params;

    // Find portfolio
    const portfolio = portfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Requirement #18: Verify access
    if (!canAccessPortfolio(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this portfolio' },
        { status: 403 }
      );
    }

    // Prepare export data (full portfolio including metadata)
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      portfolio: {
        name: portfolio.name,
        slug: portfolio.slug,
        description: portfolio.description,
        templateId: portfolio.templateId,
        data: portfolio.data,
        metadata: {
          isPublished: portfolio.isPublished,
          isDraft: portfolio.isDraft,
          visibility: portfolio.visibility,
          createdAt: portfolio.createdAt,
          updatedAt: portfolio.updatedAt,
        },
      },
    };

    // Return JSON with proper headers
    return NextResponse.json(exportData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="portfolio-${portfolio.slug}.json"`,
        'X-Portfolio-Id': portfolio.id,
      },
    });

  } catch (error) {
    console.error('Error exporting JSON:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
