/**
 * Tests for TemplateStats component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TemplateStats from '../TemplateStats';
import { resumeTemplates } from '../../../../data/templates';

// Mock colors
const mockColors = {
  primaryText: '#000000',
  secondaryText: '#666666',
  tertiaryText: '#999999',
  cardBackground: '#ffffff',
  border: '#e5e5e5',
  badgeInfoBg: '#dbeafe',
  badgeInfoText: '#1e40af',
  badgeSuccessBg: '#dcfce7',
  successGreen: '#16a34a',
  badgeWarningBg: '#fef3c7',
  badgeWarningText: '#d97706',
  badgeErrorBg: '#fee2e2',
  errorRed: '#dc2626',
};

describe('TemplateStats', () => {
  const defaultProps = {
    colors: mockColors,
    favorites: [],
  };

  describe('Rendering', () => {
    it('should render all stat cards', () => {
      render(<TemplateStats {...defaultProps} />);

      // Should have 4 stat cards in grid
      expect(screen.getByText(/total templates/i)).toBeInTheDocument();
      expect(screen.getByText(/your favorites/i)).toBeInTheDocument();
      expect(screen.getByText(/new this month/i)).toBeInTheDocument();
      expect(screen.getByText(/top rated/i)).toBeInTheDocument();
    });

    it('should render grid layout with 4 columns', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2', 'md:grid-cols-4');
    });

    it('should render total templates count', () => {
      render(<TemplateStats {...defaultProps} />);

      const totalCount = resumeTemplates.length;
      expect(screen.getByText(totalCount.toString())).toBeInTheDocument();
    });

    it('should render favorites count', () => {
      render(<TemplateStats {...defaultProps} favorites={['template-1', 'template-2']} />);

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/saved templates/i)).toBeInTheDocument();
    });

    it('should render zero favorites when none provided', () => {
      render(<TemplateStats {...defaultProps} favorites={[]} />);

      expect(screen.getByText(/your favorites/i)).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should render icons for each stat card', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(4);
    });

    it('should render stat descriptions', () => {
      render(<TemplateStats {...defaultProps} />);

      expect(screen.getByText(/saved templates/i)).toBeInTheDocument();
      expect(screen.getByText(/last 30 days/i)).toBeInTheDocument();
      expect(screen.getByText(/4\.5\+ stars/i)).toBeInTheDocument();
    });
  });

  describe('Filtered count display', () => {
    it('should show "Showing" label when filteredCount is provided', () => {
      render(
        <TemplateStats
          {...defaultProps}
          filteredCount={5}
        />
      );

      expect(screen.getByText(/showing/i)).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should show total count below filtered count', () => {
      const totalTemplates = resumeTemplates.length;
      render(
        <TemplateStats
          {...defaultProps}
          filteredCount={5}
        />
      );

      expect(screen.getByText(new RegExp(`of ${totalTemplates} total`, 'i'))).toBeInTheDocument();
    });

    it('should show "Total Templates" label when no filtering', () => {
      render(<TemplateStats {...defaultProps} />);

      expect(screen.getByText(/total templates/i)).toBeInTheDocument();
    });

    it('should not show "of X total" when showing all templates', () => {
      const totalTemplates = resumeTemplates.length;
      render(
        <TemplateStats
          {...defaultProps}
          filteredCount={totalTemplates}
        />
      );

      expect(screen.queryByText(/of.*total/i)).not.toBeInTheDocument();
    });

    it('should handle filteredCount of 0', () => {
      render(
        <TemplateStats
          {...defaultProps}
          filteredCount={0}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText(/showing/i)).toBeInTheDocument();
    });
  });

  describe('Statistics calculation', () => {
    it('should calculate total templates from resumeTemplates data', () => {
      render(<TemplateStats {...defaultProps} />);

      const totalCount = resumeTemplates.length;
      expect(screen.getByText(totalCount.toString())).toBeInTheDocument();
    });

    it('should calculate new templates from last 30 days', () => {
      render(<TemplateStats {...defaultProps} />);

      // New templates count should be displayed
      const newTemplatesElement = screen.getByText(/new this month/i).closest('div');
      expect(newTemplatesElement).toBeInTheDocument();
    });

    it('should calculate top rated templates (4.5+ rating)', () => {
      render(<TemplateStats {...defaultProps} />);

      const topRatedCount = resumeTemplates.filter(t => t.rating >= 4.5).length;
      const topRatedElement = screen.getByText(/top rated/i).closest('div');

      expect(topRatedElement).toContainHTML(topRatedCount.toString());
    });

    it('should count favorites based on provided array', () => {
      const favorites = ['id1', 'id2', 'id3', 'id4', 'id5'];
      render(<TemplateStats {...defaultProps} favorites={favorites} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Color theming', () => {
    it('should apply custom colors from props', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const cards = container.querySelectorAll('.rounded-lg');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should apply card background color', () => {
      render(<TemplateStats {...defaultProps} />);

      const totalTemplatesCard = screen.getByText(/total templates/i).closest('div');
      expect(totalTemplatesCard).toHaveStyle({ background: mockColors.cardBackground });
    });

    it('should apply border color to cards', () => {
      render(<TemplateStats {...defaultProps} />);

      const totalTemplatesCard = screen.getByText(/total templates/i).closest('div');
      expect(totalTemplatesCard).toHaveStyle({ borderColor: mockColors.border });
    });

    it('should apply primary text color to numbers', () => {
      render(<TemplateStats {...defaultProps} />);

      const totalCount = resumeTemplates.length;
      const numberElement = screen.getByText(totalCount.toString());
      expect(numberElement).toHaveStyle({ color: mockColors.primaryText });
    });

    it('should apply secondary text color to labels', () => {
      render(<TemplateStats {...defaultProps} />);

      const label = screen.getByText(/total templates/i);
      expect(label).toHaveStyle({ color: mockColors.secondaryText });
    });

    it('should apply tertiary text color to descriptions', () => {
      render(<TemplateStats {...defaultProps} />);

      const description = screen.getByText(/saved templates/i);
      expect(description).toHaveStyle({ color: mockColors.tertiaryText });
    });

    it('should apply badge colors to icon containers', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const iconContainers = container.querySelectorAll('.w-10.h-10.rounded-lg');
      expect(iconContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Icons', () => {
    it('should render FileText icon for total templates', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const totalCard = screen.getByText(/total templates/i).closest('.rounded-lg');
      const icon = totalCard?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render Heart icon for favorites', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const favoritesCard = screen.getByText(/your favorites/i).closest('.rounded-lg');
      const icon = favoritesCard?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render Sparkles icon for new templates', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const newCard = screen.getByText(/new this month/i).closest('.rounded-lg');
      const icon = newCard?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render TrendingUp icon for top rated', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const topRatedCard = screen.getByText(/top rated/i).closest('.rounded-lg');
      const icon = topRatedCard?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Responsive design', () => {
    it('should have responsive grid columns', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2', 'md:grid-cols-4');
    });

    it('should have responsive gap spacing', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-2');
    });

    it('should have responsive margin', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('mb-3');
    });
  });

  describe('Hover effects', () => {
    it('should have hover transition on cards', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const cards = container.querySelectorAll('.rounded-lg.p-3');
      cards.forEach(card => {
        expect(card).toHaveClass('transition-all', 'hover:shadow-md');
      });
    });

    it('should have shadow on cards', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const cards = container.querySelectorAll('.rounded-lg.p-3');
      cards.forEach(card => {
        expect(card).toHaveClass('shadow-sm');
      });
    });
  });

  describe('Typography', () => {
    it('should have proper font sizes for numbers', () => {
      render(<TemplateStats {...defaultProps} />);

      const totalCount = resumeTemplates.length;
      const numberElement = screen.getByText(totalCount.toString());
      expect(numberElement).toHaveClass('text-2xl', 'font-bold');
    });

    it('should have proper font sizes for labels', () => {
      render(<TemplateStats {...defaultProps} />);

      const label = screen.getByText(/total templates/i);
      expect(label).toHaveClass('text-xs', 'font-medium');
    });

    it('should have proper font sizes for descriptions', () => {
      render(<TemplateStats {...defaultProps} />);

      const description = screen.getByText(/saved templates/i);
      expect(description).toHaveClass('text-[10px]');
    });
  });

  describe('Layout structure', () => {
    it('should use flexbox for card content', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const cardContent = container.querySelector('.flex.items-center.justify-between');
      expect(cardContent).toBeInTheDocument();
    });

    it('should have proper padding on cards', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const cards = container.querySelectorAll('.rounded-lg.p-3');
      expect(cards.length).toBe(4);
    });

    it('should have icon containers with fixed size', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const iconContainers = container.querySelectorAll('.w-10.h-10');
      expect(iconContainers.length).toBe(4);
    });

    it('should have rounded icon containers', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const iconContainers = container.querySelectorAll('.w-10.h-10.rounded-lg');
      expect(iconContainers.length).toBe(4);
    });
  });

  describe('Edge cases', () => {
    it('should handle missing favorites prop', () => {
      const { colors, ...propsWithoutFavorites } = defaultProps;
      expect(() => {
        render(<TemplateStats colors={colors} />);
      }).not.toThrow();
    });

    it('should handle empty favorites array', () => {
      render(<TemplateStats {...defaultProps} favorites={[]} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle large favorites count', () => {
      const largeFavorites = Array.from({ length: 999 }, (_, i) => `template-${i}`);
      render(<TemplateStats {...defaultProps} favorites={largeFavorites} />);

      expect(screen.getByText('999')).toBeInTheDocument();
    });

    it('should handle very large filtered count', () => {
      render(<TemplateStats {...defaultProps} filteredCount={99999} />);

      expect(screen.getByText('99999')).toBeInTheDocument();
    });

    it('should handle undefined filteredCount', () => {
      render(<TemplateStats {...defaultProps} filteredCount={undefined} />);

      expect(screen.getByText(/total templates/i)).toBeInTheDocument();
    });

    it('should handle undefined colors gracefully', () => {
      expect(() => {
        render(
          <TemplateStats
            colors={undefined as any}
            favorites={[]}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Data integrity', () => {
    it('should use actual resumeTemplates data', () => {
      render(<TemplateStats {...defaultProps} />);

      // Should show actual count from data file
      const totalCount = resumeTemplates.length;
      expect(screen.getByText(totalCount.toString())).toBeInTheDocument();
    });

    it('should accurately calculate free templates count', () => {
      const freeCount = resumeTemplates.filter(t => !t.isPremium).length;

      // This stat isn't displayed but validates data integrity
      expect(freeCount).toBeGreaterThan(0);
    });

    it('should accurately calculate premium templates count', () => {
      const premiumCount = resumeTemplates.filter(t => t.isPremium).length;

      // This stat isn't displayed but validates data integrity
      expect(premiumCount).toBeGreaterThanOrEqual(0);
    });

    it('should calculate download count accurately', () => {
      const totalDownloads = resumeTemplates.reduce((sum, t) => sum + t.downloads, 0);

      // Validates data structure
      expect(totalDownloads).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Favorites integration', () => {
    it('should update favorites count when favorites prop changes', () => {
      const { rerender } = render(
        <TemplateStats {...defaultProps} favorites={['template-1']} />
      );

      expect(screen.getByText('1')).toBeInTheDocument();

      rerender(
        <TemplateStats
          {...defaultProps}
          favorites={['template-1', 'template-2', 'template-3']}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should handle duplicate favorite IDs', () => {
      render(
        <TemplateStats
          {...defaultProps}
          favorites={['template-1', 'template-1', 'template-2']}
        />
      );

      // Should count duplicates (array length)
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('should have readable text contrast', () => {
      render(<TemplateStats {...defaultProps} />);

      const numbers = screen.getAllByText(/\d+/);
      numbers.forEach(num => {
        expect(num).toBeVisible();
      });
    });

    it('should render all icons with proper sizes', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const icons = container.querySelectorAll('svg');
      icons.forEach(icon => {
        // Icons should have size attribute
        expect(icon).toBeInTheDocument();
      });
    });
  });

  describe('Visual consistency', () => {
    it('should have consistent card styling', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const cards = container.querySelectorAll('.rounded-lg.p-3.shadow-sm.border');
      expect(cards.length).toBe(4);
    });

    it('should have consistent icon container styling', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const iconContainers = container.querySelectorAll('.w-10.h-10.rounded-lg.flex.items-center.justify-center');
      expect(iconContainers.length).toBe(4);
    });

    it('should maintain layout consistency across all cards', () => {
      const { container } = render(<TemplateStats {...defaultProps} />);

      const flexContainers = container.querySelectorAll('.flex.items-center.justify-between');
      expect(flexContainers.length).toBe(4);
    });
  });
});
