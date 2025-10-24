import { test, expect } from '@playwright/test';

test.describe('RoleReady - Component Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should test resume editor component', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test form inputs
    await expect(page.locator('[data-testid="resume-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="resume-summary"]')).toBeVisible();
    
    // Test form submission
    await page.fill('[data-testid="resume-name"]', 'Component Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for component testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test section management
    await page.click('[data-testid="add-section-button"]');
    await expect(page.locator('[data-testid="section-title-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="section-content-0"]')).toBeVisible();
    
    await page.fill('[data-testid="section-title-0"]', 'Test Section');
    await page.fill('[data-testid="section-content-0"]', 'Test section content');
    
    // Test section deletion
    await page.click('[data-testid="delete-section-button-0"]');
    await expect(page.locator('[data-testid="section-title-0"]')).not.toBeVisible();
  });

  test('should test AI panel component', async ({ page }) => {
    await page.click('[data-testid="nav-ai-panel"]');
    
    // Test chat interface
    await expect(page.locator('[data-testid="ai-chat-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-send-button"]')).toBeVisible();
    
    // Test message sending
    await page.fill('[data-testid="ai-chat-input"]', 'Test message');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
    
    // Test chat history
    await expect(page.locator('[data-testid="chat-history"]')).toBeVisible();
    
    // Test clear chat
    await page.click('[data-testid="clear-chat-button"]');
    await expect(page.locator('[data-testid="chat-history"]')).not.toBeVisible();
  });

  test('should test job tracker component', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    
    // Test job table
    await expect(page.locator('[data-testid="job-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-job-button"]')).toBeVisible();
    
    // Test job form
    await page.click('[data-testid="add-job-button"]');
    await expect(page.locator('[data-testid="job-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="company-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="job-status"]')).toBeVisible();
    
    // Test job submission
    await page.fill('[data-testid="job-title"]', 'Component Test Job');
    await page.fill('[data-testid="company-name"]', 'Component Test Company');
    await page.selectOption('[data-testid="job-status"]', 'applied');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
    
    // Test job editing
    await page.click('[data-testid="edit-job-button-0"]');
    await expect(page.locator('[data-testid="job-title"]')).toHaveValue('Component Test Job');
    
    // Test job deletion
    await page.click('[data-testid="delete-job-button-0"]');
    await expect(page.locator('[data-testid="job-title"]')).not.toBeVisible();
  });

  test('should test cloud storage component', async ({ page }) => {
    await page.click('[data-testid="nav-cloud-storage"]');
    
    // Test file upload
    await expect(page.locator('[data-testid="file-upload-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-button"]')).toBeVisible();
    
    // Test file upload
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: 'component-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Component test content')
    });
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
    
    // Test file list
    await expect(page.locator('[data-testid="file-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="uploaded-file"]')).toBeVisible();
    
    // Test file download
    await page.click('[data-testid="download-file-button-0"]');
    await expect(page.locator('[data-testid="download-success"]')).toBeVisible();
    
    // Test file deletion
    await page.click('[data-testid="delete-file-button-0"]');
    await expect(page.locator('[data-testid="uploaded-file"]')).not.toBeVisible();
  });

  test('should test email component', async ({ page }) => {
    await page.click('[data-testid="nav-email"]');
    
    // Test email interface
    await expect(page.locator('[data-testid="compose-email-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-list"]')).toBeVisible();
    
    // Test email composition
    await page.click('[data-testid="compose-email-button"]');
    await expect(page.locator('[data-testid="email-to"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-subject"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-body"]')).toBeVisible();
    
    // Test email sending
    await page.fill('[data-testid="email-to"]', 'componenttest@example.com');
    await page.fill('[data-testid="email-subject"]', 'Component Test Email');
    await page.fill('[data-testid="email-body"]', 'Test email for component testing');
    await page.click('[data-testid="send-email-button"]');
    await expect(page.locator('[data-testid="email-sent-confirmation"]')).toBeVisible({ timeout: 10000 });
    
    // Test email list
    await expect(page.locator('[data-testid="sent-email"]')).toBeVisible();
    
    // Test email deletion
    await page.click('[data-testid="delete-email-button-0"]');
    await expect(page.locator('[data-testid="sent-email"]')).not.toBeVisible();
  });

  test('should test discussion component', async ({ page }) => {
    await page.click('[data-testid="nav-discussion"]');
    
    // Test discussion interface
    await expect(page.locator('[data-testid="new-post-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="post-list"]')).toBeVisible();
    
    // Test post creation
    await page.click('[data-testid="new-post-button"]');
    await expect(page.locator('[data-testid="post-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="post-content"]')).toBeVisible();
    
    // Test post publishing
    await page.fill('[data-testid="post-title"]', 'Component Test Post');
    await page.fill('[data-testid="post-content"]', 'Test post for component testing');
    await page.click('[data-testid="publish-post-button"]');
    await expect(page.locator('[data-testid="post-published"]')).toBeVisible();
    
    // Test post list
    await expect(page.locator('[data-testid="published-post"]')).toBeVisible();
    
    // Test post editing
    await page.click('[data-testid="edit-post-button-0"]');
    await expect(page.locator('[data-testid="post-title"]')).toHaveValue('Component Test Post');
    
    // Test post deletion
    await page.click('[data-testid="delete-post-button-0"]');
    await expect(page.locator('[data-testid="published-post"]')).not.toBeVisible();
  });

  test('should test cover letter generator component', async ({ page }) => {
    await page.click('[data-testid="nav-cover-letter"]');
    
    // Test cover letter interface
    await expect(page.locator('[data-testid="job-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="company-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="generate-cover-letter-button"]')).toBeVisible();
    
    // Test cover letter generation
    await page.fill('[data-testid="job-description"]', 'Software Developer position');
    await page.fill('[data-testid="company-name"]', 'Component Test Company');
    await page.click('[data-testid="generate-cover-letter-button"]');
    await expect(page.locator('[data-testid="cover-letter-generated"]')).toBeVisible({ timeout: 15000 });
    
    // Test cover letter display
    await expect(page.locator('[data-testid="generated-cover-letter"]')).toBeVisible();
    
    // Test cover letter editing
    await page.click('[data-testid="edit-cover-letter-button"]');
    await expect(page.locator('[data-testid="cover-letter-editor"]')).toBeVisible();
    
    // Test cover letter saving
    await page.click('[data-testid="save-cover-letter-button"]');
    await expect(page.locator('[data-testid="cover-letter-saved"]')).toBeVisible();
  });

  test('should test profile component', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    
    // Test profile form
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-phone"]')).toBeVisible();
    
    // Test profile saving
    await page.fill('[data-testid="profile-name"]', 'Component Test User');
    await page.fill('[data-testid="profile-email"]', 'componenttest@example.com');
    await page.fill('[data-testid="profile-phone"]', '123-456-7890');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    
    // Test profile editing
    await page.click('[data-testid="edit-profile-button"]');
    await expect(page.locator('[data-testid="profile-name"]')).toHaveValue('Component Test User');
    
    // Test profile deletion
    await page.click('[data-testid="delete-profile-button"]');
    await expect(page.locator('[data-testid="profile-deleted"]')).toBeVisible();
  });

  test('should test templates component', async ({ page }) => {
    await page.click('[data-testid="nav-templates"]');
    
    // Test template grid
    await expect(page.locator('[data-testid="template-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="template-item"]')).toBeVisible();
    
    // Test template selection
    await page.click('[data-testid="select-template-button"]');
    await expect(page.locator('[data-testid="template-selected"]')).toBeVisible();
    
    // Test template preview
    await page.click('[data-testid="preview-template-button"]');
    await expect(page.locator('[data-testid="template-preview"]')).toBeVisible();
    
    // Test template customization
    await page.click('[data-testid="customize-template-button"]');
    await expect(page.locator('[data-testid="template-customizer"]')).toBeVisible();
    
    // Test template saving
    await page.click('[data-testid="save-template-button"]');
    await expect(page.locator('[data-testid="template-saved"]')).toBeVisible();
  });
});
