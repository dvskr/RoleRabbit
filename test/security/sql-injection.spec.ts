/**
 * Security Test: SQL Injection Vulnerabilities (Section 5.7)
 *
 * Tests for SQL injection in all inputs
 */

import { test, expect } from '@playwright/test';

const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE portfolios;--",
  "' UNION SELECT * FROM users--",
  "admin'--",
  "' OR 1=1--",
  "1' AND '1'='1",
  "' OR 'a'='a",
  "'; DELETE FROM portfolios WHERE '1'='1",
  "1; UPDATE portfolios SET title='Hacked'--",
  "' OR '1'='1' /*",
];

test.describe('SQL Injection Tests', () => {
  test('should prevent SQL injection in portfolio title', async ({ request }) => {
    for (const payload of SQL_INJECTION_PAYLOADS) {
      const response = await request.post('/api/portfolios', {
        data: {
          title: payload,
          templateId: 'template-1',
        },
      });

      // Should either reject with validation error or sanitize input
      if (response.ok()) {
        const body = await response.json();
        // If accepted, verify it was sanitized, not executed
        expect(body.portfolio.title).not.toContain('DROP');
        expect(body.portfolio.title).not.toContain('DELETE');
        expect(body.portfolio.title).not.toContain('UNION');
      } else {
        // Should get 400 Bad Request for invalid input
        expect(response.status()).toBe(400);
      }
    }
  });

  test('should prevent SQL injection in search query', async ({ request }) => {
    for (const payload of SQL_INJECTION_PAYLOADS) {
      const response = await request.get(`/api/portfolios/search?q=${encodeURIComponent(payload)}`);

      // Should not return error from database
      expect(response.status()).not.toBe(500);

      if (response.ok()) {
        const body = await response.json();
        // Should return empty results or sanitized search
        expect(Array.isArray(body.results)).toBeTruthy();
      }
    }
  });

  test('should prevent SQL injection in subdomain check', async ({ request }) => {
    for (const payload of SQL_INJECTION_PAYLOADS) {
      const response = await request.get(`/api/portfolios/check-subdomain?subdomain=${encodeURIComponent(payload)}`);

      // Should not execute SQL
      expect(response.status()).not.toBe(500);

      if (response.ok()) {
        const body = await response.json();
        // Should return validation error for invalid subdomain
        expect(body.available).toBe(false);
      }
    }
  });

  test('should use parameterized queries for portfolio ID lookup', async ({ request }) => {
    const maliciousId = "1' OR '1'='1";

    const response = await request.get(`/api/portfolios/${encodeURIComponent(maliciousId)}`);

    // Should return 404 (not found) not 500 (SQL error)
    expect(response.status()).toBe(404);
  });

  test('should prevent SQL injection in analytics date filter', async ({ request }) => {
    const payload = "2024-01-01' OR '1'='1";

    const response = await request.get(`/api/portfolios/1/analytics?startDate=${encodeURIComponent(payload)}`);

    // Should handle gracefully
    expect(response.status()).not.toBe(500);
  });

  test('should validate and sanitize all user inputs', async ({ request }) => {
    const maliciousPortfolio = {
      title: "Test' OR '1'='1",
      subtitle: "Sub'; DROP TABLE users;--",
      description: "Desc' UNION SELECT password FROM users--",
      subdomain: "test'; DELETE FROM portfolios--",
      sections: [
        {
          type: 'about',
          content: {
            text: "About' OR 1=1--",
          },
        },
      ],
    };

    const response = await request.post('/api/portfolios', {
      data: maliciousPortfolio,
    });

    if (response.ok()) {
      const body = await response.json();

      // All fields should be sanitized
      expect(body.portfolio.title).not.toMatch(/DROP|DELETE|UNION/i);
      expect(body.portfolio.subtitle).not.toMatch(/DROP|DELETE|UNION/i);
      expect(body.portfolio.description).not.toMatch(/DROP|DELETE|UNION/i);
    }
  });
});
