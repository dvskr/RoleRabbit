/**
 * E2E tests for profile save flow
 * Tests the complete user flow of editing and saving profile data
 */

import { test, expect } from '@playwright/test';

test.describe('Profile Save Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to profile page
    await page.goto('/profile');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="profile-header"]', { timeout: 10000 });
  });

  test('should save profile changes successfully', async ({ page }) => {
    // Click edit button
    await page.click('button:has-text("Edit")');
    
    // Wait for edit mode
    await page.waitForSelector('input[name="firstName"]', { state: 'visible' });
    
    // Update first name
    await page.fill('input[name="firstName"]', 'Updated Name');
    
    // Click save button
    await page.click('button:has-text("Save")');
    
    // Wait for save to complete
    await page.waitForSelector('button:has-text("Saved")', { timeout: 5000 });
    
    // Verify success message or saved state
    const savedButton = await page.locator('button:has-text("Saved")');
    await expect(savedButton).toBeVisible();
  });

  test('should save work experience changes', async ({ page }) => {
    // Navigate to professional tab
    await page.click('button:has-text("Professional")');
    
    // Click edit button
    await page.click('button:has-text("Edit")');
    
    // Add or edit work experience
    const addExpButton = page.locator('button:has-text("Add Experience")');
    if (await addExpButton.isVisible()) {
      await addExpButton.click();
    }
    
    // Fill in work experience fields
    await page.fill('input[name*="company"]', 'Test Company');
    await page.fill('input[name*="role"]', 'Test Role');
    await page.fill('input[name*="startDate"]', '2020-01');
    
    // Click save
    await page.click('button:has-text("Save")');
    
    // Verify save success
    await page.waitForSelector('button:has-text("Saved")', { timeout: 5000 });
  });

  test('should save project technologies', async ({ page }) => {
    // Navigate to professional tab
    await page.click('button:has-text("Professional")');
    
    // Click edit button
    await page.click('button:has-text("Edit")');
    
    // Scroll to projects section
    await page.locator('h2:has-text("Projects")').scrollIntoViewIfNeeded();
    
    // Add or edit project
    const addProjectButton = page.locator('button:has-text("Add Project")');
    if (await addProjectButton.isVisible()) {
      await addProjectButton.click();
    }
    
    // Fill project fields
    await page.fill('input[name*="title"]', 'Test Project');
    await page.fill('textarea[name*="description"]', 'Test description');
    
    // Add technologies
    const techInput = page.locator('input[id*="technologies"]').first();
    await techInput.fill('React, TypeScript, Node.js');
    await techInput.blur(); // Trigger blur to sync
    
    // Click save
    await page.click('button:has-text("Save")');
    
    // Wait for save
    await page.waitForSelector('button:has-text("Saved")', { timeout: 5000 });
    
    // Verify technologies were saved (reload page or check display)
    await page.reload();
    await page.waitForSelector('[data-testid="profile-header"]');
    
    // Navigate back to professional tab
    await page.click('button:has-text("Professional")');
    
    // Verify technologies are displayed
    const techText = page.locator('text=React');
    await expect(techText.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle save errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/users/profile', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Click edit and make a change
    await page.click('button:has-text("Edit")');
    await page.fill('input[name="firstName"]', 'Test');
    
    // Try to save
    await page.click('button:has-text("Save")');
    
    // Verify error message is shown
    await page.waitForSelector('text=/error|failed/i', { timeout: 5000 });
  });

  test('should sync technologies before save', async ({ page }) => {
    // Navigate to professional tab
    await page.click('button:has-text("Professional")');
    
    // Click edit
    await page.click('button:has-text("Edit")');
    
    // Add project
    const addProjectButton = page.locator('button:has-text("Add Project")');
    if (await addProjectButton.isVisible()) {
      await addProjectButton.click();
    }
    
    // Type technologies but don't blur
    const techInput = page.locator('input[id*="technologies"]').first();
    await techInput.fill('React, TypeScript');
    
    // Immediately click save (without blurring)
    await page.click('button:has-text("Save")');
    
    // Wait for save
    await page.waitForSelector('button:has-text("Saved")', { timeout: 5000 });
    
    // Reload and verify technologies were saved
    await page.reload();
    await page.waitForSelector('[data-testid="profile-header"]');
    await page.click('button:has-text("Professional")');
    
    // Verify technologies appear
    await expect(page.locator('text=React').first()).toBeVisible({ timeout: 5000 });
  });
});

