'use client';

import React, { useState } from 'react';
import { TrendingUp, Mail, Send, Inbox, Reply, Clock, User, CheckCircle, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp size={24} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Email Effectiveness</h3>
              <p className="text-sm text-gray-600">Track your email communication performance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Send size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Sent</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalSent}</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <Inbox size={18} className="text-green-600" />
              <span className="text-sm font-medium text-gray-700">Received</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.totalReceived}</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} className="text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Response Rate</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.responseRate}%</div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={18} className="text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Avg Response</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.averageResponseTime}</div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h4>
            <div className="space-y-3">
              {stats.topPerformers.map((performer, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{performer.type}</span>
                    <span className="text-sm font-bold text-indigo-600">{performer.rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${performer.rate}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{performer.count} emails sent</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
            <div className="space-y-2">
              {stats.recentActivity.map(activity => (
                <div key={activity.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {activity.type === 'sent' && <Send size={14} className="text-blue-600" />}
                      {activity.type === 'received' && <Inbox size={14} className="text-green-600" />}
                      {activity.type === 'reply' && <Reply size={14} className="text-purple-600" />}
                      {activity.type === 'opened' && <Mail size={14} className="text-orange-600" />}
                      <span className="text-sm font-medium text-gray-900 capitalize">{activity.type}</span>
                    </div>
                    {activity.status === 'success' && (
                      <CheckCircle size={14} className="text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{activity.subject}</p>
                  <p className="text-xs text-gray-400 mt-1">
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
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}
