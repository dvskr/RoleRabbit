import { test, expect } from '@playwright/test';

test.describe('Cloud Storage Visual Regression', () => {
  test('captures cloud storage main panel', async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForSelector('[data-testid="nav-cloud-storage"]');
    await page.click('[data-testid="nav-cloud-storage"]');
    const storageRoot = page.locator('[data-testid="cloud-storage-root"]');
    await expect(storageRoot).toBeVisible();
    await expect(storageRoot).toHaveScreenshot('cloud-storage-root.png', {
      animations: 'disabled',
      caret: 'hide'
    });
  });
});


