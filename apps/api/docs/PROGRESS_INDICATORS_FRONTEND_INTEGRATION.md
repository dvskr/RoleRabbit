# Progress Indicators - Frontend Integration Guide

## Overview

The backend progress tracking system is **fully implemented** and ready to use. This guide explains how to integrate progress indicators into the frontend for resume parsing, ATS analysis, and tailoring operations.

## Backend Status ✅

**Completed:**
- ✅ Progress tracking utility (`apps/api/utils/progressTracker.js`)
- ✅ Socket.IO server with progress events (`apps/api/utils/socketIOServer.js`)
- ✅ Integration into tailoring service
- ✅ Progress stages defined (7 for tailoring, 5 for ATS)
- ✅ Real-time progress updates (0-100%)
- ✅ Time estimation and elapsed time tracking

## Frontend Integration Tasks

### 1. Socket.IO Event Listeners

Add event listeners in your WebSocket service or component:

```typescript
// In apps/web/src/services/webSocketService.ts or similar

// Tailoring progress
socket.on('resume:tailoring_progress', (data) => {
  console.log('Tailoring progress:', data);
  // data = {
  //   operationId: 'tailor_user123_1234567890',
  //   operation: 'tailor',
  //   stage: 'tailoring',
  //   stageLabel: 'AI Tailoring',
  //   progress: 70,
  //   message: 'Optimizing your resume...',
  //   elapsedTime: 15,
  //   estimatedTimeRemaining: 10,
  //   timestamp: '2024-11-14T...'
  // }
  
  // Update UI with progress
  updateProgressModal(data);
});

// ATS progress
socket.on('resume:ats_progress', (data) => {
  console.log('ATS progress:', data);
  updateProgressModal(data);
});

// Parsing progress
socket.on('resume:parsing_progress', (data) => {
  console.log('Parsing progress:', data);
  updateProgressModal(data);
});

// Operation complete
socket.on('resume:operation_complete', (data) => {
  console.log('Operation complete:', data);
  closeProgressModal();
  showSuccessMessage(data.result);
});

// Operation failed
socket.on('resume:operation_failed', (data) => {
  console.log('Operation failed:', data);
  closeProgressModal();
  showErrorMessage(data.error);
});
```

### 2. Progress Modal Component

Create a reusable progress modal component:

```typescript
// apps/web/src/components/modals/ProgressModal.tsx

import React from 'react';

interface ProgressModalProps {
  isOpen: boolean;
  operation: 'parsing' | 'ats' | 'tailoring';
  progress: number;
  stage: string;
  stageLabel: string;
  message: string;
  elapsedTime: number;
  estimatedTimeRemaining: number;
  onCancel?: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  operation,
  progress,
  stage,
  stageLabel,
  message,
  elapsedTime,
  estimatedTimeRemaining,
  onCancel
}) => {
  if (!isOpen) return null;

  const operationTitles = {
    parsing: 'Parsing Resume',
    ats: 'Analyzing ATS Score',
    tailoring: 'Tailoring Resume'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {operationTitles[operation]}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{stageLabel}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{message}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Time Information */}
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>Elapsed: {elapsedTime}s</span>
          {estimatedTimeRemaining > 0 && (
            <span>Remaining: ~{estimatedTimeRemaining}s</span>
          )}
        </div>

        {/* Stages Indicator (Optional) */}
        {operation === 'tailoring' && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400">
              {['Validating', 'Analyzing', 'Tailoring', 'Scoring'].map((s, i) => (
                <div
                  key={s}
                  className={`flex-1 text-center ${
                    progress > i * 25 ? 'text-blue-600 font-medium' : ''
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Button (Optional) */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}

        {/* Loading Animation */}
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
};
```

### 3. Progress Hook

Create a custom hook to manage progress state:

```typescript
// apps/web/src/hooks/useOperationProgress.ts

import { useState, useEffect, useCallback } from 'react';
import { webSocketService } from '@/services/webSocketService';

interface ProgressData {
  operationId: string;
  operation: 'parsing' | 'ats' | 'tailoring';
  stage: string;
  stageLabel: string;
  progress: number;
  message: string;
  elapsedTime: number;
  estimatedTimeRemaining: number;
}

export const useOperationProgress = () => {
  const [isActive, setIsActive] = useState(false);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for progress updates
    const handleTailoringProgress = (data: any) => {
      setIsActive(true);
      setProgressData({
        ...data,
        operation: 'tailoring'
      });
    };

    const handleATSProgress = (data: any) => {
      setIsActive(true);
      setProgressData({
        ...data,
        operation: 'ats'
      });
    };

    const handleParsingProgress = (data: any) => {
      setIsActive(true);
      setProgressData({
        ...data,
        operation: 'parsing'
      });
    };

    const handleOperationComplete = (data: any) => {
      setIsActive(false);
      setResult(data.result);
      setProgressData(null);
    };

    const handleOperationFailed = (data: any) => {
      setIsActive(false);
      setError(data.error);
      setProgressData(null);
    };

    // Register event listeners
    webSocketService.on('resume:tailoring_progress', handleTailoringProgress);
    webSocketService.on('resume:ats_progress', handleATSProgress);
    webSocketService.on('resume:parsing_progress', handleParsingProgress);
    webSocketService.on('resume:operation_complete', handleOperationComplete);
    webSocketService.on('resume:operation_failed', handleOperationFailed);

    // Cleanup
    return () => {
      webSocketService.off('resume:tailoring_progress', handleTailoringProgress);
      webSocketService.off('resume:ats_progress', handleATSProgress);
      webSocketService.off('resume:parsing_progress', handleParsingProgress);
      webSocketService.off('resume:operation_complete', handleOperationComplete);
      webSocketService.off('resume:operation_failed', handleOperationFailed);
    };
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setProgressData(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    isActive,
    progressData,
    result,
    error,
    reset
  };
};
```

### 4. Integration in AIPanel (Tailoring)

Update the AIPanel component to show progress:

```typescript
// In apps/web/src/components/features/AIPanel/AIPanelRedesigned.tsx

import { useOperationProgress } from '@/hooks/useOperationProgress';
import { ProgressModal } from '@/components/modals/ProgressModal';

export const AIPanelRedesigned = () => {
  const { isActive, progressData, result, error, reset } = useOperationProgress();
  
  // ... existing code ...

  // Show progress modal during tailoring
  return (
    <>
      {/* Existing AIPanel UI */}
      {/* ... */}

      {/* Progress Modal */}
      {isActive && progressData && (
        <ProgressModal
          isOpen={isActive}
          operation={progressData.operation}
          progress={progressData.progress}
          stage={progressData.stage}
          stageLabel={progressData.stageLabel}
          message={progressData.message}
          elapsedTime={progressData.elapsedTime}
          estimatedTimeRemaining={progressData.estimatedTimeRemaining}
          // onCancel={() => {
          //   // TODO: Implement cancellation
          //   reset();
          // }}
        />
      )}

      {/* Success/Error handling */}
      {result && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md">
          Operation completed successfully!
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md">
          {error}
        </div>
      )}
    </>
  );
};
```

### 5. Integration in ImportModal (Parsing)

Similar integration for resume parsing:

```typescript
// In apps/web/src/components/modals/ImportModal.tsx

import { useOperationProgress } from '@/hooks/useOperationProgress';
import { ProgressModal } from '@/components/modals/ProgressModal';

export const ImportModal = () => {
  const { isActive, progressData, result, error, reset } = useOperationProgress();
  
  // ... existing code ...

  return (
    <>
      {/* Existing ImportModal UI */}
      {/* ... */}

      {/* Progress Modal for parsing */}
      {isActive && progressData && progressData.operation === 'parsing' && (
        <ProgressModal
          isOpen={isActive}
          operation="parsing"
          progress={progressData.progress}
          stage={progressData.stage}
          stageLabel={progressData.stageLabel}
          message={progressData.message}
          elapsedTime={progressData.elapsedTime}
          estimatedTimeRemaining={progressData.estimatedTimeRemaining}
        />
      )}
    </>
  );
};
```

## Progress Stages

### Tailoring (7 stages)

1. **Validating** (5%) - "Checking resume and job description..."
2. **Analyzing Resume** (15%) - "Extracting your key skills and experience..."
3. **Analyzing Job** (35%) - "Understanding job requirements..."
4. **Calculating Gaps** (50%) - "Finding areas for improvement..."
5. **AI Tailoring** (70%) - "Optimizing your resume..."
6. **Enhancing Content** (85%) - "Adding missing keywords and improving phrasing..."
7. **Scoring** (95%) - "Calculating ATS score improvement..."
8. **Complete** (100%) - "Tailoring complete! 🎉"

### ATS Analysis (5 stages)

1. **Parsing** (10%) - "Reading resume content..."
2. **Extracting Skills** (30%) - "Identifying your skills..."
3. **Analyzing Job** (50%) - "Understanding job requirements..."
4. **Matching Skills** (70%) - "Comparing your skills to job requirements..."
5. **Calculating Score** (90%) - "Computing ATS compatibility score..."
6. **Complete** (100%) - "Analysis complete!"

### Resume Parsing (3 stages)

1. **Uploading** (10%) - "Uploading file..."
2. **Extracting** (50%) - "Extracting text from resume..."
3. **Structuring** (90%) - "Organizing resume data..."
4. **Complete** (100%) - "Resume parsed successfully!"

## Testing

### 1. Test Socket.IO Connection

```typescript
// In browser console
const socket = io('http://localhost:3001', {
  auth: { userId: 'your-user-id' }
});

socket.on('connect', () => {
  console.log('Connected to Socket.IO');
});

socket.on('resume:tailoring_progress', (data) => {
  console.log('Progress:', data);
});
```

### 2. Test Progress Updates

1. Start a tailoring operation
2. Open browser DevTools → Network → WS (WebSocket)
3. Watch for `resume:tailoring_progress` events
4. Verify progress updates from 0% to 100%

### 3. Test Error Handling

1. Disconnect internet
2. Start a tailoring operation
3. Verify error message shows
4. Verify progress modal closes

## Styling Recommendations

### Progress Bar Colors

- **Parsing**: Blue (`bg-blue-600`)
- **ATS**: Green (`bg-green-600`)
- **Tailoring**: Purple (`bg-purple-600`)

### Animations

```css
/* Smooth progress bar animation */
.progress-bar {
  transition: width 0.3s ease-in-out;
}

/* Pulsing dot for active stage */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.active-stage {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Spinning loader */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

## Accessibility

- Use `aria-live="polite"` for progress announcements
- Use `role="progressbar"` for progress bar
- Provide `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Ensure keyboard navigation works
- Provide screen reader text for stage changes

```tsx
<div
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`${operationTitles[operation]}: ${progress}% complete`}
>
  <div className="sr-only" aria-live="polite">
    {message}
  </div>
  {/* Visual progress bar */}
</div>
```

## Future Enhancements

### Operation Cancellation (Deferred)

To implement cancellation:

1. Add `AbortController` to backend operations
2. Store operation ID → AbortController mapping
3. Add cancel endpoint: `POST /api/operations/:operationId/cancel`
4. Emit cancellation event via Socket.IO
5. Clean up resources on cancellation

```typescript
// Frontend
const cancelOperation = async (operationId: string) => {
  await fetch(`/api/operations/${operationId}/cancel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// Backend
const abortControllers = new Map();

// When starting operation
const controller = new AbortController();
abortControllers.set(operationId, controller);

// In cancel endpoint
const controller = abortControllers.get(operationId);
if (controller) {
  controller.abort();
  abortControllers.delete(operationId);
  socketIOServer.notifyOperationFailed(userId, operationId, operation, 'Operation cancelled by user');
}
```

## Troubleshooting

### Progress not showing

1. Check Socket.IO connection: `socket.connected`
2. Verify user is authenticated with Socket.IO
3. Check browser console for errors
4. Verify backend is emitting events (check server logs)

### Progress stuck at certain percentage

1. Check backend logs for errors
2. Verify progress tracker is updating
3. Check for unhandled exceptions in service

### Multiple progress modals showing

1. Ensure only one operation runs at a time
2. Use operation ID to track current operation
3. Close previous modal before starting new operation

## Summary

**Backend:** ✅ Complete and ready to use  
**Frontend:** ⏳ Integration pending

The backend progress tracking system is fully implemented and tested. Follow this guide to integrate progress indicators into your frontend components. The system provides real-time updates via Socket.IO, with detailed progress stages, time estimation, and error handling.

---

**Last Updated**: November 14, 2024  
**Version**: 1.0.0

