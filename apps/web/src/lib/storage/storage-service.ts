/**
 * Static Hosting Storage Service (Section 4.2)
 *
 * Handles portfolio static file storage using Supabase Storage or S3
 * Supports both Supabase Storage (default) and AWS S3/DigitalOcean Spaces
 */

import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Storage provider type
 */
export type StorageProvider = 'supabase' | 's3' | 'digitalocean';

/**
 * Storage configuration
 */
export interface StorageConfig {
  provider: StorageProvider;
  supabase?: {
    url: string;
    serviceKey: string;
    bucket: string;
  };
  s3?: {
    endpoint?: string; // For DigitalOcean Spaces or custom S3
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
  };
}

/**
 * Upload options
 */
export interface UploadOptions {
  contentType?: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
  isPublic?: boolean;
}

/**
 * Upload result
 */
export interface UploadResult {
  url: string;
  path: string;
  size: number;
  contentType: string;
}

/**
 * Storage service for portfolio static files
 */
export class StorageService {
  private config: StorageConfig;
  private supabaseClient?: ReturnType<typeof createClient>;
  private s3Client?: S3Client;

  constructor(config?: StorageConfig) {
    this.config = config || this.getDefaultConfig();
    this.initialize();
  }

  /**
   * Get default configuration from environment variables
   */
  private getDefaultConfig(): StorageConfig {
    const provider = (process.env.STORAGE_PROVIDER || 'supabase') as StorageProvider;

    if (provider === 'supabase') {
      return {
        provider: 'supabase',
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          bucket: process.env.STORAGE_BUCKET || 'portfolios',
        },
      };
    }

    // S3 or DigitalOcean Spaces
    return {
      provider,
      s3: {
        endpoint: process.env.S3_ENDPOINT, // For DigitalOcean: 'https://nyc3.digitaloceanspaces.com'
        region: process.env.S3_REGION || 'us-east-1',
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        bucket: process.env.S3_BUCKET || 'rolerabbit-portfolios',
      },
    };
  }

  /**
   * Initialize storage clients
   */
  private initialize(): void {
    if (this.config.provider === 'supabase' && this.config.supabase) {
      this.supabaseClient = createClient(
        this.config.supabase.url,
        this.config.supabase.serviceKey
      );
    } else if (this.config.s3) {
      this.s3Client = new S3Client({
        endpoint: this.config.s3.endpoint,
        region: this.config.s3.region,
        credentials: {
          accessKeyId: this.config.s3.accessKeyId,
          secretAccessKey: this.config.s3.secretAccessKey,
        },
      });
    }
  }

  /**
   * Upload file to storage
   *
   * @example
   * const result = await storage.uploadFile('portfolio-123/index.html', htmlContent, {
   *   contentType: 'text/html',
   *   cacheControl: 'max-age=300',
   *   isPublic: true
   * });
   */
  async uploadFile(
    path: string,
    content: Buffer | string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    if (this.config.provider === 'supabase') {
      return this.uploadToSupabase(path, content, options);
    }
    return this.uploadToS3(path, content, options);
  }

  /**
   * Upload to Supabase Storage
   */
  private async uploadToSupabase(
    path: string,
    content: Buffer | string,
    options: UploadOptions
  ): Promise<UploadResult> {
    if (!this.supabaseClient || !this.config.supabase) {
      throw new Error('Supabase client not initialized');
    }

    const buffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;
    const contentType = options.contentType || 'application/octet-stream';

    const { data, error } = await this.supabaseClient.storage
      .from(this.config.supabase.bucket)
      .upload(path, buffer, {
        contentType,
        cacheControl: options.cacheControl || 'max-age=300',
        upsert: true,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = this.supabaseClient.storage
      .from(this.config.supabase.bucket)
      .getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      size: buffer.length,
      contentType,
    };
  }

  /**
   * Upload to S3 or DigitalOcean Spaces
   */
  private async uploadToS3(
    path: string,
    content: Buffer | string,
    options: UploadOptions
  ): Promise<UploadResult> {
    if (!this.s3Client || !this.config.s3) {
      throw new Error('S3 client not initialized');
    }

    const buffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;
    const contentType = options.contentType || 'application/octet-stream';

    const command = new PutObjectCommand({
      Bucket: this.config.s3.bucket,
      Key: path,
      Body: buffer,
      ContentType: contentType,
      CacheControl: options.cacheControl || 'max-age=300',
      ACL: options.isPublic ? 'public-read' : 'private',
      Metadata: options.metadata,
    });

    await this.s3Client.send(command);

    // Construct public URL
    const baseUrl = this.config.s3.endpoint ||
      `https://${this.config.s3.bucket}.s3.${this.config.s3.region}.amazonaws.com`;
    const url = `${baseUrl}/${path}`;

    return {
      url,
      path,
      size: buffer.length,
      contentType,
    };
  }

  /**
   * Upload portfolio files
   *
   * @example
   * await storage.uploadPortfolio('portfolio-123', {
   *   'index.html': htmlContent,
   *   'style.css': cssContent,
   *   'script.js': jsContent,
   *   '404.html': errorContent
   * });
   */
  async uploadPortfolio(
    portfolioId: string,
    files: Record<string, string>
  ): Promise<{ urls: Record<string, string>; mainUrl: string }> {
    const urls: Record<string, string> = {};

    for (const [filename, content] of Object.entries(files)) {
      const path = `${portfolioId}/${filename}`;
      const contentType = this.getContentType(filename);
      const cacheControl = this.getCacheControl(filename);

      const result = await this.uploadFile(path, content, {
        contentType,
        cacheControl,
        isPublic: true,
      });

      urls[filename] = result.url;
    }

    return {
      urls,
      mainUrl: urls['index.html'] || urls['index.htm'] || Object.values(urls)[0],
    };
  }

  /**
   * Delete file from storage
   */
  async deleteFile(path: string): Promise<void> {
    if (this.config.provider === 'supabase') {
      if (!this.supabaseClient || !this.config.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await this.supabaseClient.storage
        .from(this.config.supabase.bucket)
        .remove([path]);

      if (error) {
        throw new Error(`Supabase delete failed: ${error.message}`);
      }
    } else {
      if (!this.s3Client || !this.config.s3) {
        throw new Error('S3 client not initialized');
      }

      const command = new DeleteObjectCommand({
        Bucket: this.config.s3.bucket,
        Key: path,
      });

      await this.s3Client.send(command);
    }
  }

  /**
   * Delete entire portfolio directory
   */
  async deletePortfolio(portfolioId: string): Promise<void> {
    if (this.config.provider === 'supabase') {
      if (!this.supabaseClient || !this.config.supabase) {
        throw new Error('Supabase client not initialized');
      }

      // List all files in portfolio directory
      const { data: files, error: listError } = await this.supabaseClient.storage
        .from(this.config.supabase.bucket)
        .list(portfolioId);

      if (listError) {
        throw new Error(`Failed to list portfolio files: ${listError.message}`);
      }

      if (files && files.length > 0) {
        const filePaths = files.map((file) => `${portfolioId}/${file.name}`);
        const { error: deleteError } = await this.supabaseClient.storage
          .from(this.config.supabase.bucket)
          .remove(filePaths);

        if (deleteError) {
          throw new Error(`Failed to delete portfolio files: ${deleteError.message}`);
        }
      }
    } else {
      // For S3, delete common portfolio files
      const commonFiles = ['index.html', 'style.css', 'script.js', '404.html'];
      for (const file of commonFiles) {
        try {
          await this.deleteFile(`${portfolioId}/${file}`);
        } catch (error) {
          // Ignore if file doesn't exist
        }
      }
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(path: string): Promise<{ size: number; contentType: string; lastModified: Date }> {
    if (this.config.provider === 'supabase') {
      if (!this.supabaseClient || !this.config.supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Supabase doesn't have a direct metadata API, so we download the file
      const { data, error } = await this.supabaseClient.storage
        .from(this.config.supabase.bucket)
        .download(path);

      if (error) {
        throw new Error(`Failed to get file metadata: ${error.message}`);
      }

      return {
        size: data.size,
        contentType: data.type,
        lastModified: new Date(),
      };
    } else {
      if (!this.s3Client || !this.config.s3) {
        throw new Error('S3 client not initialized');
      }

      const command = new HeadObjectCommand({
        Bucket: this.config.s3.bucket,
        Key: path,
      });

      const response = await this.s3Client.send(command);

      return {
        size: response.ContentLength || 0,
        contentType: response.ContentType || 'application/octet-stream',
        lastModified: response.LastModified || new Date(),
      };
    }
  }

  /**
   * Generate signed URL for private access
   */
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    if (this.config.provider === 'supabase') {
      if (!this.supabaseClient || !this.config.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabaseClient.storage
        .from(this.config.supabase.bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`);
      }

      return data.signedUrl;
    } else {
      if (!this.s3Client || !this.config.s3) {
        throw new Error('S3 client not initialized');
      }

      const command = new GetObjectCommand({
        Bucket: this.config.s3.bucket,
        Key: path,
      });

      return getSignedUrl(this.s3Client, command, { expiresIn });
    }
  }

  /**
   * Get content type based on file extension
   */
  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      html: 'text/html',
      htm: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      json: 'application/json',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      webp: 'image/webp',
      pdf: 'application/pdf',
      txt: 'text/plain',
      xml: 'application/xml',
      woff: 'font/woff',
      woff2: 'font/woff2',
      ttf: 'font/ttf',
      otf: 'font/otf',
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
  }

  /**
   * Get cache control header based on file type
   */
  private getCacheControl(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();

    // HTML files: cache for 5 minutes (as per requirements)
    if (ext === 'html' || ext === 'htm') {
      return 'public, max-age=300, must-revalidate';
    }

    // CSS/JS with versioning: cache for 1 year (as per requirements)
    if ((ext === 'css' || ext === 'js') && /\.[a-f0-9]{8,}\.(css|js)$/i.test(filename)) {
      return 'public, max-age=31536000, immutable';
    }

    // Other CSS/JS: cache for 1 hour
    if (ext === 'css' || ext === 'js') {
      return 'public, max-age=3600';
    }

    // Images: cache for 1 week
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) {
      return 'public, max-age=604800';
    }

    // Fonts: cache for 1 year
    if (['woff', 'woff2', 'ttf', 'otf'].includes(ext || '')) {
      return 'public, max-age=31536000, immutable';
    }

    // Default: cache for 1 hour
    return 'public, max-age=3600';
  }
}

/**
 * Export singleton instance
 */
export const storageService = new StorageService();
