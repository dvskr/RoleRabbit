import React, { useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import { DiscussionFilters as DiscussionFiltersType } from '../../types/discussion';
import { useTheme } from '../../contexts/ThemeContext';

interface DiscussionFiltersProps {
  filters: DiscussionFiltersType;
  onUpdateFilters: (filters: Partial<DiscussionFiltersType>) => void;
  onResetFilters: () => void;
  onClose: () => void;
  communities: Array<{ id: string; name: string }>;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'general', label: 'General' },
  { value: 'resume', label: 'Resume' },
  { value: 'career', label: 'Career' },
  { value: 'interview', label: 'Interview' },
  { value: 'job-search', label: 'Job Search' },
  { value: 'networking', label: 'Networking' },
  { value: 'ai-help', label: 'AI Help' },
  { value: 'feedback', label: 'Feedback' }
];

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'time', label: 'Newest First' },
  { value: 'votes', label: 'Most Voted' },
  { value: 'comments', label: 'Most Comments' }
];

export default function DiscussionFilters({
  filters,
  onUpdateFilters,
  onResetFilters,
  onClose,
  communities
}: DiscussionFiltersProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  // Inject styles for select dropdown options to support dark theme
  useEffect(() => {
    const styleId = 'discussion-filters-select-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Ensure high contrast text color
    const optionTextColor = theme.mode === 'dark' ? '#f1f5f9' : colors.primaryText;
    
    styleElement.textContent = `
      select.discussion-filter-select {
        background-color: ${colors.inputBackground} !important;
        color: ${optionTextColor} !important;
      }
      select.discussion-filter-select option {
        background-color: ${colors.inputBackground} !important;
        background: ${colors.inputBackground} !important;
        color: ${optionTextColor} !important;
        padding: 8px 12px !important;
      }
      select.discussion-filter-select option:checked,
      select.discussion-filter-select option:focus,
      select.discussion-filter-select option[selected],
      select.discussion-filter-select option:hover {
        background-color: ${colors.primaryBlue} !important;
        background: ${colors.primaryBlue} !important;
        color: #ffffff !important;
      }
      select.discussion-filter-select:focus option {
        background-color: ${colors.inputBackground} !important;
        background: ${colors.inputBackground} !important;
        color: ${optionTextColor} !important;
      }
      select.discussion-filter-select:focus option:checked,
      select.discussion-filter-select:focus option[selected],
      select.discussion-filter-select:focus option:hover {
        background-color: ${colors.primaryBlue} !important;
        background: ${colors.primaryBlue} !important;
        color: #ffffff !important;
      }
    `;

    return () => {
      // Keep style element for theme updates
    };
  }, [colors, theme.mode]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div className="rounded-lg p-6 w-full max-w-md" style={{ background: colors.cardBackground }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: colors.primaryText }}>Filter Discussions</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            title="Close"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.secondaryText }}>
              Category
            </label>
            <select
              value={filters.selectedCategory}
              onChange={(e) => onUpdateFilters({ selectedCategory: e.target.value })}
              className="discussion-filter-select w-full rounded-lg px-3 py-2"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Community Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.secondaryText }}>
              Community
            </label>
            <select
              value={filters.selectedCommunity || 'all'}
              onChange={(e) => onUpdateFilters({ 
                selectedCommunity: e.target.value === 'all' ? null : e.target.value 
              })}
              className="discussion-filter-select w-full rounded-lg px-3 py-2"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            >
              <option value="all">All Communities</option>
              {communities.map(community => (
                <option key={community.id} value={community.name}>
                  {community.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.secondaryText }}>
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => onUpdateFilters({ sortBy: e.target.value as any })}
              className="discussion-filter-select w-full rounded-lg px-3 py-2"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Filters */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: colors.secondaryText }}>
              Additional Filters
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showPinned}
                  onChange={(e) => onUpdateFilters({ showPinned: e.target.checked })}
                  className="rounded"
                  style={{ accentColor: colors.primaryBlue }}
                />
                <span className="ml-2 text-sm" style={{ color: colors.primaryText }}>Show only pinned posts</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showTrending}
                  onChange={(e) => onUpdateFilters({ showTrending: e.target.checked })}
                  className="rounded"
                  style={{ accentColor: colors.primaryBlue }}
                />
                <span className="ml-2 text-sm" style={{ color: colors.primaryText }}>Show only trending posts</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={onResetFilters}
            className="flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            style={{
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            Reset Filters
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
            style={{
              background: colors.primaryBlue,
              color: 'white',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
