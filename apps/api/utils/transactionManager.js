/**
 * Transaction Manager for Multi-Step Operations
 * BE-030: Transaction rollback for multi-step operations
 */

const logger = require('./logger');
const { ERROR_CODES } = require('./errorCodes');

/**
 * Execute operation with transaction support
 * BE-030: Transaction rollback for multi-step operations
 */
async function executeWithTransaction(prisma, operations, rollbackOperations = []) {
  let transactionResult = null;
  
  try {
    // Execute operations in transaction
    transactionResult = await prisma.$transaction(async (tx) => {
      const results = [];
      
      for (const operation of operations) {
        const result = await operation(tx);
        results.push(result);
      }
      
      return results;
    });
    
    return {
      success: true,
      results: transactionResult
    };
  } catch (error) {
    logger.error('Transaction failed:', error);
    
    // Execute rollback operations
    if (rollbackOperations.length > 0) {
      logger.info('Executing rollback operations...');
      try {
        for (const rollbackOp of rollbackOperations) {
          await rollbackOp();
        }
        logger.info('Rollback operations completed');
      } catch (rollbackError) {
        logger.error('Rollback operation failed:', rollbackError);
        // Don't throw - we want to report the original error
      }
    }
    
    return {
      success: false,
      error: error.message,
      errorCode: ERROR_CODES.TRANSACTION_FAILED
    };
  }
}

/**
 * Upload operation with transaction and cleanup
 * BE-032: Partial upload failure handling (cleanup storage if DB save fails)
 */
async function executeUploadWithCleanup(prisma, storageHandler, operations) {
  const { uploadOperation, dbOperation, storagePath } = operations;
  let uploaded = false;
  
  try {
    // Step 1: Upload to storage
    logger.info('Uploading file to storage...');
    const uploadResult = await uploadOperation();
    uploaded = true;
    logger.info('File uploaded to storage successfully');
    
    // Step 2: Save to database in transaction
    logger.info('Saving file metadata to database...');
    const dbResult = await prisma.$transaction(async (tx) => {
      return await dbOperation(tx);
    });
    
    logger.info('File upload completed successfully');
    return {
      success: true,
      uploadResult,
      dbResult
    };
  } catch (error) {
    logger.error('Upload operation failed:', error);
    
    // BE-032: Cleanup storage if DB save fails
    if (uploaded && storagePath) {
      logger.warn(`Cleaning up uploaded file from storage: ${storagePath}`);
      try {
        await storageHandler.delete(storagePath);
        logger.info('Successfully cleaned up uploaded file from storage');
      } catch (cleanupError) {
        logger.error('Failed to cleanup uploaded file from storage:', cleanupError);
        // Log but don't throw - we want to report the original error
      }
    }
    
    throw error;
  }
}

module.exports = {
  executeWithTransaction,
  executeUploadWithCleanup
};

