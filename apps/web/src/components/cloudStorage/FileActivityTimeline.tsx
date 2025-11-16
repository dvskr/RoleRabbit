'use client';

import React from 'react';
import { Upload, Download, Edit, Trash2, Share2, User, Clock, MessageCircle, Star, Archive, RotateCcw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatRelativeTime } from '../../utils/formatters';

export type ActivityType = 
  | 'upload' 
  | 'download' 
  | 'edit' 
  | 'delete' 
  | 'restore' 
  | 'share' 
  | 'comment' 
  | 'star' 
  | 'archive';

interface Activity {
  id: string;
  type: ActivityType;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  description: string;
  metadata?: Record<string, any>;
}

interface FileActivityTimelineProps {
  activities: Activity[];
  colors?: any;
}

const getActivityIcon = (type: ActivityType, colors: any) => {
  const iconProps = { size: 16, style: { color: colors.primaryBlue } };
  
  switch (type) {
    case 'upload':
      return <Upload {...iconProps} />;
    case 'download':
      return <Download {...iconProps} />;
    case 'edit':
      return <Edit {...iconProps} />;
    case 'delete':
      return <Trash2 {...iconProps} />;
    case 'restore':
      return <RotateCcw {...iconProps} />;
    case 'share':
      return <Share2 {...iconProps} />;
    case 'comment':
      return <MessageCircle {...iconProps} />;
    case 'star':
      return <Star {...iconProps} />;
    case 'archive':
      return <Archive {...iconProps} />;
    default:
      return <Clock {...iconProps} />;
  }
};

const getActivityColor = (type: ActivityType, colors: any): string => {
  switch (type) {
    case 'upload':
    case 'restore':
      return colors.badgeSuccessText;
    case 'delete':
      return colors.errorRed;
    case 'share':
    case 'comment':
      return colors.primaryBlue;
    case 'star':
    case 'archive':
      return colors.badgeWarningText;
    default:
      return colors.secondaryText;
  }
};

export const FileActivityTimeline: React.FC<FileActivityTimelineProps> = ({
  activities,
  colors,
}) => {
  const { theme } = useTheme();
  const palette = colors || theme.colors;

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm" style={{ color: palette.secondaryText }}>
          No activity recorded yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-4">
          {/* Timeline Line */}
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: palette.badgeInfoBg,
                border: `2px solid ${getActivityColor(activity.type, palette)}`,
              }}
            >
              {getActivityIcon(activity.type, palette)}
            </div>
            {index < activities.length - 1 && (
              <div
                className="w-0.5 flex-1 mt-2"
                style={{ background: palette.border }}
              />
            )}
          </div>

          {/* Activity Content */}
          <div className="flex-1 min-w-0 pb-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                {activity.userAvatar ? (
                  <img
                    src={activity.userAvatar}
                    alt={activity.userName}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: palette.inputBackground }}
                  >
                    <User size={12} style={{ color: palette.secondaryText }} />
                  </div>
                )}
                <span className="text-sm font-medium truncate" style={{ color: palette.primaryText }}>
                  {activity.userName}
                </span>
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: palette.tertiaryText }}>
                {formatRelativeTime(activity.timestamp)}
              </span>
            </div>
            <p className="text-sm" style={{ color: palette.secondaryText }}>
              {activity.description}
            </p>
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <div className="mt-2 text-xs" style={{ color: palette.tertiaryText }}>
                {Object.entries(activity.metadata).map(([key, value]) => (
                  <span key={key} className="mr-3">
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

