/**
 * Backend Unit Tests: TemplateService (Section 5.2)
 *
 * Tests for template rendering, validation, and caching
 */

import { TemplateService } from '../template.service';
import { createMockTemplate, createMockPortfolio } from '@/../test/utils/test-helpers';

// Mock Handlebars
jest.mock('handlebars', () => ({
  compile: jest.fn((template) => jest.fn((data) => `Rendered: ${JSON.stringify(data)}`)),
}));

describe('TemplateService', () => {
  let service: TemplateService;
  let mockCache: Map<string, any>;

  beforeEach(() => {
    service = new TemplateService();
    mockCache = new Map();
    (service as any).cache = mockCache;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render template with portfolio data', () => {
      const template = createMockTemplate();
      const portfolio = createMockPortfolio();

      const result = service.render(template, portfolio);

      expect(result).toContain('Rendered:');
      expect(result).toBeTruthy();
    });

    it('should handle rendering errors gracefully', () => {
      const template = createMockTemplate({ structure: null as any });
      const portfolio = createMockPortfolio();

      expect(() => service.render(template, portfolio)).not.toThrow();
    });

    it('should escape HTML in portfolio data', () => {
      const template = createMockTemplate();
      const portfolio = createMockPortfolio({
        title: '<script>alert("xss")</script>',
      });

      const result = service.render(template, portfolio);

      expect(result).not.toContain('<script>');
    });

    it('should include all portfolio sections', () => {
      const template = createMockTemplate();
      const portfolio = createMockPortfolio({
        sections: [
          { type: 'hero', content: { title: 'Hero' } },
          { type: 'about', content: { text: 'About' } },
        ],
      });

      const result = service.render(template, portfolio);

      expect(result).toBeTruthy();
    });
  });

  describe('validation', () => {
    it('should validate template structure', () => {
      const validTemplate = createMockTemplate();

      const result = service.validate(validTemplate);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect missing required fields', () => {
      const invalidTemplate = createMockTemplate({
        structure: undefined as any,
      });

      const result = service.validate(invalidTemplate);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('structure is required');
    });

    it('should validate section types', () => {
      const template = createMockTemplate({
        structure: {
          sections: ['invalid-section' as any],
          layout: 'default',
        },
      });

      const result = service.validate(template);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid section type');
    });

    it('should validate styles', () => {
      const template = createMockTemplate({
        styles: {
          colors: {
            primary: 'invalid-color',
            secondary: '#FFF',
          },
          fonts: { heading: 'Inter', body: 'Inter' },
        },
      });

      const result = service.validate(template);

      expect(result.valid).toBe(false);
    });
  });

  describe('template caching', () => {
    it('should cache compiled templates', () => {
      const template = createMockTemplate({ id: 'template-1' });
      const portfolio = createMockPortfolio();

      service.render(template, portfolio);
      service.render(template, portfolio);

      expect(mockCache.size).toBe(1);
      expect(mockCache.has('template-1')).toBe(true);
    });

    it('should use cached template on subsequent renders', () => {
      const template = createMockTemplate({ id: 'template-1' });
      const portfolio = createMockPortfolio();

      const result1 = service.render(template, portfolio);
      const result2 = service.render(template, portfolio);

      expect(result1).toBe(result2);
    });

    it('should invalidate cache when template changes', () => {
      const template = createMockTemplate({ id: 'template-1' });

      service.render(template, createMockPortfolio());
      service.invalidateCache('template-1');

      expect(mockCache.has('template-1')).toBe(false);
    });

    it('should clear all cache', () => {
      service.render(createMockTemplate({ id: 't1' }), createMockPortfolio());
      service.render(createMockTemplate({ id: 't2' }), createMockPortfolio());

      service.clearCache();

      expect(mockCache.size).toBe(0);
    });
  });
});
