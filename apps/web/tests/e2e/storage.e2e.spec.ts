/**
 * TEST-023 to TEST-030: End-to-End tests for My Files feature
 */

import { test, expect } from '@playwright/test';

test.describe('My Files E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('TEST-023: Complete file upload flow', async ({ page }) => {
    await page.goto('/dashboard/files');
    
    // Click upload button
    await page.click('button:has-text("Upload")');
    
    // Select file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test content'),
    });
    
    // Fill form
    await page.fill('input[name="displayName"]', 'Test Resume');
    await page.selectOption('select[name="type"]', 'resume');
    
    // Submit
    await page.click('button:has-text("Upload")');
    
    // Wait for upload to complete
    await page.waitForSelector('text=Upload complete', { timeout: 10000 });
    
    // Verify file appears in list
    await expect(page.locator('text=Test Resume')).toBeVisible();
  });

  test('TEST-024: File delete and restore flow', async ({ page }) => {
    await page.goto('/dashboard/files');
    
    // Find a file and delete it
    const fileCard = page.locator('[data-testid="file-card"]').first();
    await fileCard.hover();
    await fileCard.locator('button:has-text("Delete")').click();
    await page.click('button:has-text("Confirm")');
    
    // Verify file is removed from list
    await expect(fileCard).not.toBeVisible();
    
    // Go to trash
    await page.click('button:has-text("Trash")');
    
    // Restore file
    const deletedFile = page.locator('[data-testid="file-card"]').first();
    await deletedFile.hover();
    await deletedFile.locator('button:has-text("Restore")').click();
    
    // Verify file is restored
    await page.click('button:has-text("All Files")');
    await expect(deletedFile).toBeVisible();
  });

  test('TEST-025: File share flow', async ({ page }) => {
    await page.goto('/dashboard/files');
    
    // Select a file
    const fileCard = page.locator('[data-testid="file-card"]').first();
    await fileCard.hover();
    await fileCard.locator('button:has-text("Share")').click();
    
    // Fill share form
    await page.fill('input[name="userEmail"]', 'shared@example.com');
    await page.selectOption('select[name="permission"]', 'view');
    await page.click('button:has-text("Share")');
    
    // Verify share success message
    await expect(page.locator('text=File shared successfully')).toBeVisible();
  });

  test('TEST-026: File move to folder flow', async ({ page }) => {
    await page.goto('/dashboard/files');
    
    // Create folder first
    await page.click('button:has-text("New Folder")');
    await page.fill('input[name="name"]', 'Test Folder');
    await page.click('button:has-text("Create")');
    
    // Select file
    const fileCard = page.locator('[data-testid="file-card"]').first();
    await fileCard.click();
    
    // Move to folder
    await page.click('button:has-text("Move")');
    await page.click('text=Test Folder');
    await page.click('button:has-text("Move")');
    
    // Verify file is in folder
    await page.click('text=Test Folder');
    await expect(fileCard).toBeVisible();
  });

  test('TEST-027: Bulk operations', async ({ page }) => {
    await page.goto('/dashboard/files');
    
    // Select multiple files
    const fileCards = page.locator('[data-testid="file-card"]');
    const count = await fileCards.count();
    
    for (let i = 0; i < Math.min(3, count); i++) {
      await fileCards.nth(i).locator('input[type="checkbox"]').check();
    }
    
    // Perform bulk delete
    await page.click('button:has-text("Delete Selected")');
    await page.click('button:has-text("Confirm")');
    
    // Verify files are deleted
    await expect(page.locator('text=3 files deleted')).toBeVisible();
  });

  test('TEST-028: Search and filter functionality', async ({ page }) => {
    await page.goto('/dashboard/files');
    
    // Search for file
    await page.fill('input[placeholder*="Search"]', 'resume');
    await page.waitForTimeout(500); // Wait for debounce
    
    // Verify filtered results
    const results = page.locator('[data-testid="file-card"]');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
    
    // Filter by type
    await page.click('button:has-text("Filter")');
    await page.click('text=Resume');
    
    // Verify only resumes shown
    await expect(results.first()).toContainText('resume', { ignoreCase: true });
  });

  test('TEST-029: Storage quota display and enforcement', async ({ page }) => {
    await page.goto('/dashboard/files');
    
    // Check quota display
    const quotaDisplay = page.locator('[data-testid="storage-quota"]');
    await expect(quotaDisplay).toBeVisible();
    
    // Try to upload large file
    await page.click('button:has-text("Upload")');
    const largeFile = Buffer.alloc(11 * 1024 * 1024); // 11MB
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'large.pdf',
      mimeType: 'application/pdf',
      buffer: largeFile,
    });
    
    // Verify quota error
    await expect(page.locator('text=Storage quota exceeded')).toBeVisible();
  });

  test('TEST-030: Credentials management flow', async ({ page }) => {
    await page.goto('/dashboard/files');
    
    // Open credentials manager
    await page.click('button:has-text("Credentials")');
    
    // Add credential
    await page.click('button:has-text("Add Credential")');
    await page.fill('input[name="name"]', 'GitHub');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="url"]', 'https://github.com');
    await page.click('button:has-text("Save")');
    
    // Verify credential appears
    await expect(page.locator('text=GitHub')).toBeVisible();
    
    // Edit credential
    await page.locator('text=GitHub').click();
    await page.fill('input[name="name"]', 'GitHub Updated');
    await page.click('button:has-text("Save")');
    
    // Verify update
    await expect(page.locator('text=GitHub Updated')).toBeVisible();
  });
});

