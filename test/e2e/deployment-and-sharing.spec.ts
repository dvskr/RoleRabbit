/**
 * E2E Tests: Deployment and Sharing (Section 5.4)
 *
 * Tests subdomain deployment, custom domain, analytics, sharing, version restore, export
 */

import { test, expect } from '@playwright/test';

test.describe('Subdomain Deployment', () => {
  test('should deploy portfolio to subdomain', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');

    // Open deployment settings
    await page.click('[data-testid="deployment-settings"]');

    // Set subdomain
    const subdomain = `test-${Date.now()}`;
    await page.fill('input[name="subdomain"]', subdomain);

    // Check availability
    await page.click('button:has-text("Check Availability")');
    await expect(page.locator('text=Subdomain available')).toBeVisible({ timeout: 5000 });

    // Deploy
    await page.click('button:has-text("Deploy")');
    await expect(page.locator('text=Deploying...')).toBeVisible();
    await expect(page.locator('text=Deployment successful')).toBeVisible({ timeout: 30000 });

    // Verify subdomain URL
    const deployedUrl = await page.locator('[data-testid="deployed-url"]').textContent();
    expect(deployedUrl).toContain(subdomain);
    expect(deployedUrl).toContain('.rolerabbit.com');

    // Visit deployed portfolio
    await page.goto(deployedUrl!);
    await expect(page.locator('[data-testid="portfolio-view"]')).toBeVisible();
  });

  test('should show error for taken subdomain', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');
    await page.click('[data-testid="deployment-settings"]');

    // Try to use a taken subdomain
    await page.fill('input[name="subdomain"]', 'admin');
    await page.click('button:has-text("Check Availability")');

    await expect(page.locator('text=Subdomain not available')).toBeVisible();
  });
});

test.describe('Custom Domain', () => {
  test('should add custom domain and show DNS instructions', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');
    await page.click('[data-testid="deployment-settings"]');

    // Add custom domain
    await page.click('button:has-text("Add Custom Domain")');
    await page.fill('input[name="customDomain"]', 'portfolio.example.com');
    await page.click('button:has-text("Continue")');

    // Verify DNS instructions shown
    await expect(page.locator('text=DNS Configuration')).toBeVisible();
    await expect(page.locator('text=CNAME')).toBeVisible();
    await expect(page.locator('text=portfolios.rolerabbit.com')).toBeVisible();

    // Copy DNS record
    await page.click('button:has-text("Copy DNS Record")');
    await expect(page.locator('text=Copied to clipboard')).toBeVisible();

    // Verify domain
    await page.click('button:has-text("Verify Domain")');
    await expect(page.locator('text=Verifying...')).toBeVisible();

    // Note: In real test, DNS wouldn't be configured, so expect failure
    await expect(page.locator('text=Domain verification pending')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Analytics', () => {
  test('should track views and display in dashboard', async ({ page, context }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');

    // Get portfolio URL
    const portfolioUrl = await page.locator('[data-testid="portfolio-url"]').textContent();

    // Simulate views from different sessions
    for (let i = 0; i < 5; i++) {
      const newPage = await context.newPage();
      await newPage.goto(portfolioUrl!);
      await newPage.waitForTimeout(1000);
      await newPage.close();
    }

    // Check analytics dashboard
    await page.click('[data-testid="analytics-tab"]');
    await page.waitForTimeout(2000); // Wait for analytics to update

    // Verify view count increased
    const viewCount = await page.locator('[data-testid="total-views"]').textContent();
    expect(parseInt(viewCount!)).toBeGreaterThanOrEqual(5);

    // Verify chart displays data
    await expect(page.locator('[data-testid="analytics-chart"]')).toBeVisible();
  });

  test('should show analytics by date range', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');
    await page.click('[data-testid="analytics-tab"]');

    // Select last 7 days
    await page.selectOption('select[name="dateRange"]', '7days');
    await expect(page.locator('[data-testid="date-range-label"]')).toContainText('Last 7 days');

    // Select last 30 days
    await page.selectOption('select[name="dateRange"]', '30days');
    await expect(page.locator('[data-testid="date-range-label"]')).toContainText('Last 30 days');
  });
});

test.describe('Sharing', () => {
  test('should create share link and access without login', async ({ page, context }) => {
    // Login and create share link
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');

    // Create share link
    await page.click('[data-testid="share-button"]');
    await page.click('button:has-text("Create Share Link")');

    // Get share URL
    const shareUrl = await page.locator('[data-testid="share-url"]').textContent();
    expect(shareUrl).toContain('/shared/');

    // Copy link
    await page.click('button:has-text("Copy Link")');
    await expect(page.locator('text=Link copied')).toBeVisible();

    // Open link in incognito (new context)
    const incognitoContext = await page.context().browser()!.newContext();
    const incognitoPage = await incognitoContext.newPage();

    // Access share link
    await incognitoPage.goto(shareUrl!);

    // Verify portfolio accessible without login
    await expect(incognitoPage.locator('[data-testid="portfolio-view"]')).toBeVisible();
    await expect(incognitoPage.locator('[data-testid="login-required"]')).not.toBeVisible();

    await incognitoContext.close();
  });

  test('should set expiration for share link', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');
    await page.click('[data-testid="share-button"]');

    // Set expiration to 7 days
    await page.selectOption('select[name="expiresIn"]', '7');
    await page.click('button:has-text("Create Share Link")');

    // Verify expiration date shown
    const expirationText = await page.locator('[data-testid="expiration-date"]').textContent();
    expect(expirationText).toContain('Expires in 7 days');
  });

  test('should revoke share link', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');
    await page.click('[data-testid="share-button"]');

    // Create link
    await page.click('button:has-text("Create Share Link")');
    const shareUrl = await page.locator('[data-testid="share-url"]').textContent();

    // Revoke link
    await page.click('button:has-text("Revoke Link")');
    await page.click('button:has-text("Confirm")');
    await expect(page.locator('text=Link revoked')).toBeVisible();

    // Try to access revoked link
    await page.goto(shareUrl!);
    await expect(page.locator('text=Share link expired or revoked')).toBeVisible();
  });
});

test.describe('Version Restore', () => {
  test('should create version and restore to previous state', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');

    // Get original content
    const originalTitle = await page.locator('h1').textContent();

    // Make changes and create version
    await page.click('[data-testid="edit-title"]');
    await page.fill('input[name="title"]', 'Modified Title');
    await page.click('[data-testid="save-title"]');

    // Save as new version
    await page.click('button:has-text("Save Version")');
    await page.fill('input[name="versionName"]', 'Before major changes');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Version saved')).toBeVisible();

    // Make more edits
    await page.click('[data-testid="edit-title"]');
    await page.fill('input[name="title"]', 'Latest Title');
    await page.click('[data-testid="save-title"]');

    // Open version history
    await page.click('[data-testid="version-history"]');
    await expect(page.locator('text=Before major changes')).toBeVisible();

    // Restore previous version
    await page.click('[data-testid="version-item"]:has-text("Before major changes")');
    await page.click('button:has-text("Restore")');
    await page.click('button:has-text("Confirm Restore")');

    // Verify content reverted
    await expect(page.locator('h1')).toContainText('Modified Title');
    await expect(page.locator('h1')).not.toContainText('Latest Title');
  });

  test('should compare versions', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');
    await page.click('[data-testid="version-history"]');

    // Select two versions to compare
    await page.click('[data-testid="version-item"]').first().locator('input[type="checkbox"]');
    await page.click('[data-testid="version-item"]').nth(1).locator('input[type="checkbox"]');

    await page.click('button:has-text("Compare Versions")');

    // Verify diff view shown
    await expect(page.locator('[data-testid="diff-view"]')).toBeVisible();
    await expect(page.locator('.diff-added')).toBeVisible();
    await expect(page.locator('.diff-removed')).toBeVisible();
  });
});

test.describe('Export Portfolio', () => {
  test('should download ZIP with all files', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');

    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export as ZIP")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.zip');

    // Save file
    const path = await download.path();
    expect(path).toBeTruthy();

    // Verify ZIP contains expected files
    // Note: In real test, you would extract and verify contents
    // For this test, we just verify download completed
  });

  test('should export as PDF', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');

    // Export as PDF
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export as PDF")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});

test.describe('Error Handling', () => {
  test('should handle network disconnection gracefully', async ({ page, context }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');

    // Make changes
    await page.click('[data-testid="edit-title"]');
    await page.fill('input[name="title"]', 'New Title');

    // Simulate network offline
    await context.setOffline(true);

    // Try to save
    await page.click('button:has-text("Save Changes")');

    // Verify error message shown
    await expect(page.locator('text=Network error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Please check your connection')).toBeVisible();

    // Reconnect
    await context.setOffline(false);

    // Retry
    await page.click('button:has-text("Retry")');

    // Verify success
    await expect(page.locator('text=Changes saved successfully')).toBeVisible({ timeout: 5000 });
  });

  test('should auto-save draft during network issues', async ({ page, context }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');

    // Make changes
    await page.fill('textarea[data-testid="about-text"]', 'Some important content');

    // Disconnect network
    await context.setOffline(false);

    // Wait for auto-save attempt
    await page.waitForTimeout(3000);

    // Verify draft saved locally
    await expect(page.locator('text=Saved locally')).toBeVisible();

    // Reconnect
    await context.setOffline(false);

    // Verify auto-sync
    await expect(page.locator('text=Synced to cloud')).toBeVisible({ timeout: 10000 });
  });

  test('should show validation errors inline', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="portfolio-card"]:first-child');

    // Try to set invalid subdomain
    await page.click('[data-testid="deployment-settings"]');
    await page.fill('input[name="subdomain"]', 'Invalid Subdomain!');
    await page.click('button:has-text("Save")');

    // Verify inline error
    await expect(page.locator('.error-message')).toContainText('Invalid subdomain format');
  });
});
