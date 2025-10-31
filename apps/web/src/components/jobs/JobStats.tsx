import React from 'react';
import { Briefcase, TrendingUp, CheckCircle, XCircle, Star } from 'lucide-react';
import { JobStats as JobStatsType } from '../../types/job';
import { useTheme } from '../../contexts/ThemeContext';
import { getStatusBadgeStyles } from '../../utils/themeHelpers';

interface JobStatsProps {
  stats: JobStatsType;
}

export default function JobStats({ stats }: JobStatsProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const statsData = [
    {
      label: 'Total Applications',
      value: stats.total,
      icon: Briefcase,
      status: 'all' as const,
    },
    {
      label: 'Applied',
      value: stats.applied,
      icon: TrendingUp,
      status: 'applied' as const,
    },
    {
      label: 'Interviews',
      value: stats.interview,
      icon: CheckCircle,
      status: 'interview' as const,
    },
    {
      label: 'Offers',
      value: stats.offer,
      icon: CheckCircle,
      status: 'offer' as const,
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      status: 'rejected' as const,
    },
    {
      label: 'Favorites',
      value: stats.favorites,
      icon: Star,
      status: 'all' as const,
    }
  ];

  return (
    <div 
      className="rounded-lg p-3 mb-2"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 
          className="text-xs font-semibold"
          style={{ color: colors.primaryText }}
        >
          Job Application Statistics
        </h2>
        <div className="text-xs" style={{ color: colors.secondaryText }}>
          {stats.total > 0 ? Math.round(((stats.interview + stats.offer) / stats.total) * 100) : 0}% Success Rate
        </div>
      </div>
      
      <div className="grid grid-cols-6 gap-1">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          const badgeStyles = stat.status === 'all' 
            ? { background: colors.badgeNeutralBg, color: colors.badgeNeutralText, border: colors.badgeNeutralBorder }
            : getStatusBadgeStyles(stat.status, colors);
          
          return (
            <div
              key={index}
              className="border rounded-md p-1.5 text-center"
              style={{
                background: badgeStyles.background,
                border: `1px solid ${badgeStyles.border}`,
              }}
            >
              <div className="mb-0.5 flex justify-center" style={{ color: badgeStyles.color }}>
                <IconComponent size={12} />
              </div>
              <div className="text-sm font-bold mb-0.5" style={{ color: badgeStyles.color }}>
                {stat.value}
              </div>
              <div className="text-xs leading-tight" style={{ color: colors.secondaryText }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ultra Compact Progress Bar */}
      <div className="mt-2">
        <div 
          className="w-full rounded-full h-1"
          style={{ background: 'rgba(148, 163, 184, 0.15)' }}
        >
          <div 
            className="h-1 rounded-full transition-all duration-500"
            style={{ 
              width: `${stats.total > 0 ? ((stats.interview + stats.offer) / stats.total) * 100 : 0}%`,
              background: colors.successGreen,
            }}
          />
        </div>
      </div>
    </div>
  );
}
