import React, { useState, useMemo } from 'react';
import { Calendar, Search, Filter } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { HistoryCard } from './HistoryCard';
import { HistoryTask } from '../types';
import { groupHistoryByDate, formatDateLabel } from '../utils/helpers';

interface HistoryTabProps {
  historyTasks: HistoryTask[];
}

type FilterType = 'all' | 'completed' | 'failed';

export const HistoryTab: React.FC<HistoryTabProps> = ({ historyTasks }) => {
  const { theme } = useTheme();
  const colors = theme?.colors;
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  if (!colors) return null;

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let filtered = historyTasks;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(task =>
        task.status.toLowerCase() === filter
      );
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.status.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [historyTasks, filter, searchQuery]);

  const groupedHistory = groupHistoryByDate(filteredTasks);

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Completed', value: 'completed' },
    { label: 'Failed', value: 'failed' },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="mb-6">
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: colors.primaryText }}
        >
          Task History
        </h2>
        <p
          className="text-sm mb-4"
          style={{ color: colors.secondaryText }}
        >
          Review your AI agent's completed work
        </p>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: colors.secondaryText }}
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg outline-none text-sm"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.badgePurpleText;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: filter === f.value ? colors.badgePurpleBg : colors.inputBackground,
                  color: filter === f.value ? colors.badgePurpleText : colors.secondaryText,
                  border: `1px solid ${filter === f.value ? colors.badgePurpleText : colors.border}`,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History List */}
      {Object.keys(groupedHistory).length === 0 ? (
        <div
          className="p-8 rounded-xl text-center"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <p style={{ color: colors.secondaryText }}>
            {searchQuery || filter !== 'all'
              ? 'No tasks found matching your filters'
              : 'No task history yet. Complete some tasks to see them here!'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedHistory).map(([date, tasks]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} style={{ color: colors.secondaryText }} />
                <h3
                  className="text-sm font-semibold capitalize"
                  style={{ color: colors.primaryText }}
                >
                  {formatDateLabel(date)}
                </h3>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    background: colors.badgePurpleBg,
                    color: colors.badgePurpleText,
                  }}
                >
                  {tasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {tasks.map(task => (
                  <HistoryCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

