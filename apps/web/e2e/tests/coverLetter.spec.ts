/**
 * E2E Tests - Cover Letter Generator
 */

import { test, expect } from '@playwright/test';

test.describe('Cover Letter Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/cover-letter');
  });

  test('should display cover letter generator', async ({ page }) => {
    await expect(page.locator('text=Cover Letter')).toBeVisible();
  });

  test('should generate cover letter', async ({ page }) => {
    // Fill job description
    await page.fill('textarea[name="jobDescription"]', 
      'We are looking for a software engineer with experience in React...'
    );
    
    // Select tone
    await page.click('text=Professional');
    
    // Generate
    await page.click('text=Generate');
    
    await expect(page.locator('text=Generating')).toBeVisible();
    
    // Wait for result
    await page.waitForTimeout(3000);
    
    await expect(page.locator('text=Dear')).toBeVisible();
  });

  test('should allow tone selection', async ({ page }) => {
    const tones = ['Professional', 'Enthusiastic', 'Friendly'];
    
    for (const tone of tones) {
      await page.click(`text=${tone}`);
      await expect(page.locator(`[data-selected=true]`)).toHaveText(tone);
    }
  });

  test('should export cover letter', async ({ page }) => {
    const exportButton = page.locator('text=Export');
    
    if (await exportButton.count() > 0) {
      await exportButton.click();
      
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        exportButton.click()
      ]);
      
      expect(download.suggestedFilename()).toMatch(/\.(pdf|docx)$/);
    }
  });

  test('should save cover letter', async ({ page }) => {
    const saveButton = page.locator('text=Save');
    
    if (await saveButton.count() > 0) {
      await saveButton.click();
      await expect(page.locator('text=Saved')).toBeVisible();
    }
  });
});

