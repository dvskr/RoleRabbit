'use client';

import React from 'react';
import { Play, Pause, Edit, Trash2, Users, Mail, Eye, Reply, MousePointer } from 'lucide-react';
import { CampaignCardProps } from '../types/email';

export default function CampaignCard({ 
  campaign, 
  onEdit, 
  onDelete, 
  onPause, 
  onResume 
}: CampaignCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play size={12} />;
      case 'paused': return <Pause size={12} />;
      case 'completed': return <Mail size={12} />;
      case 'draft': return <Edit size={12} />;
      default: return <Mail size={12} />;
    }
  };

  const openRate = campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : '0';
  const replyRate = campaign.sent > 0 ? ((campaign.replied / campaign.sent) * 100).toFixed(1) : '0';
  const clickRate = campaign.sent > 0 ? ((campaign.clicked / campaign.sent) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{campaign.name}</h3>
          <p className="text-sm text-gray-600">Template: {campaign.template.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(campaign.status)}`}>
            {getStatusIcon(campaign.status)}
            {campaign.status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Users size={16} className="text-blue-600" />
          </div>
          <p className="text-lg font-semibold text-blue-900">{campaign.sent}</p>
          <p className="text-xs text-blue-600">Sent</p>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Eye size={16} className="text-green-600" />
          </div>
          <p className="text-lg font-semibold text-green-900">{campaign.opened}</p>
          <p className="text-xs text-green-600">{openRate}% Open</p>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Reply size={16} className="text-purple-600" />
          </div>
          <p className="text-lg font-semibold text-purple-900">{campaign.replied}</p>
          <p className="text-xs text-purple-600">{replyRate}% Reply</p>
        </div>
        
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <MousePointer size={16} className="text-orange-600" />
          </div>
          <p className="text-lg font-semibold text-orange-900">{campaign.clicked}</p>
          <p className="text-xs text-orange-600">{clickRate}% Click</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Created: {new Date(campaign.createdAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2">
          {campaign.status === 'active' && onPause && (
            <button
              onClick={() => onPause(campaign)}
              className="px-3 py-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors text-sm"
            >
              <Pause size={14} className="inline mr-1" />
              Pause
            </button>
          )}
          {campaign.status === 'paused' && onResume && (
            <button
              onClick={() => onResume(campaign)}
              className="px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm"
            >
              <Play size={14} className="inline mr-1" />
              Resume
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(campaign)}
              className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
            >
              <Edit size={14} className="inline mr-1" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(campaign)}
              className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              <Trash2 size={14} className="inline mr-1" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
