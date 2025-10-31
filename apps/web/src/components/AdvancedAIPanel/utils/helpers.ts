import { AIModel } from '../types';

/**
 * Find model data by ID
 */
export const findModelById = (models: AIModel[], modelId: string): AIModel | undefined => {
  return models.find(m => m.id === modelId);
};

/**
 * Format model info for display
 */
export const formatModelInfo = (model: AIModel): string => {
  return `${model.name} • ${model.provider}`;
};

/**
 * Format model details for display
 */
export const formatModelDetails = (model: AIModel): {
  maxTokens: string;
  costPerToken: string;
  provider: string;
} => {
  return {
    maxTokens: model.maxTokens.toLocaleString(),
    costPerToken: model.costPerToken.toFixed(6),
    provider: model.provider
  };
};

