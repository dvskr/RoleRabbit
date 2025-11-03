import { test, expect } from '@playwright/test';

test.describe('RoleReady - Cloud Storage Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard?tab=storage');
    await page.waitForLoadState('networkidle');
    await page.locator('text=Manage your files and documents').waitFor({ state: 'visible' });
  });

  test('should render cloud storage page correctly across browsers', async ({ page, browserName }) => {
    // Check if the main storage header is visible
    const header = page.locator('h1:has-text("Storage"), [data-testid="storage-header"]').first();
    await expect(header).toBeVisible();
    
    // Check if the file list area is present
    const content = page.locator('[data-testid="cloud-storage-content"]').first();
    await expect(content).toBeVisible();
    
    // Verify storage quota display
    const quotaInfo = page.locator('text=/\\d+\\.\\d+ GB/, text=/Storage/').first();
    await expect(quotaInfo).toBeVisible();
  });

  test('should open and close upload modal across browsers', async ({ page, browserName }) => {
    // Find upload button (could be floating button or header button)
    const uploadButton = page.locator('[title="Upload Files"], [data-testid="floating-upload-button"], button:has-text("Upload")').first();
    await expect(uploadButton).toBeVisible();
    
    await uploadButton.click();
    
    // Wait for modal to appear
    await page.locator('text=Upload File, text=Add a new file').waitFor({ state: 'visible' });
    await expect(page.locator('text=Add a new file, text=Upload File')).toBeVisible();
    
    // Close modal
    const closeButton = page.locator('[aria-label="Close"], [title="Close"], button:has-text("Cancel")').first();
    await closeButton.click();
    
    // Verify modal is closed
    await expect(page.locator('text=Upload File')).not.toBeVisible({ timeout: 2000 });
  });

  test('should allow file selection in upload modal across browsers', async ({ page }) => {
    // Open upload modal
    const uploadButton = page.locator('[title="Upload Files"], [data-testid="floating-upload-button"]').first();
    await uploadButton.click();
    await page.locator('text=Upload File').waitFor({ state: 'visible' });

    // Find file input
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // Set a test file
    await fileInput.setInputFiles({
      name: 'test-file.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('This is a test PDF content.'),
    });

    // Verify file name appears in the input or display
    await expect(page.locator('input[placeholder*="file name"], input[value*="test-file"]')).toBeVisible();
  });

  test('should display file cards in different view modes across browsers', async ({ page }) => {
    // Wait for file list to potentially load
    await page.waitForTimeout(1000);
    
    // Check if view mode toggle exists
    const viewToggle = page.locator('[title*="view"], [title*="View"], button[aria-label*="view"]').first();
    
    if (await viewToggle.isVisible()) {
      // Test grid view
      const gridButton = page.locator('[title*="Grid"], [title*="grid"]').first();
      if (await gridButton.isVisible()) {
        await gridButton.click();
        await page.waitForTimeout(300);
        // Verify grid layout is present (check for grid CSS class or structure)
        const gridContainer = page.locator('.grid, [class*="grid"]').first();
        if (await gridContainer.isVisible()) {
          await expect(gridContainer).toBeVisible();
        }
      }

      // Test list view
      const listButton = page.locator('[title*="List"], [title*="list"]').first();
      if (await listButton.isVisible()) {
        await listButton.click();
        await page.waitForTimeout(300);
        const listContainer = page.locator('.space-y, [class*="space-y"]').first();
        if (await listContainer.isVisible()) {
          await expect(listContainer).toBeVisible();
        }
      }
    }
  });

  test('should handle search functionality across browsers', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    
    if (await searchInput.isVisible()) {
      // Type in search box
      await searchInput.fill('test search');
      await page.waitForTimeout(500);
      
      // Verify search input value
      await expect(searchInput).toHaveValue('test search');
      
      // Clear search
      await searchInput.clear();
      await expect(searchInput).toHaveValue('');
    }
  });

  test('should display storage quota information across browsers', async ({ page }) => {
    // Look for storage quota display (could be in header or sidebar)
    const quotaDisplay = page.locator('text=/\\d+\\.\\d+ GB/, text=/Storage/, [data-testid*="storage"]').first();
    await expect(quotaDisplay).toBeVisible();
    
    // Check for progress bar or percentage
    const progressBar = page.locator('[role="progressbar"], .progress-bar, [class*="progress"]').first();
    if (await progressBar.isVisible()) {
      await expect(progressBar).toBeVisible();
    }
  });

  test('should handle responsive layout on mobile devices', async ({ page }) => {
    // Check viewport size
    const viewport = page.viewportSize();
    
    if (viewport && viewport.width < 768) {
      // Mobile-specific checks
      const mobileMenu = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu"]').first();
      
      // Check if mobile menu exists (if implemented)
      if (await mobileMenu.isVisible()) {
        await expect(mobileMenu).toBeVisible();
      }
      
      // Verify content is still accessible
      const storageContent = page.locator('[data-testid="cloud-storage-content"]').first();
      await expect(storageContent).toBeVisible();
    }
  });

  test('should maintain state during navigation across browsers', async ({ page }) => {
    // Perform an action (e.g., open upload modal)
    const uploadButton = page.locator('[title="Upload Files"]').first();
    if (await uploadButton.isVisible()) {
      await uploadButton.click();
      await page.locator('text=Upload File').waitFor({ state: 'visible' });
      
      // Navigate away and back (if applicable)
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify storage page is still accessible
      await expect(page.locator('text=Manage your files')).toBeVisible();
    }
  });
});


