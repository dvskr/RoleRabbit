'use client';

import React from 'react';
import { Eye, FileText, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { useProfile } from '../../../contexts/ProfileContext';
import { useTheme } from '../../../contexts/ThemeContext';

interface ProfileAnalyticsProps {
  isLoading?: boolean;
}

export function ProfileAnalytics({ isLoading }: ProfileAnalyticsProps) {
  const { userData } = useProfile();
  const { theme } = useTheme();
  const colors = theme.colors;

  if (isLoading || !userData) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-sm" style={{ color: colors.secondaryText }}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <h3 
            className="text-lg font-semibold mb-1"
            style={{ color: colors.primaryText }}
          >
            Profile Analytics
          </h3>
          <p 
            className="text-xs"
            style={{ color: colors.secondaryText }}
          >
            Track your profile performance and metrics
          </p>
        </div>
        
        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div 
            className="p-4 rounded-xl shadow-sm"
            style={{
              background: colors.badgeInfoBg,
              border: `1px solid ${colors.badgeInfoBorder}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div 
                className="p-2 rounded-lg"
                style={{ background: colors.badgeInfoBg }}
              >
                <Eye size={16} style={{ color: colors.primaryBlue }} />
              </div>
              <div className="text-right">
                <p 
                  className="text-lg font-bold"
                  style={{ color: colors.primaryText }}
                  title={(userData.profileViews || 0).toLocaleString()}
                >
                  {(userData.profileViews || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <p 
              className="text-xs font-semibold truncate"
              style={{ color: colors.secondaryText }}
            >
              Profile Views
            </p>
          </div>
          
          <div 
            className="p-4 rounded-xl shadow-sm"
            style={{
              background: colors.badgePurpleBg,
              border: `1px solid ${colors.badgePurpleBorder}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div 
                className="p-2 rounded-lg"
                style={{ background: colors.badgePurpleBg }}
              >
                <TrendingUp size={16} style={{ color: colors.badgePurpleText }} />
              </div>
              <div className="text-right">
                <p 
                  className="text-lg font-bold"
                  style={{ color: colors.primaryText }}
                  title={`${userData.successRate || 0}%`}
                >
                  {userData.successRate || 0}%
                </p>
              </div>
            </div>
            <p 
              className="text-xs font-semibold truncate"
              style={{ color: colors.secondaryText }}
            >
              Success Rate
            </p>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div 
            className="p-3 rounded-lg"
            style={{
              background: colors.badgeInfoBg,
              border: `1px solid ${colors.badgeInfoBorder}`,
            }}
          >
            <div className="flex items-center justify-center mb-1">
              <CheckCircle size={14} style={{ color: colors.primaryBlue }} />
            </div>
            <p 
              className="text-center text-sm font-bold"
              style={{ color: colors.primaryText }}
              title={`${userData.profileCompleteness || 0}%`}
            >
              {userData.profileCompleteness || 0}%
            </p>
            <p 
              className="text-center text-[10px] truncate"
              style={{ color: colors.secondaryText }}
            >
              Complete
            </p>
          </div>
          
          <div 
            className="p-3 rounded-lg"
            style={{
              background: colors.badgeSuccessBg,
              border: `1px solid ${colors.badgeSuccessBorder}`,
            }}
          >
            <div className="flex items-center justify-center mb-1">
              <TrendingUp size={14} style={{ color: colors.successGreen }} />
            </div>
            <p 
              className="text-center text-sm font-bold"
              style={{ color: colors.primaryText }}
              title={`${userData.skillMatchRate || 0}%`}
            >
              {userData.skillMatchRate || 0}%
            </p>
            <p 
              className="text-center text-[10px] truncate"
              style={{ color: colors.secondaryText }}
            >
              Skill Match
            </p>
          </div>
          
          <div 
            className="p-3 rounded-lg"
            style={{
              background: colors.badgeWarningBg,
              border: `1px solid ${colors.badgeWarningBorder}`,
            }}
          >
            <div className="flex items-center justify-center mb-1">
              <Calendar size={14} style={{ color: colors.badgeWarningText }} />
            </div>
            <p 
              className="text-center text-sm font-bold"
              style={{ color: colors.primaryText }}
              title={`${userData.avgResponseTime || 0}d`}
            >
              {userData.avgResponseTime || 0}d
            </p>
            <p 
              className="text-center text-[10px] truncate"
              style={{ color: colors.secondaryText }}
            >
              Response
            </p>
          </div>
        </div>

        {/* Profile Performance Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span 
                className="text-xs font-semibold"
                style={{ color: colors.primaryText }}
              >
                Profile Completeness
              </span>
              <span 
                className="text-xs font-bold"
                style={{ color: colors.primaryBlue }}
              >
                {userData.profileCompleteness || 0}%
              </span>
            </div>
            <div 
              className="w-full rounded-full h-2"
              style={{ background: colors.inputBackground }}
            >
              <div 
                className="h-2 rounded-full transition-all duration-1000" 
                style={{ 
                  width: `${userData.profileCompleteness || 0}%`,
                  background: `linear-gradient(90deg, ${colors.primaryBlue}, ${colors.badgeInfoText})`
                }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span 
                className="text-xs font-semibold"
                style={{ color: colors.primaryText }}
              >
                Skills Match Rate
              </span>
              <span 
                className="text-xs font-bold"
                style={{ color: colors.successGreen }}
              >
                {userData.skillMatchRate || 0}%
              </span>
            </div>
            <div 
              className="w-full rounded-full h-2"
              style={{ background: colors.inputBackground }}
            >
              <div 
                className="h-2 rounded-full transition-all duration-1000" 
                style={{ 
                  width: `${userData.skillMatchRate || 0}%`,
                  background: `linear-gradient(90deg, ${colors.successGreen}, ${colors.badgeSuccessText})`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

