/**
 * Portfolio PDF Export API Route
 * Section 2.3: Data Import/Export Endpoints
 *
 * GET /api/portfolios/:id/export/pdf - Generate PDF using headless browser
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

// ============================================================================
// MOCK DATABASE
// ============================================================================

const portfolios: Portfolio[] = [];

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
 * Generate PDF using headless browser (Puppeteer or Playwright)
 * Requirement #13: Generate PDF using headless browser
 */
async function generatePDF(htmlContent: string, slug: string): Promise<Buffer> {
  // TODO: In production, use Puppeteer or Playwright
  // Example with Puppeteer:
  // const puppeteer = require('puppeteer');
  // const browser = await puppeteer.launch({ headless: true });
  // const page = await browser.newPage();
  // await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  // const pdf = await page.pdf({
  //   format: 'A4',
  //   printBackground: true,
  //   margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
  // });
  // await browser.close();
  // return Buffer.from(pdf);

  // For now, return mock PDF content
  const mockPdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Portfolio: ${slug}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
0000000308 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
406
%%EOF`;

  return Buffer.from(mockPdfContent);
}

/**
 * Render HTML from portfolio (reuse logic from html export)
 */
async function renderPortfolioHTML(portfolio: Portfolio): Promise<string> {
  // This would call the same rendering logic as HTML export
  // For simplicity, return mock HTML
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${portfolio.name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>${portfolio.name}</h1>
  <p>${portfolio.data?.about?.bio || 'No bio available'}</p>
</body>
</html>
  `;
}

// ============================================================================
// GET /api/portfolios/:id/export/pdf
// Requirements #13-14: Generate PDF with proper headers
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

    // Verify access
    if (!canAccessPortfolio(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this portfolio' },
        { status: 403 }
      );
    }

    // Render HTML
    const htmlContent = await renderPortfolioHTML(portfolio);

    // Generate PDF
    const pdfBuffer = await generatePDF(htmlContent, portfolio.slug);

    // Requirement #14: Set response headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="portfolio-${portfolio.slug}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'X-Portfolio-Id': portfolio.id,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
