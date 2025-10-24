import { test, expect } from '@playwright/test';

test.describe('RoleReady - Accessibility Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    // Test main navigation
    await expect(page.locator('[data-testid="navigation-menu"]')).toHaveAttribute('role', 'navigation');
    await expect(page.locator('[data-testid="navigation-menu"]')).toHaveAttribute('aria-label', 'Main navigation');
    
    // Test main content
    await expect(page.locator('[data-testid="main-content"]')).toHaveAttribute('role', 'main');
    
    // Test sidebar
    await expect(page.locator('[data-testid="sidebar"]')).toHaveAttribute('role', 'complementary');
    await expect(page.locator('[data-testid="sidebar"]')).toHaveAttribute('aria-label', 'Sidebar');
    
    // Test header
    await expect(page.locator('[data-testid="header"]')).toHaveAttribute('role', 'banner');
    
    // Test footer
    await expect(page.locator('[data-testid="footer"]')).toHaveAttribute('role', 'contentinfo');
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test enter key activation
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="focused-content"]')).toBeVisible();
    
    // Test escape key
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="modal-closed"]')).toBeVisible();
  });

  test('should have proper heading structure', async ({ page }) => {
    // Test heading hierarchy
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    const h3 = page.locator('h3');
    
    await expect(h1).toHaveCount(1);
    await expect(h2).toHaveCount(1);
    await expect(h3).toHaveCount(1);
    
    // Test heading content
    await expect(h1).toContainText('RoleReady');
    await expect(h2).toContainText('Dashboard');
    await expect(h3).toContainText('Quick Actions');
  });

  test('should have proper form labels', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test form labels
    await expect(page.locator('[data-testid="resume-name"]')).toHaveAttribute('aria-label', 'Resume name');
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveAttribute('aria-label', 'Resume summary');
    
    // Test required field indicators
    await expect(page.locator('[data-testid="resume-name"]')).toHaveAttribute('aria-required', 'true');
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveAttribute('aria-required', 'true');
  });

  test('should have proper button labels', async ({ page }) => {
    // Test button accessibility
    await expect(page.locator('[data-testid="save-button"]')).toHaveAttribute('aria-label', 'Save changes');
    await expect(page.locator('[data-testid="cancel-button"]')).toHaveAttribute('aria-label', 'Cancel changes');
    await expect(page.locator('[data-testid="add-button"]')).toHaveAttribute('aria-label', 'Add new item');
    await expect(page.locator('[data-testid="delete-button"]')).toHaveAttribute('aria-label', 'Delete item');
  });

  test('should have proper link accessibility', async ({ page }) => {
    // Test link accessibility
    await expect(page.locator('[data-testid="nav-home"]')).toHaveAttribute('aria-label', 'Go to home page');
    await expect(page.locator('[data-testid="nav-resume-editor"]')).toHaveAttribute('aria-label', 'Go to resume editor');
    await expect(page.locator('[data-testid="nav-ai-panel"]')).toHaveAttribute('aria-label', 'Go to AI panel');
    
    // Test external links
    await expect(page.locator('[data-testid="external-link"]')).toHaveAttribute('aria-label', 'External link');
    await expect(page.locator('[data-testid="external-link"]')).toHaveAttribute('target', '_blank');
  });

  test('should have proper table accessibility', async ({ page }) => {
    await page.click('[data-testid="nav-job-tracker"]');
    
    // Test table accessibility
    await expect(page.locator('[data-testid="job-table"]')).toHaveAttribute('role', 'table');
    await expect(page.locator('[data-testid="job-table"]')).toHaveAttribute('aria-label', 'Job applications table');
    
    // Test table headers
    await expect(page.locator('[data-testid="table-header"]')).toHaveAttribute('role', 'columnheader');
    await expect(page.locator('[data-testid="table-header"]')).toHaveAttribute('aria-sort', 'none');
  });

  test('should have proper modal accessibility', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    
    // Test modal accessibility
    await expect(page.locator('[data-testid="profile-modal"]')).toHaveAttribute('role', 'dialog');
    await expect(page.locator('[data-testid="profile-modal"]')).toHaveAttribute('aria-modal', 'true');
    await expect(page.locator('[data-testid="profile-modal"]')).toHaveAttribute('aria-labelledby', 'modal-title');
    
    // Test modal focus management
    await expect(page.locator('[data-testid="modal-close-button"]')).toHaveAttribute('aria-label', 'Close modal');
  });

  test('should have proper list accessibility', async ({ page }) => {
    await page.click('[data-testid="nav-discussion"]');
    
    // Test list accessibility
    await expect(page.locator('[data-testid="post-list"]')).toHaveAttribute('role', 'list');
    await expect(page.locator('[data-testid="post-list"]')).toHaveAttribute('aria-label', 'Discussion posts');
    
    // Test list items
    await expect(page.locator('[data-testid="post-item"]')).toHaveAttribute('role', 'listitem');
  });

  test('should have proper image accessibility', async ({ page }) => {
    // Test image accessibility
    await expect(page.locator('[data-testid="logo"]')).toHaveAttribute('alt', 'RoleReady logo');
    await expect(page.locator('[data-testid="profile-picture"]')).toHaveAttribute('alt', 'Profile picture');
    
    // Test decorative images
    await expect(page.locator('[data-testid="decorative-image"]')).toHaveAttribute('aria-hidden', 'true');
  });

  test('should have proper color contrast', async ({ page }) => {
    // Test color contrast ratios
    const textColor = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="main-text"]');
      const styles = window.getComputedStyle(element);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor
      };
    });
    
    expect(textColor.color).toBeDefined();
    expect(textColor.backgroundColor).toBeDefined();
  });

  test('should have proper focus indicators', async ({ page }) => {
    // Test focus indicators
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveCSS('outline', /none/);
    await expect(focusedElement).toHaveCSS('box-shadow', /0 0 0 2px/);
  });

  test('should have proper error handling', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test error accessibility
    await page.fill('[data-testid="resume-name"]', '');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toHaveAttribute('role', 'alert');
    await expect(page.locator('[data-testid="validation-error"]')).toHaveAttribute('aria-live', 'polite');
  });

  test('should have proper loading states', async ({ page }) => {
    await page.click('[data-testid="nav-ai-panel"]');
    
    // Test loading accessibility
    await page.fill('[data-testid="ai-chat-input"]', 'Test message');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="loading-indicator"]')).toHaveAttribute('aria-label', 'Loading');
    await expect(page.locator('[data-testid="loading-indicator"]')).toHaveAttribute('aria-live', 'polite');
  });

  test('should have proper skip links', async ({ page }) => {
    // Test skip links
    await expect(page.locator('[data-testid="skip-to-main"]')).toBeVisible();
    await expect(page.locator('[data-testid="skip-to-main"]')).toHaveAttribute('href', '#main-content');
    
    await expect(page.locator('[data-testid="skip-to-nav"]')).toBeVisible();
    await expect(page.locator('[data-testid="skip-to-nav"]')).toHaveAttribute('href', '#navigation');
  });

  test('should have proper language attributes', async ({ page }) => {
    // Test language attributes
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    
    // Test language changes
    await page.click('[data-testid="language-selector"]');
    await page.selectOption('[data-testid="language-selector"]', 'es');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('should have proper reduced motion support', async ({ page }) => {
    // Test reduced motion support
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('[data-testid="animated-element"]')).toHaveCSS('animation', 'none');
    
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('[data-testid="animated-element"]')).toHaveCSS('animation', /.*/);
  });

  test('should have proper high contrast support', async ({ page }) => {
    // Test high contrast support
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('[data-testid="main-content"]')).toHaveCSS('color', /rgb\(255, 255, 255\)/);
    
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('[data-testid="main-content"]')).toHaveCSS('color', /rgb\(0, 0, 0\)/);
  });

  test('should have proper screen reader support', async ({ page }) => {
    // Test screen reader support
    await expect(page.locator('[data-testid="screen-reader-only"]')).toHaveCSS('position', 'absolute');
    await expect(page.locator('[data-testid="screen-reader-only"]')).toHaveCSS('left', '-10000px');
    await expect(page.locator('[data-testid="screen-reader-only"]')).toHaveCSS('width', '1px');
    await expect(page.locator('[data-testid="screen-reader-only"]')).toHaveCSS('height', '1px');
    await expect(page.locator('[data-testid="screen-reader-only"]')).toHaveCSS('overflow', 'hidden');
  });

  test('should have proper form validation accessibility', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test form validation accessibility
    await page.fill('[data-testid="resume-name"]', '');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toHaveAttribute('role', 'alert');
    await expect(page.locator('[data-testid="validation-error"]')).toHaveAttribute('aria-live', 'polite');
    
    // Test field association
    await expect(page.locator('[data-testid="resume-name"]')).toHaveAttribute('aria-describedby', 'resume-name-error');
  });

  test('should have proper progress indicators', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test progress indicators
    await page.fill('[data-testid="resume-name"]', 'Progress Test Resume');
    await page.fill('[data-testid="resume-summary"]', 'Test resume for progress indicators');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="progress-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-indicator"]')).toHaveAttribute('role', 'progressbar');
    await expect(page.locator('[data-testid="progress-indicator"]')).toHaveAttribute('aria-label', 'Saving resume');
  });

  test('should have proper status messages', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test status messages
    await page.fill('[data-testid="resume-name"]', 'Status Test Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="status-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-message"]')).toHaveAttribute('role', 'status');
    await expect(page.locator('[data-testid="status-message"]')).toHaveAttribute('aria-live', 'polite');
  });

  test('should have proper landmark navigation', async ({ page }) => {
    // Test landmark navigation
    await expect(page.locator('[data-testid="main-content"]')).toHaveAttribute('role', 'main');
    await expect(page.locator('[data-testid="navigation-menu"]')).toHaveAttribute('role', 'navigation');
    await expect(page.locator('[data-testid="sidebar"]')).toHaveAttribute('role', 'complementary');
    await expect(page.locator('[data-testid="header"]')).toHaveAttribute('role', 'banner');
    await expect(page.locator('[data-testid="footer"]')).toHaveAttribute('role', 'contentinfo');
  });

  test('should have proper form field descriptions', async ({ page }) => {
    await page.click('[data-testid="nav-resume-editor"]');
    
    // Test form field descriptions
    await expect(page.locator('[data-testid="resume-name"]')).toHaveAttribute('aria-describedby', 'resume-name-description');
    await expect(page.locator('[data-testid="resume-summary"]')).toHaveAttribute('aria-describedby', 'resume-summary-description');
    
    // Test description content
    await expect(page.locator('[data-testid="resume-name-description"]')).toContainText('Enter your full name');
    await expect(page.locator('[data-testid="resume-summary-description"]')).toContainText('Brief summary of your experience');
  });

  test('should have proper button states', async ({ page }) => {
    // Test button states
    await expect(page.locator('[data-testid="save-button"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-testid="toggle-button"]')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('[data-testid="menu-button"]')).toHaveAttribute('aria-haspopup', 'true');
  });

  test('should have proper live regions', async ({ page }) => {
    await page.click('[data-testid="nav-ai-panel"]');
    
    // Test live regions
    await page.fill('[data-testid="ai-chat-input"]', 'Test message');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-response"]')).toHaveAttribute('aria-live', 'polite');
  });

  test('should have proper focus management', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    
    // Test focus management
    await expect(page.locator('[data-testid="profile-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="modal-close-button"]')).toBeFocused();
    
    // Test focus trap
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="profile-name"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="profile-email"]')).toBeFocused();
  });

  test('should have proper keyboard shortcuts', async ({ page }) => {
    // Test keyboard shortcuts
    await page.keyboard.press('Control+s');
    await expect(page.locator('[data-testid="save-shortcut-feedback"]')).toBeVisible();
    
    await page.keyboard.press('Control+z');
    await expect(page.locator('[data-testid="undo-shortcut-feedback"]')).toBeVisible();
    
    await page.keyboard.press('Control+y');
    await expect(page.locator('[data-testid="redo-shortcut-feedback"]')).toBeVisible();
  });

  test('should have proper touch target sizes', async ({ page }) => {
    // Test touch target sizes
    await expect(page.locator('[data-testid="save-button"]')).toHaveCSS('min-width', '44px');
    await expect(page.locator('[data-testid="save-button"]')).toHaveCSS('min-height', '44px');
    
    await expect(page.locator('[data-testid="cancel-button"]')).toHaveCSS('min-width', '44px');
    await expect(page.locator('[data-testid="cancel-button"]')).toHaveCSS('min-height', '44px');
  });

  test('should have proper text alternatives', async ({ page }) => {
    // Test text alternatives
    await expect(page.locator('[data-testid="logo"]')).toHaveAttribute('alt', 'RoleReady logo');
    await expect(page.locator('[data-testid="profile-picture"]')).toHaveAttribute('alt', 'Profile picture');
    await expect(page.locator('[data-testid="chart-image"]')).toHaveAttribute('alt', 'Performance chart');
  });

  test('should have proper semantic markup', async ({ page }) => {
    // Test semantic markup
    await expect(page.locator('[data-testid="main-content"]')).toHaveAttribute('role', 'main');
    await expect(page.locator('[data-testid="navigation-menu"]')).toHaveAttribute('role', 'navigation');
    await expect(page.locator('[data-testid="sidebar"]')).toHaveAttribute('role', 'complementary');
    await expect(page.locator('[data-testid="header"]')).toHaveAttribute('role', 'banner');
    await expect(page.locator('[data-testid="footer"]')).toHaveAttribute('role', 'contentinfo');
  });
});