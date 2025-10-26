import React from 'react';
import { X, Plus } from 'lucide-react';

interface AddFieldModalProps {
  showAddFieldModal: boolean;
  setShowAddFieldModal: (show: boolean) => void;
  newFieldName: string;
  setNewFieldName: (name: string) => void;
  newFieldIcon: string;
  setNewFieldIcon: (icon: string) => void;
  onAddField: () => void;
}

export default function AddFieldModal({
  showAddFieldModal,
  setShowAddFieldModal,
  newFieldName,
  setNewFieldName,
  newFieldIcon,
  setNewFieldIcon,
  onAddField
}: AddFieldModalProps) {
  if (!showAddFieldModal) return null;

  const iconOptions = [
    { value: 'link', label: 'Link' },
    { value: 'calendar', label: 'Calendar' },
    { value: 'map-pin', label: 'Location' },
    { value: 'phone', label: 'Phone' },
    { value: 'mail', label: 'Email' },
    { value: 'briefcase', label: 'Briefcase' },
    { value: 'award', label: 'Award' },
    { value: 'star', label: 'Star' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add Custom Field</h2>
          <button
            onClick={() => setShowAddFieldModal(false)}
            className="p-2 hover:bg-gray-100 rounded-xl  duration-200 group"
          >
            <X size={20} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Field Name
            </label>
            <input
              type="text"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder="e.g., Portfolio URL, GitHub Profile"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500  duration-200 bg-white/50 backdrop-blur-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Icon
            </label>
            <select
              value={newFieldIcon}
              onChange={(e) => setNewFieldIcon(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500  duration-200 bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
            >
              {iconOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-4 pt-2">
            <button
              onClick={onAddField}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-purple-500/30  duration-200 flex items-center justify-center gap-2 font-semibold"
            >
              <Plus size={18} />
              Add Field
            </button>
            <button
              onClick={() => setShowAddFieldModal(false)}
              className="flex-1 bg-gray-100/80 backdrop-blur-sm text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200/80 hover:shadow-md  duration-200 font-semibold border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
