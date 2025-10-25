import React from 'react';
import { X } from 'lucide-react';

interface AddSectionModalProps {
  showAddSectionModal: boolean;
  setShowAddSectionModal: (show: boolean) => void;
  newSectionName: string;
  setNewSectionName: (name: string) => void;
  newSectionContent: string;
  setNewSectionContent: (content: string) => void;
  onAddSection: () => void;
}

export default function AddSectionModal({
  showAddSectionModal,
  setShowAddSectionModal,
  newSectionName,
  setNewSectionName,
  newSectionContent,
  setNewSectionContent,
  onAddSection
}: AddSectionModalProps) {
  if (!showAddSectionModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Custom Section</h2>
          <button
            onClick={() => setShowAddSectionModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Name
            </label>
            <input
              type="text"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="e.g., Languages, Awards, Publications"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Content
            </label>
            <textarea
              value={newSectionContent}
              onChange={(e) => setNewSectionContent(e.target.value)}
              placeholder="Enter the content for this section..."
              className="w-full border border-gray-300 rounded px-3 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onAddSection}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Add Section
            </button>
            <button
              onClick={() => setShowAddSectionModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
