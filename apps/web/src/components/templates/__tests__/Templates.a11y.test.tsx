/**
 * Accessibility Tests for Templates Component
 * Tests WCAG 2.1 compliance using jest-axe
 */

import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import Templates from '../Templates';

// Mock hooks
jest.mock('../../../hooks/useTemplates', () => ({
  useTemplates: jest.fn(() => ({
    templates: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    filters: {},
    sortBy: 'popular',
    viewMode: 'grid',
    updateFilters: jest.fn(),
    updateSortBy: jest.fn(),
    setViewMode: jest.fn(),
    goToPage: jest.fn(),
    fetchTemplates: jest.fn(),
  })),
}));

jest.mock('../../../hooks/useTemplateFavorites', () => ({
  useTemplateFavorites: jest.fn(() => ({
    favoriteIds: new Set(),
    toggleFavorite: jest.fn(),
    isFavorite: jest.fn(() => false),
    loading: false,
  })),
}));

jest.mock('../../../hooks/useTemplatePreferences', () => ({
  useTemplatePreferences: jest.fn(() => ({
    preferences: null,
    savePreferences: jest.fn(),
    loading: false,
  })),
}));

describe('Templates Component - Accessibility', () => {
  it('should have no accessibility violations in empty state', async () => {
    const { container } = render(<Templates />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with templates loaded', async () => {
    const mockTemplates = [
      {
        id: 'tpl_1',
        name: 'Professional Resume',
        category: 'ATS' as const,
        description: 'A professional ATS-friendly resume',
        preview: '/templates/preview-1.png',
        features: ['ATS-friendly', 'Clean design'],
        difficulty: 'BEGINNER' as const,
        industry: ['Technology', 'Finance'],
        layout: 'SINGLE_COLUMN' as const,
        colorScheme: 'BLUE' as const,
        isPremium: false,
        rating: 4.5,
        downloads: 1200,
        author: 'RoleRabbit',
        tags: ['professional', 'clean'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const useTemplates = require('../../../hooks/useTemplates').useTemplates;
    useTemplates.mockReturnValue({
      templates: mockTemplates,
      loading: false,
      error: null,
      pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
      filters: {},
      sortBy: 'popular',
      viewMode: 'grid',
      updateFilters: jest.fn(),
      updateSortBy: jest.fn(),
      setViewMode: jest.fn(),
      goToPage: jest.fn(),
      fetchTemplates: jest.fn(),
    });

    const { container } = render(<Templates />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in loading state', async () => {
    const useTemplates = require('../../../hooks/useTemplates').useTemplates;
    useTemplates.mockReturnValue({
      templates: [],
      loading: true,
      error: null,
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
      filters: {},
      sortBy: 'popular',
      viewMode: 'grid',
      updateFilters: jest.fn(),
      updateSortBy: jest.fn(),
      setViewMode: jest.fn(),
      goToPage: jest.fn(),
      fetchTemplates: jest.fn(),
    });

    const { container } = render(<Templates />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in error state', async () => {
    const useTemplates = require('../../../hooks/useTemplates').useTemplates;
    useTemplates.mockReturnValue({
      templates: [],
      loading: false,
      error: { message: 'Failed to load templates' },
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
      filters: {},
      sortBy: 'popular',
      viewMode: 'grid',
      updateFilters: jest.fn(),
      updateSortBy: jest.fn(),
      setViewMode: jest.fn(),
      goToPage: jest.fn(),
      fetchTemplates: jest.fn(),
    });

    const { container } = render(<Templates />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading hierarchy', async () => {
    const { container } = render(<Templates />);

    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map((h) => parseInt(h.tagName[1]));

    // Check that heading levels don't skip (e.g., h1 -> h3)
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });

  it('should have accessible buttons with labels', () => {
    const { container } = render(<Templates />);

    const buttons = container.querySelectorAll('button');
    buttons.forEach((button) => {
      // Button should have text content or aria-label
      const hasText = button.textContent && button.textContent.trim().length > 0;
      const hasAriaLabel = button.getAttribute('aria-label');
      const hasAriaLabelledBy = button.getAttribute('aria-labelledby');

      expect(hasText || hasAriaLabel || hasAriaLabelledBy).toBe(true);
    });
  });

  it('should have accessible images with alt text', () => {
    const mockTemplates = [
      {
        id: 'tpl_1',
        name: 'Professional Resume',
        category: 'ATS' as const,
        description: 'A professional resume',
        preview: '/templates/preview-1.png',
        features: [],
        difficulty: 'BEGINNER' as const,
        industry: [],
        layout: 'SINGLE_COLUMN' as const,
        colorScheme: 'BLUE' as const,
        isPremium: false,
        rating: 4.5,
        downloads: 1200,
        author: 'RoleRabbit',
        tags: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const useTemplates = require('../../../hooks/useTemplates').useTemplates;
    useTemplates.mockReturnValue({
      templates: mockTemplates,
      loading: false,
      error: null,
      pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
      filters: {},
      sortBy: 'popular',
      viewMode: 'grid',
      updateFilters: jest.fn(),
      updateSortBy: jest.fn(),
      setViewMode: jest.fn(),
      goToPage: jest.fn(),
      fetchTemplates: jest.fn(),
    });

    const { container } = render(<Templates />);

    const images = container.querySelectorAll('img');
    images.forEach((img) => {
      // Image should have alt attribute (can be empty for decorative images)
      expect(img.hasAttribute('alt')).toBe(true);
    });
  });

  it('should have accessible form inputs with labels', () => {
    const { container } = render(<Templates />);

    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      const hasLabel = id && container.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
      const hasPlaceholder = input.getAttribute('placeholder');

      // Input should have label, aria-label, aria-labelledby, or placeholder
      expect(hasLabel || hasAriaLabel || hasAriaLabelledBy || hasPlaceholder).toBeTruthy();
    });
  });

  it('should have proper ARIA roles for interactive elements', () => {
    const { container } = render(<Templates />);

    // Check for custom interactive elements that might need roles
    const clickableElements = container.querySelectorAll('[onclick], [data-testid*="clickable"]');

    clickableElements.forEach((element) => {
      if (element.tagName !== 'BUTTON' && element.tagName !== 'A') {
        // Custom clickable elements should have appropriate role
        const role = element.getAttribute('role');
        expect(role).toBeTruthy();
        expect(['button', 'link', 'menuitem', 'tab']).toContain(role);
      }
    });
  });
});
