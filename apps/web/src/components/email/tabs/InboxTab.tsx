'use client';

import React, { useState } from 'react';
import { Inbox, Search, Mail } from 'lucide-react';
import EmailThread from '../components/EmailThread';
import { Email } from '../types';

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
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors text-sm ${
              filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg transition-colors text-sm ${
              filter === 'unread' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('starred')}
            className={`px-3 py-1.5 rounded-lg transition-colors text-sm ${
              filter === 'starred' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Starred
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredEmails.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Mail size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No emails found</p>
            </div>
          </div>
        ) : (
          <EmailThread emails={filteredEmails} />
        )}
      </div>
    </div>
  );
}
