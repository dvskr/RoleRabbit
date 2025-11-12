'use client';

import React from 'react';
import { Loader2, CheckCircle2, Sparkles, Wand2, FileText, Lightbulb } from 'lucide-react';

export type ButtonOperation = 'ats' | 'tailor' | 'parse' | 'generate';
export type ButtonState = 'idle' | 'loading' | 'complete';

export interface SmartButtonProps {
  operation: ButtonOperation;
  state: ButtonState;
  stage?: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const BUTTON_CONFIG = {
  ats: {
    idle: { label: 'Run ATS Check', icon: Sparkles },
    loading: { label: 'Analyzing', icon: Loader2 },
    complete: { label: 'Analysis Complete', icon: CheckCircle2 }
  },
  tailor: {
    idle: { label: 'Auto-Tailor Resume', icon: Wand2 },
    loading: { label: 'Tailoring', icon: Loader2 },
    complete: { label: 'Tailored', icon: CheckCircle2 }
  },
  parse: {
    idle: { label: 'Parse Resume', icon: FileText },
    loading: { label: 'Parsing', icon: Loader2 },
    complete: { label: 'Parsed', icon: CheckCircle2 }
  },
  generate: {
    idle: { label: 'Generate Content', icon: Lightbulb },
    loading: { label: 'Generating', icon: Loader2 },
    complete: { label: 'Generated', icon: CheckCircle2 }
  }
};

const STATE_COLORS = {
  idle: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
  loading: 'bg-blue-500 cursor-wait',
  complete: 'bg-green-600 hover:bg-green-700'
};

export function SmartButton({
  operation,
  state,
  stage,
  onClick,
  disabled = false,
  className = '',
  fullWidth = true
}: SmartButtonProps) {
  const config = BUTTON_CONFIG[operation][state];
  const Icon = config.icon;
  const colorClass = STATE_COLORS[state];

  const isDisabled = disabled || state === 'loading';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${fullWidth ? 'w-full' : ''}
        py-2.5 px-4 rounded-lg font-medium transition-all
        flex items-center justify-center gap-2
        ${colorClass}
        text-white
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        shadow-sm hover:shadow-md
        ${className}
      `}
      aria-label={`${config.label}${stage ? ` - ${stage}` : ''}`}
      aria-busy={state === 'loading'}
    >
      <Icon 
        className={`w-4 h-4 ${state === 'loading' ? 'animate-spin' : ''} flex-shrink-0`} 
      />
      <span className="flex-1">{config.label}</span>
      {stage && state === 'loading' && (
        <span className="text-xs opacity-75 ml-1 hidden sm:inline">
          ({stage})
        </span>
      )}
    </button>
  );
}

// Compact version for tight spaces
export function SmartButtonCompact({
  operation,
  state,
  onClick,
  disabled = false
}: Omit<SmartButtonProps, 'stage' | 'className' | 'fullWidth'>) {
  const config = BUTTON_CONFIG[operation][state];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      disabled={disabled || state === 'loading'}
      className={`
        p-2 rounded-md transition-all
        ${STATE_COLORS[state]}
        text-white
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500
      `}
      aria-label={config.label}
      title={config.label}
    >
      <Icon className={`w-4 h-4 ${state === 'loading' ? 'animate-spin' : ''}`} />
    </button>
  );
}

