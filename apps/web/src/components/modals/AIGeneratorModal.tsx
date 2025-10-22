'use client';

import React, { useState } from 'react';
import { X, Sparkles, Bot, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSection: string | null;
  targetExperienceId: number | null;
  onGenerate: (prompt: string, tone: string, length: string) => void;
  isGenerating: boolean;
  generatedContent: string;
}

const toneOptions = [
  { id: 'professional', name: 'Professional', icon: '💼', description: 'Formal and polished' },
  { id: 'technical', name: 'Technical', icon: '⚙️', description: 'Detailed and precise' },
  { id: 'creative', name: 'Creative', icon: '🎨', description: 'Dynamic and engaging' },
  { id: 'executive', name: 'Executive', icon: '👔', description: 'Strategic and leadership-focused' },
  { id: 'results', name: 'Results', icon: '📊', description: 'Metrics and impact-focused' }
];

const lengthOptions = [
  { id: 'concise', name: 'Concise', description: 'Short and punchy' },
  { id: 'medium', name: 'Medium', description: 'Balanced detail' },
  { id: 'detailed', name: 'Detailed', description: 'Full detail' }
];

export default function AIGeneratorModal({
  isOpen,
  onClose,
  targetSection,
  targetExperienceId,
  onGenerate,
  isGenerating,
  generatedContent
}: AIGeneratorModalProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedLength, setSelectedLength] = useState('medium');
  const [inputType, setInputType] = useState<'auto' | 'prompt' | 'job'>('auto');

  const detectInputType = (text: string) => {
    if (text.toLowerCase().includes('job description') || text.toLowerCase().includes('requirements')) {
      return 'job';
    } else if (text.length > 50) {
      return 'prompt';
    }
    return 'auto';
  };

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt, selectedTone, selectedLength);
    }
  };

  const handleClose = () => {
    setPrompt('');
    setSelectedTone('professional');
    setSelectedLength('medium');
    setInputType('auto');
    onClose();
  };

  if (!isOpen || !targetSection) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Generate for {targetSection.charAt(0).toUpperCase() + targetSection.slice(1)}
              </h3>
              <p className="text-sm text-gray-500">Create professional content with AI assistance</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* AI Assistant Tip */}
        <div className="mb-4">
          <div className="text-xs font-medium text-amber-700 bg-amber-100/80 px-3 py-2 rounded-full border border-amber-200 text-center">
            💡 Use AI Assistant for advanced tailoring
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-gray-800">
                What would you like to generate?
              </label>
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 animate-pulse"></div>
            </div>
            
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  const detected = detectInputType(e.target.value);
                  setInputType(detected);
                }}
                placeholder="Start typing your prompt or paste a job description..."
                className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-500"
                rows={3}
              />
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
              </div>
            </div>

            {/* Input Examples */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600">📋</span>
                  <span className="text-xs font-semibold text-blue-800">Job Description</span>
                </div>
                <p className="text-xs text-blue-700 leading-relaxed">
                  "Software Engineer with 3+ years experience in React, Node.js, and AWS. Must have experience with microservices..."
                </p>
              </div>
              <div className="p-3 bg-green-50/50 rounded-xl border border-green-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600">✨</span>
                  <span className="text-xs font-semibold text-green-800">Creative Prompt</span>
                </div>
                <p className="text-xs text-green-700 leading-relaxed">
                  "Experienced data engineer with expertise in Python, AWS, and machine learning algorithms..."
                </p>
              </div>
            </div>

            {/* Detection Status */}
            {prompt && (
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  {inputType === 'job' ? (
                    <>
                      <CheckCircle size={16} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Job Description Detected</span>
                    </>
                  ) : inputType === 'prompt' ? (
                    <>
                      <Zap size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-green-800">Creative Prompt</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">Auto-detecting...</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {prompt.length} characters
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tone and Length Selection */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tone Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tone</label>
              <div className="space-y-2">
                {toneOptions.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setSelectedTone(tone.id)}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                      selectedTone === tone.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{tone.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{tone.name}</div>
                        <div className="text-xs text-gray-600">{tone.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Length Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Length</label>
              <div className="space-y-2">
                {lengthOptions.map((length) => (
                  <button
                    key={length.id}
                    onClick={() => setSelectedLength(length.id)}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                      selectedLength === length.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{length.name}</div>
                    <div className="text-xs text-gray-600">{length.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generated Content Preview */}
        {generatedContent && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Generated Content:</h4>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{generatedContent}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Bot size={16} />
                Generate Content
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
