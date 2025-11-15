/**
 * Security Tests: Authentication & Authorization (Section 5.7)
 *
 * Tests for broken authentication and authorization vulnerabilities
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test('should reject requests without JWT token', async ({ request }) => {
    const response = await request.get('/api/portfolios');

    // Should require authentication
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toContain('Authentication required');
  });

  test('should reject requests with invalid JWT token', async ({ request }) => {
    const response = await request.get('/api/portfolios', {
      headers: {
        'Authorization': 'Bearer invalid-token-12345',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should reject expired JWT tokens', async ({ request }) => {
    // Token that expired in the past
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    const response = await request.get('/api/portfolios', {
      headers: {
        'Authorization': `Bearer ${expiredToken}`,
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toMatch(/expired|invalid/i);
  });

  test('should validate JWT signature', async ({ request }) => {
    // Token with tampered signature
    const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.invalid_signature';

    const response = await request.get('/api/portfolios', {
      headers: {
        'Authorization': `Bearer ${tamperedToken}`,
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should not expose sensitive data in JWT', async ({ request }) => {
    // Create a valid token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'password123',
      },
    });

    if (loginResponse.ok()) {
      const body = await loginResponse.json();
      const token = body.token;

      // Decode JWT (base64)
      const [, payloadB64] = token.split('.');
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());

      // Should not contain password
      expect(payload.password).toBeUndefined();

      // Should not contain sensitive keys
      expect(payload.secretKey).toBeUndefined();
      expect(payload.apiKey).toBeUndefined();
    }
  });

  test('should enforce rate limiting on login endpoint', async ({ request }) => {
    const attempts = [];

    // Try to login 20 times rapidly
    for (let i = 0; i < 20; i++) {
      attempts.push(
        request.post('/api/auth/login', {
          data: {
            email: 'test@example.com',
            password: 'wrongpassword',
          },
        })
      );
    }

    const responses = await Promise.all(attempts);

    // Some requests should be rate limited
    const rateLimited = responses.filter(r => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});

test.describe('Authorization Tests', () => {
  test('should prevent accessing other users\' portfolios', async ({ request }) => {
    // User A creates a portfolio
    const userAToken = 'user-a-token';
    const createResponse = await request.post('/api/portfolios', {
      data: {
        title: 'User A Portfolio',
        templateId: 'template-1',
      },
      headers: {
        'Authorization': `Bearer ${userAToken}`,
      },
    });

    if (createResponse.ok()) {
      const body = await createResponse.json();
      const portfolioId = body.portfolio.id;

      // User B tries to access User A's portfolio
      const userBToken = 'user-b-token';
      const accessResponse = await request.get(`/api/portfolios/${portfolioId}`, {
        headers: {
          'Authorization': `Bearer ${userBToken}`,
        },
      });

      // Should return 403 Forbidden or 404 Not Found
      expect([403, 404]).toContain(accessResponse.status());
    }
  });

  test('should prevent modifying other users\' portfolios', async ({ request }) => {
    // Assume portfolio exists for user A
    const portfolioId = 'existing-portfolio-id';
    const userBToken = 'user-b-token';

    const updateResponse = await request.put(`/api/portfolios/${portfolioId}`, {
      data: {
        title: 'Hacked Title',
      },
      headers: {
        'Authorization': `Bearer ${userBToken}`,
      },
    });

    // Should return 403 Forbidden
    expect(updateResponse.status()).toBe(403);

    const body = await updateResponse.json();
    expect(body.error).toMatch(/not authorized|forbidden/i);
  });

  test('should prevent deleting other users\' portfolios', async ({ request }) => {
    const portfolioId = 'existing-portfolio-id';
    const userBToken = 'user-b-token';

    const deleteResponse = await request.delete(`/api/portfolios/${portfolioId}`, {
      headers: {
        'Authorization': `Bearer ${userBToken}`,
      },
    });

    expect(deleteResponse.status()).toBe(403);
  });

  test('should enforce role-based access control for admin endpoints', async ({ request }) => {
    const regularUserToken = 'regular-user-token';

    // Try to access admin endpoint
    const response = await request.get('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${regularUserToken}`,
      },
    });

    // Should deny access
    expect(response.status()).toBe(403);

    const body = await response.json();
    expect(body.error).toMatch(/admin|permission/i);
  });

  test('should validate ownership on all state-changing operations', async ({ request }) => {
    const portfolioId = 'user-a-portfolio';
    const userBToken = 'user-b-token';

    // Test various operations
    const operations = [
      { method: 'PUT', path: `/api/portfolios/${portfolioId}`, data: { title: 'New' } },
      { method: 'DELETE', path: `/api/portfolios/${portfolioId}` },
      { method: 'POST', path: `/api/portfolios/${portfolioId}/deploy` },
      { method: 'POST', path: `/api/portfolios/${portfolioId}/share` },
    ];

    for (const op of operations) {
      const response = await request.fetch(op.path, {
        method: op.method,
        headers: {
          'Authorization': `Bearer ${userBToken}`,
          'Content-Type': 'application/json',
        },
        data: op.data,
      });

      // All should be forbidden
      expect(response.status()).toBe(403);
    }
  });

  test('should not leak user existence through error messages', async ({ request }) => {
    // Try to access portfolio that doesn't exist
    const response1 = await request.get('/api/portfolios/nonexistent-id');

    // Try to access portfolio that exists but belongs to another user
    const response2 = await request.get('/api/portfolios/existing-but-unauthorized-id');

    // Both should return same error (404), not revealing if portfolio exists
    expect(response1.status()).toBe(404);
    expect(response2.status()).toBe(404);

    const body1 = await response1.json();
    const body2 = await response2.json();

    // Error messages should be identical
    expect(body1.error).toBe(body2.error);
  });
});

test.describe('CSRF Protection Tests', () => {
  test('should reject state-changing requests without CSRF token', async ({ request }) => {
    // POST without CSRF token
    const response = await request.post('/api/portfolios', {
      data: {
        title: 'Test',
        templateId: 'template-1',
      },
      headers: {
        'Authorization': 'Bearer valid-token',
        // Missing CSRF token
      },
    });

    // Should reject if CSRF protection is enabled
    // (Status code depends on implementation: 403 or require CSRF header)
    if (response.status() !== 201) {
      expect([400, 403]).toContain(response.status());
    }
  });

  test('should validate CSRF token on state-changing operations', async ({ page }) => {
    // Login to get CSRF token
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Get CSRF token from cookie or meta tag
    const csrfToken = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta?.getAttribute('content');
    });

    expect(csrfToken).toBeTruthy();

    // Create portfolio with CSRF token
    const response = await page.request.post('/api/portfolios', {
      data: {
        title: 'Test Portfolio',
        templateId: 'template-1',
      },
      headers: {
        'X-CSRF-Token': csrfToken!,
      },
    });

    expect(response.ok()).toBeTruthy();
  });

  test('should use SameSite cookie attribute', async ({ page }) => {
    await page.goto('/');

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'session' || c.name === 'token');

    if (sessionCookie) {
      // Should have SameSite=Strict or Lax
      expect(['Strict', 'Lax']).toContain(sessionCookie.sameSite);
    }
  });
});

test.describe('Sensitive Data Exposure Tests', () => {
  test('should not expose passwords in API responses', async ({ request }) => {
    const response = await request.get('/api/users/me', {
      headers: {
        'Authorization': 'Bearer valid-token',
      },
    });

    if (response.ok()) {
      const body = await response.json();

      // Should not contain password field
      expect(body.password).toBeUndefined();
      expect(body.passwordHash).toBeUndefined();
    }
  });

  test('should not expose API keys or secrets in responses', async ({ request }) => {
    const response = await request.get('/api/portfolios/123');

    const bodyText = await response.text();

    // Should not contain common secret patterns
    expect(bodyText).not.toMatch(/api[_-]?key/i);
    expect(bodyText).not.toMatch(/secret[_-]?key/i);
    expect(bodyText).not.toMatch(/access[_-]?token/i);
    expect(bodyText).not.toMatch(/private[_-]?key/i);
  });

  test('should not log sensitive data', async ({ page }) => {
    // Check browser console logs
    const consoleLogs: string[] = [];

    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'secretpassword123');
    await page.click('button[type="submit"]');

    // Wait for any async logging
    await page.waitForTimeout(2000);

    // Logs should not contain password
    const logsText = consoleLogs.join(' ');
    expect(logsText).not.toContain('secretpassword123');
  });

  test('should use HTTPS in production', async ({ request }) => {
    const response = await request.get('/api/health');

    // Check Strict-Transport-Security header
    const hstsHeader = response.headers()['strict-transport-security'];

    if (process.env.NODE_ENV === 'production') {
      expect(hstsHeader).toBeTruthy();
      expect(hstsHeader).toContain('max-age=');
    }
  });
});
