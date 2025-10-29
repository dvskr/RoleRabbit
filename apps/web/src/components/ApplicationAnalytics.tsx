'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  CheckCircle, 
  Clock, 
  FileText, 
  Calendar, 
  X, 
  Briefcase,
  Award,
  Send,
  Users,
  BarChart3,
  Activity,
  DollarSign
} from 'lucide-react';

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
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('all');
  
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Application Analytics</h3>
                <p className="text-sm text-gray-600">Track your job search progress and effectiveness</p>
              </div>
            </div>
            
            {/* Timeframe Filter */}
            <div className="flex items-center gap-2">
              {(['week', 'month', 'all'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeframe === period
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase size={18} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Total</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{data.totalApplications}</div>
              <p className="text-xs text-gray-500">Applications</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={18} className="text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{data.activeApplications}</div>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Users size={18} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">Interviews</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{data.interviews}</div>
              <p className="text-xs text-gray-500">Scheduled</p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2 mb-1">
                <Award size={18} className="text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Offers</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">{data.offers}</div>
              <p className="text-xs text-gray-500">Received</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={18} className="text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Rate</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{data.acceptanceRate}%</div>
              <p className="text-xs text-gray-500">Acceptance</p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target size={20} className="text-purple-600" />
              Application Status Breakdown
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(data.byStatus).map(([status, count]) => (
                <div key={status} className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">{status}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Industry Performance */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-indigo-600" />
                By Industry
              </h4>
              <div className="space-y-4">
                {data.byIndustry.map((industry, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{industry.industry}</span>
                      <span className="text-sm font-bold text-indigo-600">
                        {industry.rate > 0 ? `${industry.rate}%` : '0%'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${(industry.rate / 20) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{industry.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Trend */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-600" />
                Weekly Trend
              </h4>
              <div className="space-y-3">
                {data.weeklyApplications.map((week, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{week.week}</span>
                      <span className="text-sm font-bold text-green-600">{week.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${(week.count / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-orange-600" />
              Recent Activity
            </h4>
            <div className="space-y-3">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'Interview' ? 'bg-green-100' :
                      activity.type === 'Offer' ? 'bg-emerald-100' :
                      activity.type === 'Application' ? 'bg-blue-100' :
                      activity.type === 'Rejection' ? 'bg-red-100' :
                      'bg-purple-100'
                    }`}>
                      <Calendar size={16} className={
                        activity.type === 'Interview' ? 'text-green-600' :
                        activity.type === 'Offer' ? 'text-emerald-600' :
                        activity.type === 'Application' ? 'text-blue-600' :
                        activity.type === 'Rejection' ? 'text-red-600' :
                        'text-purple-600'
                      } />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{activity.company}</p>
                      <p className="text-xs text-gray-600">{activity.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{activity.type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

