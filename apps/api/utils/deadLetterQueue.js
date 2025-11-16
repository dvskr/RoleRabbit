/**
 * Dead Letter Queue (DLQ) for Failed AI Operations
 * 
 * Stores failed AI operations for manual review and retry.
 * Prevents data loss when AI services fail after retries.
 */

/**
 * DLQ Entry Status
 */
const DLQStatus = {
  PENDING: 'PENDING',       // Waiting for retry
  RETRYING: 'RETRYING',     // Currently being retried
  COMPLETED: 'COMPLETED',   // Successfully completed
  FAILED: 'FAILED',         // Permanently failed
  CANCELLED: 'CANCELLED'    // Manually cancelled
};

/**
 * DLQ Operation Types
 */
const DLQOperationType = {
  ATS_ANALYSIS: 'ATS_ANALYSIS',
  RESUME_TAILORING: 'RESUME_TAILORING',
  COVER_LETTER: 'COVER_LETTER',
  PORTFOLIO_GENERATION: 'PORTFOLIO_GENERATION',
  AI_CONTENT_GENERATION: 'AI_CONTENT_GENERATION'
};

/**
 * Dead Letter Queue Manager
 */
class DeadLetterQueue {
  constructor(db) {
    this.db = db; // Database connection (Prisma, Sequelize, etc.)
  }

  /**
   * Add failed operation to DLQ
   */
  async add(operation) {
    const {
      userId,
      resumeId,
      operationType,
      payload,
      error,
      attemptCount = 0,
      metadata = {}
    } = operation;

    try {
      const entry = await this.db.deadLetterQueue.create({
        data: {
          userId,
          resumeId,
          operationType,
          payload: JSON.stringify(payload),
          error: JSON.stringify({
            message: error.message,
            stack: error.stack,
            code: error.code,
            status: error.status
          }),
          attemptCount,
          status: DLQStatus.PENDING,
          metadata: JSON.stringify(metadata),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`Added operation to DLQ: ${entry.id} (${operationType})`);
      return entry;
      
    } catch (dbError) {
      console.error('Failed to add operation to DLQ:', dbError);
      // Log to file as fallback
      this.logToFile(operation, error);
    }
  }

  /**
   * Get pending operations
   */
  async getPending(limit = 100) {
    try {
      return await this.db.deadLetterQueue.findMany({
        where: {
          status: DLQStatus.PENDING
        },
        orderBy: {
          createdAt: 'asc'
        },
        take: limit
      });
    } catch (error) {
      console.error('Failed to get pending DLQ entries:', error);
      return [];
    }
  }

  /**
   * Retry a specific operation
   */
  async retry(entryId, retryFn) {
    try {
      // Get entry
      const entry = await this.db.deadLetterQueue.findUnique({
        where: { id: entryId }
      });

      if (!entry) {
        throw new Error(`DLQ entry ${entryId} not found`);
      }

      // Update status to retrying
      await this.db.deadLetterQueue.update({
        where: { id: entryId },
        data: {
          status: DLQStatus.RETRYING,
          attemptCount: entry.attemptCount + 1,
          updatedAt: new Date()
        }
      });

      // Parse payload
      const payload = JSON.parse(entry.payload);

      // Execute retry function
      const result = await retryFn(payload);

      // Mark as completed
      await this.db.deadLetterQueue.update({
        where: { id: entryId },
        data: {
          status: DLQStatus.COMPLETED,
          result: JSON.stringify(result),
          completedAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`DLQ entry ${entryId} completed successfully`);
      return { success: true, result };
      
    } catch (error) {
      console.error(`Failed to retry DLQ entry ${entryId}:`, error);

      // Update with failure
      await this.db.deadLetterQueue.update({
        where: { id: entryId },
        data: {
          status: DLQStatus.FAILED,
          error: JSON.stringify({
            message: error.message,
            stack: error.stack,
            retriedAt: new Date()
          }),
          updatedAt: new Date()
        }
      });

      return { success: false, error: error.message };
    }
  }

  /**
   * Retry all pending operations
   */
  async retryAll(retryFnMap) {
    const pending = await this.getPending();
    const results = [];

    for (const entry of pending) {
      const retryFn = retryFnMap[entry.operationType];
      
      if (!retryFn) {
        console.warn(`No retry function for operation type: ${entry.operationType}`);
        continue;
      }

      const result = await this.retry(entry.id, retryFn);
      results.push({ entryId: entry.id, ...result });
    }

    return results;
  }

  /**
   * Cancel an operation
   */
  async cancel(entryId, reason = '') {
    try {
      await this.db.deadLetterQueue.update({
        where: { id: entryId },
        data: {
          status: DLQStatus.CANCELLED,
          metadata: JSON.stringify({ cancelReason: reason }),
          updatedAt: new Date()
        }
      });

      console.log(`DLQ entry ${entryId} cancelled: ${reason}`);
      return true;
    } catch (error) {
      console.error(`Failed to cancel DLQ entry ${entryId}:`, error);
      return false;
    }
  }

  /**
   * Get statistics
   */
  async getStats() {
    try {
      const [pending, retrying, completed, failed, cancelled] = await Promise.all([
        this.db.deadLetterQueue.count({ where: { status: DLQStatus.PENDING } }),
        this.db.deadLetterQueue.count({ where: { status: DLQStatus.RETRYING } }),
        this.db.deadLetterQueue.count({ where: { status: DLQStatus.COMPLETED } }),
        this.db.deadLetterQueue.count({ where: { status: DLQStatus.FAILED } }),
        this.db.deadLetterQueue.count({ where: { status: DLQStatus.CANCELLED } })
      ]);

      return {
        pending,
        retrying,
        completed,
        failed,
        cancelled,
        total: pending + retrying + completed + failed + cancelled
      };
    } catch (error) {
      console.error('Failed to get DLQ stats:', error);
      return null;
    }
  }

  /**
   * Clean up old completed/cancelled entries
   */
  async cleanup(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.db.deadLetterQueue.deleteMany({
        where: {
          status: {
            in: [DLQStatus.COMPLETED, DLQStatus.CANCELLED]
          },
          updatedAt: {
            lt: cutoffDate
          }
        }
      });

      console.log(`Cleaned up ${result.count} old DLQ entries`);
      return result.count;
    } catch (error) {
      console.error('Failed to cleanup DLQ:', error);
      return 0;
    }
  }

  /**
   * Log to file as fallback
   */
  logToFile(operation, error) {
    const fs = require('fs');
    const path = require('path');
    
    const logDir = path.join(__dirname, '../logs');
    const logFile = path.join(logDir, 'dlq-fallback.log');

    try {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logEntry = {
        timestamp: new Date().toISOString(),
        operation,
        error: {
          message: error.message,
          stack: error.stack
        }
      };

      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    } catch (fileError) {
      console.error('Failed to log to file:', fileError);
    }
  }
}

/**
 * Partial Success Handler
 * Saves partial results when operations partially succeed
 */
class PartialSuccessHandler {
  /**
   * Save partial result
   */
  static async savePartialResult(operation, partialResult, failedSteps) {
    console.log(`Saving partial result for ${operation.type}:`, {
      completedSteps: Object.keys(partialResult).length,
      failedSteps: failedSteps.length
    });

    return {
      success: 'partial',
      result: partialResult,
      failedSteps,
      warning: `Operation partially completed. ${failedSteps.length} steps failed.`,
      metadata: {
        completedCount: Object.keys(partialResult).length,
        failedCount: failedSteps.length,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Handle partial tailoring result
   */
  static async handlePartialTailoring(resumeData, completedSections, failedSections) {
    console.warn(`Tailoring partially completed: ${completedSections.length} sections succeeded, ${failedSections.length} failed`);

    // Merge completed sections with original data
    const partialResult = { ...resumeData };
    
    completedSections.forEach(section => {
      partialResult[section.name] = section.data;
    });

    return {
      success: 'partial',
      data: partialResult,
      completedSections: completedSections.map(s => s.name),
      failedSections: failedSections.map(s => s.name),
      warning: `Tailoring completed for ${completedSections.length} sections. ${failedSections.length} sections could not be tailored.`,
      shouldRetry: failedSections.length > 0
    };
  }
}

module.exports = {
  DeadLetterQueue,
  PartialSuccessHandler,
  DLQStatus,
  DLQOperationType
};

