'use client';

import React, { useState } from 'react';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { SalaryOffer } from '../../../types/jobTracker';

interface SalaryTrackerProps {
  jobId: string;
  offers: SalaryOffer[];
  onAddOffer: (jobId: string, offer: Omit<SalaryOffer, 'id'>) => void;
  onDeleteOffer: (jobId: string, offerId: string) => void;
}

export default function SalaryTracker({
  jobId,
  offers = [],
  onAddOffer,
  onDeleteOffer
}: SalaryTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    equity: '',
    benefits: [] as string[],
    notes: '',
    date: new Date().toISOString().split('T')[0],
    status: 'initial' as SalaryOffer['status']
  });

  const fieldIds = {
    amount: `salary-amount-${jobId}`,
    currency: `salary-currency-${jobId}`,
    status: `salary-status-${jobId}`,
    equity: `salary-equity-${jobId}`,
    notes: `salary-notes-${jobId}`,
    date: `salary-date-${jobId}`
  } as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOffer(jobId, {
      ...formData,
      amount: parseFloat(formData.amount)
    } as Omit<SalaryOffer, 'id'>);
    setFormData({
      amount: '',
      currency: 'USD',
      equity: '',
      benefits: [],
      notes: '',
      date: new Date().toISOString().split('T')[0],
      status: 'initial'
    });
    setShowForm(false);
  };

  const addBenefit = () => {
    setFormData({ ...formData, benefits: [...formData.benefits, ''] });
  };

  const removeBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index)
    });
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const getStatusColor = (status: SalaryOffer['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'countered':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign size={16} className="text-green-600" />
          Salary Offers
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
        >
          <Plus size={14} />
          Add Offer
        </button>
      </div>

      {/* Salary Offers List */}
      <div className="space-y-3">
        {offers.map((offer) => (
          <div key={offer.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {offer.currency} {offer.amount.toLocaleString()}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(offer.status)}`}>
                    {offer.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{offer.date}</p>
              </div>
              <button
                onClick={() => onDeleteOffer(jobId, offer.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {offer.equity && (
              <p className="text-xs text-gray-600 mb-1">Equity: {offer.equity}</p>
            )}
            {offer.benefits && offer.benefits.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-gray-700 mb-1">Benefits:</p>
                <ul className="list-disc list-inside text-xs text-gray-600">
                  {offer.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
            {offer.notes && (
              <p className="text-xs text-gray-600 italic">{offer.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Add Salary Offer Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 p-3 bg-blue-50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor={fieldIds.amount} className="text-xs font-medium text-gray-700 mb-1 block">Amount</label>
              <input
                id={fieldIds.amount}
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor={fieldIds.currency} className="text-xs font-medium text-gray-700 mb-1 block">Currency</label>
              <select
                id={fieldIds.currency}
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor={fieldIds.status} className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
            <select
              id={fieldIds.status}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as SalaryOffer['status'] })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            >
              <option value="initial">Initial Offer</option>
              <option value="countered">Countered</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label htmlFor={fieldIds.equity} className="text-xs font-medium text-gray-700 mb-1 block">Equity</label>
            <input
              id={fieldIds.equity}
              type="text"
              value={formData.equity}
              onChange={(e) => setFormData({ ...formData, equity: e.target.value })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              placeholder="e.g., 10K options"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Benefits</label>
            {formData.benefits.map((benefit, i) => (
              <div key={i} className="flex gap-1 mb-1">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => updateBenefit(i, e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="Benefit..."
                />
                {formData.benefits.length > 0 && (
                  <button
                    type="button"
                    onClick={() => removeBenefit(i)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addBenefit}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              + Add Benefit
            </button>
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

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Offer
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

