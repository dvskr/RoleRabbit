/**
 * E2E Test: Portfolio Editing (Section 5.4)
 *
 * Tests editing existing portfolios
 */

import { test, expect } from '@playwright/test';

test.describe('Portfolio Editing', () => {
  test('should edit existing portfolio and persist changes', async ({ page }) => {
    // Assume user is logged in with existing portfolio
    await page.goto('/dashboard');

    // Click on existing portfolio
    await page.click('[data-testid="portfolio-card"]:first-child');

    // Wait for editor to load
    await expect(page.locator('[data-testid="portfolio-editor"]')).toBeVisible();

    // Edit title
    await page.click('[data-testid="edit-title"]');
    const titleInput = page.locator('input[name="title"]');
    await titleInput.fill('');
    await titleInput.fill('Updated Portfolio Title');
    await page.click('[data-testid="save-title"]');

    // Edit subtitle
    await page.click('[data-testid="edit-subtitle"]');
    await page.fill('input[name="subtitle"]', 'Updated Subtitle');
    await page.click('[data-testid="save-subtitle"]');

    // Add new section
    await page.click('button:has-text("Add Section")');
    await page.click('text=Projects');

    // Fill project details
    await page.fill('input[name="projectName"]', 'Cool Project');
    await page.fill('textarea[name="projectDescription"]', 'A really cool project');
    await page.fill('input[name="projectUrl"]', 'https://coolproject.com');
    await page.click('button:has-text("Add Project")');

    // Save changes
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=Changes saved successfully')).toBeVisible({ timeout: 5000 });

    // Refresh page to verify persistence
    await page.reload();
    await expect(page.locator('text=Updated Portfolio Title')).toBeVisible();
    await expect(page.locator('text=Updated Subtitle')).toBeVisible();
    await expect(page.locator('text=Cool Project')).toBeVisible();
  });

  test('should reorder sections with drag and drop', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');

    // Wait for sections to load
    await expect(page.locator('[data-testid="section"]')).toHaveCount(3, { timeout: 5000 });

    // Get initial order
    const firstSection = page.locator('[data-testid="section"]').first();
    const firstSectionText = await firstSection.textContent();

    // Drag first section to third position
    await firstSection.dragTo(page.locator('[data-testid="section"]').nth(2));

    // Verify order changed
    const newFirstSection = page.locator('[data-testid="section"]').first();
    const newFirstSectionText = await newFirstSection.textContent();
    expect(newFirstSectionText).not.toBe(firstSectionText);

    // Save
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=Changes saved')).toBeVisible();
  });

  test('should update theme colors', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');

    // Open theme settings
    await page.click('[data-testid="theme-settings"]');

    // Change primary color
    await page.fill('input[name="primaryColor"]', '#FF5733');

    // Change font
    await page.selectOption('select[name="fontFamily"]', 'Roboto');

    // Apply changes
    await page.click('button:has-text("Apply Theme")');

    // Verify preview updates
    const heroSection = page.locator('[data-testid="section-hero"]');
    await expect(heroSection).toHaveCSS('color', 'rgb(255, 87, 51)');

    // Save
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=Theme updated')).toBeVisible();
  });

  test('should delete section with confirmation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');

    // Count initial sections
    const initialCount = await page.locator('[data-testid="section"]').count();

    // Delete a section
    await page.click('[data-testid="section"]').first().locator('[data-testid="delete-section"]');

    // Confirm deletion
    await page.click('button:has-text("Confirm Delete")');

    // Verify section removed
    await expect(page.locator('[data-testid="section"]')).toHaveCount(initialCount - 1);

    // Save
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=Section deleted')).toBeVisible();
  });

  test('should cancel changes without saving', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');

    // Get original title
    const originalTitle = await page.locator('h1').textContent();

    // Make changes
    await page.click('[data-testid="edit-title"]');
    await page.fill('input[name="title"]', 'Temporary Change');

    // Cancel
    await page.click('button:has-text("Cancel")');

    // Verify original title restored
    await expect(page.locator('h1')).toHaveText(originalTitle!);
  });
});
