/**
 * Frontend Unit Tests: ChatInterface Data Extraction (Section 5.1)
 *
 * Tests for extracting structured data from chat messages
 */

import {
  extractEmails,
  extractURLs,
  extractTechnologies,
  extractProjects,
  extractContactInfo,
  parseStructuredData,
} from '../data-extraction';

describe('ChatInterface Data Extraction', () => {
  describe('extractEmails', () => {
    it('should extract email addresses from text', () => {
      const text = 'Contact me at john@example.com or jane@test.org';
      const emails = extractEmails(text);

      expect(emails).toContain('john@example.com');
      expect(emails).toContain('jane@test.org');
      expect(emails).toHaveLength(2);
    });

    it('should handle text without emails', () => {
      const text = 'No emails here';
      const emails = extractEmails(text);

      expect(emails).toEqual([]);
    });

    it('should extract email with special characters', () => {
      const text = 'Email: user+tag@sub.example.com';
      const emails = extractEmails(text);

      expect(emails).toContain('user+tag@sub.example.com');
    });

    it('should not extract invalid emails', () => {
      const text = 'Invalid: user@, @example.com, user example@test.com';
      const emails = extractEmails(text);

      expect(emails).toEqual([]);
    });

    it('should deduplicate emails', () => {
      const text = 'Email: john@example.com and john@example.com again';
      const emails = extractEmails(text);

      expect(emails).toHaveLength(1);
    });
  });

  describe('extractURLs', () => {
    it('should extract URLs from text', () => {
      const text = 'Check out https://example.com and http://test.org';
      const urls = extractURLs(text);

      expect(urls).toContain('https://example.com');
      expect(urls).toContain('http://test.org');
      expect(urls).toHaveLength(2);
    });

    it('should extract URLs with paths and queries', () => {
      const text = 'Visit https://example.com/path?query=value#hash';
      const urls = extractURLs(text);

      expect(urls).toContain('https://example.com/path?query=value#hash');
    });

    it('should extract GitHub URLs', () => {
      const text = 'My GitHub: https://github.com/username/repo';
      const urls = extractURLs(text);

      expect(urls).toContain('https://github.com/username/repo');
    });

    it('should extract LinkedIn URLs', () => {
      const text = 'LinkedIn: https://linkedin.com/in/username';
      const urls = extractURLs(text);

      expect(urls).toContain('https://linkedin.com/in/username');
    });

    it('should not extract invalid URLs', () => {
      const text = 'Not a URL: example.com or javascript:alert(1)';
      const urls = extractURLs(text);

      expect(urls).not.toContain('example.com');
      expect(urls).not.toContain('javascript:alert(1)');
    });

    it('should handle text without URLs', () => {
      const text = 'No URLs in this text';
      const urls = extractURLs(text);

      expect(urls).toEqual([]);
    });

    it('should deduplicate URLs', () => {
      const text = 'https://example.com and https://example.com again';
      const urls = extractURLs(text);

      expect(urls).toHaveLength(1);
    });
  });

  describe('extractTechnologies', () => {
    it('should extract common technologies', () => {
      const text = 'I work with JavaScript, TypeScript, React, and Node.js';
      const techs = extractTechnologies(text);

      expect(techs).toContain('JavaScript');
      expect(techs).toContain('TypeScript');
      expect(techs).toContain('React');
      expect(techs).toContain('Node.js');
    });

    it('should extract framework names', () => {
      const text = 'Skills: Next.js, Express, Django, FastAPI';
      const techs = extractTechnologies(text);

      expect(techs).toContain('Next.js');
      expect(techs).toContain('Express');
      expect(techs).toContain('Django');
      expect(techs).toContain('FastAPI');
    });

    it('should extract database names', () => {
      const text = 'Databases: PostgreSQL, MongoDB, Redis';
      const techs = extractTechnologies(text);

      expect(techs).toContain('PostgreSQL');
      expect(techs).toContain('MongoDB');
      expect(techs).toContain('Redis');
    });

    it('should be case-insensitive', () => {
      const text = 'I use REACT and typescript';
      const techs = extractTechnologies(text);

      expect(techs).toContain('React');
      expect(techs).toContain('TypeScript');
    });

    it('should handle comma-separated lists', () => {
      const text = 'Technologies: React, Vue, Angular, Svelte';
      const techs = extractTechnologies(text);

      expect(techs).toHaveLength(4);
    });

    it('should deduplicate technologies', () => {
      const text = 'React and React again';
      const techs = extractTechnologies(text);

      expect(techs.filter((t) => t === 'React')).toHaveLength(1);
    });

    it('should handle text without technologies', () => {
      const text = 'No tech keywords here';
      const techs = extractTechnologies(text);

      expect(techs).toEqual([]);
    });
  });

  describe('extractProjects', () => {
    it('should extract project information', () => {
      const messages = [
        {
          role: 'user',
          content: 'I built a portfolio website using React and TypeScript',
        },
        {
          role: 'user',
          content: 'Another project: E-commerce platform with Next.js',
        },
      ];

      const projects = extractProjects(messages);

      expect(projects).toHaveLength(2);
      expect(projects[0]).toHaveProperty('name');
      expect(projects[0]).toHaveProperty('technologies');
      expect(projects[0].technologies).toContain('React');
      expect(projects[0].technologies).toContain('TypeScript');
    });

    it('should extract project URLs', () => {
      const messages = [
        {
          role: 'user',
          content: 'Check out my project at https://myproject.com',
        },
      ];

      const projects = extractProjects(messages);

      expect(projects[0].url).toBe('https://myproject.com');
    });

    it('should extract project descriptions', () => {
      const messages = [
        {
          role: 'user',
          content: 'Project: Task Manager - A productivity app for teams',
        },
      ];

      const projects = extractProjects(messages);

      expect(projects[0].name).toContain('Task Manager');
      expect(projects[0].description).toContain('productivity app');
    });

    it('should handle messages without projects', () => {
      const messages = [
        {
          role: 'user',
          content: 'Just saying hello',
        },
      ];

      const projects = extractProjects(messages);

      expect(projects).toEqual([]);
    });
  });

  describe('extractContactInfo', () => {
    it('should extract all contact information', () => {
      const text = `
        Email: john@example.com
        Phone: +1 (555) 123-4567
        LinkedIn: https://linkedin.com/in/johndoe
        GitHub: https://github.com/johndoe
        Website: https://johndoe.com
      `;

      const contact = extractContactInfo(text);

      expect(contact.email).toBe('john@example.com');
      expect(contact.phone).toBe('+1 (555) 123-4567');
      expect(contact.linkedin).toBe('https://linkedin.com/in/johndoe');
      expect(contact.github).toBe('https://github.com/johndoe');
      expect(contact.website).toBe('https://johndoe.com');
    });

    it('should extract phone numbers in various formats', () => {
      const formats = [
        '+1 (555) 123-4567',
        '555-123-4567',
        '(555) 123-4567',
        '+1-555-123-4567',
      ];

      formats.forEach((phone) => {
        const contact = extractContactInfo(`Phone: ${phone}`);
        expect(contact.phone).toBeTruthy();
      });
    });

    it('should handle partial contact information', () => {
      const text = 'Email: john@example.com';

      const contact = extractContactInfo(text);

      expect(contact.email).toBe('john@example.com');
      expect(contact.phone).toBeUndefined();
      expect(contact.linkedin).toBeUndefined();
    });

    it('should prioritize explicit mentions', () => {
      const text = `
        My email is primary@example.com but you can also reach me at secondary@example.com
      `;

      const contact = extractContactInfo(text);

      expect(contact.email).toBe('primary@example.com');
    });
  });

  describe('parseStructuredData', () => {
    it('should parse complete conversation into structured data', () => {
      const messages = [
        {
          role: 'user',
          content: 'Hi, I\'m John Doe, a software engineer',
        },
        {
          role: 'user',
          content: 'Email: john@example.com',
        },
        {
          role: 'user',
          content: 'I work with React, TypeScript, Node.js',
        },
        {
          role: 'user',
          content: 'Built a portfolio site at https://johndoe.com',
        },
      ];

      const data = parseStructuredData(messages);

      expect(data.name).toContain('John Doe');
      expect(data.title).toContain('software engineer');
      expect(data.email).toBe('john@example.com');
      expect(data.skills).toContain('React');
      expect(data.skills).toContain('TypeScript');
      expect(data.skills).toContain('Node.js');
      expect(data.projects).toHaveLength(1);
      expect(data.projects[0].url).toBe('https://johndoe.com');
    });

    it('should handle empty conversation', () => {
      const messages: any[] = [];

      const data = parseStructuredData(messages);

      expect(data).toEqual({
        name: undefined,
        title: undefined,
        email: undefined,
        phone: undefined,
        skills: [],
        projects: [],
        socialLinks: {},
      });
    });

    it('should deduplicate extracted data', () => {
      const messages = [
        {
          role: 'user',
          content: 'I use React',
        },
        {
          role: 'user',
          content: 'I also work with React',
        },
      ];

      const data = parseStructuredData(messages);

      expect(data.skills.filter((s) => s === 'React')).toHaveLength(1);
    });

    it('should ignore assistant messages', () => {
      const messages = [
        {
          role: 'user',
          content: 'I\'m a developer',
        },
        {
          role: 'assistant',
          content: 'Great! Tell me about your experience',
        },
      ];

      const data = parseStructuredData(messages);

      expect(data.title).toContain('developer');
    });
  });

  describe('edge cases', () => {
    it('should handle very long messages', () => {
      const longText = 'a'.repeat(10000);
      const emails = extractEmails(longText);

      expect(emails).toEqual([]);
    });

    it('should handle special characters', () => {
      const text = 'Email: user+tag@example.com';
      const emails = extractEmails(text);

      expect(emails).toContain('user+tag@example.com');
    });

    it('should handle malformed data gracefully', () => {
      const text = '@@@ invalid email @@@ https://';
      const emails = extractEmails(text);
      const urls = extractURLs(text);

      expect(emails).toEqual([]);
      expect(urls).toEqual([]);
    });

    it('should handle null and undefined', () => {
      expect(extractEmails(null as any)).toEqual([]);
      expect(extractURLs(undefined as any)).toEqual([]);
      expect(extractTechnologies('')).toEqual([]);
    });
  });
});
