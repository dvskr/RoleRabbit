import React from 'react';
import { FileText, Briefcase, Mail, Rocket } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export const ActivitySidebar: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  const activityMetrics = [
    { icon: FileText, label: 'Resumes Generated', value: '12' },
    { icon: Briefcase, label: 'Applications Filled', value: '8' },
    { icon: Mail, label: 'Emails Sent', value: '5' }
  ];

  return (
    <div 
      className="w-80 border-l overflow-y-auto px-4 py-4"
      style={{ 
        borderLeft: `1px solid ${colors.border}`,
        background: colors.cardBackground
      }}
    >
      <h3 
        className="text-sm font-semibold mb-4"
        style={{ color: colors.primaryText }}
      >
        Today's Activity
      </h3>
      
      <div className="space-y-3 mb-6">
        {activityMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div 
              key={metric.label}
              className="rounded-lg p-3"
              style={{ background: colors.inputBackground }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} style={{ color: colors.badgePurpleText }} />
                <span 
                  className="text-sm font-medium"
                  style={{ color: colors.primaryText }}
                >
                  {metric.label}
                </span>
              </div>
              <span 
                className="text-lg font-bold"
                style={{ color: colors.primaryText }}
              >
                {metric.value}
              </span>
            </div>
          );
        })}
      </div>

      <h3 
        className="text-sm font-semibold mb-4"
        style={{ color: colors.primaryText }}
      >
        Agent Performance
      </h3>

      <div className="space-y-3 mb-6">
        <div>
          <span 
            className="text-xs mb-1 block"
            style={{ color: colors.secondaryText }}
          >
            Success Rate
          </span>
          <span 
            className="text-lg font-bold"
            style={{ color: '#10b981' }}
          >
            98%
          </span>
        </div>
        <div>
          <span 
            className="text-xs mb-1 block"
            style={{ color: colors.secondaryText }}
          >
            Avg ATS Score
          </span>
          <span 
            className="text-lg font-bold"
            style={{ color: colors.primaryBlue }}
          >
            92/100
          </span>
        </div>
      </div>

      <button
        className="w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        style={{
          background: colors.badgePurpleBg,
          color: colors.badgePurpleText,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.badgePurpleText;
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.badgePurpleBg;
          e.currentTarget.style.color = colors.badgePurpleText;
        }}
      >
        <Rocket size={18} />
        Start Bulk Job Application
      </button>
    </div>
  );
};

