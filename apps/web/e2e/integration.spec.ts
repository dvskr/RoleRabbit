import { test, expect } from '@playwright/test';

test.describe('RoleReady - Integration Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should integrate resume editor with AI panel', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Integration Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    await page.click('[data-testid="nav-ai-panel"]');
    await page.fill('[data-testid="ai-chat-input"]', 'Improve my resume');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
  });

  test('should integrate job tracker with resume editor', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'Integration Test Job');
    await page.fill('[data-testid="company-name"]', 'Integration Test Company');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
    
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toBeVisible();
  });

  test('should integrate cloud storage with resume editor', async ({ page }) => {
    await page.click('[data-testid="nav-cloud-storage"]');
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: 'integration-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Integration test content')
    });
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toBeVisible();
  });

  test('should integrate email with job tracker', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'Email Integration Job');
    await page.fill('[data-testid="company-name"]', 'Email Integration Company');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
    
    await page.click('[data-testid="nav-email"]');
    await page.click('[data-testid="compose-email-button"]');
    await page.fill('[data-testid="email-to"]', 'integration@example.com');
    await page.fill('[data-testid="email-subject"]', 'Job Application');
    await page.click('[data-testid="send-email-button"]');
    await expect(page.locator('[data-testid="email-sent-confirmation"]')).toBeVisible({ timeout: 10000 });
  });

  test('should integrate discussion with profile', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-name"]', 'Integration Test User');
    await page.fill('[data-testid="profile-email"]', 'integration@test.com');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    
    await page.click('[data-testid="nav-discussion"]');
    await page.click('[data-testid="new-post-button"]');
    await page.fill('[data-testid="post-title"]', 'Integration Test Post');
    await page.fill('[data-testid="post-content"]', 'Test post for integration');
    await page.click('[data-testid="publish-post-button"]');
    await expect(page.locator('[data-testid="post-published"]')).toBeVisible();
  });

  test('should integrate cover letter with job tracker', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'Cover Letter Integration Job');
    await page.fill('[data-testid="company-name"]', 'Cover Letter Integration Company');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
    
    await page.click('[data-testid="nav-cover-letter"]');
    await page.fill('[data-testid="job-description"]', 'Software Developer position');
    await page.fill('[data-testid="company-name"]', 'Cover Letter Integration Company');
    await page.click('[data-testid="generate-cover-letter-button"]');
    await expect(page.locator('[data-testid="cover-letter-generated"]')).toBeVisible({ timeout: 15000 });
  });

  test('should integrate templates with resume editor', async ({ page }) => {
    await page.click('[data-testid="nav-templates"]');
    await page.click('[data-testid="select-template-button"]');
    await expect(page.locator('[data-testid="template-selected"]')).toBeVisible();
    
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toBeVisible();
  });

  test('should integrate AI with cover letter generator', async ({ page }) => {
    await page.click('[data-testid="nav-cover-letter"]');
    await page.fill('[data-testid="job-description"]', 'AI Integration Job Description');
    await page.fill('[data-testid="company-name"]', 'AI Integration Company');
    await page.click('[data-testid="generate-cover-letter-button"]');
    await expect(page.locator('[data-testid="cover-letter-generated"]')).toBeVisible({ timeout: 15000 });
    
    await page.click('[data-testid="nav-ai-panel"]');
    await page.fill('[data-testid="ai-chat-input"]', 'Improve my cover letter');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
  });

  test('should integrate file upload with email', async ({ page }) => {
    await page.click('[data-testid="nav-cloud-storage"]');
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: 'email-integration.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Email integration test content')
    });
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
    
    await page.click('[data-testid="nav-email"]');
    await page.click('[data-testid="compose-email-button"]');
    await page.fill('[data-testid="email-to"]', 'emailintegration@example.com');
    await page.fill('[data-testid="email-subject"]', 'File Attachment Test');
    await page.fill('[data-testid="email-body"]', 'Test email with file attachment');
    await page.click('[data-testid="send-email-button"]');
    await expect(page.locator('[data-testid="email-sent-confirmation"]')).toBeVisible({ timeout: 10000 });
  });

  test('should integrate profile with all components', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-name"]', 'Full Integration User');
    await page.fill('[data-testid="profile-email"]', 'fullintegration@test.com');
    await page.fill('[data-testid="profile-phone"]', '123-456-7890');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    
    // Test integration with resume editor
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toBeVisible();
    
    // Test integration with job tracker
    await page.click('[data-testid="nav-job-tracker"]');
    await expect(page.locator('[data-testid="job-table"]')).toBeVisible();
    
    // Test integration with AI panel
    await page.click('[data-testid="nav-ai-panel"]');
    await expect(page.locator('[data-testid="ai-chat-input"]')).toBeVisible();
    
    // Test integration with cloud storage
    await page.click('[data-testid="nav-cloud-storage"]');
    await expect(page.locator('[data-testid="file-upload-input"]')).toBeVisible();
    
    // Test integration with email
    await page.click('[data-testid="nav-email"]');
    await expect(page.locator('[data-testid="compose-email-button"]')).toBeVisible();
    
    // Test integration with discussion
    await page.click('[data-testid="nav-discussion"]');
    await expect(page.locator('[data-testid="new-post-button"]')).toBeVisible();
    
    // Test integration with cover letter generator
    await page.click('[data-testid="nav-cover-letter"]');
    await expect(page.locator('[data-testid="job-description"]')).toBeVisible();
    
    // Test integration with templates
    await page.click('[data-testid="nav-templates"]');
    await expect(page.locator('[data-testid="template-grid"]')).toBeVisible();
  });
});