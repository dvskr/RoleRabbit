import React from 'react';
import { Eye, FileText, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { useProfile } from '../../../contexts/ProfileContext';
import { useTheme } from '../../../contexts/ThemeContext';

export function ProfileAnalyticsWidget() {
  const { userData } = useProfile();
  const { theme } = useTheme();
  const colors = theme.colors;
  const isLightTheme = theme.mode === 'light';
  
  // Theme-aware background and border
  const widgetBackground = isLightTheme 
    ? colors.cardBackground 
    : 'rgba(255, 255, 255, 0.05)';
  const widgetBorder = isLightTheme
    ? `1px solid ${colors.border}`
    : '1px solid rgba(255, 255, 255, 0.1)';
  const headingColor = isLightTheme ? colors.primaryText : '#ffffff';
  
  // Use default values if userData is not loaded yet
  const profileViews = userData?.profileViews || 0;
  const successRate = userData?.successRate || 0;
  const profileCompleteness = userData?.profileCompleteness || 0;
  const skillMatchRate = userData?.skillMatchRate || 0;
  const avgResponseTime = userData?.avgResponseTime || 0;

  return (
    <div
      className="rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/10"
      style={{
        background: widgetBackground,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: widgetBorder,
        boxShadow: isLightTheme 
          ? '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)'
          : '0 2px 8px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      <h2 className="text-base font-semibold mb-3" style={{ color: headingColor }}>Profile Analytics</h2>
      
      {/* Primary Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div 
          className="p-2 rounded-lg"
          style={{
            background: colors.badgeInfoBg,
            border: `1px solid ${colors.badgeInfoBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <Eye size={14} style={{ color: colors.primaryBlue }} />
            <span 
              className="text-sm font-bold"
              style={{ color: colors.primaryText }}
            >
              {profileViews.toLocaleString()}
            </span>
          </div>
          <p 
            className="text-[10px] font-medium truncate"
            style={{ color: colors.secondaryText }}
          >
            Views
          </p>
        </div>
        
        <div 
          className="p-2 rounded-lg"
          style={{
            background: colors.badgePurpleBg,
            border: `1px solid ${colors.badgePurpleBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <TrendingUp size={14} style={{ color: colors.badgePurpleText }} />
            <span 
              className="text-sm font-bold"
              style={{ color: colors.primaryText }}
            >
              {successRate}%
            </span>
          </div>
          <p 
            className="text-[10px] font-medium truncate"
            style={{ color: colors.secondaryText }}
          >
            Success
          </p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div 
          className="p-2 rounded-lg text-center"
          style={{
            background: colors.badgeInfoBg,
            border: `1px solid ${colors.badgeInfoBorder}`,
          }}
        >
          <CheckCircle size={12} className="mx-auto mb-1" style={{ color: colors.primaryBlue }} />
          <p 
            className="text-xs font-bold"
            style={{ color: colors.primaryText }}
          >
            {profileCompleteness}%
          </p>
          <p 
            className="text-[9px] truncate"
            style={{ color: colors.secondaryText }}
          >
            Complete
          </p>
        </div>
        
        <div 
          className="p-2 rounded-lg text-center"
          style={{
            background: colors.badgeSuccessBg,
            border: `1px solid ${colors.badgeSuccessBorder}`,
          }}
        >
          <TrendingUp size={12} className="mx-auto mb-1" style={{ color: colors.successGreen }} />
          <p 
            className="text-xs font-bold"
            style={{ color: colors.primaryText }}
          >
            {skillMatchRate}%
          </p>
          <p 
            className="text-[9px] truncate"
            style={{ color: colors.secondaryText }}
          >
            Match
          </p>
        </div>
        
        <div 
          className="p-2 rounded-lg text-center"
          style={{
            background: colors.badgeWarningBg,
            border: `1px solid ${colors.badgeWarningBorder}`,
          }}
        >
          <Calendar size={12} className="mx-auto mb-1" style={{ color: colors.badgeWarningText }} />
          <p 
            className="text-xs font-bold"
            style={{ color: colors.primaryText }}
          >
            {avgResponseTime}d
          </p>
          <p 
            className="text-[9px] truncate"
            style={{ color: colors.secondaryText }}
          >
            Response
          </p>
        </div>
      </div>

      {/* Profile Performance - Enhanced with descriptions */}
      <div className="mb-3">
        <h3 
          className="text-xs font-semibold mb-2"
          style={{ color: headingColor }}
        >
          Performance
        </h3>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span 
                className="text-[10px] font-semibold"
                style={{ color: colors.secondaryText }}
              >
                Completeness
              </span>
              <span 
                className="text-[10px] font-bold"
                style={{ color: colors.primaryBlue }}
              >
                {profileCompleteness}%
              </span>
            </div>
            <div 
              className="w-full rounded-full h-1.5"
              style={{ background: colors.inputBackground }}
            >
            <div 
              className="h-1.5 rounded-full transition-all duration-1000" 
              style={{ 
                width: `${profileCompleteness}%`,
                background: `linear-gradient(90deg, ${colors.primaryBlue}, ${colors.badgeInfoText})`
              }}
            />
            </div>
            <p 
              className="text-[9px] mt-0.5"
              style={{ color: colors.tertiaryText }}
            >
              {profileCompleteness < 70 ? 'Complete profile to increase visibility' :
               profileCompleteness < 85 ? 'Looking good! Complete a few more sections' :
               'Excellent! Profile is optimized'}
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span 
                className="text-[10px] font-semibold"
                style={{ color: colors.secondaryText }}
              >
                Skill Match
              </span>
              <span 
                className="text-[10px] font-bold"
                style={{ color: colors.successGreen }}
              >
                {skillMatchRate}%
              </span>
            </div>
            <div 
              className="w-full rounded-full h-1.5"
              style={{ background: colors.inputBackground }}
            >
            <div 
              className="h-1.5 rounded-full transition-all duration-1000" 
              style={{ 
                width: `${skillMatchRate}%`,
                background: `linear-gradient(90deg, ${colors.successGreen}, ${colors.badgeSuccessText})`
              }}
            />
            </div>
            <p 
              className="text-[9px] mt-0.5"
              style={{ color: colors.tertiaryText }}
            >
              {skillMatchRate >= 90 ? 'Excellent match with job openings!' :
               skillMatchRate >= 75 ? 'Good match with opportunities' :
               'Consider adding more in-demand skills'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity - Compact */}
      <div>
        <h3 
          className="text-xs font-semibold mb-2"
          style={{ color: headingColor }}
        >
          Recent Activity
        </h3>
        <div className="space-y-1.5">
          <div 
            className="flex items-center gap-2 p-2 rounded-lg"
            style={{
              background: colors.badgeInfoBg,
              border: `1px solid ${colors.badgeInfoBorder}`,
            }}
          >
            <Eye size={12} style={{ color: colors.primaryBlue }} />
            <div className="flex-1 min-w-0">
              <p 
                className="text-[10px] font-medium truncate"
                style={{ color: colors.primaryText }}
              >
                Profile viewed
              </p>
              <p 
                className="text-[9px] truncate"
                style={{ color: colors.tertiaryText }}
              >
                2h ago
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

