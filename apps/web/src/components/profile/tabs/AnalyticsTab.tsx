'use client';

import React from 'react';
import { Eye, FileText, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { UserData } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';

interface AnalyticsTabProps {
  userData: UserData;
}

export default function AnalyticsTab({ userData }: AnalyticsTabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 
          className="text-3xl font-bold mb-2"
          style={{ color: colors.primaryText }}
        >
          Profile Analytics
        </h2>
        <p 
          style={{ color: colors.secondaryText }}
        >
          Track your profile performance and job search metrics
        </p>
      </div>
      
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          className="p-6 rounded-2xl shadow-lg"
          style={{
            background: colors.badgeInfoBg,
            border: `1px solid ${colors.badgeInfoBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div 
              className="p-3 rounded-xl"
              style={{ background: colors.badgeInfoBg }}
            >
              <Eye size={24} style={{ color: colors.primaryBlue }} />
            </div>
            <div className="text-right">
              <p 
                className="text-2xl font-bold"
                style={{ color: colors.primaryText }}
              >
                {userData.profileViews.toLocaleString()}
              </p>
              <p 
                className="text-sm font-medium"
                style={{ color: colors.primaryBlue }}
              >
                +12% this month
              </p>
            </div>
          </div>
          <p 
            className="text-sm font-semibold"
            style={{ color: colors.secondaryText }}
          >
            Profile Views
          </p>
        </div>
        
        <div 
          className="p-6 rounded-2xl shadow-lg"
          style={{
            background: colors.badgeSuccessBg,
            border: `1px solid ${colors.badgeSuccessBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div 
              className="p-3 rounded-xl"
              style={{ background: colors.badgeSuccessBg }}
            >
              <FileText size={24} style={{ color: colors.successGreen }} />
            </div>
            <div className="text-right">
              <p 
                className="text-2xl font-bold"
                style={{ color: colors.primaryText }}
              >
                {userData.applicationsSent}
              </p>
              <p 
                className="text-sm font-medium"
                style={{ color: colors.successGreen }}
              >
                +3 this week
              </p>
            </div>
          </div>
          <p 
            className="text-sm font-semibold"
            style={{ color: colors.secondaryText }}
          >
            Applications Sent
          </p>
        </div>
        
        <div 
          className="p-6 rounded-2xl shadow-lg"
          style={{
            background: colors.badgeWarningBg,
            border: `1px solid ${colors.badgeWarningBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div 
              className="p-3 rounded-xl"
              style={{ background: colors.badgeWarningBg }}
            >
              <Calendar size={24} style={{ color: colors.badgeWarningText }} />
            </div>
            <div className="text-right">
              <p 
                className="text-2xl font-bold"
                style={{ color: colors.primaryText }}
              >
                {userData.interviewsScheduled}
              </p>
              <p 
                className="text-sm font-medium"
                style={{ color: colors.badgeWarningText }}
              >
                2 upcoming
              </p>
            </div>
          </div>
          <p 
            className="text-sm font-semibold"
            style={{ color: colors.secondaryText }}
          >
            Interviews
          </p>
        </div>
        
        <div 
          className="p-6 rounded-2xl shadow-lg"
          style={{
            background: colors.badgePurpleBg,
            border: `1px solid ${colors.badgePurpleBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div 
              className="p-3 rounded-xl"
              style={{ background: colors.badgePurpleBg }}
            >
              <TrendingUp size={24} style={{ color: colors.badgePurpleText }} />
            </div>
            <div className="text-right">
              <p 
                className="text-2xl font-bold"
                style={{ color: colors.primaryText }}
              >
                {userData.successRate}%
              </p>
              <p 
                className="text-sm font-medium"
                style={{ color: colors.badgePurpleText }}
              >
                Above average
              </p>
            </div>
          </div>
          <p 
            className="text-sm font-semibold"
            style={{ color: colors.secondaryText }}
          >
            Success Rate
          </p>
        </div>
      </div>

      {/* Additional Enhanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          className="p-6 rounded-2xl shadow-lg"
          style={{
            background: colors.badgeInfoBg,
            border: `1px solid ${colors.badgeInfoBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div 
              className="p-3 rounded-xl"
              style={{ background: colors.badgeInfoBg }}
            >
              <CheckCircle size={24} style={{ color: colors.primaryBlue }} />
            </div>
            <div className="text-right">
              <p 
                className="text-2xl font-bold"
                style={{ color: colors.primaryText }}
              >
                {userData.profileCompleteness}%
              </p>
              <p 
                className="text-sm font-medium"
                style={{ color: colors.primaryBlue }}
              >
                Complete
              </p>
            </div>
          </div>
          <p 
            className="text-sm font-semibold"
            style={{ color: colors.secondaryText }}
          >
            Profile Completeness
          </p>
        </div>
        
        <div 
          className="p-6 rounded-2xl shadow-lg"
          style={{
            background: colors.badgeSuccessBg,
            border: `1px solid ${colors.badgeSuccessBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div 
              className="p-3 rounded-xl"
              style={{ background: colors.badgeSuccessBg }}
            >
              <TrendingUp size={24} style={{ color: colors.successGreen }} />
            </div>
            <div className="text-right">
              <p 
                className="text-2xl font-bold"
                style={{ color: colors.primaryText }}
              >
                {userData.skillMatchRate}%
              </p>
              <p 
                className="text-sm font-medium"
                style={{ color: colors.successGreen }}
              >
                Match Rate
              </p>
            </div>
          </div>
          <p 
            className="text-sm font-semibold"
            style={{ color: colors.secondaryText }}
          >
            Skills Match
          </p>
        </div>
        
        <div 
          className="p-6 rounded-2xl shadow-lg"
          style={{
            background: colors.badgeWarningBg,
            border: `1px solid ${colors.badgeWarningBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div 
              className="p-3 rounded-xl"
              style={{ background: colors.badgeWarningBg }}
            >
              <Calendar size={24} style={{ color: colors.badgeWarningText }} />
            </div>
            <div className="text-right">
              <p 
                className="text-2xl font-bold"
                style={{ color: colors.primaryText }}
              >
                {userData.avgResponseTime}d
              </p>
              <p 
                className="text-sm font-medium"
                style={{ color: colors.badgeWarningText }}
              >
                Avg Response
              </p>
            </div>
          </div>
          <p 
            className="text-sm font-semibold"
            style={{ color: colors.secondaryText }}
          >
            Response Time
          </p>
        </div>
      </div>

      {/* Enhanced Performance Metrics */}
      <div 
        className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        }}
      >
        <h3 
          className="text-xl font-semibold mb-6"
          style={{ color: colors.primaryText }}
        >
          Profile Performance
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span 
                className="text-sm font-semibold"
                style={{ color: colors.primaryText }}
              >
                Profile Completeness
              </span>
              <span 
                className="text-sm font-bold"
                style={{ color: colors.primaryBlue }}
              >
                {userData.profileCompleteness}%
              </span>
            </div>
            <div 
              className="w-full rounded-full h-3"
              style={{ background: colors.inputBackground }}
            >
              <div 
                className="h-3 rounded-full transition-all duration-1000" 
                style={{ 
                  width: `${userData.profileCompleteness}%`,
                  background: `linear-gradient(90deg, ${colors.primaryBlue}, ${colors.badgeInfoText})`
                }}
              />
            </div>
            <p 
              className="text-xs mt-2"
              style={{ color: colors.tertiaryText }}
            >
              {userData.profileCompleteness < 70 ? 'Complete your profile to increase visibility by 40%' :
               userData.profileCompleteness < 85 ? 'Your profile is looking good! Complete a few more sections for optimal results.' :
               'Excellent! Your profile is complete and optimized'}
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <span 
                className="text-sm font-semibold"
                style={{ color: colors.primaryText }}
              >
                Skills Match Rate
              </span>
              <span 
                className="text-sm font-bold"
                style={{ color: colors.successGreen }}
              >
                {userData.skillMatchRate}%
              </span>
            </div>
            <div 
              className="w-full rounded-full h-3"
              style={{ background: colors.inputBackground }}
            >
              <div 
                className="h-3 rounded-full transition-all duration-1000" 
                style={{ 
                  width: `${userData.skillMatchRate}%`,
                  background: `linear-gradient(90deg, ${colors.successGreen}, ${colors.badgeSuccessText})`
                }}
              />
            </div>
            <p 
              className="text-xs mt-2"
              style={{ color: colors.tertiaryText }}
            >
              {userData.skillMatchRate >= 90 ? 'Your skills match excellently with current job openings!' :
               userData.skillMatchRate >= 75 ? 'Your skills match well with current opportunities' :
               'Consider adding more in-demand skills to improve your match rate'}
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <span 
                className="text-sm font-semibold"
                style={{ color: colors.primaryText }}
              >
                Average Response Time
              </span>
              <span 
                className="text-sm font-bold"
                style={{ color: colors.badgeWarningText }}
              >
                {userData.avgResponseTime} days
              </span>
            </div>
            <div 
              className="w-full rounded-full h-3"
              style={{ background: colors.inputBackground }}
            >
              <div 
                className="h-3 rounded-full transition-all duration-1000" 
                style={{ 
                  width: `${Math.min(100, userData.avgResponseTime * 10)}%`,
                  background: `linear-gradient(90deg, ${colors.badgeWarningText}, ${colors.errorRed})`
                }}
              />
            </div>
            <p 
              className="text-xs mt-2"
              style={{ color: colors.tertiaryText }}
            >
              {userData.avgResponseTime <= 2 ? 'Recruiters are responding quickly to your applications!' :
               userData.avgResponseTime <= 5 ? 'Response time is reasonable' :
               'Consider optimizing your applications for faster responses'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div 
        className="backdrop-blur-sm rounded-2xl p-8 shadow-lg mt-8"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        }}
      >
        <h3 
          className="text-xl font-semibold mb-6"
          style={{ color: colors.primaryText }}
        >
          Recent Activity
        </h3>
        <div className="space-y-4">
          <div 
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{
              background: colors.badgeInfoBg,
              border: `1px solid ${colors.badgeInfoBorder}`,
            }}
          >
            <div 
              className="p-2 rounded-lg"
              style={{ background: colors.badgeInfoBg }}
            >
              <Eye size={16} style={{ color: colors.primaryBlue }} />
            </div>
            <div className="flex-1">
              <p 
                className="text-sm font-medium"
                style={{ color: colors.primaryText }}
              >
                Profile viewed by TechCorp recruiter
              </p>
              <p 
                className="text-xs"
                style={{ color: colors.tertiaryText }}
              >
                2 hours ago
              </p>
            </div>
          </div>
          
          <div 
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{
              background: colors.badgeSuccessBg,
              border: `1px solid ${colors.badgeSuccessBorder}`,
            }}
          >
            <div 
              className="p-2 rounded-lg"
              style={{ background: colors.badgeSuccessBg }}
            >
              <FileText size={16} style={{ color: colors.successGreen }} />
            </div>
            <div className="flex-1">
              <p 
                className="text-sm font-medium"
                style={{ color: colors.primaryText }}
              >
                Application sent to Google
              </p>
              <p 
                className="text-xs"
                style={{ color: colors.tertiaryText }}
              >
                1 day ago
              </p>
            </div>
          </div>
          
          <div 
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{
              background: colors.badgeWarningBg,
              border: `1px solid ${colors.badgeWarningBorder}`,
            }}
          >
            <div 
              className="p-2 rounded-lg"
              style={{ background: colors.badgeWarningBg }}
            >
              <Calendar size={16} style={{ color: colors.badgeWarningText }} />
            </div>
            <div className="flex-1">
              <p 
                className="text-sm font-medium"
                style={{ color: colors.primaryText }}
              >
                Interview scheduled with Microsoft
              </p>
              <p 
                className="text-xs"
                style={{ color: colors.tertiaryText }}
              >
                3 days ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
