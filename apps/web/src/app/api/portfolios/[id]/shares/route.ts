/**
 * Portfolio Shares API Routes
 * Section 2.7: Sharing & Collaboration Endpoints
 *
 * POST /api/portfolios/:id/shares - Generate shareable link
 * GET /api/portfolios/:id/shares - List all shares (optional, for management UI)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

interface Portfolio {
  id: string;
  userId: string;
  isPublished: boolean;
}

interface PortfolioShare {
  id: string;
  portfolioId: string;
  token: string;
  password: string | null; // Hashed password
  expiresAt: string | null;
  maxViews: number | null;
  viewCount: number;
  lastAccessedAt: string | null;
  createdBy: string;
  createdAt: string;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Requirement #1: Accept config for expiresAt, password, maxViews
const CreateShareSchema = z.object({
  expiresAt: z.string().datetime().optional(),
  password: z.string().min(4).max(100).optional(),
  maxViews: z.number().int().min(1).max(1000000).optional(),
});

// ============================================================================
// MOCK DATABASE
// ============================================================================

const portfolios: Portfolio[] = [];
const portfolioShares: PortfolioShare[] = [];

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
 * Requirement #2: Generate unique token (UUID/nanoid style)
 */
function generateShareToken(): string {
  // Generate 32-character random token (URL-safe)
  // In production, consider using nanoid for shorter tokens
  return randomBytes(24).toString('base64url');
}

/**
 * Requirement #4: Hash password with bcrypt
 * TODO: In production, use actual bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  // TODO: import bcrypt from 'bcrypt';
  // TODO: return await bcrypt.hash(password, 10);

  // Mock hash for development (DO NOT USE IN PRODUCTION)
  const mockHash = Buffer.from(`hashed:${password}:${Date.now()}`).toString('base64');
  console.log(`[Mock] Hashing password with bcrypt (production: use real bcrypt)`);
  return mockHash;
}

/**
 * Check if token is unique
 */
function isTokenUnique(token: string): boolean {
  return !portfolioShares.some((s) => s.token === token);
}

// ============================================================================
// POST /api/portfolios/:id/shares
// Requirements #1-6: Generate shareable link with config
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId } = params;

    const body = await request.json().catch(() => ({}));

    const validation = CreateShareSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid share configuration', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { expiresAt, password, maxViews } = validation.data;

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

    // Requirement #3: Verify portfolio is published
    if (!portfolio.isPublished) {
      return NextResponse.json(
        { error: 'Portfolio must be published before sharing' },
        { status: 400 }
      );
    }

    // Requirement #2: Generate unique token
    let token = generateShareToken();
    let attempts = 0;
    while (!isTokenUnique(token) && attempts < 10) {
      token = generateShareToken();
      attempts++;
    }

    if (!isTokenUnique(token)) {
      return NextResponse.json(
        { error: 'Failed to generate unique share token, please try again' },
        { status: 500 }
      );
    }

    // Requirement #4: Hash password if provided
    let hashedPassword: string | null = null;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    // Requirement #5: Create PortfolioShare record
    const share: PortfolioShare = {
      id: `share-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      portfolioId,
      token,
      password: hashedPassword,
      expiresAt: expiresAt || null,
      maxViews: maxViews || null,
      viewCount: 0,
      lastAccessedAt: null,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    // TODO: Save to database
    // await db.portfolioShare.create({ data: share });

    portfolioShares.push(share);

    // Requirement #6: Return share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://rolerabbit.com'}/share/${token}`;

    return NextResponse.json(
      {
        message: 'Share link created successfully',
        share: {
          id: share.id,
          token: share.token,
          url: shareUrl,
          expiresAt: share.expiresAt,
          maxViews: share.maxViews,
          viewCount: share.viewCount,
          hasPassword: !!share.password,
          createdAt: share.createdAt,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/portfolios/:id/shares
// Optional: List all shares for portfolio (for management UI)
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

    // Verify ownership
    if (!verifyOwnership(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this portfolio' },
        { status: 403 }
      );
    }

    // Get all shares for portfolio
    // TODO: Replace with actual database query
    // const shares = await db.portfolioShare.findMany({
    //   where: { portfolioId },
    //   orderBy: { createdAt: 'desc' },
    // });

    const shares = portfolioShares
      .filter((s) => s.portfolioId === portfolioId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Return shares without sensitive data (password hashes)
    const sharesList = shares.map((s) => ({
      id: s.id,
      token: s.token,
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://rolerabbit.com'}/share/${s.token}`,
      expiresAt: s.expiresAt,
      maxViews: s.maxViews,
      viewCount: s.viewCount,
      hasPassword: !!s.password,
      lastAccessedAt: s.lastAccessedAt,
      createdAt: s.createdAt,
      isActive: isShareActive(s),
    }));

    return NextResponse.json({
      shares: sharesList,
      total: sharesList.length,
    });

  } catch (error) {
    console.error('Error listing shares:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Check if share is still active
 */
function isShareActive(share: PortfolioShare): boolean {
  // Check expiration
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return false;
  }

  // Check max views
  if (share.maxViews && share.viewCount >= share.maxViews) {
    return false;
  }

  return true;
}
