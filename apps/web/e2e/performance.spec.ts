import { test, expect } from '@playwright/test';

test.describe('RoleReady - Performance Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should measure page load performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {};
          entries.forEach((entry) => {
            metrics[entry.name] = entry.value;
          });
          resolve(metrics);
        }).observe({ entryTypes: ['measure', 'navigation'] });
      });
    });
    
    expect(metrics).toBeDefined();
  });

  test('should measure resume editor performance', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    const startTime = Date.now();
    await page.fill('[data-testid="resume-name"]', 'Performance Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for performance testing');
    await page.click('[data-testid="add-section-button"]');
    await page.fill('[data-testid="section-title-0"]', 'Experience');
    await page.fill('[data-testid="section-content-0"]', 'Software Developer at Test Company');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    const endTime = Date.now();
    const operationTime = endTime - startTime;
    
    expect(operationTime).toBeLessThan(2000); // Should complete within 2 seconds
  });

  test('should measure AI panel performance', async ({ page }) => {
    await page.click('[data-testid="nav-ai-panel"]');
    
    const startTime = Date.now();
    await page.fill('[data-testid="ai-chat-input"]', 'Help me improve my resume');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(responseTime).toBeLessThan(15000); // Should respond within 15 seconds
  });

  test('should measure template loading performance', async ({ page }) => {
    await page.click('[data-testid="nav-templates"]');
    
    const startTime = Date.now();
    await expect(page.locator('[data-testid="template-grid"]')).toBeVisible();
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(1000); // Should load within 1 second
  });

  test('should measure job tracker performance', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    
    const startTime = Date.now();
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'Performance Test Job');
    await page.fill('[data-testid="company-name"]', 'Performance Test Company');
    await page.selectOption('[data-testid="job-status"]', 'applied');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
    const endTime = Date.now();
    const operationTime = endTime - startTime;
    
    expect(operationTime).toBeLessThan(1500); // Should complete within 1.5 seconds
  });

  test('should measure cloud storage performance', async ({ page }) => {
    await page.click('[data-testid="nav-cloud-storage"]');
    
    const startTime = Date.now();
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: 'performance-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test content')
    });
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
    const endTime = Date.now();
    const uploadTime = endTime - startTime;
    
    expect(uploadTime).toBeLessThan(15000); // Should upload within 15 seconds
  });

  test('should measure email performance', async ({ page }) => {
    await page.click('[data-testid="nav-email"]');
    
    const startTime = Date.now();
    await page.click('[data-testid="compose-email-button"]');
    await page.fill('[data-testid="email-to"]', 'test@example.com');
    await page.fill('[data-testid="email-subject"]', 'Performance Test Email');
    await page.fill('[data-testid="email-body"]', 'Test email for performance testing');
    await page.click('[data-testid="send-email-button"]');
    await expect(page.locator('[data-testid="email-sent-confirmation"]')).toBeVisible({ timeout: 10000 });
    const endTime = Date.now();
    const sendTime = endTime - startTime;
    
    expect(sendTime).toBeLessThan(10000); // Should send within 10 seconds
  });

  test('should measure discussion forum performance', async ({ page }) => {
    await page.click('[data-testid="nav-discussion"]');
    
    const startTime = Date.now();
    await page.click('[data-testid="new-post-button"]');
    await page.fill('[data-testid="post-title"]', 'Performance Test Post');
    await page.fill('[data-testid="post-content"]', 'Test post for performance testing');
    await page.click('[data-testid="publish-post-button"]');
    await expect(page.locator('[data-testid="post-published"]')).toBeVisible();
    const endTime = Date.now();
    const publishTime = endTime - startTime;
    
    expect(publishTime).toBeLessThan(2000); // Should publish within 2 seconds
  });

  test('should measure cover letter generator performance', async ({ page }) => {
    await page.click('[data-testid="nav-cover-letter"]');
    
    const startTime = Date.now();
    await page.fill('[data-testid="job-description"]', 'Software Developer position');
    await page.fill('[data-testid="company-name"]', 'Test Company');
    await page.click('[data-testid="generate-cover-letter-button"]');
    await expect(page.locator('[data-testid="cover-letter-generated"]')).toBeVisible({ timeout: 15000 });
    const endTime = Date.now();
    const generationTime = endTime - startTime;
    
    expect(generationTime).toBeLessThan(15000); // Should generate within 15 seconds
  });

  test('should measure user profile performance', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    
    const startTime = Date.now();
    await page.fill('[data-testid="profile-name"]', 'Performance Test User');
    await page.fill('[data-testid="profile-email"]', 'performancetest@example.com');
    await page.fill('[data-testid="profile-phone"]', '123-456-7890');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    const endTime = Date.now();
    const saveTime = endTime - startTime;
    
    expect(saveTime).toBeLessThan(1000); // Should save within 1 second
  });

  test('should measure navigation performance', async ({ page }) => {
    const navItems = [
      'nav-home',
      'nav-resume-editor',
      'nav-ai-panel',
      'nav-templates',
      'nav-job-tracker',
      'nav-cloud-storage',
      'nav-email',
      'nav-discussion',
      'nav-cover-letter',
      'nav-profile'
    ];
    
    for (const navItem of navItems) {
      const startTime = Date.now();
      await page.click(`[data-testid="${navItem}"]`);
      await expect(page.locator(`[data-testid="${navItem.replace('nav-', '')}-content"]`)).toBeVisible();
      const endTime = Date.now();
      const navigationTime = endTime - startTime;
      
      expect(navigationTime).toBeLessThan(500); // Should navigate within 500ms
    }
  });

  test('should measure memory usage', async ({ page }) => {
    const initialMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });
    
    // Perform memory-intensive operations
    await page.click('[data-testid="nav-resume-editor"]');
    for (let i = 0; i < 50; i++) {
      await page.click('[data-testid="add-section-button"]');
      await page.fill(`[data-testid="section-title-${i}"]`, `Section ${i}`);
      await page.fill(`[data-testid="section-content-${i}"]`, 'A'.repeat(1000));
    }
    
    const finalMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });
    
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Should not increase by more than 50MB
  });

  test('should measure CPU usage', async ({ page }) => {
    const startTime = Date.now();
    
    // Perform CPU-intensive operations
    await page.click('[data-testid="nav-resume-editor"]');
    for (let i = 0; i < 100; i++) {
      await page.fill('[data-testid="resume-name"]', `CPU Test ${i}`);
      await page.click('[data-testid="save-resume-button"]');
      await page.waitForTimeout(10);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds
  });

  test('should measure network performance', async ({ page }) => {
    const requests = [];
    const startTime = Date.now();
    
    // Make multiple API requests
    for (let i = 0; i < 10; i++) {
      requests.push(page.request.get('/api/resume'));
    }
    
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
    
    // Check response times
    for (const response of responses) {
      expect(response.status()).toBe(200);
    }
  });

  test('should measure rendering performance', async ({ page }) => {
    const startTime = Date.now();
    
    // Trigger re-renders
    await page.click('[data-testid="nav-resume-editor"]');
    for (let i = 0; i < 20; i++) {
      await page.fill('[data-testid="resume-name"]', `Render Test ${i}`);
      await page.waitForTimeout(50);
    }
    
    const endTime = Date.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(3000); // Should complete within 3 seconds
  });

  test('should measure accessibility performance', async ({ page }) => {
    const startTime = Date.now();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    const endTime = Date.now();
    const navigationTime = endTime - startTime;
    
    expect(navigationTime).toBeLessThan(1000); // Should complete within 1 second
  });

  test('should measure mobile performance', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds on mobile
  });

  test('should measure offline performance', async ({ page }) => {
    await page.context().setOffline(true);
    
    const startTime = Date.now();
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Offline Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
    const endTime = Date.now();
    const offlineTime = endTime - startTime;
    
    expect(offlineTime).toBeLessThan(1000); // Should handle offline within 1 second
  });

  test('should measure concurrent user performance', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);
    
    const pages = await Promise.all(contexts.map(context => context.newPage()));
    
    const startTime = Date.now();
    await Promise.all(pages.map(page => page.goto('/test-all-components')));
    await Promise.all(pages.map(page => page.waitForLoadState('networkidle')));
    const endTime = Date.now();
    const concurrentLoadTime = endTime - startTime;
    
    expect(concurrentLoadTime).toBeLessThan(10000); // Should handle 5 concurrent users within 10 seconds
    
    await Promise.all(contexts.map(context => context.close()));
  });

  test('should measure database performance', async ({ page }) => {
    const startTime = Date.now();
    
    // Perform database-intensive operations
    await page.click('[data-testid="nav-resume-editor"]');
    for (let i = 0; i < 20; i++) {
      await page.fill('[data-testid="resume-name"]', `DB Test ${i}`);
      await page.click('[data-testid="save-resume-button"]');
      await page.waitForTimeout(100);
    }
    
    const endTime = Date.now();
    const dbTime = endTime - startTime;
    
    expect(dbTime).toBeLessThan(15000); // Should complete within 15 seconds
  });

  test('should measure cache performance', async ({ page }) => {
    // First load
    const firstLoadStart = Date.now();
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
    const firstLoadEnd = Date.now();
    const firstLoadTime = firstLoadEnd - firstLoadStart;
    
    // Second load (should be cached)
    const secondLoadStart = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const secondLoadEnd = Date.now();
    const secondLoadTime = secondLoadEnd - secondLoadStart;
    
    expect(secondLoadTime).toBeLessThan(firstLoadTime); // Second load should be faster
    expect(secondLoadTime).toBeLessThan(2000); // Should load within 2 seconds with cache
  });
});