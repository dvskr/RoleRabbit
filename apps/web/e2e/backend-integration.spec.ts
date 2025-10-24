import { test, expect } from '@playwright/test';

test.describe('RoleReady - Backend Integration Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should integrate with Python API', async ({ page }) => {
    // Test Python API integration
    const response = await page.request.get('http://localhost:8000/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toBeDefined();
    expect(data.status).toBe('healthy');
  });

  test('should integrate with Node.js API', async ({ page }) => {
    // Test Node.js API integration
    const response = await page.request.get('http://localhost:3001/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toBeDefined();
    expect(data.status).toBe('healthy');
  });

  test('should integrate resume data flow', async ({ page }) => {
    // Test resume data flow
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Integration Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for integration testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test data persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Integration Test Resume');
  });

  test('should integrate AI data flow', async ({ page }) => {
    // Test AI data flow
    await page.click('[data-testid="nav-ai-panel"]');
    await page.fill('[data-testid="ai-chat-input"]', 'Help me improve my resume');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
    
    // Test AI response
    const response = await page.locator('[data-testid="ai-response"]').textContent();
    expect(response).toBeTruthy();
    expect(response?.length).toBeGreaterThan(10);
  });

  test('should integrate job tracker data flow', async ({ page }) => {
    // Test job tracker data flow
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'Integration Test Job');
    await page.fill('[data-testid="company-name"]', 'Integration Test Company');
    await page.selectOption('[data-testid="job-status"]', 'applied');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
    
    // Test data persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-job-tracker"]');
    await expect(page.locator('[data-testid="job-title"]')).toHaveValue('Integration Test Job');
  });

  test('should integrate cloud storage data flow', async ({ page }) => {
    // Test cloud storage data flow
    await page.click('[data-testid="nav-cloud-storage"]');
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: 'integration-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Integration test content')
    });
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
    
    // Test file list
    await expect(page.locator('[data-testid="uploaded-file"]')).toBeVisible();
  });

  test('should integrate email data flow', async ({ page }) => {
    // Test email data flow
    await page.click('[data-testid="nav-email"]');
    await page.click('[data-testid="compose-email-button"]');
    await page.fill('[data-testid="email-to"]', 'integration@example.com');
    await page.fill('[data-testid="email-subject"]', 'Integration Test Email');
    await page.fill('[data-testid="email-body"]', 'Test email for integration testing');
    await page.click('[data-testid="send-email-button"]');
    await expect(page.locator('[data-testid="email-sent-confirmation"]')).toBeVisible({ timeout: 10000 });
    
    // Test email list
    await expect(page.locator('[data-testid="sent-email"]')).toBeVisible();
  });

  test('should integrate discussion data flow', async ({ page }) => {
    // Test discussion data flow
    await page.click('[data-testid="nav-discussion"]');
    await page.click('[data-testid="new-post-button"]');
    await page.fill('[data-testid="post-title"]', 'Integration Test Post');
    await page.fill('[data-testid="post-content"]', 'Test post for integration testing');
    await page.click('[data-testid="publish-post-button"]');
    await expect(page.locator('[data-testid="post-published"]')).toBeVisible();
    
    // Test post list
    await expect(page.locator('[data-testid="published-post"]')).toBeVisible();
  });

  test('should integrate cover letter data flow', async ({ page }) => {
    // Test cover letter data flow
    await page.click('[data-testid="nav-cover-letter"]');
    await page.fill('[data-testid="job-description"]', 'Software Developer position');
    await page.fill('[data-testid="company-name"]', 'Integration Test Company');
    await page.click('[data-testid="generate-cover-letter-button"]');
    await expect(page.locator('[data-testid="cover-letter-generated"]')).toBeVisible({ timeout: 15000 });
    
    // Test cover letter display
    await expect(page.locator('[data-testid="generated-cover-letter"]')).toBeVisible();
  });

  test('should integrate profile data flow', async ({ page }) => {
    // Test profile data flow
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-name"]', 'Integration Test User');
    await page.fill('[data-testid="profile-email"]', 'integration@test.com');
    await page.fill('[data-testid="profile-phone"]', '123-456-7890');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    
    // Test data persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-profile"]');
    await expect(page.locator('[data-testid="profile-name"]')).toHaveValue('Integration Test User');
  });

  test('should integrate templates data flow', async ({ page }) => {
    // Test templates data flow
    await page.click('[data-testid="nav-templates"]');
    await page.click('[data-testid="select-template-button"]');
    await expect(page.locator('[data-testid="template-selected"]')).toBeVisible();
    
    // Test template persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-templates"]');
    await expect(page.locator('[data-testid="selected-template"]')).toBeVisible();
  });

  test('should integrate authentication flow', async ({ page }) => {
    // Test authentication flow
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    await expect(page.locator('[data-testid="login-success"]')).toBeVisible();
    
    // Test authenticated access
    await page.goto('/test-all-components/profile');
    await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
  });

  test('should integrate authorization flow', async ({ page }) => {
    // Test authorization flow
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page.locator('[data-testid="login-success"]')).toBeVisible();
    
    // Test admin access
    await page.goto('/test-all-components/admin');
    await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible();
  });

  test('should integrate data synchronization', async ({ page }) => {
    // Test data synchronization
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Sync Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test sync across components
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'Sync Test Job');
    await page.fill('[data-testid="company-name"]', 'Sync Test Company');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
    
    // Test data consistency
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Sync Test Resume');
  });

  test('should integrate error handling flow', async ({ page }) => {
    // Test error handling flow
    await page.route('**/api/resume', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Error Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    // Test error recovery
    await page.route('**/api/resume', route => {
      route.fulfill({ status: 200, body: '{"success": true}' });
    });
    
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should integrate performance monitoring', async ({ page }) => {
    // Test performance monitoring
    const startTime = Date.now();
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Performance Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  test('should integrate logging flow', async ({ page }) => {
    // Test logging flow
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Logging Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test log collection
    const logs = await page.evaluate(() => {
      return window.applicationLogs || [];
    });
    
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0]).toContain('Resume saved');
  });

  test('should integrate analytics flow', async ({ page }) => {
    // Test analytics flow
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Analytics Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test analytics collection
    const analytics = await page.evaluate(() => {
      return window.analyticsData || [];
    });
    
    expect(analytics.length).toBeGreaterThan(0);
    expect(analytics[0]).toContain('resume_saved');
  });

  test('should integrate caching flow', async ({ page }) => {
    // Test caching flow
    const firstLoadStart = Date.now();
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
    const firstLoadEnd = Date.now();
    const firstLoadTime = firstLoadEnd - firstLoadStart;
    
    const secondLoadStart = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const secondLoadEnd = Date.now();
    const secondLoadTime = secondLoadEnd - secondLoadStart;
    
    expect(secondLoadTime).toBeLessThan(firstLoadTime); // Second load should be faster
  });

  test('should integrate real-time updates', async ({ page }) => {
    // Test real-time updates
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Real-time Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test real-time sync
    await page.click('[data-testid="nav-job-tracker"]');
    await expect(page.locator('[data-testid="real-time-indicator"]')).toBeVisible();
  });

  test('should integrate backup and restore', async ({ page }) => {
    // Test backup and restore
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Backup Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test backup
    await page.click('[data-testid="backup-button"]');
    await expect(page.locator('[data-testid="backup-success"]')).toBeVisible();
    
    // Test restore
    await page.click('[data-testid="restore-button"]');
    await expect(page.locator('[data-testid="restore-success"]')).toBeVisible();
  });

  test('should integrate data migration', async ({ page }) => {
    // Test data migration
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Migration Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test migration
    await page.click('[data-testid="migrate-button"]');
    await expect(page.locator('[data-testid="migration-success"]')).toBeVisible();
  });

  test('should integrate data validation', async ({ page }) => {
    // Test data validation
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test client-side validation
    await page.fill('[data-testid="resume-name"]', '');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    
    // Test server-side validation
    await page.fill('[data-testid="resume-name"]', 'Validation Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should integrate data encryption', async ({ page }) => {
    // Test data encryption
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-email"]', 'encryption@example.com');
    await page.fill('[data-testid="profile-phone"]', '123-456-7890');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    
    // Test encrypted storage
    const storageData = await page.evaluate(() => {
      return localStorage.getItem('profile-data');
    });
    expect(storageData).not.toContain('encryption@example.com');
    expect(storageData).not.toContain('123-456-7890');
  });
});