'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Play, Pause, Users, Mail, Eye, Reply, MousePointer } from 'lucide-react';
import { EmailCampaign } from '../types/email';
import CampaignCard from '../components/CampaignCard';

export default function CampaignsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - in real app, this would come from props or API
  const campaigns: EmailCampaign[] = [
    {
      id: '1',
      name: 'Software Engineer Outreach Q4',
      template: {
        id: '1',
        name: 'Cold Outreach - Software Engineer',
        category: 'cold-email',
        subject: 'Software Engineer Position Inquiry',
        content: 'Hi [Name], I hope this email finds you well...',
        aiGenerated: true,
        successRate: 85,
        usageCount: 23,
        tags: ['software', 'engineering']
      },
      recipients: ['hr@company1.com', 'hr@company2.com', 'hr@company3.com'],
      sent: 150,
      opened: 89,
      replied: 23,
      clicked: 45,
      status: 'active',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Follow-up Campaign - Applications',
      template: {
        id: '2',
        name: 'Follow-up After Application',
        category: 'follow-up',
        subject: 'Following up on my application',
        content: 'Dear [Name], I wanted to follow up...',
        aiGenerated: false,
        successRate: 72,
        usageCount: 15,
        tags: ['follow-up', 'application']
      },
      recipients: ['recruiter@company1.com', 'recruiter@company2.com'],
      sent: 75,
      opened: 52,
      replied: 8,
      clicked: 12,
      status: 'paused',
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      name: 'Thank You Campaign - Interviews',
      template: {
        id: '3',
        name: 'Thank You After Interview',
        category: 'thank-you',
        subject: 'Thank you for the interview',
        content: 'Dear [Name], Thank you for taking the time...',
        aiGenerated: true,
        successRate: 90,
        usageCount: 8,
        tags: ['thank-you', 'interview']
      },
      recipients: ['manager@company1.com'],
      sent: 25,
      opened: 22,
      replied: 5,
      clicked: 8,
      status: 'completed',
      createdAt: '2024-01-05'
    }
  ];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.template.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalStats = campaigns.reduce((acc, campaign) => ({
    sent: acc.sent + campaign.sent,
    opened: acc.opened + campaign.opened,
    replied: acc.replied + campaign.replied,
    clicked: acc.clicked + campaign.clicked
  }), { sent: 0, opened: 0, replied: 0, clicked: 0 });

  const overallOpenRate = totalStats.sent > 0 ? ((totalStats.opened / totalStats.sent) * 100).toFixed(1) : '0';
  const overallReplyRate = totalStats.sent > 0 ? ((totalStats.replied / totalStats.sent) * 100).toFixed(1) : '0';
  const overallClickRate = totalStats.sent > 0 ? ((totalStats.clicked / totalStats.sent) * 100).toFixed(1) : '0';

  const handleEditCampaign = (campaign: EmailCampaign) => {
    console.log('Edit campaign:', campaign);
  };

  const handleDeleteCampaign = (campaign: EmailCampaign) => {
    console.log('Delete campaign:', campaign);
  };

  const handlePauseCampaign = (campaign: EmailCampaign) => {
    console.log('Pause campaign:', campaign);
  };

  const handleResumeCampaign = (campaign: EmailCampaign) => {
    console.log('Resume campaign:', campaign);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Email Campaigns</h2>
          <p className="text-sm text-gray-600">Manage and track your email campaigns</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Create Campaign
        </button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Total Sent</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{totalStats.sent}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={16} className="text-green-600" />
            <span className="text-sm font-semibold text-green-900">Open Rate</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{overallOpenRate}%</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Reply size={16} className="text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">Reply Rate</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{overallReplyRate}%</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer size={16} className="text-orange-600" />
            <span className="text-sm font-semibold text-orange-900">Click Rate</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">{overallClickRate}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
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
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.map(campaign => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onEdit={handleEditCampaign}
            onDelete={handleDeleteCampaign}
            onPause={handlePauseCampaign}
            onResume={handleResumeCampaign}
          />
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-600 mb-4">Create your first email campaign to get started</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Campaign
          </button>
        </div>
      )}
    </div>
  );
}
