import { test, expect } from '@playwright/test';

test.describe('RoleReady - Unit Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should test resume name input validation', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test empty input
    await page.fill('[data-testid="resume-name"]', '');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    
    // Test valid input
    await page.fill('[data-testid="resume-name"]', 'Valid Resume Name');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should test resume summary input validation', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test empty input
    await page.fill('[data-testid="resume-summary"]', '');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    
    // Test valid input
    await page.fill('[data-testid="resume-summary"]', 'Valid resume summary');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should test email input validation', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    
    // Test invalid email
    await page.fill('[data-testid="profile-email"]', 'invalid-email');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="email-validation-error"]')).toBeVisible();
    
    // Test valid email
    await page.fill('[data-testid="profile-email"]', 'valid@example.com');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
  });

  test('should test phone input validation', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    
    // Test invalid phone
    await page.fill('[data-testid="profile-phone"]', '123');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="phone-validation-error"]')).toBeVisible();
    
    // Test valid phone
    await page.fill('[data-testid="profile-phone"]', '123-456-7890');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
  });

  test('should test file upload validation', async ({ page }) => {
    await page.click('[data-testid="nav-cloud-storage"]');
    
    // Test invalid file type
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: 'test.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('test')
    });
    await expect(page.locator('[data-testid="invalid-file-error"]')).toBeVisible();
    
    // Test valid file type
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test content')
    });
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
  });

  test('should test input length validation', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test too long input
    const longText = 'A'.repeat(10000);
    await page.fill('[data-testid="resume-summary"]', longText);
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="length-validation-error"]')).toBeVisible();
    
    // Test valid length input
    await page.fill('[data-testid="resume-summary"]', 'Valid summary');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should test button states', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test disabled state
    await expect(page.locator('[data-testid="save-resume-button"]')).toBeEnabled();
    
    // Test enabled state
    await page.fill('[data-testid="resume-name"]', 'Test Resume');
    await expect(page.locator('[data-testid="save-resume-button"]')).toBeEnabled();
  });

  test('should test form submission', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test form submission
    await page.fill('[data-testid="resume-name"]', 'Form Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test form submission');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should test data persistence', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test data saving
    await page.fill('[data-testid="resume-name"]', 'Persistence Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test data loading
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Persistence Test Resume');
  });

  test('should test error handling', async ({ page }) => {
    await page.route('**/api/resume', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Error Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should test loading states', async ({ page }) => {
    await page.route('**/api/resume', route => {
      setTimeout(() => {
        route.continue();
      }, 2000);
    });
    
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Loading Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
  });

  test('should test success states', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Success Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should test input formatting', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test input formatting
    await page.fill('[data-testid="resume-name"]', '  formatted resume name  ');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Verify formatting was applied
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('formatted resume name');
  });

  test('should test input sanitization', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test input sanitization
    const maliciousInput = '<script>alert("XSS")</script>';
    await page.fill('[data-testid="resume-summary"]', maliciousInput);
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Verify input was sanitized
    await expect(page.locator('[data-testid="resume-summary"]')).not.toContainText('<script>');
  });
});
