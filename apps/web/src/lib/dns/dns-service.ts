/**
 * DNS Management Service (Section 4.3)
 *
 * Handles DNS record management for custom domains and subdomain support
 * Supports Cloudflare and AWS Route53
 */

import {
  Route53Client,
  ChangeResourceRecordSetsCommand,
  ListResourceRecordSetsCommand,
  HostedZone,
} from '@aws-sdk/client-route-53';

/**
 * DNS provider type
 */
export type DNSProvider = 'cloudflare' | 'route53';

/**
 * DNS record type
 */
export type DNSRecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS';

/**
 * DNS configuration
 */
export interface DNSConfig {
  provider: DNSProvider;
  baseDomain: string;
  cloudflare?: {
    zoneId: string;
    apiToken: string;
  };
  route53?: {
    hostedZoneId: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}

/**
 * DNS record
 */
export interface DNSRecord {
  type: DNSRecordType;
  name: string;
  value: string;
  ttl?: number;
  priority?: number; // For MX records
  proxied?: boolean; // For Cloudflare
}

/**
 * DNS record result
 */
export interface DNSRecordResult {
  id: string;
  type: DNSRecordType;
  name: string;
  value: string;
  ttl: number;
  proxied?: boolean;
}

/**
 * DNS service for domain management
 */
export class DNSService {
  private config: DNSConfig;
  private route53Client?: Route53Client;

  constructor(config?: DNSConfig) {
    this.config = config || this.getDefaultConfig();
    this.initialize();
  }

  /**
   * Get default configuration from environment variables
   */
  private getDefaultConfig(): DNSConfig {
    const provider = (process.env.DNS_PROVIDER || 'cloudflare') as DNSProvider;
    const baseDomain = process.env.BASE_DOMAIN || 'rolerabbit.com';

    if (provider === 'cloudflare') {
      return {
        provider: 'cloudflare',
        baseDomain,
        cloudflare: {
          zoneId: process.env.CLOUDFLARE_ZONE_ID!,
          apiToken: process.env.CLOUDFLARE_API_TOKEN!,
        },
      };
    }

    return {
      provider: 'route53',
      baseDomain,
      route53: {
        hostedZoneId: process.env.ROUTE53_HOSTED_ZONE_ID!,
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    };
  }

  /**
   * Initialize DNS clients
   */
  private initialize(): void {
    if (this.config.provider === 'route53' && this.config.route53) {
      this.route53Client = new Route53Client({
        region: this.config.route53.region,
        credentials: {
          accessKeyId: this.config.route53.accessKeyId,
          secretAccessKey: this.config.route53.secretAccessKey,
        },
      });
    }
  }

  /**
   * Create DNS record
   *
   * @example
   * // Create CNAME for subdomain
   * await dns.createRecord({
   *   type: 'CNAME',
   *   name: 'johndoe',
   *   value: 'cloudfront.distribution.domain.com',
   *   ttl: 300
   * });
   *
   * // Create TXT for verification
   * await dns.createRecord({
   *   type: 'TXT',
   *   name: '_acme-challenge.johndoe',
   *   value: 'verification-token-here',
   *   ttl: 60
   * });
   */
  async createRecord(record: DNSRecord): Promise<DNSRecordResult> {
    if (this.config.provider === 'cloudflare') {
      return this.createCloudflareRecord(record);
    }
    return this.createRoute53Record(record);
  }

  /**
   * Create Cloudflare DNS record
   */
  private async createCloudflareRecord(record: DNSRecord): Promise<DNSRecordResult> {
    if (!this.config.cloudflare) {
      throw new Error('Cloudflare not configured');
    }

    // Construct full domain name
    const fullName = record.name.includes(this.config.baseDomain)
      ? record.name
      : `${record.name}.${this.config.baseDomain}`;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${this.config.cloudflare.zoneId}/dns_records`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.cloudflare.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: record.type,
          name: fullName,
          content: record.value,
          ttl: record.ttl || 300,
          proxied: record.proxied ?? false,
          priority: record.priority,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare DNS record creation failed: ${error}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`Cloudflare DNS record creation failed: ${JSON.stringify(data.errors)}`);
    }

    return {
      id: data.result.id,
      type: data.result.type,
      name: data.result.name,
      value: data.result.content,
      ttl: data.result.ttl,
      proxied: data.result.proxied,
    };
  }

  /**
   * Create Route53 DNS record
   */
  private async createRoute53Record(record: DNSRecord): Promise<DNSRecordResult> {
    if (!this.route53Client || !this.config.route53) {
      throw new Error('Route53 client not initialized');
    }

    // Construct full domain name with trailing dot
    const fullName = record.name.includes(this.config.baseDomain)
      ? `${record.name}.`
      : `${record.name}.${this.config.baseDomain}.`;

    const command = new ChangeResourceRecordSetsCommand({
      HostedZoneId: this.config.route53.hostedZoneId,
      ChangeBatch: {
        Changes: [
          {
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name: fullName,
              Type: record.type,
              TTL: record.ttl || 300,
              ResourceRecords: [{ Value: record.value }],
            },
          },
        ],
      },
    });

    const response = await this.route53Client.send(command);

    return {
      id: response.ChangeInfo?.Id || '',
      type: record.type,
      name: fullName,
      value: record.value,
      ttl: record.ttl || 300,
    };
  }

  /**
   * Update DNS record
   */
  async updateRecord(recordId: string, updates: Partial<DNSRecord>): Promise<DNSRecordResult> {
    if (this.config.provider === 'cloudflare') {
      return this.updateCloudflareRecord(recordId, updates);
    }
    // For Route53, we use UPSERT which is same as create
    if (!updates.name || !updates.value || !updates.type) {
      throw new Error('Name, value, and type are required for Route53 updates');
    }
    return this.createRoute53Record(updates as DNSRecord);
  }

  /**
   * Update Cloudflare DNS record
   */
  private async updateCloudflareRecord(
    recordId: string,
    updates: Partial<DNSRecord>
  ): Promise<DNSRecordResult> {
    if (!this.config.cloudflare) {
      throw new Error('Cloudflare not configured');
    }

    const updateData: any = {};
    if (updates.value) updateData.content = updates.value;
    if (updates.ttl) updateData.ttl = updates.ttl;
    if (updates.proxied !== undefined) updateData.proxied = updates.proxied;
    if (updates.priority) updateData.priority = updates.priority;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${this.config.cloudflare.zoneId}/dns_records/${recordId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.config.cloudflare.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare DNS record update failed: ${error}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`Cloudflare DNS record update failed: ${JSON.stringify(data.errors)}`);
    }

    return {
      id: data.result.id,
      type: data.result.type,
      name: data.result.name,
      value: data.result.content,
      ttl: data.result.ttl,
      proxied: data.result.proxied,
    };
  }

  /**
   * Delete DNS record
   */
  async deleteRecord(recordId: string): Promise<void> {
    if (this.config.provider === 'cloudflare') {
      await this.deleteCloudflareRecord(recordId);
    } else {
      throw new Error('Route53 record deletion requires full record details');
    }
  }

  /**
   * Delete Cloudflare DNS record
   */
  private async deleteCloudflareRecord(recordId: string): Promise<void> {
    if (!this.config.cloudflare) {
      throw new Error('Cloudflare not configured');
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${this.config.cloudflare.zoneId}/dns_records/${recordId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.cloudflare.apiToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare DNS record deletion failed: ${error}`);
    }
  }

  /**
   * Get DNS record by name
   */
  async getRecord(name: string, type?: DNSRecordType): Promise<DNSRecordResult | null> {
    if (this.config.provider === 'cloudflare') {
      return this.getCloudflareRecord(name, type);
    }
    return this.getRoute53Record(name, type);
  }

  /**
   * Get Cloudflare DNS record
   */
  private async getCloudflareRecord(
    name: string,
    type?: DNSRecordType
  ): Promise<DNSRecordResult | null> {
    if (!this.config.cloudflare) {
      throw new Error('Cloudflare not configured');
    }

    const fullName = name.includes(this.config.baseDomain)
      ? name
      : `${name}.${this.config.baseDomain}`;

    const url = new URL(
      `https://api.cloudflare.com/client/v4/zones/${this.config.cloudflare.zoneId}/dns_records`
    );
    url.searchParams.set('name', fullName);
    if (type) url.searchParams.set('type', type);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.config.cloudflare.apiToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare DNS record fetch failed: ${error}`);
    }

    const data = await response.json();

    if (!data.success || !data.result || data.result.length === 0) {
      return null;
    }

    const record = data.result[0];
    return {
      id: record.id,
      type: record.type,
      name: record.name,
      value: record.content,
      ttl: record.ttl,
      proxied: record.proxied,
    };
  }

  /**
   * Get Route53 DNS record
   */
  private async getRoute53Record(
    name: string,
    type?: DNSRecordType
  ): Promise<DNSRecordResult | null> {
    if (!this.route53Client || !this.config.route53) {
      throw new Error('Route53 client not initialized');
    }

    const fullName = name.includes(this.config.baseDomain)
      ? `${name}.`
      : `${name}.${this.config.baseDomain}.`;

    const command = new ListResourceRecordSetsCommand({
      HostedZoneId: this.config.route53.hostedZoneId,
      StartRecordName: fullName,
      MaxItems: 100,
    });

    const response = await this.route53Client.send(command);

    const record = response.ResourceRecordSets?.find(
      (r) => r.Name === fullName && (!type || r.Type === type)
    );

    if (!record || !record.ResourceRecords || record.ResourceRecords.length === 0) {
      return null;
    }

    return {
      id: `${record.Name}-${record.Type}`,
      type: record.Type as DNSRecordType,
      name: record.Name || '',
      value: record.ResourceRecords[0].Value || '',
      ttl: record.TTL || 300,
    };
  }

  /**
   * Setup subdomain for portfolio
   *
   * @example
   * await dns.setupSubdomain('johndoe', 'cloudfront.distribution.com');
   */
  async setupSubdomain(subdomain: string, target: string): Promise<DNSRecordResult> {
    return this.createRecord({
      type: 'CNAME',
      name: subdomain,
      value: target,
      ttl: 300,
      proxied: this.config.provider === 'cloudflare', // Enable proxy for Cloudflare
    });
  }

  /**
   * Remove subdomain
   */
  async removeSubdomain(subdomain: string): Promise<void> {
    const record = await this.getRecord(subdomain, 'CNAME');
    if (record) {
      await this.deleteRecord(record.id);
    }
  }

  /**
   * Setup wildcard DNS (*.rolerabbit.com)
   * This should be done once during initial setup
   */
  async setupWildcardDNS(target: string): Promise<DNSRecordResult> {
    return this.createRecord({
      type: 'CNAME',
      name: '*',
      value: target,
      ttl: 300,
      proxied: false, // Wildcard cannot be proxied in Cloudflare
    });
  }

  /**
   * Verify domain ownership via DNS TXT record
   */
  async createVerificationRecord(
    domain: string,
    token: string
  ): Promise<DNSRecordResult> {
    const recordName = domain.startsWith('_')
      ? domain
      : `_verification.${domain}`;

    return this.createRecord({
      type: 'TXT',
      name: recordName,
      value: token,
      ttl: 300,
    });
  }

  /**
   * Check if verification record exists and matches
   */
  async verifyDomain(domain: string, expectedToken: string): Promise<boolean> {
    const recordName = domain.startsWith('_')
      ? domain
      : `_verification.${domain}`;

    const record = await this.getRecord(recordName, 'TXT');
    return record !== null && record.value === expectedToken;
  }
}

/**
 * Export singleton instance
 */
export const dnsService = new DNSService();
