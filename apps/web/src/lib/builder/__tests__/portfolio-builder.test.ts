/**
 * Frontend Unit Tests: Portfolio Builder (Section 5.1)
 *
 * Tests for HTML generation, CSS generation, and ZIP creation
 */

import { PortfolioBuilder } from '../portfolio-builder';
import { createMockPortfolio, createMockTemplate } from '@/../test/utils/test-helpers';

describe('PortfolioBuilder', () => {
  let builder: PortfolioBuilder;

  beforeEach(() => {
    builder = new PortfolioBuilder();
  });

  describe('HTML generation', () => {
    it('should generate valid HTML structure', () => {
      const portfolio = createMockPortfolio({
        title: 'Test Portfolio',
        subtitle: 'Test Subtitle',
      });
      const template = createMockTemplate();

      const html = builder.generateHTML(portfolio, template);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</html>');
    });

    it('should include portfolio title in HTML', () => {
      const portfolio = createMockPortfolio({ title: 'My Amazing Portfolio' });
      const template = createMockTemplate();

      const html = builder.generateHTML(portfolio, template);

      expect(html).toContain('<title>My Amazing Portfolio</title>');
      expect(html).toContain('My Amazing Portfolio');
    });

    it('should include meta tags for SEO', () => {
      const portfolio = createMockPortfolio({
        seo: {
          title: 'SEO Title',
          description: 'SEO Description',
          keywords: ['portfolio', 'developer'],
          ogImage: 'https://example.com/og.png',
        },
      });
      const template = createMockTemplate();

      const html = builder.generateHTML(portfolio, template);

      expect(html).toContain('name="description"');
      expect(html).toContain('SEO Description');
      expect(html).toContain('property="og:title"');
      expect(html).toContain('property="og:image"');
      expect(html).toContain('https://example.com/og.png');
    });

    it('should escape HTML in user content', () => {
      const portfolio = createMockPortfolio({
        title: '<script>alert("xss")</script>Test',
        description: '<img src=x onerror=alert(1)>',
      });
      const template = createMockTemplate();

      const html = builder.generateHTML(portfolio, template);

      expect(html).not.toContain('<script>');
      expect(html).not.toContain('onerror=');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should include all portfolio sections', () => {
      const portfolio = createMockPortfolio({
        sections: [
          { type: 'hero', content: { title: 'Hero' } },
          { type: 'about', content: { text: 'About me' } },
          { type: 'projects', content: { items: [] } },
        ],
      });
      const template = createMockTemplate();

      const html = builder.generateHTML(portfolio, template);

      expect(html).toContain('section-hero');
      expect(html).toContain('section-about');
      expect(html).toContain('section-projects');
    });

    it('should apply custom theme colors', () => {
      const portfolio = createMockPortfolio({
        settings: {
          theme: 'dark',
          primaryColor: '#FF5733',
          fontFamily: 'Roboto',
        },
      });
      const template = createMockTemplate();

      const html = builder.generateHTML(portfolio, template);

      expect(html).toContain('data-theme="dark"');
    });
  });

  describe('CSS generation', () => {
    it('should generate valid CSS', () => {
      const portfolio = createMockPortfolio();
      const template = createMockTemplate();

      const css = builder.generateCSS(portfolio, template);

      expect(css).toBeTruthy();
      expect(css).toContain('{');
      expect(css).toContain('}');
    });

    it('should include custom colors in CSS', () => {
      const portfolio = createMockPortfolio({
        settings: {
          theme: 'light',
          primaryColor: '#123456',
          fontFamily: 'Inter',
        },
      });
      const template = createMockTemplate();

      const css = builder.generateCSS(portfolio, template);

      expect(css).toContain('#123456');
    });

    it('should include font family in CSS', () => {
      const portfolio = createMockPortfolio({
        settings: {
          theme: 'light',
          primaryColor: '#000',
          fontFamily: 'Poppins',
        },
      });
      const template = createMockTemplate();

      const css = builder.generateCSS(portfolio, template);

      expect(css).toContain('Poppins');
    });

    it('should include responsive media queries', () => {
      const portfolio = createMockPortfolio();
      const template = createMockTemplate();

      const css = builder.generateCSS(portfolio, template);

      expect(css).toContain('@media');
    });

    it('should minify CSS when specified', () => {
      const portfolio = createMockPortfolio();
      const template = createMockTemplate();

      const css = builder.generateCSS(portfolio, template, { minify: true });

      // Minified CSS should have no extra whitespace
      expect(css).not.toContain('  ');
      expect(css).not.toContain('\n\n');
    });
  });

  describe('ZIP creation', () => {
    it('should create ZIP with all files', async () => {
      const portfolio = createMockPortfolio();
      const template = createMockTemplate();

      const zip = await builder.createZIP(portfolio, template);

      expect(zip).toBeInstanceOf(Blob);
      expect(zip.type).toBe('application/zip');
    });

    it('should include index.html in ZIP', async () => {
      const portfolio = createMockPortfolio();
      const template = createMockTemplate();

      const files = await builder.getZIPFiles(portfolio, template);

      expect(files).toHaveProperty('index.html');
      expect(files['index.html']).toContain('<!DOCTYPE html>');
    });

    it('should include styles.css in ZIP', async () => {
      const portfolio = createMockPortfolio();
      const template = createMockTemplate();

      const files = await builder.getZIPFiles(portfolio, template);

      expect(files).toHaveProperty('styles.css');
    });

    it('should include assets in ZIP', async () => {
      const portfolio = createMockPortfolio({
        sections: [
          {
            type: 'hero',
            content: {
              backgroundImage: 'https://example.com/bg.jpg',
            },
          },
        ],
      });
      const template = createMockTemplate();

      const files = await builder.getZIPFiles(portfolio, template);

      // Should have some asset files
      expect(Object.keys(files).length).toBeGreaterThan(2);
    });

    it('should handle errors during ZIP creation', async () => {
      const portfolio = createMockPortfolio();
      const template = createMockTemplate();

      // Mock a failure in ZIP creation
      jest.spyOn(builder as any, 'generateHTML').mockImplementationOnce(() => {
        throw new Error('Failed to generate HTML');
      });

      await expect(builder.createZIP(portfolio, template)).rejects.toThrow(
        'Failed to generate HTML'
      );
    });
  });

  describe('error handling', () => {
    it('should handle missing portfolio data', () => {
      const portfolio = createMockPortfolio({ title: undefined as any });
      const template = createMockTemplate();

      expect(() => builder.generateHTML(portfolio, template)).not.toThrow();
    });

    it('should handle missing template data', () => {
      const portfolio = createMockPortfolio();
      const template = createMockTemplate({ structure: undefined as any });

      expect(() => builder.generateHTML(portfolio, template)).not.toThrow();
    });

    it('should handle invalid section types', () => {
      const portfolio = createMockPortfolio({
        sections: [{ type: 'invalid' as any, content: {} }],
      });
      const template = createMockTemplate();

      const html = builder.generateHTML(portfolio, template);

      expect(html).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle very long titles', () => {
      const longTitle = 'A'.repeat(1000);
      const portfolio = createMockPortfolio({ title: longTitle });
      const template = createMockTemplate();

      const html = builder.generateHTML(portfolio, template);

      expect(html).toContain(longTitle);
    });

    it('should handle special characters in content', () => {
      const portfolio = createMockPortfolio({
        title: 'Test & Portfolio',
        description: 'Description with "quotes" and \'apostrophes\'',
      });
      const template = createMockTemplate();

      const html = builder.generateHTML(portfolio, template);

      expect(html).toContain('&amp;');
    });

    it('should handle empty sections array', () => {
      const portfolio = createMockPortfolio({ sections: [] });
      const template = createMockTemplate();

      const html = builder.generateHTML(portfolio, template);

      expect(html).toBeTruthy();
      expect(html).toContain('<!DOCTYPE html>');
    });

    it('should handle null SEO data', () => {
      const portfolio = createMockPortfolio({ seo: null as any });
      const template = createMockTemplate();

      const html = builder.generateHTML(portfolio, template);

      expect(html).toBeTruthy();
    });
  });
});
