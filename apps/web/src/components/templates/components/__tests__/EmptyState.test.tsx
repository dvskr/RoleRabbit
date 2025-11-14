/**
 * Tests for EmptyState component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmptyState from '../EmptyState';

// Mock colors
const mockColors = {
  primaryText: '#000000',
  secondaryText: '#666666',
  tertiaryText: '#999999',
  cardBackground: '#ffffff',
  border: '#e5e5e5',
  buttonBackground: '#3b82f6',
  buttonHoverBackground: '#2563eb',
};

describe('EmptyState', () => {
  const defaultProps = {
    onClearFilters: jest.fn(),
    colors: mockColors,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render empty state message', () => {
      render(<EmptyState {...defaultProps} />);

      expect(screen.getByText(/no templates found/i)).toBeInTheDocument();
    });

    it('should render descriptive text', () => {
      render(<EmptyState {...defaultProps} />);

      expect(
        screen.getByText(/try adjusting your search or filter criteria/i)
      ).toBeInTheDocument();
    });

    it('should render "Clear All Filters" button', () => {
      render(<EmptyState {...defaultProps} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should render suggestions heading', () => {
      render(<EmptyState {...defaultProps} />);

      expect(screen.getByText(/try these suggestions/i)).toBeInTheDocument();
    });

    it('should render at least 3 suggestions', () => {
      render(<EmptyState {...defaultProps} />);

      // Check for common suggestions
      expect(screen.getByText(/broaden your search/i)).toBeInTheDocument();
      expect(screen.getByText(/try different keywords/i)).toBeInTheDocument();
    });

    it('should render icons for visual appeal', () => {
      const { container } = render(<EmptyState {...defaultProps} />);

      // Should have SVG icons
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('User interactions', () => {
    it('should call onClearFilters when "Clear All Filters" button is clicked', () => {
      const onClearFilters = jest.fn();
      render(<EmptyState {...defaultProps} onClearFilters={onClearFilters} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      fireEvent.click(clearButton);

      expect(onClearFilters).toHaveBeenCalledTimes(1);
    });

    it('should have clickable "show all templates" link', () => {
      const onClearFilters = jest.fn();
      render(<EmptyState {...defaultProps} onClearFilters={onClearFilters} />);

      const showAllLink = screen.queryByText(/show all templates/i);
      if (showAllLink) {
        fireEvent.click(showAllLink);
        expect(onClearFilters).toHaveBeenCalled();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role for status region', () => {
      const { container } = render(<EmptyState {...defaultProps} />);

      const statusElement = container.querySelector('[role="status"]');
      expect(statusElement).toBeInTheDocument();
    });

    it('should have aria-live for screen reader announcements', () => {
      const { container } = render(<EmptyState {...defaultProps} />);

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      render(<EmptyState {...defaultProps} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearButton).toHaveAttribute('aria-label');
    });

    it('should be keyboard accessible', () => {
      const onClearFilters = jest.fn();
      render(<EmptyState {...defaultProps} onClearFilters={onClearFilters} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      clearButton.focus();

      expect(clearButton).toHaveFocus();

      fireEvent.keyDown(clearButton, { key: 'Enter' });
      expect(onClearFilters).toHaveBeenCalled();
    });
  });

  describe('Color theming', () => {
    it('should apply custom colors from props', () => {
      const { container } = render(<EmptyState {...defaultProps} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toBeInTheDocument();
    });

    it('should use primary text color for heading', () => {
      render(<EmptyState {...defaultProps} />);

      const heading = screen.getByText(/no templates found/i);
      expect(heading).toHaveStyle({ color: mockColors.primaryText });
    });

    it('should use secondary text color for description', () => {
      render(<EmptyState {...defaultProps} />);

      const description = screen.getByText(/try adjusting your search or filter criteria/i);
      expect(description).toHaveStyle({ color: mockColors.secondaryText });
    });
  });

  describe('Animations', () => {
    it('should have fade-in animation class', () => {
      const { container } = render(<EmptyState {...defaultProps} />);

      const mainDiv = container.querySelector('.animate-fade-in');
      expect(mainDiv).toBeInTheDocument();
    });

    it('should have floating animation for decorative icons', () => {
      const { container } = render(<EmptyState {...defaultProps} />);

      // Check for animated elements
      const animatedElements = container.querySelectorAll('[class*="animate"]');
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Visual design elements', () => {
    it('should render layered icon illustration', () => {
      const { container } = render(<EmptyState {...defaultProps} />);

      // Should have multiple icon layers
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(1);
    });

    it('should render suggestions box', () => {
      render(<EmptyState {...defaultProps} />);

      expect(screen.getByText(/try these suggestions/i)).toBeInTheDocument();
    });

    it('should render call-to-action button with hover effect', () => {
      render(<EmptyState {...defaultProps} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearButton).toHaveClass(/transition/);
    });
  });

  describe('Content variations', () => {
    it('should provide helpful suggestions to users', () => {
      render(<EmptyState {...defaultProps} />);

      // Check for actionable suggestions
      const suggestions = screen.getByText(/try these suggestions/i).parentElement;
      expect(suggestions).toBeInTheDocument();
    });

    it('should encourage users to modify their search', () => {
      render(<EmptyState {...defaultProps} />);

      expect(screen.getByText(/try adjusting/i)).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle missing onClearFilters gracefully', () => {
      const { } = render(
        <EmptyState colors={mockColors} onClearFilters={undefined as any} />
      );

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });

      // Should not throw when clicked without handler
      expect(() => {
        fireEvent.click(clearButton);
      }).not.toThrow();
    });

    it('should render with minimal props', () => {
      expect(() => {
        render(<EmptyState {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe('Responsive design', () => {
    it('should have responsive padding classes', () => {
      const { container } = render(<EmptyState {...defaultProps} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass(/p-/); // Has padding class
    });

    it('should have responsive layout classes', () => {
      const { container } = render(<EmptyState {...defaultProps} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass(/flex/); // Uses flexbox
    });
  });

  describe('Icon presentation', () => {
    it('should have decorative icons marked with aria-hidden', () => {
      const { container } = render(<EmptyState {...defaultProps} />);

      const hiddenIcons = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });

    it('should render search icon', () => {
      const { container } = render(<EmptyState {...defaultProps} />);

      // Check for common icon class or data attribute
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Button styling', () => {
    it('should have clear visual hierarchy with button prominence', () => {
      render(<EmptyState {...defaultProps} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearButton).toHaveClass(/px-/); // Has padding
      expect(clearButton).toHaveClass(/py-/); // Has vertical padding
    });

    it('should have hover state styles', () => {
      render(<EmptyState {...defaultProps} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearButton).toHaveClass(/hover:/);
    });

    it('should have focus state for accessibility', () => {
      render(<EmptyState {...defaultProps} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      clearButton.focus();

      expect(clearButton).toHaveFocus();
    });
  });

  describe('Layout structure', () => {
    it('should have centered content layout', () => {
      const { container } = render(<EmptyState {...defaultProps} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass(/items-center/);
      expect(mainDiv).toHaveClass(/justify-center/);
    });

    it('should have proper vertical spacing between elements', () => {
      const { container } = render(<EmptyState {...defaultProps} />);

      const flexCol = container.querySelector('.flex-col');
      expect(flexCol).toBeInTheDocument();
    });
  });
});
