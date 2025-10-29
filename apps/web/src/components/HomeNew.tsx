'use client';

import React from 'react';
import {
  FileText,
  Briefcase,
  Mail,
  TrendingUp,
  CheckCircle,
  Clock,
  Target,
  ArrowRight,
  Eye,
  Download,
  Edit,
  Plus
} from 'lucide-react';
import DashboardHeader from './DashboardHeader';

interface HomeProps {
  enableMissionControl?: boolean;
  dashboardConfig?: any;
  onQuickAction?: (actionId: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenApplicationAnalytics?: () => void;
}

export default function HomeNew({ 
  enableMissionControl = false,
  dashboardConfig,
  onQuickAction,
  onNavigateToTab,
  onOpenApplicationAnalytics
}: HomeProps) {
  // Mission Control disabled for faster startup - no blocking require()
  // if (enableMissionControl) {
  //   // Disabled to prevent blocking
  // }

  // Mock data for widgets
  const stats = [
    { label: 'Active Jobs', value: '12', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Resumes', value: '5', icon: FileText, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Interviews', value: '3', icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Response Rate', value: '68%', icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  const recentActivity = [
    { type: 'application', text: 'Applied to Software Engineer at Google', time: '2 hours ago', icon: CheckCircle },
    { type: 'interview', text: 'Interview scheduled with Microsoft', time: '1 day ago', icon: Clock },
    { type: 'profile', text: 'Updated your profile', time: '2 days ago', icon: Edit },
  ];

  const quickActions = [
    { label: 'Build Resume', icon: FileText, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { label: 'Track Job', icon: Briefcase, color: 'bg-gradient-to-br from-green-500 to-green-600' },
    { label: 'View Analytics', icon: Eye, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    { label: 'New Application', icon: Plus, color: 'bg-gradient-to-br from-orange-500 to-orange-600' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0A0E14]">
      {/* Header */}
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Overview of your job search journey"
      />

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-[#1A1F26] border border-[#27272A] rounded-lg p-6 hover:border-[#34B27B]/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                      <Icon size={24} className={stat.color} />
                    </div>
                  </div>
                  <p className="text-sm text-[#A0A0A0] mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Activity */}
              <div className="bg-[#1A1F26] border border-[#27272A] rounded-lg">
                <div className="p-4 border-b border-[#27272A]">
                  <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
                </div>
                <div className="p-4 space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className="p-2 bg-[#0D1117] rounded-lg">
                          <Icon size={18} className="text-[#A0A0A0]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white">{activity.text}</p>
                          <p className="text-xs text-[#6B7280] mt-1">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Widget */}
              <div className="bg-[#1A1F26] border border-[#27272A] rounded-lg p-6">
                <h3 className="text-sm font-semibold text-white mb-4">This Week's Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#A0A0A0]">Applications</span>
                      <span className="text-white font-semibold">8/12</span>
                    </div>
                    <div className="h-2 bg-[#0D1117] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: '67%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#A0A0A0]">Interviews</span>
                      <span className="text-white font-semibold">3/5</span>
                    </div>
                    <div className="h-2 bg-[#0D1117] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="space-y-6">
              <div className="bg-[#1A1F26] border border-[#27272A] rounded-lg p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        className={`${action.color} p-4 rounded-lg text-white hover:shadow-lg transition-all`}
                        onClick={() => onNavigateToTab?.(action.label.toLowerCase().replace(' ', '-'))}
                      >
                        <Icon size={24} className="mb-2" />
                        <p className="text-xs font-medium text-center">{action.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tips Widget */}
              <div className="bg-gradient-to-br from-[#34B27B]/10 to-[#3ECF8E]/10 border border-[#34B27B]/20 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-[#34B27B] mb-3">💡 Tip of the Day</h3>
                <p className="text-sm text-[#A0A0A0]">
                  Tailor your resume for each job application. ATS systems scan for keywords from the job description.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

