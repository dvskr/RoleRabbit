import { test, expect } from '@playwright/test';

test.describe('RoleReady - User Workflow Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should complete resume creation workflow', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test summary');
    await page.click('[data-testid="add-section-button"]');
    await page.fill('[data-testid="section-title-0"]', 'Experience');
    await page.fill('[data-testid="section-content-0"]', 'Software Developer');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should complete job application workflow', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'Software Developer');
    await page.fill('[data-testid="company-name"]', 'Test Company');
    await page.selectOption('[data-testid="job-status"]', 'applied');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
  });

  test('should complete AI assistance workflow', async ({ page }) => {
    await page.click('[data-testid="nav-ai-panel"]');
    await page.fill('[data-testid="ai-chat-input"]', 'Help me improve my resume');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
  });

  test('should complete file upload workflow', async ({ page }) => {
    await page.click('[data-testid="nav-cloud-storage"]');
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test content')
    });
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
  });

  test('should complete profile setup workflow', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-name"]', 'Test User');
    await page.fill('[data-testid="profile-email"]', 'test@example.com');
    await page.fill('[data-testid="profile-phone"]', '123-456-7890');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
  });
});
