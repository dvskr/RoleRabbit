/**
 * E2E Tests - Authentication
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('should show registration form', async ({ page }) => {
    await page.click('text=Sign up');
    await expect(page.locator('text=Create Account')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should redirect to landing page on logout', async ({ page }) => {
    // First login
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/dashboard/);
    
    // Then logout
    await page.click('text=Logout');
    await expect(page).toHaveURL(/landing|login/);
  });
});

