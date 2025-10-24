import { test, expect } from '@playwright/test';

test.describe('RoleReady - Load and Stress Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should handle multiple concurrent users', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);
    
    const pages = await Promise.all(contexts.map(context => context.newPage()));
    
    await Promise.all(pages.map(page => page.goto('/test-all-components')));
    await Promise.all(pages.map(page => page.waitForLoadState('networkidle')));
    
    await Promise.all(pages.map(page => page.click('[data-testid="nav-resume-editor"]')));
    await Promise.all(pages.map(page => page.fill('[data-testid="resume-name"]', 'Load Test')));
    await Promise.all(pages.map(page => page.click('[data-testid="save-resume-button"]')));
    
    await Promise.all(pages.map(page => expect(page.locator('[data-testid="resume-saved"]')).toBeVisible()));
    
    await Promise.all(contexts.map(context => context.close()));
  });

  test('should handle rapid API calls', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    for (let i = 0; i < 50; i++) {
      await page.fill('[data-testid="resume-name"]', `Rapid Test ${i}`);
      await page.click('[data-testid="save-resume-button"]');
      await page.waitForTimeout(100);
    }
    
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should handle large data sets', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    for (let i = 0; i < 100; i++) {
      await page.click('[data-testid="add-section-button"]');
      await page.fill(`[data-testid="section-title-${i}"]`, `Section ${i}`);
      await page.fill(`[data-testid="section-content-${i}"]`, 'A'.repeat(1000));
    }
    
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should handle memory-intensive operations', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    for (let i = 0; i < 20; i++) {
      await page.click('[data-testid="add-section-button"]');
      await page.fill(`[data-testid="section-content-${i}"]`, 'A'.repeat(10000));
    }
    
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should handle long-running operations', async ({ page }) => {
    await page.click('[data-testid="nav-ai-panel"]');
    await page.fill('[data-testid="ai-chat-input"]', 'Generate a very long response');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 30000 });
  });

  test('should handle resource exhaustion', async ({ page }) => {
    await page.click('[data-testid="nav-cloud-storage"]');
    
    for (let i = 0; i < 10; i++) {
      const fileInput = page.locator('[data-testid="file-upload-input"]');
      await fileInput.setInputFiles({
        name: `test${i}.pdf`,
        mimeType: 'application/pdf',
        buffer: Buffer.from('A'.repeat(1000000))
      });
      await page.waitForTimeout(1000);
    }
    
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
  });

  test('should handle network latency', async ({ page }) => {
    await page.route('**/api/**', route => {
      setTimeout(() => {
        route.continue();
      }, 2000);
    });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Latency Test');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible({ timeout: 10000 });
  });

  test('should handle error recovery under load', async ({ page }) => {
    await page.route('**/api/resume', route => {
      if (Math.random() < 0.3) {
        route.fulfill({ status: 500 });
      } else {
        route.continue();
      }
    });
    
    await page.click('[data-testid="nav-resume-editor"]');
    
    for (let i = 0; i < 20; i++) {
      await page.fill('[data-testid="resume-name"]', `Error Test ${i}`);
      await page.click('[data-testid="save-resume-button"]');
      await page.waitForTimeout(500);
    }
    
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should handle UI responsiveness under load', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    const startTime = Date.now();
    
    for (let i = 0; i < 100; i++) {
      await page.click('[data-testid="add-section-button"]');
      await page.fill(`[data-testid="section-title-${i}"]`, `Section ${i}`);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(10000);
  });

  test('should handle cleanup after load test', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.click('[data-testid="clear-resume-button"]');
    await expect(page.locator('[data-testid="empty-resume-message"]')).toBeVisible();
  });
});