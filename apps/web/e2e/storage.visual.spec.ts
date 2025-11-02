import { test, expect } from '@playwright/test';

test.describe('RoleReady - Cloud Storage Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to storage tab
    await page.goto('/dashboard?tab=storage');
    await page.waitForLoadState('networkidle');
    // Wait for content to be loaded and stable
    await page.locator('text=Manage your files and documents').waitFor({ state: 'visible' });
    await page.waitForTimeout(500); // Additional wait for animations to settle
  });

  test('should match cloud storage page layout', async ({ page }) => {
    // Take a screenshot of the main content area
    const storageContent = page.locator('[data-testid="cloud-storage-content"]');
    await expect(storageContent).toBeVisible();
    
    await expect(storageContent).toHaveScreenshot('cloud-storage-page.png', {
      maxDiffPixelRatio: 0.01, // Allow for minor differences (1% of pixels)
      threshold: 0.1, // Pixel threshold for comparison
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('should match upload modal layout', async ({ page }) => {
    // Click the upload button to open modal
    const uploadButton = page.locator('[title="Upload Files"], [data-testid="floating-upload-button"]').first();
    await uploadButton.click();
    
    // Wait for modal to be visible
    await page.locator('text=Upload File').waitFor({ state: 'visible' });
    await page.waitForTimeout(300); // Wait for modal animations
    
    // Take screenshot of the modal
    const modal = page.locator('[data-testid="upload-modal"], [role="dialog"]').first();
    await expect(modal).toBeVisible();
    
    await expect(modal).toHaveScreenshot('upload-modal.png', {
      maxDiffPixelRatio: 0.01,
      threshold: 0.1,
      animations: 'disabled',
    });
  });

  test('should match empty files state layout', async ({ page }) => {
    // Simulate empty state by searching for non-existent file
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('nonexistentfile12345');
      await page.waitForTimeout(500);
      
      // Check if empty state is shown
      const emptyState = page.locator('text=No files found, text=No files matching').first();
      if (await emptyState.isVisible()) {
        await expect(emptyState).toHaveScreenshot('empty-files-state.png', {
          maxDiffPixelRatio: 0.01,
          threshold: 0.1,
          animations: 'disabled',
        });
      }
    }
  });

  test('should match storage header with quota information', async ({ page }) => {
    const storageHeader = page.locator('[data-testid="storage-header"]').first();
    await expect(storageHeader).toBeVisible();
    
    await expect(storageHeader).toHaveScreenshot('storage-header.png', {
      maxDiffPixelRatio: 0.01,
      threshold: 0.1,
      animations: 'disabled',
    });
  });

  test('should match file list view (if files exist)', async ({ page }) => {
    // Wait for file list to load
    await page.waitForTimeout(1000);
    
    // Look for file cards or list items
    const fileList = page.locator('[data-testid="file-list"], .file-card, [data-testid="file-card"]').first();
    
    // Only take screenshot if files exist
    if (await fileList.count() > 0) {
      await expect(fileList.first()).toHaveScreenshot('file-card.png', {
        maxDiffPixelRatio: 0.01,
        threshold: 0.1,
        animations: 'disabled',
      });
    }
  });

  test('should match folder sidebar layout', async ({ page }) => {
    const folderSidebar = page.locator('[data-testid="folder-sidebar"], .folder-sidebar').first();
    
    if (await folderSidebar.isVisible()) {
      await expect(folderSidebar).toHaveScreenshot('folder-sidebar.png', {
        maxDiffPixelRatio: 0.01,
        threshold: 0.1,
        animations: 'disabled',
      });
    }
  });
});


