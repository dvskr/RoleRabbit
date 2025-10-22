'use client';

import React, { useState } from 'react';
import { Edit, Save, X, Plus, Bot, Sparkles } from 'lucide-react';

interface SummarySectionProps {
  summary: string;
  onUpdate: (summary: string) => void;
}

export default function SummarySection({ summary, onUpdate }: SummarySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editSummary, setEditSummary] = useState(summary);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const handleSave = () => {
    onUpdate(editSummary);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditSummary(summary);
    setIsEditing(false);
  };

  const handleAIGenerate = () => {
    // Simulate AI generation
    const aiGeneratedSummary = "Experienced professional with a proven track record of delivering results in fast-paced environments. Skilled in strategic thinking, team leadership, and cross-functional collaboration. Passionate about driving innovation and continuous improvement.";
    setEditSummary(aiGeneratedSummary);
    setShowAIGenerator(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Professional Summary</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAIGenerator(true)}
            className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
            title="AI Generate Summary"
          >
            <Bot size={16} className="text-purple-600" />
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Write a compelling professional summary
            </label>
            <textarea
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Describe your professional background, key skills, and career objectives..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {editSummary.length} characters (recommended: 150-300 characters)
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {summary ? (
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Sparkles size={32} className="mx-auto mb-2 text-gray-400" />
              <p>No summary added yet</p>
              <p className="text-sm">Click edit to add your professional summary</p>
            </div>
          )}
        </div>
      )}

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Summary Generator</h3>
              <button
                onClick={() => setShowAIGenerator(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Generate a professional summary based on your experience and skills.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAIGenerator(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAIGenerate}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Bot size={16} />
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
