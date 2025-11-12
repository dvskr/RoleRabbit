// ============================================================
// SIMILARITY CALCULATION SERVICE
// ============================================================
// This service calculates semantic similarity between resume and job embeddings
// and converts to ATS scores

const logger = require('../../utils/logger');

/**
 * Calculate cosine similarity between two vectors
 * Formula: cos(θ) = (A · B) / (||A|| × ||B||)
 * @param {Array<number>} vectorA - First embedding vector
 * @param {Array<number>} vectorB - Second embedding vector
 * @returns {number} Similarity score between 0 and 1 (1 = identical)
 */
function cosineSimilarity(vectorA, vectorB) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) {
    throw new Error('Both inputs must be arrays');
  }
  
  if (vectorA.length !== vectorB.length) {
    throw new Error(`Vector dimensions must match: ${vectorA.length} vs ${vectorB.length}`);
  }
  
  if (vectorA.length === 0) {
    throw new Error('Vectors cannot be empty');
  }
  
  // Calculate dot product: A · B
  let dotProduct = 0;
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
  }
  
  // Calculate magnitudes: ||A|| and ||B||
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (let i = 0; i < vectorA.length; i++) {
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  // Handle zero magnitude (shouldn't happen with OpenAI embeddings, but be safe)
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  // Calculate cosine similarity
  const similarity = dotProduct / (magnitudeA * magnitudeB);
  
  // Clamp to [0, 1] range (account for floating point errors)
  return Math.max(0, Math.min(1, similarity));
}

/**
 * Convert cosine similarity (0-1) to ATS score (0-100)
 * Uses a calibrated formula to provide meaningful ATS scores
 * @param {number} similarity - Cosine similarity (0-1)
 * @param {Object} options - Calibration options
 * @param {number} options.minScore - Minimum ATS score (default: 0)
 * @param {number} options.maxScore - Maximum ATS score (default: 100)
 * @param {number} options.curve - Curve adjustment (default: 1.0, higher = more generous)
 * @returns {number} ATS score (0-100)
 */
function similarityToATSScore(similarity, options = {}) {
  const {
    minScore = 0,
    maxScore = 100,
    curve = 1.0
  } = options;
  
  // Validate input
  if (typeof similarity !== 'number' || similarity < 0 || similarity > 1) {
    throw new Error(`Invalid similarity: ${similarity} (must be 0-1)`);
  }
  
  // Apply curve (optional power transformation)
  // curve > 1: more generous (easier to get high scores)
  // curve < 1: more strict (harder to get high scores)
  const adjusted = Math.pow(similarity, 1 / curve);
  
  // Scale to ATS score range
  const score = minScore + (adjusted * (maxScore - minScore));
  
  // Round to integer
  return Math.round(score);
}

/**
 * Calculate semantic similarity and ATS score between resume and job
 * @param {Array<number>} resumeEmbedding - Resume embedding vector
 * @param {Array<number>} jobEmbedding - Job embedding vector
 * @param {Object} options - Calculation options
 * @param {number} options.curve - Score curve adjustment (default: 1.0)
 * @param {boolean} options.includeDetails - Include detailed metrics (default: false)
 * @returns {Object} Similarity analysis result
 */
function calculateSimilarity(resumeEmbedding, jobEmbedding, options = {}) {
  const {
    curve = 1.0,
    includeDetails = false
  } = options;
  
  const startTime = Date.now();
  
  try {
    // Validate inputs
    if (!resumeEmbedding || !jobEmbedding) {
      throw new Error('Both resume and job embeddings are required');
    }
    
    if (resumeEmbedding.length !== 1536 || jobEmbedding.length !== 1536) {
      throw new Error(`Invalid embedding dimensions: resume=${resumeEmbedding.length}, job=${jobEmbedding.length}`);
    }
    
    logger.debug('Calculating similarity', {
      resumeDimensions: resumeEmbedding.length,
      jobDimensions: jobEmbedding.length,
      curve
    });
    
    // Calculate cosine similarity
    const similarity = cosineSimilarity(resumeEmbedding, jobEmbedding);
    
    // Convert to ATS score
    const atsScore = similarityToATSScore(similarity, { curve });
    
    const duration = Date.now() - startTime;
    
    logger.info('Similarity calculated', {
      similarity: similarity.toFixed(4),
      atsScore,
      duration
    });
    
    const result = {
      similarity,
      atsScore,
      duration
    };
    
    // Add detailed metrics if requested
    if (includeDetails) {
      result.details = {
        cosineSimilarity: similarity,
        atsScore,
        scorePercentile: getScorePercentile(atsScore),
        interpretation: getScoreInterpretation(atsScore),
        confidence: getConfidenceLevel(similarity),
        recommendations: getRecommendations(atsScore)
      };
    }
    
    return result;
    
  } catch (error) {
    logger.error('Similarity calculation failed', {
      error: error.message,
      hasResumeEmbedding: !!resumeEmbedding,
      hasJobEmbedding: !!jobEmbedding
    });
    throw error;
  }
}

/**
 * Get percentile rank for ATS score
 * @param {number} atsScore - ATS score (0-100)
 * @returns {number} Percentile (0-100)
 */
function getScorePercentile(atsScore) {
  // Calibrated percentiles based on typical ATS score distribution
  if (atsScore >= 90) return 99;
  if (atsScore >= 80) return 95;
  if (atsScore >= 70) return 85;
  if (atsScore >= 60) return 70;
  if (atsScore >= 50) return 50;
  if (atsScore >= 40) return 30;
  if (atsScore >= 30) return 15;
  return 5;
}

/**
 * Get human-readable interpretation of ATS score
 * @param {number} atsScore - ATS score (0-100)
 * @returns {string} Interpretation
 */
function getScoreInterpretation(atsScore) {
  if (atsScore >= 90) return 'Excellent match - Very high likelihood of interview';
  if (atsScore >= 80) return 'Strong match - Good likelihood of interview';
  if (atsScore >= 70) return 'Good match - Resume meets most requirements';
  if (atsScore >= 60) return 'Moderate match - Resume meets some requirements';
  if (atsScore >= 50) return 'Fair match - Consider tailoring resume';
  if (atsScore >= 40) return 'Weak match - Significant gaps in qualifications';
  return 'Poor match - Resume does not align with job requirements';
}

/**
 * Get confidence level based on similarity score
 * @param {number} similarity - Cosine similarity (0-1)
 * @returns {string} Confidence level
 */
function getConfidenceLevel(similarity) {
  if (similarity >= 0.8) return 'very_high';
  if (similarity >= 0.7) return 'high';
  if (similarity >= 0.6) return 'moderate';
  if (similarity >= 0.5) return 'low';
  return 'very_low';
}

/**
 * Get recommendations based on ATS score
 * @param {number} atsScore - ATS score (0-100)
 * @returns {Array<string>} List of recommendations
 */
function getRecommendations(atsScore) {
  const recommendations = [];
  
  if (atsScore < 70) {
    recommendations.push('Consider tailoring your resume to better match job requirements');
  }
  
  if (atsScore < 60) {
    recommendations.push('Add more relevant keywords from the job description');
    recommendations.push('Highlight transferable skills and experiences');
  }
  
  if (atsScore < 50) {
    recommendations.push('Focus on developing skills mentioned in the job description');
    recommendations.push('Consider taking relevant courses or certifications');
  }
  
  if (atsScore >= 70) {
    recommendations.push('Your resume is well-matched - focus on crafting a strong cover letter');
  }
  
  if (atsScore >= 80) {
    recommendations.push('Excellent match - prepare for potential interview by researching the company');
  }
  
  return recommendations;
}

/**
 * Batch calculate similarities for multiple resumes against one job
 * @param {Array<Array<number>>} resumeEmbeddings - Array of resume embedding vectors
 * @param {Array<number>} jobEmbedding - Job embedding vector
 * @param {Object} options - Calculation options
 * @returns {Array<Object>} Array of similarity results
 */
function batchCalculateSimilarity(resumeEmbeddings, jobEmbedding, options = {}) {
  const startTime = Date.now();
  
  try {
    logger.info('Starting batch similarity calculation', {
      totalResumes: resumeEmbeddings.length
    });
    
    const results = resumeEmbeddings.map((resumeEmbedding, index) => {
      try {
        return {
          index,
          ...calculateSimilarity(resumeEmbedding, jobEmbedding, options),
          success: true
        };
      } catch (error) {
        logger.warn(`Failed to calculate similarity for resume ${index}`, {
          error: error.message
        });
        return {
          index,
          success: false,
          error: error.message
        };
      }
    });
    
    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    
    logger.info('Batch similarity calculation complete', {
      total: resumeEmbeddings.length,
      successful: successCount,
      failed: resumeEmbeddings.length - successCount,
      duration,
      averagePerResume: Math.round(duration / resumeEmbeddings.length)
    });
    
    return results;
    
  } catch (error) {
    logger.error('Batch similarity calculation failed', {
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  cosineSimilarity,
  similarityToATSScore,
  calculateSimilarity,
  getScorePercentile,
  getScoreInterpretation,
  getConfidenceLevel,
  getRecommendations,
  batchCalculateSimilarity
};

