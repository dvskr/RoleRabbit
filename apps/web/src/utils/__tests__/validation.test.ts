/**
 * Frontend Unit Tests: Validation Functions (Section 5.1)
 *
 * Tests for validation utilities
 */

import {
  validateEmail,
  validateURL,
  validateSubdomain,
  validatePortfolioData,
  validateSectionData,
} from '../validation';

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('user.name@example.com')).toBe(true);
      expect(validateEmail('user+tag@example.co.uk')).toBe(true);
      expect(validateEmail('user123@sub.example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
      expect(validateEmail('user example@test.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
    });

    it('should trim whitespace', () => {
      expect(validateEmail('  user@example.com  ')).toBe(true);
    });
  });

  describe('validateURL', () => {
    it('should validate correct URLs', () => {
      expect(validateURL('https://example.com')).toBe(true);
      expect(validateURL('http://example.com')).toBe(true);
      expect(validateURL('https://sub.example.com/path')).toBe(true);
      expect(validateURL('https://example.com/path?query=value')).toBe(true);
      expect(validateURL('https://example.com:8080')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateURL('not-a-url')).toBe(false);
      expect(validateURL('example.com')).toBe(false);
      expect(validateURL('ftp://example.com')).toBe(false);
      expect(validateURL('')).toBe(false);
      expect(validateURL('javascript:alert(1)')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(validateURL(null as any)).toBe(false);
      expect(validateURL(undefined as any)).toBe(false);
    });

    it('should optionally require HTTPS', () => {
      expect(validateURL('http://example.com', { requireHTTPS: true })).toBe(false);
      expect(validateURL('https://example.com', { requireHTTPS: true })).toBe(true);
    });

    it('should validate localhost URLs', () => {
      expect(validateURL('http://localhost:3000')).toBe(true);
      expect(validateURL('https://localhost')).toBe(true);
    });
  });

  describe('validateSubdomain', () => {
    it('should validate correct subdomains', () => {
      expect(validateSubdomain('myportfolio')).toBe(true);
      expect(validateSubdomain('my-portfolio')).toBe(true);
      expect(validateSubdomain('portfolio123')).toBe(true);
      expect(validateSubdomain('a')).toBe(true);
    });

    it('should reject invalid subdomains', () => {
      expect(validateSubdomain('')).toBe(false);
      expect(validateSubdomain('my_portfolio')).toBe(false);
      expect(validateSubdomain('my portfolio')).toBe(false);
      expect(validateSubdomain('my.portfolio')).toBe(false);
      expect(validateSubdomain('-portfolio')).toBe(false);
      expect(validateSubdomain('portfolio-')).toBe(false);
      expect(validateSubdomain('UPPER')).toBe(false); // Should be lowercase
    });

    it('should enforce length limits', () => {
      expect(validateSubdomain('a'.repeat(63))).toBe(true);
      expect(validateSubdomain('a'.repeat(64))).toBe(false);
      expect(validateSubdomain('ab')).toBe(true);
      expect(validateSubdomain('a')).toBe(true);
    });

    it('should reject reserved subdomains', () => {
      expect(validateSubdomain('www')).toBe(false);
      expect(validateSubdomain('admin')).toBe(false);
      expect(validateSubdomain('api')).toBe(false);
      expect(validateSubdomain('mail')).toBe(false);
      expect(validateSubdomain('app')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(validateSubdomain(null as any)).toBe(false);
      expect(validateSubdomain(undefined as any)).toBe(false);
    });

    it('should trim whitespace', () => {
      expect(validateSubdomain('  myportfolio  ')).toBe(true);
    });
  });

  describe('validatePortfolioData', () => {
    it('should validate complete portfolio data', () => {
      const data = {
        title: 'My Portfolio',
        subtitle: 'Web Developer',
        description: 'A portfolio website',
        templateId: 'template-1',
        subdomain: 'myportfolio',
        settings: {
          theme: 'light',
          primaryColor: '#000000',
          fontFamily: 'Inter',
        },
      };

      const result = validatePortfolioData(data);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject missing required fields', () => {
      const data = {
        subtitle: 'Web Developer',
      };

      const result = validatePortfolioData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveProperty('title');
      expect(result.errors).toHaveProperty('templateId');
    });

    it('should reject empty title', () => {
      const data = {
        title: '',
        templateId: 'template-1',
      };

      const result = validatePortfolioData(data);

      expect(result.valid).toBe(false);
      expect(result.errors.title).toBeTruthy();
    });

    it('should validate title length', () => {
      const longTitle = 'a'.repeat(101);
      const data = {
        title: longTitle,
        templateId: 'template-1',
      };

      const result = validatePortfolioData(data);

      expect(result.valid).toBe(false);
      expect(result.errors.title).toContain('too long');
    });

    it('should validate subdomain format', () => {
      const data = {
        title: 'Portfolio',
        templateId: 'template-1',
        subdomain: 'invalid_subdomain',
      };

      const result = validatePortfolioData(data);

      expect(result.valid).toBe(false);
      expect(result.errors.subdomain).toBeTruthy();
    });

    it('should validate custom domain format', () => {
      const data = {
        title: 'Portfolio',
        templateId: 'template-1',
        customDomain: 'not-a-valid-domain',
      };

      const result = validatePortfolioData(data);

      expect(result.valid).toBe(false);
      expect(result.errors.customDomain).toBeTruthy();
    });

    it('should validate color format', () => {
      const data = {
        title: 'Portfolio',
        templateId: 'template-1',
        settings: {
          primaryColor: 'invalid-color',
        },
      };

      const result = validatePortfolioData(data);

      expect(result.valid).toBe(false);
      expect(result.errors.settings).toBeTruthy();
    });
  });

  describe('validateSectionData', () => {
    it('should validate hero section', () => {
      const section = {
        type: 'hero',
        content: {
          title: 'Welcome',
          subtitle: 'Developer',
          backgroundImage: 'https://example.com/bg.jpg',
        },
      };

      const result = validateSectionData(section);

      expect(result.valid).toBe(true);
    });

    it('should validate about section', () => {
      const section = {
        type: 'about',
        content: {
          text: 'About me text',
          image: 'https://example.com/photo.jpg',
        },
      };

      const result = validateSectionData(section);

      expect(result.valid).toBe(true);
    });

    it('should validate projects section', () => {
      const section = {
        type: 'projects',
        content: {
          items: [
            {
              name: 'Project 1',
              description: 'Description',
              url: 'https://project.com',
              technologies: ['React', 'TypeScript'],
            },
          ],
        },
      };

      const result = validateSectionData(section);

      expect(result.valid).toBe(true);
    });

    it('should reject invalid section type', () => {
      const section = {
        type: 'invalid',
        content: {},
      };

      const result = validateSectionData(section);

      expect(result.valid).toBe(false);
      expect(result.errors.type).toBeTruthy();
    });

    it('should reject missing required content', () => {
      const section = {
        type: 'hero',
        content: {},
      };

      const result = validateSectionData(section);

      expect(result.valid).toBe(false);
      expect(result.errors.content).toBeTruthy();
    });

    it('should validate URL fields in content', () => {
      const section = {
        type: 'hero',
        content: {
          title: 'Welcome',
          backgroundImage: 'invalid-url',
        },
      };

      const result = validateSectionData(section);

      expect(result.valid).toBe(false);
      expect(result.errors.content).toContain('URL');
    });
  });

  describe('edge cases', () => {
    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const data = {
        title: longString,
        templateId: 'template-1',
      };

      const result = validatePortfolioData(data);

      expect(result.valid).toBe(false);
    });

    it('should handle special characters', () => {
      const data = {
        title: 'Portfolio™ & Company®',
        templateId: 'template-1',
      };

      const result = validatePortfolioData(data);

      expect(result.valid).toBe(true);
    });

    it('should handle unicode characters', () => {
      const data = {
        title: 'Portfolio 日本語 中文',
        templateId: 'template-1',
      };

      const result = validatePortfolioData(data);

      expect(result.valid).toBe(true);
    });
  });
});
