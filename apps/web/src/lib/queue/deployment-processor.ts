/**
 * Deployment Job Processor (Section 4.4)
 *
 * Processes portfolio deployment jobs from the queue
 */

import { Worker, Job, WorkerOptions } from 'bullmq';
import { createRedisConnection, DeploymentJobData } from './queues';
import { db } from '../../database/client';
import { storageService } from '../storage/storage-service';
import { cdnService } from '../cdn/cdn-service';

/**
 * Deployment processor class
 */
export class DeploymentProcessor {
  private worker: Worker<DeploymentJobData>;
  private concurrency: number;

  constructor(concurrency: number = 5) {
    this.concurrency = concurrency;
    this.worker = this.createWorker();
    this.setupEventHandlers();
  }

  /**
   * Create BullMQ worker
   */
  private createWorker(): Worker<DeploymentJobData> {
    const connection = createRedisConnection();

    const workerOptions: WorkerOptions = {
      connection,
      concurrency: this.concurrency,
      lockDuration: 300000, // 5 minutes lock
      maxStalledCount: 1, // Retry stalled jobs once
      stalledInterval: 30000, // Check for stalled jobs every 30s
    };

    return new Worker<DeploymentJobData>(
      'deployment',
      async (job: Job<DeploymentJobData>) => {
        return this.processDeployment(job);
      },
      workerOptions
    );
  }

  /**
   * Process deployment job
   */
  private async processDeployment(job: Job<DeploymentJobData>): Promise<{
    success: boolean;
    url?: string;
    error?: string;
    duration: number;
  }> {
    const startTime = Date.now();
    const { portfolioId, deploymentId, userId, templateId, forceRebuild } = job.data;

    try {
      // Update job progress
      await job.updateProgress(10);
      await job.log(`Starting deployment for portfolio ${portfolioId}`);

      // Update deployment status to BUILDING
      await db.updateDeploymentStatus(deploymentId, 'BUILDING');
      await job.log('Status updated to BUILDING');

      // Get portfolio data
      await job.updateProgress(20);
      const portfolio = await db.getPortfolioWithTemplate(portfolioId);
      if (!portfolio) {
        throw new Error(`Portfolio ${portfolioId} not found`);
      }
      await job.log('Portfolio data fetched');

      // Get portfolio media
      await job.updateProgress(30);
      const media = await db.getPortfolioMedia(portfolioId);
      await job.log(`Found ${media.length} media items`);

      // Build portfolio HTML/CSS/JS
      await job.updateProgress(40);
      await job.log('Building portfolio files...');
      const files = await this.buildPortfolio(portfolio, media);
      await job.log(`Built ${Object.keys(files).length} files`);

      // Update deployment status to DEPLOYING
      await db.updateDeploymentStatus(deploymentId, 'DEPLOYING');
      await job.log('Status updated to DEPLOYING');

      // Upload to storage
      await job.updateProgress(60);
      await job.log('Uploading to storage...');
      const { mainUrl, urls } = await storageService.uploadPortfolio(portfolioId, files);
      await job.log(`Uploaded to ${mainUrl}`);

      // Invalidate CDN cache
      await job.updateProgress(80);
      await job.log('Invalidating CDN cache...');
      await cdnService.invalidatePortfolio(portfolioId);
      await job.log('CDN cache invalidated');

      // Update deployment status to DEPLOYED
      await job.updateProgress(90);
      const duration = Math.floor((Date.now() - startTime) / 1000);
      await db.completeDeployment(deploymentId, true, mainUrl, undefined, duration);
      await job.log('Deployment completed successfully');

      // Update portfolio
      await db.client
        .from('portfolios')
        .update({
          deployed_url: mainUrl,
          last_deployed_at: new Date().toISOString(),
        })
        .eq('id', portfolioId);

      await job.updateProgress(100);

      return {
        success: true,
        url: mainUrl,
        duration,
      };
    } catch (error) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await job.log(`Deployment failed: ${errorMessage}`);

      // Update deployment status to FAILED
      try {
        await db.completeDeployment(deploymentId, false, undefined, errorMessage, duration);
      } catch (dbError) {
        await job.log(`Failed to update deployment status: ${dbError}`);
      }

      return {
        success: false,
        error: errorMessage,
        duration,
      };
    }
  }

  /**
   * Build portfolio files from template and data
   */
  private async buildPortfolio(
    portfolio: any,
    media: any[]
  ): Promise<Record<string, string>> {
    const template = portfolio.template;

    if (!template) {
      throw new Error('Portfolio template not found');
    }

    // Prepare template data
    const templateData = {
      ...portfolio.data,
      media: media.map((m) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        caption: m.caption,
        width: m.width,
        height: m.height,
      })),
      seo: {
        title: portfolio.meta_title || portfolio.name,
        description: portfolio.meta_description || portfolio.description,
        ogImage: portfolio.og_image,
      },
      portfolio: {
        id: portfolio.id,
        name: portfolio.name,
        slug: portfolio.slug,
        subdomain: portfolio.subdomain,
        tagline: portfolio.tagline,
        location: portfolio.location,
        availabilityStatus: portfolio.availability_status,
      },
    };

    // Render HTML template with Handlebars
    const html = this.renderTemplate(template.html_template, templateData);

    // Process CSS template
    const css = this.renderTemplate(template.css_template, templateData);

    // Process JS template
    const js = this.renderTemplate(template.js_template, templateData);

    // Generate 404 page
    const html404 = this.generate404Page(portfolio.name);

    return {
      'index.html': html,
      'style.css': css,
      'script.js': js,
      '404.html': html404,
    };
  }

  /**
   * Simple template rendering (replace with Handlebars in production)
   */
  private renderTemplate(template: string, data: any): string {
    // In production, use Handlebars:
    // import Handlebars from 'handlebars';
    // const compiledTemplate = Handlebars.compile(template);
    // return compiledTemplate(data);

    // Simple placeholder replacement for now
    let rendered = template;

    // Replace {{variable}} syntax
    rendered = rendered.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getNestedValue(data, path);
      return value !== undefined ? String(value) : match;
    });

    // Replace {{{variable}}} for unescaped HTML
    rendered = rendered.replace(/\{\{\{(\w+(?:\.\w+)*)\}\}\}/g, (match, path) => {
      const value = this.getNestedValue(data, path);
      return value !== undefined ? String(value) : match;
    });

    return rendered;
  }

  /**
   * Get nested object value by path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Generate 404 error page
   */
  private generate404Page(portfolioName: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found | ${portfolioName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 20px;
    }
    .container {
      max-width: 600px;
    }
    h1 {
      font-size: 120px;
      font-weight: 700;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    h2 {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    p {
      font-size: 18px;
      margin-bottom: 30px;
      opacity: 0.9;
    }
    a {
      display: inline-block;
      padding: 12px 30px;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    a:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you're looking for doesn't exist or has been moved.</p>
    <a href="/">Go to Homepage</a>
  </div>
</body>
</html>`;
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.worker.on('completed', (job, result) => {
      console.log(`✓ Deployment job ${job.id} completed:`, result);
    });

    this.worker.on('failed', (job, error) => {
      console.error(`✗ Deployment job ${job?.id} failed:`, error.message);
    });

    this.worker.on('progress', (job, progress) => {
      console.log(`→ Deployment job ${job.id} progress: ${progress}%`);
    });

    this.worker.on('error', (error) => {
      console.error('Deployment worker error:', error);
    });

    this.worker.on('stalled', (jobId) => {
      console.warn(`⚠ Deployment job ${jobId} stalled`);
    });
  }

  /**
   * Get worker instance
   */
  getWorker(): Worker<DeploymentJobData> {
    return this.worker;
  }

  /**
   * Close worker
   */
  async close(): Promise<void> {
    await this.worker.close();
  }
}

/**
 * Create and export deployment processor instance
 */
export const deploymentProcessor = new DeploymentProcessor(
  parseInt(process.env.DEPLOYMENT_CONCURRENCY || '5')
);
