import { test, expect } from '@playwright/test';

test.describe('Resume Builder - Create Resume', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create a blank resume successfully', async ({ page }) => {
    // Navigate to Resume Builder
    await page.click('text=Resume Builder');
    await page.waitForURL('/dashboard?tab=resumes');

    // Click "New Resume" button
    await page.click('button:has-text("New Resume")');

    // Fill in resume name
    await page.fill('[placeholder="e.g., Software Engineer Resume"]', 'My First Resume');
    await page.click('button:has-text("Create")');

    // Wait for resume to be created and editor to load
    await page.waitForSelector('[data-testid="resume-editor"]', { timeout: 10000 });

    // Fill in contact information
    await page.fill('[name="contact.name"]', 'John Doe');
    await page.fill('[name="contact.email"]', 'john.doe@example.com');
    await page.fill('[name="contact.phone"]', '555-123-4567');
    await page.fill('[name="contact.location"]', 'San Francisco, CA');

    // Add LinkedIn profile
    await page.click('button:has-text("Add Link")');
    await page.selectOption('[name="linkType"]', 'linkedin');
    await page.fill('[name="linkUrl"]', 'https://linkedin.com/in/johndoe');
    await page.click('button:has-text("Add")');

    // Fill in professional summary
    await page.fill('[name="summary"]', 'Experienced software engineer with 5+ years of expertise in full-stack development.');

    // Add work experience
    await page.click('button:has-text("Add Experience")');
    await page.fill('[name="experience[0].company"]', 'Tech Corp');
    await page.fill('[name="experience[0].role"]', 'Senior Software Engineer');
    await page.fill('[name="experience[0].location"]', 'San Francisco, CA');
    await page.fill('[name="experience[0].startDate"]', '2020-01');
    await page.fill('[name="experience[0].endDate"]', '2023-12');

    // Add bullet points
    await page.click('button:has-text("Add Bullet")');
    await page.fill('[name="experience[0].bullets[0]"]', 'Led development of microservices architecture serving 1M+ users');
    await page.click('button:has-text("Add Bullet")');
    await page.fill('[name="experience[0].bullets[1]"]', 'Improved application performance by 40% through optimization');

    // Add education
    await page.click('button:has-text("Add Education")');
    await page.fill('[name="education[0].institution"]', 'University of California');
    await page.fill('[name="education[0].degree"]', 'Bachelor of Science');
    await page.fill('[name="education[0].field"]', 'Computer Science');
    await page.fill('[name="education[0].endDate"]', '2018-05');

    // Add skills
    await page.click('[data-testid="skills-section"]');
    await page.fill('[placeholder="Add a skill..."]', 'JavaScript');
    await page.press('[placeholder="Add a skill..."]', 'Enter');
    await page.fill('[placeholder="Add a skill..."]', 'React');
    await page.press('[placeholder="Add a skill..."]', 'Enter');
    await page.fill('[placeholder="Add a skill..."]', 'Node.js');
    await page.press('[placeholder="Add a skill..."]', 'Enter');

    // Wait for auto-save
    await page.waitForSelector('text=All changes saved', { timeout: 10000 });

    // Verify resume appears in list
    await page.click('text=My Resumes');
    await expect(page.locator('text=My First Resume')).toBeVisible();

    // Verify resume preview is visible
    await expect(page.locator('[data-testid="resume-preview"]')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Tech Corp')).toBeVisible();
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.click('text=Resume Builder');
    await page.click('button:has-text("New Resume")');
    await page.fill('[placeholder="e.g., Software Engineer Resume"]', 'Test Resume');
    await page.click('button:has-text("Create")');

    await page.waitForSelector('[data-testid="resume-editor"]');

    // Try to save without required fields
    await page.click('button:has-text("Save")');

    // Verify validation errors appear
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should support undo/redo operations', async ({ page }) => {
    await page.click('text=Resume Builder');
    await page.click('button:has-text("New Resume")');
    await page.fill('[placeholder="e.g., Software Engineer Resume"]', 'Undo Test Resume');
    await page.click('button:has-text("Create")');

    await page.waitForSelector('[data-testid="resume-editor"]');

    // Make a change
    await page.fill('[name="contact.name"]', 'Original Name');
    await page.waitForTimeout(500);

    // Change it again
    await page.fill('[name="contact.name"]', 'Modified Name');
    await page.waitForTimeout(500);

    // Verify undo button is enabled
    const undoButton = page.locator('button[title="Undo (Ctrl+Z)"]');
    await expect(undoButton).toBeEnabled();

    // Click undo
    await undoButton.click();

    // Verify name reverted
    await expect(page.locator('[name="contact.name"]')).toHaveValue('Original Name');

    // Verify redo button is enabled
    const redoButton = page.locator('button[title="Redo (Ctrl+Y)"]');
    await expect(redoButton).toBeEnabled();

    // Click redo
    await redoButton.click();

    // Verify name is back to modified
    await expect(page.locator('[name="contact.name"]')).toHaveValue('Modified Name');
  });

  test('should show character counter for long text fields', async ({ page }) => {
    await page.click('text=Resume Builder');
    await page.click('button:has-text("New Resume")');
    await page.fill('[placeholder="e.g., Software Engineer Resume"]', 'Counter Test');
    await page.click('button:has-text("Create")');

    await page.waitForSelector('[data-testid="resume-editor"]');

    // Fill in summary
    const longSummary = 'A'.repeat(500);
    await page.fill('[name="summary"]', longSummary);

    // Verify character counter appears
    await expect(page.locator('text=500 / 1000')).toBeVisible();

    // Fill beyond limit
    const tooLongSummary = 'A'.repeat(1100);
    await page.fill('[name="summary"]', tooLongSummary);

    // Verify warning appears
    await expect(page.locator('text=100 over limit')).toBeVisible();
  });

  test('should handle unsaved changes warning', async ({ page }) => {
    await page.click('text=Resume Builder');
    await page.click('button:has-text("New Resume")');
    await page.fill('[placeholder="e.g., Software Engineer Resume"]', 'Unsaved Test');
    await page.click('button:has-text("Create")');

    await page.waitForSelector('[data-testid="resume-editor"]');

    // Make a change
    await page.fill('[name="contact.name"]', 'John Doe');

    // Set up dialog handler
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('unsaved changes');
      await dialog.dismiss();
    });

    // Try to close tab (will trigger beforeunload)
    await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });
  });
});


