/**
 * Parallel Execution Utility
 * Optimizes performance by running independent operations concurrently
 */

const logger = require('./logger');
const { parseError, logError } = require('./errorHandler');

/**
 * Execute multiple promises in parallel with error handling
 */
async function executeParallel(operations, options = {}) {
  const {
    continueOnError = false,
    timeout = 120000, // 2 minutes default
    operationNames = []
  } = options;

  const startTime = Date.now();
  
  try {
    // Add timeout wrapper to each operation
    const wrappedOperations = operations.map((op, index) => {
      const name = operationNames[index] || `Operation ${index + 1}`;
      
      return Promise.race([
        op.catch(error => {
          const parsedError = parseError(error);
          parsedError.metadata = {
            ...parsedError.metadata,
            operationName: name,
            operationIndex: index
          };
          throw parsedError;
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`${name} timed out after ${timeout}ms`)), timeout)
        )
      ]);
    });

    // Execute all operations
    const results = continueOnError
      ? await Promise.allSettled(wrappedOperations)
      : await Promise.all(wrappedOperations);

    const duration = Date.now() - startTime;

    // Log success
    logger.info('Parallel execution completed', {
      operationCount: operations.length,
      durationMs: duration,
      continueOnError
    });

    // Process results if using allSettled
    if (continueOnError) {
      const succeeded = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      if (failed.length > 0) {
        logger.warn('Some parallel operations failed', {
          total: results.length,
          succeeded: succeeded.length,
          failed: failed.length,
          errors: failed.map((r, i) => ({
            operation: operationNames[i] || `Operation ${i + 1}`,
            error: r.reason?.message
          }))
        });
      }

      return results;
    }

    return results;

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logError(error, {
      operation: 'parallel_execution',
      operationCount: operations.length,
      durationMs: duration
    });

    throw error;
  }
}

/**
 * Execute operations in parallel with intelligent batching
 */
async function executeBatched(items, processor, options = {}) {
  const {
    batchSize = 5,
    continueOnError = false,
    delayBetweenBatches = 0,
    onBatchComplete
  } = options;

  const results = [];
  const batches = [];

  // Create batches
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  logger.info('Starting batched execution', {
    totalItems: items.length,
    batchSize,
    batchCount: batches.length
  });

  // Process each batch
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchStartTime = Date.now();

    try {
      const batchResults = await executeParallel(
        batch.map(item => processor(item)),
        { continueOnError, operationNames: batch.map((_, idx) => `Item ${i * batchSize + idx + 1}`) }
      );

      results.push(...batchResults);

      const batchDuration = Date.now() - batchStartTime;
      
      logger.info(`Batch ${i + 1}/${batches.length} completed`, {
        batchSize: batch.length,
        durationMs: batchDuration
      });

      // Callback for batch completion
      if (onBatchComplete) {
        await onBatchComplete({
          batchIndex: i,
          batchResults,
          totalBatches: batches.length,
          progress: ((i + 1) / batches.length) * 100
        });
      }

      // Delay between batches if specified
      if (delayBetweenBatches > 0 && i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }

    } catch (error) {
      logger.error(`Batch ${i + 1} failed`, {
        batchSize: batch.length,
        error: error.message
      });

      if (!continueOnError) {
        throw error;
      }
    }
  }

  return results;
}

/**
 * Execute with race condition - return first successful result
 */
async function executeRace(operations, options = {}) {
  const {
    timeout = 60000,
    operationNames = [],
    fallbackOnAllFailed
  } = options;

  const startTime = Date.now();

  try {
    // Add timeout
    const withTimeout = Promise.race([
      Promise.race(operations.map((op, i) => 
        op.then(result => ({ result, index: i }))
      )),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('All operations timed out')), timeout)
      )
    ]);

    const winner = await withTimeout;
    const duration = Date.now() - startTime;

    logger.info('Race execution completed', {
      winnerIndex: winner.index,
      winnerName: operationNames[winner.index] || `Operation ${winner.index + 1}`,
      durationMs: duration
    });

    return winner.result;

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.warn('All race operations failed', {
      operationCount: operations.length,
      durationMs: duration,
      error: error.message
    });

    if (fallbackOnAllFailed !== undefined) {
      logger.info('Using fallback value');
      return fallbackOnAllFailed;
    }

    throw error;
  }
}

/**
 * Execute with sequential fallback - try operations in order until one succeeds
 */
async function executeWithFallback(operations, operationNames = []) {
  for (let i = 0; i < operations.length; i++) {
    const name = operationNames[i] || `Operation ${i + 1}`;
    
    try {
      logger.info(`Attempting ${name}`);
      const result = await operations[i];
      
      if (i > 0) {
        logger.warn(`Succeeded with fallback operation: ${name}`);
      }
      
      return result;

    } catch (error) {
      logger.warn(`${name} failed`, { error: error.message });
      
      if (i === operations.length - 1) {
        logger.error('All fallback operations exhausted');
        throw error;
      }
    }
  }
}

/**
 * Execute with retry and parallel fallback
 */
async function executeWithParallelFallback(primaryOperation, fallbackOperations, options = {}) {
  const {
    primaryTimeout = 60000,
    fallbackDelay = 2000,
    operationNames = ['Primary', ...fallbackOperations.map((_, i) => `Fallback ${i + 1}`)]
  } = options;

  const startTime = Date.now();

  try {
    // Try primary with timeout
    const result = await Promise.race([
      primaryOperation,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Primary operation timeout')), primaryTimeout)
      )
    ]);

    logger.info('Primary operation succeeded', {
      durationMs: Date.now() - startTime
    });

    return result;

  } catch (primaryError) {
    logger.warn('Primary operation failed, trying fallbacks', {
      error: primaryError.message,
      fallbackCount: fallbackOperations.length
    });

    // Small delay before fallbacks
    await new Promise(resolve => setTimeout(resolve, fallbackDelay));

    // Try all fallbacks in parallel
    return await executeRace(fallbackOperations, {
      operationNames: operationNames.slice(1),
      fallbackOnAllFailed: undefined // Let it throw if all fail
    });
  }
}

/**
 * Execute operations in parallel with dependency resolution
 */
async function executeWithDependencies(tasks) {
  const completed = new Map();
  const results = {};

  // Helper to check if dependencies are met
  const areDependenciesMet = (task) => {
    if (!task.dependencies || task.dependencies.length === 0) {
      return true;
    }
    return task.dependencies.every(dep => completed.has(dep));
  };

  // Helper to get dependency results
  const getDependencyResults = (task) => {
    if (!task.dependencies) return {};
    return task.dependencies.reduce((acc, dep) => {
      acc[dep] = results[dep];
      return acc;
    }, {});
  };

  // Execute tasks in waves based on dependencies
  while (completed.size < tasks.length) {
    // Find all tasks that can run now
    const ready = tasks.filter(task => 
      !completed.has(task.name) && areDependenciesMet(task)
    );

    if (ready.length === 0) {
      throw new Error('Circular dependency detected or invalid task configuration');
    }

    logger.info('Executing task wave', {
      taskCount: ready.length,
      taskNames: ready.map(t => t.name)
    });

    // Execute ready tasks in parallel
    const waveResults = await executeParallel(
      ready.map(task => task.fn(getDependencyResults(task))),
      {
        operationNames: ready.map(t => t.name),
        continueOnError: false
      }
    );

    // Mark tasks as completed and store results
    ready.forEach((task, index) => {
      completed.set(task.name, true);
      results[task.name] = waveResults[index];
    });
  }

  return results;
}

/**
 * Performance tracking for parallel operations
 */
class ParallelPerformanceTracker {
  constructor(name) {
    this.name = name;
    this.operations = [];
    this.startTime = Date.now();
  }

  track(operationName, promise) {
    const opStart = Date.now();
    const tracked = promise.then(
      result => {
        const duration = Date.now() - opStart;
        this.operations.push({
          name: operationName,
          duration,
          success: true,
          timestamp: new Date().toISOString()
        });
        return result;
      },
      error => {
        const duration = Date.now() - opStart;
        this.operations.push({
          name: operationName,
          duration,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    );
    return tracked;
  }

  getReport() {
    const totalDuration = Date.now() - this.startTime;
    const successful = this.operations.filter(op => op.success);
    const failed = this.operations.filter(op => !op.success);

    const sequentialTime = this.operations.reduce((sum, op) => sum + op.duration, 0);
    const parallelSavings = sequentialTime - totalDuration;
    const speedup = (sequentialTime / totalDuration).toFixed(2);

    return {
      name: this.name,
      totalDuration,
      sequentialTime,
      parallelSavings,
      speedup: `${speedup}x`,
      efficiency: `${((parallelSavings / sequentialTime) * 100).toFixed(1)}%`,
      operations: this.operations.length,
      successful: successful.length,
      failed: failed.length,
      operationDetails: this.operations
    };
  }

  log() {
    const report = this.getReport();
    logger.info(`Parallel Performance Report: ${this.name}`, report);
    return report;
  }
}

module.exports = {
  executeParallel,
  executeBatched,
  executeRace,
  executeWithFallback,
  executeWithParallelFallback,
  executeWithDependencies,
  ParallelPerformanceTracker
};

