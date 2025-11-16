/**
 * Test Helpers and Utilities
 *
 * Common utilities for testing
 */

import { Portfolio, PortfolioTemplate } from '@/types/portfolio';

/**
 * Create mock portfolio data
 */
export function createMockPortfolio(overrides?: Partial<Portfolio>): Portfolio {
  return {
    id: 'test-portfolio-id',
    userId: 'test-user-id',
    title: 'Test Portfolio',
    subtitle: 'Test Subtitle',
    description: 'Test Description',
    templateId: 'test-template-id',
    customDomain: null,
    subdomain: 'testportfolio',
    isPublished: true,
    settings: {
      theme: 'light',
      primaryColor: '#000000',
      fontFamily: 'Inter',
    },
    seo: {
      title: 'Test Portfolio',
      description: 'Test Description',
      keywords: ['test'],
      ogImage: null,
    },
    sections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    ...overrides,
  };
}

/**
 * Create mock portfolio template data
 */
export function createMockTemplate(overrides?: Partial<PortfolioTemplate>): PortfolioTemplate {
  return {
    id: 'test-template-id',
    name: 'Test Template',
    description: 'Test template description',
    category: 'professional',
    isPremium: false,
    previewUrl: 'https://example.com/preview.png',
    demoUrl: 'https://example.com/demo',
    structure: {
      sections: ['hero', 'about', 'projects'],
      layout: 'default',
    },
    styles: {
      colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
    },
    settings: {
      animation: true,
      darkMode: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Mock fetch response
 */
export function mockFetchResponse<T>(data: T, status = 200): void {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });
}

/**
 * Mock fetch error
 */
export function mockFetchError(message: string, status = 500): void {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status,
    statusText: message,
    json: async () => ({ error: message }),
    text: async () => JSON.stringify({ error: message }),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });
}

/**
 * Wait for async operations
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create mock HTML content
 */
export function createMockHTML(title: string = 'Test'): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body>
  <h1>${title}</h1>
  <p>Test content</p>
</body>
</html>
  `.trim();
}

/**
 * Create mock CSS content
 */
export function createMockCSS(): string {
  return `
body {
  margin: 0;
  font-family: Inter, sans-serif;
}

h1 {
  color: #000;
}
  `.trim();
}

/**
 * Create mock request with Next.js API route format
 */
export function createMockRequest(
  method: string,
  body?: any,
  headers?: Record<string, string>
): any {
  return {
    method,
    headers: headers || {},
    body,
    query: {},
    cookies: {},
  };
}

/**
 * Create mock response with Next.js API route format
 */
export function createMockResponse(): any {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  return res;
}
