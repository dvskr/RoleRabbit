'use client';

import React, { useState } from 'react';
import { TrendingUp, Target, CheckCircle, Clock, FileText, Calendar, X } from 'lucide-react';

interface CoverLetterAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CoverLetterStat {
  id: string;
  title: string;
  industry: string;
  sentDate: string;
  outcome: 'interview' | 'rejection' | 'pending';
  interviewDate?: string;
  position: string;
  company: string;
}

export default function CoverLetterAnalytics({ isOpen, onClose }: CoverLetterAnalyticsProps) {
  const [stats] = useState<CoverLetterStat[]>([
    {
      id: '1',
      title: 'Senior Developer Position',
      industry: 'Technology',
      sentDate: '2024-10-15',
      outcome: 'interview',
      interviewDate: '2024-10-22',
      position: 'Senior Developer',
      company: 'TechCorp'
    },
    {
      id: '2',
      title: 'Product Manager Role',
      industry: 'Product',
      sentDate: '2024-10-12',
      outcome: 'rejection',
      position: 'Product Manager',
      company: 'StartupXYZ'
    },
    {
      id: '3',
      title: 'Data Engineer Position',
      industry: 'Data',
      sentDate: '2024-10-18',
      outcome: 'pending',
      position: 'Data Engineer',
      company: 'DataTech Inc'
    }
  ]);

  const totalSent = stats.length;
  const interviews = stats.filter(s => s.outcome === 'interview').length;
  const rejections = stats.filter(s => s.outcome === 'rejection').length;
  const pending = stats.filter(s => s.outcome === 'pending').length;
  const successRate = totalSent > 0 ? ((interviews / totalSent) * 100).toFixed(1) : '0';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto" style={{ 
        background: '#2a1b4d',
        border: '1px solid #3d2a5f'
      }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Cover Letter Performance</h3>
              <p className="text-sm text-gray-600">Track your cover letter effectiveness</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close cover letter analytics"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Total Sent</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{totalSent}</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={18} className="text-green-600" />
              <span className="text-sm font-medium text-gray-700">Interviews</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{interviews}</div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <Target size={18} className="text-red-600" />
              <span className="text-sm font-medium text-gray-700">Rejections</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{rejections}</div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={18} className="text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Pending</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{pending}</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} className="text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{successRate}%</div>
          </div>
        </div>

        {/* Letter Tracking */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Letters</h4>
          <div className="space-y-3">
            {stats.map(stat => (
              <div key={stat.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h5 className="font-semibold text-gray-900">{stat.position}</h5>
                    <p className="text-sm text-gray-600">{stat.company}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    stat.outcome === 'interview' ? 'bg-green-100 text-green-700' :
                    stat.outcome === 'rejection' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {stat.outcome.charAt(0).toUpperCase() + stat.outcome.slice(1)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Sent: {new Date(stat.sentDate).toLocaleDateString()}</span>
                  </div>
                  {stat.interviewDate && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={14} />
                      <span>Interview: {new Date(stat.interviewDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
