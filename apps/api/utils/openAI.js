/**
 * OpenAI Integration Utility
 * Wraps OpenAI API calls with error handling and usage tracking
 */

const OpenAI = require('openai');
const logger = require('./logger');
const { trackUsage } = require('./aiUsageTracker');

let openaiClient = null;

/**
 * Initialize OpenAI client
 */
function initializeOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.warn('OpenAI API key not configured. Mock responses will be used.');
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
async function generateText(prompt, options = {}) {
  if (!openaiClient) {
    initializeOpenAIClient();
  }
  
  if (!openaiClient) {
    return { 
      text: 'Mock response: OpenAI not configured',
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    };
  }
  
  try {
    const response = await openaiClient.chat.completions.create({
      model: options.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      ...options
    });
    
    const usage = response.usage;
    
    // Track usage if userId provided
    if (options.userId) {
      await trackUsage(options.userId, {
        endpoint: 'chat/completions',
        model: options.model || 'gpt-4o-mini',
        tokens: usage.total_tokens,
        cost: calculateCost(usage.total_tokens, options.model || 'gpt-4o-mini')
      });
    }
    
    return {
      text: response.choices[0].message.content,
      usage,
      model: response.model
    };
  } catch (error) {
    logger.error('OpenAI API error', error);
    throw error;
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
  calculateCost
};

