import { test, expect } from '@playwright/test';

test.describe('RoleReady - Smoke Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should load main page', async ({ page }) => {
    await expect(page.locator('[data-testid="main-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="navigation-menu"]')).toBeVisible();
  });

  test('should navigate to resume editor', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-editor-content"]')).toBeVisible();
  });

  test('should navigate to AI panel', async ({ page }) => {
    await page.click('[data-testid="nav-ai-panel"]');
    await expect(page.locator('[data-testid="ai-panel-content"]')).toBeVisible();
  });

  test('should navigate to job tracker', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    await expect(page.locator('[data-testid="job-tracker-content"]')).toBeVisible();
  });

  test('should navigate to cloud storage', async ({ page }) => {
    await page.click('[data-testid="nav-cloud-storage"]');
    await expect(page.locator('[data-testid="cloud-storage-content"]')).toBeVisible();
  });

  test('should navigate to email', async ({ page }) => {
    await page.click('[data-testid="nav-email"]');
    await expect(page.locator('[data-testid="email-content"]')).toBeVisible();
  });

  test('should navigate to discussion', async ({ page }) => {
    await page.click('[data-testid="nav-discussion"]');
    await expect(page.locator('[data-testid="discussion-content"]')).toBeVisible();
  });

  test('should navigate to cover letter generator', async ({ page }) => {
    await page.click('[data-testid="nav-cover-letter"]');
    await expect(page.locator('[data-testid="cover-letter-content"]')).toBeVisible();
  });

  test('should navigate to profile', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    await expect(page.locator('[data-testid="profile-content"]')).toBeVisible();
  });

  test('should navigate to templates', async ({ page }) => {
    await page.click('[data-testid="nav-templates"]');
    await expect(page.locator('[data-testid="templates-content"]')).toBeVisible();
  });
});