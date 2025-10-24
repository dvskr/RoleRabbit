import { test, expect } from '@playwright/test';

test.describe('RoleReady - Data Integrity Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should maintain data consistency across operations', async ({ page }) => {
    // Create resume
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Consistency Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for data consistency');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Create job linked to resume
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'Consistency Test Job');
    await page.fill('[data-testid="company-name"]', 'Consistency Test Company');
    await page.selectOption('[data-testid="job-status"]', 'applied');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
    
    // Verify data consistency
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Consistency Test Resume');
    
    await page.click('[data-testid="nav-job-tracker"]');
    await expect(page.locator('[data-testid="job-title"]')).toHaveValue('Consistency Test Job');
  });

  test('should maintain data integrity during concurrent operations', async ({ page }) => {
    // Test concurrent resume editing
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Concurrent Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for concurrent operations');
    
    // Simulate concurrent operations
    await Promise.all([
      page.click('[data-testid="save-resume-button"]'),
      page.click('[data-testid="add-section-button"]'),
      page.fill('[data-testid="section-title-0"]', 'Experience')
    ]);
    
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    await expect(page.locator('[data-testid="section-title-0"]')).toHaveValue('Experience');
  });

  test('should maintain data integrity during network interruptions', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Network Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for network interruptions');
    
    // Simulate network interruption
    await page.context().setOffline(true);
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
    
    // Restore network
    await page.context().setOffline(false);
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Verify data integrity
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Network Test Resume');
  });

  test('should maintain data integrity during validation errors', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test validation error handling
    await page.fill('[data-testid="resume-name"]', '');
    await page.fill('[data-testid="resume-summary"]', 'Valid summary');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    
    // Fix validation error
    await page.fill('[data-testid="resume-name"]', 'Validation Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Verify data integrity
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Validation Test Resume');
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveValue('Valid summary');
  });

  test('should maintain data integrity during data migration', async ({ page }) => {
    // Create data with old schema
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Migration Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Resume for migration testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Simulate schema migration
    await page.route('**/api/resume', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          resumes: [{
            id: 1,
            name: 'Migration Test Resume',
            summary: 'Resume for migration testing',
            version: 2, // New schema version
            migratedAt: new Date().toISOString()
          }]
        })
      });
    });
    
    // Reload and verify migration
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Migration Test Resume');
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveValue('Resume for migration testing');
    await expect(page.locator('[data-testid="migration-notice"]')).toBeVisible();
  });

  test('should maintain data integrity during data backup and restore', async ({ page }) => {
    // Create test data
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Backup Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Resume for backup testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Create backup
    await page.click('[data-testid="backup-button"]');
    await expect(page.locator('[data-testid="backup-created"]')).toBeVisible();
    
    // Clear data
    await page.click('[data-testid="clear-resume-button"]');
    await expect(page.locator('[data-testid="empty-resume-message"]')).toBeVisible();
    
    // Restore from backup
    await page.click('[data-testid="restore-button"]');
    await expect(page.locator('[data-testid="restore-success"]')).toBeVisible();
    
    // Verify data integrity
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Backup Test Resume');
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveValue('Resume for backup testing');
  });

  test('should maintain data integrity during data export and import', async ({ page }) => {
    // Create test data
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Export Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Resume for export testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Export data
    await page.click('[data-testid="export-button"]');
    await page.click('[data-testid="export-json"]');
    await expect(page.locator('[data-testid="export-success"]')).toBeVisible();
    
    // Clear data
    await page.click('[data-testid="clear-resume-button"]');
    await expect(page.locator('[data-testid="empty-resume-message"]')).toBeVisible();
    
    // Import data
    await page.click('[data-testid="import-button"]');
    const fileInput = page.locator('[data-testid="import-file-input"]');
    await fileInput.setInputFiles({
      name: 'resume.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({
        name: 'Export Test Resume',
        summary: 'Resume for export testing'
      }))
    });
    await expect(page.locator('[data-testid="import-success"]')).toBeVisible();
    
    // Verify data integrity
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Export Test Resume');
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveValue('Resume for export testing');
  });

  test('should maintain data integrity during data synchronization', async ({ page }) => {
    // Create test data
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Sync Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Resume for sync testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Enable synchronization
    await page.click('[data-testid="sync-button"]');
    await expect(page.locator('[data-testid="sync-enabled"]')).toBeVisible();
    
    // Simulate sync conflict
    await page.route('**/api/resume', route => {
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          conflict: true,
          localVersion: 1,
          remoteVersion: 2
        })
      });
    });
    
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="sync-conflict"]')).toBeVisible();
    
    // Resolve conflict
    await page.click('[data-testid="resolve-conflict"]');
    await page.selectOption('[data-testid="conflict-resolution"]', 'merge');
    await page.click('[data-testid="apply-resolution"]');
    await expect(page.locator('[data-testid="conflict-resolved"]')).toBeVisible();
  });

  test('should maintain data integrity during data validation', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test data validation
    await page.fill('[data-testid="resume-name"]', 'Validation Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Resume for validation testing');
    await page.click('[data-testid="validate-button"]');
    await expect(page.locator('[data-testid="validation-success"]')).toBeVisible();
    
    // Test invalid data
    await page.fill('[data-testid="resume-name"]', '');
    await page.click('[data-testid="validate-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    
    // Test data correction
    await page.fill('[data-testid="resume-name"]', 'Corrected Resume');
    await page.click('[data-testid="validate-button"]');
    await expect(page.locator('[data-testid="validation-success"]')).toBeVisible();
  });

  test('should maintain data integrity during data transformation', async ({ page }) => {
    // Create test data
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Transform Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Resume for transformation testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Transform data
    await page.click('[data-testid="transform-button"]');
    await page.selectOption('[data-testid="transform-option"]', 'uppercase');
    await page.click('[data-testid="apply-transform"]');
    await expect(page.locator('[data-testid="transform-success"]')).toBeVisible();
    
    // Verify transformation
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('TRANSFORM TEST RESUME');
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveValue('RESUME FOR TRANSFORMATION TESTING');
  });

  test('should maintain data integrity during data cleanup', async ({ page }) => {
    // Create test data
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Cleanup Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Resume for cleanup testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Cleanup data
    await page.click('[data-testid="cleanup-button"]');
    await page.selectOption('[data-testid="cleanup-option"]', 'remove-empty-fields');
    await page.click('[data-testid="apply-cleanup"]');
    await expect(page.locator('[data-testid="cleanup-success"]')).toBeVisible();
    
    // Verify cleanup
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Cleanup Test Resume');
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveValue('Resume for cleanup testing');
  });

  test('should maintain data integrity during data archiving', async ({ page }) => {
    // Create test data
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Archive Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Resume for archiving testing');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Archive data
    await page.click('[data-testid="archive-button"]');
    await page.selectOption('[data-testid="archive-option"]', 'move-to-archive');
    await page.click('[data-testid="apply-archive"]');
    await expect(page.locator('[data-testid="archive-success"]')).toBeVisible();
    
    // Verify archiving
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Archive Test Resume');
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveValue('Resume for archiving testing');
    await expect(page.locator('[data-testid="archived-indicator"]')).toBeVisible();
  });
});