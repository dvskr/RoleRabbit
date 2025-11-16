/**
 * Deployment Service
 * Section 2.11: Service Layer Implementation
 *
 * Requirements #12-17: DeploymentService class
 * Updated to use Supabase Storage instead of S3/CloudFront
 */

import { promises as dns } from 'dns';
import {
  PortfolioNotFoundError,
  ConflictError,
  ValidationError,
  ExternalServiceError,
} from '@/lib/errors';
import { PortfolioService } from './portfolio.service';
import { BuildService } from './build.service';

// Supabase client for storage operations
// TODO: In production, import from your Supabase client instance
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

/**
 * Custom domain
 */
export interface CustomDomain {
  id: string;
  portfolioId: string;
  domain: string;
  isVerified: boolean;
  verificationToken: string;
  sslStatus: 'pending' | 'provisioning' | 'active' | 'failed';
  sslCertPath?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DNS instructions
 */
export interface DNSInstructions {
  recordType: 'TXT' | 'CNAME' | 'A';
  name: string;
  value: string;
  ttl: number;
  instructions: string;
}

/**
 * Deployment result
 */
export interface DeploymentResult {
  success: boolean;
  url: string;
  storageUrl: string; // Supabase Storage URL with CDN
  deploymentId: string;
  filesUploaded: number;
  bucketName: string;
}

/**
 * Mock databases
 */
const customDomains: CustomDomain[] = [];

const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'admin',
  'app',
  'blog',
  'dashboard',
  'cdn',
  'static',
  'assets',
  'mail',
  'ftp',
  'dev',
  'staging',
  'prod',
];

/**
 * Deployment Service
 * Requirement #12: Create DeploymentService class with 5 methods
 */
export class DeploymentService {
  private portfolioService: PortfolioService;
  private buildService: BuildService;

  constructor() {
    this.portfolioService = new PortfolioService();
    this.buildService = new BuildService();
  }

  /**
   * Requirement #13: Configure subdomain
   * - Check availability
   * - Update portfolio.subdomain
   * - Configure DNS
   */
  async configureSubdomain(
    portfolioId: string,
    subdomain: string,
    userId: string
  ): Promise<{ success: boolean; url: string }> {
    // Validate subdomain format
    this.validateSubdomainFormat(subdomain);

    // Requirement #13: Check availability
    const isAvailable = await this.checkSubdomainAvailability(subdomain);
    if (!isAvailable) {
      throw new ConflictError(`Subdomain '${subdomain}' is already taken`, {
        subdomain,
      });
    }

    // Check if reserved
    if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
      throw new ValidationError(`Subdomain '${subdomain}' is reserved`, {
        subdomain,
      });
    }

    // Requirement #13: Update portfolio.subdomain
    const portfolio = await this.portfolioService.findById(portfolioId);
    if (!portfolio) {
      throw new PortfolioNotFoundError(portfolioId);
    }

    await this.portfolioService.update(portfolioId, userId, { subdomain });

    // Requirement #13: Configure DNS
    await this.configureDNSForSubdomain(subdomain, portfolioId);

    const url = `https://${subdomain}.rolerabbit.com`;

    return { success: true, url };
  }

  /**
   * Requirement #14: Add custom domain
   * - Create CustomDomain record
   * - Generate verification token
   * - Return DNS instructions
   */
  async addCustomDomain(
    portfolioId: string,
    domain: string,
    isPrimary: boolean = false
  ): Promise<{
    domain: CustomDomain;
    dnsInstructions: DNSInstructions[];
  }> {
    // Validate domain format
    this.validateDomainFormat(domain);

    // Check if domain already exists
    const existing = customDomains.find(
      (d) => d.domain === domain && d.portfolioId === portfolioId
    );

    if (existing) {
      throw new ConflictError(`Domain '${domain}' is already added`, { domain });
    }

    // Requirement #14: Generate verification token
    const verificationToken = this.generateVerificationToken();

    // Requirement #14: Create CustomDomain record
    const customDomain: CustomDomain = {
      id: `domain-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      portfolioId,
      domain,
      isVerified: false,
      verificationToken,
      sslStatus: 'pending',
      isPrimary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: In production, save to database
    // await db.customDomain.create({ data: customDomain });

    customDomains.push(customDomain);

    // Requirement #14: Return DNS instructions
    const dnsInstructions = this.generateDNSInstructions(
      domain,
      verificationToken
    );

    return { domain: customDomain, dnsInstructions };
  }

  /**
   * Requirement #15: Verify domain
   * - Check DNS TXT record using dns.resolveTxt()
   * - Update isVerified if match
   */
  async verifyDomain(domainId: string): Promise<{
    verified: boolean;
    message: string;
  }> {
    const customDomain = customDomains.find((d) => d.id === domainId);

    if (!customDomain) {
      throw new ValidationError('Custom domain not found', { domainId });
    }

    // Requirement #15: Check DNS TXT record
    const txtRecordName = `_rolerabbit-verification.${customDomain.domain}`;

    try {
      // Requirement #15: Use dns.resolveTxt()
      const records = await dns.resolveTxt(txtRecordName);
      const flatRecords = records.flat();

      // Check if verification token matches
      const verified = flatRecords.some(
        (record) => record === customDomain.verificationToken
      );

      if (verified) {
        // Requirement #15: Update isVerified
        customDomain.isVerified = true;
        customDomain.updatedAt = new Date().toISOString();

        // TODO: In production, update database
        // await db.customDomain.update({
        //   where: { id: domainId },
        //   data: { isVerified: true },
        // });

        // Start SSL provisioning after verification
        await this.provisionSSL(domainId);

        return {
          verified: true,
          message: 'Domain verified successfully. SSL certificate provisioning started.',
        };
      } else {
        return {
          verified: false,
          message: `Verification token not found in TXT record. Expected: ${customDomain.verificationToken}`,
        };
      }
    } catch (error: any) {
      if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
        return {
          verified: false,
          message: `TXT record not found for ${txtRecordName}. Please add the DNS record and try again.`,
        };
      }

      throw new ExternalServiceError(
        'DNS',
        'Failed to verify domain',
        { error: error.message }
      );
    }
  }

  /**
   * Requirement #16: Provision SSL certificate
   * - Use ACME client (acme-client)
   * - Request Let's Encrypt certificate
   * - Support DNS-01 or HTTP-01 challenge
   */
  async provisionSSL(domainId: string): Promise<{
    success: boolean;
    certPath?: string;
  }> {
    const customDomain = customDomains.find((d) => d.id === domainId);

    if (!customDomain) {
      throw new ValidationError('Custom domain not found', { domainId });
    }

    if (!customDomain.isVerified) {
      throw new ValidationError('Domain must be verified before provisioning SSL', {
        domainId,
      });
    }

    // Update SSL status
    customDomain.sslStatus = 'provisioning';

    try {
      // TODO: In production, use acme-client for Let's Encrypt
      // import * as acme from 'acme-client';
      //
      // const client = new acme.Client({
      //   directoryUrl: acme.directory.letsencrypt.production,
      //   accountKey: await acme.crypto.createPrivateKey(),
      // });
      //
      // const [key, csr] = await acme.crypto.createCsr({
      //   commonName: customDomain.domain,
      // });
      //
      // const cert = await client.auto({
      //   csr,
      //   email: 'admin@rolerabbit.com',
      //   termsOfServiceAgreed: true,
      //   challengePriority: ['dns-01', 'http-01'],
      //   challengeCreateFn: async (authz, challenge, keyAuthorization) => {
      //     if (challenge.type === 'dns-01') {
      //       // Create DNS TXT record
      //       await createDNSTxtRecord(
      //         `_acme-challenge.${customDomain.domain}`,
      //         keyAuthorization
      //       );
      //     } else if (challenge.type === 'http-01') {
      //       // Create HTTP file
      //       await createHttpChallengeFile(challenge.token, keyAuthorization);
      //     }
      //   },
      //   challengeRemoveFn: async (authz, challenge, keyAuthorization) => {
      //     // Cleanup challenge
      //   },
      // });

      // Mock SSL provisioning
      const certPath = `/etc/letsencrypt/live/${customDomain.domain}/fullchain.pem`;

      customDomain.sslStatus = 'active';
      customDomain.sslCertPath = certPath;
      customDomain.updatedAt = new Date().toISOString();

      // TODO: In production, update database
      // await db.customDomain.update({
      //   where: { id: domainId },
      //   data: { sslStatus: 'active', sslCertPath: certPath },
      // });

      console.log(`SSL certificate provisioned for ${customDomain.domain}`);

      return { success: true, certPath };
    } catch (error: any) {
      customDomain.sslStatus = 'failed';

      throw new ExternalServiceError(
        'Let\'s Encrypt',
        'Failed to provision SSL certificate',
        { error: error.message }
      );
    }
  }

  /**
   * Requirement #17: Deploy to Supabase Storage
   * - Build static site
   * - Upload to Supabase Storage bucket (public access)
   * - Return CDN URLs (Supabase provides automatic CDN)
   */
  async deploy(portfolioId: string): Promise<DeploymentResult> {
    const portfolio = await this.portfolioService.findById(portfolioId);
    if (!portfolio) {
      throw new PortfolioNotFoundError(portfolioId);
    }

    // Requirement #17: Build static site
    const { files, manifest } = await this.buildService.generateDeploymentPackage(
      portfolioId
    );

    const deploymentId = `deploy-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Requirement #17: Upload to Supabase Storage
    const storageResult = await this.uploadToSupabaseStorage(portfolioId, files);

    // Determine deployment URL
    const url = portfolio.subdomain
      ? `https://${portfolio.subdomain}.rolerabbit.com`
      : `https://rolerabbit.com/p/${portfolio.slug}`;

    return {
      success: true,
      url,
      storageUrl: storageResult.storageUrl,
      deploymentId,
      filesUploaded: files.size,
      bucketName: storageResult.bucketName,
    };
  }

  /**
   * Legacy method name for backward compatibility
   * @deprecated Use deploy() instead
   */
  async deployToS3(portfolioId: string): Promise<DeploymentResult> {
    return this.deploy(portfolioId);
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  /**
   * Validate subdomain format
   */
  private validateSubdomainFormat(subdomain: string): void {
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

    if (!subdomainRegex.test(subdomain)) {
      throw new ValidationError(
        'Invalid subdomain format. Must be 3-63 characters, lowercase letters, numbers, and hyphens only.',
        { subdomain }
      );
    }

    if (subdomain.length < 3 || subdomain.length > 63) {
      throw new ValidationError(
        'Subdomain must be between 3 and 63 characters',
        { subdomain, length: subdomain.length }
      );
    }
  }

  /**
   * Validate domain format
   */
  private validateDomainFormat(domain: string): void {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;

    if (!domainRegex.test(domain.toLowerCase())) {
      throw new ValidationError('Invalid domain format', { domain });
    }
  }

  /**
   * Check subdomain availability
   * Requirement #13: Check availability
   */
  private async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    // TODO: In production, query database
    // const existing = await db.portfolio.findFirst({
    //   where: { subdomain, deletedAt: null },
    // });
    // return !existing;

    // Mock: check against in-memory portfolios
    const existing = await this.portfolioService.findByUserId('all');
    return !existing.some((p) => p.subdomain === subdomain);
  }

  /**
   * Configure DNS for subdomain
   * Requirement #13: Configure DNS
   */
  private async configureDNSForSubdomain(
    subdomain: string,
    portfolioId: string
  ): Promise<void> {
    // TODO: In production, use DNS provider API (Cloudflare, Vercel DNS, etc.)
    //
    // Option 1: Cloudflare (Recommended with Supabase)
    // const cloudflare = require('cloudflare')({
    //   token: process.env.CLOUDFLARE_API_TOKEN,
    // });
    //
    // await cloudflare.dnsRecords.add(process.env.CLOUDFLARE_ZONE_ID, {
    //   type: 'CNAME',
    //   name: subdomain,
    //   content: `${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
    //   ttl: 1, // Auto
    //   proxied: true, // Enable Cloudflare CDN
    // });
    //
    // Option 2: Vercel DNS
    // const response = await fetch('https://api.vercel.com/v4/domains/rolerabbit.com/records', {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     name: subdomain,
    //     type: 'CNAME',
    //     value: 'cname.vercel-dns.com',
    //   }),
    // });

    console.log(`DNS configured for ${subdomain}.rolerabbit.com`);
  }

  /**
   * Generate verification token
   * Requirement #14: Generate verification token
   */
  private generateVerificationToken(): string {
    return `rolerabbit-verify-${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`;
  }

  /**
   * Generate DNS instructions
   * Requirement #14: Return DNS instructions
   */
  private generateDNSInstructions(
    domain: string,
    verificationToken: string
  ): DNSInstructions[] {
    // Extract Supabase project reference from URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
    const supabaseHost = supabaseUrl.replace('https://', '').replace('http://', '');

    return [
      {
        recordType: 'TXT',
        name: `_rolerabbit-verification.${domain}`,
        value: verificationToken,
        ttl: 3600,
        instructions: `Add a TXT record with name "_rolerabbit-verification.${domain}" and value "${verificationToken}"`,
      },
      {
        recordType: 'CNAME',
        name: domain,
        value: supabaseHost,
        ttl: 3600,
        instructions: `Add a CNAME record pointing ${domain} to ${supabaseHost} (add this after verification)`,
      },
    ];
  }

  /**
   * Upload files to Supabase Storage
   * Requirement #17: Upload to Supabase Storage with public access
   */
  private async uploadToSupabaseStorage(
    portfolioId: string,
    files: Map<string, string | Buffer>
  ): Promise<{ success: boolean; storageUrl: string; bucketName: string }> {
    // TODO: In production, use Supabase client
    // import { createClient } from '@supabase/supabase-js';
    //
    // const supabase = createClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for admin operations
    // );
    //
    // const bucketName = 'portfolios'; // Create this bucket in Supabase Dashboard
    // const folderPrefix = `${portfolioId}/`;
    //
    // // Ensure bucket exists (create if needed)
    // const { data: buckets } = await supabase.storage.listBuckets();
    // const bucketExists = buckets?.some(b => b.name === bucketName);
    //
    // if (!bucketExists) {
    //   await supabase.storage.createBucket(bucketName, {
    //     public: true, // Make bucket public
    //     fileSizeLimit: 52428800, // 50MB limit per file
    //   });
    // }
    //
    // // Upload each file
    // for (const [path, content] of files.entries()) {
    //   const filePath = `${folderPrefix}${path}`;
    //   const contentType = this.getContentType(path);
    //
    //   // Convert string content to Buffer if needed
    //   const buffer = typeof content === 'string'
    //     ? Buffer.from(content, 'utf-8')
    //     : content;
    //
    //   const { error } = await supabase.storage
    //     .from(bucketName)
    //     .upload(filePath, buffer, {
    //       contentType,
    //       cacheControl: '3600', // 1 hour cache
    //       upsert: true, // Overwrite if exists
    //     });
    //
    //   if (error) {
    //     throw new ExternalServiceError(
    //       'Supabase Storage',
    //       `Failed to upload ${path}`,
    //       { error: error.message }
    //     );
    //   }
    // }

    console.log(`Uploaded ${files.size} files to Supabase Storage for portfolio ${portfolioId}`);

    // Supabase Storage provides automatic CDN URLs
    const bucketName = 'portfolios';
    const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${portfolioId}/index.html`;

    return { success: true, storageUrl, bucketName };
  }

  /**
   * Get content type for file
   */
  private getContentType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();

    const contentTypes: Record<string, string> = {
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      json: 'application/json',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      woff: 'font/woff',
      woff2: 'font/woff2',
    };

    return contentTypes[ext || ''] || 'application/octet-stream';
  }
}
