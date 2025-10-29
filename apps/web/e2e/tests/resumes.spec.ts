/**
 * E2E Tests - Resumes
 */

import { test, expect } from '@playwright/test';

test.describe('Resume Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/resumes');
  });

  test('should display resume list', async ({ page }) => {
    await expect(page.locator('text=Resumes')).toBeVisible();
  });

  test('should create new resume', async ({ page }) => {
    await page.click('text=New Resume');
    await expect(page).toHaveURL(/resume.*editor|create/);
  });

  test('should edit existing resume', async ({ page }) => {
    const resumeCard = page.locator('[data-testid="resume-card"]').first();
    if (await resumeCard.count() > 0) {
      await resumeCard.click();
      await expect(page).toHaveURL(/editor/);
    }
  });

  test('should export resume as PDF', async ({ page }) => {
    const exportButton = page.locator('text=Export').first();
    if (await exportButton.count() > 0) {
      await exportButton.click();
      
      // Wait for download
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        exportButton.click()
      ]);
      
      expect(download.suggestedFilename()).toContain('.pdf');
    }
  });

  test('should delete resume with confirmation', async ({ page }) => {
    const deleteButton = page.locator('text=Delete').first();
    if (await deleteButton.count() > 0) {
      deleteButton.click();
      
      // Confirm deletion
      await page.click('text=Confirm');
      
      await expect(page.locator('text=Resume deleted')).toBeVisible();
    }
  });
});

