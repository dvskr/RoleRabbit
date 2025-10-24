import { test, expect } from '@playwright/test';

test.describe('RoleReady - Main Application Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should load main application', async ({ page }) => {
    await expect(page.locator('[data-testid="main-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="navigation-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
  });

  test('should navigate between sections', async ({ page }) => {
    const sections = [
      'nav-home',
      'nav-resume-editor',
      'nav-ai-panel',
      'nav-templates',
      'nav-job-tracker',
      'nav-cloud-storage',
      'nav-email',
      'nav-discussion',
      'nav-cover-letter',
      'nav-profile'
    ];
    
    for (const section of sections) {
      await page.click(`[data-testid="${section}"]`);
      await expect(page.locator(`[data-testid="${section.replace('nav-', '')}-content"]`)).toBeVisible();
    }
  });

  test('should create and save resume', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume summary');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should use AI assistance', async ({ page }) => {
    await page.click('[data-testid="nav-ai-panel"]');
    await page.fill('[data-testid="ai-chat-input"]', 'Help me improve my resume');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
  });

  test('should track job applications', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'Software Developer');
    await page.fill('[data-testid="company-name"]', 'Test Company');
    await page.selectOption('[data-testid="job-status"]', 'applied');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
  });

  test('should upload and manage files', async ({ page }) => {
    await page.click('[data-testid="nav-cloud-storage"]');
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test content')
    });
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
  });

  test('should send emails', async ({ page }) => {
    await page.click('[data-testid="nav-email"]');
    await page.click('[data-testid="compose-email-button"]');
    await page.fill('[data-testid="email-to"]', 'test@example.com');
    await page.fill('[data-testid="email-subject"]', 'Test Email');
    await page.fill('[data-testid="email-body"]', 'Test email body');
    await page.click('[data-testid="send-email-button"]');
    await expect(page.locator('[data-testid="email-sent-confirmation"]')).toBeVisible({ timeout: 10000 });
  });

  test('should participate in discussions', async ({ page }) => {
    await page.click('[data-testid="nav-discussion"]');
    await page.click('[data-testid="new-post-button"]');
    await page.fill('[data-testid="post-title"]', 'Test Post');
    await page.fill('[data-testid="post-content"]', 'Test post content');
    await page.click('[data-testid="publish-post-button"]');
    await expect(page.locator('[data-testid="post-published"]')).toBeVisible();
  });

  test('should generate cover letters', async ({ page }) => {
    await page.click('[data-testid="nav-cover-letter"]');
    await page.fill('[data-testid="job-description"]', 'Software Developer position');
    await page.fill('[data-testid="company-name"]', 'Test Company');
    await page.click('[data-testid="generate-cover-letter-button"]');
    await expect(page.locator('[data-testid="cover-letter-generated"]')).toBeVisible({ timeout: 15000 });
  });

  test('should manage user profile', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-name"]', 'Test User');
    await page.fill('[data-testid="profile-email"]', 'test@example.com');
    await page.fill('[data-testid="profile-phone"]', '123-456-7890');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
  });

  test('should select templates', async ({ page }) => {
    await page.click('[data-testid="nav-templates"]');
    await page.click('[data-testid="select-template-button"]');
    await expect(page.locator('[data-testid="template-selected"]')).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    await page.route('**/api/resume', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Error Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Mobile Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    await expect(page.locator('[data-testid="navigation-menu"]')).toHaveAttribute('role', 'navigation');
    await expect(page.locator('[data-testid="main-content"]')).toHaveAttribute('role', 'main');
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('should perform well', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
  });
});