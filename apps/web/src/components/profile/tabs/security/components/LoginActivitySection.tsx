'use client';

import React from 'react';
import { CheckCircle, Smartphone } from 'lucide-react';
import { LoginActivitySectionProps } from '../types';
import { SecurityCard } from './SecurityCard';

export const LoginActivitySection: React.FC<LoginActivitySectionProps> = ({
  colors,
  sessions = [],
  isLoading = false,
  errorMessage,
  onLogoutSession,
  onLogoutAllSessions,
}) => {
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }
    return date.toLocaleString();
  };

  const displaySessions = sessions;

  return (
    <SecurityCard colors={colors} title="Recent Login Activity">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm" style={{ color: colors.secondaryText }}>
          Monitor active devices and revoke access for sessions you don't recognize.
        </p>
        {onLogoutAllSessions && displaySessions.length > 1 && (
          <button
            onClick={onLogoutAllSessions}
            className="text-xs font-semibold px-3 py-1 rounded-lg border transition-colors"
            style={{
              border: `1px solid ${colors.border}`,
              color: colors.primaryBlue,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Log out other sessions
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm" style={{ color: colors.secondaryText }}>
          Loading sessions…
        </p>
      ) : displaySessions.length === 0 ? (
        <p className="text-sm" style={{ color: colors.secondaryText }}>
          No active sessions found.
        </p>
      ) : (
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
                {session.ipAddress ? `IP: ${session.ipAddress}` : 'Location unknown'} • Last active {formatTimestamp(session.lastActive)}
              </p>
            </div>
            {session.isCurrent ? (
              <span 
                className="text-sm font-medium"
                style={{ color: colors.successGreen }}
              >
                Current Session
              </span>
            ) : (
              onLogoutSession && (
                <button
                  onClick={() => onLogoutSession(session.id)}
                  className="text-xs font-semibold px-3 py-1 rounded-lg border transition-colors"
                  style={{
                    border: `1px solid ${colors.border}`,
                    color: colors.errorRed,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Log out
                </button>
              )
            )}
          </div>
          ))}
        </div>
      )}
    </SecurityCard>
  );
};

