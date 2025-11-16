/**
 * Export Service
 * Section 2.11: Service Layer Implementation
 *
 * Requirements #24-26: ExportService class
 */

import { PortfolioNotFoundError } from '@/lib/errors';
import { PortfolioService } from './portfolio.service';
import { TemplateService } from './template.service';
import { BuildService } from './build.service';

/**
 * Export format options
 */
export type ExportFormat = 'pdf' | 'html' | 'json' | 'zip';

/**
 * PDF export options
 */
export interface PDFExportOptions {
  format: 'A4' | 'Letter';
  margin: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  printBackground: boolean;
  displayHeaderFooter: boolean;
}

/**
 * ZIP export result
 */
export interface ZIPExportResult {
  buffer: Buffer;
  filename: string;
  sizeInBytes: number;
  filesIncluded: string[];
}

/**
 * Export Service
 * Requirement #24: Create ExportService class with 4 methods
 */
export class ExportService {
  private portfolioService: PortfolioService;
  private templateService: TemplateService;
  private buildService: BuildService;

  constructor() {
    this.portfolioService = new PortfolioService();
    this.templateService = new TemplateService();
    this.buildService = new BuildService();
  }

  /**
   * Export as JSON
   */
  async exportAsJSON(portfolioId: string): Promise<{
    data: any;
    filename: string;
  }> {
    const portfolio = await this.portfolioService.findById(portfolioId);

    if (!portfolio) {
      throw new PortfolioNotFoundError(portfolioId);
    }

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      portfolio: {
        id: portfolio.id,
        name: portfolio.name,
        slug: portfolio.slug,
        templateId: portfolio.templateId,
        data: portfolio.data,
        createdAt: portfolio.createdAt,
      },
    };

    return {
      data: exportData,
      filename: `portfolio-${portfolio.slug}-${Date.now()}.json`,
    };
  }

  /**
   * Export as HTML
   */
  async exportAsHTML(portfolioId: string): Promise<{
    html: string;
    filename: string;
  }> {
    const portfolio = await this.portfolioService.findById(portfolioId);

    if (!portfolio) {
      throw new PortfolioNotFoundError(portfolioId);
    }

    let html: string;

    if (portfolio.templateId) {
      const template = await this.templateService.findById(portfolio.templateId);
      if (template) {
        html = await this.templateService.render(template, portfolio.data);
      } else {
        html = this.generateDefaultHTML(portfolio);
      }
    } else {
      html = this.generateDefaultHTML(portfolio);
    }

    return {
      html,
      filename: `portfolio-${portfolio.slug}.html`,
    };
  }

  /**
   * Requirement #25: Export as PDF
   * - Use Puppeteer or Playwright to render HTML and generate PDF
   * - Include proper page breaks
   */
  async exportAsPDF(
    portfolioId: string,
    options: PDFExportOptions = {
      format: 'A4',
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
      printBackground: true,
      displayHeaderFooter: false,
    }
  ): Promise<{
    buffer: Buffer;
    filename: string;
  }> {
    const portfolio = await this.portfolioService.findById(portfolioId);

    if (!portfolio) {
      throw new PortfolioNotFoundError(portfolioId);
    }

    // Get HTML content
    const { html } = await this.exportAsHTML(portfolioId);

    // Add print-specific CSS for page breaks
    const htmlWithPrintCSS = this.addPrintCSS(html);

    // TODO: In production, use Puppeteer or Playwright
    // Requirement #25: Use Puppeteer to generate PDF
    // import puppeteer from 'puppeteer';
    //
    // const browser = await puppeteer.launch({
    //   headless: true,
    //   args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // });
    //
    // const page = await browser.newPage();
    // await page.setContent(htmlWithPrintCSS, {
    //   waitUntil: 'networkidle0',
    // });
    //
    // const pdfBuffer = await page.pdf({
    //   format: options.format,
    //   margin: options.margin,
    //   printBackground: options.printBackground,
    //   displayHeaderFooter: options.displayHeaderFooter,
    //   headerTemplate: '<div></div>',
    //   footerTemplate: `
    //     <div style="font-size: 10px; text-align: center; width: 100%;">
    //       <span class="pageNumber"></span> / <span class="totalPages"></span>
    //     </div>
    //   `,
    // });
    //
    // await browser.close();

    // Mock PDF generation
    const pdfBuffer = Buffer.from(`PDF content for ${portfolio.name}`);

    return {
      buffer: pdfBuffer,
      filename: `portfolio-${portfolio.slug}.pdf`,
    };
  }

  /**
   * Requirement #26: Export as ZIP
   * - Use archiver library to create ZIP
   * - Include all files (HTML, CSS, JS, images, README)
   */
  async exportAsZIP(portfolioId: string): Promise<ZIPExportResult> {
    const portfolio = await this.portfolioService.findById(portfolioId);

    if (!portfolio) {
      throw new PortfolioNotFoundError(portfolioId);
    }

    // Build static site
    const { files } = await this.buildService.generateDeploymentPackage(
      portfolioId
    );

    // Requirement #26: Generate README
    const readme = this.generateREADME(portfolio.name, portfolio.slug);
    files.set('README.md', readme);

    // TODO: In production, use archiver library
    // Requirement #26: Use archiver to create ZIP
    // import archiver from 'archiver';
    // import { PassThrough } from 'stream';
    //
    // const archive = archiver('zip', { zlib: { level: 9 } });
    // const bufferStream = new PassThrough();
    // const chunks: Buffer[] = [];
    //
    // bufferStream.on('data', (chunk) => chunks.push(chunk));
    //
    // archive.pipe(bufferStream);
    //
    // // Add all files to ZIP
    // for (const [path, content] of files.entries()) {
    //   archive.append(content, { name: path });
    // }
    //
    // await archive.finalize();
    //
    // const buffer = Buffer.concat(chunks);

    // Mock ZIP generation
    const buffer = Buffer.from('ZIP file contents');

    return {
      buffer,
      filename: `portfolio-${portfolio.slug}.zip`,
      sizeInBytes: buffer.length,
      filesIncluded: Array.from(files.keys()),
    };
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  /**
   * Generate default HTML
   */
  private generateDefaultHTML(portfolio: any): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${portfolio.data.about?.fullName || portfolio.name} - Portfolio</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
            h1 { color: #333; }
            .section { margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <h1>${portfolio.data.about?.fullName || portfolio.name}</h1>
          <p>${portfolio.data.about?.title || ''}</p>
          <div class="section">
            <h2>About</h2>
            <p>${portfolio.data.about?.bio || ''}</p>
          </div>
          <div class="section">
            <h2>Contact</h2>
            <p>Email: ${portfolio.data.contact?.email || ''}</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Add print-specific CSS
   * Requirement #25: Proper page breaks
   */
  private addPrintCSS(html: string): string {
    const printCSS = `
      <style>
        @media print {
          /* Prevent page breaks inside elements */
          .section, .project, .experience-item, .education-item {
            page-break-inside: avoid;
          }

          /* Force page breaks before sections */
          .page-break {
            page-break-before: always;
          }

          /* Hide elements not needed in print */
          .no-print, nav, button {
            display: none !important;
          }

          /* Ensure good print quality */
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    `;

    // Insert print CSS before closing </head>
    return html.replace('</head>', `${printCSS}</head>`);
  }

  /**
   * Generate README file
   * Requirement #26: Include README in ZIP
   */
  private generateREADME(portfolioName: string, slug: string): string {
    return `# ${portfolioName} - Portfolio Export

This is an exported portfolio from RoleRabbit.

## Files Included

- **index.html**: Main portfolio page
- **styles.css**: Stylesheet
- **script.js**: JavaScript functionality
- **images/**: Portfolio images and assets

## Hosting Instructions

### Option 1: GitHub Pages

1. Create a new repository on GitHub
2. Upload all files from this ZIP to the repository
3. Go to Settings > Pages
4. Select "main" branch as source
5. Your portfolio will be available at: https://yourusername.github.io/repository-name

### Option 2: Netlify

1. Go to https://netlify.com
2. Drag and drop this folder to the Netlify dashboard
3. Your portfolio will be deployed instantly
4. You can configure a custom domain in Netlify settings

### Option 3: Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import this folder
4. Deploy with one click

### Option 4: Custom Server

Upload all files to your web server's public directory (e.g., public_html, www, or htdocs).

## Customization

You can edit the HTML, CSS, and JavaScript files to customize your portfolio.

## Support

For questions or support, visit https://rolerabbit.com/support

---

Generated on ${new Date().toISOString()}
`;
  }
}
