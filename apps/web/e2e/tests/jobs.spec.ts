/**
 * E2E Tests - Job Tracker
 */

import { test, expect } from '@playwright/test';

test.describe('Job Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/jobs');
  });

  test('should display job list', async ({ page }) => {
    await expect(page.locator('text=Job Tracker|Jobs')).toBeVisible();
  });

  test('should add new job application', async ({ page }) => {
    await page.click('text=Add Job');
    
    await page.fill('input[name="title"]', 'Software Engineer');
    await page.fill('input[name="company"]', 'Tech Corp');
    await page.selectOption('select[name="status"]', 'applied');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Job added')).toBeVisible();
  });

  test('should filter jobs by status', async ({ page }) => {
    await page.click('text=Applied');
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    const statuses = page.locator('[data-status="applied"]');
    await expect(statuses.count()).toBeGreaterThan(0);
  });

  test('should update job status', async ({ page }) => {
    const jobCard = page.locator('[data-testid="job-card"]').first();
    
    if (await jobCard.count() > 0) {
      await jobCard.click();
      
      await page.click('select[name="status"]');
      await page.selectOption('select[name="status"]', 'interview');
      
      await expect(page.locator('text=Status updated')).toBeVisible();
    }
  });

  test('should search jobs', async ({ page }) => {
    await page.fill('input[placeholder*="search"]', 'engineer');
    
    await page.waitForTimeout(300);
    
    const results = page.locator('[data-testid="job-card"]');
    await expect(results.count()).toBeGreaterThan(0);
  });

  test('should view job details', async ({ page }) => {
    const jobCard = page.locator('[data-testid="job-card"]').first();
    
    if (await jobCard.count() > 0) {
      await jobCard.click();
      await expect(page.locator('text=Details')).toBeVisible();
    }
  });
});

