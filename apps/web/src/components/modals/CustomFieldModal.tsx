'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CustomFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddField: (fieldName: string, fieldIcon: string) => void;
}

const iconOptions = [
  { value: 'link', label: 'Link', description: 'Generic link' },
  { value: 'mail', label: 'Email', description: 'Email address' },
  { value: 'phone', label: 'Phone', description: 'Phone number' },
  { value: 'globe', label: 'Website', description: 'Website URL' },
  { value: 'linkedin', label: 'LinkedIn', description: 'LinkedIn profile' },
  { value: 'github', label: 'GitHub', description: 'GitHub profile' },
  { value: 'twitter', label: 'Twitter', description: 'Twitter profile' },
  { value: 'portfolio', label: 'Portfolio', description: 'Portfolio website' }
];

export default function CustomFieldModal({
  isOpen,
  onClose,
  onAddField
}: CustomFieldModalProps) {
  const [fieldName, setFieldName] = useState('');
  const [fieldIcon, setFieldIcon] = useState('link');

  const handleSubmit = () => {
    if (fieldName.trim()) {
      onAddField(fieldName.trim(), fieldIcon);
      setFieldName('');
      setFieldIcon('link');
      onClose();
    }
  };

  const handleClose = () => {
    setFieldName('');
    setFieldIcon('link');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add Custom Field
          </h3>
          <button 
            onClick={handleClose} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Field Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Field Name</label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="e.g., Portfolio, Twitter, etc."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Icon Type */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Icon Type</label>
            <select
              value={fieldIcon}
              onChange={(e) => setFieldIcon(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all cursor-pointer"
            >
              {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!fieldName.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Add Field
          </button>
        </div>
      </div>
    </div>
  );
}
