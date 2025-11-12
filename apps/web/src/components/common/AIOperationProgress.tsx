'use client';

import React from 'react';
import { Loader2, CheckCircle2, Circle, X } from 'lucide-react';

export type AIOperationType = 'ats' | 'tailor' | 'parse' | 'generate';

export interface AIOperationProgressProps {
  operation: AIOperationType;
  stage: string;
  progress: number; // 0-100
  estimatedTime?: number; // seconds
  elapsedTime: number; // seconds
  message?: string;
  onCancel?: () => void;
}

const OPERATION_STAGES = {
  ats: [
    'Analyzing job description',
    'Extracting requirements',
    'Semantic skill matching',
    'Calculating scores',
    'Generating recommendations'
  ],
  tailor: [
    'Analyzing resume',
    'Identifying gaps',
    'Generating improvements',
    'Optimizing content',
    'Finalizing changes'
  ],
  parse: [
    'Reading file',
    'Extracting text',
    'Identifying sections',
    'Parsing experience',
    'Finalizing structure'
  ],
  generate: [
    'Understanding context',
    'Generating content',
    'Refining output',
    'Finalizing'
  ]
};

const OPERATION_LABELS = {
  ats: 'Running ATS Analysis',
  tailor: 'Tailoring Resume',
  parse: 'Parsing Resume',
  generate: 'Generating Content'
};

const OPERATION_COLORS = {
  ats: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    subtext: 'text-blue-700',
    progress: 'bg-blue-600',
    progressBg: 'bg-blue-100'
  },
  tailor: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    subtext: 'text-purple-700',
    progress: 'bg-purple-600',
    progressBg: 'bg-purple-100'
  },
  parse: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    subtext: 'text-green-700',
    progress: 'bg-green-600',
    progressBg: 'bg-green-100'
  },
  generate: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-900',
    subtext: 'text-indigo-700',
    progress: 'bg-indigo-600',
    progressBg: 'bg-indigo-100'
  }
};

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

export function AIOperationProgress({
  operation,
  stage,
  progress,
  estimatedTime,
  elapsedTime,
  message,
  onCancel
}: AIOperationProgressProps) {
  const stages = OPERATION_STAGES[operation];
  const colors = OPERATION_COLORS[operation];
  const label = OPERATION_LABELS[operation];

  const currentStageIndex = stages.findIndex(s => 
    stage.toLowerCase().includes(s.toLowerCase()) || 
    s.toLowerCase().includes(stage.toLowerCase())
  );

  const remainingTime = estimatedTime ? Math.max(0, estimatedTime - elapsedTime) : 0;

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-4 space-y-3 shadow-sm`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Loader2 className={`w-5 h-5 animate-spin ${colors.subtext}`} />
          <span className={`font-medium ${colors.text}`}>
            {label}
          </span>
        </div>
        {onCancel && (
          <button 
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
            aria-label="Cancel operation"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className={colors.subtext}>
            {message || stage}
          </span>
          <span className={`${colors.subtext} font-medium`}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className={`w-full ${colors.progressBg} rounded-full h-2 overflow-hidden`}>
          <div
            className={`${colors.progress} h-full transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Stage Indicators */}
      <div className="space-y-1.5">
        {stages.map((stageName, index) => {
          const status = 
            index < currentStageIndex ? 'complete' :
            index === currentStageIndex ? 'active' :
            'pending';

          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              {status === 'complete' && (
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              )}
              {status === 'active' && (
                <Loader2 className={`w-4 h-4 animate-spin ${colors.subtext} flex-shrink-0`} />
              )}
              {status === 'pending' && (
                <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
              )}
              <span className={
                status === 'complete' ? 'text-green-700' :
                status === 'active' ? `${colors.subtext} font-medium` :
                'text-gray-400'
              }>
                {stageName}
              </span>
              {status === 'complete' && (
                <span className="text-xs text-green-600 ml-auto">
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Time Info */}
      <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
        <span className={colors.subtext}>
          ⏱️ Elapsed: {formatTime(elapsedTime)}
        </span>
        {estimatedTime && remainingTime > 0 && (
          <span className={colors.subtext}>
            📊 Est. remaining: ~{formatTime(remainingTime)}
          </span>
        )}
      </div>
    </div>
  );
}

