/**
 * Portfolio HTML Export API Route
 * Section 2.3: Data Import/Export Endpoints
 *
 * GET /api/portfolios/:id/export/html - Export rendered HTML of portfolio
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
    htmlTemplate: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{name}} - Portfolio</title>
  <style>{{styles}}</style>
</head>
<body>
  <header class="hero">
    <h1>{{hero.title}}</h1>
    <p>{{hero.subtitle}}</p>
  </header>
  <section class="about">
    <h2>About Me</h2>
    <p>{{about.bio}}</p>
  </section>
  <section class="experience">
    <h2>Experience</h2>
    {{#each experience}}
    <div class="experience-item">
      <h3>{{this.role}} at {{this.company}}</h3>
      <p class="date">{{this.startDate}} - {{#if this.current}}Present{{else}}{{this.endDate}}{{/if}}</p>
      <p>{{this.description}}</p>
    </div>
    {{/each}}
  </section>
  <section class="projects">
    <h2>Projects</h2>
    {{#each projects}}
    <div class="project">
      <h3>{{this.name}}</h3>
      <p>{{this.description}}</p>
      <p class="tech">{{#each this.technologies}}{{this}}, {{/each}}</p>
    </div>
    {{/each}}
  </section>
  <section class="contact">
    <h2>Contact</h2>
    <p>Email: {{contact.email}}</p>
    {{#if contact.phone}}<p>Phone: {{contact.phone}}</p>{{/if}}
  </section>
  <script>{{scripts}}</script>
</body>
</html>
    `,
    cssTemplate: `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
      .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 20px; text-align: center; }
      .hero h1 { font-size: 3rem; margin-bottom: 10px; }
      .hero p { font-size: 1.5rem; }
      section { max-width: 1200px; margin: 0 auto; padding: 60px 20px; }
      h2 { font-size: 2rem; margin-bottom: 30px; color: #667eea; }
      .experience-item, .project { margin: 30px 0; padding: 20px; border-left: 4px solid #667eea; background: #f7fafc; }
      .experience-item h3, .project h3 { color: #2d3748; margin-bottom: 10px; }
      .date { color: #718096; font-size: 0.9rem; margin-bottom: 10px; }
      .tech { color: #667eea; font-size: 0.9rem; margin-top: 10px; }
      .contact { text-align: center; background: #f7fafc; }
      @media print { .hero { padding: 40px 20px; } section { padding: 30px 20px; } }
    `,
    jsTemplate: `console.log('Portfolio loaded');`,
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
  // Requirement #18: Verify ownership or public visibility
  if (portfolio.userId === userId) return true;
  if (portfolio.visibility === 'PUBLIC' && portfolio.isPublished) return true;
  return false;
}

/**
 * Simple template renderer
 */
function renderTemplate(template: string, data: any): string {
  let rendered = template;

  // Handle {{#if}} blocks
  const ifRegex = /\{\{#if\s+(\w+(?:\.\w+)?)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  rendered = rendered.replace(ifRegex, (match, path, blockContent) => {
    const value = path.split('.').reduce((obj: any, key: string) => obj?.[key], data);
    return value ? blockContent : '';
  });

  // Handle {{#each}} blocks
  const eachRegex = /\{\{#each\s+(\w+(?:\.\w+)?)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  rendered = rendered.replace(eachRegex, (match, path, blockContent) => {
    const array = path.split('.').reduce((obj: any, key: string) => obj?.[key], data);
    if (!Array.isArray(array)) return '';

    return array
      .map((item) => {
        let itemContent = blockContent;
        // Replace {{this.property}}
        itemContent = itemContent.replace(/\{\{this\.(\w+)\}\}/g, (_, prop) => {
          return item[prop] !== undefined && item[prop] !== null ? String(item[prop]) : '';
        });
        // Replace {{this}}
        itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));
        return itemContent;
      })
      .join('');
  });

  // Handle simple {{variable}} replacements
  rendered = rendered.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
    const value = path.split('.').reduce((obj: any, key: string) => obj?.[key], data);
    return value !== undefined && value !== null ? String(value) : '';
  });

  return rendered;
}

// ============================================================================
// GET /api/portfolios/:id/export/html
// Requirement #12: Export rendered HTML using selected template
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId } = params;

    // Find portfolio
    // TODO: Replace with actual database query
    const portfolio = portfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Requirement #18: Verify ownership or public visibility
    if (!canAccessPortfolio(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this portfolio' },
        { status: 403 }
      );
    }

    // Get template
    // TODO: Replace with actual database query
    const template = templates.find((t) => t.id === portfolio.templateId);

    if (!template || !template.htmlTemplate) {
      return NextResponse.json(
        { error: 'Template not found or has no HTML content' },
        { status: 500 }
      );
    }

    // Render HTML with portfolio data
    const renderedHtml = renderTemplate(template.htmlTemplate, {
      ...portfolio.data,
      name: portfolio.name,
      slug: portfolio.slug,
      styles: template.cssTemplate || '',
      scripts: template.jsTemplate || '',
    });

    // Return rendered HTML
    return new NextResponse(renderedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="portfolio-${portfolio.slug}.html"`,
        'X-Portfolio-Id': portfolio.id,
      },
    });

  } catch (error) {
    console.error('Error exporting HTML:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
