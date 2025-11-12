import React from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

interface ProgressStage {
  key: string;
  label: string;
  progress: number;
  status: 'completed' | 'in_progress' | 'pending';
  duration?: number;
}

interface EnhancedProgressTrackerProps {
  operation: 'tailor' | 'ats' | 'cover_letter' | 'portfolio';
  currentStage: string;
  progress: number;
  message: string;
  elapsedTime?: number;
  estimatedTimeRemaining?: number;
  colors: {
    text: string;
    textSecondary: string;
    border: string;
    activeBlueText: string;
  };
}

const TAILOR_STAGES = [
  { key: 'validating', label: 'Validation', progress: 5 },
  { key: 'analyzing_resume', label: 'Resume Analysis', progress: 15 },
  { key: 'analyzing_job', label: 'Job Analysis', progress: 35 },
  { key: 'calculating_gaps', label: 'Gap Analysis', progress: 50 },
  { key: 'tailoring', label: 'AI Tailoring', progress: 70 },
  { key: 'enhancing', label: 'Enhancement', progress: 85 },
  { key: 'scoring', label: 'Quality Check', progress: 95 },
  { key: 'complete', label: 'Complete', progress: 100 },
];

const ATS_STAGES = [
  { key: 'parsing', label: 'Parsing', progress: 10 },
  { key: 'extracting', label: 'Skill Extraction', progress: 30 },
  { key: 'analyzing_job', label: 'Job Analysis', progress: 50 },
  { key: 'matching', label: 'Matching', progress: 70 },
  { key: 'scoring', label: 'Scoring', progress: 90 },
  { key: 'complete', label: 'Complete', progress: 100 },
];

function getStagesForOperation(operation: string) {
  switch (operation) {
    case 'tailor':
      return TAILOR_STAGES;
    case 'ats':
      return ATS_STAGES;
    default:
      return TAILOR_STAGES;
  }
}

function formatTime(seconds: number): string {
  if (seconds < 0) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}

export default function EnhancedProgressTracker({
  operation,
  currentStage,
  progress,
  message,
  elapsedTime = 0,
  estimatedTimeRemaining = 0,
  colors
}: EnhancedProgressTrackerProps) {
  const stages = getStagesForOperation(operation);

  // Calculate stage statuses
  const stagesWithStatus: ProgressStage[] = stages.map((stage) => {
    let status: 'completed' | 'in_progress' | 'pending';
    
    if (stage.progress < progress || (stage.key === 'complete' && progress === 100)) {
      status = 'completed';
    } else if (stage.key === currentStage) {
      status = 'in_progress';
    } else {
      status = 'pending';
    }

    return { ...stage, status };
  });

  const getStageIcon = (stage: ProgressStage) => {
    switch (stage.status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" style={{ color: '#10b981' }} />;
      case 'in_progress':
        return <Loader2 className="w-4 h-4 animate-spin" style={{ color: colors.activeBlueText }} />;
      case 'pending':
        return <Circle className="w-4 h-4" style={{ color: colors.border }} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium" style={{ color: colors.text }}>
            {message}
          </span>
          <span className="font-bold" style={{ color: colors.activeBlueText }}>
            {Math.round(progress)}%
          </span>
        </div>
        
        <div 
          className="h-2 rounded-full overflow-hidden" 
          style={{ background: colors.border }}
        >
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${colors.activeBlueText}, #10b981)`,
            }}
          />
        </div>

        {/* Time Information */}
        <div className="flex items-center justify-between text-xs" style={{ color: colors.textSecondary }}>
          <span>
            ⏱️ Elapsed: {formatTime(elapsedTime)}
          </span>
          {estimatedTimeRemaining > 0 && progress < 100 && (
            <span>
              About {formatTime(estimatedTimeRemaining)} remaining
            </span>
          )}
        </div>
      </div>

      {/* Stage Breakdown */}
      <div 
        className="space-y-1.5 p-3 rounded-lg" 
        style={{ 
          background: colors.border + '20',
          border: `1px solid ${colors.border}`
        }}
      >
        <div className="text-xs font-medium mb-2" style={{ color: colors.text }}>
          Progress Stages:
        </div>
        
        {stagesWithStatus.map((stage, idx) => (
          <div
            key={stage.key}
            className="flex items-center gap-2 text-xs"
            style={{
              color: stage.status === 'pending' ? colors.textSecondary : colors.text,
              opacity: stage.status === 'pending' ? 0.6 : 1
            }}
          >
            {getStageIcon(stage)}
            <span className={stage.status === 'in_progress' ? 'font-medium' : ''}>
              {stage.label}
            </span>
            {stage.status === 'completed' && stage.duration && (
              <span style={{ color: colors.textSecondary }}>
                ({formatTime(stage.duration)})
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {progress === 100 && (
        <div
          className="text-center py-2 px-3 rounded-lg text-sm font-medium"
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}
        >
          🎉 {operation === 'tailor' ? 'Tailoring' : 'Analysis'} complete!
        </div>
      )}
    </div>
  );
}

