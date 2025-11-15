/**
 * Public Share Access API Route
 * Section 2.7: Sharing & Collaboration Endpoints
 *
 * POST /api/shares/:token - Access portfolio via share link (public, no auth required)
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
  slug: string;
  data: any;
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
  createdAt: string;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Requirement #9: Accept password in request body if share has password
const AccessShareSchema = z.object({
  password: z.string().optional(),
});

// ============================================================================
// MOCK DATABASE
// ============================================================================

const portfolios: Portfolio[] = [];
const portfolioShares: PortfolioShare[] = [];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Requirement #10: Verify password with bcrypt
 * TODO: In production, use actual bcrypt
 */
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // TODO: import bcrypt from 'bcrypt';
  // TODO: return await bcrypt.compare(password, hashedPassword);

  // Mock verification for development (DO NOT USE IN PRODUCTION)
  console.log(`[Mock] Verifying password with bcrypt (production: use real bcrypt)`);

  // Extract original password from mock hash
  const mockHashMatch = hashedPassword.match(/^hashed:(.+?):/);
  if (mockHashMatch) {
    return password === mockHashMatch[1];
  }

  return false;
}

/**
 * Update share statistics
 */
function updateShareStats(shareId: string): void {
  const shareIndex = portfolioShares.findIndex((s) => s.id === shareId);

  if (shareIndex !== -1) {
    // Requirement #11: Increment viewCount
    portfolioShares[shareIndex].viewCount += 1;

    // Requirement #12: Update lastAccessedAt
    portfolioShares[shareIndex].lastAccessedAt = new Date().toISOString();
  }
}

// ============================================================================
// POST /api/shares/:token
// Requirements #7-12: Access portfolio via share link (public endpoint)
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    const body = await request.json().catch(() => ({}));

    const validation = AccessShareSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { password } = validation.data;

    // Requirement #7: Find share by token
    // TODO: Replace with actual database query
    // const share = await db.portfolioShare.findUnique({
    //   where: { token },
    //   include: { portfolio: true },
    // });

    const share = portfolioShares.find((s) => s.token === token);

    if (!share) {
      return NextResponse.json(
        { error: 'Share link not found or has been revoked' },
        { status: 404 }
      );
    }

    // Requirement #8: Verify share hasn't expired
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Share link has expired', reason: 'EXPIRED' },
        { status: 403 }
      );
    }

    // Check max views limit (before incrementing)
    if (share.maxViews && share.viewCount >= share.maxViews) {
      return NextResponse.json(
        {
          error: 'Share link has reached maximum view limit',
          reason: 'MAX_VIEWS_REACHED',
          maxViews: share.maxViews,
        },
        { status: 403 }
      );
    }

    // Requirement #9-10: Verify password if share has one
    if (share.password) {
      if (!password) {
        return NextResponse.json(
          {
            error: 'Password required to access this share',
            reason: 'PASSWORD_REQUIRED',
            requiresPassword: true,
          },
          { status: 401 }
        );
      }

      const isPasswordValid = await verifyPassword(password, share.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          {
            error: 'Incorrect password',
            reason: 'INVALID_PASSWORD',
          },
          { status: 401 }
        );
      }
    }

    // Get portfolio data
    const portfolio = portfolios.find((p) => p.id === share.portfolioId);

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Verify portfolio is still published
    if (!portfolio.isPublished) {
      return NextResponse.json(
        { error: 'Portfolio is no longer published' },
        { status: 403 }
      );
    }

    // Requirements #11-12: Update share statistics
    // TODO: In production, update in database
    // await db.portfolioShare.update({
    //   where: { id: share.id },
    //   data: {
    //     viewCount: { increment: 1 },
    //     lastAccessedAt: new Date(),
    //   },
    // });

    updateShareStats(share.id);

    // Return portfolio data
    return NextResponse.json({
      portfolio: {
        id: portfolio.id,
        name: portfolio.name,
        slug: portfolio.slug,
        data: portfolio.data,
      },
      share: {
        viewCount: share.viewCount + 1, // Return updated count
        expiresAt: share.expiresAt,
        maxViews: share.maxViews,
        viewsRemaining: share.maxViews ? share.maxViews - (share.viewCount + 1) : null,
      },
    });

  } catch (error) {
    console.error('Error accessing share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/shares/:token/info
// Optional: Get share info without incrementing view count (for UI preview)
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Find share by token
    const share = portfolioShares.find((s) => s.token === token);

    if (!share) {
      return NextResponse.json(
        { error: 'Share link not found or has been revoked' },
        { status: 404 }
      );
    }

    // Check if share is active
    const isExpired = share.expiresAt && new Date(share.expiresAt) < new Date();
    const isMaxViewsReached = share.maxViews && share.viewCount >= share.maxViews;

    return NextResponse.json({
      share: {
        requiresPassword: !!share.password,
        expiresAt: share.expiresAt,
        isExpired,
        maxViews: share.maxViews,
        viewCount: share.viewCount,
        viewsRemaining: share.maxViews ? Math.max(0, share.maxViews - share.viewCount) : null,
        isMaxViewsReached,
        isActive: !isExpired && !isMaxViewsReached,
        lastAccessedAt: share.lastAccessedAt,
      },
    });

  } catch (error) {
    console.error('Error fetching share info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
