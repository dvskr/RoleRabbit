'use client';

import React, { useState, useCallback } from 'react';
import { 
  TrendingUp, 
  Target, 
  FileText, 
  Calendar, 
  X, 
  Briefcase,
  Award,
  Users,
  BarChart3,
  Activity
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ApplicationAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApplicationData {
  // Overall Stats
  totalApplications: number;
  activeApplications: number;
  interviews: number;
  offers: number;
  acceptanceRate: number;
  
  // Breakdown
  byStatus: {
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    rejected: number;
  };
  
  // Industry Stats
  byIndustry: Array<{
    industry: string;
    count: number;
    rate: number;
  }>;
  
  // Timeline
  weeklyApplications: Array<{
    week: string;
    count: number;
  }>;
  
  // Recent Activity
  recentActivity: Array<{
    id: string;
    type: string;
    company: string;
    position: string;
    date: string;
    status: string;
  }>;
}

export default function ApplicationAnalytics({ isOpen, onClose }: ApplicationAnalyticsProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('all');
  
  const handleTimeframeChange = useCallback((period: 'week' | 'month' | 'all') => {
    setTimeframe(period);
  }, []);
  
  const handleCloseClick = useCallback(() => {
    onClose();
  }, [onClose]);
  
  const [data] = useState<ApplicationData>({
    totalApplications: 47,
    activeApplications: 23,
    interviews: 8,
    offers: 3,
    acceptanceRate: 6.4,
    byStatus: {
      applied: 15,
      screening: 5,
      interview: 8,
      offer: 3,
      rejected: 16
    },
    byIndustry: [
      { industry: 'Technology', count: 25, rate: 12.0 },
      { industry: 'Finance', count: 12, rate: 8.3 },
      { industry: 'Healthcare', count: 5, rate: 20.0 },
      { industry: 'Education', count: 5, rate: 0 }
    ],
    weeklyApplications: [
      { week: 'Week 1', count: 12 },
      { week: 'Week 2', count: 15 },
      { week: 'Week 3', count: 10 },
      { week: 'Week 4', count: 10 }
    ],
    recentActivity: [
      { id: '1', type: 'Interview', company: 'TechCorp', position: 'Senior Developer', date: '2024-10-22', status: 'scheduled' },
      { id: '2', type: 'Offer', company: 'StartupXYZ', position: 'Product Manager', date: '2024-10-20', status: 'received' },
      { id: '3', type: 'Application', company: 'DataTech Inc', position: 'Data Engineer', date: '2024-10-18', status: 'applied' },
      { id: '4', type: 'Screening', company: 'HealthCare Plus', position: 'Healthcare Analyst', date: '2024-10-15', status: 'completed' },
      { id: '5', type: 'Rejection', company: 'OldCorp', position: 'Software Engineer', date: '2024-10-10', status: 'received' }
    ]
  });

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div 
        className="rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto"
        style={{
          background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground,
          border: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`,
          boxShadow: theme.mode === 'light' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 px-6 py-4 z-10"
          style={{
            background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground,
            borderBottom: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ background: colors.badgePurpleBg }}
              >
                <BarChart3 size={24} style={{ color: colors.badgePurpleText }} />
              </div>
              <div>
                <h3 className="text-xl font-semibold" style={{ color: colors.primaryText }}>
                  Application Analytics
                </h3>
                <p className="text-sm" style={{ color: colors.secondaryText }}>
                  Track your job search progress and effectiveness
                </p>
              </div>
            </div>
            
            {/* Timeframe Filter */}
            <div className="flex items-center gap-2">
              {(['week', 'month', 'all'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => handleTimeframeChange(period)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: timeframe === period ? colors.badgePurpleText : colors.inputBackground,
                    color: timeframe === period ? 'white' : colors.secondaryText,
                    border: `1px solid ${timeframe === period ? colors.badgePurpleBorder : colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    if (timeframe !== period) {
                      e.currentTarget.style.background = colors.hoverBackground;
                      e.currentTarget.style.borderColor = colors.borderFocused;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (timeframe !== period) {
                      e.currentTarget.style.background = colors.inputBackground;
                      e.currentTarget.style.borderColor = colors.border;
                    }
                  }}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
              <button
                onClick={handleCloseClick}
                className="p-2 rounded-lg transition-colors ml-4"
                style={{ color: colors.tertiaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                  e.currentTarget.style.color = colors.secondaryText;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.tertiaryText;
                }}
                title="Close modal"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div 
              className="p-4 rounded-lg border"
              style={{
                background: colors.badgeInfoBg,
                border: `1px solid ${colors.badgeInfoBorder}`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Briefcase size={18} style={{ color: colors.primaryBlue }} />
                <span className="text-sm font-medium" style={{ color: colors.primaryText }}>Total</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.primaryBlue }}>
                {data.totalApplications}
              </div>
              <p className="text-xs" style={{ color: colors.secondaryText }}>Applications</p>
            </div>

            <div 
              className="p-4 rounded-lg border"
              style={{
                background: colors.badgeWarningBg,
                border: `1px solid ${colors.badgeWarningBorder}`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Activity size={18} style={{ color: colors.badgeWarningText }} />
                <span className="text-sm font-medium" style={{ color: colors.primaryText }}>Active</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.badgeWarningText }}>
                {data.activeApplications}
              </div>
              <p className="text-xs" style={{ color: colors.secondaryText }}>In Progress</p>
            </div>

            <div 
              className="p-4 rounded-lg border"
              style={{
                background: colors.badgeSuccessBg,
                border: `1px solid ${colors.badgeSuccessBorder}`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Users size={18} style={{ color: colors.successGreen }} />
                <span className="text-sm font-medium" style={{ color: colors.primaryText }}>Interviews</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.successGreen }}>
                {data.interviews}
              </div>
              <p className="text-xs" style={{ color: colors.secondaryText }}>Scheduled</p>
            </div>

            <div 
              className="p-4 rounded-lg border"
              style={{
                background: colors.badgeSuccessBg,
                border: `1px solid ${colors.badgeSuccessBorder}`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Award size={18} style={{ color: colors.successGreen }} />
                <span className="text-sm font-medium" style={{ color: colors.primaryText }}>Offers</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.successGreen }}>
                {data.offers}
              </div>
              <p className="text-xs" style={{ color: colors.secondaryText }}>Received</p>
            </div>

            <div 
              className="p-4 rounded-lg border"
              style={{
                background: colors.badgePurpleBg,
                border: `1px solid ${colors.badgePurpleBorder}`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={18} style={{ color: colors.badgePurpleText }} />
                <span className="text-sm font-medium" style={{ color: colors.primaryText }}>Rate</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.badgePurpleText }}>
                {data.acceptanceRate}%
              </div>
              <p className="text-xs" style={{ color: colors.secondaryText }}>Acceptance</p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div 
            className="rounded-xl p-6 mb-6 border"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.primaryText }}>
              <Target size={20} style={{ color: colors.badgePurpleText }} />
              Application Status Breakdown
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(data.byStatus).map(([status, count]) => (
                <div 
                  key={status} 
                  className="rounded-lg p-3 border"
                  style={{
                    background: colors.cardBackground,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <p className="text-xs font-medium uppercase mb-1" style={{ color: colors.secondaryText }}>
                    {status}
                  </p>
                  <p className="text-2xl font-bold" style={{ color: colors.primaryText }}>{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Industry Performance */}
            <div 
              className="rounded-xl p-6 border"
              style={{
                background: colors.cardBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.primaryText }}>
                <FileText size={20} style={{ color: colors.primaryBlue }} />
                By Industry
              </h4>
              <div className="space-y-4">
                {data.byIndustry.map((industry, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: colors.primaryText }}>
                        {industry.industry}
                      </span>
                      <span className="text-sm font-bold" style={{ color: colors.primaryBlue }}>
                        {industry.rate > 0 ? `${industry.rate}%` : '0%'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="flex-1 rounded-full h-2"
                        style={{ background: colors.inputBackground }}
                      >
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            background: colors.primaryBlue,
                            width: `${(industry.rate / 20) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs" style={{ color: colors.secondaryText }}>
                        {industry.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Trend */}
            <div 
              className="rounded-xl p-6 border"
              style={{
                background: colors.cardBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.primaryText }}>
                <TrendingUp size={20} style={{ color: colors.successGreen }} />
                Weekly Trend
              </h4>
              <div className="space-y-3">
                {data.weeklyApplications.map((week, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: colors.primaryText }}>
                        {week.week}
                      </span>
                      <span className="text-sm font-bold" style={{ color: colors.successGreen }}>
                        {week.count}
                      </span>
                    </div>
                    <div 
                      className="w-full rounded-full h-3"
                      style={{ background: colors.inputBackground }}
                    >
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{ 
                          background: colors.successGreen,
                          width: `${(week.count / 15) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div 
            className="mt-6 rounded-xl p-6 border"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.primaryText }}>
              <Activity size={20} style={{ color: colors.badgeWarningText }} />
              Recent Activity
            </h4>
            <div className="space-y-3">
              {data.recentActivity.map((activity) => {
                const getTypeColors = () => {
                  switch (activity.type) {
                    case 'Interview':
                      return { bg: colors.badgeSuccessBg, text: colors.successGreen };
                    case 'Offer':
                      return { bg: colors.badgeSuccessBg, text: colors.successGreen };
                    case 'Application':
                      return { bg: colors.badgeInfoBg, text: colors.primaryBlue };
                    case 'Rejection':
                      return { bg: colors.badgeErrorBg, text: colors.errorRed };
                    default:
                      return { bg: colors.badgePurpleBg, text: colors.badgePurpleText };
                  }
                };
                const typeColors = getTypeColors();
                
                return (
                  <div 
                    key={activity.id} 
                    className="flex items-center justify-between p-3 rounded-lg border transition-all"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.borderFocused;
                      e.currentTarget.style.background = colors.hoverBackground;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.background = colors.inputBackground;
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ background: typeColors.bg }}
                      >
                        <Calendar size={16} style={{ color: typeColors.text }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: colors.primaryText }}>
                          {activity.company}
                        </p>
                        <p className="text-xs" style={{ color: colors.secondaryText }}>
                          {activity.position}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm" style={{ color: colors.primaryText }}>{activity.type}</p>
                      <p className="text-xs" style={{ color: colors.tertiaryText }}>
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

