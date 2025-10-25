'use client';

import React from 'react';
import { Eye, FileText, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { UserData } from '../types/profile';

interface AnalyticsTabProps {
  userData: UserData;
}

export default function AnalyticsTab({ userData }: AnalyticsTabProps) {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
          Profile Analytics
        </h2>
        <p className="text-gray-600">Track your profile performance and job search metrics</p>
      </div>
      
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border border-blue-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Eye size={24} className="text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-900">{userData.profileViews.toLocaleString()}</p>
              <p className="text-sm text-blue-600 font-medium">+12% this month</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700">Profile Views</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border border-green-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <FileText size={24} className="text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-900">{userData.applicationsSent}</p>
              <p className="text-sm text-green-600 font-medium">+3 this week</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700">Applications Sent</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-6 rounded-2xl border border-yellow-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Calendar size={24} className="text-yellow-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-yellow-900">{userData.interviewsScheduled}</p>
              <p className="text-sm text-yellow-600 font-medium">2 upcoming</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700">Interviews</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-2xl border border-purple-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-900">{userData.successRate}%</p>
              <p className="text-sm text-purple-600 font-medium">Above average</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700">Success Rate</p>
        </div>
      </div>

      {/* Enhanced Performance Metrics */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Profile Performance</h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">Profile Completeness</span>
              <span className="text-sm font-bold text-blue-600">85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Complete your profile to increase visibility by 40%</p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">Skills Match Rate</span>
              <span className="text-sm font-bold text-green-600">92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000" style={{ width: '92%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Your skills match well with current job openings</p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">Response Rate</span>
              <span className="text-sm font-bold text-yellow-600">78%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-1000" style={{ width: '78%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Recruiters respond to your applications frequently</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200/50">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Profile viewed by TechCorp recruiter</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200/50">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText size={16} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Application sent to Google</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200/50">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar size={16} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Interview scheduled with Microsoft</p>
              <p className="text-xs text-gray-500">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
