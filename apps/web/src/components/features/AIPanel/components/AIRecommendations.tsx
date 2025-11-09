import React from 'react';

interface AIRecommendationsProps {
  aiRecommendations: string[];
  onApplyAIRecommendations: () => void;
  setAiRecommendations: (rec: string[]) => void;
}

export default function AIRecommendations({
  aiRecommendations,
  onApplyAIRecommendations,
  setAiRecommendations
}: AIRecommendationsProps) {
  if (!aiRecommendations || !Array.isArray(aiRecommendations) || aiRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-3">AI Recommendations</h4>
      <div className="space-y-2">
        {aiRecommendations.map((rec, index) => (
          <div key={index} className="p-2 bg-white rounded-md border border-gray-100">
            <p className="text-xs text-gray-700">{rec}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onApplyAIRecommendations}
          className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-all"
        >
          Apply All
        </button>
        <button
          onClick={() => setAiRecommendations([])}
          className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

