import { test, expect } from '@playwright/test';

test.describe('RoleReady - System Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should test complete system functionality', async ({ page }) => {
    // Test resume creation
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'System Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for system testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test AI assistance
    await page.click('[data-testid="nav-ai-panel"]');
    await page.fill('[data-testid="ai-chat-input"]', 'Help me improve my resume');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
    
    // Test job tracking
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'System Test Job');
    await page.fill('[data-testid="company-name"]', 'System Test Company');
    await page.selectOption('[data-testid="job-status"]', 'applied');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
    
    // Test file upload
    await page.click('[data-testid="nav-cloud-storage"]');
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: 'system-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('System test content')
    });
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
    
    // Test email functionality
    await page.click('[data-testid="nav-email"]');
    await page.click('[data-testid="compose-email-button"]');
    await page.fill('[data-testid="email-to"]', 'systemtest@example.com');
    await page.fill('[data-testid="email-subject"]', 'System Test Email');
    await page.fill('[data-testid="email-body"]', 'Test email for system testing');
    await page.click('[data-testid="send-email-button"]');
    await expect(page.locator('[data-testid="email-sent-confirmation"]')).toBeVisible({ timeout: 10000 });
    
    // Test discussion forum
    await page.click('[data-testid="nav-discussion"]');
    await page.click('[data-testid="new-post-button"]');
    await page.fill('[data-testid="post-title"]', 'System Test Post');
    await page.fill('[data-testid="post-content"]', 'Test post for system testing');
    await page.click('[data-testid="publish-post-button"]');
    await expect(page.locator('[data-testid="post-published"]')).toBeVisible();
    
    // Test cover letter generation
    await page.click('[data-testid="nav-cover-letter"]');
    await page.fill('[data-testid="job-description"]', 'Software Developer position');
    await page.fill('[data-testid="company-name"]', 'System Test Company');
    await page.click('[data-testid="generate-cover-letter-button"]');
    await expect(page.locator('[data-testid="cover-letter-generated"]')).toBeVisible({ timeout: 15000 });
    
    // Test profile management
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-name"]', 'System Test User');
    await page.fill('[data-testid="profile-email"]', 'systemtest@example.com');
    await page.fill('[data-testid="profile-phone"]', '123-456-7890');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    
    // Test template selection
    await page.click('[data-testid="nav-templates"]');
    await page.click('[data-testid="select-template-button"]');
    await expect(page.locator('[data-testid="template-selected"]')).toBeVisible();
  });

  test('should test system performance', async ({ page }) => {
    const startTime = Date.now();
    
    // Test system performance
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Performance Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for performance testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    await page.click('[data-testid="nav-ai-panel"]');
    await page.fill('[data-testid="ai-chat-input"]', 'Performance test message');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
    
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'Performance Test Job');
    await page.fill('[data-testid="company-name"]', 'Performance Test Company');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
  });

  test('should test system reliability', async ({ page }) => {
    // Test system reliability
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="nav-resume-editor"]');
      await page.fill('[data-testid="resume-name"]', `Reliability Test ${i}`);
      await page.click('[data-testid="save-resume-button"]');
      await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
      
      await page.click('[data-testid="nav-job-tracker"]');
      await page.click('[data-testid="add-job-button"]');
      await page.fill('[data-testid="job-title"]', `Reliability Job ${i}`);
      await page.fill('[data-testid="company-name"]', `Reliability Company ${i}`);
      await page.click('[data-testid="save-job-button"]');
      await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
    }
  });

  test('should test system scalability', async ({ page }) => {
    // Test system scalability
    await page.click('[data-testid="nav-resume-editor"]');
    
    for (let i = 0; i < 50; i++) {
      await page.click('[data-testid="add-section-button"]');
      await page.fill(`[data-testid="section-title-${i}"]`, `Section ${i}`);
      await page.fill(`[data-testid="section-content-${i}"]`, 'A'.repeat(1000));
    }
    
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should test system security', async ({ page }) => {
    // Test system security
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test XSS prevention
    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('[data-testid="resume-summary"]', xssPayload);
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Verify XSS payload was sanitized
    await expect(page.locator('[data-testid="resume-summary"]')).not.toContainText('<script>');
  });

  test('should test system compatibility', async ({ page }) => {
    // Test system compatibility
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Compatibility Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for compatibility testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test different browsers
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Compatibility Test Resume');
  });

  test('should test system maintainability', async ({ page }) => {
    // Test system maintainability
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Maintainability Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for maintainability testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test data backup
    await page.click('[data-testid="backup-resume-button"]');
    await expect(page.locator('[data-testid="backup-success"]')).toBeVisible();
    
    // Test data restore
    await page.click('[data-testid="restore-resume-button"]');
    await expect(page.locator('[data-testid="restore-success"]')).toBeVisible();
  });

  test('should test system usability', async ({ page }) => {
    // Test system usability
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Usability Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for usability testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test user guidance
    await page.click('[data-testid="help-button"]');
    await expect(page.locator('[data-testid="help-modal"]')).toBeVisible();
    
    // Test user feedback
    await page.click('[data-testid="feedback-button"]');
    await expect(page.locator('[data-testid="feedback-modal"]')).toBeVisible();
  });

  test('should test system accessibility', async ({ page }) => {
    // Test system accessibility
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Accessibility Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for accessibility testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test screen reader support
    await expect(page.locator('[data-testid="resume-name"]')).toHaveAttribute('aria-label', 'Resume name');
  });

  test('should test system error handling', async ({ page }) => {
    // Test system error handling
    await page.route('**/api/resume', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Error Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    // Test error recovery
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });
});
