'use client';

import React, { useState } from 'react';
import { TrendingUp, Mail, Send, Inbox, Reply, Clock, User, CheckCircle, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface EmailAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EmailStat {
  totalSent: number;
  totalReceived: number;
  responseRate: number;
  averageResponseTime: string;
  openedEmails: number;
  repliedEmails: number;
  topPerformers: Array<{
    type: string;
    count: number;
    rate: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'sent' | 'received' | 'reply' | 'opened';
    subject: string;
    timestamp: string;
    status: 'success' | 'pending' | 'failed';
  }>;
}

export default function EmailAnalytics({ isOpen, onClose }: EmailAnalyticsProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [stats] = useState<EmailStat>({
    totalSent: 142,
    totalReceived: 89,
    responseRate: 62.7,
    averageResponseTime: '2.5 hours',
    openedEmails: 128,
    repliedEmails: 92,
    topPerformers: [
      { type: 'Follow-up Emails', count: 45, rate: 75.5 },
      { type: 'Initial Inquiries', count: 38, rate: 68.2 },
      { type: 'Thank You Notes', count: 52, rate: 85.3 }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'sent',
        subject: 'Follow-up on Application - TechCorp',
        timestamp: '2024-10-20T14:30:00Z',
        status: 'success'
      },
      {
        id: '2',
        type: 'opened',
        subject: 'Interview Confirmation - StartupXYZ',
        timestamp: '2024-10-20T11:15:00Z',
        status: 'success'
      },
      {
        id: '3',
        type: 'reply',
        subject: 'Re: Application Status - DataTech Inc',
        timestamp: '2024-10-19T16:45:00Z',
        status: 'success'
      }
    ]
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto" style={{ background: colors.cardBackground, border: `1px solid ${colors.border}` }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: `${colors.primaryBlue}20` }}>
              <TrendingUp size={24} style={{ color: colors.primaryBlue }} />
            </div>
            <div>
              <h3 className="text-xl font-semibold" style={{ color: colors.primaryText }}>Email Effectiveness</h3>
              <p className="text-sm" style={{ color: colors.secondaryText }}>Track your email communication performance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            title="Close"
            aria-label="Close analytics modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg border" style={{ background: `${colors.primaryBlue}20`, borderColor: `${colors.primaryBlue}40` }}>
            <div className="flex items-center gap-2 mb-1">
              <Send size={18} style={{ color: colors.primaryBlue }} />
              <span className="text-sm font-medium" style={{ color: colors.secondaryText }}>Sent</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: colors.primaryBlue }}>{stats.totalSent}</div>
          </div>

          <div className="p-4 rounded-lg border" style={{ background: `${colors.badgeSuccessBg}20`, borderColor: `${colors.badgeSuccessBorder}40` }}>
            <div className="flex items-center gap-2 mb-1">
              <Inbox size={18} style={{ color: colors.badgeSuccessText }} />
              <span className="text-sm font-medium" style={{ color: colors.secondaryText }}>Received</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: colors.badgeSuccessText }}>{stats.totalReceived}</div>
          </div>

          <div className="p-4 rounded-lg border" style={{ background: `${colors.badgePurpleBg}20`, borderColor: `${colors.badgePurpleBorder}40` }}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} style={{ color: colors.badgePurpleText }} />
              <span className="text-sm font-medium" style={{ color: colors.secondaryText }}>Response Rate</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: colors.badgePurpleText }}>{stats.responseRate}%</div>
          </div>

          <div className="p-4 rounded-lg border" style={{ background: `${colors.badgeWarningBg}20`, borderColor: `${colors.badgeWarningBorder}40` }}>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={18} style={{ color: colors.badgeWarningText }} />
              <span className="text-sm font-medium" style={{ color: colors.secondaryText }}>Avg Response</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: colors.badgeWarningText }}>{stats.averageResponseTime}</div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ color: colors.primaryText }}>Top Performers</h4>
            <div className="space-y-3">
              {stats.topPerformers.map((performer, idx) => (
                <div key={idx} className="rounded-lg p-4 border" style={{ background: colors.cardBackground, borderColor: colors.border }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: colors.secondaryText }}>{performer.type}</span>
                    <span className="text-sm font-bold" style={{ color: colors.badgePurpleText }}>{performer.rate}%</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: colors.inputBackground }}>
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${performer.rate}%`, background: colors.badgePurpleText }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: colors.tertiaryText }}>{performer.count} emails sent</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ color: colors.primaryText }}>Recent Activity</h4>
            <div className="space-y-2">
              {stats.recentActivity.map(activity => (
                <div key={activity.id} className="rounded-lg p-3 border" style={{ background: colors.cardBackground, borderColor: colors.border }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {activity.type === 'sent' && <Send size={14} style={{ color: colors.primaryBlue }} />}
                      {activity.type === 'received' && <Inbox size={14} style={{ color: colors.badgeSuccessText }} />}
                      {activity.type === 'reply' && <Reply size={14} style={{ color: colors.badgePurpleText }} />}
                      {activity.type === 'opened' && <Mail size={14} style={{ color: colors.badgeWarningText }} />}
                      <span className="text-sm font-medium capitalize" style={{ color: colors.primaryText }}>{activity.type}</span>
                    </div>
                    {activity.status === 'success' && (
                      <CheckCircle size={14} style={{ color: colors.badgeSuccessText }} />
                    )}
                  </div>
                  <p className="text-sm truncate" style={{ color: colors.secondaryText }}>{activity.subject}</p>
                  <p className="text-xs mt-1" style={{ color: colors.tertiaryText }}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
