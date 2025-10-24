// Playwright tests for RoleReady
import { test, expect } from '@playwright/test';

test.describe('RoleReady Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test.describe('Navigation', () => {
    test('should navigate between different sections', async ({ page }) => {
      // Test sidebar navigation
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
      
      // Navigate to Resume Editor
      await page.click('text=Resume Editor');
      await expect(page.locator('[data-testid="resume-editor"]')).toBeVisible();
      
      // Navigate to Templates
      await page.click('text=Templates');
      await expect(page.locator('[data-testid="templates-content"]')).toBeVisible();
      
      // Navigate to Job Tracker
      await page.click('text=Job Tracker');
      await expect(page.locator('[data-testid="job-tracker-content"]')).toBeVisible();
    });

    test('should toggle sidebar', async ({ page }) => {
      const sidebar = page.locator('[data-testid="sidebar"]');
      const toggleButton = page.locator('[data-testid="sidebar-toggle"]');
      
      // Toggle sidebar
      await toggleButton.click();
      await expect(sidebar).toHaveClass(/collapsed/);
      
      await toggleButton.click();
      await expect(sidebar).not.toHaveClass(/collapsed/);
    });

    test('should show mobile navigation on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
      await expect(page.locator('[data-testid="desktop-sidebar"]')).not.toBeVisible();
    });
  });

  test.describe('Resume Editor', () => {
    test('should create and edit a resume', async ({ page }) => {
      await page.click('text=Resume Editor');
      
      // Create new resume
      await page.click('[data-testid="new-resume"]');
      
      // Fill resume details
      await page.fill('[data-testid="resume-title"]', 'Test Resume');
      await page.fill('[data-testid="resume-summary"]', 'Experienced software engineer');
      
      // Add experience
      await page.click('[data-testid="add-experience"]');
      await page.fill('[data-testid="experience-company"]', 'Tech Corp');
      await page.fill('[data-testid="experience-position"]', 'Software Engineer');
      await page.fill('[data-testid="experience-period"]', '2020 - Present');
      await page.fill('[data-testid="experience-description"]', 'Developed web applications');
      
      // Add skills
      await page.fill('[data-testid="add-skill"]', 'JavaScript');
      await page.press('[data-testid="add-skill"]', 'Enter');
      await page.fill('[data-testid="add-skill"]', 'React');
      await page.press('[data-testid="add-skill"]', 'Enter');
      
      // Save resume
      await page.click('[data-testid="save-resume"]');
      await expect(page.locator('text=Resume saved successfully')).toBeVisible();
      
      // Edit resume
      await page.fill('[data-testid="resume-title"]', 'Updated Test Resume');
      await page.click('[data-testid="save-resume"]');
      await expect(page.locator('text=Resume updated successfully')).toBeVisible();
    });

    test('should delete a resume', async ({ page }) => {
      await page.click('text=Resume Editor');
      
      // Assume resume exists
      await page.click('[data-testid="resume-item"]');
      await page.click('[data-testid="delete-resume"]');
      await page.click('[data-testid="confirm-delete"]');
      
      await expect(page.locator('text=Resume deleted successfully')).toBeVisible();
    });
  });

  test.describe('AI Features', () => {
    test('should analyze resume with AI', async ({ page }) => {
      await page.click('text=Resume Editor');
      
      // Open AI panel
      await page.click('[data-testid="ai-panel-toggle"]');
      await expect(page.locator('[data-testid="ai-panel"]')).toBeVisible();
      
      // Analyze resume
      await page.click('[data-testid="analyze-resume"]');
      
      // Wait for AI response
      await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="ai-response"]')).toContainText('analysis');
    });

    test('should optimize resume for job', async ({ page }) => {
      await page.click('text=Resume Editor');
      
      // Add job description
      await page.fill('[data-testid="job-description"]', 'We are looking for a React developer with TypeScript experience');
      
      // Open AI panel and optimize
      await page.click('[data-testid="ai-panel-toggle"]');
      await page.click('[data-testid="optimize-for-job"]');
      
      // Wait for optimization
      await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="ai-response"]')).toContainText('optimization');
    });

    test('should generate cover letter', async ({ page }) => {
      await page.click('text=Resume Editor');
      
      // Add job description
      await page.fill('[data-testid="job-description"]', 'Senior Frontend Developer position');
      
      // Generate cover letter
      await page.click('[data-testid="ai-panel-toggle"]');
      await page.click('[data-testid="generate-cover-letter"]');
      
      // Wait for generation
      await expect(page.locator('[data-testid="cover-letter-content"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="cover-letter-content"]')).toContainText('Dear');
    });
  });

  test.describe('Templates', () => {
    test('should browse and apply templates', async ({ page }) => {
      await page.click('text=Templates');
      
      // Check templates are loaded
      await expect(page.locator('[data-testid="template-card"]')).toHaveCount({ min: 1 });
      
      // Filter templates
      await page.selectOption('[data-testid="template-filter"]', 'Professional');
      await expect(page.locator('[data-testid="template-card"]')).toBeVisible();
      
      // Search templates
      await page.fill('[data-testid="template-search"]', 'modern');
      await expect(page.locator('[data-testid="template-card"]')).toBeVisible();
      
      // Apply template
      await page.click('[data-testid="template-card"]');
      await page.click('[data-testid="apply-template"]');
      
      await expect(page.locator('text=Template applied successfully')).toBeVisible();
    });
  });

  test.describe('Job Tracker', () => {
    test('should manage job applications', async ({ page }) => {
      await page.click('text=Job Tracker');
      
      // Add new job
      await page.click('[data-testid="add-job"]');
      
      // Fill job details
      await page.fill('[data-testid="job-title"]', 'Frontend Developer');
      await page.fill('[data-testid="job-company"]', 'Tech Startup');
      await page.fill('[data-testid="job-location"]', 'San Francisco, CA');
      await page.fill('[data-testid="job-url"]', 'https://example.com/job');
      await page.selectOption('[data-testid="job-status"]', 'Applied');
      
      // Save job
      await page.click('[data-testid="save-job"]');
      await expect(page.locator('text=Job added successfully')).toBeVisible();
      await expect(page.locator('text=Frontend Developer')).toBeVisible();
      
      // Update job status
      await page.selectOption('[data-testid="job-status-select"]', 'Interview');
      await page.click('[data-testid="update-job"]');
      await expect(page.locator('text=Job updated successfully')).toBeVisible();
      
      // Delete job
      await page.click('[data-testid="delete-job"]');
      await page.click('[data-testid="confirm-delete"]');
      await expect(page.locator('text=Job deleted successfully')).toBeVisible();
    });
  });

  test.describe('Real-time Collaboration', () => {
    test('should show collaboration features', async ({ page }) => {
      await page.click('text=Resume Editor');
      
      // Check collaboration indicators
      await expect(page.locator('[data-testid="collaboration-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="connection-status"]')).toBeVisible();
      
      // Check connection status
      await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected');
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-skip-link]')).toBeFocused();
      
      // Test skip links
      await page.keyboard.press('Enter');
      await expect(page.locator('#main-content')).toBeFocused();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check ARIA labels
      await expect(page.locator('button[aria-label]')).toHaveCount({ min: 1 });
      await expect(page.locator('input[aria-label]')).toHaveCount({ min: 1 });
      await expect(page.locator('nav[aria-label]')).toHaveCount({ min: 1 });
    });

    test('should support screen reader announcements', async ({ page }) => {
      // Check live regions
      await expect(page.locator('[aria-live]')).toHaveCount({ min: 1 });
      
      // Test announcements
      await page.click('text=Resume Editor');
      await expect(page.locator('[aria-live]')).toContainText('Navigated to');
    });
  });

  test.describe('Mobile Experience', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check mobile layout
      await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
      
      // Test mobile navigation
      await page.click('[data-testid="mobile-nav-item"]');
      await expect(page.locator('[data-testid="mobile-content"]')).toBeVisible();
    });

    test('should support touch gestures', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Test swipe navigation
      const swipeableContent = page.locator('[data-testid="swipeable-content"]');
      await swipeableContent.hover();
      await page.mouse.down();
      await page.mouse.move(-100, 0);
      await page.mouse.up();
      
      await expect(page.locator('[data-testid="next-tab"]')).toBeVisible();
    });

    test('should handle orientation changes', async ({ page }) => {
      // Test portrait mode
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('[data-testid="portrait-content"]')).toBeVisible();
      
      // Test landscape mode
      await page.setViewportSize({ width: 667, height: 375 });
      await expect(page.locator('[data-testid="landscape-content"]')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept API calls and return errors
      await page.route('**/api/resumes', route => route.fulfill({ status: 500 }));
      
      await page.click('text=Resume Editor');
      
      // Check for error message
      await expect(page.locator('text=Failed to load resumes')).toBeVisible();
    });

    test('should show error boundaries', async ({ page }) => {
      // Check error boundary is not visible initially
      await expect(page.locator('[data-testid="error-boundary"]')).not.toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:3000');
      await page.waitForSelector('[data-testid="main-content"]');
      const loadTime = Date.now() - startTime;
      
      // Check that page loads within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle large datasets', async ({ page }) => {
      await page.click('text=Job Tracker');
      
      // Add multiple jobs
      for (let i = 0; i < 10; i++) {
        await page.click('[data-testid="add-job"]');
        await page.fill('[data-testid="job-title"]', `Job ${i}`);
        await page.fill('[data-testid="job-company"]', `Company ${i}`);
        await page.click('[data-testid="save-job"]');
      }
      
      // Verify all jobs are displayed
      await expect(page.locator('[data-testid="job-item"]')).toHaveCount(10);
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist data across sessions', async ({ page }) => {
      // Create some data
      await page.click('text=Resume Editor');
      await page.fill('[data-testid="resume-title"]', 'Persistent Resume');
      await page.click('[data-testid="save-resume"]');
      
      // Reload page
      await page.reload();
      
      // Verify data persisted
      await expect(page.locator('text=Persistent Resume')).toBeVisible();
    });

    test('should handle offline mode', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);
      
      // Check offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
      
      // Simulate online mode
      await page.context().setOffline(false);
      
      // Check online indicator
      await expect(page.locator('[data-testid="online-indicator"]')).toBeVisible();
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('should work in Chrome', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium');
      
      await page.click('text=Resume Editor');
      await expect(page.locator('[data-testid="resume-editor"]')).toBeVisible();
    });

    test('should work in Firefox', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox');
      
      await page.click('text=Templates');
      await expect(page.locator('[data-testid="templates-content"]')).toBeVisible();
    });

    test('should work in Safari', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit');
      
      await page.click('text=Job Tracker');
      await expect(page.locator('[data-testid="job-tracker-content"]')).toBeVisible();
    });
  });
});
