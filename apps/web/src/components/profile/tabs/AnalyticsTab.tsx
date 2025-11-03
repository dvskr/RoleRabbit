'use client';

import React from 'react';
import { Eye, CheckCircle } from 'lucide-react';
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
      
      {/* Profile Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div 
          className="p-4 sm:p-6 rounded-2xl shadow-lg"
          style={{
            background: colors.badgeInfoBg,
            border: `1px solid ${colors.badgeInfoBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div 
              className="p-2 sm:p-3 rounded-xl flex-shrink-0"
              style={{ background: colors.badgeInfoBg }}
            >
              <Eye size={20} className="sm:w-6 sm:h-6" style={{ color: colors.primaryBlue }} />
            </div>
            <div className="text-right min-w-0 flex-1 ml-2">
              <p 
                className="text-xl sm:text-2xl font-bold truncate"
                style={{ color: colors.primaryText }}
                title={(userData.profileViews || 0).toLocaleString()}
              >
                {(userData.profileViews || 0).toLocaleString()}
              </p>
              <p 
                className="text-xs sm:text-sm font-medium truncate"
                style={{ color: colors.primaryBlue }}
              >
                Total Views
              </p>
            </div>
          </div>
          <p 
            className="text-xs sm:text-sm font-semibold truncate"
            style={{ color: colors.secondaryText }}
          >
            Profile Views
          </p>
        </div>
        
        <div 
          className="p-4 sm:p-6 rounded-2xl shadow-lg"
          style={{
            background: colors.badgeInfoBg,
            border: `1px solid ${colors.badgeInfoBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div 
              className="p-2 sm:p-3 rounded-xl flex-shrink-0"
              style={{ background: colors.badgeInfoBg }}
            >
              <CheckCircle size={20} className="sm:w-6 sm:h-6" style={{ color: colors.primaryBlue }} />
            </div>
            <div className="text-right min-w-0 flex-1 ml-2">
              <p 
                className="text-xl sm:text-2xl font-bold truncate"
                style={{ color: colors.primaryText }}
                title={`${userData.profileCompleteness || 0}%`}
              >
                {userData.profileCompleteness || 0}%
              </p>
              <p 
                className="text-xs sm:text-sm font-medium truncate"
                style={{ color: colors.primaryBlue }}
              >
                Complete
              </p>
            </div>
          </div>
          <p 
            className="text-xs sm:text-sm font-semibold truncate"
            style={{ color: colors.secondaryText }}
          >
            Profile Completeness
          </p>
        </div>
      </div>

      {/* Profile Completeness Detail */}
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
          Profile Completeness
        </h3>
        <div>
          <div className="flex justify-between items-center mb-3">
            <span 
              className="text-sm font-semibold"
              style={{ color: colors.primaryText }}
            >
              Completion Progress
            </span>
            <span 
              className="text-sm font-bold"
              style={{ color: colors.primaryBlue }}
            >
              {userData.profileCompleteness || 0}%
            </span>
          </div>
          <div 
            className="w-full rounded-full h-3"
            style={{ background: colors.inputBackground }}
          >
            <div 
              className="h-3 rounded-full transition-all duration-1000" 
              style={{ 
                width: `${userData.profileCompleteness || 0}%`,
                background: `linear-gradient(90deg, ${colors.primaryBlue}, ${colors.badgeInfoText})`
              }}
            />
          </div>
          <p 
            className="text-xs mt-2"
            style={{ color: colors.tertiaryText }}
          >
            {(userData.profileCompleteness || 0) < 70 ? 'Complete your profile to get the most out of RoleReady' :
             (userData.profileCompleteness || 0) < 85 ? 'Your profile is looking good! Complete a few more sections.' :
             'Excellent! Your profile is complete and ready to use'}
          </p>
        </div>
      </div>
    </div>
  );
}
