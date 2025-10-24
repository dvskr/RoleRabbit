import { test, expect } from '@playwright/test';

test.describe('RoleReady - Mobile Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should display mobile layout', async ({ page }) => {
    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-content"]')).toBeVisible();
  });

  test('should have mobile navigation', async ({ page }) => {
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav-toggle"]')).toBeVisible();
    
    await page.click('[data-testid="mobile-nav-toggle"]');
    await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();
    
    await page.click('[data-testid="mobile-nav-toggle"]');
    await expect(page.locator('[data-testid="mobile-nav-menu"]')).not.toBeVisible();
  });

  test('should have mobile-friendly forms', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test mobile form inputs
    await expect(page.locator('[data-testid="resume-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="resume-summary"]')).toBeVisible();
    
    // Test mobile form submission
    await page.fill('[data-testid="resume-name"]', 'Mobile Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for mobile');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should have mobile-friendly buttons', async ({ page }) => {
    // Test mobile button sizes
    await expect(page.locator('[data-testid="save-button"]')).toHaveCSS('min-height', '44px');
    await expect(page.locator('[data-testid="cancel-button"]')).toHaveCSS('min-height', '44px');
    await expect(page.locator('[data-testid="add-button"]')).toHaveCSS('min-height', '44px');
    
    // Test mobile button spacing
    await expect(page.locator('[data-testid="save-button"]')).toHaveCSS('margin', /8px/);
    await expect(page.locator('[data-testid="cancel-button"]')).toHaveCSS('margin', /8px/);
  });

  test('should have mobile-friendly modals', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    
    // Test mobile modal
    await expect(page.locator('[data-testid="profile-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-modal"]')).toHaveCSS('width', '100%');
    await expect(page.locator('[data-testid="profile-modal"]')).toHaveCSS('height', '100%');
    
    // Test mobile modal close
    await page.click('[data-testid="modal-close-button"]');
    await expect(page.locator('[data-testid="profile-modal"]')).not.toBeVisible();
  });

  test('should have mobile-friendly tables', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    
    // Test mobile table
    await expect(page.locator('[data-testid="job-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="job-table"]')).toHaveCSS('overflow-x', 'auto');
    
    // Test mobile table scrolling
    await page.hover('[data-testid="job-table"]');
    await page.mouse.wheel(0, 100);
    await expect(page.locator('[data-testid="job-table"]')).toBeVisible();
  });

  test('should have mobile-friendly images', async ({ page }) => {
    // Test mobile image responsiveness
    await expect(page.locator('[data-testid="logo"]')).toHaveCSS('max-width', '100%');
    await expect(page.locator('[data-testid="logo"]')).toHaveCSS('height', 'auto');
    
    // Test mobile image loading
    await expect(page.locator('[data-testid="logo"]')).toBeVisible();
  });

  test('should have mobile-friendly text', async ({ page }) => {
    // Test mobile text sizing
    await expect(page.locator('[data-testid="main-text"]')).toHaveCSS('font-size', /16px/);
    await expect(page.locator('[data-testid="main-text"]')).toHaveCSS('line-height', /1.5/);
    
    // Test mobile text spacing
    await expect(page.locator('[data-testid="main-text"]')).toHaveCSS('margin', /16px/);
  });

  test('should have mobile-friendly touch targets', async ({ page }) => {
    // Test touch target sizes
    await expect(page.locator('[data-testid="save-button"]')).toHaveCSS('min-width', '44px');
    await expect(page.locator('[data-testid="save-button"]')).toHaveCSS('min-height', '44px');
    
    await expect(page.locator('[data-testid="cancel-button"]')).toHaveCSS('min-width', '44px');
    await expect(page.locator('[data-testid="cancel-button"]')).toHaveCSS('min-height', '44px');
  });

  test('should have mobile-friendly gestures', async ({ page }) => {
    // Test swipe gestures
    await page.touchscreen.tap(200, 300);
    await page.touchscreen.tap(200, 300);
    await expect(page.locator('[data-testid="gesture-feedback"]')).toBeVisible();
    
    // Test pinch gestures
    await page.touchscreen.tap(200, 300);
    await page.touchscreen.tap(200, 300);
    await expect(page.locator('[data-testid="pinch-feedback"]')).toBeVisible();
  });

  test('should have mobile-friendly scrolling', async ({ page }) => {
    // Test vertical scrolling
    await page.mouse.wheel(0, 500);
    await expect(page.locator('[data-testid="scroll-indicator"]')).toBeVisible();
    
    // Test horizontal scrolling
    await page.mouse.wheel(500, 0);
    await expect(page.locator('[data-testid="horizontal-scroll-indicator"]')).toBeVisible();
  });

  test('should have mobile-friendly loading states', async ({ page }) => {
    await page.click('[data-testid="nav-ai-panel"]');
    
    // Test mobile loading
    await page.fill('[data-testid="ai-chat-input"]', 'Test message');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="loading-indicator"]')).toHaveCSS('width', '100%');
  });

  test('should have mobile-friendly error states', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test mobile error display
    await page.fill('[data-testid="resume-name"]', '');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toHaveCSS('width', '100%');
  });

  test('should have mobile-friendly success states', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test mobile success display
    await page.fill('[data-testid="resume-name"]', 'Mobile Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    await expect(page.locator('[data-testid="resume-saved"]')).toHaveCSS('width', '100%');
  });

  test('should have mobile-friendly accessibility', async ({ page }) => {
    // Test mobile accessibility
    await expect(page.locator('[data-testid="mobile-nav"]')).toHaveAttribute('aria-label', 'Mobile navigation');
    await expect(page.locator('[data-testid="mobile-nav-toggle"]')).toHaveAttribute('aria-label', 'Toggle mobile navigation');
    
    // Test mobile focus management
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('should have mobile-friendly performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds on mobile
  });

  test('should have mobile-friendly network handling', async ({ page }) => {
    // Test offline handling
    await page.context().setOffline(true);
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
    
    // Test online handling
    await page.context().setOffline(false);
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="online-message"]')).toBeVisible();
  });

  test('should have mobile-friendly orientation handling', async ({ page }) => {
    // Test portrait orientation
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="portrait-layout"]')).toBeVisible();
    
    // Test landscape orientation
    await page.setViewportSize({ width: 667, height: 375 });
    await expect(page.locator('[data-testid="landscape-layout"]')).toBeVisible();
  });

  test('should have mobile-friendly safe areas', async ({ page }) => {
    // Test safe area handling
    await expect(page.locator('[data-testid="safe-area-top"]')).toHaveCSS('padding-top', 'env(safe-area-inset-top)');
    await expect(page.locator('[data-testid="safe-area-bottom"]')).toHaveCSS('padding-bottom', 'env(safe-area-inset-bottom)');
    await expect(page.locator('[data-testid="safe-area-left"]')).toHaveCSS('padding-left', 'env(safe-area-inset-left)');
    await expect(page.locator('[data-testid="safe-area-right"]')).toHaveCSS('padding-right', 'env(safe-area-inset-right)');
  });
});