'use client';

import React from 'react';
import { BarChart3, Mail, Send, Reply, Clock, TrendingUp } from 'lucide-react';

export default function AnalyticsTab() {
  const stats = {
    totalEmails: 156,
    sentEmails: 89,
    receivedEmails: 67,
    replyRate: 72,
    avgResponseTime: '2.5 hours',
  };

  const metrics = [
    { label: 'Total Emails', value: stats.totalEmails, icon: Mail, color: 'bg-blue-100 text-blue-700' },
    { label: 'Sent', value: stats.sentEmails, icon: Send, color: 'bg-green-100 text-green-700' },
    { label: 'Received', value: stats.receivedEmails, icon: Mail, color: 'bg-purple-100 text-purple-700' },
    { label: 'Reply Rate', value: `${stats.replyRate}%`, icon: Reply, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Avg Response Time', value: stats.avgResponseTime, icon: Clock, color: 'bg-pink-100 text-pink-700' },
  ];

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Analytics</h2>
          <p className="text-gray-600">Track your email performance and communication insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className={`w-12 h-12 rounded-lg ${metric.color} flex items-center justify-center mb-3`}>
                  <Icon size={20} />
                </div>
                <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Email Activity</h3>
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <BarChart3 size={48} />
                <p className="mt-2 text-sm">Chart visualization</p>
                <p className="text-xs">Coming soon</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Reply Rate Trend</h3>
            <div className="flex items-center justify-center h-64 text-gray-400">
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
