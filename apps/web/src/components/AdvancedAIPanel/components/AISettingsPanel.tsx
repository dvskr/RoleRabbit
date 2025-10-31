import React from 'react';
import { AISettings } from '../types';

interface AISettingsPanelProps {
  settings: AISettings;
  onSettingsChange: (settings: AISettings) => void;
}

export const AISettingsPanel: React.FC<AISettingsPanelProps> = ({
  settings,
  onSettingsChange
}) => {
  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <h4 className="text-sm font-medium text-gray-700 mb-3">AI Settings</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="temperature-slider">
            Temperature: {settings.temperature}
          </label>
          {/* eslint-disable-next-line jsx-a11y/aria-proptypes */}
          <input
            id="temperature-slider"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => onSettingsChange({ ...settings, temperature: parseFloat(e.target.value) })}
            className="w-full"
            aria-label="Temperature setting"
            aria-valuemin={0}
            aria-valuemax={2}
            aria-valuenow={settings.temperature}
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="max-tokens-slider">
            Max Tokens: {settings.maxTokens}
          </label>
          {/* eslint-disable-next-line jsx-a11y/aria-proptypes */}
          <input
            id="max-tokens-slider"
            type="range"
            min="100"
            max="4000"
            step="100"
            value={settings.maxTokens}
            onChange={(e) => onSettingsChange({ ...settings, maxTokens: parseInt(e.target.value) })}
            className="w-full"
            aria-label="Max tokens setting"
            aria-valuemin={100}
            aria-valuemax={4000}
            aria-valuenow={settings.maxTokens}
          />
        </div>
      </div>
    </div>
  );
};

