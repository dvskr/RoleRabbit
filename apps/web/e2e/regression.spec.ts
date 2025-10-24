import { test, expect } from '@playwright/test';

test.describe('RoleReady - Regression Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should maintain core functionality after updates', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Regression Test');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should maintain navigation after updates', async ({ page }) => {
    const navItems = ['nav-home', 'nav-resume-editor', 'nav-ai-panel'];
    for (const item of navItems) {
      await page.click(`[data-testid="${item}"]`);
      await expect(page.locator(`[data-testid="${item.replace('nav-', '')}-content"]`)).toBeVisible();
    }
  });

  test('should maintain form functionality after updates', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-name"]', 'Regression User');
    await page.fill('[data-testid="profile-email"]', 'regression@test.com');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
  });

  test('should maintain API integration after updates', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'API Test');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should maintain error handling after updates', async ({ page }) => {
    await page.route('**/api/resume', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.click('[data-testid="load-resume-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});