'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { ReferralContact } from '../../../types/jobTracker';

interface ReferralTrackerProps {
  jobId: string;
  referrals: ReferralContact[];
  onAddReferral: (jobId: string, referral: Omit<ReferralContact, 'id'>) => void;
  onDeleteReferral: (jobId: string, referralId: string) => void;
}

export default function ReferralTracker({
  jobId,
  referrals = [],
  onAddReferral,
  onDeleteReferral
}: ReferralTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    relationship: '',
    contacted: false,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fieldIds = {
    name: `referral-name-${jobId}`,
    position: `referral-position-${jobId}`,
    relationship: `referral-relationship-${jobId}`,
    contacted: `referral-contacted-${jobId}`,
    date: `referral-date-${jobId}`,
    notes: `referral-notes-${jobId}`
  } as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReferral(jobId, {
      ...formData
    } as Omit<ReferralContact, 'id'>);
    setFormData({
      name: '',
      position: '',
      relationship: '',
      contacted: false,
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Users size={16} className="text-purple-600" />
          Referral Contacts
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
        >
          <Plus size={14} />
          Add Contact
        </button>
      </div>

      {/* Referrals List */}
      <div className="space-y-3">
        {referrals.map((referral) => (
          <div key={referral.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-900">{referral.name}</h4>
                  {referral.contacted && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">Contacted</span>
                  )}
                </div>
                <p className="text-xs text-gray-600">{referral.position}</p>
              </div>
              <button
                onClick={() => onDeleteReferral(jobId, referral.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
              <span>Relationship: {referral.relationship}</span>
              <span>Date: {referral.date}</span>
            </div>
            {referral.notes && (
              <p className="text-xs text-gray-700">{referral.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Add Referral Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 p-3 bg-blue-50 rounded-lg space-y-3">
          <div>
            <label htmlFor={fieldIds.name} className="text-xs font-medium text-gray-700 mb-1 block">Name</label>
            <input
              id={fieldIds.name}
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label htmlFor={fieldIds.position} className="text-xs font-medium text-gray-700 mb-1 block">Position</label>
            <input
              id={fieldIds.position}
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label htmlFor={fieldIds.relationship} className="text-xs font-medium text-gray-700 mb-1 block">Relationship</label>
            <input
              id={fieldIds.relationship}
              type="text"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              placeholder="e.g., Former colleague, Friend, LinkedIn"
              required
            />
          </div>

          <div>
            <span className="text-xs font-medium text-gray-700 mb-1 block" id={fieldIds.contacted}>Contacted</span>
            <label className="flex items-center gap-2" htmlFor={`${fieldIds.contacted}-checkbox`}>
              <input
                id={`${fieldIds.contacted}-checkbox`}
                type="checkbox"
                checked={formData.contacted}
                onChange={(e) => setFormData({ ...formData, contacted: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                aria-labelledby={fieldIds.contacted}
              />
              <span className="text-xs text-gray-700">Already contacted</span>
            </label>
          </div>

          <div>
            <label htmlFor={fieldIds.date} className="text-xs font-medium text-gray-700 mb-1 block">Date</label>
            <input
              id={fieldIds.date}
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label htmlFor={fieldIds.notes} className="text-xs font-medium text-gray-700 mb-1 block">Notes</label>
            <textarea
              id={fieldIds.notes}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Contact
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

