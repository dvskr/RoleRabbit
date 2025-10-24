import { test, expect } from '@playwright/test';

test.describe('RoleReady - Internationalization Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should support multiple languages', async ({ page }) => {
    await page.click('[data-testid="language-selector"]');
    await page.selectOption('[data-testid="language-selector"]', 'es');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('should handle RTL languages', async ({ page }) => {
    await page.click('[data-testid="language-selector"]');
    await page.selectOption('[data-testid="language-selector"]', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('should display localized content', async ({ page }) => {
    await page.click('[data-testid="language-selector"]');
    await page.selectOption('[data-testid="language-selector"]', 'fr');
    await expect(page.locator('[data-testid="main-title"]')).toContainText('Accueil');
  });
});
