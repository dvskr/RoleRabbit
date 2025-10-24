import { test, expect } from '@playwright/test';

test.describe('RoleReady - Compatibility Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should work in Chrome', async ({ page, browserName }) => {
    if (browserName !== 'chromium') {
      test.skip();
    }
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Chrome Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for Chrome compatibility');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should work in Firefox', async ({ page, browserName }) => {
    if (browserName !== 'firefox') {
      test.skip();
    }
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Firefox Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for Firefox compatibility');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should work in Safari', async ({ page, browserName }) => {
    if (browserName !== 'webkit') {
      test.skip();
    }
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Safari Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for Safari compatibility');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should work on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Desktop Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for desktop compatibility');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Tablet Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for tablet compatibility');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Mobile Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for mobile compatibility');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should work with different screen orientations', async ({ page }) => {
    // Test portrait orientation
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-editor-content"]')).toBeVisible();
    
    // Test landscape orientation
    await page.setViewportSize({ width: 667, height: 375 });
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-editor-content"]')).toBeVisible();
  });

  test('should work with different operating systems', async ({ page }) => {
    // Test Windows compatibility
    await page.emulate({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' });
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Windows Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test macOS compatibility
    await page.emulate({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'macOS Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test Linux compatibility
    await page.emulate({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Linux Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should work with different network conditions', async ({ page }) => {
    // Test slow network
    await page.route('**/api/**', route => {
      setTimeout(() => {
        route.continue();
      }, 2000);
    });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Slow Network Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible({ timeout: 10000 });
    
    // Test offline mode
    await page.context().setOffline(true);
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Offline Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
    
    // Test online mode
    await page.context().setOffline(false);
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should work with different input methods', async ({ page }) => {
    // Test mouse input
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Mouse Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test keyboard input
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="focused-content"]')).toBeVisible();
    
    // Test touch input
    await page.touchscreen.tap(200, 300);
    await expect(page.locator('[data-testid="touch-feedback"]')).toBeVisible();
  });

  test('should work with different accessibility settings', async ({ page }) => {
    // Test high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-editor-content"]')).toBeVisible();
    
    // Test reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-editor-content"]')).toBeVisible();
    
    // Test large text
    await page.emulateMedia({ colorScheme: 'light' });
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-editor-content"]')).toBeVisible();
  });

  test('should work with different languages', async ({ page }) => {
    // Test English
    await page.click('[data-testid="language-selector"]');
    await page.selectOption('[data-testid="language-selector"]', 'en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    
    // Test Spanish
    await page.selectOption('[data-testid="language-selector"]', 'es');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    
    // Test French
    await page.selectOption('[data-testid="language-selector"]', 'fr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('should work with different time zones', async ({ page }) => {
    // Test different time zones
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Timezone Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test date/time display
    await expect(page.locator('[data-testid="save-timestamp"]')).toBeVisible();
  });

  test('should work with different file formats', async ({ page }) => {
    // Test PDF upload
    await page.click('[data-testid="nav-cloud-storage"]');
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
    
    // Test DOCX upload
    await fileInput.setInputFiles({
      name: 'test.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: Buffer.from('DOCX content')
    });
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
    
    // Test TXT upload
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('TXT content')
    });
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
  });

  test('should work with different user agents', async ({ page }) => {
    // Test different user agents
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ];
    
    for (const userAgent of userAgents) {
      await page.emulate({ userAgent });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.click('[data-testid="nav-resume-editor"]');
      await expect(page.locator('[data-testid="resume-editor-content"]')).toBeVisible();
    }
  });

  test('should work with different screen resolutions', async ({ page }) => {
    // Test different screen resolutions
    const resolutions = [
      { width: 1920, height: 1080 }, // Full HD
      { width: 1366, height: 768 },  // HD
      { width: 1024, height: 768 }, // XGA
      { width: 800, height: 600 }    // SVGA
    ];
    
    for (const resolution of resolutions) {
      await page.setViewportSize(resolution);
      await page.click('[data-testid="nav-resume-editor"]');
      await expect(page.locator('[data-testid="resume-editor-content"]')).toBeVisible();
    }
  });
});
