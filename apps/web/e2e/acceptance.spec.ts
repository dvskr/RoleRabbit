import { test, expect } from '@playwright/test';

test.describe('RoleReady - Acceptance Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should meet user requirements for resume creation', async ({ page }) => {
    // User requirement: Create a professional resume
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Professional Resume');
    await page.fill('[data-testid="resume-summary"]', 'Experienced software developer with 5+ years of experience');
    
    // User requirement: Add multiple sections
    await page.click('[data-testid="add-section-button"]');
    await page.fill('[data-testid="section-title-0"]', 'Experience');
    await page.fill('[data-testid="section-content-0"]', 'Software Developer at Tech Company (2020-2024)');
    
    await page.click('[data-testid="add-section-button"]');
    await page.fill('[data-testid="section-title-1"]', 'Education');
    await page.fill('[data-testid="section-content-1"]', 'Bachelor of Computer Science, University of Technology');
    
    // User requirement: Save and persist resume
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // User requirement: Resume should be accessible after page reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Professional Resume');
  });

  test('should meet user requirements for AI assistance', async ({ page }) => {
    // User requirement: Get AI help to improve resume
    await page.click('[data-testid="nav-ai-panel"]');
    await page.fill('[data-testid="ai-chat-input"]', 'Help me improve my resume');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
    
    // User requirement: AI should provide helpful suggestions
    const response = await page.locator('[data-testid="ai-response"]').textContent();
    expect(response).toBeTruthy();
    expect(response?.length).toBeGreaterThan(10);
  });

  test('should meet user requirements for job tracking', async ({ page }) => {
    // User requirement: Track job applications
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'Senior Software Developer');
    await page.fill('[data-testid="company-name"]', 'Tech Corp');
    await page.selectOption('[data-testid="job-status"]', 'applied');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
    
    // User requirement: Update job status
    await page.click('[data-testid="edit-job-button-0"]');
    await page.selectOption('[data-testid="job-status"]', 'interview');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
  });

  test('should meet user requirements for file management', async ({ page }) => {
    // User requirement: Upload and manage files
    await page.click('[data-testid="nav-cloud-storage"]');
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: 'resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Resume content')
    });
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
    
    // User requirement: Download files
    await page.click('[data-testid="download-file-button-0"]');
    await expect(page.locator('[data-testid="download-success"]')).toBeVisible();
    
    // User requirement: Delete files
    await page.click('[data-testid="delete-file-button-0"]');
    await expect(page.locator('[data-testid="uploaded-file"]')).not.toBeVisible();
  });

  test('should meet user requirements for email communication', async ({ page }) => {
    // User requirement: Send professional emails
    await page.click('[data-testid="nav-email"]');
    await page.click('[data-testid="compose-email-button"]');
    await page.fill('[data-testid="email-to"]', 'hr@company.com');
    await page.fill('[data-testid="email-subject"]', 'Application for Software Developer Position');
    await page.fill('[data-testid="email-body"]', 'Dear Hiring Manager,\n\nI am writing to express my interest in the Software Developer position...');
    await page.click('[data-testid="send-email-button"]');
    await expect(page.locator('[data-testid="email-sent-confirmation"]')).toBeVisible({ timeout: 10000 });
    
    // User requirement: Track sent emails
    await expect(page.locator('[data-testid="sent-email"]')).toBeVisible();
  });

  test('should meet user requirements for community interaction', async ({ page }) => {
    // User requirement: Participate in discussions
    await page.click('[data-testid="nav-discussion"]');
    await page.click('[data-testid="new-post-button"]');
    await page.fill('[data-testid="post-title"]', 'Tips for Software Developer Interviews');
    await page.fill('[data-testid="post-content"]', 'Here are some helpful tips for software developer interviews...');
    await page.click('[data-testid="publish-post-button"]');
    await expect(page.locator('[data-testid="post-published"]')).toBeVisible();
    
    // User requirement: View and respond to posts
    await expect(page.locator('[data-testid="published-post"]')).toBeVisible();
  });

  test('should meet user requirements for cover letter generation', async ({ page }) => {
    // User requirement: Generate personalized cover letters
    await page.click('[data-testid="nav-cover-letter"]');
    await page.fill('[data-testid="job-description"]', 'We are looking for a Senior Software Developer with experience in React and Node.js...');
    await page.fill('[data-testid="company-name"]', 'Innovation Tech');
    await page.click('[data-testid="generate-cover-letter-button"]');
    await expect(page.locator('[data-testid="cover-letter-generated"]')).toBeVisible({ timeout: 15000 });
    
    // User requirement: Customize generated cover letter
    await page.click('[data-testid="edit-cover-letter-button"]');
    await expect(page.locator('[data-testid="cover-letter-editor"]')).toBeVisible();
  });

  test('should meet user requirements for profile management', async ({ page }) => {
    // User requirement: Manage personal profile
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-name"]', 'John Doe');
    await page.fill('[data-testid="profile-email"]', 'john.doe@email.com');
    await page.fill('[data-testid="profile-phone"]', '555-123-4567');
    await page.fill('[data-testid="profile-linkedin"]', 'linkedin.com/in/johndoe');
    await page.fill('[data-testid="profile-github"]', 'github.com/johndoe');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    
    // User requirement: Profile should be accessible across all features
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toBeVisible();
    
    await page.click('[data-testid="nav-email"]');
    await expect(page.locator('[data-testid="compose-email-button"]')).toBeVisible();
  });

  test('should meet user requirements for template selection', async ({ page }) => {
    // User requirement: Choose from professional templates
    await page.click('[data-testid="nav-templates"]');
    await expect(page.locator('[data-testid="template-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="template-item"]')).toBeVisible();
    
    // User requirement: Preview templates
    await page.click('[data-testid="preview-template-button"]');
    await expect(page.locator('[data-testid="template-preview"]')).toBeVisible();
    
    // User requirement: Select and use template
    await page.click('[data-testid="select-template-button"]');
    await expect(page.locator('[data-testid="template-selected"]')).toBeVisible();
  });

  test('should meet user requirements for data security', async ({ page }) => {
    // User requirement: Data should be secure and private
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-name"]', 'Secure User');
    await page.fill('[data-testid="profile-email"]', 'secure@example.com');
    await page.fill('[data-testid="profile-phone"]', '555-999-8888');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    
    // User requirement: Data should not be exposed in client-side storage
    const storageData = await page.evaluate(() => {
      return localStorage.getItem('profile-data');
    });
    expect(storageData).not.toContain('secure@example.com');
    expect(storageData).not.toContain('555-999-8888');
  });

  test('should meet user requirements for performance', async ({ page }) => {
    // User requirement: Application should be fast and responsive
    const startTime = Date.now();
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Performance Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for performance testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  test('should meet user requirements for accessibility', async ({ page }) => {
    // User requirement: Application should be accessible to all users
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test screen reader support
    await expect(page.locator('[data-testid="resume-name"]')).toHaveAttribute('aria-label', 'Resume name');
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveAttribute('aria-label', 'Resume summary');
    
    // Test high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('[data-testid="resume-name"]')).toBeVisible();
  });

  test('should meet user requirements for mobile compatibility', async ({ page }) => {
    // User requirement: Application should work on mobile devices
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Mobile Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for mobile testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test mobile navigation
    await page.click('[data-testid="mobile-nav-toggle"]');
    await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();
  });

  test('should meet user requirements for error handling', async ({ page }) => {
    // User requirement: Application should handle errors gracefully
    await page.route('**/api/resume', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Error Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    // User requirement: Users should be able to retry failed operations
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });
});
