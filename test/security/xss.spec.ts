/**
 * Security Test: XSS Vulnerabilities (Section 5.7)
 *
 * Tests for Cross-Site Scripting in all text inputs
 */

import { test, expect } from '@playwright/test';

const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  '<svg onload=alert("XSS")>',
  'javascript:alert("XSS")',
  '<iframe src="javascript:alert(\'XSS\')">',
  '<body onload=alert("XSS")>',
  '<input onfocus=alert("XSS") autofocus>',
  '<select onfocus=alert("XSS") autofocus>',
  '<textarea onfocus=alert("XSS") autofocus>',
  '<button onclick=alert("XSS")>Click</button>',
  '<a href="javascript:alert(\'XSS\')">Link</a>',
  '<div style="background:url(javascript:alert(\'XSS\'))">',
  '"><script>alert("XSS")</script>',
  '\'-alert("XSS")-\'',
  '<scr<script>ipt>alert("XSS")</script>',
];

test.describe('XSS Prevention Tests', () => {
  test('should sanitize XSS in portfolio title', async ({ page, request }) => {
    for (const payload of XSS_PAYLOADS) {
      const response = await request.post('/api/portfolios', {
        data: {
          title: payload,
          templateId: 'template-1',
        },
      });

      if (response.ok()) {
        const body = await response.json();
        const portfolioId = body.portfolio.id;

        // Visit the portfolio page
        await page.goto(`/portfolios/${portfolioId}`);

        // Check that script doesn't execute
        const alerts = [];
        page.on('dialog', dialog => {
          alerts.push(dialog.message());
          dialog.dismiss();
        });

        await page.waitForTimeout(1000);

        // No alerts should have fired
        expect(alerts).toHaveLength(0);

        // HTML should be escaped
        const titleElement = await page.locator('h1').first();
        const titleHTML = await titleElement.innerHTML();

        // Should not contain raw script tags
        expect(titleHTML).not.toContain('<script>');
        expect(titleHTML).not.toContain('onerror=');
        expect(titleHTML).not.toContain('javascript:');

        // Should contain escaped HTML
        if (payload.includes('<script>')) {
          expect(titleHTML).toContain('&lt;script&gt;');
        }
      }
    }
  });

  test('should sanitize XSS in section content', async ({ page, request }) => {
    const payload = '<img src=x onerror=alert("XSS in section")>';

    const response = await request.post('/api/portfolios', {
      data: {
        title: 'Test Portfolio',
        templateId: 'template-1',
        sections: [
          {
            type: 'about',
            content: {
              text: payload,
            },
          },
        ],
      },
    });

    if (response.ok()) {
      const body = await response.json();

      await page.goto(`/portfolios/${body.portfolio.id}`);

      const alerts = [];
      page.on('dialog', dialog => {
        alerts.push(dialog.message());
        dialog.dismiss();
      });

      await page.waitForTimeout(1000);
      expect(alerts).toHaveLength(0);
    }
  });

  test('should sanitize XSS in URLs', async ({ page, request }) => {
    const maliciousUrls = [
      'javascript:alert("XSS")',
      'data:text/html,<script>alert("XSS")</script>',
      'vbscript:alert("XSS")',
    ];

    for (const url of maliciousUrls) {
      const response = await request.post('/api/portfolios', {
        data: {
          title: 'Test',
          templateId: 'template-1',
          sections: [
            {
              type: 'contact',
              content: {
                website: url,
              },
            },
          ],
        },
      });

      if (response.ok()) {
        const body = await response.json();

        await page.goto(`/portfolios/${body.portfolio.id}`);

        // Check that malicious URL is not used
        const links = await page.locator('a').all();

        for (const link of links) {
          const href = await link.getAttribute('href');

          if (href) {
            expect(href).not.toContain('javascript:');
            expect(href).not.toContain('vbscript:');
            expect(href).not.toContain('data:text/html');
          }
        }
      }
    }
  });

  test('should sanitize XSS in custom HTML (if allowed)', async ({ page, request }) => {
    const payload = '<div><script>alert("XSS")</script>Safe content</div>';

    const response = await request.post('/api/portfolios', {
      data: {
        title: 'Test',
        templateId: 'template-1',
        sections: [
          {
            type: 'custom-html',
            content: {
              html: payload,
            },
          },
        ],
      },
    });

    if (response.ok()) {
      const body = await response.json();

      await page.goto(`/portfolios/${body.portfolio.id}`);

      const alerts = [];
      page.on('dialog', dialog => {
        alerts.push(dialog.message());
        dialog.dismiss();
      });

      await page.waitForTimeout(1000);
      expect(alerts).toHaveLength(0);

      // Should contain safe content but no script
      await expect(page.locator('text=Safe content')).toBeVisible();
    }
  });

  test('should set Content-Security-Policy headers', async ({ page }) => {
    const response = await page.goto('/');

    const cspHeader = response?.headers()['content-security-policy'];

    // Should have CSP header
    expect(cspHeader).toBeTruthy();

    // Should restrict script sources
    expect(cspHeader).toContain("script-src 'self'");

    // Should prevent inline scripts (or use nonce/hash)
    expect(cspHeader).toMatch(/'self'|'nonce-|'sha256-/);
  });

  test('should escape user content in JSON responses', async ({ request }) => {
    const payload = '<script>alert("XSS")</script>';

    const response = await request.post('/api/portfolios', {
      data: {
        title: payload,
        templateId: 'template-1',
      },
    });

    const body = await response.text();

    // JSON should be properly escaped
    expect(body).not.toContain('<script>alert');

    // Should contain escaped version
    const json = JSON.parse(body);
    expect(json.portfolio.title).toBe(payload); // Stored as-is in JSON

    // But when rendered, it should be escaped
  });

  test('should sanitize markdown content if supported', async ({ page, request }) => {
    const maliciousMarkdown = `
# Title

[Click me](javascript:alert("XSS"))

![Image](x" onerror="alert('XSS'))

<script>alert("XSS")</script>
    `;

    const response = await request.post('/api/portfolios', {
      data: {
        title: 'Test',
        templateId: 'template-1',
        sections: [
          {
            type: 'about',
            content: {
              text: maliciousMarkdown,
            },
          },
        ],
      },
    });

    if (response.ok()) {
      const body = await response.json();

      await page.goto(`/portfolios/${body.portfolio.id}`);

      const alerts = [];
      page.on('dialog', dialog => {
        alerts.push(dialog.message());
        dialog.dismiss();
      });

      await page.waitForTimeout(1000);
      expect(alerts).toHaveLength(0);

      // Links should be sanitized
      const links = await page.locator('a').all();

      for (const link of links) {
        const href = await link.getAttribute('href');

        if (href) {
          expect(href).not.toContain('javascript:');
        }
      }
    }
  });
});
