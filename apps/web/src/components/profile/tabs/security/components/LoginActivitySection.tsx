'use client';

import React from 'react';
import { CheckCircle, Smartphone } from 'lucide-react';
import { LoginActivitySectionProps } from '../types';
import { SecurityCard } from './SecurityCard';

export const LoginActivitySection: React.FC<LoginActivitySectionProps> = ({
  colors,
  sessions = [],
  onLogoutSession,
}) => {
  // Default mock sessions if none provided
  const defaultSessions = [
    {
      id: 'current',
      device: 'Chrome on Windows',
      location: 'San Francisco, CA',
      lastActive: 'Active',
      isCurrent: true,
    },
    {
      id: 'mobile',
      device: 'iOS Safari',
      location: 'San Francisco, CA',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
  ];

  const displaySessions = sessions.length > 0 ? sessions : defaultSessions;

  return (
    <SecurityCard colors={colors} title="Recent Login Activity">
      <div className="space-y-4">
        {displaySessions.map((session) => (
          <div 
            key={session.id}
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div 
              className="p-2 rounded-lg"
              style={{ 
                background: session.isCurrent ? colors.badgeSuccessBg : colors.inputBackground 
              }}
            >
              {session.isCurrent ? (
                <CheckCircle size={16} style={{ color: colors.successGreen }} />
              ) : (
                <Smartphone size={16} style={{ color: colors.tertiaryText }} />
              )}
            </div>
            <div className="flex-1">
              <p 
                className="font-medium"
                style={{ color: colors.primaryText }}
              >
                {session.device}
              </p>
              <p 
                className="text-sm"
                style={{ color: colors.secondaryText }}
              >
                {session.location} • {session.lastActive}
              </p>
            </div>
            {session.isCurrent ? (
              <span 
                className="text-sm font-medium"
                style={{ color: colors.successGreen }}
              >
                Active
              </span>
            ) : (
              <span 
                className="text-sm"
                style={{ color: colors.tertiaryText }}
              >
                {session.lastActive}
              </span>
            )}
          </div>
        ))}
      </div>
    </SecurityCard>
  );
};

