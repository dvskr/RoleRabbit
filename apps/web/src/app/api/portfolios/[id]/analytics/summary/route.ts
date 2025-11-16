/**
 * Portfolio Analytics Summary API Route
 * Section 2.6: Analytics Endpoints
 *
 * GET /api/portfolios/:id/analytics/summary - Get quick analytics stats
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

interface Portfolio {
  id: string;
  userId: string;
  viewCount: number;
  createdAt: string;
}

interface PortfolioAnalytics {
  id: string;
  portfolioId: string;
  date: string;
  views: number;
  uniqueVisitors: number;
}

// ============================================================================
// MOCK DATABASE
// ============================================================================

const portfolios: Portfolio[] = [];
const analyticsRecords: PortfolioAnalytics[] = [];

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
 * Calculate days since portfolio creation
 */
function getDaysSinceCreation(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// ============================================================================
// GET /api/portfolios/:id/analytics/summary
// Requirement #17: Quick stats - total views, total visitors, avg views per day
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

    // Get all analytics records for portfolio
    // TODO: Replace with actual database query
    // const records = await db.portfolioAnalytics.findMany({
    //   where: { portfolioId },
    // });

    const records = analyticsRecords.filter((r) => r.portfolioId === portfolioId);

    // Calculate total views from portfolio
    const totalViews = portfolio.viewCount;

    // Calculate total unique visitors
    const totalUniqueVisitors = records.reduce((sum, r) => sum + r.uniqueVisitors, 0);

    // Calculate average views per day
    const daysSinceCreation = getDaysSinceCreation(portfolio.createdAt);
    const avgViewsPerDay = daysSinceCreation > 0 ? totalViews / daysSinceCreation : 0;

    // Calculate views in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const recentRecords = records.filter((r) => r.date >= sevenDaysAgoStr);
    const viewsLast7Days = recentRecords.reduce((sum, r) => sum + r.views, 0);

    // Calculate views in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const monthRecords = records.filter((r) => r.date >= thirtyDaysAgoStr);
    const viewsLast30Days = monthRecords.reduce((sum, r) => sum + r.views, 0);

    // Get today's stats
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = records.find((r) => r.date === today);

    return NextResponse.json({
      portfolioId,
      summary: {
        totalViews,
        totalUniqueVisitors,
        avgViewsPerDay: Math.round(avgViewsPerDay * 100) / 100, // Round to 2 decimals
        viewsToday: todayRecord?.views || 0,
        viewsLast7Days,
        viewsLast30Days,
        daysSinceCreation,
      },
      trends: {
        daily: {
          period: '7 days',
          average: recentRecords.length > 0 ? viewsLast7Days / 7 : 0,
        },
        monthly: {
          period: '30 days',
          average: monthRecords.length > 0 ? viewsLast30Days / 30 : 0,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
