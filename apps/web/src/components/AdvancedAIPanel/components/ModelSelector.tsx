import React from 'react';
import { AIModel } from '../types';
import { formatModelDetails } from '../utils/helpers';

interface ModelSelectorProps {
  availableModels: AIModel[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  availableModels,
  selectedModel,
  onModelChange
}) => {
  const selectedModelData = availableModels.find(m => m.id === selectedModel);
  const modelDetails = selectedModelData ? formatModelDetails(selectedModelData) : null;

  return (
    <div className="p-4 border-b border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="ai-model-select">
        AI Model
      </label>
      <select
        id="ai-model-select"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        aria-label="Select AI Model"
      >
        {availableModels.map((model) => (
          <option key={model.id} value={model.id} disabled={!model.isAvailable}>
            {model.name} - {model.description}
          </option>
        ))}
      </select>
      
      {modelDetails && (
        <div className="mt-2 text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span>Max tokens: {modelDetails.maxTokens}</span>
            <span>Cost: ${modelDetails.costPerToken}/token</span>
            <span>Provider: {modelDetails.provider}</span>
          </div>
        </div>
      )}
    </div>
  );
};

