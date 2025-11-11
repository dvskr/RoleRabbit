/**
 * OpenAI Integration Utility
 * Wraps OpenAI API calls with error handling and usage tracking
 */

const OpenAI = require('openai');
const logger = require('./logger');
const { trackAIUsage } = require('./aiUsageTracker');

class AIServiceError extends Error {
  constructor(message, { statusCode = 500, code } = {}) {
    super(message);
    this.name = 'AIServiceError';
    this.statusCode = statusCode;
    this.code = code;
    this.isAIServiceError = true;
  }
}

let openaiClient = null;

/**
 * Initialize OpenAI client
 */
function initializeOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.warn('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    return null;
  }
  
  try {
    openaiClient = new OpenAI({ apiKey });
    logger.info('OpenAI client initialized successfully');
    return openaiClient;
  } catch (error) {
    logger.error('Failed to initialize OpenAI client', error);
    return null;
  }
}

/**
 * Generate text using OpenAI
 */
async function generateText(prompt, options = {}, requestOverrides = {}) {
  if (!openaiClient) {
    initializeOpenAIClient();
  }
  
  if (!openaiClient) {
    throw new Error('OpenAI not configured. Please set OPENAI_API_KEY environment variable.');
  }
  
  const model = options.model || 'gpt-4o-mini';
  const timeout = options.timeout || 90000; // 90 seconds default
  
  // Remove timeout from options before passing to OpenAI
  const {timeout: _, ...openAIOptions} = options;
  
  logger.info(`Generating text with OpenAI`, {
    model,
    promptLength: prompt.length,
    maxTokens: options.max_tokens || 1000,
    hasOverrides: Object.keys(requestOverrides || {}).length > 0
  });
  
  let timeoutHandle;

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(
        () => reject(new AIServiceError(
          'The AI service timed out. Please try again in a few moments.',
          { statusCode: 408, code: 'AI_TIMEOUT' }
        )),
        timeout
      );
    });
    
    const requestPayload = {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: openAIOptions.temperature || 0.7,
      max_tokens: openAIOptions.max_tokens || 1000,
      ...requestOverrides
    };

    const requestPromise = openaiClient.chat.completions.create(requestPayload);
    
    // Race between timeout and actual request
    const response = await Promise.race([requestPromise, timeoutPromise]);
    clearTimeout(timeoutHandle);
    
    const usage = response.usage;
    
    logger.info(`OpenAI response received`, {
      model: response.model,
      tokensUsed: usage.total_tokens,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens
    });
    
    // Track usage if userId provided
    if (openAIOptions.userId) {
      await trackAIUsage(openAIOptions.userId, {
        endpoint: 'chat/completions',
        model: response.model,
        tokens: usage.total_tokens,
        cost: calculateCost(usage.total_tokens, response.model)
      });
    }
    
    return {
      text: response.choices[0].message.content,
      usage,
      model: response.model
    };
  } catch (error) {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
    const status = error?.statusCode || error?.response?.status;
    let responseData = undefined;
    try {
      responseData = error?.response?.data
        ? typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data)
        : undefined;
    } catch (_) {
      responseData = '[unserializable response data]';
    }

    const responseExcerpt =
      typeof responseData === 'string'
        ? responseData.slice(0, 500)
        : responseData;

    console.error('OpenAI generation failed details:', {
      status,
      response: responseExcerpt,
      message: error?.message,
      stack: error?.stack
    });

    logger.error(
      `OpenAI generation failed (status=${status ?? 'unknown'}): ${error?.message}${
        responseExcerpt ? ` | response=${responseExcerpt}` : ''
      }`,
      {
        error: error?.message,
        model,
        promptLength: prompt.length,
        status,
        responseData: responseExcerpt,
        stack: error?.stack
      }
    );
    
    // Provide more specific error messages
    if (error instanceof AIServiceError || error?.isAIServiceError) {
      throw error;
    }

    if (error.code === 'insufficient_quota') {
      throw new AIServiceError(
        'You have reached the AI usage limit. Please wait or upgrade your plan to continue.',
        { statusCode: 429, code: 'AI_QUOTA_EXCEEDED' }
      );
    }
    if (error.code === 'rate_limit_exceeded') {
      throw new AIServiceError(
        'The AI service is receiving too many requests. Please try again in a moment.',
        { statusCode: 429, code: 'AI_RATE_LIMIT' }
      );
    }
    if (error.code === 'invalid_api_key' || status === 401) {
      throw new AIServiceError(
        'The AI service credentials are invalid. Please contact support.',
        { statusCode: 500, code: 'AI_INVALID_KEY' }
      );
    }
    if (status === 503 || status === 502) {
      throw new AIServiceError(
        'The AI service is temporarily unavailable. Please try again shortly.',
        { statusCode: 503, code: 'AI_SERVICE_UNAVAILABLE' }
      );
    }
    
    throw new AIServiceError(
      'The AI service encountered an unexpected error. Please try again soon.',
      { statusCode: status || 500, code: 'AI_UNKNOWN_ERROR' }
    );
  }
}

/**
 * Calculate cost based on tokens and model
 */
function calculateCost(tokens, model) {
  const pricing = {
    'gpt-4o-mini': { input: 0.150 / 1000000, output: 0.600 / 1000000 },
    'gpt-4': { input: 30 / 1000000, output: 60 / 1000000 },
    'gpt-3.5-turbo': { input: 0.50 / 1000000, output: 1.50 / 1000000 }
  };
  
  const modelPricing = pricing[model] || pricing['gpt-4o-mini'];
  return tokens * modelPricing.input;
}

module.exports = {
  initializeOpenAIClient,
  generateText,
  calculateCost,
  AIServiceError
};

