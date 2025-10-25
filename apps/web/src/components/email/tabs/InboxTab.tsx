'use client';

import React, { useState } from 'react';
import { Search, Filter, Mail, Reply, Archive, Trash2, Star, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function InboxTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - in real app, this would come from props or API
  const emails = [
    {
      id: '1',
      from: 'hr@techcorp.com',
      subject: 'Re: Software Engineer Position Inquiry',
      preview: 'Thank you for your interest in our Software Engineer position. We would like to schedule an interview...',
      timestamp: '2024-01-20T10:30:00Z',
      status: 'replied',
      starred: true,
      unread: false
    },
    {
      id: '2',
      from: 'recruiter@startup.io',
      subject: 'Following up on your application',
      preview: 'Hi there! I wanted to follow up on your application for the Frontend Developer role...',
      timestamp: '2024-01-19T14:15:00Z',
      status: 'opened',
      starred: false,
      unread: true
    },
    {
      id: '3',
      from: 'manager@bigcorp.com',
      subject: 'Interview Invitation - Senior Developer',
      preview: 'Congratulations! We would like to invite you for an interview for the Senior Developer position...',
      timestamp: '2024-01-18T09:45:00Z',
      status: 'sent',
      starred: true,
      unread: false
    },
    {
      id: '4',
      from: 'ceo@innovate.com',
      subject: 'Thank you for your interest',
      preview: 'Thank you for reaching out about opportunities at our company. While we don\'t have any current openings...',
      timestamp: '2024-01-17T16:20:00Z',
      status: 'rejected',
      starred: false,
      unread: false
    }
  ];

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.preview.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'replied': return <Reply size={14} className="text-green-600" />;
      case 'opened': return <CheckCircle size={14} className="text-blue-600" />;
      case 'sent': return <Mail size={14} className="text-gray-600" />;
      case 'rejected': return <XCircle size={14} className="text-red-600" />;
      default: return <Clock size={14} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'replied': return 'bg-green-100 text-green-700';
      case 'opened': return 'bg-blue-100 text-blue-700';
      case 'sent': return 'bg-gray-100 text-gray-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Email Inbox</h2>
          <p className="text-sm text-gray-600">Track responses to your outreach emails</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
            <Archive size={14} className="inline mr-1" />
            Archive All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="replied">Replied</option>
            <option value="opened">Opened</option>
            <option value="sent">Sent</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Email List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredEmails.map((email) => (
          <div
            key={email.id}
            className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
              email.unread ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {email.from.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 truncate">{email.from}</span>
                  {email.starred && <Star size={14} className="text-yellow-500 fill-current" />}
                  {email.unread && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1">{email.subject}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{email.preview}</p>
                
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-500">{formatTimestamp(email.timestamp)}</span>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(email.status)}`}>
                    {getStatusIcon(email.status)}
                    {email.status}
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0 flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Reply size={16} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Archive size={16} />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEmails.length === 0 && (
        <div className="text-center py-12">
          <Mail size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No emails found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
