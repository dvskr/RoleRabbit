'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Building2 } from 'lucide-react';
import { CompanyInsight } from '../../../types/jobTracker';

interface CompanyInsightsProps {
  jobId: string;
  insights: CompanyInsight[];
  onAddInsight: (jobId: string, insight: Omit<CompanyInsight, 'id'>) => void;
  onDeleteInsight: (jobId: string, insightId: string) => void;
}

export default function CompanyInsights({
  jobId,
  insights = [],
  onAddInsight,
  onDeleteInsight
}: CompanyInsightsProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'culture' as CompanyInsight['type'],
    title: '',
    content: '',
    source: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddInsight(jobId, {
      ...formData,
      id: `${Date.now()}`
    });
    setFormData({
      type: 'culture',
      title: '',
      content: '',
      source: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const getTypeColor = (type: CompanyInsight['type']) => {
    switch (type) {
      case 'culture':
        return 'bg-purple-100 text-purple-800';
      case 'benefits':
        return 'bg-blue-100 text-blue-800';
      case 'growth':
        return 'bg-green-100 text-green-800';
      case 'reviews':
        return 'bg-yellow-100 text-yellow-800';
      case 'news':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Building2 size={16} className="text-blue-600" />
          Company Insights
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
        >
          <Plus size={14} />
          Add Insight
        </button>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight) => (
          <div key={insight.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(insight.type)}`}>
                    {insight.type}
                  </span>
                  <h4 className="text-sm font-semibold text-gray-900">{insight.title}</h4>
                </div>
                <p className="text-xs text-gray-500">{insight.date}</p>
              </div>
              <button
                onClick={() => onDeleteInsight(jobId, insight.id)}
                className="text-red-600 hover:text-red-700 ml-2"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <p className="text-xs text-gray-700 mb-2">{insight.content}</p>
            {insight.source && (
              <a
                href={insight.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                View Source →
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Add Insight Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 p-3 bg-blue-50 rounded-lg space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as CompanyInsight['type'] })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            >
              <option value="culture">Culture</option>
              <option value="benefits">Benefits</option>
              <option value="growth">Growth</option>
              <option value="reviews">Reviews</option>
              <option value="news">News</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              placeholder="Insight title..."
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={3}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              placeholder="Insight details..."
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Source (Optional)</label>
            <input
              type="url"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Insight
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

