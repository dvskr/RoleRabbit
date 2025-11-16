/**
 * Cloudflare DNS Integration Service
 * Section 2.13: External Integrations
 *
 * Requirement #4: Integrate with DNS provider (Cloudflare API) for subdomain management
 * Uses circuit breaker and retry logic for resilience
 */

import { createResilientFunction, TIMEOUTS } from './circuit-breaker';
import { logger } from '@/lib/logger/logger';
import { ExternalServiceError, ValidationError } from '@/lib/errors';

/**
 * DNS record type
 */
export type DNSRecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX';

/**
 * DNS record interface
 */
export interface DNSRecord {
  type: DNSRecordType;
  name: string;
  content: string;
  ttl?: number;
  proxied?: boolean; // Cloudflare-specific: route through CDN
  priority?: number; // For MX records
}

/**
 * Cloudflare DNS response
 */
export interface CloudflareRecordResponse {
  id: string;
  type: DNSRecordType;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
  created_on: string;
  modified_on: string;
}

/**
 * Cloudflare DNS Service
 * Requirement #4: Programmatically create A/CNAME records
 */
export class CloudflareDNSService {
  private apiToken: string;
  private zoneId: string;
  private baseUrl = 'https://api.cloudflare.com/client/v4';

  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || '';
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID || '';

    if (!this.apiToken || !this.zoneId) {
      logger.warn('Cloudflare credentials not configured');
    }
  }

  /**
   * Create DNS record
   * With circuit breaker and retry
   */
  createRecord = createResilientFunction(
    async (record: DNSRecord): Promise<CloudflareRecordResponse> => {
      this.validateConfig();

      const url = `${this.baseUrl}/zones/${this.zoneId}/dns_records`;

      const body = {
        type: record.type,
        name: record.name,
        content: record.content,
        ttl: record.ttl || 1, // 1 = automatic
        proxied: record.proxied ?? false,
        ...(record.priority && { priority: record.priority }),
      };

      logger.info('Creating DNS record', { name: record.name, type: record.type });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new ExternalServiceError(
          'Cloudflare DNS',
          `Failed to create DNS record: ${data.errors?.[0]?.message || 'Unknown error'}`,
          { record, errors: data.errors }
        );
      }

      logger.info('DNS record created successfully', {
        id: data.result.id,
        name: record.name,
      });

      return data.result;
    },
    {
      circuitBreaker: { timeout: TIMEOUTS.DNS_QUERY, name: 'cloudflare-create-record' },
      retry: { maxRetries: 3, baseDelay: 2000, exponential: true },
      name: 'cloudflare-create-record',
    }
  );

  /**
   * Update DNS record
   */
  updateRecord = createResilientFunction(
    async (recordId: string, updates: Partial<DNSRecord>): Promise<CloudflareRecordResponse> => {
      this.validateConfig();

      const url = `${this.baseUrl}/zones/${this.zoneId}/dns_records/${recordId}`;

      logger.info('Updating DNS record', { recordId, updates });

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new ExternalServiceError(
          'Cloudflare DNS',
          `Failed to update DNS record: ${data.errors?.[0]?.message || 'Unknown error'}`,
          { recordId, errors: data.errors }
        );
      }

      logger.info('DNS record updated successfully', { recordId });

      return data.result;
    },
    {
      circuitBreaker: { timeout: TIMEOUTS.DNS_QUERY, name: 'cloudflare-update-record' },
      retry: { maxRetries: 3, baseDelay: 2000, exponential: true },
      name: 'cloudflare-update-record',
    }
  );

  /**
   * Delete DNS record
   */
  deleteRecord = createResilientFunction(
    async (recordId: string): Promise<void> => {
      this.validateConfig();

      const url = `${this.baseUrl}/zones/${this.zoneId}/dns_records/${recordId}`;

      logger.info('Deleting DNS record', { recordId });

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new ExternalServiceError(
          'Cloudflare DNS',
          `Failed to delete DNS record: ${data.errors?.[0]?.message || 'Unknown error'}`,
          { recordId, errors: data.errors }
        );
      }

      logger.info('DNS record deleted successfully', { recordId });
    },
    {
      circuitBreaker: { timeout: TIMEOUTS.DNS_QUERY, name: 'cloudflare-delete-record' },
      retry: { maxRetries: 3, baseDelay: 2000, exponential: true },
      name: 'cloudflare-delete-record',
    }
  );

  /**
   * List DNS records
   */
  listRecords = createResilientFunction(
    async (filters?: { type?: DNSRecordType; name?: string }): Promise<CloudflareRecordResponse[]> => {
      this.validateConfig();

      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.name) params.append('name', filters.name);

      const url = `${this.baseUrl}/zones/${this.zoneId}/dns_records?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new ExternalServiceError(
          'Cloudflare DNS',
          `Failed to list DNS records: ${data.errors?.[0]?.message || 'Unknown error'}`,
          { errors: data.errors }
        );
      }

      return data.result;
    },
    {
      circuitBreaker: { timeout: TIMEOUTS.DNS_QUERY, name: 'cloudflare-list-records' },
      retry: { maxRetries: 2, baseDelay: 1000, exponential: true },
      name: 'cloudflare-list-records',
    }
  );

  /**
   * Get DNS record by name
   */
  async getRecordByName(name: string, type?: DNSRecordType): Promise<CloudflareRecordResponse | null> {
    const records = await this.listRecords({ name, type });
    return records.length > 0 ? records[0] : null;
  }

  /**
   * Create or update DNS record
   */
  async upsertRecord(record: DNSRecord): Promise<CloudflareRecordResponse> {
    const existing = await this.getRecordByName(record.name, record.type);

    if (existing) {
      logger.info('DNS record exists, updating', { name: record.name });
      return this.updateRecord(existing.id, record);
    } else {
      logger.info('DNS record does not exist, creating', { name: record.name });
      return this.createRecord(record);
    }
  }

  /**
   * Configure subdomain for portfolio
   * Creates CNAME record pointing to Supabase or Vercel
   */
  async configurePortfolioSubdomain(
    subdomain: string,
    target: string = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-project.supabase.co',
    proxied: boolean = true // Enable Cloudflare CDN
  ): Promise<CloudflareRecordResponse> {
    const domain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'rolerabbit.com';
    const fullDomain = `${subdomain}.${domain}`;

    // Remove https:// from target
    const cleanTarget = target.replace(/^https?:\/\//, '');

    const record: DNSRecord = {
      type: 'CNAME',
      name: fullDomain,
      content: cleanTarget,
      ttl: 1, // Automatic
      proxied, // Route through Cloudflare CDN
    };

    return this.upsertRecord(record);
  }

  /**
   * Create verification TXT record
   */
  async createVerificationRecord(
    domain: string,
    token: string
  ): Promise<CloudflareRecordResponse> {
    const record: DNSRecord = {
      type: 'TXT',
      name: `_rolerabbit-verification.${domain}`,
      content: token,
      ttl: 1,
    };

    return this.createRecord(record);
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.apiToken || !this.zoneId) {
      throw new ValidationError(
        'Cloudflare API credentials not configured',
        {
          hasToken: !!this.apiToken,
          hasZoneId: !!this.zoneId,
        }
      );
    }
  }
}

/**
 * Singleton instance
 */
let cloudflareDNSService: CloudflareDNSService | null = null;

export const getCloudflareDNSService = (): CloudflareDNSService => {
  if (!cloudflareDNSService) {
    cloudflareDNSService = new CloudflareDNSService();
  }
  return cloudflareDNSService;
};
