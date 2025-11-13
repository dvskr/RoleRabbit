'use client';

import React, { useMemo } from 'react';

interface DraftDiffViewerProps {
  draftData: any;
  baseData: any;
  onClose: () => void;
  onDiscard?: () => Promise<void>; // 🎯 NEW: Discard handler
  hasDraft?: boolean; // 🎯 NEW: Whether there's a draft
}

interface Change {
  section: string;
  field: string;
  before: string;
  after: string;
  type: 'added' | 'removed' | 'modified';
}

export const DraftDiffViewer: React.FC<DraftDiffViewerProps> = ({
  draftData,
  baseData,
  onClose,
  onDiscard, // 🎯 NEW
  hasDraft = false, // 🎯 NEW
}) => {
  const [isDiscarding, setIsDiscarding] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const changes = useMemo(() => {
    const detected: Change[] = [];

    if (!draftData || !baseData) {
      return detected;
    }

    // Helper to compare values
    const compareValues = (
      section: string,
      field: string,
      draftValue: any,
      baseValue: any
    ) => {
      const draftStr = JSON.stringify(draftValue);
      const baseStr = JSON.stringify(baseValue);

      if (draftStr !== baseStr) {
        if (!baseValue || baseStr === '""' || baseStr === 'null' || baseStr === 'undefined') {
          detected.push({
            section,
            field,
            before: '',
            after: typeof draftValue === 'string' ? draftValue : JSON.stringify(draftValue, null, 2),
            type: 'added',
          });
        } else if (!draftValue || draftStr === '""' || draftStr === 'null' || draftStr === 'undefined') {
          detected.push({
            section,
            field,
            before: typeof baseValue === 'string' ? baseValue : JSON.stringify(baseValue, null, 2),
            after: '',
            type: 'removed',
          });
        } else {
          detected.push({
            section,
            field,
            before: typeof baseValue === 'string' ? baseValue : JSON.stringify(baseValue, null, 2),
            after: typeof draftValue === 'string' ? draftValue : JSON.stringify(draftValue, null, 2),
            type: 'modified',
          });
        }
      }
    };

    // Compare basic fields
    const basicFields = ['name', 'email', 'phone', 'location', 'summary', 'title'];
    basicFields.forEach((field) => {
      if (draftData[field] !== baseData[field]) {
        compareValues('Basic Info', field, draftData[field], baseData[field]);
      }
    });

    // Compare skills
    if (JSON.stringify(draftData.skills) !== JSON.stringify(baseData.skills)) {
      if (JSON.stringify(draftData.skills?.technical) !== JSON.stringify(baseData.skills?.technical)) {
        compareValues('Skills', 'Technical Skills', draftData.skills?.technical, baseData.skills?.technical);
      }
      if (JSON.stringify(draftData.skills?.soft) !== JSON.stringify(baseData.skills?.soft)) {
        compareValues('Skills', 'Soft Skills', draftData.skills?.soft, baseData.skills?.soft);
      }
    }

    // Compare experience
    const draftExp = draftData.experience || [];
    const baseExp = baseData.experience || [];
    const maxExpLength = Math.max(draftExp.length, baseExp.length);

    for (let i = 0; i < maxExpLength; i++) {
      const draftItem = draftExp[i];
      const baseItem = baseExp[i];

      if (JSON.stringify(draftItem) !== JSON.stringify(baseItem)) {
        const company = draftItem?.company || baseItem?.company || `Experience #${i + 1}`;
        compareValues('Experience', company, draftItem, baseItem);
      }
    }

    // Compare education
    const draftEdu = draftData.education || [];
    const baseEdu = baseData.education || [];
    const maxEduLength = Math.max(draftEdu.length, baseEdu.length);

    for (let i = 0; i < maxEduLength; i++) {
      const draftItem = draftEdu[i];
      const baseItem = baseEdu[i];

      if (JSON.stringify(draftItem) !== JSON.stringify(baseItem)) {
        const institution = draftItem?.institution || baseItem?.institution || `Education #${i + 1}`;
        compareValues('Education', institution, draftItem, baseItem);
      }
    }

    // Compare projects
    const draftProj = draftData.projects || [];
    const baseProj = baseData.projects || [];
    const maxProjLength = Math.max(draftProj.length, baseProj.length);

    for (let i = 0; i < maxProjLength; i++) {
      const draftItem = draftProj[i];
      const baseItem = baseProj[i];

      if (JSON.stringify(draftItem) !== JSON.stringify(baseItem)) {
        const title = draftItem?.title || baseItem?.title || `Project #${i + 1}`;
        compareValues('Projects', title, draftItem, baseItem);
      }
    }

    return detected;
  }, [draftData, baseData]);

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return '➕';
      case 'removed':
        return '➖';
      case 'modified':
        return '✏️';
      default:
        return '•';
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-green-200';
      case 'removed':
        return 'bg-red-50 border-red-200';
      case 'modified':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // 🎯 NEW: Handle discard with confirmation
  const handleDiscardClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDiscard = async () => {
    if (onDiscard) {
      setIsDiscarding(true);
      try {
        await onDiscard();
        // Modal will be closed by parent component after successful discard
      } catch (error) {
        console.error('Failed to discard draft', error);
        setIsDiscarding(false);
      }
    }
  };

  const handleCancelDiscard = () => {
    setShowConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Draft Changes ({changes.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {changes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No changes detected</p>
            </div>
          ) : (
            <div className="space-y-4">
              {changes.map((change, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getChangeColor(change.type)}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{getChangeIcon(change.type)}</span>
                    <div>
                      <span className="font-medium text-gray-900">{change.section}</span>
                      <span className="text-gray-500 mx-2">›</span>
                      <span className="text-gray-700">{change.field}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Before */}
                    {change.before && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase mb-2">
                          Before (Base)
                        </div>
                        <div className="bg-white rounded border border-gray-200 p-3 text-sm text-gray-700 whitespace-pre-wrap break-words">
                          {change.before}
                        </div>
                      </div>
                    )}

                    {/* After */}
                    {change.after && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase mb-2">
                          After (Draft)
                        </div>
                        <div className="bg-white rounded border border-gray-200 p-3 text-sm text-gray-700 whitespace-pre-wrap break-words">
                          {change.after}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

