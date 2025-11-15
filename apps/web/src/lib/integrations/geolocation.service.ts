/**
 * IP Geolocation Service
 * Section 2.13: External Integrations
 *
 * Requirement #9: Integrate with IP geolocation service for analytics country detection
 * Uses circuit breaker for resilience
 */

import { createResilientFunction, TIMEOUTS } from './circuit-breaker';
import { logger } from '@/lib/logger/logger';
import { ExternalServiceError } from '@/lib/errors';

/**
 * Geolocation data interface
 */
export interface GeolocationData {
  ip: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Geolocation provider enum
 */
export enum GeolocationProvider {
  IPAPI = 'ipapi', // ipapi.co (free tier: 1000 requests/day)
  IPSTACK = 'ipstack', // ipstack.com (free tier: 100 requests/month)
  IPGEOLOCATION = 'ipgeolocation', // ipgeolocation.io (free tier: 1000 requests/day)
}

/**
 * IP Geolocation Service
 */
export class GeolocationService {
  private provider: GeolocationProvider;
  private apiKey?: string;
  private cache: Map<string, GeolocationData> = new Map();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

  constructor(provider: GeolocationProvider = GeolocationProvider.IPAPI) {
    this.provider = provider;
    this.apiKey = this.getApiKey(provider);
  }

  /**
   * Get geolocation data for IP address
   */
  getGeolocation = createResilientFunction(
    async (ip: string): Promise<GeolocationData> => {
      // Check cache first
      const cached = this.getCachedData(ip);
      if (cached) {
        logger.debug(`Geolocation cache hit for ${ip}`);
        return cached;
      }

      logger.info(`Fetching geolocation for ${ip} using ${this.provider}`);

      let data: GeolocationData;

      switch (this.provider) {
        case GeolocationProvider.IPAPI:
          data = await this.fetchFromIPAPI(ip);
          break;
        case GeolocationProvider.IPSTACK:
          data = await this.fetchFromIPStack(ip);
          break;
        case GeolocationProvider.IPGEOLOCATION:
          data = await this.fetchFromIPGeolocation(ip);
          break;
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }

      // Cache the result
      this.cacheData(ip, data);

      return data;
    },
    {
      circuitBreaker: {
        timeout: TIMEOUTS.GEOLOCATION,
        name: 'geolocation-service',
        errorThresholdPercentage: 70, // More tolerant since it's non-critical
      },
      retry: {
        maxRetries: 2, // Fewer retries for non-critical service
        baseDelay: 1000,
        exponential: true,
      },
      name: 'geolocation-service',
    }
  );

  /**
   * Fetch from ipapi.co
   * Free tier: 1000 requests/day
   */
  private async fetchFromIPAPI(ip: string): Promise<GeolocationData> {
    const url = this.apiKey
      ? `https://ipapi.co/${ip}/json/?key=${this.apiKey}`
      : `https://ipapi.co/${ip}/json/`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new ExternalServiceError(
        'ipapi.co',
        `HTTP ${response.status}: ${response.statusText}`,
        { ip }
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new ExternalServiceError('ipapi.co', data.reason || data.error, { ip });
    }

    return {
      ip,
      country: data.country_name,
      countryCode: data.country_code,
      region: data.region,
      city: data.city,
      timezone: data.timezone,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  }

  /**
   * Fetch from ipstack.com
   * Free tier: 100 requests/month (requires API key)
   */
  private async fetchFromIPStack(ip: string): Promise<GeolocationData> {
    if (!this.apiKey) {
      throw new ExternalServiceError(
        'ipstack.com',
        'API key required for ipstack',
        { ip }
      );
    }

    const url = `http://api.ipstack.com/${ip}?access_key=${this.apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new ExternalServiceError(
        'ipstack.com',
        `HTTP ${response.status}: ${response.statusText}`,
        { ip }
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new ExternalServiceError(
        'ipstack.com',
        data.error.info || 'Unknown error',
        { ip }
      );
    }

    return {
      ip,
      country: data.country_name,
      countryCode: data.country_code,
      region: data.region_name,
      city: data.city,
      timezone: data.time_zone?.id,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  }

  /**
   * Fetch from ipgeolocation.io
   * Free tier: 1000 requests/day (requires API key)
   */
  private async fetchFromIPGeolocation(ip: string): Promise<GeolocationData> {
    if (!this.apiKey) {
      throw new ExternalServiceError(
        'ipgeolocation.io',
        'API key required for ipgeolocation',
        { ip }
      );
    }

    const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${this.apiKey}&ip=${ip}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new ExternalServiceError(
        'ipgeolocation.io',
        `HTTP ${response.status}: ${response.statusText}`,
        { ip }
      );
    }

    const data = await response.json();

    if (data.message) {
      throw new ExternalServiceError(
        'ipgeolocation.io',
        data.message,
        { ip }
      );
    }

    return {
      ip,
      country: data.country_name,
      countryCode: data.country_code2,
      region: data.state_prov,
      city: data.city,
      timezone: data.time_zone?.name,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
    };
  }

  /**
   * Get API key for provider
   */
  private getApiKey(provider: GeolocationProvider): string | undefined {
    switch (provider) {
      case GeolocationProvider.IPAPI:
        return process.env.IPAPI_KEY; // Optional for ipapi.co
      case GeolocationProvider.IPSTACK:
        return process.env.IPSTACK_KEY;
      case GeolocationProvider.IPGEOLOCATION:
        return process.env.IPGEOLOCATION_KEY;
      default:
        return undefined;
    }
  }

  /**
   * Get cached geolocation data
   */
  private getCachedData(ip: string): GeolocationData | null {
    const cached = this.cache.get(ip);

    if (!cached) {
      return null;
    }

    // Check if cache expired (stored with timestamp)
    const now = Date.now();
    const cachedTime = (cached as any).__cachedAt || 0;

    if (now - cachedTime > this.cacheExpiry) {
      this.cache.delete(ip);
      return null;
    }

    return cached;
  }

  /**
   * Cache geolocation data
   */
  private cacheData(ip: string, data: GeolocationData): void {
    // Add timestamp for expiry check
    (data as any).__cachedAt = Date.now();
    this.cache.set(ip, data);

    // Limit cache size (prevent memory leak)
    if (this.cache.size > 10000) {
      // Remove oldest entries (FIFO)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * Get country code from IP (convenience method)
   */
  async getCountryCode(ip: string): Promise<string | null> {
    try {
      const data = await this.getGeolocation(ip);
      return data.countryCode || null;
    } catch (error) {
      logger.error('Failed to get country code', { ip, error });
      return null;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Singleton instance
 */
let geolocationService: GeolocationService | null = null;

export const getGeolocationService = (
  provider?: GeolocationProvider
): GeolocationService => {
  if (!geolocationService || (provider && geolocationService['provider'] !== provider)) {
    geolocationService = new GeolocationService(provider);
  }
  return geolocationService;
};

/**
 * Helper function to extract client IP from request
 */
export const getClientIP = (request: Request): string => {
  const headers = request.headers;

  // Try various headers (in order of preference)
  const ip =
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('cf-connecting-ip') || // Cloudflare
    headers.get('x-vercel-forwarded-for') || // Vercel
    'unknown';

  return ip.trim();
};
