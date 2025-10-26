'use client';

import React from 'react';
import { Mail, User, Clock, Reply, Forward } from 'lucide-react';
import { Email } from '../types';

interface EmailThreadProps {
  emails: Email[];
  onReply?: (email: Email) => void;
  onForward?: (email: Email) => void;
}

export default function EmailThread({ emails, onReply, onForward }: EmailThreadProps) {
  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <div key={email.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {email.fromName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{email.fromName}</p>
                <p className="text-sm text-gray-600">{email.fromEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {new Date(email.sentAt).toLocaleDateString()} {new Date(email.sentAt).toLocaleTimeString()}
              </span>
              {onReply && (
                <button
                  onClick={() => onReply(email)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Reply"
                >
                  <Reply size={16} className="text-gray-600" />
                </button>
              )}
              {onForward && (
                <button
                  onClick={() => onForward(email)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Forward"
                >
                  <Forward size={16} className="text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Subject */}
          <h3 className="font-semibold text-gray-900 mb-2">{email.subject}</h3>

          {/* Body */}
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{email.body}</p>
        </div>
      ))}
    </div>
  );
}

