import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Resume Builder - Import Resume', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await page.click('text=Resume Builder');
  });

  test('should import PDF resume successfully', async ({ page }) => {
    // Click import button
    await page.click('button:has-text("Import")');

    // Upload PDF file
    const filePath = path.join(__dirname, '../../fixtures/sample-resume.pdf');
    await page.setInputFiles('input[type="file"]', filePath);

    // Wait for parsing
    await page.waitForSelector('text=Parsing resume...', { timeout: 5000 });
    await page.waitForSelector('text=Resume parsed successfully', { timeout: 30000 });

    // Review parsed data
    await expect(page.locator('[data-testid="parsed-preview"]')).toBeVisible();

    // Verify key fields were extracted
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Software Engineer')).toBeVisible();

    // Click "Apply" to create resume
    await page.click('button:has-text("Apply")');

    // Wait for resume to be created
    await page.waitForSelector('[data-testid="resume-editor"]', { timeout: 10000 });

    // Verify data is populated
    await expect(page.locator('[name="contact.name"]')).toHaveValue('John Doe');
    await expect(page.locator('[name="summary"]')).not.toBeEmpty();
  });

  test('should import DOCX resume successfully', async ({ page }) => {
    await page.click('button:has-text("Import")');

    const filePath = path.join(__dirname, '../../fixtures/sample-resume.docx');
    await page.setInputFiles('input[type="file"]', filePath);

    await page.waitForSelector('text=Resume parsed successfully', { timeout: 30000 });
    await page.click('button:has-text("Apply")');

    await page.waitForSelector('[data-testid="resume-editor"]');
    await expect(page.locator('[name="contact.name"]')).not.toBeEmpty();
  });

  test('should show error for invalid file type', async ({ page }) => {
    await page.click('button:has-text("Import")');

    // Try to upload an image file
    const filePath = path.join(__dirname, '../../fixtures/invalid-file.jpg');
    await page.setInputFiles('input[type="file"]', filePath);

    // Verify error message
    await expect(page.locator('text=Invalid file type')).toBeVisible();
    await expect(page.locator('text=Please upload a PDF, DOCX, or TXT file')).toBeVisible();
  });

  test('should show error for file too large', async ({ page }) => {
    await page.click('button:has-text("Import")');

    // Try to upload a large file (>10MB)
    const filePath = path.join(__dirname, '../../fixtures/large-file.pdf');
    await page.setInputFiles('input[type="file"]', filePath);

    // Verify error message
    await expect(page.locator('text=File too large')).toBeVisible();
    await expect(page.locator('text=Maximum file size is 10MB')).toBeVisible();
  });

  test('should show progress indicator during parsing', async ({ page }) => {
    await page.click('button:has-text("Import")');

    const filePath = path.join(__dirname, '../../fixtures/sample-resume.pdf');
    await page.setInputFiles('input[type="file"]', filePath);

    // Verify progress steps
    await expect(page.locator('text=Step 1: Upload')).toBeVisible();
    await expect(page.locator('text=Step 2: Review')).toBeVisible();
    await expect(page.locator('text=Step 3: Apply')).toBeVisible();

    // Verify current step is highlighted
    await expect(page.locator('[data-step="1"][data-active="true"]')).toBeVisible();

    // Wait for parsing
    await page.waitForSelector('text=Resume parsed successfully', { timeout: 30000 });

    // Verify step 2 is now active
    await expect(page.locator('[data-step="2"][data-active="true"]')).toBeVisible();
  });

  test('should allow editing parsed data before applying', async ({ page }) => {
    await page.click('button:has-text("Import")');

    const filePath = path.join(__dirname, '../../fixtures/sample-resume.pdf');
    await page.setInputFiles('input[type="file"]', filePath);

    await page.waitForSelector('text=Resume parsed successfully', { timeout: 30000 });

    // Edit parsed data
    await page.fill('[name="parsed.contact.name"]', 'Jane Doe');
    await page.fill('[name="parsed.contact.email"]', 'jane@example.com');

    // Apply changes
    await page.click('button:has-text("Apply")');

    await page.waitForSelector('[data-testid="resume-editor"]');

    // Verify edited data was applied
    await expect(page.locator('[name="contact.name"]')).toHaveValue('Jane Doe');
    await expect(page.locator('[name="contact.email"]')).toHaveValue('jane@example.com');
  });

  test('should show parsing confidence score', async ({ page }) => {
    await page.click('button:has-text("Import")');

    const filePath = path.join(__dirname, '../../fixtures/sample-resume.pdf');
    await page.setInputFiles('input[type="file"]', filePath);

    await page.waitForSelector('text=Resume parsed successfully', { timeout: 30000 });

    // Verify confidence score is displayed
    await expect(page.locator('[data-testid="parsing-confidence"]')).toBeVisible();
    await expect(page.locator('text=Confidence:')).toBeVisible();

    // Verify score is between 0-100
    const scoreText = await page.locator('[data-testid="confidence-score"]').textContent();
    const score = parseInt(scoreText || '0');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});


