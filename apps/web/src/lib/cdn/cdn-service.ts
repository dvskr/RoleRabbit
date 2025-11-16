/**
 * CDN Service (Section 4.2)
 *
 * Handles CDN cache invalidation and configuration for CloudFront or Cloudflare
 */

import {
  CloudFrontClient,
  CreateInvalidationCommand,
  GetInvalidationCommand,
} from '@aws-sdk/client-cloudfront';

/**
 * CDN provider type
 */
export type CDNProvider = 'cloudfront' | 'cloudflare' | 'none';

/**
 * CDN configuration
 */
export interface CDNConfig {
  provider: CDNProvider;
  cloudfront?: {
    distributionId: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  cloudflare?: {
    zoneId: string;
    apiToken: string;
  };
}

/**
 * Invalidation result
 */
export interface InvalidationResult {
  id: string;
  status: 'InProgress' | 'Completed';
  createdAt: Date;
}

/**
 * CDN service for cache invalidation
 */
export class CDNService {
  private config: CDNConfig;
  private cloudfrontClient?: CloudFrontClient;

  constructor(config?: CDNConfig) {
    this.config = config || this.getDefaultConfig();
    this.initialize();
  }

  /**
   * Get default configuration from environment variables
   */
  private getDefaultConfig(): CDNConfig {
    const provider = (process.env.CDN_PROVIDER || 'none') as CDNProvider;

    if (provider === 'cloudfront') {
      return {
        provider: 'cloudfront',
        cloudfront: {
          distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID!,
          region: process.env.AWS_REGION || 'us-east-1',
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      };
    }

    if (provider === 'cloudflare') {
      return {
        provider: 'cloudflare',
        cloudflare: {
          zoneId: process.env.CLOUDFLARE_ZONE_ID!,
          apiToken: process.env.CLOUDFLARE_API_TOKEN!,
        },
      };
    }

    return { provider: 'none' };
  }

  /**
   * Initialize CDN clients
   */
  private initialize(): void {
    if (this.config.provider === 'cloudfront' && this.config.cloudfront) {
      this.cloudfrontClient = new CloudFrontClient({
        region: this.config.cloudfront.region,
        credentials: {
          accessKeyId: this.config.cloudfront.accessKeyId,
          secretAccessKey: this.config.cloudfront.secretAccessKey,
        },
      });
    }
  }

  /**
   * Invalidate CDN cache for specific paths
   *
   * @example
   * // Invalidate entire portfolio
   * await cdn.invalidate(['portfolio-123/*']);
   *
   * // Invalidate specific files
   * await cdn.invalidate(['portfolio-123/index.html', 'portfolio-123/style.css']);
   */
  async invalidate(paths: string[]): Promise<InvalidationResult> {
    if (this.config.provider === 'cloudfront') {
      return this.invalidateCloudFront(paths);
    }

    if (this.config.provider === 'cloudflare') {
      return this.invalidateCloudflare(paths);
    }

    // No CDN configured, return mock result
    return {
      id: 'no-cdn',
      status: 'Completed',
      createdAt: new Date(),
    };
  }

  /**
   * Invalidate CloudFront cache
   */
  private async invalidateCloudFront(paths: string[]): Promise<InvalidationResult> {
    if (!this.cloudfrontClient || !this.config.cloudfront) {
      throw new Error('CloudFront client not initialized');
    }

    // Ensure paths start with /
    const formattedPaths = paths.map((path) => (path.startsWith('/') ? path : `/${path}`));

    const command = new CreateInvalidationCommand({
      DistributionId: this.config.cloudfront.distributionId,
      InvalidationBatch: {
        CallerReference: `invalidation-${Date.now()}`,
        Paths: {
          Quantity: formattedPaths.length,
          Items: formattedPaths,
        },
      },
    });

    const response = await this.cloudfrontClient.send(command);

    if (!response.Invalidation) {
      throw new Error('CloudFront invalidation failed');
    }

    return {
      id: response.Invalidation.Id || '',
      status: response.Invalidation.Status as 'InProgress' | 'Completed',
      createdAt: response.Invalidation.CreateTime || new Date(),
    };
  }

  /**
   * Invalidate Cloudflare cache
   */
  private async invalidateCloudflare(paths: string[]): Promise<InvalidationResult> {
    if (!this.config.cloudflare) {
      throw new Error('Cloudflare not configured');
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${this.config.cloudflare.zoneId}/purge_cache`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.cloudflare.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: paths.map((path) => {
            // Convert to full URL for Cloudflare
            const baseDomain = process.env.BASE_DOMAIN || 'rolerabbit.com';
            return path.startsWith('http') ? path : `https://${baseDomain}/${path}`;
          }),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare invalidation failed: ${error}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`Cloudflare invalidation failed: ${JSON.stringify(data.errors)}`);
    }

    return {
      id: data.result?.id || `cf-${Date.now()}`,
      status: 'Completed', // Cloudflare purge is synchronous
      createdAt: new Date(),
    };
  }

  /**
   * Invalidate entire portfolio
   */
  async invalidatePortfolio(portfolioId: string): Promise<InvalidationResult> {
    return this.invalidate([`${portfolioId}/*`]);
  }

  /**
   * Invalidate specific portfolio files
   */
  async invalidatePortfolioFiles(portfolioId: string, files: string[]): Promise<InvalidationResult> {
    const paths = files.map((file) => `${portfolioId}/${file}`);
    return this.invalidate(paths);
  }

  /**
   * Get invalidation status (CloudFront only)
   */
  async getInvalidationStatus(invalidationId: string): Promise<InvalidationResult> {
    if (this.config.provider !== 'cloudfront') {
      throw new Error('Invalidation status only available for CloudFront');
    }

    if (!this.cloudfrontClient || !this.config.cloudfront) {
      throw new Error('CloudFront client not initialized');
    }

    const command = new GetInvalidationCommand({
      DistributionId: this.config.cloudfront.distributionId,
      Id: invalidationId,
    });

    const response = await this.cloudfrontClient.send(command);

    if (!response.Invalidation) {
      throw new Error('Invalidation not found');
    }

    return {
      id: response.Invalidation.Id || '',
      status: response.Invalidation.Status as 'InProgress' | 'Completed',
      createdAt: response.Invalidation.CreateTime || new Date(),
    };
  }

  /**
   * Wait for invalidation to complete (CloudFront only)
   */
  async waitForInvalidation(
    invalidationId: string,
    maxWaitTime: number = 300000 // 5 minutes
  ): Promise<void> {
    if (this.config.provider !== 'cloudfront') {
      return; // Cloudflare purges are instant
    }

    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getInvalidationStatus(invalidationId);

      if (status.status === 'Completed') {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Invalidation timed out after ${maxWaitTime}ms`);
  }

  /**
   * Purge all cache (use with caution!)
   */
  async purgeAll(): Promise<InvalidationResult> {
    if (this.config.provider === 'cloudfront') {
      return this.invalidate(['/*']);
    }

    if (this.config.provider === 'cloudflare') {
      if (!this.config.cloudflare) {
        throw new Error('Cloudflare not configured');
      }

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${this.config.cloudflare.zoneId}/purge_cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.cloudflare.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ purge_everything: true }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Cloudflare purge all failed: ${error}`);
      }

      return {
        id: `purge-all-${Date.now()}`,
        status: 'Completed',
        createdAt: new Date(),
      };
    }

    return {
      id: 'no-cdn',
      status: 'Completed',
      createdAt: new Date(),
    };
  }
}

/**
 * Export singleton instance
 */
export const cdnService = new CDNService();
