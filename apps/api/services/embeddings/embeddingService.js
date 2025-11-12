// ============================================================
// EMBEDDING GENERATION SERVICE
// ============================================================
// This service generates vector embeddings using OpenAI API
// for resume and job description semantic similarity matching

const { generateEmbedding: generateEmbeddingUtil } = require('../../utils/openAI');
const logger = require('../../utils/logger');

/**
 * Normalize text for embedding generation
 * - Remove excessive whitespace
 * - Normalize line breaks
 * - Trim
 * @param {string} text - Raw text
 * @returns {string} Normalized text
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();
}

/**
 * Extract text from resume data object
 * @param {Object} resumeData - Resume data object
 * @returns {string} Extracted text for embedding
 */
function extractResumeText(resumeData) {
  const parts = [];

  try {
    // Basic info
    if (resumeData.name) parts.push(resumeData.name);
    if (resumeData.title) parts.push(resumeData.title);
    if (resumeData.summary) parts.push(resumeData.summary);

    // Skills
    if (resumeData.skills && Array.isArray(resumeData.skills)) {
      const skills = resumeData.skills
        .map(s => typeof s === 'string' ? s : s.name)
        .filter(Boolean);
      if (skills.length > 0) {
        parts.push('Skills: ' + skills.join(', '));
      }
    }

    // Work experience
    if (resumeData.experience && Array.isArray(resumeData.experience)) {
      resumeData.experience.forEach(exp => {
        if (exp.role) parts.push(exp.role);
        if (exp.company) parts.push(exp.company);
        if (exp.description) parts.push(exp.description);
        if (exp.responsibilities && Array.isArray(exp.responsibilities)) {
          parts.push(exp.responsibilities.join(' '));
        }
      });
    }

    // Education
    if (resumeData.education && Array.isArray(resumeData.education)) {
      resumeData.education.forEach(edu => {
        if (edu.degree) parts.push(edu.degree);
        if (edu.field) parts.push(edu.field);
        if (edu.institution) parts.push(edu.institution);
      });
    }

    // Projects
    if (resumeData.projects && Array.isArray(resumeData.projects)) {
      resumeData.projects.forEach(proj => {
        if (proj.title) parts.push(proj.title);
        if (proj.description) parts.push(proj.description);
        if (proj.technologies) {
          const techs = Array.isArray(proj.technologies) 
            ? proj.technologies 
            : proj.technologies.split(',');
          parts.push(techs.join(' '));
        }
      });
    }

    // Certifications
    if (resumeData.certifications && Array.isArray(resumeData.certifications)) {
      resumeData.certifications.forEach(cert => {
        if (cert.name) parts.push(cert.name);
        if (cert.issuer) parts.push(cert.issuer);
      });
    }

    const text = parts.join(' ');
    
    // Log extraction stats
    logger.debug('Resume text extraction', {
      sections: {
        hasBasicInfo: !!(resumeData.name || resumeData.title),
        hasSummary: !!resumeData.summary,
        skillCount: resumeData.skills?.length || 0,
        experienceCount: resumeData.experience?.length || 0,
        educationCount: resumeData.education?.length || 0,
        projectCount: resumeData.projects?.length || 0,
        certCount: resumeData.certifications?.length || 0
      },
      textLength: text.length,
      wordCount: text.split(/\s+/).length
    });

    return text;
  } catch (error) {
    logger.error('Error extracting resume text', { error: error.message });
    // Return whatever we have so far
    return parts.join(' ');
  }
}

/**
 * Generate embedding for text
 * @param {string} text - Text to generate embedding for
 * @param {Object} options - Options
 * @param {string} options.type - Type of text ('resume' or 'job')
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.timeout - Timeout in milliseconds (default: 30000)
 * @returns {Promise<Array<number>>} 1536-dimension embedding vector
 */
async function generateEmbedding(text, options = {}) {
  const {
    type = 'unknown',
    maxRetries = 3,
    timeout = 30000
  } = options;

  const startTime = Date.now();

  try {
    // Validate input
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input for embedding generation');
    }

    // Normalize text
    const normalizedText = normalizeText(text);
    
    if (normalizedText.length === 0) {
      throw new Error('Text is empty after normalization');
    }

    // Check text length (OpenAI has 8191 token limit for text-embedding-3-small)
    // Approximate: 1 token ≈ 4 characters
    const estimatedTokens = Math.ceil(normalizedText.length / 4);
    
    if (estimatedTokens > 8000) {
      logger.warn('Text exceeds recommended token limit, truncating', {
        type,
        originalLength: normalizedText.length,
        estimatedTokens,
        truncating: true
      });
      
      // Truncate to approximately 8000 tokens worth of characters
      text = normalizedText.substring(0, 32000);
    } else {
      text = normalizedText;
    }

    logger.info(`Generating embedding for ${type}`, {
      type,
      textLength: text.length,
      estimatedTokens,
      maxRetries,
      timeout
    });

    // Call OpenAI API with retry logic
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const embedding = await generateEmbeddingUtil(text, { timeout });
        
        const duration = Date.now() - startTime;
        
        // Validate embedding
        if (!Array.isArray(embedding) || embedding.length !== 1536) {
          throw new Error(`Invalid embedding dimensions: ${embedding?.length || 0} (expected 1536)`);
        }

        // Check if all values are valid numbers
        const hasInvalidValues = embedding.some(v => typeof v !== 'number' || isNaN(v));
        if (hasInvalidValues) {
          throw new Error('Embedding contains invalid values');
        }

        logger.info(`Embedding generated successfully`, {
          type,
          dimensions: embedding.length,
          duration,
          attempt,
          textLength: text.length
        });

        return embedding;

      } catch (error) {
        lastError = error;
        
        logger.warn(`Embedding generation attempt ${attempt} failed`, {
          type,
          attempt,
          maxRetries,
          error: error.message,
          willRetry: attempt < maxRetries
        });

        // Don't retry on certain errors
        if (error.message.includes('API key') || 
            error.message.includes('auth') ||
            error.message.includes('quota exceeded')) {
          throw error; // Don't retry authentication or quota errors
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10s
          logger.debug(`Waiting ${delay}ms before retry`, { attempt, delay });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    throw new Error(`Failed to generate embedding after ${maxRetries} attempts: ${lastError.message}`);

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Embedding generation failed', {
      type,
      error: error.message,
      duration,
      textLength: text?.length || 0
    });

    throw error;
  }
}

/**
 * Generate embedding for resume
 * @param {Object} resumeData - Resume data object
 * @param {Object} options - Options (passed to generateEmbedding)
 * @returns {Promise<Array<number>>} 1536-dimension embedding vector
 */
async function generateResumeEmbedding(resumeData, options = {}) {
  try {
    // Extract text from resume
    const text = extractResumeText(resumeData);
    
    if (!text || text.trim().length === 0) {
      throw new Error('Resume data is empty or invalid');
    }

    // Generate embedding
    return await generateEmbedding(text, {
      ...options,
      type: 'resume'
    });

  } catch (error) {
    logger.error('Resume embedding generation failed', {
      error: error.message,
      hasResumeData: !!resumeData
    });
    throw error;
  }
}

/**
 * Generate embedding for job description
 * @param {string} jobDescription - Job description text
 * @param {Object} options - Options (passed to generateEmbedding)
 * @returns {Promise<Array<number>>} 1536-dimension embedding vector
 */
async function generateJobEmbedding(jobDescription, options = {}) {
  try {
    if (!jobDescription || typeof jobDescription !== 'string') {
      throw new Error('Invalid job description');
    }

    // Generate embedding
    return await generateEmbedding(jobDescription, {
      ...options,
      type: 'job'
    });

  } catch (error) {
    logger.error('Job embedding generation failed', {
      error: error.message,
      jobDescriptionLength: jobDescription?.length || 0
    });
    throw error;
  }
}

/**
 * Batch generate embeddings for multiple texts
 * @param {Array<string>} texts - Array of texts
 * @param {Object} options - Options
 * @param {string} options.type - Type of texts
 * @param {number} options.batchSize - Batch size (default: 10)
 * @param {number} options.delayBetweenBatches - Delay in ms (default: 1000)
 * @returns {Promise<Array<Array<number>>>} Array of embeddings
 */
async function generateEmbeddingsBatch(texts, options = {}) {
  const {
    type = 'unknown',
    batchSize = 10,
    delayBetweenBatches = 1000
  } = options;

  const startTime = Date.now();
  const results = [];
  const errors = [];

  logger.info(`Starting batch embedding generation`, {
    type,
    totalTexts: texts.length,
    batchSize,
    estimatedBatches: Math.ceil(texts.length / batchSize)
  });

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(texts.length / batchSize);

    logger.info(`Processing batch ${batchNumber}/${totalBatches}`, {
      batchNumber,
      totalBatches,
      batchSize: batch.length
    });

    // Process batch in parallel
    const batchPromises = batch.map((text, index) => 
      generateEmbedding(text, { ...options, type })
        .then(embedding => ({ success: true, embedding, index: i + index }))
        .catch(error => ({ success: false, error: error.message, index: i + index }))
    );

    const batchResults = await Promise.all(batchPromises);

    // Collect results
    batchResults.forEach(result => {
      if (result.success) {
        results.push({ index: result.index, embedding: result.embedding });
      } else {
        errors.push({ index: result.index, error: result.error });
      }
    });

    // Log batch progress
    const successCount = batchResults.filter(r => r.success).length;
    logger.info(`Batch ${batchNumber} complete`, {
      success: successCount,
      failed: batch.length - successCount,
      totalProcessed: i + batch.length,
      totalTexts: texts.length
    });

    // Delay between batches to avoid rate limiting
    if (i + batchSize < texts.length && delayBetweenBatches > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  const duration = Date.now() - startTime;
  const successRate = (results.length / texts.length * 100).toFixed(1);

  logger.info(`Batch embedding generation complete`, {
    type,
    totalTexts: texts.length,
    successful: results.length,
    failed: errors.length,
    successRate: `${successRate}%`,
    duration,
    averagePerText: Math.round(duration / texts.length)
  });

  if (errors.length > 0) {
    logger.warn(`Some embeddings failed`, {
      failedCount: errors.length,
      failedIndexes: errors.map(e => e.index),
      errors: errors.map(e => e.error)
    });
  }

  // Sort results by original index
  results.sort((a, b) => a.index - b.index);

  return {
    embeddings: results.map(r => r.embedding),
    errors,
    stats: {
      total: texts.length,
      successful: results.length,
      failed: errors.length,
      successRate: parseFloat(successRate),
      duration,
      averagePerText: Math.round(duration / texts.length)
    }
  };
}

module.exports = {
  generateEmbedding,
  generateResumeEmbedding,
  generateJobEmbedding,
  generateEmbeddingsBatch,
  normalizeText,
  extractResumeText
};

