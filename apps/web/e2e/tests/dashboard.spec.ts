/**
 * E2E Tests - Dashboard
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login
    await page.goto('http://localhost:3000/dashboard');
    
    // Set auth cookie or mock API response
    await page.addInitScript(() => {
      window.localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
  });

  test('should display dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should show navigation menu', async ({ page }) => {
    const navItems = ['Resumes', 'Jobs', 'Profile'];
    
    for (const item of navItems) {
      await expect(page.locator(`text=${item}`)).toBeVisible();
    }
  });

  test('should display activity feed', async ({ page }) => {
    await expect(page.locator('text=Activity|Recent Activity')).toBeVisible();
  });

  test('should navigate to resumes page', async ({ page }) => {
    await page.click('text=Resumes');
    await expect(page).toHaveURL(/resumes/);
  });

  test('should navigate to jobs page', async ({ page }) => {
    await page.click('text=Jobs');
    await expect(page).toHaveURL(/jobs/);
  });

  test('should show to-do items', async ({ page }) => {
    const todo = page.locator('text=To Do|Tasks');
    await expect(todo).toBeVisible();
  });
});

