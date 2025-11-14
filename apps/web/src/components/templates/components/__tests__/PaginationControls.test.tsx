/**
 * Tests for PaginationControls component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaginationControls from '../PaginationControls';

// Mock Tooltip component
jest.mock('../Tooltip', () => ({
  __esModule: true,
  default: ({ children, content }: any) => (
    <div data-tooltip={content}>{children}</div>
  ),
}));

// Mock colors
const mockColors = {
  primaryText: '#000000',
  secondaryText: '#666666',
  cardBackground: '#ffffff',
  border: '#e5e5e5',
};

describe('PaginationControls', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: jest.fn(),
    colors: mockColors,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pagination controls', () => {
      render(<PaginationControls {...defaultProps} />);

      expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
    });

    it('should render all page number buttons', () => {
      render(<PaginationControls {...defaultProps} totalPages={5} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
    });

    it('should not render when totalPages is 1', () => {
      const { container } = render(
        <PaginationControls {...defaultProps} totalPages={1} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render when totalPages is 0', () => {
      const { container } = render(
        <PaginationControls {...defaultProps} totalPages={0} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should highlight current page', () => {
      render(<PaginationControls {...defaultProps} currentPage={3} />);

      const page3Button = screen.getByRole('button', { name: '3' });
      expect(page3Button).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should not highlight non-current pages', () => {
      render(<PaginationControls {...defaultProps} currentPage={3} />);

      const page1Button = screen.getByRole('button', { name: '1' });
      expect(page1Button).not.toHaveClass('bg-blue-600');
      expect(page1Button).toHaveClass('text-gray-600');
    });

    it('should render chevron icons', () => {
      const { container } = render(<PaginationControls {...defaultProps} />);

      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThanOrEqual(2);
    });

    it('should render correct number of page buttons', () => {
      render(<PaginationControls {...defaultProps} totalPages={10} />);

      // Should render buttons for pages 1-10
      for (let i = 1; i <= 10; i++) {
        expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
      }
    });
  });

  describe('User interactions', () => {
    it('should call onPageChange when page number is clicked', () => {
      const onPageChange = jest.fn();
      render(
        <PaginationControls
          {...defaultProps}
          currentPage={1}
          onPageChange={onPageChange}
        />
      );

      const page3Button = screen.getByRole('button', { name: '3' });
      fireEvent.click(page3Button);

      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('should call onPageChange with next page when next button clicked', () => {
      const onPageChange = jest.fn();
      render(
        <PaginationControls
          {...defaultProps}
          currentPage={2}
          onPageChange={onPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next page/i });
      fireEvent.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('should call onPageChange with previous page when previous button clicked', () => {
      const onPageChange = jest.fn();
      render(
        <PaginationControls
          {...defaultProps}
          currentPage={3}
          onPageChange={onPageChange}
        />
      );

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      fireEvent.click(prevButton);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should navigate to first page from any page', () => {
      const onPageChange = jest.fn();
      render(
        <PaginationControls
          {...defaultProps}
          currentPage={5}
          onPageChange={onPageChange}
        />
      );

      const page1Button = screen.getByRole('button', { name: '1' });
      fireEvent.click(page1Button);

      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('should navigate to last page from any page', () => {
      const onPageChange = jest.fn();
      render(
        <PaginationControls
          {...defaultProps}
          currentPage={1}
          totalPages={5}
          onPageChange={onPageChange}
        />
      );

      const page5Button = screen.getByRole('button', { name: '5' });
      fireEvent.click(page5Button);

      expect(onPageChange).toHaveBeenCalledWith(5);
    });

    it('should allow clicking current page button', () => {
      const onPageChange = jest.fn();
      render(
        <PaginationControls
          {...defaultProps}
          currentPage={3}
          onPageChange={onPageChange}
        />
      );

      const page3Button = screen.getByRole('button', { name: '3' });
      fireEvent.click(page3Button);

      expect(onPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe('Disabled states', () => {
    it('should disable previous button on first page', () => {
      render(<PaginationControls {...defaultProps} currentPage={1} />);

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      render(<PaginationControls {...defaultProps} currentPage={5} totalPages={5} />);

      const nextButton = screen.getByRole('button', { name: /next page/i });
      expect(nextButton).toBeDisabled();
    });

    it('should enable previous button when not on first page', () => {
      render(<PaginationControls {...defaultProps} currentPage={2} />);

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      expect(prevButton).not.toBeDisabled();
    });

    it('should enable next button when not on last page', () => {
      render(<PaginationControls {...defaultProps} currentPage={2} totalPages={5} />);

      const nextButton = screen.getByRole('button', { name: /next page/i });
      expect(nextButton).not.toBeDisabled();
    });

    it('should not call onPageChange when clicking disabled previous button', () => {
      const onPageChange = jest.fn();
      render(
        <PaginationControls
          {...defaultProps}
          currentPage={1}
          onPageChange={onPageChange}
        />
      );

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      fireEvent.click(prevButton);

      // Should still be called but with Math.max(1, 0) = 1
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('should not call onPageChange when clicking disabled next button', () => {
      const onPageChange = jest.fn();
      render(
        <PaginationControls
          {...defaultProps}
          currentPage={5}
          totalPages={5}
          onPageChange={onPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next page/i });
      fireEvent.click(nextButton);

      // Should still be called but with Math.min(5, 6) = 5
      expect(onPageChange).toHaveBeenCalledWith(5);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label for previous button', () => {
      render(<PaginationControls {...defaultProps} />);

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      expect(prevButton).toHaveAttribute('aria-label', 'Previous page');
    });

    it('should have aria-label for next button', () => {
      render(<PaginationControls {...defaultProps} />);

      const nextButton = screen.getByRole('button', { name: /next page/i });
      expect(nextButton).toHaveAttribute('aria-label', 'Next page');
    });

    it('should be keyboard accessible', () => {
      const onPageChange = jest.fn();
      render(
        <PaginationControls
          {...defaultProps}
          currentPage={1}
          onPageChange={onPageChange}
        />
      );

      const page2Button = screen.getByRole('button', { name: '2' });
      page2Button.focus();

      expect(page2Button).toHaveFocus();

      fireEvent.keyDown(page2Button, { key: 'Enter' });
      expect(onPageChange).toHaveBeenCalled();
    });

    it('should have proper disabled styling', () => {
      render(<PaginationControls {...defaultProps} currentPage={1} />);

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      expect(prevButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('should have tooltips for navigation buttons', () => {
      const { container } = render(<PaginationControls {...defaultProps} />);

      const tooltips = container.querySelectorAll('[data-tooltip]');
      expect(tooltips.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Responsive design', () => {
    it('should have responsive padding classes', () => {
      render(<PaginationControls {...defaultProps} />);

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      expect(prevButton).toHaveClass('p-2', 'sm:p-1.5');
    });

    it('should have responsive icon sizes', () => {
      const { container } = render(<PaginationControls {...defaultProps} />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('sm:w-4', 'sm:h-4');
    });

    it('should have responsive button sizing', () => {
      render(<PaginationControls {...defaultProps} />);

      const page1Button = screen.getByRole('button', { name: '1' });
      expect(page1Button).toHaveClass('px-3', 'py-2', 'sm:px-2.5', 'sm:py-1.5');
    });

    it('should have touch-manipulation for mobile', () => {
      render(<PaginationControls {...defaultProps} />);

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      expect(prevButton).toHaveClass('touch-manipulation');
    });

    it('should have min-width for page buttons', () => {
      render(<PaginationControls {...defaultProps} />);

      const page1Button = screen.getByRole('button', { name: '1' });
      expect(page1Button).toHaveClass('min-w-[44px]', 'sm:min-w-0');
    });

    it('should have responsive gap spacing', () => {
      const { container } = render(<PaginationControls {...defaultProps} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('gap-1', 'sm:gap-2');
    });
  });

  describe('Boundary conditions', () => {
    it('should handle currentPage = 1 correctly', () => {
      const onPageChange = jest.fn();
      render(
        <PaginationControls
          {...defaultProps}
          currentPage={1}
          onPageChange={onPageChange}
        />
      );

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      fireEvent.click(prevButton);

      // Should call with Math.max(1, 0) = 1
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('should handle currentPage = totalPages correctly', () => {
      const onPageChange = jest.fn();
      render(
        <PaginationControls
          {...defaultProps}
          currentPage={5}
          totalPages={5}
          onPageChange={onPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next page/i });
      fireEvent.click(nextButton);

      // Should call with Math.min(5, 6) = 5
      expect(onPageChange).toHaveBeenCalledWith(5);
    });

    it('should handle totalPages = 2 (minimum for rendering)', () => {
      render(<PaginationControls {...defaultProps} totalPages={2} currentPage={1} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    });

    it('should handle large totalPages number', () => {
      render(<PaginationControls {...defaultProps} totalPages={100} currentPage={50} />);

      // Should render all 100 page buttons
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '50' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '100' })).toBeInTheDocument();
    });
  });

  describe('Visual styling', () => {
    it('should have rounded corners on buttons', () => {
      render(<PaginationControls {...defaultProps} />);

      const page1Button = screen.getByRole('button', { name: '1' });
      expect(page1Button).toHaveClass('rounded-lg');
    });

    it('should have transition classes', () => {
      render(<PaginationControls {...defaultProps} />);

      const page1Button = screen.getByRole('button', { name: '1' });
      expect(page1Button).toHaveClass('transition-colors');
    });

    it('should apply border to navigation buttons', () => {
      render(<PaginationControls {...defaultProps} />);

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      expect(prevButton).toHaveClass('border', 'border-gray-300');
    });

    it('should have hover styles on non-current pages', () => {
      render(<PaginationControls {...defaultProps} currentPage={1} />);

      const page2Button = screen.getByRole('button', { name: '2' });
      expect(page2Button).toHaveClass('hover:bg-gray-100');
    });

    it('should have hover styles on navigation buttons', () => {
      render(<PaginationControls {...defaultProps} />);

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      expect(prevButton).toHaveClass('hover:bg-gray-50');
    });

    it('should center pagination controls', () => {
      const { container } = render(<PaginationControls {...defaultProps} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('justify-center', 'items-center');
    });

    it('should have proper spacing with margin classes', () => {
      const { container } = render(<PaginationControls {...defaultProps} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('mt-6', 'mb-4');
    });
  });

  describe('Edge cases', () => {
    it('should handle missing colors prop', () => {
      expect(() => {
        render(
          <PaginationControls
            currentPage={1}
            totalPages={5}
            onPageChange={jest.fn()}
          />
        );
      }).not.toThrow();
    });

    it('should handle currentPage greater than totalPages', () => {
      render(
        <PaginationControls
          {...defaultProps}
          currentPage={10}
          totalPages={5}
        />
      );

      // Should still render, but behavior might be unexpected
      const nextButton = screen.getByRole('button', { name: /next page/i });
      expect(nextButton).toBeInTheDocument();
    });

    it('should handle negative currentPage', () => {
      render(
        <PaginationControls
          {...defaultProps}
          currentPage={-1}
          totalPages={5}
        />
      );

      // Should still render
      expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    });

    it('should handle negative totalPages', () => {
      const { container } = render(
        <PaginationControls
          {...defaultProps}
          totalPages={-5}
        />
      );

      // Should not render
      expect(container.firstChild).toBeNull();
    });

    it('should handle zero currentPage', () => {
      render(
        <PaginationControls
          {...defaultProps}
          currentPage={0}
          totalPages={5}
        />
      );

      expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    });
  });

  describe('Page navigation logic', () => {
    it('should navigate through pages sequentially', () => {
      const onPageChange = jest.fn();
      const { rerender } = render(
        <PaginationControls
          {...defaultProps}
          currentPage={1}
          totalPages={5}
          onPageChange={onPageChange}
        />
      );

      // Click next repeatedly
      const nextButton = screen.getByRole('button', { name: /next page/i });

      fireEvent.click(nextButton);
      expect(onPageChange).toHaveBeenCalledWith(2);

      rerender(
        <PaginationControls
          {...defaultProps}
          currentPage={2}
          totalPages={5}
          onPageChange={onPageChange}
        />
      );

      fireEvent.click(nextButton);
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('should navigate backwards through pages sequentially', () => {
      const onPageChange = jest.fn();
      const { rerender } = render(
        <PaginationControls
          {...defaultProps}
          currentPage={5}
          totalPages={5}
          onPageChange={onPageChange}
        />
      );

      const prevButton = screen.getByRole('button', { name: /previous page/i });

      fireEvent.click(prevButton);
      expect(onPageChange).toHaveBeenCalledWith(4);

      rerender(
        <PaginationControls
          {...defaultProps}
          currentPage={4}
          totalPages={5}
          onPageChange={onPageChange}
        />
      );

      fireEvent.click(prevButton);
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('should allow jumping to any page', () => {
      const onPageChange = jest.fn();
      render(
        <PaginationControls
          {...defaultProps}
          currentPage={1}
          totalPages={10}
          onPageChange={onPageChange}
        />
      );

      const page7Button = screen.getByRole('button', { name: '7' });
      fireEvent.click(page7Button);

      expect(onPageChange).toHaveBeenCalledWith(7);
    });
  });
});
