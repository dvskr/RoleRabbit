// ============================================================
// RESUME EMBEDDING STORAGE SERVICE
// ============================================================
// This service manages storing and retrieving resume embeddings
// from the base_resumes table in PostgreSQL

const { PrismaClient } = require('@prisma/client');
const logger = require('../../utils/logger');
const { generateResumeEmbedding } = require('./embeddingService');

const prisma = new PrismaClient();

/**
 * Store resume embedding in database
 * @param {string} resumeId - Base resume ID
 * @param {Array<number>} embedding - 1536-dimension embedding vector
 * @returns {Promise<{stored: boolean, resumeId: string}>}
 */
async function storeResumeEmbedding(resumeId, embedding) {
  try {
    logger.debug('Storing resume embedding', {
      resumeId,
      embeddingDimensions: embedding.length
    });

    // Validate embedding
    if (!Array.isArray(embedding) || embedding.length !== 1536) {
      throw new Error(`Invalid embedding dimensions: ${embedding?.length || 0}`);
    }

    // Convert to PostgreSQL vector format
    const embeddingStr = `[${embedding.join(',')}]`;

    // Update resume with embedding
    await prisma.$executeRawUnsafe(
      `UPDATE "base_resumes" 
       SET embedding = $1::vector, embedding_updated_at = NOW() 
       WHERE id = $2`,
      embeddingStr,
      resumeId
    );

    logger.info('Resume embedding stored successfully', {
      resumeId,
      dimensions: embedding.length
    });

    return {
      stored: true,
      resumeId
    };

  } catch (error) {
    logger.error('Failed to store resume embedding', {
      error: error.message,
      resumeId
    });

    return {
      stored: false,
      resumeId,
      error: error.message
    };
  }
}

/**
 * Retrieve resume embedding from database
 * @param {string} resumeId - Base resume ID
 * @returns {Promise<{embedding: Array<number>|null, updatedAt: Date|null}>}
 */
async function getResumeEmbedding(resumeId) {
  try {
    logger.debug('Retrieving resume embedding', { resumeId });

    const result = await prisma.$queryRaw`
      SELECT embedding::text as embedding_text, embedding_updated_at
      FROM "base_resumes"
      WHERE id = ${resumeId}
    `;

    if (result.length === 0) {
      logger.warn('Resume not found', { resumeId });
      return { embedding: null, updatedAt: null };
    }

    const row = result[0];

    // Check if embedding exists
    if (!row.embedding_text) {
      logger.debug('Resume has no embedding', { resumeId });
      return { embedding: null, updatedAt: null };
    }

    // Parse embedding
    const embedding = JSON.parse(row.embedding_text);

    logger.debug('Resume embedding retrieved', {
      resumeId,
      dimensions: embedding.length,
      updatedAt: row.embedding_updated_at
    });

    return {
      embedding,
      updatedAt: row.embedding_updated_at
    };

  } catch (error) {
    logger.error('Failed to retrieve resume embedding', {
      error: error.message,
      resumeId
    });

    return { embedding: null, updatedAt: null };
  }
}

/**
 * Check if resume embedding needs updating
 * @param {string} resumeId - Base resume ID
 * @param {Date} resumeUpdatedAt - When resume was last updated
 * @returns {Promise<{needsUpdate: boolean, reason: string}>}
 */
async function needsEmbeddingUpdate(resumeId, resumeUpdatedAt) {
  try {
    const { embedding, updatedAt } = await getResumeEmbedding(resumeId);

    // No embedding exists
    if (!embedding) {
      return {
        needsUpdate: true,
        reason: 'no_embedding'
      };
    }

    // Resume updated after embedding was generated
    if (resumeUpdatedAt && updatedAt && resumeUpdatedAt > updatedAt) {
      return {
        needsUpdate: true,
        reason: 'resume_updated'
      };
    }

    // Embedding is up to date
    return {
      needsUpdate: false,
      reason: 'up_to_date'
    };

  } catch (error) {
    logger.error('Failed to check embedding update status', {
      error: error.message,
      resumeId
    });

    return {
      needsUpdate: true,
      reason: 'error_checking'
    };
  }
}

/**
 * Get or generate resume embedding
 * This is the main method - retrieves from DB or generates if needed
 * @param {string} resumeId - Base resume ID
 * @param {Object} resumeData - Resume data object
 * @param {Object} options - Options
 * @param {boolean} options.forceRegenerate - Force regeneration even if exists
 * @returns {Promise<{embedding: Array<number>, fromDatabase: boolean}>}
 */
async function getOrGenerateResumeEmbedding(resumeId, resumeData, options = {}) {
  const {
    forceRegenerate = false
  } = options;

  const startTime = Date.now();

  try {
    // Check if we need to generate
    if (!forceRegenerate) {
      const { embedding, updatedAt } = await getResumeEmbedding(resumeId);

      if (embedding) {
        const duration = Date.now() - startTime;

        logger.info('Using resume embedding from database', {
          resumeId,
          duration,
          updatedAt
        });

        return {
          embedding,
          fromDatabase: true,
          updatedAt
        };
      }
    }

    // Generate new embedding
    logger.info('Generating new resume embedding', {
      resumeId,
      forceRegenerate
    });

    const embedding = await generateResumeEmbedding(resumeData);

    // Store in database
    await storeResumeEmbedding(resumeId, embedding);

    const duration = Date.now() - startTime;

    logger.info('Resume embedding generated and stored', {
      resumeId,
      duration,
      fromDatabase: false
    });

    return {
      embedding,
      fromDatabase: false,
      updatedAt: new Date()
    };

  } catch (error) {
    logger.error('Failed to get or generate resume embedding', {
      error: error.message,
      resumeId
    });
    throw error;
  }
}

/**
 * Delete resume embedding
 * @param {string} resumeId - Base resume ID
 * @returns {Promise<{deleted: boolean}>}
 */
async function deleteResumeEmbedding(resumeId) {
  try {
    logger.info('Deleting resume embedding', { resumeId });

    await prisma.$executeRawUnsafe(
      `UPDATE "base_resumes" 
       SET embedding = NULL, embedding_updated_at = NULL 
       WHERE id = $1`,
      resumeId
    );

    logger.info('Resume embedding deleted', { resumeId });

    return { deleted: true };

  } catch (error) {
    logger.error('Failed to delete resume embedding', {
      error: error.message,
      resumeId
    });

    return {
      deleted: false,
      error: error.message
    };
  }
}

/**
 * Batch update embeddings for multiple resumes
 * @param {Array<{resumeId: string, resumeData: Object}>} resumes - Array of resumes
 * @param {Object} options - Options
 * @returns {Promise<{successful: number, failed: number, results: Array}>}
 */
async function batchUpdateResumeEmbeddings(resumes, options = {}) {
  const startTime = Date.now();

  try {
    logger.info('Starting batch resume embedding update', {
      totalResumes: resumes.length
    });

    const results = await Promise.all(
      resumes.map(async ({ resumeId, resumeData }) => {
        try {
          const result = await getOrGenerateResumeEmbedding(resumeId, resumeData, options);

          return {
            resumeId,
            success: true,
            fromDatabase: result.fromDatabase
          };

        } catch (error) {
          logger.warn(`Failed to update embedding for resume ${resumeId}`, {
            error: error.message
          });

          return {
            resumeId,
            success: false,
            error: error.message
          };
        }
      })
    );

    const duration = Date.now() - startTime;
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    logger.info('Batch resume embedding update complete', {
      total: resumes.length,
      successful,
      failed,
      duration,
      averagePerResume: Math.round(duration / resumes.length)
    });

    return {
      successful,
      failed,
      results
    };

  } catch (error) {
    logger.error('Batch resume embedding update failed', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Get embedding statistics
 * @returns {Promise<Object>} Statistics about resume embeddings
 */
async function getEmbeddingStatistics() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        total_resumes,
        resumes_with_embeddings,
        resumes_without_embeddings,
        coverage_percentage,
        last_embedding_generated,
        first_embedding_generated
      FROM embedding_coverage_stats
    `;

    if (stats.length === 0) {
      return {
        totalResumes: 0,
        resumesWithEmbeddings: 0,
        resumesWithoutEmbeddings: 0,
        coveragePercentage: 0,
        lastEmbeddingGenerated: null,
        firstEmbeddingGenerated: null
      };
    }

    const s = stats[0];

    return {
      totalResumes: Number(s.total_resumes || 0),
      resumesWithEmbeddings: Number(s.resumes_with_embeddings || 0),
      resumesWithoutEmbeddings: Number(s.resumes_without_embeddings || 0),
      coveragePercentage: parseFloat(s.coverage_percentage) || 0,
      lastEmbeddingGenerated: s.last_embedding_generated,
      firstEmbeddingGenerated: s.first_embedding_generated
    };

  } catch (error) {
    logger.error('Failed to get embedding statistics', {
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  storeResumeEmbedding,
  getResumeEmbedding,
  needsEmbeddingUpdate,
  getOrGenerateResumeEmbedding,
  deleteResumeEmbedding,
  batchUpdateResumeEmbeddings,
  getEmbeddingStatistics
};

