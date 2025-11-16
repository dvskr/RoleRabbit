/**
 * Portfolio Duplicate Endpoint
 * Section 2.1: Requirements #25-27
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// MOCK DATABASE
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

const portfolios: Portfolio[] = [];

function getCurrentUserId(): string {
  return 'user-123';
}

function verifyOwnership(portfolio: Portfolio, userId: string): boolean {
  return portfolio.userId === userId;
}

function generateSlug(name: string, userId: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const existingSlugs = portfolios
    .filter((p) => p.userId === userId && !p.deletedAt)
    .map((p) => p.slug);

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  const suffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${suffix}`;
}

// ============================================================================
// POST /api/portfolios/[id]/duplicate - Duplicate Portfolio
// Requirements: #25-27
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId();
    const { id } = params;

    // Find source portfolio
    const sourcePortfolio = portfolios.find(
      (p) => p.id === id && !p.deletedAt
    );

    if (!sourcePortfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Verify ownership of source portfolio (#26)
    if (!verifyOwnership(sourcePortfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this portfolio' },
        { status: 403 }
      );
    }

    // Create copy with " (Copy)" appended (#25)
    const copyName = `${sourcePortfolio.name} (Copy)`;

    // Copy all data and template but reset specific fields (#27)
    const duplicatedPortfolio: Portfolio = {
      id: crypto.randomUUID(),
      userId,
      name: copyName,
      slug: generateSlug(copyName, userId),
      templateId: sourcePortfolio.templateId,
      data: JSON.parse(JSON.stringify(sourcePortfolio.data)), // Deep copy
      isPublished: false, // #27
      isDraft: true,
      visibility: 'PRIVATE',
      subdomain: undefined, // #27
      customDomains: [], // #27
      viewCount: 0,
      createdBy: userId,
      updatedBy: userId,
      createdAt: new Date().toISOString(), // #27
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    portfolios.push(duplicatedPortfolio);

    // TODO: Save to actual database
    // const created = await db.portfolio.create({ data: duplicatedPortfolio });

    return NextResponse.json(duplicatedPortfolio, { status: 201 });
  } catch (error) {
    console.error('Failed to duplicate portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
