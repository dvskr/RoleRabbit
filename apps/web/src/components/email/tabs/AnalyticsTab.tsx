'use client';

import React from 'react';
import { BarChart3, Mail, Send, Reply, Clock, TrendingUp } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function AnalyticsTab() {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const stats = {
    totalEmails: 156,
    sentEmails: 89,
    receivedEmails: 67,
    replyRate: 72,
    avgResponseTime: '2.5 hours',
  };

  const metrics = [
    { label: 'Total Emails', value: stats.totalEmails, icon: Mail, bgColor: colors.badgeInfoBg, textColor: colors.badgeInfoText },
    { label: 'Sent', value: stats.sentEmails, icon: Send, bgColor: colors.badgeSuccessBg, textColor: colors.badgeSuccessText },
    { label: 'Received', value: stats.receivedEmails, icon: Mail, bgColor: colors.badgePurpleBg, textColor: colors.badgePurpleText },
    { label: 'Reply Rate', value: `${stats.replyRate}%`, icon: Reply, bgColor: colors.badgeWarningBg, textColor: colors.badgeWarningText },
    { label: 'Avg Response Time', value: stats.avgResponseTime, icon: Clock, bgColor: colors.badgeErrorBg, textColor: colors.badgeErrorText },
  ];

  return (
    <div className="h-full overflow-y-auto p-8" style={{ background: colors.background }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primaryText }}>Email Analytics</h2>
          <p style={{ color: colors.secondaryText }}>Track your email performance and communication insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div 
                key={idx} 
                className="rounded-lg p-6"
                style={{
                  background: colors.cardBackground,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                  style={{
                    background: metric.bgColor,
                    color: metric.textColor,
                  }}
                >
                  <Icon size={20} />
                </div>
                <p className="text-sm mb-1" style={{ color: colors.secondaryText }}>{metric.label}</p>
                <p className="text-2xl font-bold" style={{ color: colors.primaryText }}>{metric.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            className="rounded-lg p-6"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h3 className="font-semibold mb-4" style={{ color: colors.primaryText }}>Email Activity</h3>
            <div className="flex items-center justify-center h-64" style={{ color: colors.tertiaryText }}>
              <div className="text-center">
                <BarChart3 size={48} />
                <p className="mt-2 text-sm">Chart visualization</p>
                <p className="text-xs">Coming soon</p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-lg p-6"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h3 className="font-semibold mb-4" style={{ color: colors.primaryText }}>Reply Rate Trend</h3>
            <div className="flex items-center justify-center h-64" style={{ color: colors.tertiaryText }}>
              <div className="text-center">
                <TrendingUp size={48} />
                <p className="mt-2 text-sm">Chart visualization</p>
                <p className="text-xs">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
