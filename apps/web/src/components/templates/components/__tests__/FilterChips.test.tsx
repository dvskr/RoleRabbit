/**
 * Tests for FilterChips component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilterChips from '../FilterChips';
import { TemplateSortBy } from '../../types';

// Mock colors
const mockColors = {
  primaryText: '#000000',
  secondaryText: '#666666',
  border: '#e5e5e5',
  badgeInfoBg: '#dbeafe',
  badgeInfoText: '#1e40af',
  badgeInfoBorder: '#3b82f6',
  badgeErrorBg: '#fee2e2',
  errorRed: '#dc2626',
};

describe('FilterChips', () => {
  const defaultProps = {
    selectedCategory: 'all',
    selectedDifficulty: 'all',
    selectedLayout: 'all',
    selectedColorScheme: 'all',
    showFreeOnly: false,
    showPremiumOnly: false,
    sortBy: 'popular' as TemplateSortBy,
    setSelectedCategory: jest.fn(),
    setSelectedDifficulty: jest.fn(),
    setSelectedLayout: jest.fn(),
    setSelectedColorScheme: jest.fn(),
    setShowFreeOnly: jest.fn(),
    setShowPremiumOnly: jest.fn(),
    setSortBy: jest.fn(),
    clearAllFilters: jest.fn(),
    colors: mockColors,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when no filters are active', () => {
      const { container } = render(<FilterChips {...defaultProps} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render active filters region when filters are active', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
        />
      );

      expect(screen.getByRole('region', { name: /active filters/i })).toBeInTheDocument();
    });

    it('should render "Active Filters:" label when filters exist', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
        />
      );

      expect(screen.getByText(/active filters:/i)).toBeInTheDocument();
    });

    it('should render category filter chip', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
        />
      );

      expect(screen.getByText(/category: professional/i)).toBeInTheDocument();
    });

    it('should render difficulty filter chip', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedDifficulty="beginner"
        />
      );

      expect(screen.getByText(/difficulty: beginner/i)).toBeInTheDocument();
    });

    it('should render layout filter chip', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedLayout="single-column"
        />
      );

      expect(screen.getByText(/layout: single column/i)).toBeInTheDocument();
    });

    it('should render color scheme filter chip', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedColorScheme="modern"
        />
      );

      expect(screen.getByText(/color: modern/i)).toBeInTheDocument();
    });

    it('should render premium only filter chip', () => {
      render(
        <FilterChips
          {...defaultProps}
          showPremiumOnly={true}
        />
      );

      expect(screen.getByText(/premium only/i)).toBeInTheDocument();
    });

    it('should render free only filter chip', () => {
      render(
        <FilterChips
          {...defaultProps}
          showFreeOnly={true}
        />
      );

      expect(screen.getByText(/free only/i)).toBeInTheDocument();
    });

    it('should render sort filter chip when not default', () => {
      render(
        <FilterChips
          {...defaultProps}
          sortBy="newest"
        />
      );

      expect(screen.getByText(/sort: newest first/i)).toBeInTheDocument();
    });

    it('should not render sort chip when set to default "popular"', () => {
      render(
        <FilterChips
          {...defaultProps}
          sortBy="popular"
        />
      );

      // Should render nothing since popular is default
      const { container } = render(<FilterChips {...defaultProps} sortBy="popular" />);
      expect(container.firstChild).toBeNull();
    });

    it('should render multiple filter chips simultaneously', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
          selectedDifficulty="intermediate"
          showFreeOnly={true}
          sortBy="rating"
        />
      );

      expect(screen.getByText(/category: professional/i)).toBeInTheDocument();
      expect(screen.getByText(/difficulty: intermediate/i)).toBeInTheDocument();
      expect(screen.getByText(/free only/i)).toBeInTheDocument();
      expect(screen.getByText(/sort: highest rated/i)).toBeInTheDocument();
    });

    it('should render "Clear All" button when multiple filters are active', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
          selectedDifficulty="beginner"
        />
      );

      expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
    });

    it('should not render "Clear All" button when only one filter is active', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
        />
      );

      expect(screen.queryByRole('button', { name: /clear all filters/i })).not.toBeInTheDocument();
    });

    it('should render X icon for each filter chip', () => {
      const { container } = render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
          selectedDifficulty="beginner"
        />
      );

      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });
  });

  describe('User interactions', () => {
    it('should call setSelectedCategory when category chip is clicked', () => {
      const setSelectedCategory = jest.fn();
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
          setSelectedCategory={setSelectedCategory}
        />
      );

      const chip = screen.getByRole('button', { name: /remove filter: category/i });
      fireEvent.click(chip);

      expect(setSelectedCategory).toHaveBeenCalledWith('all');
    });

    it('should call setSelectedDifficulty when difficulty chip is clicked', () => {
      const setSelectedDifficulty = jest.fn();
      render(
        <FilterChips
          {...defaultProps}
          selectedDifficulty="beginner"
          setSelectedDifficulty={setSelectedDifficulty}
        />
      );

      const chip = screen.getByRole('button', { name: /remove filter: difficulty/i });
      fireEvent.click(chip);

      expect(setSelectedDifficulty).toHaveBeenCalledWith('all');
    });

    it('should call setSelectedLayout when layout chip is clicked', () => {
      const setSelectedLayout = jest.fn();
      render(
        <FilterChips
          {...defaultProps}
          selectedLayout="single-column"
          setSelectedLayout={setSelectedLayout}
        />
      );

      const chip = screen.getByRole('button', { name: /remove filter: layout/i });
      fireEvent.click(chip);

      expect(setSelectedLayout).toHaveBeenCalledWith('all');
    });

    it('should call setSelectedColorScheme when color chip is clicked', () => {
      const setSelectedColorScheme = jest.fn();
      render(
        <FilterChips
          {...defaultProps}
          selectedColorScheme="modern"
          setSelectedColorScheme={setSelectedColorScheme}
        />
      );

      const chip = screen.getByRole('button', { name: /remove filter: color/i });
      fireEvent.click(chip);

      expect(setSelectedColorScheme).toHaveBeenCalledWith('all');
    });

    it('should call setShowPremiumOnly when premium chip is clicked', () => {
      const setShowPremiumOnly = jest.fn();
      render(
        <FilterChips
          {...defaultProps}
          showPremiumOnly={true}
          setShowPremiumOnly={setShowPremiumOnly}
        />
      );

      const chip = screen.getByRole('button', { name: /remove filter: premium only/i });
      fireEvent.click(chip);

      expect(setShowPremiumOnly).toHaveBeenCalledWith(false);
    });

    it('should call setShowFreeOnly when free chip is clicked', () => {
      const setShowFreeOnly = jest.fn();
      render(
        <FilterChips
          {...defaultProps}
          showFreeOnly={true}
          setShowFreeOnly={setShowFreeOnly}
        />
      );

      const chip = screen.getByRole('button', { name: /remove filter: free only/i });
      fireEvent.click(chip);

      expect(setShowFreeOnly).toHaveBeenCalledWith(false);
    });

    it('should call setSortBy when sort chip is clicked', () => {
      const setSortBy = jest.fn();
      render(
        <FilterChips
          {...defaultProps}
          sortBy="newest"
          setSortBy={setSortBy}
        />
      );

      const chip = screen.getByRole('button', { name: /remove filter: sort/i });
      fireEvent.click(chip);

      expect(setSortBy).toHaveBeenCalledWith('popular');
    });

    it('should call clearAllFilters when "Clear All" button is clicked', () => {
      const clearAllFilters = jest.fn();
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
          selectedDifficulty="beginner"
          clearAllFilters={clearAllFilters}
        />
      );

      const clearAllButton = screen.getByRole('button', { name: /clear all filters/i });
      fireEvent.click(clearAllButton);

      expect(clearAllFilters).toHaveBeenCalledTimes(1);
    });

    it('should change opacity on hover', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
        />
      );

      const chip = screen.getByRole('button', { name: /remove filter: category/i });

      fireEvent.mouseEnter(chip);
      expect(chip.style.opacity).toBe('0.8');

      fireEvent.mouseLeave(chip);
      expect(chip.style.opacity).toBe('1');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role for region', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
        />
      );

      expect(screen.getByRole('region', { name: /active filters/i })).toBeInTheDocument();
    });

    it('should have aria-label for each filter chip', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
          selectedDifficulty="beginner"
        />
      );

      expect(screen.getByRole('button', { name: /remove filter: category/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /remove filter: difficulty/i })).toHaveAttribute('aria-label');
    });

    it('should have title attribute for tooltips', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
        />
      );

      const chip = screen.getByRole('button', { name: /remove filter: category/i });
      expect(chip).toHaveAttribute('title');
      expect(chip.getAttribute('title')).toContain('Click to remove');
    });

    it('should be keyboard accessible', () => {
      const setSelectedCategory = jest.fn();
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
          setSelectedCategory={setSelectedCategory}
        />
      );

      const chip = screen.getByRole('button', { name: /remove filter: category/i });
      chip.focus();

      expect(chip).toHaveFocus();

      fireEvent.keyDown(chip, { key: 'Enter' });
      expect(setSelectedCategory).toHaveBeenCalled();
    });

    it('should have accessible label for "Clear All" button', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
          selectedDifficulty="beginner"
        />
      );

      const clearAllButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearAllButton).toHaveAttribute('aria-label', 'Clear all filters');
    });
  });

  describe('Label formatting', () => {
    it('should capitalize category labels properly', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
        />
      );

      expect(screen.getByText(/category: Professional/i)).toBeInTheDocument();
    });

    it('should capitalize difficulty labels properly', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedDifficulty="intermediate"
        />
      );

      expect(screen.getByText(/difficulty: Intermediate/i)).toBeInTheDocument();
    });

    it('should format multi-word layout labels properly', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedLayout="two-column"
        />
      );

      expect(screen.getByText(/layout: Two Column/i)).toBeInTheDocument();
    });

    it('should display correct sort labels', () => {
      const { rerender } = render(
        <FilterChips
          {...defaultProps}
          sortBy="newest"
        />
      );

      expect(screen.getByText(/sort: newest first/i)).toBeInTheDocument();

      rerender(<FilterChips {...defaultProps} sortBy="rating" />);
      expect(screen.getByText(/sort: highest rated/i)).toBeInTheDocument();

      rerender(<FilterChips {...defaultProps} sortBy="name" />);
      expect(screen.getByText(/sort: alphabetical/i)).toBeInTheDocument();
    });
  });

  describe('Color theming', () => {
    it('should apply custom colors from props', () => {
      const { container } = render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
        />
      );

      const region = container.querySelector('[role="region"]');
      expect(region).toHaveStyle({ borderBottom: `1px solid ${mockColors.border}` });
    });

    it('should apply badge colors to filter chips', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
        />
      );

      const chip = screen.getByRole('button', { name: /remove filter: category/i });
      expect(chip).toHaveStyle({
        background: mockColors.badgeInfoBg,
        color: mockColors.badgeInfoText,
      });
    });

    it('should apply error colors to "Clear All" button', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
          selectedDifficulty="beginner"
        />
      );

      const clearAllButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearAllButton).toHaveStyle({
        background: mockColors.badgeErrorBg,
        color: mockColors.errorRed,
      });
    });

    it('should apply secondary text color to label', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
        />
      );

      const label = screen.getByText(/active filters:/i);
      expect(label).toHaveStyle({ color: mockColors.secondaryText });
    });
  });

  describe('Edge cases', () => {
    it('should handle all filters being active', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
          selectedDifficulty="intermediate"
          selectedLayout="single-column"
          selectedColorScheme="modern"
          showFreeOnly={true}
          sortBy="rating"
        />
      );

      // Should render all 6 filter chips
      const chips = screen.getAllByRole('button').filter(btn =>
        btn.getAttribute('aria-label')?.includes('Remove filter')
      );
      expect(chips.length).toBe(6);
    });

    it('should handle both free and premium filters being active (edge case)', () => {
      render(
        <FilterChips
          {...defaultProps}
          showFreeOnly={true}
          showPremiumOnly={true}
        />
      );

      expect(screen.getByText(/free only/i)).toBeInTheDocument();
      expect(screen.getByText(/premium only/i)).toBeInTheDocument();
    });

    it('should handle undefined colors gracefully', () => {
      expect(() => {
        render(
          <FilterChips
            {...defaultProps}
            selectedCategory="professional"
            colors={undefined}
          />
        );
      }).not.toThrow();
    });

    it('should handle very long filter values', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="a-very-long-category-name-that-might-cause-issues"
        />
      );

      expect(screen.getByText(/category:/i)).toBeInTheDocument();
    });

    it('should handle special characters in filter values', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional-&-technical"
        />
      );

      expect(screen.getByText(/category:/i)).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('should have flex-wrap for responsive layout', () => {
      const { container } = render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
        />
      );

      const region = container.querySelector('[role="region"]');
      expect(region).toHaveClass('flex-wrap');
    });

    it('should have proper gap spacing', () => {
      const { container } = render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
        />
      );

      const region = container.querySelector('[role="region"]');
      expect(region).toHaveClass('gap-2');
    });
  });

  describe('Animations', () => {
    it('should have transition classes on chips', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
        />
      );

      const chip = screen.getByRole('button', { name: /remove filter: category/i });
      expect(chip).toHaveClass('transition-all');
    });

    it('should have hover scale effect', () => {
      render(
        <FilterChips
          {...defaultProps}
          selectedCategory="professional"
        />
      );

      const chip = screen.getByRole('button', { name: /remove filter: category/i });
      expect(chip).toHaveClass('hover:scale-105');
    });
  });
});
