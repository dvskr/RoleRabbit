/**
 * Analytics Anonymization - Section 6.3
 *
 * GDPR/CCPA compliance: Anonymize IP addresses and user agents
 */

import { anonymizeIp, anonymizeUserAgent, hashForPrivacy } from '@/lib/security/encryption';

export interface AnonymizedAnalytics {
  portfolioId: string;
  eventType: 'view' | 'share' | 'export' | 'click';
  ipHash: string; // Hashed IP address
  userAgentHash: string; // Hashed user agent
  country?: string; // Country from IP (before hashing)
  referrer?: string;
  timestamp: string;
  sessionId?: string; // Hashed session ID
}

/**
 * Anonymize analytics event
 */
export function anonymizeAnalyticsEvent(event: {
  portfolioId: string;
  eventType: 'view' | 'share' | 'export' | 'click';
  ipAddress: string;
  userAgent: string;
  country?: string;
  referrer?: string;
  sessionId?: string;
}): AnonymizedAnalytics {
  return {
    portfolioId: event.portfolioId,
    eventType: event.eventType,
    ipHash: anonymizeIp(event.ipAddress),
    userAgentHash: anonymizeUserAgent(event.userAgent),
    country: event.country,
    referrer: sanitizeReferrer(event.referrer),
    timestamp: new Date().toISOString(),
    sessionId: event.sessionId ? hashForPrivacy(event.sessionId) : undefined,
  };
}

/**
 * Sanitize referrer URL
 * Remove query params and fragments for privacy
 */
export function sanitizeReferrer(referrer?: string): string | undefined {
  if (!referrer) {
    return undefined;
  }

  try {
    const url = new URL(referrer);
    // Keep only protocol, hostname, and pathname
    return `${url.protocol}//${url.hostname}${url.pathname}`;
  } catch (error) {
    return undefined;
  }
}

/**
 * Extract country from IP address
 * Note: In production, use a GeoIP service
 */
export async function getCountryFromIp(ipAddress: string): Promise<string | undefined> {
  // Placeholder - integrate with MaxMind GeoIP2, ip-api.com, etc.
  // For now, return undefined
  return undefined;
}

/**
 * Track portfolio view with anonymization
 */
export async function trackPortfolioView(
  portfolioId: string,
  ipAddress: string,
  userAgent: string,
  referrer?: string
): Promise<void> {
  const country = await getCountryFromIp(ipAddress);

  const anonymizedEvent = anonymizeAnalyticsEvent({
    portfolioId,
    eventType: 'view',
    ipAddress,
    userAgent,
    country,
    referrer,
  });

  // Store anonymized analytics
  // In production, store in database or analytics service
  console.log('Anonymized analytics event:', anonymizedEvent);
}

/**
 * Aggregate analytics for privacy
 * Returns aggregated data without PII
 */
export interface AggregatedAnalytics {
  portfolioId: string;
  period: 'day' | 'week' | 'month';
  date: string;
  views: number;
  shares: number;
  exports: number;
  uniqueVisitors: number; // Based on hashed IPs
  topCountries: { country: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
}

/**
 * Aggregate analytics data
 * Removes individual events, keeps only aggregates
 */
export async function aggregateAnalytics(
  portfolioId: string,
  startDate: Date,
  endDate: Date,
  period: 'day' | 'week' | 'month'
): Promise<AggregatedAnalytics[]> {
  // Placeholder - implement with database queries
  // Group by date period, count events, unique hashes
  return [];
}

/**
 * Privacy-safe analytics query
 * Only returns aggregated data
 */
export async function getPrivacySafeAnalytics(
  portfolioId: string,
  days: number = 30
): Promise<{
  totalViews: number;
  totalShares: number;
  totalExports: number;
  uniqueVisitors: number;
  topCountries: { country: string; percentage: number }[];
}> {
  // Placeholder - implement with database queries
  return {
    totalViews: 0,
    totalShares: 0,
    totalExports: 0,
    uniqueVisitors: 0,
    topCountries: [],
  };
}

/**
 * Delete old analytics data
 * GDPR compliance: retain data for limited time
 */
export async function deleteOldAnalytics(
  retentionDays: number = 365
): Promise<{ deleted: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  // Placeholder - implement with database query
  // Delete analytics events older than cutoff date
  return { deleted: 0 };
}

/**
 * Opt-out of analytics tracking
 * Store user preference
 */
export async function setAnalyticsOptOut(
  userId: string,
  optOut: boolean
): Promise<void> {
  // Store preference in database
  // When optOut = true, don't track any analytics for this user
}

/**
 * Check if user has opted out
 */
export async function hasOptedOutOfAnalytics(
  userId: string
): Promise<boolean> {
  // Check database for opt-out preference
  return false;
}

/**
 * Export user's analytics data
 * GDPR: User has right to access their data
 */
export async function exportUserAnalytics(
  userId: string
): Promise<any[]> {
  // Return all analytics events associated with user's portfolios
  // Note: Even though IPs are hashed, user can still access their data
  return [];
}

/**
 * Anonymize existing analytics data
 * Run as migration for GDPR compliance
 */
export async function anonymizeExistingAnalytics(): Promise<{
  processed: number;
  errors: number;
}> {
  // Placeholder - implement as migration script
  // Hash all existing IP addresses and user agents
  return { processed: 0, errors: 0 };
}
