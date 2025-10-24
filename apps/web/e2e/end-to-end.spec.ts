import { test, expect } from '@playwright/test';

test.describe('RoleReady - End-to-End Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should complete full resume creation workflow', async ({ page }) => {
    // Step 1: Create resume
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'E2E Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for end-to-end testing');
    
    // Step 2: Add sections
    await page.click('[data-testid="add-section-button"]');
    await page.fill('[data-testid="section-title-0"]', 'Experience');
    await page.fill('[data-testid="section-content-0"]', 'Software Developer at Test Company');
    
    await page.click('[data-testid="add-section-button"]');
    await page.fill('[data-testid="section-title-1"]', 'Education');
    await page.fill('[data-testid="section-content-1"]', 'Bachelor of Computer Science');
    
    // Step 3: Save resume
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Step 4: Use AI to improve resume
    await page.click('[data-testid="nav-ai-panel"]');
    await page.fill('[data-testid="ai-chat-input"]', 'Help me improve my resume');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
    
    // Step 5: Upload resume to cloud storage
    await page.click('[data-testid="nav-cloud-storage"]');
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: 'e2e-test-resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('E2E test resume content')
    });
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
    
    // Step 6: Track job application
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'E2E Test Job');
    await page.fill('[data-testid="company-name"]', 'E2E Test Company');
    await page.selectOption('[data-testid="job-status"]', 'applied');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
    
    // Step 7: Generate cover letter
    await page.click('[data-testid="nav-cover-letter"]');
    await page.fill('[data-testid="job-description"]', 'Software Developer position');
    await page.fill('[data-testid="company-name"]', 'E2E Test Company');
    await page.click('[data-testid="generate-cover-letter-button"]');
    await expect(page.locator('[data-testid="cover-letter-generated"]')).toBeVisible({ timeout: 15000 });
    
    // Step 8: Send email
    await page.click('[data-testid="nav-email"]');
    await page.click('[data-testid="compose-email-button"]');
    await page.fill('[data-testid="email-to"]', 'e2etest@example.com');
    await page.fill('[data-testid="email-subject"]', 'E2E Test Application');
    await page.fill('[data-testid="email-body"]', 'Test email for end-to-end testing');
    await page.click('[data-testid="send-email-button"]');
    await expect(page.locator('[data-testid="email-sent-confirmation"]')).toBeVisible({ timeout: 10000 });
    
    // Step 9: Post in discussion
    await page.click('[data-testid="nav-discussion"]');
    await page.click('[data-testid="new-post-button"]');
    await page.fill('[data-testid="post-title"]', 'E2E Test Post');
    await page.fill('[data-testid="post-content"]', 'Test post for end-to-end testing');
    await page.click('[data-testid="publish-post-button"]');
    await expect(page.locator('[data-testid="post-published"]')).toBeVisible();
    
    // Step 10: Update profile
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-name"]', 'E2E Test User');
    await page.fill('[data-testid="profile-email"]', 'e2etest@example.com');
    await page.fill('[data-testid="profile-phone"]', '123-456-7890');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    
    // Step 11: Select template
    await page.click('[data-testid="nav-templates"]');
    await page.click('[data-testid="select-template-button"]');
    await expect(page.locator('[data-testid="template-selected"]')).toBeVisible();
    
    // Step 12: Verify data persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('E2E Test Resume');
    
    await page.click('[data-testid="nav-job-tracker"]');
    await expect(page.locator('[data-testid="job-title"]')).toHaveValue('E2E Test Job');
    
    await page.click('[data-testid="nav-profile"]');
    await expect(page.locator('[data-testid="profile-name"]')).toHaveValue('E2E Test User');
  });

  test('should handle complete user journey with errors', async ({ page }) => {
    // Test error handling in complete workflow
    await page.route('**/api/resume', route => {
      if (Math.random() < 0.5) {
        route.fulfill({ status: 500 });
      } else {
        route.continue();
      }
    });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Error Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    
    // Should either save successfully or show error
    const saved = page.locator('[data-testid="resume-saved"]');
    const error = page.locator('[data-testid="error-message"]');
    
    await expect(saved.or(error)).toBeVisible();
  });

  test('should handle complete user journey with network issues', async ({ page }) => {
    // Test network handling in complete workflow
    await page.context().setOffline(true);
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Offline Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
    
    await page.context().setOffline(false);
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should handle complete user journey with performance issues', async ({ page }) => {
    // Test performance handling in complete workflow
    await page.route('**/api/**', route => {
      setTimeout(() => {
        route.continue();
      }, 5000);
    });
    
    const startTime = Date.now();
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Performance Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible({ timeout: 10000 });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(15000);
  });
});
