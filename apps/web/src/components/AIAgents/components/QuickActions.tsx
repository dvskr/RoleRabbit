import React from 'react';
import { FileText, Search, BookOpen } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ size: number }>;
  title: string;
  ariaLabel: string;
}

const quickActions: QuickAction[] = [
  { 
    label: 'Bulk Resume Generation', 
    icon: FileText, 
    title: 'Bulk Resume Generation',
    ariaLabel: 'Bulk Resume Generation'
  },
  { 
    label: 'Company Research', 
    icon: Search, 
    title: 'Company Research',
    ariaLabel: 'Company Research'
  },
  { 
    label: 'Interview Prep', 
    icon: BookOpen, 
    title: 'Interview Prep',
    ariaLabel: 'Interview Prep'
  }
];

export const QuickActions: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  return (
    <div className="flex gap-2 mb-4">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            className="px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.badgePurpleText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
            title={action.title}
            aria-label={action.ariaLabel}
          >
            <Icon size={14} />
            {action.label}
          </button>
        );
      })}
    </div>
  );
};

