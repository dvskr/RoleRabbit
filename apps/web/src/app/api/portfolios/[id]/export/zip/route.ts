/**
 * Portfolio ZIP Export API Route
 * Section 2.3: Data Import/Export Endpoints
 *
 * GET /api/portfolios/:id/export/zip - Generate ZIP with HTML, CSS, JS, images
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

interface Portfolio {
  id: string;
  userId: string;
  slug: string;
  name: string;
  data: any;
  templateId: string;
  isPublished: boolean;
  visibility: string;
}

interface PortfolioTemplate {
  id: string;
  name: string;
  htmlTemplate: string | null;
  cssTemplate: string | null;
  jsTemplate: string | null;
}

// ============================================================================
// MOCK DATABASE
// ============================================================================

const portfolios: Portfolio[] = [];
const templates: PortfolioTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Modern Developer',
    htmlTemplate: '<!DOCTYPE html>...',
    cssTemplate: 'body { font-family: Inter; }',
    jsTemplate: 'console.log("Portfolio loaded");',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCurrentUserId(request: NextRequest): string {
  const authHeader = request.headers.get('authorization');
  return authHeader?.replace('Bearer ', '') || 'anonymous';
}

function canAccessPortfolio(portfolio: Portfolio, userId: string): boolean {
  if (portfolio.userId === userId) return true;
  if (portfolio.visibility === 'PUBLIC' && portfolio.isPublished) return true;
  return false;
}

/**
 * Generate README with hosting instructions
 * Requirement #17: Include README.txt with hosting instructions
 */
function generateREADME(portfolioName: string, slug: string): string {
  return `# ${portfolioName} - Portfolio Export

This is an exported portfolio from RoleRabbit.

## Hosting Instructions

### Option 1: GitHub Pages

1. Create a new repository on GitHub
2. Upload all files from this ZIP to the repository
3. Go to Settings > Pages
4. Select "main" branch as source
5. Your portfolio will be live at: https://your-username.github.io/repository-name

### Option 2: Netlify

1. Drag and drop this entire folder to https://app.netlify.com/drop
2. Your portfolio will be instantly deployed
3. You can configure a custom domain in Netlify settings

### Option 3: Vercel

1. Install Vercel CLI: npm i -g vercel
2. Navigate to this folder in terminal
3. Run: vercel
4. Follow the prompts to deploy

### Option 4: Static Hosting (Cloudflare Pages, Surge, etc.)

Simply upload the contents of this folder to any static hosting provider.

## Files Included

- index.html - Main HTML file
- styles.css - Stylesheet
- script.js - JavaScript (optional)
- README.txt - This file

## Local Development

To view locally, simply open index.html in your browser.

For a local server:
1. Install http-server: npm i -g http-server
2. Run: http-server
3. Visit: http://localhost:8080

## Customization

You can edit any of the files directly:
- index.html - Structure and content
- styles.css - Styling and colors
- script.js - Interactive features

---

Generated on: ${new Date().toISOString()}
Portfolio ID: ${slug}
`;
}

/**
 * Create ZIP file
 * Requirement #16: Generate ZIP using archiver or jszip
 */
async function createZIP(files: { name: string; content: string }[]): Promise<Buffer> {
  // TODO: In production, use JSZip or archiver
  // Example with JSZip:
  // const JSZip = require('jszip');
  // const zip = new JSZip();
  // files.forEach(file => zip.file(file.name, file.content));
  // const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  // return zipBuffer;

  // For now, return mock ZIP content (PK header for ZIP files)
  const mockZipContent = `PK\x03\x04\x14\x00\x00\x00\x08\x00\x00\x00!\x00
Mock ZIP file containing:
${files.map((f) => `- ${f.name}`).join('\n')}

This is a placeholder. In production, use JSZip or archiver library.
PK\x05\x06\x00\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00`;

  return Buffer.from(mockZipContent);
}

/**
 * Render HTML from template and portfolio data
 */
function renderHTML(template: PortfolioTemplate, portfolio: Portfolio): string {
  // Simple template rendering (in production, use Handlebars or similar)
  let html = template.htmlTemplate || '';

  // Replace variables
  html = html.replace(/\{\{name\}\}/g, portfolio.name);
  html = html.replace(/\{\{slug\}\}/g, portfolio.slug);

  // Add CSS and JS
  if (template.cssTemplate) {
    html = html.replace('{{styles}}', template.cssTemplate);
  }

  if (template.jsTemplate) {
    html = html.replace('{{scripts}}', template.jsTemplate);
  }

  return html;
}

// ============================================================================
// GET /api/portfolios/:id/export/zip
// Requirements #16-18: Generate ZIP with all assets
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId } = params;

    // Find portfolio
    const portfolio = portfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Requirement #18: Verify access
    if (!canAccessPortfolio(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this portfolio' },
        { status: 403 }
      );
    }

    // Get template
    const template = templates.find((t) => t.id === portfolio.templateId);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 500 }
      );
    }

    // Generate files
    const htmlContent = renderHTML(template, portfolio);
    const cssContent = template.cssTemplate || '';
    const jsContent = template.jsTemplate || '';
    const readmeContent = generateREADME(portfolio.name, portfolio.slug);

    // Prepare files for ZIP
    const files = [
      { name: 'index.html', content: htmlContent },
      { name: 'styles.css', content: cssContent },
      { name: 'script.js', content: jsContent },
      { name: 'README.txt', content: readmeContent },
      {
        name: 'data.json',
        content: JSON.stringify(portfolio.data, null, 2),
      },
    ];

    // Create ZIP
    const zipBuffer = await createZIP(files);

    // Return ZIP
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="portfolio-${portfolio.slug}.zip"`,
        'Content-Length': zipBuffer.length.toString(),
        'X-Portfolio-Id': portfolio.id,
      },
    });

  } catch (error) {
    console.error('Error generating ZIP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
