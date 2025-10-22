'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CustomSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (sectionName: string, sectionContent: string) => void;
}

export default function CustomSectionModal({
  isOpen,
  onClose,
  onAddSection
}: CustomSectionModalProps) {
  const [sectionName, setSectionName] = useState('');
  const [sectionContent, setSectionContent] = useState('');

  const handleSubmit = () => {
    if (sectionName.trim()) {
      onAddSection(sectionName.trim(), sectionContent.trim());
      setSectionName('');
      setSectionContent('');
      onClose();
    }
  };

  const handleClose = () => {
    setSectionName('');
    setSectionContent('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add Custom Section
          </h3>
          <button 
            onClick={handleClose} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Section Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Section Name</label>
            <input
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="e.g., Awards, Publications, Volunteer Work"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
            />
          </div>

          {/* Initial Content */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Initial Content (Optional)</label>
            <textarea
              value={sectionContent}
              onChange={(e) => setSectionContent(e.target.value)}
              placeholder="You can add content now or later..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!sectionName.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Add Section
          </button>
        </div>
      </div>
    </div>
  );
}
