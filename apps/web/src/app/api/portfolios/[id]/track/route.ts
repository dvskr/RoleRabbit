/**
 * Portfolio View Tracking API Route
 * Section 2.6: Analytics Endpoints
 *
 * POST /api/portfolios/:id/track - Track portfolio views (public, no auth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

interface Portfolio {
  id: string;
  viewCount: number;
  lastViewedAt: string | null;
}

interface PortfolioAnalytics {
  id: string;
  portfolioId: string;
  date: string; // YYYY-MM-DD
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

const TrackingDataSchema = z.object({
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(), // From cookie/localStorage
  timeOnPage: z.number().optional(), // In seconds
  pathname: z.string().optional(),
});

// ============================================================================
// MOCK DATABASE
// ============================================================================

const portfolios: Portfolio[] = [];
const analyticsRecords: PortfolioAnalytics[] = [];
const uniqueVisitorCache = new Set<string>(); // portfolioId:sessionId:date

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract IP address from request
 * Requirement #3: Extract IP address from request headers
 */
function getClientIP(request: NextRequest): string {
  // Check X-Forwarded-For header (proxy/load balancer)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Check X-Real-IP header
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to connection remote address
  // In Next.js, this is not directly available, use forwarded headers
  return '0.0.0.0'; // Mock fallback
}

/**
 * Get country from IP address using geolocation service
 * Requirement #4: Use IP geolocation service (ipapi.co or MaxMind)
 */
async function getCountryFromIP(ip: string): Promise<string> {
  try {
    // TODO: In production, use actual geolocation service
    // Example with ipapi.co:
    // const response = await fetch(`https://ipapi.co/${ip}/json/`);
    // const data = await response.json();
    // return data.country_name || 'Unknown';

    // Example with MaxMind GeoIP2:
    // const reader = await maxmind.open('/path/to/GeoLite2-Country.mmdb');
    // const result = reader.get(ip);
    // return result?.country?.names?.en || 'Unknown';

    // Mock implementation
    if (ip.startsWith('192.168.') || ip === '127.0.0.1' || ip === '0.0.0.0') {
      return 'Local';
    }

    // Simulate country detection
    const mockCountries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'India', 'Japan'];
    return mockCountries[Math.floor(Math.random() * mockCountries.length)];

  } catch (error) {
    console.error('Geolocation error:', error);
    return 'Unknown';
  }
}

/**
 * Parse user agent to determine device type
 * Requirement #5: Parse userAgent using ua-parser-js
 */
function getDeviceType(userAgent: string): string {
  // TODO: In production, use ua-parser-js library
  // import UAParser from 'ua-parser-js';
  // const parser = new UAParser(userAgent);
  // const device = parser.getDevice();
  // return device.type || 'desktop';

  // Simple regex-based detection
  const ua = userAgent.toLowerCase();

  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    if (/ipad|tablet|kindle/i.test(ua)) {
      return 'tablet';
    }
    return 'mobile';
  }

  return 'desktop';
}

/**
 * Extract domain from referrer URL
 */
function extractDomain(url: string): string {
  try {
    if (!url || url === '') return 'Direct';

    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'Direct';
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if visitor is unique for today
 * Requirement #7: Track uniqueness using cookie or localStorage
 */
function isUniqueVisitor(portfolioId: string, sessionId: string, date: string): boolean {
  const key = `${portfolioId}:${sessionId}:${date}`;

  if (uniqueVisitorCache.has(key)) {
    return false;
  }

  uniqueVisitorCache.add(key);
  return true;
}

/**
 * Upsert analytics record for today
 * Requirement #7: Upsert PortfolioAnalytics record
 */
function upsertAnalytics(
  portfolioId: string,
  date: string,
  updates: {
    incrementViews?: number;
    incrementUniqueVisitors?: number;
    referrer?: string;
    country?: string;
    device?: string;
  }
): PortfolioAnalytics {
  let analytics = analyticsRecords.find(
    (a) => a.portfolioId === portfolioId && a.date === date
  );

  if (!analytics) {
    analytics = {
      id: `ana-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      portfolioId,
      date,
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

  // Requirement #7: Increment views and uniqueVisitors
  if (updates.incrementViews) {
    analytics.views += updates.incrementViews;
  }

  if (updates.incrementUniqueVisitors) {
    analytics.uniqueVisitors += updates.incrementUniqueVisitors;
  }

  // Requirement #8: Update referrers JSON
  if (updates.referrer) {
    analytics.referrers[updates.referrer] = (analytics.referrers[updates.referrer] || 0) + 1;
  }

  // Requirement #9: Update countries JSON
  if (updates.country) {
    analytics.countries[updates.country] = (analytics.countries[updates.country] || 0) + 1;
  }

  // Requirement #10: Update devices JSON
  if (updates.device) {
    analytics.devices[updates.device] = (analytics.devices[updates.device] || 0) + 1;
  }

  analytics.updatedAt = new Date().toISOString();

  return analytics;
}

// ============================================================================
// POST /api/portfolios/:id/track
// Requirements #1-10: Track portfolio views (public endpoint)
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: portfolioId } = params;

    // Requirement #2: Accept trackingData from client
    const body = await request.json().catch(() => ({}));

    const validation = TrackingDataSchema.safeParse(body);

    if (!validation.success) {
      // Don't fail tracking if validation fails, just use defaults
      console.warn('Tracking data validation failed:', validation.error);
    }

    const trackingData = validation.success ? validation.data : {};

    // Find portfolio
    // TODO: Replace with actual database query
    let portfolio = portfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      // Create mock portfolio for testing
      portfolio = {
        id: portfolioId,
        viewCount: 0,
        lastViewedAt: null,
      };
      portfolios.push(portfolio);
    }

    // Requirement #3: Extract IP address from request headers
    const clientIP = getClientIP(request);

    // Requirement #4: Use IP geolocation to determine country
    const country = await getCountryFromIP(clientIP);

    // Requirement #5: Parse userAgent to determine device type
    const userAgent = trackingData.userAgent || request.headers.get('user-agent') || '';
    const deviceType = getDeviceType(userAgent);

    // Extract referrer domain
    const referrerDomain = extractDomain(trackingData.referrer || request.headers.get('referer') || '');

    // Generate session ID if not provided
    const sessionId = trackingData.sessionId || `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Get today's date
    const today = getTodayDate();

    // Check if unique visitor
    const isUnique = isUniqueVisitor(portfolioId, sessionId, today);

    // Requirement #6: Increment Portfolio.viewCount atomically
    portfolio.viewCount += 1;
    portfolio.lastViewedAt = new Date().toISOString();

    // TODO: Update in database
    // await db.portfolio.update({
    //   where: { id: portfolioId },
    //   data: {
    //     viewCount: { increment: 1 },
    //     lastViewedAt: new Date(),
    //   },
    // });

    // Requirement #7-10: Upsert PortfolioAnalytics record
    const analytics = upsertAnalytics(portfolioId, today, {
      incrementViews: 1,
      incrementUniqueVisitors: isUnique ? 1 : 0,
      referrer: referrerDomain,
      country,
      device: deviceType,
    });

    // TODO: Save analytics to database
    // await db.portfolioAnalytics.upsert({
    //   where: {
    //     portfolioId_date: { portfolioId, date: today },
    //   },
    //   update: {
    //     views: { increment: 1 },
    //     uniqueVisitors: { increment: isUnique ? 1 : 0 },
    //     referrers: analytics.referrers,
    //     countries: analytics.countries,
    //     devices: analytics.devices,
    //     updatedAt: new Date(),
    //   },
    //   create: analytics,
    // });

    // Return success (minimal data to reduce response size)
    return NextResponse.json({
      success: true,
      tracked: {
        portfolioId,
        viewCount: portfolio.viewCount,
        isUniqueVisitor: isUnique,
        sessionId, // Return sessionId for client to store
      },
    });

  } catch (error) {
    console.error('Error tracking portfolio view:', error);

    // Don't fail tracking - return success even if there's an error
    // This ensures the user experience isn't impacted
    return NextResponse.json({
      success: true,
      error: 'Tracking failed silently',
    });
  }
}
