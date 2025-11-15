/**
 * Analytics Service
 * Section 2.11: Service Layer Implementation
 *
 * Requirements #18-20: AnalyticsService class
 */

import { PortfolioNotFoundError } from '@/lib/errors';

/**
 * Portfolio analytics data
 */
export interface PortfolioAnalytics {
  id: string;
  portfolioId: string;
  date: string; // YYYY-MM-DD
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage: number | null;
  bounceRate: number | null;
  referrers: Record<string, number>; // { "google.com": 10, "twitter.com": 5 }
  countries: Record<string, number>; // { "US": 15, "UK": 5 }
  devices: Record<string, number>; // { "mobile": 12, "desktop": 8 }
  createdAt: string;
  updatedAt: string;
}

/**
 * View tracking data
 */
export interface ViewTrackingData {
  portfolioId: string;
  sessionId?: string;
  referrer?: string;
  country?: string;
  device?: string;
  timeOnPage?: number;
}

/**
 * Analytics aggregation result
 */
export interface AnalyticsAggregation {
  totalViews: number;
  totalUniqueVisitors: number;
  avgTimeOnPage: number | null;
  avgBounceRate: number | null;
  topReferrers: Array<{ name: string; count: number }>;
  topCountries: Array<{ name: string; count: number }>;
  topDevices: Array<{ name: string; count: number }>;
  timeSeries: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
  }>;
}

/**
 * Mock analytics database
 */
const analyticsRecords: PortfolioAnalytics[] = [];

// Track unique sessions per day
const sessionTracker: Map<string, Set<string>> = new Map();

/**
 * Analytics Service
 * Requirement #18: Create AnalyticsService class with 3 methods
 */
export class AnalyticsService {
  /**
   * Requirement #19: Track view
   * - Upsert PortfolioAnalytics for current date
   * - Increment counters atomically
   */
  async trackView(data: ViewTrackingData): Promise<void> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const { portfolioId, sessionId, referrer, country, device, timeOnPage } = data;

    // Check if this is a unique visitor for today
    const sessionKey = `${portfolioId}:${today}`;
    let sessions = sessionTracker.get(sessionKey);

    if (!sessions) {
      sessions = new Set();
      sessionTracker.set(sessionKey, sessions);
    }

    const isUniqueVisitor = sessionId && !sessions.has(sessionId);
    if (sessionId && isUniqueVisitor) {
      sessions.add(sessionId);
    }

    // Requirement #19: Upsert PortfolioAnalytics for current date
    let analytics = analyticsRecords.find(
      (a) => a.portfolioId === portfolioId && a.date === today
    );

    if (!analytics) {
      // Create new analytics record
      analytics = {
        id: `analytics-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        portfolioId,
        date: today,
        views: 0,
        uniqueVisitors: 0,
        avgTimeOnPage: null,
        bounceRate: null,
        referrers: {},
        countries: {},
        devices: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      analyticsRecords.push(analytics);
    }

    // Requirement #19: Increment counters atomically
    // TODO: In production, use atomic database operations
    // await db.portfolioAnalytics.upsert({
    //   where: {
    //     portfolioId_date: { portfolioId, date: today },
    //   },
    //   create: { ...analyticsData, views: 1, uniqueVisitors: isUniqueVisitor ? 1 : 0 },
    //   update: {
    //     views: { increment: 1 },
    //     uniqueVisitors: { increment: isUniqueVisitor ? 1 : 0 },
    //     referrers: { set: updatedReferrers },
    //     countries: { set: updatedCountries },
    //     devices: { set: updatedDevices },
    //   },
    // });

    analytics.views += 1;

    if (isUniqueVisitor) {
      analytics.uniqueVisitors += 1;
    }

    // Update referrers
    if (referrer) {
      analytics.referrers[referrer] = (analytics.referrers[referrer] || 0) + 1;
    }

    // Update countries
    if (country) {
      analytics.countries[country] = (analytics.countries[country] || 0) + 1;
    }

    // Update devices
    if (device) {
      analytics.devices[device] = (analytics.devices[device] || 0) + 1;
    }

    // Update time on page (running average)
    if (timeOnPage !== undefined && timeOnPage > 0) {
      if (analytics.avgTimeOnPage === null) {
        analytics.avgTimeOnPage = timeOnPage;
      } else {
        const totalTime = analytics.avgTimeOnPage * (analytics.views - 1) + timeOnPage;
        analytics.avgTimeOnPage = totalTime / analytics.views;
      }
    }

    // Calculate bounce rate (simplified: sessions with < 5 seconds)
    if (timeOnPage !== undefined) {
      const bounces = timeOnPage < 5 ? 1 : 0;
      const currentBounces = analytics.bounceRate
        ? (analytics.bounceRate / 100) * (analytics.views - 1)
        : 0;
      analytics.bounceRate = ((currentBounces + bounces) / analytics.views) * 100;
    }

    analytics.updatedAt = new Date().toISOString();
  }

  /**
   * Requirement #20: Get analytics
   * - Aggregate data from PortfolioAnalytics table for date range
   */
  async getAnalytics(
    portfolioId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsAggregation> {
    // Set default date range (last 30 days if not specified)
    const end = endDate || new Date().toISOString().split('T')[0];
    let start: string;

    if (startDate) {
      start = startDate;
    } else {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      start = date.toISOString().split('T')[0];
    }

    // Requirement #20: Aggregate data from PortfolioAnalytics table
    // TODO: In production, use database aggregation
    // const analytics = await db.portfolioAnalytics.findMany({
    //   where: {
    //     portfolioId,
    //     date: { gte: start, lte: end },
    //   },
    //   orderBy: { date: 'asc' },
    // });

    const records = analyticsRecords.filter(
      (a) =>
        a.portfolioId === portfolioId && a.date >= start && a.date <= end
    );

    // Aggregate totals
    const totalViews = records.reduce((sum, r) => sum + r.views, 0);
    const totalUniqueVisitors = records.reduce(
      (sum, r) => sum + r.uniqueVisitors,
      0
    );

    // Calculate average time on page
    const recordsWithTime = records.filter((r) => r.avgTimeOnPage !== null);
    const avgTimeOnPage =
      recordsWithTime.length > 0
        ? recordsWithTime.reduce((sum, r) => sum + (r.avgTimeOnPage || 0), 0) /
          recordsWithTime.length
        : null;

    // Calculate average bounce rate
    const recordsWithBounce = records.filter((r) => r.bounceRate !== null);
    const avgBounceRate =
      recordsWithBounce.length > 0
        ? recordsWithBounce.reduce((sum, r) => sum + (r.bounceRate || 0), 0) /
          recordsWithBounce.length
        : null;

    // Aggregate referrers
    const topReferrers = this.aggregateTopItems(
      records,
      'referrers',
      10
    );

    // Aggregate countries
    const topCountries = this.aggregateTopItems(
      records,
      'countries',
      10
    );

    // Aggregate devices
    const topDevices = this.aggregateTopItems(records, 'devices', 5);

    // Build time series
    const timeSeries = records.map((r) => ({
      date: r.date,
      views: r.views,
      uniqueVisitors: r.uniqueVisitors,
    }));

    return {
      totalViews,
      totalUniqueVisitors,
      avgTimeOnPage,
      avgBounceRate,
      topReferrers,
      topCountries,
      topDevices,
      timeSeries,
    };
  }

  /**
   * Get analytics summary (quick stats)
   */
  async getSummary(portfolioId: string): Promise<{
    totalViews: number;
    totalUniqueVisitors: number;
    viewsToday: number;
    viewsLast7Days: number;
    viewsLast30Days: number;
  }> {
    const allRecords = analyticsRecords.filter(
      (a) => a.portfolioId === portfolioId
    );

    const totalViews = allRecords.reduce((sum, r) => sum + r.views, 0);
    const totalUniqueVisitors = allRecords.reduce(
      (sum, r) => sum + r.uniqueVisitors,
      0
    );

    const today = new Date().toISOString().split('T')[0];
    const todayRecord = allRecords.find((r) => r.date === today);
    const viewsToday = todayRecord?.views || 0;

    // Last 7 days
    const date7DaysAgo = new Date();
    date7DaysAgo.setDate(date7DaysAgo.getDate() - 7);
    const start7Days = date7DaysAgo.toISOString().split('T')[0];

    const viewsLast7Days = allRecords
      .filter((r) => r.date >= start7Days)
      .reduce((sum, r) => sum + r.views, 0);

    // Last 30 days
    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);
    const start30Days = date30DaysAgo.toISOString().split('T')[0];

    const viewsLast30Days = allRecords
      .filter((r) => r.date >= start30Days)
      .reduce((sum, r) => sum + r.views, 0);

    return {
      totalViews,
      totalUniqueVisitors,
      viewsToday,
      viewsLast7Days,
      viewsLast30Days,
    };
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  /**
   * Aggregate top items from JSON fields
   */
  private aggregateTopItems(
    records: PortfolioAnalytics[],
    field: 'referrers' | 'countries' | 'devices',
    limit: number
  ): Array<{ name: string; count: number }> {
    const aggregated: Record<string, number> = {};

    for (const record of records) {
      const items = record[field] || {};
      for (const [name, count] of Object.entries(items)) {
        aggregated[name] = (aggregated[name] || 0) + count;
      }
    }

    return Object.entries(aggregated)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}
