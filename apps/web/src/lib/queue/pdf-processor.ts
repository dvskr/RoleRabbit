/**
 * PDF Generation Job Processor (Section 4.4)
 *
 * Processes PDF generation jobs from the queue
 */

import { Worker, Job, WorkerOptions } from 'bullmq';
import { createRedisConnection, PDFJobData } from './queues';
import { db } from '../../database/client';
import { storageService } from '../storage/storage-service';

/**
 * PDF processor class
 */
export class PDFProcessor {
  private worker: Worker<PDFJobData>;
  private concurrency: number;

  constructor(concurrency: number = 10) {
    this.concurrency = concurrency;
    this.worker = this.createWorker();
    this.setupEventHandlers();
  }

  /**
   * Create BullMQ worker
   */
  private createWorker(): Worker<PDFJobData> {
    const connection = createRedisConnection();

    const workerOptions: WorkerOptions = {
      connection,
      concurrency: this.concurrency,
      lockDuration: 60000, // 1 minute lock
      maxStalledCount: 2,
      stalledInterval: 30000,
    };

    return new Worker<PDFJobData>(
      'pdf-generation',
      async (job: Job<PDFJobData>) => {
        return this.processPDF(job);
      },
      workerOptions
    );
  }

  /**
   * Process PDF generation job
   */
  private async processPDF(job: Job<PDFJobData>): Promise<{
    success: boolean;
    url?: string;
    error?: string;
    size?: number;
  }> {
    const { portfolioId, userId, format, includeAnalytics, watermark } = job.data;

    try {
      await job.updateProgress(10);
      await job.log(`Starting PDF generation for portfolio ${portfolioId}`);

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

      // Get analytics if requested
      let analyticsData = null;
      if (includeAnalytics) {
        await job.updateProgress(40);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Last 30 days

        analyticsData = await db.getAnalyticsSummary(
          portfolioId,
          startDate,
          endDate
        );
        await job.log('Analytics data fetched');
      }

      // Generate PDF
      await job.updateProgress(60);
      await job.log('Generating PDF...');
      const pdfBuffer = await this.generatePDF(portfolio, media, {
        format: format || 'A4',
        includeAnalytics: includeAnalytics || false,
        analyticsData,
        watermark: watermark || false,
      });
      await job.log(`PDF generated (${pdfBuffer.length} bytes)`);

      // Upload to storage
      await job.updateProgress(80);
      const filename = `${portfolioId}/portfolio-${Date.now()}.pdf`;
      const result = await storageService.uploadFile(filename, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: 'private, max-age=3600',
        isPublic: false, // PDFs are private by default
      });
      await job.log(`PDF uploaded to ${result.url}`);

      await job.updateProgress(100);

      return {
        success: true,
        url: result.url,
        size: pdfBuffer.length,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await job.log(`PDF generation failed: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Generate PDF from portfolio data
   *
   * NOTE: This is a simplified implementation. In production, use:
   * - Puppeteer for HTML to PDF conversion
   * - PDFKit for programmatic PDF generation
   * - Gotenberg for microservice-based PDF generation
   */
  private async generatePDF(
    portfolio: any,
    media: any[],
    options: {
      format: 'A4' | 'Letter';
      includeAnalytics: boolean;
      analyticsData?: any;
      watermark: boolean;
    }
  ): Promise<Buffer> {
    // Production implementation would use Puppeteer:
    /*
    import puppeteer from 'puppeteer';

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Render portfolio HTML
    const html = this.renderPortfolioHTML(portfolio, media, options);
    await page.setContent(html);

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: options.format,
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
    */

    // Mock PDF generation for now
    const mockPDF = this.generateMockPDF(portfolio, media, options);
    return Buffer.from(mockPDF, 'utf-8');
  }

  /**
   * Generate mock PDF content
   */
  private generateMockPDF(
    portfolio: any,
    media: any[],
    options: {
      format: 'A4' | 'Letter';
      includeAnalytics: boolean;
      analyticsData?: any;
      watermark: boolean;
    }
  ): string {
    // In production, this would be a real PDF buffer
    return `%PDF-1.4
%Mock PDF Document
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 ${options.format === 'A4' ? '595 842' : '612 792'}]
  /Contents 4 0 R
>>
endobj
4 0 obj
<< /Length 100 >>
stream
BT
/F1 24 Tf
100 700 Td
(${portfolio.name}) Tj
ET
endstream
endobj
trailer
<< /Size 5 /Root 1 0 R >>
%%EOF`;
  }

  /**
   * Render portfolio HTML for PDF conversion
   */
  private renderPortfolioHTML(
    portfolio: any,
    media: any[],
    options: {
      includeAnalytics: boolean;
      analyticsData?: any;
      watermark: boolean;
    }
  ): string {
    const data = portfolio.data || {};
    const about = data.about || {};
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${portfolio.name} - Portfolio</title>
  <style>
    @page {
      size: ${options.format === 'A4' ? 'A4' : 'Letter'};
      margin: 20mm 15mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Georgia', serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      font-size: 28pt;
      margin-bottom: 10pt;
      color: #2563eb;
    }
    h2 {
      font-size: 16pt;
      margin-top: 20pt;
      margin-bottom: 10pt;
      color: #1e40af;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 5pt;
    }
    h3 {
      font-size: 13pt;
      margin-top: 12pt;
      margin-bottom: 6pt;
    }
    p {
      margin-bottom: 8pt;
    }
    .header {
      text-align: center;
      margin-bottom: 30pt;
    }
    .tagline {
      font-size: 13pt;
      color: #6b7280;
      margin-top: 8pt;
    }
    .contact {
      font-size: 10pt;
      color: #6b7280;
      margin-top: 8pt;
    }
    .section {
      margin-bottom: 20pt;
      page-break-inside: avoid;
    }
    .experience-item, .education-item, .project-item {
      margin-bottom: 15pt;
      page-break-inside: avoid;
    }
    .date {
      color: #6b7280;
      font-size: 10pt;
    }
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10pt;
      margin-top: 10pt;
    }
    .skill {
      background: #f3f4f6;
      padding: 6pt 10pt;
      border-radius: 4pt;
      font-size: 10pt;
    }
    .watermark {
      position: fixed;
      bottom: 10mm;
      right: 10mm;
      opacity: 0.3;
      font-size: 9pt;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${portfolio.name}</h1>
    ${portfolio.tagline ? `<p class="tagline">${portfolio.tagline}</p>` : ''}
    <p class="contact">
      ${portfolio.location ? portfolio.location + ' • ' : ''}
      ${about.email || ''}
      ${about.phone ? ' • ' + about.phone : ''}
    </p>
  </div>

  ${about.bio ? `
  <div class="section">
    <h2>About</h2>
    <p>${about.bio}</p>
  </div>
  ` : ''}

  ${experience.length > 0 ? `
  <div class="section">
    <h2>Experience</h2>
    ${experience.map((exp: any) => `
    <div class="experience-item">
      <h3>${exp.title || exp.position}</h3>
      <p><strong>${exp.company}</strong> • ${exp.location || ''}</p>
      <p class="date">${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}</p>
      ${exp.description ? `<p>${exp.description}</p>` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${education.length > 0 ? `
  <div class="section">
    <h2>Education</h2>
    ${education.map((edu: any) => `
    <div class="education-item">
      <h3>${edu.degree}</h3>
      <p><strong>${edu.institution}</strong> • ${edu.location || ''}</p>
      <p class="date">${edu.startDate || ''} - ${edu.endDate || ''}</p>
      ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${skills.length > 0 ? `
  <div class="section">
    <h2>Skills</h2>
    <div class="skills-grid">
      ${skills.map((skill: any) => `
      <div class="skill">${typeof skill === 'string' ? skill : skill.name}</div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${projects.length > 0 ? `
  <div class="section">
    <h2>Projects</h2>
    ${projects.map((project: any) => `
    <div class="project-item">
      <h3>${project.name || project.title}</h3>
      ${project.description ? `<p>${project.description}</p>` : ''}
      ${project.technologies ? `<p><strong>Technologies:</strong> ${project.technologies.join(', ')}</p>` : ''}
      ${project.url ? `<p><strong>URL:</strong> ${project.url}</p>` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${options.includeAnalytics && options.analyticsData ? `
  <div class="section">
    <h2>Portfolio Analytics</h2>
    <p>Total Views: ${options.analyticsData.totalViews || 0}</p>
    <p>Unique Visitors: ${options.analyticsData.totalUniqueVisitors || 0}</p>
    <p>Average Time on Page: ${Math.round(options.analyticsData.avgTimeOnPage || 0)}s</p>
  </div>
  ` : ''}

  ${options.watermark ? `
  <div class="watermark">Generated by RoleRabbit • ${new Date().toLocaleDateString()}</div>
  ` : ''}
</body>
</html>`;
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.worker.on('completed', (job, result) => {
      console.log(`✓ PDF job ${job.id} completed:`, result);
    });

    this.worker.on('failed', (job, error) => {
      console.error(`✗ PDF job ${job?.id} failed:`, error.message);
    });

    this.worker.on('progress', (job, progress) => {
      console.log(`→ PDF job ${job.id} progress: ${progress}%`);
    });

    this.worker.on('error', (error) => {
      console.error('PDF worker error:', error);
    });
  }

  /**
   * Get worker instance
   */
  getWorker(): Worker<PDFJobData> {
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
 * Create and export PDF processor instance
 */
export const pdfProcessor = new PDFProcessor(
  parseInt(process.env.PDF_CONCURRENCY || '10')
);
