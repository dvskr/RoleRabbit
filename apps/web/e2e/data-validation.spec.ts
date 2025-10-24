import { test, expect } from '@playwright/test';

test.describe('RoleReady - Data Validation Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', '');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-email"]', 'invalid-email');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="email-validation-error"]')).toBeVisible();
  });

  test('should validate phone format', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-phone"]', '123');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="phone-validation-error"]')).toBeVisible();
  });

  test('should validate file types', async ({ page }) => {
    await page.click('[data-testid="nav-cloud-storage"]');
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: 'test.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('test')
    });
    await expect(page.locator('[data-testid="invalid-file-error"]')).toBeVisible();
  });

  test('should validate input length', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    const longText = 'A'.repeat(10000);
    await page.fill('[data-testid="resume-summary"]', longText);
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="length-validation-error"]')).toBeVisible();
  });
});
