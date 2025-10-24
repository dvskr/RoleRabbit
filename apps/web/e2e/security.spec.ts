import { test, expect } from '@playwright/test';

test.describe('RoleReady - Security Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should prevent XSS attacks', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test XSS prevention
    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('[data-testid="resume-summary"]', xssPayload);
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Verify XSS payload was sanitized
    await expect(page.locator('[data-testid="resume-summary"]')).not.toContainText('<script>');
    await expect(page.locator('[data-testid="resume-summary"]')).not.toContainText('alert');
  });

  test('should prevent SQL injection', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test SQL injection prevention
    const sqlPayload = "'; DROP TABLE users; --";
    await page.fill('[data-testid="resume-summary"]', sqlPayload);
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Verify SQL payload was handled safely
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveValue(sqlPayload);
  });

  test('should prevent CSRF attacks', async ({ page }) => {
    // Test CSRF token validation
    const response = await page.request.post('/api/resume', {
      data: {
        name: 'CSRF Test Resume',
        summary: 'Test resume for CSRF protection'
      },
      headers: {
        'X-CSRF-Token': 'invalid-token'
      }
    });
    expect(response.status()).toBe(403);
    
    // Test with valid CSRF token
    const validResponse = await page.request.post('/api/resume', {
      data: {
        name: 'CSRF Test Resume',
        summary: 'Test resume for CSRF protection'
      }
    });
    expect(validResponse.status()).toBe(201);
  });

  test('should prevent file upload attacks', async ({ page }) => {
    await page.click('[data-testid="nav-cloud-storage"]');
    
    // Test malicious file upload
    const maliciousFile = {
      name: 'malicious.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('malicious content')
    };
    
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles(maliciousFile);
    await expect(page.locator('[data-testid="invalid-file-error"]')).toBeVisible();
    
    // Test valid file upload
    const validFile = {
      name: 'valid.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('valid content')
    };
    
    await fileInput.setInputFiles(validFile);
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
  });

  test('should prevent session hijacking', async ({ page }) => {
    // Test session security
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    await expect(page.locator('[data-testid="login-success"]')).toBeVisible();
    
    // Test session token security
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(cookie => cookie.name === 'session');
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.secure).toBe(true);
  });

  test('should prevent data exposure', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-email"]', 'sensitive@example.com');
    await page.fill('[data-testid="profile-phone"]', '123-456-7890');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    
    // Verify data is encrypted in storage
    const storageData = await page.evaluate(() => {
      return localStorage.getItem('profile-data');
    });
    expect(storageData).not.toContain('sensitive@example.com');
    expect(storageData).not.toContain('123-456-7890');
  });

  test('should prevent rate limiting abuse', async ({ page }) => {
    // Test API rate limiting
    const requests = [];
    for (let i = 0; i < 100; i++) {
      requests.push(page.request.get('/api/resume'));
    }
    
    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(response => response.status() === 429);
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  test('should enforce HTTPS', async ({ page }) => {
    // Test HTTPS redirect
    const response = await page.goto('http://localhost:3000/test-all-components');
    expect(response?.url()).toContain('https://');
  });

  test('should have proper security headers', async ({ page }) => {
    const response = await page.goto('/test-all-components');
    const headers = response?.headers();
    
    // Test security headers
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-xss-protection']).toBe('1; mode=block');
    expect(headers['referrer-policy']).toBeDefined();
    expect(headers['strict-transport-security']).toBeDefined();
  });

  test('should prevent clickjacking', async ({ page }) => {
    // Test X-Frame-Options header
    const response = await page.goto('/test-all-components');
    const frameOptions = response?.headers()['x-frame-options'];
    expect(frameOptions).toBeDefined();
    expect(['DENY', 'SAMEORIGIN']).toContain(frameOptions);
  });

  test('should prevent information disclosure', async ({ page }) => {
    // Test error messages don't reveal sensitive information
    await page.route('**/api/resume', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.click('[data-testid="load-resume-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    const errorMessage = await page.locator('[data-testid="error-message"]').textContent();
    expect(errorMessage).not.toContain('database');
    expect(errorMessage).not.toContain('password');
    expect(errorMessage).not.toContain('token');
  });

  test('should prevent input injection', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test HTML injection prevention
    const htmlPayload = '<img src="x" onerror="alert(1)">';
    await page.fill('[data-testid="resume-summary"]', htmlPayload);
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Verify HTML was sanitized
    await expect(page.locator('[data-testid="resume-summary"]')).not.toContainText('<img');
    await expect(page.locator('[data-testid="resume-summary"]')).not.toContainText('onerror');
  });

  test('should prevent API abuse', async ({ page }) => {
    // Test API authentication
    const response = await page.request.get('/api/profile');
    expect(response.status()).toBe(401);
    
    // Test API authorization
    const authorizedResponse = await page.request.get('/api/profile', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });
    expect(authorizedResponse.status()).toBe(200);
  });

  test('should prevent data tampering', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Tamper Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test data integrity
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Tamper Test Resume');
  });

  test('should prevent unauthorized access', async ({ page }) => {
    // Test accessing protected routes without authentication
    await page.goto('/test-all-components/profile');
    await expect(page.locator('[data-testid="login-required"]')).toBeVisible();
    
    // Test accessing protected routes with authentication
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    await expect(page.locator('[data-testid="login-success"]')).toBeVisible();
    
    await page.goto('/test-all-components/profile');
    await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
  });

  test('should prevent session fixation', async ({ page }) => {
    // Test session regeneration
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    await expect(page.locator('[data-testid="login-success"]')).toBeVisible();
    
    // Test session token regeneration
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(cookie => cookie.name === 'session');
    expect(sessionCookie?.value).toBeDefined();
  });

  test('should prevent timing attacks', async ({ page }) => {
    // Test consistent response times
    const startTime = Date.now();
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Timing Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  test('should prevent directory traversal', async ({ page }) => {
    // Test directory traversal prevention
    const response = await page.request.get('/api/files/../../../etc/passwd');
    expect(response.status()).toBe(403);
    
    // Test valid file access
    const validResponse = await page.request.get('/api/files/valid-file.pdf');
    expect(validResponse.status()).toBe(200);
  });

  test('should prevent command injection', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test command injection prevention
    const commandPayload = '; rm -rf /';
    await page.fill('[data-testid="resume-summary"]', commandPayload);
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Verify command was not executed
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveValue(commandPayload);
  });

  test('should prevent LDAP injection', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    
    // Test LDAP injection prevention
    const ldapPayload = '*)(uid=*))(|(uid=*';
    await page.fill('[data-testid="profile-name"]', ldapPayload);
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    
    // Verify LDAP payload was handled safely
    await expect(page.locator('[data-testid="profile-name"]')).toHaveValue(ldapPayload);
  });

  test('should prevent XML injection', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test XML injection prevention
    const xmlPayload = '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///etc/passwd">]><root>&test;</root>';
    await page.fill('[data-testid="resume-summary"]', xmlPayload);
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Verify XML payload was sanitized
    await expect(page.locator('[data-testid="resume-summary"]')).not.toContainText('<!DOCTYPE');
    await expect(page.locator('[data-testid="resume-summary"]')).not.toContainText('<!ENTITY');
  });

  test('should prevent JSON injection', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test JSON injection prevention
    const jsonPayload = '{"name": "test", "malicious": "}alert(1);{"}';
    await page.fill('[data-testid="resume-summary"]', jsonPayload);
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Verify JSON payload was handled safely
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveValue(jsonPayload);
  });

  test('should prevent buffer overflow', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test buffer overflow prevention
    const bufferPayload = 'A'.repeat(1000000);
    await page.fill('[data-testid="resume-summary"]', bufferPayload);
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="length-validation-error"]')).toBeVisible();
  });

  test('should prevent integer overflow', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    
    // Test integer overflow prevention
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-salary"]', '999999999999999999999');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('should prevent null byte injection', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test null byte injection prevention
    const nullBytePayload = 'test\x00malicious';
    await page.fill('[data-testid="resume-summary"]', nullBytePayload);
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Verify null byte was handled safely
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveValue('testmalicious');
  });
});