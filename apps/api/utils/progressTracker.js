/**
 * Progress tracking utilities for long-running AI operations
 * 
 * Provides real-time progress updates to users during tailoring, ATS scoring, etc.
 */

const logger = require('./logger');

/**
 * Progress stages for resume tailoring
 */
const TAILOR_STAGES = {
  VALIDATING: {
    key: 'validating',
    label: 'Validating Input',
    progress: 5,
    message: 'Checking resume and job description...'
  },
  ANALYZING_RESUME: {
    key: 'analyzing_resume',
    label: 'Analyzing Resume',
    progress: 15,
    message: 'Extracting your key skills and experience...'
  },
  ANALYZING_JOB: {
    key: 'analyzing_job',
    label: 'Analyzing Job',
    progress: 35,
    message: 'Understanding job requirements...'
  },
  CALCULATING_GAPS: {
    key: 'calculating_gaps',
    label: 'Identifying Gaps',
    progress: 50,
    message: 'Finding areas for improvement...'
  },
  TAILORING: {
    key: 'tailoring',
    label: 'AI Tailoring',
    progress: 70,
    message: 'Optimizing your resume...'
  },
  ENHANCING: {
    key: 'enhancing',
    label: 'Enhancing Content',
    progress: 85,
    message: 'Adding missing keywords and improving phrasing...'
  },
  SCORING: {
    key: 'scoring',
    label: 'Quality Check',
    progress: 95,
    message: 'Calculating ATS score improvement...'
  },
  COMPLETE: {
    key: 'complete',
    label: 'Complete',
    progress: 100,
    message: 'Tailoring complete! 🎉'
  }
};

/**
 * Progress stages for ATS scoring
 */
const ATS_STAGES = {
  PARSING: {
    key: 'parsing',
    label: 'Parsing Resume',
    progress: 10,
    message: 'Reading resume content...'
  },
  EXTRACTING: {
    key: 'extracting',
    label: 'Extracting Skills',
    progress: 30,
    message: 'Identifying your skills...'
  },
  ANALYZING_JOB: {
    key: 'analyzing_job',
    label: 'Analyzing Job',
    progress: 50,
    message: 'Understanding job requirements...'
  },
  MATCHING: {
    key: 'matching',
    label: 'Matching Skills',
    progress: 70,
    message: 'Comparing your skills to job requirements...'
  },
  SCORING: {
    key: 'scoring',
    label: 'Calculating Score',
    progress: 90,
    message: 'Computing ATS compatibility score...'
  },
  COMPLETE: {
    key: 'complete',
    label: 'Complete',
    progress: 100,
    message: 'Analysis complete!'
  }
};

/**
 * Progress tracker class for managing operation progress
 */
class ProgressTracker {
  constructor(operation, stages, onProgress) {
    this.operation = operation; // 'tailor', 'ats', 'cover_letter', etc.
    this.stages = stages;
    this.onProgress = onProgress || (() => {});
    this.startTime = Date.now();
    this.currentStage = null;
    this.metadata = {};
  }

  /**
   * Update progress to a specific stage
   */
  update(stageKey, additionalData = {}) {
    const stage = this.stages[stageKey];
    if (!stage) {
      logger.warn(`Unknown progress stage: ${stageKey}`, {
        operation: this.operation,
        availableStages: Object.keys(this.stages)
      });
      return;
    }

    this.currentStage = stage;
    const elapsedMs = Date.now() - this.startTime;
    const elapsedSec = Math.round(elapsedMs / 1000);

    // Estimate remaining time based on current progress
    const estimatedTotalSec = this.estimateTotalTime(stage.progress, elapsedSec);
    const remainingSec = Math.max(0, estimatedTotalSec - elapsedSec);

    const progressData = {
      operation: this.operation,
      stage: stage.key,
      stageLabel: stage.label,
      progress: stage.progress,
      message: stage.message,
      elapsedTime: elapsedSec,
      estimatedTimeRemaining: remainingSec,
      timestamp: Date.now(),
      ...additionalData,
      ...this.metadata
    };

    // Call progress callback
    try {
      this.onProgress(progressData);
    } catch (error) {
      logger.error('Progress callback failed', {
        operation: this.operation,
        stage: stage.key,
        error: error.message
      });
    }

    // Log progress
    logger.info('Operation progress', {
      operation: this.operation,
      stage: stage.key,
      progress: stage.progress,
      elapsed: elapsedSec
    });

    return progressData;
  }

  /**
   * Set metadata that will be included in all progress updates
   */
  setMetadata(metadata) {
    this.metadata = { ...this.metadata, ...metadata };
  }

  /**
   * Estimate total operation time based on current progress
   */
  estimateTotalTime(currentProgress, elapsedSec) {
    if (currentProgress === 0) {
      return this.getDefaultEstimate();
    }
    
    // Linear extrapolation from current progress
    const estimatedTotal = (elapsedSec / currentProgress) * 100;
    
    // Clamp to reasonable bounds
    const defaultEstimate = this.getDefaultEstimate();
    return Math.max(
      defaultEstimate * 0.5, // At least 50% of default
      Math.min(
        defaultEstimate * 2, // At most 200% of default
        estimatedTotal
      )
    );
  }

  /**
   * Get default time estimate for operation
   */
  getDefaultEstimate() {
    const defaults = {
      'tailor': 25, // 25 seconds for tailoring
      'ats': 35, // 35 seconds for ATS
      'cover_letter': 15,
      'portfolio': 20
    };
    return defaults[this.operation] || 30;
  }

  /**
   * Mark operation as complete
   */
  complete(additionalData = {}) {
    return this.update('COMPLETE', additionalData);
  }

  /**
   * Get elapsed time in seconds
   */
  getElapsedTime() {
    return Math.round((Date.now() - this.startTime) / 1000);
  }
}

/**
 * Create a progress tracker for tailoring
 */
function createTailorProgressTracker(onProgress) {
  return new ProgressTracker('tailor', TAILOR_STAGES, onProgress);
}

/**
 * Create a progress tracker for ATS scoring
 */
function createATSProgressTracker(onProgress) {
  return new ProgressTracker('ats', ATS_STAGES, onProgress);
}

/**
 * Simulate progress updates (for testing without actual operation)
 */
async function simulateProgress(tracker, stages, delayMs = 2000) {
  const stageKeys = Object.keys(stages);
  
  for (const stageKey of stageKeys) {
    tracker.update(stageKey);
    
    if (stageKey !== 'COMPLETE') {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

module.exports = {
  ProgressTracker,
  TAILOR_STAGES,
  ATS_STAGES,
  createTailorProgressTracker,
  createATSProgressTracker,
  simulateProgress
};

