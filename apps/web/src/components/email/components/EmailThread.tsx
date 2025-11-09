'use client';

import React from 'react';
import { Reply, Forward } from 'lucide-react';
import { Email } from '../types';
import { useTheme } from '../../../contexts/ThemeContext';

interface EmailThreadProps {
  emails: Email[];
  onReply?: (email: Email) => void;
  onForward?: (email: Email) => void;
}

export default function EmailThread({ emails, onReply, onForward }: EmailThreadProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <div 
          key={email.id} 
          className="rounded-lg p-4 transition-shadow"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 4px 6px rgba(0, 0, 0, 0.1)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                style={{ background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.badgePurpleText})` }}
              >
                {email.fromName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium" style={{ color: colors.primaryText }}>{email.fromName}</p>
                <p className="text-sm" style={{ color: colors.secondaryText }}>{email.fromEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: colors.tertiaryText }}>
                {new Date(email.sentAt).toLocaleDateString()} {new Date(email.sentAt).toLocaleTimeString()}
              </span>
              {onReply && (
                <button
                  onClick={() => onReply(email)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: colors.tertiaryText }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hoverBackground;
                    e.currentTarget.style.color = colors.primaryText;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = colors.tertiaryText;
                  }}
                  title="Reply"
                >
                  <Reply size={16} />
                </button>
              )}
              {onForward && (
                <button
                  onClick={() => onForward(email)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: colors.tertiaryText }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hoverBackground;
                    e.currentTarget.style.color = colors.primaryText;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = colors.tertiaryText;
                  }}
                  title="Forward"
                >
                  <Forward size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Subject */}
          <h3 className="font-semibold mb-2" style={{ color: colors.primaryText }}>{email.subject}</h3>

          {/* Body */}
          <p className="text-sm whitespace-pre-wrap" style={{ color: colors.primaryText }}>{email.body}</p>
        </div>
      ))}
    </div>
  );
}

