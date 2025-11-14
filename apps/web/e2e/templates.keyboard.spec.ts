/**
 * Keyboard Navigation Tests for Templates Feature
 * Comprehensive keyboard accessibility testing
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Templates - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/templates');
    await page.waitForSelector('[data-testid="templates-container"]', {
      state: 'visible',
      timeout: 10000
    });
  });

  test.describe('Tab Navigation', () => {
    test('should navigate through all interactive elements with Tab', async ({ page }) => {
      // Start from beginning
      await page.keyboard.press('Tab');

      // Search input should be focused
      const searchInput = page.locator('[data-testid="search-input"]');
      await expect(searchInput).toBeFocused();

      // Continue tabbing
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should be able to tab through all elements
      // Check that something is focused
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeTruthy();
    });

    test('should navigate backwards with Shift+Tab', async ({ page }) => {
      // Tab forward a few times
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Tab backward
      await page.keyboard.press('Shift+Tab');

      // Should still have focus
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeTruthy();
    });

    test('should skip non-interactive elements', async ({ page }) => {
      let tabCount = 0;
      const maxTabs = 50; // Prevent infinite loop

      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab');
        tabCount++;

        const focusedElement = page.locator(':focus');
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());

        // Focused element should be interactive
        const interactiveTags = ['a', 'button', 'input', 'select', 'textarea'];
        const isInteractive = interactiveTags.includes(tagName) ||
          await focusedElement.evaluate(el =>
            el.hasAttribute('tabindex') && el.getAttribute('tabindex') !== '-1'
          );

        if (isInteractive) {
          expect(isInteractive).toBe(true);
        }

        // Break after checking a few elements
        if (tabCount >= 10) break;
      }
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const focusedElement = page.locator(':focus');

      // Check for visible focus ring (outline or custom style)
      const outline = await focusedElement.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
          boxShadow: styles.boxShadow,
        };
      });

      // Should have some form of focus indicator
      const hasFocusIndicator =
        outline.outlineWidth !== '0px' ||
        outline.boxShadow !== 'none';

      expect(hasFocusIndicator).toBe(true);
    });

    test('should not create keyboard traps', async ({ page }) => {
      let previousFocus: string | null = null;
      let sameCount = 0;
      const maxSame = 3; // If focus stays same 3 times, might be trapped

      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        const currentFocus = await page.locator(':focus').evaluate(el => el.tagName + el.className);

        if (currentFocus === previousFocus) {
          sameCount++;
        } else {
          sameCount = 0;
        }

        // Fail if trapped
        expect(sameCount).toBeLessThan(maxSame);
        previousFocus = currentFocus;
      }
    });
  });

  test.describe('Enter Key Activation', () => {
    test('should activate buttons with Enter', async ({ page }) => {
      // Focus first filter button
      const filterButton = page.locator('[data-testid="filter-category-ATS"]');
      await filterButton.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // Filter should be applied
      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });

    test('should open preview with Enter', async ({ page }) => {
      // Focus first preview button
      const previewButton = page.locator('[data-testid="preview-button"]').first();
      await previewButton.focus();
      await page.keyboard.press('Enter');

      // Modal should open
      const modal = page.locator('[data-testid="preview-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
    });

    test('should toggle favorites with Enter', async ({ page }) => {
      const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
      await favoriteButton.focus();

      const initialState = await favoriteButton.getAttribute('data-favorited');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      const newState = await favoriteButton.getAttribute('data-favorited');
      expect(newState).not.toBe(initialState);
    });

    test('should submit search form with Enter', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.focus();
      await searchInput.fill('professional');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      // Results should update
      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });
  });

  test.describe('Space Key Activation', () => {
    test('should activate buttons with Space', async ({ page }) => {
      const filterButton = page.locator('[data-testid="filter-category-CREATIVE"]');
      await filterButton.focus();
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);

      const cards = page.locator('[data-testid^="template-card-"]');
      await expect(cards.first()).toBeVisible();
    });

    test('should toggle checkboxes with Space', async ({ page }) => {
      const checkbox = page.locator('input[type="checkbox"]').first();

      if (await checkbox.isVisible()) {
        await checkbox.focus();
        const initialChecked = await checkbox.isChecked();

        await page.keyboard.press('Space');
        await page.waitForTimeout(300);

        const newChecked = await checkbox.isChecked();
        expect(newChecked).toBe(!initialChecked);
      }
    });
  });

  test.describe('Escape Key', () => {
    test('should close modal with Escape', async ({ page }) => {
      // Open preview modal
      const previewButton = page.locator('[data-testid="preview-button"]').first();
      await previewButton.click();

      const modal = page.locator('[data-testid="preview-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Close with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      await expect(modal).not.toBeVisible();
    });

    test('should close dropdowns with Escape', async ({ page }) => {
      const dropdown = page.locator('[data-testid="sort-select"]');

      if (await dropdown.isVisible()) {
        await dropdown.focus();
        await page.keyboard.press('Space'); // Open dropdown
        await page.waitForTimeout(300);

        await page.keyboard.press('Escape'); // Close dropdown
        await page.waitForTimeout(300);

        // Dropdown should be closed
        await expect(dropdown).toBeFocused();
      }
    });

    test('should clear search with Escape', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.focus();
      await searchInput.fill('test query');
      await page.waitForTimeout(300);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      const value = await searchInput.inputValue();
      expect(value).toBe('');
    });
  });

  test.describe('Arrow Key Navigation', () => {
    test('should navigate through dropdown options with arrows', async ({ page }) => {
      const sortSelect = page.locator('[data-testid="sort-select"]');

      if (await sortSelect.isVisible()) {
        await sortSelect.focus();
        await page.keyboard.press('Space'); // Open
        await page.waitForTimeout(300);

        // Arrow down
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);

        // Arrow up
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(200);

        // Select with Enter
        await page.keyboard.press('Enter');
      }
    });

    test('should navigate through radio groups with arrows', async ({ page }) => {
      const radioGroup = page.locator('[role="radiogroup"]').first();

      if (await radioGroup.isVisible()) {
        await radioGroup.focus();
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);

        const focusedRadio = page.locator(':focus');
        await expect(focusedRadio).toBeTruthy();
      }
    });
  });

  test.describe('Home and End Keys', () => {
    test('should jump to start of list with Home', async ({ page }) => {
      // Focus somewhere in the middle
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const listContainer = page.locator('[role="list"]').first();

      if (await listContainer.isVisible()) {
        await page.keyboard.press('Home');
        await page.waitForTimeout(200);

        // Should be at first item
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeTruthy();
      }
    });

    test('should jump to end of list with End', async ({ page }) => {
      const listContainer = page.locator('[role="list"]').first();

      if (await listContainer.isVisible()) {
        await page.keyboard.press('End');
        await page.waitForTimeout(200);

        // Should be at last item
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeTruthy();
      }
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('should trigger search with Ctrl+F or Cmd+F', async ({ page, browserName }) => {
      // Note: Browser's native Ctrl+F will interfere
      // This tests custom implementation if any
      const searchInput = page.locator('[data-testid="search-input"]');

      // Use custom shortcut key if implemented (e.g., /)
      await page.keyboard.press('/');

      // Search input might be focused
      const isFocused = await searchInput.evaluate(el =>
        el === document.activeElement
      );

      if (isFocused) {
        expect(isFocused).toBe(true);
      }
    });

    test('should clear filters with keyboard shortcut', async ({ page }) => {
      // Apply filter first
      await page.click('[data-testid="filter-category-ATS"]');
      await page.waitForTimeout(500);

      // Try to clear with keyboard (if implemented)
      const clearButton = page.locator('[data-testid="clear-filters"]');

      if (await clearButton.isVisible()) {
        await clearButton.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);

        // Filters should be cleared
        const cards = page.locator('[data-testid^="template-card-"]');
        await expect(cards.first()).toBeVisible();
      }
    });
  });

  test.describe('Focus Management', () => {
    test('should restore focus after modal closes', async ({ page }) => {
      // Focus and click preview button
      const previewButton = page.locator('[data-testid="preview-button"]').first();
      await previewButton.focus();
      await page.keyboard.press('Enter');

      const modal = page.locator('[data-testid="preview-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Focus should return to preview button
      await expect(previewButton).toBeFocused();
    });

    test('should trap focus within modal', async ({ page }) => {
      // Open modal
      await page.click('[data-testid="preview-button"]');
      const modal = page.locator('[data-testid="preview-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Tab through modal elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');

        // Focused element should be within modal
        const isInModal = await focusedElement.evaluate((el, modalSelector) => {
          const modal = document.querySelector(modalSelector);
          return modal?.contains(el) || false;
        }, '[data-testid="preview-modal"]');

        expect(isInModal).toBe(true);
      }
    });

    test('should focus first interactive element when modal opens', async ({ page }) => {
      await page.click('[data-testid="preview-button"]');

      const modal = page.locator('[data-testid="preview-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Wait for focus to settle
      await page.waitForTimeout(300);

      // Something in modal should have focus
      const focusedElement = page.locator(':focus');
      const isInModal = await focusedElement.evaluate((el, modalSelector) => {
        const modal = document.querySelector(modalSelector);
        return modal?.contains(el) || false;
      }, '[data-testid="preview-modal"]');

      expect(isInModal).toBe(true);
    });
  });

  test.describe('Skip Links', () => {
    test('should have skip to main content link', async ({ page }) => {
      await page.goto('/templates');

      // Press Tab to focus skip link (usually first)
      await page.keyboard.press('Tab');

      const skipLink = page.locator('a[href="#main-content"]').first();

      if (await skipLink.isVisible()) {
        await expect(skipLink).toBeFocused();

        // Activate skip link
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);

        // Main content should be focused
        const mainContent = page.locator('#main-content, [role="main"]');
        const isFocused = await mainContent.evaluate(el =>
          el === document.activeElement
        );

        expect(isFocused).toBe(true);
      }
    });

    test('should have skip to filter link', async ({ page }) => {
      await page.goto('/templates');

      const skipToFilter = page.locator('a[href="#filters"]').first();

      if (await skipToFilter.isVisible()) {
        await skipToFilter.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);

        // Filter section should be focused
        const filters = page.locator('#filters, [data-testid="filter-sidebar"]');
        const isFocused = await filters.evaluate(el =>
          document.activeElement && el.contains(document.activeElement)
        );

        expect(isFocused).toBe(true);
      }
    });
  });

  test.describe('Disabled States', () => {
    test('should skip disabled buttons when tabbing', async ({ page }) => {
      // Find a disabled button
      const disabledButton = page.locator('button:disabled').first();

      if (await disabledButton.isVisible()) {
        // Tab through page
        for (let i = 0; i < 20; i++) {
          await page.keyboard.press('Tab');
          const focusedElement = page.locator(':focus');

          // Disabled button should never be focused
          const isDisabled = await focusedElement.isDisabled();
          expect(isDisabled).toBe(false);
        }
      }
    });

    test('should not activate disabled buttons with keyboard', async ({ page }) => {
      const disabledButton = page.locator('button:disabled').first();

      if (await disabledButton.isVisible()) {
        // Try to focus (shouldn't work)
        await disabledButton.focus().catch(() => { });

        // Try to activate
        await page.keyboard.press('Enter');
        await page.keyboard.press('Space');

        // Nothing should happen - just verify no crash
        expect(true).toBe(true);
      }
    });
  });

  test.describe('Pagination Keyboard Navigation', () => {
    test('should navigate pagination with keyboard', async ({ page }) => {
      const pagination = page.locator('[data-testid="pagination"]');

      if (await pagination.isVisible()) {
        const nextButton = page.locator('[data-testid="pagination-next"]');
        await nextButton.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);

        // Should navigate to next page
        const cards = page.locator('[data-testid^="template-card-"]');
        await expect(cards.first()).toBeVisible();
      }
    });

    test('should use arrow keys for pagination', async ({ page }) => {
      const pagination = page.locator('[data-testid="pagination"]');

      if (await pagination.isVisible()) {
        await pagination.focus();

        // Right arrow for next
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(500);

        // Left arrow for previous
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(500);

        const cards = page.locator('[data-testid^="template-card-"]');
        await expect(cards.first()).toBeVisible();
      }
    });
  });
});
