import { test, expect } from '@playwright/test';

test.describe('Cloud Storage Cross-Browser Smoke', () => {
  test('renders cloud storage workspace consistently', async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForSelector('[data-testid="nav-cloud-storage"]');
    await page.click('[data-testid="nav-cloud-storage"]');

    const storageRoot = page.locator('[data-testid="cloud-storage-root"]');
    await expect(storageRoot).toBeVisible();
    await expect(page.locator('[data-testid="storage-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="storage-filters"]')).toBeVisible();
    await expect(page.locator('[data-testid="cloud-storage-content"]')).toBeVisible();
  });
});


