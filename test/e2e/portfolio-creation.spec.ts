/**
 * E2E Test: Full Portfolio Creation Flow (Section 5.4)
 *
 * Tests complete portfolio creation journey from start to publish
 */

import { test, expect } from '@playwright/test';

test.describe('Portfolio Creation Flow', () => {
  test('should create portfolio through complete flow', async ({ page }) => {
    // Navigate to Generate Portfolio
    await page.goto('/');
    await page.click('text=Generate Portfolio');

    // Wait for setup form
    await expect(page.locator('h1')).toContainText('Create Your Portfolio');

    // Fill setup form
    await page.fill('input[name="title"]', 'My Awesome Portfolio');
    await page.fill('input[name="subtitle"]', 'Full Stack Developer');
    await page.selectOption('select[name="templateId"]', { index: 1 });
    await page.click('button[type="submit"]');

    // Chat with AI
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();

    // Send message
    await page.fill('textarea[name="message"]', 'I am a software engineer with 5 years of experience');
    await page.click('button[type="submit"]');

    // Wait for AI response
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible({ timeout: 10000 });

    // Continue conversation
    await page.fill('textarea[name="message"]', 'I work with React, TypeScript, Node.js');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="ai-message"]').nth(1)).toBeVisible({ timeout: 10000 });

    // Preview portfolio
    await page.click('button:has-text("Preview Portfolio")');
    await expect(page.locator('[data-testid="portfolio-preview"]')).toBeVisible();

    // Verify content appears in preview
    await expect(page.locator('text=My Awesome Portfolio')).toBeVisible();
    await expect(page.locator('text=Full Stack Developer')).toBeVisible();

    // Publish portfolio
    await page.click('button:has-text("Publish")');

    // Wait for success message
    await expect(page.locator('text=Portfolio published successfully')).toBeVisible({ timeout: 15000 });

    // Verify portfolio is accessible
    const portfolioUrl = await page.locator('[data-testid="portfolio-url"]').textContent();
    expect(portfolioUrl).toBeTruthy();

    // Visit published portfolio
    await page.goto(portfolioUrl!);
    await expect(page.locator('h1')).toContainText('My Awesome Portfolio');
  });

  test('should validate required fields in setup form', async ({ page }) => {
    await page.goto('/generate');

    // Try to submit without filling form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=Title is required')).toBeVisible();
  });

  test('should save draft and resume later', async ({ page }) => {
    await page.goto('/generate');

    // Fill partial form
    await page.fill('input[name="title"]', 'Draft Portfolio');
    await page.selectOption('select[name="templateId"]', { index: 1 });
    await page.click('button[type="submit"]');

    // Start chat
    await page.fill('textarea[name="message"]', 'I am a developer');
    await page.click('button[type="submit"]');

    // Save as draft
    await page.click('button:has-text("Save Draft")');
    await expect(page.locator('text=Draft saved')).toBeVisible();

    // Navigate away
    await page.goto('/dashboard');

    // Resume draft
    await page.click('text=Draft Portfolio');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    await expect(page.locator('text=I am a developer')).toBeVisible();
  });
});
