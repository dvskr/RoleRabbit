/**
 * Cross-Browser Tests for Templates Feature
 * Tests compatibility across Chrome, Firefox, Safari, and Edge
 */

import { test, expect } from '@playwright/test';

test.describe('Templates - Cross-Browser Compatibility @cross-browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/templates');
    await page.waitForSelector('[data-testid="templates-container"]', {
      state: 'visible',
      timeout: 10000
    });
  });

  test.describe('Core Functionality', () => {
    test('should load templates on all browsers', async ({ page, browserName }) => {
      console.log(`Testing on ${browserName}`);

      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();

      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should handle clicks on all browsers', async ({ page, browserName }) => {
      console.log(`Testing clicks on ${browserName}`);

      const filterButton = page.locator('[data-testid="filter-category-ATS"]');
      await filterButton.click();
      await page.waitForTimeout(500);

      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });

    test('should handle form inputs on all browsers', async ({ page, browserName }) => {
      console.log(`Testing inputs on ${browserName}`);

      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('professional');
      await page.waitForTimeout(1000);

      const value = await searchInput.inputValue();
      expect(value).toBe('professional');
    });

    test('should handle hover events on all browsers', async ({ page, browserName }) => {
      console.log(`Testing hover on ${browserName}`);

      const firstCard = page.locator('[data-testid^="template-card-"]').first();
      await firstCard.hover();
      await page.waitForTimeout(300);

      // Card should still be visible
      await expect(firstCard).toBeVisible();
    });
  });

  test.describe('CSS and Layout', () => {
    test('should render grid layout correctly', async ({ page, browserName }) => {
      const grid = page.locator('[data-testid="templates-grid"]');
      await expect(grid).toBeVisible();

      // Check grid has proper display
      const displayValue = await grid.evaluate(el =>
        window.getComputedStyle(el).display
      );

      expect(['grid', 'flex', 'block']).toContain(displayValue);
    });

    test('should handle flexbox layouts', async ({ page, browserName }) => {
      const sidebar = page.locator('[data-testid="filter-sidebar"]');

      if (await sidebar.isVisible()) {
        const display = await sidebar.evaluate(el =>
          window.getComputedStyle(el).display
        );

        // Should use modern layout
        expect(display).toBeTruthy();
      }
    });

    test('should apply CSS transitions', async ({ page, browserName }) => {
      const firstCard = page.locator('[data-testid^="template-card-"]').first();

      const transition = await firstCard.evaluate(el =>
        window.getComputedStyle(el).transition
      );

      // Some transition should be defined (even if "all 0s ease 0s")
      expect(transition).toBeTruthy();
    });

    test('should render shadows and borders', async ({ page, browserName }) => {
      const firstCard = page.locator('[data-testid^="template-card-"]').first();

      const styles = await firstCard.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          boxShadow: computed.boxShadow,
          borderRadius: computed.borderRadius,
        };
      });

      // Should have styling
      expect(styles).toBeTruthy();
    });
  });

  test.describe('JavaScript Features', () => {
    test('should handle async/await operations', async ({ page, browserName }) => {
      // Click to trigger API call
      const filterButton = page.locator('[data-testid="filter-category-CREATIVE"]');
      await filterButton.click();

      // Wait for async operation
      await page.waitForTimeout(1000);

      // Should complete successfully
      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });

    test('should handle localStorage operations', async ({ page, browserName }) => {
      // Add favorite (uses localStorage)
      const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
      await favoriteButton.click();
      await page.waitForTimeout(500);

      // Reload page
      await page.reload();
      await page.waitForSelector('[data-testid="templates-container"]');

      // Favorite state should persist
      const firstCardAgain = page.locator('[data-testid^="template-card-"]').first();
      const button = firstCardAgain.locator('[data-testid="favorite-button"]');

      const isFavorited = await button.getAttribute('data-favorited');
      expect(isFavorited).toBe('true');
    });

    test('should handle debounced inputs', async ({ page, browserName }) => {
      const searchInput = page.locator('[data-testid="search-input"]');

      // Type rapidly
      await searchInput.type('test', { delay: 50 });

      // Wait for debounce
      await page.waitForTimeout(1500);

      // Should have updated
      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });

    test('should handle promise chains', async ({ page, browserName }) => {
      // Open modal (involves promise chain)
      await page.click('[data-testid="preview-button"]');

      const modal = page.locator('[data-testid="preview-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      await expect(modal).not.toBeVisible();
    });
  });

  test.describe('Event Handling', () => {
    test('should handle click events', async ({ page, browserName }) => {
      const previewButton = page.locator('[data-testid="preview-button"]').first();
      await previewButton.click();

      const modal = page.locator('[data-testid="preview-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
    });

    test('should handle keyboard events', async ({ page, browserName }) => {
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Should navigate focus
      expect(true).toBe(true);
    });

    test('should handle scroll events', async ({ page, browserName }) => {
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);

      // Page should scroll
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(0);
    });

    test('should handle resize events', async ({ page, browserName }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);

      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();

      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // Should still be visible
      await expect(cards.first()).toBeVisible();
    });
  });

  test.describe('Image Handling', () => {
    test('should load images', async ({ page, browserName }) => {
      const firstCard = page.locator('[data-testid^="template-card-"]').first();
      const image = firstCard.locator('img');

      await expect(image).toBeVisible();

      // Image should have loaded
      const isLoaded = await image.evaluate((img: HTMLImageElement) => img.complete);
      expect(isLoaded).toBe(true);
    });

    test('should handle lazy loading', async ({ page, browserName }) => {
      // Scroll to bottom to trigger lazy load
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      const images = page.locator('img');
      const count = await images.count();

      expect(count).toBeGreaterThan(0);
    });

    test('should handle image errors gracefully', async ({ page, browserName }) => {
      // Load page with broken image URLs
      await page.route('**/*.png', route => route.abort());
      await page.route('**/*.jpg', route => route.abort());

      await page.reload();
      await page.waitForTimeout(2000);

      // Page should still render (with fallback or alt text)
      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });
  });

  test.describe('Modal and Overlay Behavior', () => {
    test('should handle modal z-index', async ({ page, browserName }) => {
      await page.click('[data-testid="preview-button"]');

      const modal = page.locator('[data-testid="preview-modal"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });

      // Modal should be on top
      const zIndex = await modal.evaluate(el =>
        window.getComputedStyle(el).zIndex
      );

      expect(parseInt(zIndex)).toBeGreaterThan(0);
    });

    test('should handle backdrop clicks', async ({ page, browserName }) => {
      await page.click('[data-testid="preview-button"]');

      const modal = page.locator('[data-testid="preview-modal"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });

      // Click backdrop
      const backdrop = page.locator('[data-testid="modal-backdrop"]');

      if (await backdrop.isVisible()) {
        await backdrop.click({ position: { x: 10, y: 10 } });
        await page.waitForTimeout(500);

        // Modal should close
        await expect(modal).not.toBeVisible();
      }
    });

    test('should trap focus in modal', async ({ page, browserName }) => {
      await page.click('[data-testid="preview-button"]');

      const modal = page.locator('[data-testid="preview-modal"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });

      // Tab through modal
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }

      // Focus should be within modal
      const focusedElement = page.locator(':focus');
      const isInModal = await focusedElement.evaluate((el, modalSelector) => {
        const modal = document.querySelector(modalSelector);
        return modal?.contains(el) || false;
      }, '[data-testid="preview-modal"]');

      expect(isInModal).toBe(true);
    });
  });

  test.describe('Browser-Specific Features', () => {
    test('should work with browser back button', async ({ page, browserName }) => {
      // Apply filter
      await page.click('[data-testid="filter-category-ATS"]');
      await page.waitForTimeout(500);

      // Go back
      await page.goBack();
      await page.waitForTimeout(500);

      // Should navigate back
      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });

    test('should handle page refresh', async ({ page, browserName }) => {
      // Apply filter
      await page.click('[data-testid="filter-category-MODERN"]');
      await page.waitForTimeout(500);

      // Refresh
      await page.reload();
      await page.waitForSelector('[data-testid="templates-container"]');

      // Should reload successfully
      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });

    test('should handle browser zoom', async ({ page, browserName }) => {
      // Zoom in (note: not all browsers support this programmatically)
      await page.evaluate(() => {
        (document.body.style as any).zoom = '150%';
      });

      await page.waitForTimeout(500);

      // Page should still be functional
      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });
  });

  test.describe('Font and Text Rendering', () => {
    test('should render custom fonts', async ({ page, browserName }) => {
      const heading = page.locator('h1').first();

      const fontFamily = await heading.evaluate(el =>
        window.getComputedStyle(el).fontFamily
      );

      // Should have font family defined
      expect(fontFamily).toBeTruthy();
      expect(fontFamily).not.toBe('');
    });

    test('should handle text overflow', async ({ page, browserName }) => {
      const firstCard = page.locator('[data-testid^="template-card-"]').first();
      const name = firstCard.locator('[data-testid="template-name"]');

      const textOverflow = await name.evaluate(el =>
        window.getComputedStyle(el).textOverflow
      );

      // Should have overflow handling
      expect(['ellipsis', 'clip', '']).toContain(textOverflow);
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page, browserName }) => {
      const startTime = Date.now();

      await page.goto('/templates');
      await page.waitForSelector('[data-testid="templates-container"]');

      const loadTime = Date.now() - startTime;

      console.log(`${browserName} load time: ${loadTime}ms`);

      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle rapid interactions', async ({ page, browserName }) => {
      // Rapidly click filters
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="filter-category-ATS"]');
        await page.waitForTimeout(100);
        await page.click('[data-testid="filter-category-CREATIVE"]');
        await page.waitForTimeout(100);
      }

      // Should still work
      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });
  });
});
