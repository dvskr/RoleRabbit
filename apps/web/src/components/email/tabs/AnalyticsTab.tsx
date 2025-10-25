'use client';

import React from 'react';
import { BarChart3, TrendingUp, Mail, Eye, Reply, MousePointer, Calendar, Target } from 'lucide-react';

export default function AnalyticsTab() {
  // Mock data - in real app, this would come from props or API
  const analytics = {
    totalEmails: 245,
    totalSent: 180,
    totalOpened: 127,
    totalReplied: 34,
    totalClicked: 89,
    openRate: 70.6,
    replyRate: 18.9,
    clickRate: 49.4,
    avgResponseTime: '2.3 days'
  };

  const weeklyData = [
    { week: 'Week 1', sent: 45, opened: 32, replied: 8, clicked: 22 },
    { week: 'Week 2', sent: 52, opened: 38, replied: 12, clicked: 28 },
    { week: 'Week 3', sent: 38, opened: 29, replied: 7, clicked: 18 },
    { week: 'Week 4', sent: 45, opened: 28, replied: 7, clicked: 21 }
  ];

  const topTemplates = [
    { name: 'Cold Outreach - Software Engineer', sent: 45, openRate: 85, replyRate: 22 },
    { name: 'Follow-up After Application', sent: 38, openRate: 72, replyRate: 18 },
    { name: 'Thank You After Interview', sent: 25, openRate: 90, replyRate: 28 },
    { name: 'Networking Introduction', sent: 22, openRate: 68, replyRate: 15 }
  ];

  const topCompanies = [
    { name: 'TechCorp', sent: 12, replied: 4, replyRate: 33 },
    { name: 'StartupIO', sent: 8, replied: 3, replyRate: 38 },
    { name: 'BigCorp', sent: 15, replied: 2, replyRate: 13 },
    { name: 'InnovateCo', sent: 6, replied: 2, replyRate: 33 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Email Analytics</h2>
          <p className="text-sm text-gray-600">Track your email performance and engagement</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
            <Calendar size={14} className="inline mr-1" />
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Total Sent</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{analytics.totalSent}</p>
          <p className="text-xs text-blue-600">+12% from last month</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={16} className="text-green-600" />
            <span className="text-sm font-semibold text-green-900">Open Rate</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{analytics.openRate}%</p>
          <p className="text-xs text-green-600">+3.2% from last month</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Reply size={16} className="text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">Reply Rate</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{analytics.replyRate}%</p>
          <p className="text-xs text-purple-600">+1.8% from last month</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer size={16} className="text-orange-600" />
            <span className="text-sm font-semibold text-orange-900">Click Rate</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">{analytics.clickRate}%</p>
          <p className="text-xs text-orange-600">+2.1% from last month</p>
        </div>
      </div>

      {/* Weekly Performance Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Weekly Performance</h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Sent</span>
            <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
            <span className="text-sm text-gray-600">Opened</span>
            <div className="w-3 h-3 bg-purple-500 rounded-full ml-4"></div>
            <span className="text-sm text-gray-600">Replied</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {weeklyData.map((week, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 text-sm font-medium text-gray-700">{week.week}</div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div 
                    className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(week.sent / 60) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">{week.sent}</span>
                  </div>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div 
                    className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(week.opened / 60) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">{week.opened}</span>
                  </div>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div 
                    className="bg-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(week.replied / 60) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">{week.replied}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Templates */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Templates</h3>
        <div className="space-y-3">
          {topTemplates.map((template, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <p className="text-sm text-gray-600">{template.sent} emails sent</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-sm font-semibold text-green-600">{template.openRate}%</p>
                  <p className="text-xs text-gray-500">Open Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-purple-600">{template.replyRate}%</p>
                  <p className="text-xs text-gray-500">Reply Rate</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Companies */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Companies by Response</h3>
        <div className="space-y-3">
          {topCompanies.map((company, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{company.name}</h4>
                <p className="text-sm text-gray-600">{company.sent} emails sent, {company.replied} replies</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-purple-600">{company.replyRate}%</p>
                <p className="text-xs text-gray-500">Reply Rate</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Response Time */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Average Response Time</h3>
            <p className="text-sm text-gray-600">Time between sending and receiving a reply</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{analytics.avgResponseTime}</p>
            <p className="text-sm text-gray-500">days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
