import { test, expect } from '@playwright/test';

test.describe('RoleReady - Visual Regression Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should match main page layout', async ({ page }) => {
    await expect(page.locator('[data-testid="main-container"]')).toHaveScreenshot('main-page.png');
  });

  test('should match resume editor layout', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-editor-content"]')).toHaveScreenshot('resume-editor.png');
  });

  test('should match AI panel layout', async ({ page }) => {
    await page.click('[data-testid="nav-ai-panel"]');
    await expect(page.locator('[data-testid="ai-panel-content"]')).toHaveScreenshot('ai-panel.png');
  });

  test('should match job tracker layout', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    await expect(page.locator('[data-testid="job-tracker-content"]')).toHaveScreenshot('job-tracker.png');
  });

  test('should match cloud storage layout', async ({ page }) => {
    await page.click('[data-testid="nav-cloud-storage"]');
    await expect(page.locator('[data-testid="cloud-storage-content"]')).toHaveScreenshot('cloud-storage.png');
  });

  test('should match email layout', async ({ page }) => {
    await page.click('[data-testid="nav-email"]');
    await expect(page.locator('[data-testid="email-content"]')).toHaveScreenshot('email.png');
  });

  test('should match discussion layout', async ({ page }) => {
    await page.click('[data-testid="nav-discussion"]');
    await expect(page.locator('[data-testid="discussion-content"]')).toHaveScreenshot('discussion.png');
  });

  test('should match cover letter generator layout', async ({ page }) => {
    await page.click('[data-testid="nav-cover-letter"]');
    await expect(page.locator('[data-testid="cover-letter-content"]')).toHaveScreenshot('cover-letter.png');
  });

  test('should match profile layout', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    await expect(page.locator('[data-testid="profile-content"]')).toHaveScreenshot('profile.png');
  });

  test('should match templates layout', async ({ page }) => {
    await page.click('[data-testid="nav-templates"]');
    await expect(page.locator('[data-testid="templates-content"]')).toHaveScreenshot('templates.png');
  });
});
