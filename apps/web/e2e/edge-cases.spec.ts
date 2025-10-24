import { test, expect } from '@playwright/test';

test.describe('RoleReady - Edge Cases Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should handle empty inputs', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', '');
    await page.fill('[data-testid="resume-summary"]', '');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('should handle special characters', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Test Résumé with émojis 🚀');
    await page.fill('[data-testid="resume-summary"]', 'Special chars: @#$%^&*()');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should handle very long text', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    const longText = 'A'.repeat(5000);
    await page.fill('[data-testid="resume-summary"]', longText);
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should handle rapid clicks', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="add-section-button"]');
    }
    await expect(page.locator('[data-testid="section-title-9"]')).toBeVisible();
  });

  test('should handle network interruption', async ({ page }) => {
    await page.context().setOffline(true);
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Offline Test');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
  });

  test('should handle browser refresh', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Refresh Test');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Refresh Test');
  });
});