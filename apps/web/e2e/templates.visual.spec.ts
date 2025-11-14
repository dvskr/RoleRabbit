/**
 * Visual Regression Tests for Templates Feature
 * Tests visual consistency across changes using screenshot comparison
 */

import { test, expect } from '@playwright/test';

test.describe('Templates - Visual Regression @visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/templates');
    await page.waitForSelector('[data-testid="templates-container"]', {
      state: 'visible',
      timeout: 10000
    });

    // Wait for images to load
    await page.waitForTimeout(2000);
  });

  test.describe('Desktop Views', () => {
    test('should match templates page snapshot - grid view', async ({ page }) => {
      // Set consistent viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);

      // Take screenshot
      await expect(page).toHaveScreenshot('templates-grid-view.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match templates page snapshot - list view', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Switch to list view
      await page.click('[data-testid="view-mode-list"]');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('templates-list-view.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match filter sidebar snapshot', async ({ page }) => {
      const sidebar = page.locator('[data-testid="filter-sidebar"]');

      await expect(sidebar).toHaveScreenshot('filter-sidebar.png', {
        animations: 'disabled',
      });
    });

    test('should match template card snapshot', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="template-card-"]').first();

      await expect(firstCard).toHaveScreenshot('template-card.png', {
        animations: 'disabled',
      });
    });

    test('should match template preview modal', async ({ page }) => {
      await page.click('[data-testid="preview-button"]');

      const modal = page.locator('[data-testid="preview-modal"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(1000);

      await expect(modal).toHaveScreenshot('preview-modal.png', {
        animations: 'disabled',
      });
    });

    test('should match pagination component', async ({ page }) => {
      const pagination = page.locator('[data-testid="pagination"]');

      if (await pagination.isVisible()) {
        await expect(pagination).toHaveScreenshot('pagination.png', {
          animations: 'disabled',
        });
      }
    });

    test('should match search input', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');

      await expect(searchInput).toHaveScreenshot('search-input.png', {
        animations: 'disabled',
      });
    });

    test('should match sort dropdown', async ({ page }) => {
      const sortSelect = page.locator('[data-testid="sort-select"]');

      await expect(sortSelect).toHaveScreenshot('sort-dropdown.png', {
        animations: 'disabled',
      });
    });
  });

  test.describe('Mobile Views', () => {
    test('should match mobile templates page - iPhone 12', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('templates-mobile-iphone12.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match mobile templates page - Pixel 5', async ({ page }) => {
      await page.setViewportSize({ width: 393, height: 851 });
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('templates-mobile-pixel5.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match tablet templates page - iPad', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('templates-tablet-ipad.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Component States', () => {
    test('should match template card - hover state', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="template-card-"]').first();

      await firstCard.hover();
      await page.waitForTimeout(300);

      await expect(firstCard).toHaveScreenshot('template-card-hover.png', {
        animations: 'disabled',
      });
    });

    test('should match template card - favorited state', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="template-card-"]').first();
      const favoriteButton = firstCard.locator('[data-testid="favorite-button"]');

      await favoriteButton.click();
      await page.waitForTimeout(500);

      await expect(firstCard).toHaveScreenshot('template-card-favorited.png', {
        animations: 'disabled',
      });
    });

    test('should match filter - selected state', async ({ page }) => {
      const filterButton = page.locator('[data-testid="filter-category-ATS"]');

      await filterButton.click();
      await page.waitForTimeout(500);

      await expect(filterButton).toHaveScreenshot('filter-selected.png', {
        animations: 'disabled',
      });
    });

    test('should match button - focus state', async ({ page }) => {
      const previewButton = page.locator('[data-testid="preview-button"]').first();

      await previewButton.focus();
      await page.waitForTimeout(300);

      await expect(previewButton).toHaveScreenshot('button-focus.png', {
        animations: 'disabled',
      });
    });

    test('should match loading state', async ({ page }) => {
      // Intercept API to delay response
      await page.route('**/api/templates**', async route => {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await route.continue();
      });

      await page.goto('/templates');
      await page.waitForTimeout(500);

      const loadingIndicator = page.locator('[data-testid="loading-indicator"]');

      if (await loadingIndicator.isVisible()) {
        await expect(page).toHaveScreenshot('templates-loading.png', {
          animations: 'disabled',
        });
      }
    });

    test('should match error state', async ({ page }) => {
      // Force API error
      await page.route('**/api/templates**', route => route.abort());

      await page.goto('/templates');
      await page.waitForTimeout(2000);

      const errorMessage = page.locator('[data-testid="error-message"]');

      if (await errorMessage.isVisible()) {
        await expect(page).toHaveScreenshot('templates-error.png', {
          animations: 'disabled',
        });
      }
    });

    test('should match empty state', async ({ page }) => {
      // Mock empty response
      await page.route('**/api/templates**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [],
            pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
          })
        });
      });

      await page.goto('/templates');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('templates-empty.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match no results state', async ({ page }) => {
      // Apply filter that yields no results
      await page.click('[data-testid="filter-category-ATS"]');
      await page.locator('[data-testid="search-input"]').fill('zzzznonexistent');
      await page.waitForTimeout(1500);

      const noResults = page.locator('[data-testid="no-results"]');

      if (await noResults.isVisible()) {
        await expect(page).toHaveScreenshot('templates-no-results.png', {
          fullPage: true,
          animations: 'disabled',
        });
      }
    });
  });

  test.describe('Responsive Breakpoints', () => {
    const breakpoints = [
      { name: 'mobile-sm', width: 320, height: 568 },
      { name: 'mobile', width: 375, height: 667 },
      { name: 'mobile-lg', width: 414, height: 896 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'laptop', width: 1024, height: 768 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'desktop-lg', width: 1920, height: 1080 },
    ];

    for (const breakpoint of breakpoints) {
      test(`should match ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`, async ({ page }) => {
        await page.setViewportSize({
          width: breakpoint.width,
          height: breakpoint.height
        });
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`templates-${breakpoint.name}.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });

  test.describe('Dark Mode', () => {
    test('should match dark mode templates page', async ({ page }) => {
      // Enable dark mode (adjust selector based on implementation)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });

      await page.reload();
      await page.waitForSelector('[data-testid="templates-container"]');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('templates-dark-mode.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match dark mode template card', async ({ page }) => {
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });

      await page.reload();
      await page.waitForSelector('[data-testid="templates-container"]');

      const firstCard = page.locator('[data-testid^="template-card-"]').first();

      await expect(firstCard).toHaveScreenshot('template-card-dark.png', {
        animations: 'disabled',
      });
    });

    test('should match dark mode modal', async ({ page }) => {
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });

      await page.reload();
      await page.waitForSelector('[data-testid="templates-container"]');

      await page.click('[data-testid="preview-button"]');
      const modal = page.locator('[data-testid="preview-modal"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(1000);

      await expect(modal).toHaveScreenshot('preview-modal-dark.png', {
        animations: 'disabled',
      });
    });
  });

  test.describe('Filter Combinations', () => {
    test('should match filtered view - ATS category', async ({ page }) => {
      await page.click('[data-testid="filter-category-ATS"]');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('templates-filtered-ats.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match filtered view - Multiple filters', async ({ page }) => {
      await page.click('[data-testid="filter-category-MODERN"]');
      await page.click('[data-testid="filter-difficulty-BEGINNER"]');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('templates-multiple-filters.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match favorites only view', async ({ page }) => {
      // Add a favorite first
      const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
      await favoriteButton.click();
      await page.waitForTimeout(500);

      // Filter to favorites
      await page.click('[data-testid="filter-favorites"]');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('templates-favorites-only.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Scroll States', () => {
    test('should match page after scrolling', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 1000));
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('templates-scrolled.png', {
        animations: 'disabled',
      });
    });

    test('should match sticky header while scrolling', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(500);

      const header = page.locator('header, [data-testid="templates-header"]').first();

      if (await header.isVisible()) {
        await expect(header).toHaveScreenshot('header-sticky.png', {
          animations: 'disabled',
        });
      }
    });
  });

  test.describe('Animation States', () => {
    test('should match card transition animation', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="template-card-"]').first();

      // Capture initial state
      await expect(firstCard).toHaveScreenshot('card-before-hover.png', {
        animations: 'disabled',
      });

      // Hover (animations disabled in config, but captures hover state)
      await firstCard.hover();
      await page.waitForTimeout(300);

      await expect(firstCard).toHaveScreenshot('card-after-hover.png', {
        animations: 'disabled',
      });
    });

    test('should match modal entrance', async ({ page }) => {
      await page.click('[data-testid="preview-button"]');

      const modal = page.locator('[data-testid="preview-modal"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });

      // Wait for entrance animation to complete
      await page.waitForTimeout(500);

      await expect(modal).toHaveScreenshot('modal-opened.png', {
        animations: 'disabled',
      });
    });
  });

  test.describe('Accessibility Overlays', () => {
    test('should match high contrast mode', async ({ page }) => {
      // Enable high contrast (if supported)
      await page.emulateMedia({ forcedColors: 'active' });
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('templates-high-contrast.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match reduced motion mode', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('templates-reduced-motion.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });
});
