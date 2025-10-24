import { test, expect } from '@playwright/test';

test.describe('RoleReady - Database Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should test resume data persistence', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Database Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for database testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Database Test Resume');
  });

  test('should test profile data persistence', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-name"]', 'Database Test User');
    await page.fill('[data-testid="profile-email"]', 'databasetest@example.com');
    await page.fill('[data-testid="profile-phone"]', '123-456-7890');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-profile"]');
    await expect(page.locator('[data-testid="profile-name"]')).toHaveValue('Database Test User');
  });

  test('should test job tracker data persistence', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'Database Test Job');
    await page.fill('[data-testid="company-name"]', 'Database Test Company');
    await page.selectOption('[data-testid="job-status"]', 'applied');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-job-tracker"]');
    await expect(page.locator('[data-testid="job-title"]')).toHaveValue('Database Test Job');
  });

  test('should test file upload data persistence', async ({ page }) => {
    await page.click('[data-testid="nav-cloud-storage"]');
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: 'database-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Database test content')
    });
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-cloud-storage"]');
    await expect(page.locator('[data-testid="uploaded-file"]')).toBeVisible();
  });

  test('should test email data persistence', async ({ page }) => {
    await page.click('[data-testid="nav-email"]');
    await page.click('[data-testid="compose-email-button"]');
    await page.fill('[data-testid="email-to"]', 'databasetest@example.com');
    await page.fill('[data-testid="email-subject"]', 'Database Test Email');
    await page.fill('[data-testid="email-body"]', 'Test email for database testing');
    await page.click('[data-testid="send-email-button"]');
    await expect(page.locator('[data-testid="email-sent-confirmation"]')).toBeVisible({ timeout: 10000 });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-email"]');
    await expect(page.locator('[data-testid="sent-email"]')).toBeVisible();
  });

  test('should test discussion data persistence', async ({ page }) => {
    await page.click('[data-testid="nav-discussion"]');
    await page.click('[data-testid="new-post-button"]');
    await page.fill('[data-testid="post-title"]', 'Database Test Post');
    await page.fill('[data-testid="post-content"]', 'Test post for database testing');
    await page.click('[data-testid="publish-post-button"]');
    await expect(page.locator('[data-testid="post-published"]')).toBeVisible();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-discussion"]');
    await expect(page.locator('[data-testid="published-post"]')).toBeVisible();
  });

  test('should test cover letter data persistence', async ({ page }) => {
    await page.click('[data-testid="nav-cover-letter"]');
    await page.fill('[data-testid="job-description"]', 'Database Test Job Description');
    await page.fill('[data-testid="company-name"]', 'Database Test Company');
    await page.click('[data-testid="generate-cover-letter-button"]');
    await expect(page.locator('[data-testid="cover-letter-generated"]')).toBeVisible({ timeout: 15000 });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-cover-letter"]');
    await expect(page.locator('[data-testid="generated-cover-letter"]')).toBeVisible();
  });

  test('should test template data persistence', async ({ page }) => {
    await page.click('[data-testid="nav-templates"]');
    await page.click('[data-testid="select-template-button"]');
    await expect(page.locator('[data-testid="template-selected"]')).toBeVisible();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-templates"]');
    await expect(page.locator('[data-testid="selected-template"]')).toBeVisible();
  });

  test('should test data integrity', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Integrity Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    await page.click('[data-testid="nav-profile"]');
    await page.fill('[data-testid="profile-name"]', 'Integrity Test User');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Integrity Test Resume');
    
    await page.click('[data-testid="nav-profile"]');
    await expect(page.locator('[data-testid="profile-name"]')).toHaveValue('Integrity Test User');
  });

  test('should test data cleanup', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Cleanup Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    await page.click('[data-testid="clear-resume-button"]');
    await expect(page.locator('[data-testid="empty-resume-message"]')).toBeVisible();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('');
  });
});