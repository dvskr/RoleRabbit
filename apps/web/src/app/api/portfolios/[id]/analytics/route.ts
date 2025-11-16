/**
 * Portfolio Analytics API Route
 * Section 2.6: Analytics Endpoints
 *
 * GET /api/portfolios/:id/analytics - Get analytics data for date range
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

interface Portfolio {
  id: string;
  userId: string;
  viewCount: number;
}

interface PortfolioAnalytics {
  id: string;
  portfolioId: string;
  date: string;
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage: number | null;
  bounceRate: number | null;
  referrers: Record<string, number>;
  countries: Record<string, number>;
  devices: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const AnalyticsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

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
 * Get date range (default: last 30 days)
 * Requirement #12: Accept startDate, endDate (default: last 30 days)
 */
function getDateRange(startDate?: string, endDate?: string): { start: string; end: string } {
  const end = endDate || new Date().toISOString().split('T')[0];

  let start: string;
  if (startDate) {
    start = startDate;
  } else {
    // Default to 30 days ago
    const date = new Date();
    date.setDate(date.getDate() - 30);
    start = date.toISOString().split('T')[0];
  }

  return { start, end };
}

/**
 * Filter analytics records by date range
 */
function filterByDateRange(
  records: PortfolioAnalytics[],
  startDate: string,
  endDate: string
): PortfolioAnalytics[] {
  return records.filter((record) => {
    return record.date >= startDate && record.date <= endDate;
  });
}

/**
 * Aggregate analytics data
 * Requirement #14: Aggregate PortfolioAnalytics records
 */
function aggregateAnalytics(records: PortfolioAnalytics[]) {
  const totalViews = records.reduce((sum, r) => sum + r.views, 0);
  const totalUniqueVisitors = records.reduce((sum, r) => sum + r.uniqueVisitors, 0);

  // Calculate average time on page
  const recordsWithTime = records.filter((r) => r.avgTimeOnPage !== null);
  const avgTimeOnPage =
    recordsWithTime.length > 0
      ? recordsWithTime.reduce((sum, r) => sum + (r.avgTimeOnPage || 0), 0) / recordsWithTime.length
      : null;

  // Calculate average bounce rate
  const recordsWithBounce = records.filter((r) => r.bounceRate !== null);
  const bounceRate =
    recordsWithBounce.length > 0
      ? recordsWithBounce.reduce((sum, r) => sum + (r.bounceRate || 0), 0) / recordsWithBounce.length
      : null;

  return {
    totalViews,
    totalUniqueVisitors,
    avgTimeOnPage,
    bounceRate,
  };
}

/**
 * Get time-series data for charting
 * Requirement #15: Return time-series data
 */
function getTimeSeriesData(records: PortfolioAnalytics[]): Array<{
  date: string;
  views: number;
  uniqueVisitors: number;
}> {
  return records
    .map((record) => ({
      date: record.date,
      views: record.views,
      uniqueVisitors: record.uniqueVisitors,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Aggregate and sort top items
 * Requirement #16: Return top referrers, countries, devices sorted by count DESC
 */
function getTopItems(
  records: PortfolioAnalytics[],
  key: 'referrers' | 'countries' | 'devices',
  limit: number = 10
): Array<{ name: string; count: number }> {
  const aggregated: Record<string, number> = {};

  for (const record of records) {
    const items = record[key] || {};
    for (const [name, count] of Object.entries(items)) {
      aggregated[name] = (aggregated[name] || 0) + count;
    }
  }

  return Object.entries(aggregated)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// ============================================================================
// GET /api/portfolios/:id/analytics
// Requirements #11-16: Get analytics data for date range
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId } = params;

    const { searchParams } = new URL(request.url);

    // Requirement #12: Accept query params startDate, endDate
    const queryValidation = AnalyticsQuerySchema.safeParse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD', details: queryValidation.error.errors },
        { status: 400 }
      );
    }

    const { startDate, endDate } = queryValidation.data;

    // Find portfolio
    const portfolio = portfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Requirement #13: Verify portfolio ownership
    if (!verifyOwnership(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this portfolio' },
        { status: 403 }
      );
    }

    // Get date range (default: last 30 days)
    const dateRange = getDateRange(startDate, endDate);

    // Fetch analytics records for date range
    // TODO: Replace with actual database query
    // const records = await db.portfolioAnalytics.findMany({
    //   where: {
    //     portfolioId,
    //     date: { gte: dateRange.start, lte: dateRange.end },
    //   },
    //   orderBy: { date: 'asc' },
    // });

    const allRecords = analyticsRecords.filter((r) => r.portfolioId === portfolioId);
    const records = filterByDateRange(allRecords, dateRange.start, dateRange.end);

    // Requirement #14: Aggregate analytics data
    const aggregated = aggregateAnalytics(records);

    // Requirement #15: Return time-series data for charting
    const timeSeries = getTimeSeriesData(records);

    // Requirement #16: Return top referrers, countries, devices
    const topReferrers = getTopItems(records, 'referrers', 10);
    const topCountries = getTopItems(records, 'countries', 10);
    const topDevices = getTopItems(records, 'devices');

    return NextResponse.json({
      portfolioId,
      dateRange: {
        start: dateRange.start,
        end: dateRange.end,
        days: records.length,
      },
      summary: {
        totalViews: aggregated.totalViews,
        totalUniqueVisitors: aggregated.totalUniqueVisitors,
        avgTimeOnPage: aggregated.avgTimeOnPage,
        bounceRate: aggregated.bounceRate,
        avgViewsPerDay: records.length > 0 ? aggregated.totalViews / records.length : 0,
      },
      timeSeries,
      topReferrers,
      topCountries,
      topDevices,
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
