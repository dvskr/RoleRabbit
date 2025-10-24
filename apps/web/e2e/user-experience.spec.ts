import { test, expect } from '@playwright/test';

test.describe('RoleReady - User Experience Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should provide intuitive navigation', async ({ page }) => {
    // Test main navigation
    await expect(page.locator('[data-testid="navigation-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-home"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-resume-editor"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-ai-panel"]')).toBeVisible();
    
    // Test navigation labels
    await expect(page.locator('[data-testid="nav-home"]')).toContainText('Home');
    await expect(page.locator('[data-testid="nav-resume-editor"]')).toContainText('Resume Editor');
    await expect(page.locator('[data-testid="nav-ai-panel"]')).toContainText('AI Panel');
  });

  test('should provide clear visual feedback', async ({ page }) => {
    // Test button states
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'UX Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    await expect(page.locator('[data-testid="resume-saved"]')).toHaveCSS('color', /green/);
    
    // Test error states
    await page.fill('[data-testid="resume-name"]', '');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toHaveCSS('color', /red/);
  });

  test('should provide helpful tooltips', async ({ page }) => {
    // Test tooltip display
    await page.hover('[data-testid="help-button"]');
    await expect(page.locator('[data-testid="tooltip"]')).toBeVisible();
    await expect(page.locator('[data-testid="tooltip"]')).toContainText('Help information');
    
    // Test tooltip positioning
    await expect(page.locator('[data-testid="tooltip"]')).toHaveCSS('position', 'absolute');
    await expect(page.locator('[data-testid="tooltip"]')).toHaveCSS('z-index', '1000');
  });

  test('should provide clear error messages', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test validation errors
    await page.fill('[data-testid="resume-name"]', '');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('This field is required');
    
    // Test network errors
    await page.route('**/api/resume', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.fill('[data-testid="resume-name"]', 'Error Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Something went wrong');
  });

  test('should provide consistent design', async ({ page }) => {
    // Test consistent button styling
    await expect(page.locator('[data-testid="save-button"]')).toHaveCSS('background-color', /rgb\(59, 130, 246\)/);
    await expect(page.locator('[data-testid="cancel-button"]')).toHaveCSS('background-color', /rgb\(107, 114, 128\)/);
    await expect(page.locator('[data-testid="add-button"]')).toHaveCSS('background-color', /rgb\(34, 197, 94\)/);
    
    // Test consistent spacing
    await expect(page.locator('[data-testid="save-button"]')).toHaveCSS('margin', /8px/);
    await expect(page.locator('[data-testid="cancel-button"]')).toHaveCSS('margin', /8px/);
    await expect(page.locator('[data-testid="add-button"]')).toHaveCSS('margin', /8px/);
  });

  test('should provide responsive design', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible();
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
  });

  test('should provide accessible forms', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test form labels
    await expect(page.locator('[data-testid="resume-name"]')).toHaveAttribute('aria-label', 'Resume name');
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveAttribute('aria-label', 'Resume summary');
    
    // Test required field indicators
    await expect(page.locator('[data-testid="resume-name"]')).toHaveAttribute('aria-required', 'true');
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveAttribute('aria-required', 'true');
    
    // Test form validation
    await page.fill('[data-testid="resume-name"]', '');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('should provide efficient workflows', async ({ page }) => {
    // Test resume creation workflow
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Workflow Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for workflow testing');
    await page.click('[data-testid="add-section-button"]');
    await page.fill('[data-testid="section-title-0"]', 'Experience');
    await page.fill('[data-testid="section-content-0"]', 'Software Developer');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Test job application workflow
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'Workflow Test Job');
    await page.fill('[data-testid="company-name"]', 'Workflow Test Company');
    await page.selectOption('[data-testid="job-status"]', 'applied');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
  });

  test('should provide helpful onboarding', async ({ page }) => {
    // Test welcome message
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome to RoleReady');
    
    // Test getting started guide
    await page.click('[data-testid="getting-started-button"]');
    await expect(page.locator('[data-testid="getting-started-modal"]')).toBeVisible();
    
    // Test tutorial steps
    await page.click('[data-testid="next-step-button"]');
    await expect(page.locator('[data-testid="tutorial-step-2"]')).toBeVisible();
    
    // Test skip tutorial
    await page.click('[data-testid="skip-tutorial-button"]');
    await expect(page.locator('[data-testid="getting-started-modal"]')).not.toBeVisible();
  });

  test('should provide search functionality', async ({ page }) => {
    // Test search input
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-input"]')).toHaveAttribute('placeholder', 'Search...');
    
    // Test search functionality
    await page.fill('[data-testid="search-input"]', 'resume');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Test search results
    await expect(page.locator('[data-testid="search-result-item"]')).toBeVisible();
  });

  test('should provide filtering options', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    
    // Test filter dropdown
    await expect(page.locator('[data-testid="status-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-filter"]')).toHaveAttribute('aria-label', 'Filter by status');
    
    // Test filter functionality
    await page.selectOption('[data-testid="status-filter"]', 'applied');
    await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();
    
    // Test clear filters
    await page.click('[data-testid="clear-filters-button"]');
    await expect(page.locator('[data-testid="all-results"]')).toBeVisible();
  });

  test('should provide sorting options', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    
    // Test sort dropdown
    await expect(page.locator('[data-testid="sort-dropdown"]')).toBeVisible();
    await expect(page.locator('[data-testid="sort-dropdown"]')).toHaveAttribute('aria-label', 'Sort by');
    
    // Test sort functionality
    await page.selectOption('[data-testid="sort-dropdown"]', 'date');
    await expect(page.locator('[data-testid="sorted-results"]')).toBeVisible();
    
    // Test sort order
    await page.click('[data-testid="sort-order-button"]');
    await expect(page.locator('[data-testid="sort-order-button"]')).toHaveAttribute('aria-label', 'Sort descending');
  });

  test('should provide bulk operations', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    
    // Test bulk selection
    await page.click('[data-testid="select-all-checkbox"]');
    await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
    
    // Test bulk delete
    await page.click('[data-testid="bulk-delete-button"]');
    await expect(page.locator('[data-testid="bulk-delete-confirmation"]')).toBeVisible();
    
    // Test bulk status update
    await page.click('[data-testid="bulk-status-update-button"]');
    await expect(page.locator('[data-testid="bulk-status-modal"]')).toBeVisible();
  });

  test('should provide export functionality', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test export options
    await page.click('[data-testid="export-button"]');
    await expect(page.locator('[data-testid="export-modal"]')).toBeVisible();
    
    // Test PDF export
    await page.click('[data-testid="export-pdf-button"]');
    await expect(page.locator('[data-testid="export-success"]')).toBeVisible();
    
    // Test DOCX export
    await page.click('[data-testid="export-docx-button"]');
    await expect(page.locator('[data-testid="export-success"]')).toBeVisible();
  });

  test('should provide import functionality', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test import options
    await page.click('[data-testid="import-button"]');
    await expect(page.locator('[data-testid="import-modal"]')).toBeVisible();
    
    // Test file import
    const fileInput = page.locator('[data-testid="import-file-input"]');
    await fileInput.setInputFiles({
      name: 'import-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Import test content')
    });
    await expect(page.locator('[data-testid="import-success"]')).toBeVisible();
  });

  test('should provide undo/redo functionality', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test undo functionality
    await page.fill('[data-testid="resume-name"]', 'Undo Test Resume');
    await page.click('[data-testid="undo-button"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('');
    
    // Test redo functionality
    await page.click('[data-testid="redo-button"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Undo Test Resume');
  });

  test('should provide auto-save functionality', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test auto-save
    await page.fill('[data-testid="resume-name"]', 'Auto-save Test Resume');
    await page.waitForTimeout(2000); // Wait for auto-save
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toBeVisible();
    
    // Test auto-save on page reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-resume-editor"]');
    await expect(page.locator('[data-testid="resume-name"]')).toHaveValue('Auto-save Test Resume');
  });

  test('should provide keyboard shortcuts', async ({ page }) => {
    // Test keyboard shortcuts
    await page.keyboard.press('Control+s');
    await expect(page.locator('[data-testid="save-shortcut-feedback"]')).toBeVisible();
    
    await page.keyboard.press('Control+z');
    await expect(page.locator('[data-testid="undo-shortcut-feedback"]')).toBeVisible();
    
    await page.keyboard.press('Control+y');
    await expect(page.locator('[data-testid="redo-shortcut-feedback"]')).toBeVisible();
  });

  test('should provide context menus', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test context menu
    await page.click('[data-testid="resume-name"]', { button: 'right' });
    await expect(page.locator('[data-testid="context-menu"]')).toBeVisible();
    
    // Test context menu actions
    await page.click('[data-testid="context-menu-copy"]');
    await expect(page.locator('[data-testid="copy-feedback"]')).toBeVisible();
    
    await page.click('[data-testid="context-menu-paste"]');
    await expect(page.locator('[data-testid="paste-feedback"]')).toBeVisible();
  });
});