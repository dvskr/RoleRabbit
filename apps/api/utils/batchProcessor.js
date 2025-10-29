/**
 * Batch Processor Utility
 * Processes items in batches
 */

/**
 * Process items in batches
 */
async function processBatch(items, batchSize, processor, options = {}) {
  const results = [];
  const errors = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    try {
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      );
      results.push(...batchResults);
    } catch (error) {
      errors.push({ batch, error });
      
      if (options.stopOnError) {
        throw error;
      }
    }
    
    // Delay between batches if specified
    if (options.delay && i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
  }
  
  return { results, errors };
}

/**
 * Split array into batches
 */
function splitIntoBatches(items, batchSize) {
  const batches = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  return batches;
}

module.exports = {
  processBatch,
  splitIntoBatches
};
