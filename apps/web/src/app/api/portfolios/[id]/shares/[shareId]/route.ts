/**
 * Individual Portfolio Share API Route
 * Section 2.7: Sharing & Collaboration Endpoints
 *
 * DELETE /api/portfolios/:id/shares/:shareId - Revoke share link
 * GET /api/portfolios/:id/shares/:shareId - Get share details (optional)
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

interface Portfolio {
  id: string;
  userId: string;
}

interface PortfolioShare {
  id: string;
  portfolioId: string;
  token: string;
  password: string | null;
  expiresAt: string | null;
  maxViews: number | null;
  viewCount: number;
  lastAccessedAt: string | null;
  createdBy: string;
  createdAt: string;
}

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

// ============================================================================
// GET /api/portfolios/:id/shares/:shareId
// Optional: Get share details
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; shareId: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId, shareId } = params;

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

    // Find share
    // TODO: Replace with actual database query
    // const share = await db.portfolioShare.findUnique({
    //   where: { id: shareId, portfolioId },
    // });

    const share = portfolioShares.find(
      (s) => s.id === shareId && s.portfolioId === portfolioId
    );

    if (!share) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    // Return share details (without password hash)
    return NextResponse.json({
      share: {
        id: share.id,
        token: share.token,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://rolerabbit.com'}/share/${share.token}`,
        expiresAt: share.expiresAt,
        maxViews: share.maxViews,
        viewCount: share.viewCount,
        hasPassword: !!share.password,
        lastAccessedAt: share.lastAccessedAt,
        createdBy: share.createdBy,
        createdAt: share.createdAt,
        isActive: isShareActive(share),
      },
    });

  } catch (error) {
    console.error('Error fetching share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/portfolios/:id/shares/:shareId
// Requirements #13-14: Revoke share link
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; shareId: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId, shareId } = params;

    // Requirement #13: Find portfolio and verify ownership
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

    // Find share to revoke
    const shareIndex = portfolioShares.findIndex(
      (s) => s.id === shareId && s.portfolioId === portfolioId
    );

    if (shareIndex === -1) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    const share = portfolioShares[shareIndex];

    // Requirement #14: Delete share from database
    // TODO: Replace with actual database delete
    // await db.portfolioShare.delete({
    //   where: { id: shareId },
    // });

    portfolioShares.splice(shareIndex, 1);

    return NextResponse.json({
      message: 'Share link revoked successfully',
      revokedShare: {
        id: share.id,
        token: share.token,
        createdAt: share.createdAt,
        viewCount: share.viewCount,
      },
    });

  } catch (error) {
    console.error('Error revoking share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/portfolios/:id/shares/:shareId
// Optional: Update share settings (extend expiration, change password, etc.)
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; shareId: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId, shareId } = params;

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

    // Find share
    const shareIndex = portfolioShares.findIndex(
      (s) => s.id === shareId && s.portfolioId === portfolioId
    );

    if (shareIndex === -1) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));

    // Update share settings
    const share = portfolioShares[shareIndex];

    if (body.expiresAt !== undefined) {
      share.expiresAt = body.expiresAt;
    }

    if (body.maxViews !== undefined) {
      share.maxViews = body.maxViews;
    }

    if (body.password !== undefined) {
      // TODO: Hash password with bcrypt
      share.password = body.password ? `hashed:${body.password}` : null;
    }

    // TODO: Update in database
    // await db.portfolioShare.update({
    //   where: { id: shareId },
    //   data: { expiresAt: share.expiresAt, maxViews: share.maxViews, password: share.password },
    // });

    return NextResponse.json({
      message: 'Share settings updated successfully',
      share: {
        id: share.id,
        token: share.token,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://rolerabbit.com'}/share/${share.token}`,
        expiresAt: share.expiresAt,
        maxViews: share.maxViews,
        hasPassword: !!share.password,
      },
    });

  } catch (error) {
    console.error('Error updating share:', error);
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
