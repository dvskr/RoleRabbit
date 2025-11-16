'use client';

import React, { useState, useEffect } from 'react';
import { FileActivityTimeline, ActivityType } from './FileActivityTimeline';
import apiService from '../../services/apiService';
import { logger } from '../../utils/logger';
import { useTheme } from '../../contexts/ThemeContext';
import { LoadingState } from './LoadingState';

interface FileActivityTimelineWithDataProps {
  fileId: string;
  colors?: any;
}

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

export const FileActivityTimelineWithData: React.FC<FileActivityTimelineWithDataProps> = ({
  fileId,
  colors,
}) => {
  const { theme } = useTheme();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const loadActivities = async (reset: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentOffset = reset ? 0 : offset;
      const response = await apiService.getFileActivity(fileId, limit, currentOffset);
      
      if (response.success && response.activities) {
        const newActivities = response.activities.map((log: any) => ({
          id: log.id,
          type: log.type || 'upload',
          timestamp: log.createdAt || log.timestamp,
          userId: log.userId,
          userName: log.user?.name || log.userName || 'Unknown User',
          userEmail: log.user?.email || log.userEmail,
          userAvatar: log.userAvatar,
          description: log.description || `Performed ${log.action || log.type} action`,
          metadata: log.metadata || {}
        }));
        
        if (reset) {
          setActivities(newActivities);
        } else {
          setActivities(prev => [...prev, ...newActivities]);
        }
        
        setHasMore(response.pagination?.hasMore || false);
        setOffset(currentOffset + newActivities.length);
      } else {
        setError('Failed to load activities');
      }
    } catch (err: any) {
      logger.error('Failed to load file activities:', err);
      setError(err.message || 'Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fileId) {
      loadActivities(true);
    }
  }, [fileId]);

  if (isLoading && activities.length === 0) {
    return <LoadingState colors={colors || theme.colors} message="Loading activity timeline..." />;
  }

  if (error && activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm" style={{ color: (colors || theme.colors).errorRed }}>
          {error}
        </p>
        <button
          onClick={() => loadActivities(true)}
          className="mt-2 px-4 py-2 rounded text-sm"
          style={{
            background: (colors || theme.colors).primaryBlue,
            color: 'white'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <FileActivityTimeline activities={activities} colors={colors} />
      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={() => loadActivities(false)}
            disabled={isLoading}
            className="px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
            style={{
              background: (colors || theme.colors).inputBackground,
              color: (colors || theme.colors).primaryText,
              border: `1px solid ${(colors || theme.colors).border}`
            }}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

