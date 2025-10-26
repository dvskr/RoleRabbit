import React from 'react';
import { X } from 'lucide-react';

interface NewResumeModalProps {
  showNewResumeModal: boolean;
  setShowNewResumeModal: (show: boolean) => void;
  onNewResume: () => void;
}

export default function NewResumeModal({
  showNewResumeModal,
  setShowNewResumeModal,
  onNewResume
}: NewResumeModalProps) {
  if (!showNewResumeModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Resume</h2>
          <button
            onClick={() => setShowNewResumeModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to create a new resume? This will replace your current resume data.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={onNewResume}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Create New Resume
            </button>
            <button
              onClick={() => setShowNewResumeModal(false)}
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
