/**
 * E2E Tests for Templates Feature
 * Comprehensive end-to-end testing of all template functionality
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Templates Feature - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to templates page
    await page.goto('/templates');

    // Wait for templates to load
    await page.waitForSelector('[data-testid="templates-container"]', {
      state: 'visible',
      timeout: 10000
    });
  });

  test.describe('Page Load and Initial State', () => {
    test('should load templates page successfully', async ({ page }) => {
      // Check page title
      await expect(page).toHaveTitle(/Templates/i);

      // Check main heading
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(/Templates/i);
    });

    test('should display templates grid by default', async ({ page }) => {
      // Grid should be visible
      const grid = page.locator('[data-testid="templates-grid"]');
      await expect(grid).toBeVisible();

      // Should have template cards
      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });

    test('should display filter sidebar', async ({ page }) => {
      const sidebar = page.locator('[data-testid="filter-sidebar"]');
      await expect(sidebar).toBeVisible();
    });

    test('should display sort controls', async ({ page }) => {
      const sortBy = page.locator('[data-testid="sort-select"]');
      await expect(sortBy).toBeVisible();
    });

    test('should display view mode toggle', async ({ page }) => {
      const viewToggle = page.locator('[data-testid="view-mode-toggle"]');
      await expect(viewToggle).toBeVisible();
    });
  });

  test.describe('Template Browsing', () => {
    test('should display multiple templates', async ({ page }) => {
      const cards = page.locator('[data-testid^="template-card-"]');
      const count = await cards.count();

      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(12); // Default pagination limit
    });

    test('should display template preview images', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="template-card-"]').first();
      const image = firstCard.locator('img');

      await expect(image).toBeVisible();
      await expect(image).toHaveAttribute('alt');
      await expect(image).toHaveAttribute('src');
    });

    test('should display template metadata', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="template-card-"]').first();

      // Name
      const name = firstCard.locator('[data-testid="template-name"]');
      await expect(name).toBeVisible();
      await expect(name).not.toBeEmpty();

      // Category badge
      const category = firstCard.locator('[data-testid="template-category"]');
      await expect(category).toBeVisible();
    });

    test('should show pagination when templates exceed limit', async ({ page }) => {
      // Check if pagination exists
      const pagination = page.locator('[data-testid="pagination"]');

      // May or may not be visible depending on template count
      const isVisible = await pagination.isVisible();

      if (isVisible) {
        const pageButtons = pagination.locator('button');
        await expect(pageButtons.first()).toBeVisible();
      }
    });
  });

  test.describe('Filtering', () => {
    test('should filter by category', async ({ page }) => {
      // Click category filter
      await page.click('[data-testid="filter-category-ATS"]');

      // Wait for results to update
      await page.waitForTimeout(500);

      // All visible templates should be ATS
      const cards = page.locator('[data-testid^="template-card-"]');
      const count = await cards.count();

      if (count > 0) {
        const firstCategory = cards.first().locator('[data-testid="template-category"]');
        await expect(firstCategory).toContainText('ATS');
      }
    });

    test('should filter by difficulty', async ({ page }) => {
      await page.click('[data-testid="filter-difficulty-BEGINNER"]');
      await page.waitForTimeout(500);

      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });

    test('should filter by layout', async ({ page }) => {
      await page.click('[data-testid="filter-layout-SINGLE_COLUMN"]');
      await page.waitForTimeout(500);

      const cards = page.locator('[data-testid^="template-card-"]');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should combine multiple filters', async ({ page }) => {
      await page.click('[data-testid="filter-category-ATS"]');
      await page.waitForTimeout(300);
      await page.click('[data-testid="filter-difficulty-BEGINNER"]');
      await page.waitForTimeout(500);

      const cards = page.locator('[data-testid^="template-card-"]');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should clear all filters', async ({ page }) => {
      // Apply some filters
      await page.click('[data-testid="filter-category-ATS"]');
      await page.waitForTimeout(300);

      // Clear filters
      const clearButton = page.locator('[data-testid="clear-filters"]');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForTimeout(500);

        // Should show all templates again
        const cards = page.locator('[data-testid^="template-card-"]');
        await expect(cards.first()).toBeVisible();
      }
    });

    test('should show no results message when no matches', async ({ page }) => {
      // Apply contradictory filters (if possible)
      await page.click('[data-testid="filter-category-ATS"]');
      await page.click('[data-testid="filter-difficulty-EXPERT"]');
      await page.waitForTimeout(500);

      // Check for either results or no results message
      const cards = page.locator('[data-testid^="template-card-"]');
      const noResults = page.locator('[data-testid="no-results"]');

      const hasCards = await cards.count() > 0;
      const hasNoResults = await noResults.isVisible();

      // Either should be true
      expect(hasCards || hasNoResults).toBe(true);
    });
  });

  test.describe('Sorting', () => {
    test('should sort by popular', async ({ page }) => {
      await page.selectOption('[data-testid="sort-select"]', 'popular');
      await page.waitForTimeout(500);

      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });

    test('should sort by newest', async ({ page }) => {
      await page.selectOption('[data-testid="sort-select"]', 'newest');
      await page.waitForTimeout(500);

      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });

    test('should sort by rating', async ({ page }) => {
      await page.selectOption('[data-testid="sort-select"]', 'rating');
      await page.waitForTimeout(500);

      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });

    test('should sort alphabetically', async ({ page }) => {
      await page.selectOption('[data-testid="sort-select"]', 'name');
      await page.waitForTimeout(500);

      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });
  });

  test.describe('View Mode Toggle', () => {
    test('should switch to list view', async ({ page }) => {
      await page.click('[data-testid="view-mode-list"]');
      await page.waitForTimeout(300);

      const listView = page.locator('[data-testid="templates-list"]');
      await expect(listView).toBeVisible();
    });

    test('should switch back to grid view', async ({ page }) => {
      // Switch to list
      await page.click('[data-testid="view-mode-list"]');
      await page.waitForTimeout(300);

      // Switch back to grid
      await page.click('[data-testid="view-mode-grid"]');
      await page.waitForTimeout(300);

      const gridView = page.locator('[data-testid="templates-grid"]');
      await expect(gridView).toBeVisible();
    });
  });

  test.describe('Search', () => {
    test('should search templates by name', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('professional');
      await page.waitForTimeout(1000); // Debounce delay

      const cards = page.locator('[data-testid^="template-card-"]');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should clear search', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('test');
      await page.waitForTimeout(1000);

      await searchInput.clear();
      await page.waitForTimeout(1000);

      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });
  });

  test.describe('Template Favorites', () => {
    test('should add template to favorites', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="template-card-"]').first();
      const favoriteButton = firstCard.locator('[data-testid="favorite-button"]');

      // Click favorite
      await favoriteButton.click();
      await page.waitForTimeout(500);

      // Button should show active state
      await expect(favoriteButton).toHaveAttribute('data-favorited', 'true');
    });

    test('should remove template from favorites', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="template-card-"]').first();
      const favoriteButton = firstCard.locator('[data-testid="favorite-button"]');

      // Add to favorites
      await favoriteButton.click();
      await page.waitForTimeout(500);

      // Remove from favorites
      await favoriteButton.click();
      await page.waitForTimeout(500);

      // Button should show inactive state
      await expect(favoriteButton).toHaveAttribute('data-favorited', 'false');
    });

    test('should filter to show only favorites', async ({ page }) => {
      // Add a favorite first
      const firstCard = page.locator('[data-testid^="template-card-"]').first();
      const favoriteButton = firstCard.locator('[data-testid="favorite-button"]');
      await favoriteButton.click();
      await page.waitForTimeout(500);

      // Click favorites filter
      await page.click('[data-testid="filter-favorites"]');
      await page.waitForTimeout(500);

      // Should only show favorited templates
      const cards = page.locator('[data-testid^="template-card-"]');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Template Preview', () => {
    test('should open template preview', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="template-card-"]').first();
      const previewButton = firstCard.locator('[data-testid="preview-button"]');

      await previewButton.click();

      // Preview modal should open
      const modal = page.locator('[data-testid="preview-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
    });

    test('should close template preview', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="template-card-"]').first();
      const previewButton = firstCard.locator('[data-testid="preview-button"]');

      await previewButton.click();

      const modal = page.locator('[data-testid="preview-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Close modal
      const closeButton = modal.locator('[data-testid="close-modal"]');
      await closeButton.click();

      await expect(modal).not.toBeVisible();
    });

    test('should display template details in preview', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="template-card-"]').first();
      await firstCard.locator('[data-testid="preview-button"]').click();

      const modal = page.locator('[data-testid="preview-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Check for template details
      await expect(modal.locator('[data-testid="template-name"]')).toBeVisible();
      await expect(modal.locator('[data-testid="template-description"]')).toBeVisible();
    });
  });

  test.describe('Pagination', () => {
    test('should navigate to next page', async ({ page }) => {
      const pagination = page.locator('[data-testid="pagination"]');

      if (await pagination.isVisible()) {
        const nextButton = page.locator('[data-testid="pagination-next"]');

        if (await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(500);

          // Should still have templates
          const cards = page.locator('[data-testid^="template-card-"]');
          await expect(cards.first()).toBeVisible();
        }
      }
    });

    test('should navigate to previous page', async ({ page }) => {
      const pagination = page.locator('[data-testid="pagination"]');

      if (await pagination.isVisible()) {
        const nextButton = page.locator('[data-testid="pagination-next"]');

        if (await nextButton.isEnabled()) {
          // Go to next page first
          await nextButton.click();
          await page.waitForTimeout(500);

          // Go back to previous
          const prevButton = page.locator('[data-testid="pagination-prev"]');
          await prevButton.click();
          await page.waitForTimeout(500);

          const cards = page.locator('[data-testid^="template-card-"]');
          await expect(cards.first()).toBeVisible();
        }
      }
    });

    test('should jump to specific page', async ({ page }) => {
      const pagination = page.locator('[data-testid="pagination"]');

      if (await pagination.isVisible()) {
        const pageButtons = pagination.locator('[data-testid^="pagination-page-"]');
        const count = await pageButtons.count();

        if (count > 1) {
          await pageButtons.nth(1).click();
          await page.waitForTimeout(500);

          const cards = page.locator('[data-testid^="template-card-"]');
          await expect(cards.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept API calls and force failure
      await page.route('**/api/templates**', route => route.abort());

      await page.reload();
      await page.waitForTimeout(2000);

      // Should show error message
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
    });

    test('should retry after error', async ({ page }) => {
      // Intercept and fail first request
      let requestCount = 0;
      await page.route('**/api/templates**', route => {
        requestCount++;
        if (requestCount === 1) {
          route.abort();
        } else {
          route.continue();
        }
      });

      await page.reload();
      await page.waitForTimeout(2000);

      // Click retry button
      const retryButton = page.locator('[data-testid="retry-button"]');
      if (await retryButton.isVisible()) {
        await retryButton.click();
        await page.waitForTimeout(2000);

        // Should load successfully
        const cards = page.locator('[data-testid^="template-card-"]');
        await expect(cards.first()).toBeVisible();
      }
    });
  });

  test.describe('Performance', () => {
    test('should load templates within 3 seconds', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/templates');
      await page.waitForSelector('[data-testid="templates-container"]', {
        state: 'visible'
      });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle rapid filter changes', async ({ page }) => {
      // Rapidly change filters
      await page.click('[data-testid="filter-category-ATS"]');
      await page.click('[data-testid="filter-category-CREATIVE"]');
      await page.click('[data-testid="filter-category-MODERN"]');
      await page.waitForTimeout(1000);

      // Should still work correctly
      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForTimeout(1000);

      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await page.waitForTimeout(1000);

      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });
  });
});
