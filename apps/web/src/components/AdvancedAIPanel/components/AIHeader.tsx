import React from 'react';
import { Brain, Settings, RefreshCw, CheckCircle } from 'lucide-react';
import { AIModel } from '../types';
import { formatModelInfo } from '../utils/helpers';

interface AIHeaderProps {
  selectedModel: AIModel | undefined;
  isStreaming?: boolean;
  showSettings: boolean;
  onToggleSettings: () => void;
}

export const AIHeader: React.FC<AIHeaderProps> = ({
  selectedModel,
  isStreaming = false,
  showSettings,
  onToggleSettings
}) => {
  const modelInfo = selectedModel ? formatModelInfo(selectedModel) : '';

  return (
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-sm text-gray-600">
              {modelInfo}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSettings}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="AI Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1 text-sm text-gray-600">
            {isStreaming ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Ready</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

