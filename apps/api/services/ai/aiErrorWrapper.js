/**
 * AI Error Wrapper
 * Wraps AI operations with comprehensive error handling and retry logic
 */

const { parseError, AIServiceError, logError } = require('../../utils/errorHandler');
const { retryOpenAI } = require('../../utils/retryHandler');
const logger = require('../../utils/logger');

/**
 * Wrap AI generation call with error handling
 */
async function wrapAIGeneration(fn, context = {}) {
  const startTime = Date.now();
  
  try {
    // Execute with retry logic
    const result = await retryOpenAI(async () => {
      try {
        return await fn();
      } catch (error) {
        // Parse and enhance error
        const parsedError = parseError(error);
        
        // Add context
        parsedError.metadata = {
          ...parsedError.metadata,
          ...context,
          elapsedMs: Date.now() - startTime
        };
        
        throw parsedError;
      }
    });
    
    // Log successful completion
    logger.info('AI generation successful', {
      ...context,
      elapsedMs: Date.now() - startTime
    });
    
    return result;
    
  } catch (error) {
    // Final error after all retries
    const duration = Date.now() - startTime;
    
    logError(error, {
      operation: 'AI Generation',
      ...context,
      elapsedMs: duration
    });
    
    // Re-throw for caller to handle
    throw error;
  }
}

/**
 * Wrap tailoring operation with comprehensive error handling
 */
async function wrapTailoringOperation(fn, options = {}) {
  const {
    userId,
    resumeId,
    mode,
    onProgress
  } = options;
  
  const context = {
    operation: 'tailor_resume',
    userId,
    resumeId,
    mode
  };
  
  try {
    return await wrapAIGeneration(fn, context);
  } catch (error) {
    // Provide helpful error message based on error type
    if (error.code === 'CONTENT_TOO_LARGE') {
      error.userMessage = 'Your resume or job description is too long. Try:\n' +
        '1. Shortening the job description to key requirements\n' +
        '2. Using Partial mode instead of Full\n' +
        '3. Removing less relevant experience from your resume';
    } else if (error.code === 'QUOTA_EXCEEDED') {
      error.userMessage = 'AI service quota exceeded. This has been reported to our team. ' +
        'Please try again in a few minutes or contact support if the issue persists.';
    } else if (error.category === 'RATE_LIMIT') {
      error.userMessage = `Please wait ${error.retryAfter || 60} seconds before trying again. ` +
        'If you need to tailor multiple resumes, consider using Partial mode which is faster.';
    }
    
    // Update progress if callback provided
    if (onProgress) {
      onProgress({
        isActive: false,
        stage: 'ERROR',
        progress: 0,
        message: error.userMessage || 'An error occurred',
        error: true
      });
    }
    
    throw error;
  }
}

/**
 * Validate AI response and provide helpful errors
 */
function validateAIResponse(response, expectedFields = []) {
  if (!response) {
    throw new AIServiceError(
      'Empty response from AI',
      null,
      {
        userMessage: 'AI returned an empty response. Please try again.',
        code: 'EMPTY_RESPONSE'
      }
    );
  }
  
  // Check for required fields
  const missingFields = expectedFields.filter(field => !response[field]);
  if (missingFields.length > 0) {
    throw new AIServiceError(
      `Missing required fields in AI response: ${missingFields.join(', ')}`,
      null,
      {
        userMessage: 'AI response was incomplete. Please try again.',
        code: 'INCOMPLETE_RESPONSE',
        metadata: { missingFields }
      }
    );
  }
  
  return response;
}

/**
 * Handle JSON parsing errors from AI responses
 */
function safeJSONParse(text, fallback = null) {
  try {
    // Try direct parse
    return JSON.parse(text);
  } catch (error) {
    logger.warn('JSON parse failed, attempting repair', {
      textLength: text?.length,
      textPreview: text?.substring(0, 100)
    });
    
    try {
      // Try with jsonrepair
      const { jsonrepair } = require('jsonrepair');
      const repaired = jsonrepair(text);
      return JSON.parse(repaired);
    } catch (repairError) {
      logger.error('JSON repair also failed', {
        originalError: error.message,
        repairError: repairError.message
      });
      
      if (fallback !== null) {
        logger.warn('Using fallback value for failed JSON parse');
        return fallback;
      }
      
      throw new AIServiceError(
        'Failed to parse AI response',
        error,
        {
          userMessage: 'AI response was malformed. Please try again.',
          code: 'INVALID_JSON',
          metadata: {
            textPreview: text?.substring(0, 200)
          }
        }
      );
    }
  }
}

/**
 * Create fallback response when AI fails
 */
function createFallbackResponse(type, context = {}) {
  logger.warn('Creating fallback response', { type, context });
  
  const fallbacks = {
    tailor: {
      mode: context.mode || 'PARTIAL',
      tailoredResume: context.originalResume || {},
      diff: [],
      recommendedKeywords: [],
      warnings: ['AI service unavailable - returning original resume'],
      confidence: 0,
      estimatedScoreImprovement: 0,
      fallback: true
    },
    
    coverLetter: {
      content: 'We apologize, but the AI service is currently unavailable. ' +
        'Please try again in a few moments.',
      confidence: 0,
      warnings: ['AI service unavailable'],
      fallback: true
    },
    
    portfolio: {
      sections: [],
      warnings: ['AI service unavailable'],
      fallback: true
    }
  };
  
  return fallbacks[type] || { fallback: true, warnings: ['Service unavailable'] };
}

module.exports = {
  wrapAIGeneration,
  wrapTailoringOperation,
  validateAIResponse,
  safeJSONParse,
  createFallbackResponse
};

