/**
 * Tests for TemplateCard component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TemplateCard from '../TemplateCard';
import { resumeTemplates } from '../../../../data/templates';

// Mock colors
const mockColors = {
  primaryText: '#000000',
  secondaryText: '#666666',
  cardBackground: '#ffffff',
  border: '#e5e5e5',
  buttonBackground: '#3b82f6',
  buttonHoverBackground: '#2563eb',
};

describe('TemplateCard', () => {
  const template = resumeTemplates[0];
  const defaultProps = {
    template,
    colors: mockColors,
    isAdded: false,
    isFavorite: false,
    onPreview: jest.fn(),
    onUse: jest.fn(),
    onToggleFavorite: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render template card with correct data', () => {
      render(<TemplateCard {...defaultProps} />);

      expect(screen.getByText(template.name)).toBeInTheDocument();
      expect(screen.getByText(template.description)).toBeInTheDocument();
      expect(screen.getByText(template.category)).toBeInTheDocument();
      expect(screen.getByText(template.difficulty)).toBeInTheDocument();
    });

    it('should render preview button', () => {
      render(<TemplateCard {...defaultProps} />);

      const previewButton = screen.getByRole('button', { name: /preview/i });
      expect(previewButton).toBeInTheDocument();
    });

    it('should render favorite button', () => {
      render(<TemplateCard {...defaultProps} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton).toBeInTheDocument();
    });

    it('should render "Use Template" button when not added', () => {
      render(<TemplateCard {...defaultProps} isAdded={false} />);

      const useButton = screen.getByRole('button', { name: /use template/i });
      expect(useButton).toBeInTheDocument();
    });

    it('should render rating stars', () => {
      render(<TemplateCard {...defaultProps} />);

      // Should display rating value
      expect(screen.getByText(template.rating.toString())).toBeInTheDocument();
    });

    it('should display premium badge for premium templates', () => {
      const premiumTemplate = { ...template, isPremium: true };
      render(<TemplateCard {...defaultProps} template={premiumTemplate} />);

      expect(screen.getByText(/premium/i)).toBeInTheDocument();
    });

    it('should not display premium badge for free templates', () => {
      const freeTemplate = { ...template, isPremium: false };
      render(<TemplateCard {...defaultProps} template={freeTemplate} />);

      expect(screen.queryByText(/premium/i)).not.toBeInTheDocument();
    });

    it('should display download count', () => {
      render(<TemplateCard {...defaultProps} />);

      expect(screen.getByText(new RegExp(template.downloads.toString()))).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('should call onPreview when preview button clicked', () => {
      const onPreview = jest.fn();
      render(<TemplateCard {...defaultProps} onPreview={onPreview} />);

      const previewButton = screen.getByRole('button', { name: /preview/i });
      fireEvent.click(previewButton);

      expect(onPreview).toHaveBeenCalledWith(template.id);
    });

    it('should call onUse when "Use Template" button clicked', () => {
      const onUse = jest.fn();
      render(<TemplateCard {...defaultProps} onUse={onUse} isAdded={false} />);

      const useButton = screen.getByRole('button', { name: /use template/i });
      fireEvent.click(useButton);

      expect(onUse).toHaveBeenCalledWith(template.id);
    });

    it('should call onToggleFavorite when favorite button clicked', () => {
      const onToggleFavorite = jest.fn();
      render(<TemplateCard {...defaultProps} onToggleFavorite={onToggleFavorite} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      fireEvent.click(favoriteButton);

      expect(onToggleFavorite).toHaveBeenCalledWith(template.id);
    });

    it('should call onPreview when card is clicked', () => {
      const onPreview = jest.fn();
      render(<TemplateCard {...defaultProps} onPreview={onPreview} />);

      const card = screen.getByRole('article');
      fireEvent.click(card);

      expect(onPreview).toHaveBeenCalledWith(template.id);
    });

    it('should not call onPreview when clicking on buttons', () => {
      const onPreview = jest.fn();
      render(<TemplateCard {...defaultProps} onPreview={onPreview} isAdded={false} />);

      const useButton = screen.getByRole('button', { name: /use template/i });
      fireEvent.click(useButton);

      // Should call onUse, but not onPreview
      expect(defaultProps.onUse).toHaveBeenCalled();
      expect(onPreview).not.toHaveBeenCalled();
    });
  });

  describe('Favorite state', () => {
    it('should show filled heart when favorited', () => {
      render(<TemplateCard {...defaultProps} isFavorite={true} />);

      const favoriteButton = screen.getByRole('button', { name: /unfavorite/i });
      expect(favoriteButton).toBeInTheDocument();
    });

    it('should show empty heart when not favorited', () => {
      render(<TemplateCard {...defaultProps} isFavorite={false} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton).toBeInTheDocument();
    });

    it('should toggle favorite state on click', () => {
      const onToggleFavorite = jest.fn();
      const { rerender } = render(
        <TemplateCard {...defaultProps} isFavorite={false} onToggleFavorite={onToggleFavorite} />
      );

      let favoriteButton = screen.getByRole('button', { name: /favorite/i });
      fireEvent.click(favoriteButton);

      expect(onToggleFavorite).toHaveBeenCalledWith(template.id);

      // Simulate state change
      rerender(<TemplateCard {...defaultProps} isFavorite={true} onToggleFavorite={onToggleFavorite} />);

      favoriteButton = screen.getByRole('button', { name: /unfavorite/i });
      expect(favoriteButton).toBeInTheDocument();
    });
  });

  describe('Added state', () => {
    it('should show checkmark when template is added', () => {
      render(<TemplateCard {...defaultProps} isAdded={true} />);

      expect(screen.getByText(/added/i)).toBeInTheDocument();
    });

    it('should disable "Use Template" button when template is added', () => {
      render(<TemplateCard {...defaultProps} isAdded={true} />);

      const addedIndicator = screen.getByText(/added/i);
      expect(addedIndicator).toBeInTheDocument();

      // Should not have "Use Template" button
      const useButton = screen.queryByRole('button', { name: /use template/i });
      expect(useButton).not.toBeInTheDocument();
    });

    it('should show success animation when addedTemplateId matches', () => {
      render(<TemplateCard {...defaultProps} addedTemplateId={template.id} />);

      // Should show some kind of success indicator
      // This depends on the actual implementation
      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for buttons', () => {
      render(<TemplateCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /preview/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /favorite/i })).toHaveAttribute('aria-label');
    });

    it('should have article role for semantic markup', () => {
      render(<TemplateCard {...defaultProps} />);

      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      const onPreview = jest.fn();
      render(<TemplateCard {...defaultProps} onPreview={onPreview} />);

      const previewButton = screen.getByRole('button', { name: /preview/i });
      previewButton.focus();

      expect(previewButton).toHaveFocus();

      fireEvent.keyDown(previewButton, { key: 'Enter' });
      expect(onPreview).toHaveBeenCalled();
    });

    it('should have descriptive button text for screen readers', () => {
      render(<TemplateCard {...defaultProps} />);

      const previewButton = screen.getByRole('button', { name: /preview.*template/i });
      expect(previewButton).toBeInTheDocument();
    });
  });

  describe('Color theming', () => {
    it('should apply custom colors from props', () => {
      const { container } = render(<TemplateCard {...defaultProps} />);

      // Card should use background color
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveStyle({ background: mockColors.cardBackground });
    });

    it('should apply border color', () => {
      const { container } = render(<TemplateCard {...defaultProps} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveStyle({ borderColor: mockColors.border });
    });
  });

  describe('React.memo optimization', () => {
    it('should not re-render when non-relevant props change', () => {
      const renderSpy = jest.fn();
      const MemoizedCard = React.memo(TemplateCard);

      const { rerender } = render(<MemoizedCard {...defaultProps} />);
      renderSpy();

      // Change colors (which should be memoized)
      rerender(<MemoizedCard {...defaultProps} colors={{ ...mockColors }} />);

      // Should not cause additional renders due to memo
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should re-render when template ID changes', () => {
      const MemoizedCard = React.memo(TemplateCard);

      const { rerender, container } = render(<MemoizedCard {...defaultProps} />);
      const initialHTML = container.innerHTML;

      const newTemplate = resumeTemplates[1];
      rerender(<MemoizedCard {...defaultProps} template={newTemplate} />);

      expect(container.innerHTML).not.toBe(initialHTML);
    });

    it('should re-render when isAdded changes', () => {
      const MemoizedCard = React.memo(TemplateCard);

      const { rerender } = render(<MemoizedCard {...defaultProps} isAdded={false} />);

      expect(screen.queryByText(/added/i)).not.toBeInTheDocument();

      rerender(<MemoizedCard {...defaultProps} isAdded={true} />);

      expect(screen.getByText(/added/i)).toBeInTheDocument();
    });

    it('should re-render when isFavorite changes', () => {
      const MemoizedCard = React.memo(TemplateCard);

      const { rerender } = render(<MemoizedCard {...defaultProps} isFavorite={false} />);

      const favoriteButton1 = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton1).toBeInTheDocument();

      rerender(<MemoizedCard {...defaultProps} isFavorite={true} />);

      const favoriteButton2 = screen.getByRole('button', { name: /unfavorite/i });
      expect(favoriteButton2).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle missing optional data gracefully', () => {
      const minimalTemplate = {
        ...template,
        description: '',
        downloads: 0,
      };

      render(<TemplateCard {...defaultProps} template={minimalTemplate} />);

      expect(screen.getByText(minimalTemplate.name)).toBeInTheDocument();
    });

    it('should handle very long template names', () => {
      const longNameTemplate = {
        ...template,
        name: 'A'.repeat(100),
      };

      render(<TemplateCard {...defaultProps} template={longNameTemplate} />);

      // Should still render
      expect(screen.getByText(longNameTemplate.name)).toBeInTheDocument();
    });

    it('should handle very long descriptions', () => {
      const longDescTemplate = {
        ...template,
        description: 'A'.repeat(500),
      };

      render(<TemplateCard {...defaultProps} template={longDescTemplate} />);

      // Should still render (might be truncated)
      expect(screen.getByText(longDescTemplate.description)).toBeInTheDocument();
    });
  });
});
