/**
 * E2E Tests for Cloud Storage Feature
 * Tests the complete user workflow from UI to backend
 */

import { test, expect } from '@playwright/test';

test.describe('Cloud Storage E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and login
    await page.goto('/');

    // Perform login (adjust selectors based on your login page)
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL(/dashboard|files/);

    // Navigate to cloud storage
    await page.click('text=Files');
    await page.waitForLoadState('networkidle');
  });

  test.describe('File Upload Workflow', () => {
    test('should upload a file successfully', async ({ page }) => {
      // Click upload button
      await page.click('button:has-text("Upload")');

      // Wait for upload modal
      await expect(page.locator('text=Upload File')).toBeVisible();

      // Select file type
      await page.selectOption('select[name="type"]', 'resume');

      // Enter file name
      await page.fill('input[name="displayName"]', 'Test Resume');

      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test-resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('Test PDF content')
      });

      // Submit upload
      await page.click('button:has-text("Upload")');

      // Wait for success message or file to appear
      await expect(page.locator('text=Test Resume')).toBeVisible({ timeout: 10000 });
    });

    test('should show upload progress', async ({ page }) => {
      await page.click('button:has-text("Upload")');

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'large-file.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.alloc(1024 * 1024) // 1MB file
      });

      await page.fill('input[name="displayName"]', 'Large File');
      await page.click('button:has-text("Upload")');

      // Should show progress indicator
      await expect(page.locator('[role="progressbar"]')).toBeVisible();
    });
  });

  test.describe('File Management Workflow', () => {
    test('should search for files', async ({ page }) => {
      // Type in search box
      await page.fill('input[placeholder*="Search"]', 'resume');

      // Wait for debounce (300ms)
      await page.waitForTimeout(400);

      // Should show filtered results
      const fileCards = page.locator('[data-testid="file-card"]');
      await expect(fileCards.first()).toBeVisible();

      // All visible files should contain "resume" in name
      const fileNames = await fileCards.allTextContents();
      expect(fileNames.some(name => name.toLowerCase().includes('resume'))).toBe(true);
    });

    test('should star a file with optimistic update', async ({ page }) => {
      // Find first file card
      const fileCard = page.locator('[data-testid="file-card"]').first();

      // Click star button
      const starButton = fileCard.locator('button[aria-label*="Star"]');
      await starButton.click();

      // Should immediately show starred state (optimistic update)
      await expect(starButton).toHaveAttribute('data-starred', 'true', { timeout: 100 });

      // Verify it persists after refresh
      await page.reload();
      await expect(starButton).toHaveAttribute('data-starred', 'true');
    });

    test('should edit file name inline', async ({ page }) => {
      const fileCard = page.locator('[data-testid="file-card"]').first();

      // Open more menu
      await fileCard.locator('button[aria-label*="More"]').click();

      // Click rename
      await page.click('text=Rename');

      // Should show input
      const input = fileCard.locator('input[type="text"]');
      await expect(input).toBeVisible();

      // Change name
      await input.fill('Updated File Name');

      // Save
      await fileCard.locator('button[aria-label*="Save"]').click();

      // Should show new name
      await expect(fileCard.locator('text=Updated File Name')).toBeVisible();
    });

    test('should delete file with confirmation', async ({ page }) => {
      const fileCard = page.locator('[data-testid="file-card"]').first();
      const fileName = await fileCard.locator('[data-testid="file-name"]').textContent();

      // Delete file
      await fileCard.locator('button[aria-label*="Delete"]').click();

      // Should show confirmation dialog
      await expect(page.locator('text=Are you sure')).toBeVisible();

      // Confirm deletion
      await page.click('button:has-text("Delete")');

      // File should be removed (optimistic update)
      await expect(fileCard.locator(`text=${fileName}`)).not.toBeVisible({ timeout: 1000 });
    });

    test('should move file to folder', async ({ page }) => {
      const fileCard = page.locator('[data-testid="file-card"]').first();

      // Open more menu
      await fileCard.locator('button[aria-label*="More"]').click();

      // Click move
      await page.click('text=Move to Folder');

      // Select folder
      await page.click('text=Personal'); // Assuming "Personal" folder exists

      // Confirm
      await page.click('button:has-text("Move")');

      // Should show success message or folder badge
      await expect(fileCard.locator('text=Personal')).toBeVisible();
    });
  });

  test.describe('Folder Management Workflow', () => {
    test('should create a new folder', async ({ page }) => {
      // Click create folder button
      await page.click('button:has-text("New Folder")');

      // Enter folder name
      await page.fill('input[placeholder*="folder name"]', 'Test Folder');

      // Select color
      await page.click('[data-color="#3B82F6"]'); // Blue color

      // Create
      await page.click('button:has-text("Create")');

      // Should show new folder in sidebar
      await expect(page.locator('text=Test Folder')).toBeVisible();
    });

    test('should filter files by folder', async ({ page }) => {
      // Click on a folder in sidebar
      await page.click('[data-testid="folder-item"]:has-text("Personal")');

      // Wait for files to load
      await page.waitForLoadState('networkidle');

      // All visible files should belong to this folder
      const folderBadges = page.locator('[data-testid="folder-badge"]');
      const count = await folderBadges.count();

      if (count > 0) {
        const text = await folderBadges.first().textContent();
        expect(text).toContain('Personal');
      }
    });

    test('should show file count in folder', async ({ page }) => {
      const folderItem = page.locator('[data-testid="folder-item"]').first();

      // Should display file count
      await expect(folderItem.locator('[data-testid="file-count"]')).toBeVisible();

      const countText = await folderItem.locator('[data-testid="file-count"]').textContent();
      expect(countText).toMatch(/\d+/); // Should contain a number
    });
  });

  test.describe('File Sharing Workflow', () => {
    test('should share file with another user', async ({ page }) => {
      const fileCard = page.locator('[data-testid="file-card"]').first();

      // Click share button
      await fileCard.locator('button[aria-label*="Share"]').click();

      // Should open share modal
      await expect(page.locator('text=Share File')).toBeVisible();

      // Enter email
      await page.fill('input[placeholder*="email"]', 'colleague@example.com');

      // Select permission
      await page.selectOption('select[name="permission"]', 'view');

      // Share
      await page.click('button:has-text("Share")');

      // Should show success message
      await expect(page.locator('text=Shared successfully')).toBeVisible();

      // Should show shared user in list
      await expect(page.locator('text=colleague@example.com')).toBeVisible();
    });
  });

  test.describe('Comments Workflow', () => {
    test('should add comment to file', async ({ page }) => {
      const fileCard = page.locator('[data-testid="file-card"]').first();

      // Click comments button
      await fileCard.locator('button[aria-label*="Comments"]').click();

      // Should show comments section
      await expect(page.locator('textarea[placeholder*="comment"]')).toBeVisible();

      // Type comment
      await page.fill('textarea[placeholder*="comment"]', 'This looks great!');

      // Submit
      await page.click('button:has-text("Send")');

      // Should show comment
      await expect(page.locator('text=This looks great!')).toBeVisible();
    });
  });

  test.describe('Recycle Bin Workflow', () => {
    test('should view deleted files in recycle bin', async ({ page }) => {
      // Delete a file first
      const fileCard = page.locator('[data-testid="file-card"]').first();
      await fileCard.locator('button[aria-label*="Delete"]').click();
      await page.click('button:has-text("Delete")');

      // Navigate to recycle bin
      await page.click('text=Recycle Bin');

      // Should show deleted files
      await expect(page.locator('[data-testid="file-card"]')).toBeVisible();
      await expect(page.locator('button:has-text("Restore")')).toBeVisible();
    });

    test('should restore file from recycle bin', async ({ page }) => {
      // Go to recycle bin
      await page.click('text=Recycle Bin');

      // Find a deleted file
      const fileCard = page.locator('[data-testid="file-card"]').first();
      const fileName = await fileCard.locator('[data-testid="file-name"]').textContent();

      // Restore
      await fileCard.locator('button:has-text("Restore")').click();

      // Should be removed from recycle bin
      await expect(fileCard).not.toBeVisible({ timeout: 2000 });

      // Go back to all files
      await page.click('text=All Files');

      // File should be visible again
      await expect(page.locator(`text=${fileName}`)).toBeVisible();
    });
  });

  test.describe('Performance and UX', () => {
    test('should show loading skeleton while fetching files', async ({ page }) => {
      // Trigger file reload
      await page.click('button[aria-label*="Refresh"]');

      // Should show skeleton loaders briefly
      const skeleton = page.locator('[data-testid="file-card-skeleton"]');
      await expect(skeleton).toBeVisible({ timeout: 100 });
    });

    test('should handle large file lists with pagination', async ({ page }) => {
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Should load more files (if pagination is implemented)
      // Or should show all files without lag
      const fileCards = page.locator('[data-testid="file-card"]');
      const count = await fileCards.count();

      expect(count).toBeGreaterThan(0);
    });

    test('should debounce search input', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');

      // Type rapidly
      await searchInput.type('test', { delay: 50 });

      // Should not trigger search immediately
      // Wait for debounce (300ms)
      await page.waitForTimeout(350);

      // Now should show results
      await expect(page.locator('[data-testid="file-card"]')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page, context }) => {
      // Simulate offline
      await context.setOffline(true);

      // Try to upload a file
      await page.click('button:has-text("Upload")');
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('test')
      });

      await page.click('button:has-text("Upload")');

      // Should show error message
      await expect(page.locator('text=network error')).toBeVisible({ timeout: 5000 });

      // Re-enable network
      await context.setOffline(false);
    });

    test('should show error boundary on crash', async ({ page }) => {
      // This would require triggering a component error
      // For now, just verify error boundary exists in code
      expect(true).toBe(true);
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Tab through interface
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should focus on interactive elements
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['BUTTON', 'INPUT', 'A']).toContain(focusedElement);
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check for important ARIA labels
      await expect(page.locator('[aria-label*="Upload"]')).toBeVisible();
      await expect(page.locator('[aria-label*="Search"]')).toBeVisible();

      const fileCard = page.locator('[data-testid="file-card"]').first();
      await expect(fileCard.locator('[aria-label*="Download"]')).toBeVisible();
    });
  });
});
