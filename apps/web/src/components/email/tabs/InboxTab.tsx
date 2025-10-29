'use client';

import React, { useState } from 'react';
import { Inbox, Search, Mail } from 'lucide-react';
import EmailThread from '../components/EmailThread';
import { Email } from '../types';
import { useTheme } from '../../../contexts/ThemeContext';

// Mock email data
const mockEmails: Email[] = [
  {
    id: '1',
    contactId: '1',
    fromEmail: 'sarah.j@techcorp.com',
    fromName: 'Sarah Johnson',
    toEmail: 'you@example.com',
    toName: 'You',
    subject: 'Follow-up on Your Application',
    body: 'Thank you for your application. We would like to schedule a call to discuss your background further.',
    isRead: false,
    isStarred: false,
    isArchived: false,
    status: 'unread',
    direction: 'inbound',
    sentAt: '2024-01-20T10:00:00Z',
    receivedAt: '2024-01-20T10:15:00Z',
    threadId: 'thread-1',
    provider: 'Gmail',
  },
  {
    id: '2',
    contactId: '2',
    fromEmail: 'sarah.j@techcorp.com',
    fromName: 'Sarah Johnson',
    toEmail: 'you@example.com',
    toName: 'You',
    subject: 'Re: Follow-up on Your Application',
    body: 'Perfect! Would Tuesday at 2 PM work for you?',
    isRead: true,
    isStarred: true,
    isArchived: false,
    status: 'read',
    direction: 'inbound',
    sentAt: '2024-01-21T14:00:00Z',
    receivedAt: '2024-01-21T14:10:00Z',
    threadId: 'thread-1',
    provider: 'Gmail',
  },
];

export default function InboxTab() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [emails] = useState<Email[]>(mockEmails);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');

  const filteredEmails = emails.filter(email => {
    if (filter === 'unread' && email.isRead) return false;
    if (filter === 'starred' && !email.isStarred) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return email.subject.toLowerCase().includes(searchLower) ||
             email.body.toLowerCase().includes(searchLower) ||
             email.fromName.toLowerCase().includes(searchLower);
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0" style={{ background: colors.headerBackground, borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.tertiaryText }} />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className="px-3 py-1.5 rounded-lg transition-colors text-sm"
            style={{
              background: filter === 'all' ? colors.badgeInfoBg : 'transparent',
              color: filter === 'all' ? colors.activeBlueText : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (filter !== 'all') {
                e.currentTarget.style.background = colors.hoverBackground;
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== 'all') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className="px-3 py-1.5 rounded-lg transition-colors text-sm"
            style={{
              background: filter === 'unread' ? colors.badgeInfoBg : 'transparent',
              color: filter === 'unread' ? colors.activeBlueText : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (filter !== 'unread') {
                e.currentTarget.style.background = colors.hoverBackground;
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== 'unread') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('starred')}
            className="px-3 py-1.5 rounded-lg transition-colors text-sm"
            style={{
              background: filter === 'starred' ? colors.badgeInfoBg : 'transparent',
              color: filter === 'starred' ? colors.activeBlueText : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (filter !== 'starred') {
                e.currentTarget.style.background = colors.hoverBackground;
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== 'starred') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            Starred
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6" style={{ background: colors.background }}>
        {filteredEmails.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Mail size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText }} />
              <p style={{ color: colors.secondaryText }}>No emails found</p>
            </div>
          </div>
        ) : (
          <EmailThread emails={filteredEmails} />
        )}
      </div>
    </div>
  );
}
