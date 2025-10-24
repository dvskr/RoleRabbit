import { test, expect } from '@playwright/test';

test.describe('RoleReady - API Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should test resume API endpoints', async ({ page }) => {
    const response = await page.request.get('/api/resume');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('should test profile API endpoints', async ({ page }) => {
    const response = await page.request.get('/api/profile');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('should test job tracker API endpoints', async ({ page }) => {
    const response = await page.request.get('/api/jobs');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('should test AI API endpoints', async ({ page }) => {
    const response = await page.request.post('/api/ai/chat', {
      data: { message: 'Test message' }
    });
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('should test file upload API endpoints', async ({ page }) => {
    const response = await page.request.post('/api/upload', {
      multipart: {
        file: new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      }
    });
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('should test email API endpoints', async ({ page }) => {
    const response = await page.request.post('/api/email/send', {
      data: {
        to: 'test@example.com',
        subject: 'Test Subject',
        body: 'Test Body'
      }
    });
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('should test discussion API endpoints', async ({ page }) => {
    const response = await page.request.get('/api/discussion/posts');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('should test cover letter API endpoints', async ({ page }) => {
    const response = await page.request.post('/api/cover-letter/generate', {
      data: {
        jobDescription: 'Software Developer position',
        companyName: 'Test Company'
      }
    });
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('should test templates API endpoints', async ({ page }) => {
    const response = await page.request.get('/api/templates');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('should test error handling API endpoints', async ({ page }) => {
    const response = await page.request.get('/api/nonexistent');
    expect(response.status()).toBe(404);
  });
});