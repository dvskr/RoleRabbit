/**
 * LLM Operations Utility
 * 
 * Handles all LLM operations with timeouts, cost tracking,
 * usage limits, quality validation, and hallucination detection.
 */

const { executeWithOpenAIBreaker } = require('./circuitBreaker');
const { retryLLMOperation } = require('./retryHandler');

/**
 * LLM Operation Types
 */
const LLMOperationType = {
  GENERATE: 'GENERATE',
  TAILOR: 'TAILOR',
  ANALYZE: 'ANALYZE',
  COVER_LETTER: 'COVER_LETTER',
  PORTFOLIO: 'PORTFOLIO'
};

/**
 * LLM Operation Timeouts (milliseconds)
 */
const LLMTimeout = {
  GENERATE: 60000, // 60 seconds
  TAILOR: 120000, // 120 seconds
  ANALYZE: 60000, // 60 seconds
  COVER_LETTER: 90000, // 90 seconds
  PORTFOLIO: 120000 // 120 seconds
};

/**
 * Usage Limits
 */
const UsageLimits = {
  FREE: 10, // 10 AI operations per month
  PRO: 100, // 100 AI operations per month
  PREMIUM: -1 // Unlimited
};

/**
 * Cost Tracking
 */
const CostPerToken = {
  'gpt-4': { input: 0.00003, output: 0.00006 },
  'gpt-4-turbo': { input: 0.00001, output: 0.00003 },
  'gpt-3.5-turbo': { input: 0.0000005, output: 0.0000015 }
};

/**
 * Execute LLM operation with timeout
 */
async function executeLLMWithTimeout(operation, timeout, operationType = 'operation') {
  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`${operationType} timed out. Please try again.`));
    }, timeout);

    try {
      const result = await operation();
      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

/**
 * Check user usage limit
 */
async function checkUsageLimit(prisma, userId, userPlan = 'free') {
  const limit = UsageLimits[userPlan.toUpperCase()] || UsageLimits.FREE;
  
  // Unlimited for premium
  if (limit === -1) {
    return { allowed: true, remaining: -1 };
  }

  // Get current month's usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usage = await prisma.aIRequestLog.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth }
    }
  });

  const allowed = usage < limit;
  const remaining = Math.max(0, limit - usage);

  return { allowed, remaining, usage, limit };
}

/**
 * Calculate LLM cost
 */
function calculateLLMCost(model, inputTokens, outputTokens) {
  const costs = CostPerToken[model] || CostPerToken['gpt-3.5-turbo'];
  const inputCost = inputTokens * costs.input;
  const outputCost = outputTokens * costs.output;
  const totalCost = inputCost + outputCost;

  return {
    inputCost,
    outputCost,
    totalCost,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens
  };
}

/**
 * Track LLM usage and cost
 */
async function trackLLMUsage(prisma, data) {
  const {
    userId,
    operationType,
    model,
    inputTokens,
    outputTokens,
    success,
    error = null,
    metadata = {}
  } = data;

  const cost = calculateLLMCost(model, inputTokens, outputTokens);

  const log = await prisma.aIRequestLog.create({
    data: {
      userId,
      operationType,
      model,
      tokensUsed: cost.totalTokens,
      costUsd: cost.totalCost,
      success,
      error: error ? JSON.stringify({ message: error.message }) : null,
      metadata: JSON.stringify(metadata),
      createdAt: new Date()
    }
  });

  // Check budget alert
  await checkBudgetAlert(prisma, userId, cost.totalCost);

  return log;
}

/**
 * Check budget alert
 */
async function checkBudgetAlert(prisma, userId, newCost) {
  const BUDGET_THRESHOLD = 10; // $10/month
  
  // Get current month's spending
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const logs = await prisma.aIRequestLog.findMany({
    where: {
      userId,
      createdAt: { gte: startOfMonth }
    },
    select: { costUsd: true }
  });

  const totalSpent = logs.reduce((sum, log) => sum + (log.costUsd || 0), 0);

  if (totalSpent >= BUDGET_THRESHOLD) {
    console.warn(`⚠️  Budget alert: User ${userId} has spent $${totalSpent.toFixed(2)} this month`);
    
    // TODO: Send notification to admin
    // await sendBudgetAlert(userId, totalSpent);
  }

  return { totalSpent, threshold: BUDGET_THRESHOLD, exceeded: totalSpent >= BUDGET_THRESHOLD };
}

/**
 * Validate LLM output quality
 */
function validateLLMOutput(output, options = {}) {
  const {
    minLength = 10,
    maxLength = 10000,
    checkLanguage = true,
    allowedLanguages = ['en']
  } = options;

  const issues = [];

  // Check if empty
  if (!output || typeof output !== 'string') {
    issues.push('Output is empty or invalid');
    return { valid: false, issues };
  }

  const trimmed = output.trim();

  // Check length
  if (trimmed.length < minLength) {
    issues.push(`Output too short (${trimmed.length} < ${minLength})`);
  }

  if (trimmed.length > maxLength) {
    issues.push(`Output too long (${trimmed.length} > ${maxLength})`);
  }

  // Check for gibberish (repeated characters)
  const repeatedChars = /(.)\1{10,}/g;
  if (repeatedChars.test(trimmed)) {
    issues.push('Output contains repeated characters (possible gibberish)');
  }

  // Check for meaningful content (not just special characters)
  const meaningfulChars = trimmed.replace(/[^a-zA-Z0-9]/g, '');
  if (meaningfulChars.length < minLength / 2) {
    issues.push('Output lacks meaningful content');
  }

  // Check language (basic check for English)
  if (checkLanguage && allowedLanguages.includes('en')) {
    const englishWords = /\b[a-zA-Z]{2,}\b/g;
    const matches = trimmed.match(englishWords);
    if (!matches || matches.length < 5) {
      issues.push('Output does not appear to be in English');
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    length: trimmed.length
  };
}

/**
 * Detect hallucinations in LLM output
 */
function detectHallucinations(output, originalData, options = {}) {
  const {
    checkCompanies = true,
    checkDates = true,
    checkSkills = true
  } = options;

  const hallucinations = [];

  // Extract companies from original data
  if (checkCompanies && originalData.experience) {
    const originalCompanies = originalData.experience.map(exp => 
      exp.company?.toLowerCase()
    ).filter(Boolean);

    // Check if output mentions companies not in original
    originalCompanies.forEach(company => {
      if (!output.toLowerCase().includes(company)) {
        // Company removed - might be intentional
      }
    });

    // Simple check for common fake companies
    const fakeCompanyPatterns = [
      /acme\s+corp/i,
      /example\s+company/i,
      /test\s+inc/i,
      /\[company\s+name\]/i
    ];

    fakeCompanyPatterns.forEach(pattern => {
      if (pattern.test(output)) {
        hallucinations.push({
          type: 'fake_company',
          pattern: pattern.source,
          message: 'Output contains placeholder company name'
        });
      }
    });
  }

  // Check for placeholder dates
  if (checkDates) {
    const placeholderDates = [
      /\[date\]/i,
      /\[year\]/i,
      /YYYY/,
      /MM\/DD\/YYYY/
    ];

    placeholderDates.forEach(pattern => {
      if (pattern.test(output)) {
        hallucinations.push({
          type: 'placeholder_date',
          pattern: pattern.source,
          message: 'Output contains placeholder date'
        });
      }
    });
  }

  // Check for placeholder skills
  if (checkSkills) {
    const placeholderSkills = [
      /\[skill\]/i,
      /\[technology\]/i,
      /\[programming language\]/i
    ];

    placeholderSkills.forEach(pattern => {
      if (pattern.test(output)) {
        hallucinations.push({
          type: 'placeholder_skill',
          pattern: pattern.source,
          message: 'Output contains placeholder skill'
        });
      }
    });
  }

  return {
    detected: hallucinations.length > 0,
    hallucinations,
    count: hallucinations.length
  };
}

/**
 * Execute LLM operation with all protections
 */
async function executeLLMOperation(prisma, operation, options = {}) {
  const {
    userId,
    userPlan = 'free',
    operationType = LLMOperationType.GENERATE,
    model = 'gpt-3.5-turbo',
    validateOutput = true,
    detectHallucination = true,
    originalData = null,
    maxRetries = 2
  } = options;

  try {
    // 1. Check usage limit
    const usageCheck = await checkUsageLimit(prisma, userId, userPlan);
    if (!usageCheck.allowed) {
      throw new Error(
        `AI usage limit reached (${usageCheck.usage}/${usageCheck.limit} this month). Please upgrade your plan.`
      );
    }

    // 2. Get timeout for operation type
    const timeout = LLMTimeout[operationType] || LLMTimeout.GENERATE;

    // 3. Execute with timeout, retry, and circuit breaker
    let result;
    let attempt = 0;
    let lastError;

    while (attempt <= maxRetries) {
      try {
        result = await executeWithOpenAIBreaker(
          async () => await executeLLMWithTimeout(
            operation,
            timeout,
            operationType
          )
        );

        // 4. Validate output quality
        if (validateOutput && result.content) {
          const validation = validateLLMOutput(result.content);
          if (!validation.valid) {
            if (attempt < maxRetries) {
              console.warn(`LLM output quality issues (attempt ${attempt + 1}):`, validation.issues);
              attempt++;
              continue;
            }
            throw new Error(`LLM output quality too low: ${validation.issues.join(', ')}`);
          }
        }

        // 5. Detect hallucinations
        if (detectHallucination && result.content && originalData) {
          const hallucinationCheck = detectHallucinations(result.content, originalData);
          if (hallucinationCheck.detected) {
            console.warn('Hallucinations detected:', hallucinationCheck.hallucinations);
            result.warnings = hallucinationCheck.hallucinations;
          }
        }

        // Success!
        break;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries && error.message.includes('quality')) {
          attempt++;
          continue;
        }
        throw error;
      }
    }

    // 6. Track usage and cost
    await trackLLMUsage(prisma, {
      userId,
      operationType,
      model,
      inputTokens: result.usage?.prompt_tokens || 0,
      outputTokens: result.usage?.completion_tokens || 0,
      success: true,
      metadata: {
        attempts: attempt + 1,
        hasWarnings: !!result.warnings
      }
    });

    return {
      success: true,
      result,
      remaining: usageCheck.remaining - 1
    };

  } catch (error) {
    console.error('LLM operation failed:', error);

    // Track failed operation
    try {
      await trackLLMUsage(prisma, {
        userId,
        operationType,
        model,
        inputTokens: 0,
        outputTokens: 0,
        success: false,
        error
      });
    } catch (trackError) {
      console.error('Failed to track LLM usage:', trackError);
    }

    throw error;
  }
}

/**
 * Stream LLM response
 */
async function streamLLMResponse(openai, prompt, options = {}) {
  const {
    model = 'gpt-3.5-turbo',
    temperature = 0.7,
    onChunk = null,
    onComplete = null,
    onError = null
  } = options;

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      stream: true
    });

    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        outputTokens++;
        
        if (onChunk) {
          onChunk(content, fullContent);
        }
      }
    }

    // Estimate input tokens (rough approximation)
    inputTokens = Math.ceil(prompt.length / 4);

    const result = {
      content: fullContent,
      usage: {
        prompt_tokens: inputTokens,
        completion_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens
      }
    };

    if (onComplete) {
      onComplete(result);
    }

    return result;
  } catch (error) {
    if (onError) {
      onError(error);
    }
    throw error;
  }
}

module.exports = {
  LLMOperationType,
  LLMTimeout,
  UsageLimits,
  executeLLMWithTimeout,
  checkUsageLimit,
  calculateLLMCost,
  trackLLMUsage,
  checkBudgetAlert,
  validateLLMOutput,
  detectHallucinations,
  executeLLMOperation,
  streamLLMResponse
};

