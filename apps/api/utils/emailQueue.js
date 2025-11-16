/**
 * Email Retry Queue
 * BE-035: Email service failure handling with retry queue
 */

const logger = require('./logger');
const { sendEmail } = require('./emailService');
const { retry } = require('./retry');

// In-memory email queue (in production, use Redis or database)
const emailQueue = [];
let isProcessing = false;

/**
 * Add email to retry queue
 */
function queueEmail(emailData, retryCount = 0, maxRetries = 3) {
  emailQueue.push({
    ...emailData,
    retryCount,
    maxRetries,
    queuedAt: new Date(),
    nextRetryAt: new Date(Date.now() + calculateRetryDelay(retryCount))
  });
  
  logger.info(`Email queued for retry (attempt ${retryCount + 1}/${maxRetries}): ${emailData.to}`);
  
  // Start processing if not already processing
  if (!isProcessing) {
    processEmailQueue();
  }
}

/**
 * Calculate retry delay with exponential backoff
 */
function calculateRetryDelay(retryCount) {
  const baseDelay = 60000; // 1 minute
  const maxDelay = 3600000; // 1 hour
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  
  // Add jitter
  const jitter = Math.random() * 0.3 * delay;
  return delay + jitter;
}

/**
 * Process email queue
 */
async function processEmailQueue() {
  if (isProcessing || emailQueue.length === 0) {
    return;
  }
  
  isProcessing = true;
  logger.info(`Processing email queue: ${emailQueue.length} emails pending`);
  
  while (emailQueue.length > 0) {
    const emailItem = emailQueue.shift();
    const now = Date.now();
    
    // Skip if not ready for retry yet
    if (emailItem.nextRetryAt && now < emailItem.nextRetryAt.getTime()) {
      // Put it back at the end
      emailQueue.push(emailItem);
      continue;
    }
    
    try {
      // Try to send email with retry logic
      await retry(
        async () => {
          const { retryCount, maxRetries, queuedAt, nextRetryAt, ...emailData } = emailItem;
          return await sendEmail(emailData);
        },
        {
          maxRetries: 2, // Quick retries within the queue processing
          initialDelay: 1000
        }
      );
      
      logger.info(`Successfully sent queued email to ${emailItem.to}`);
    } catch (error) {
      logger.error(`Failed to send queued email to ${emailItem.to}:`, error);
      
      // If we haven't exceeded max retries, requeue
      if (emailItem.retryCount < emailItem.maxRetries) {
        emailItem.retryCount++;
        emailItem.nextRetryAt = new Date(Date.now() + calculateRetryDelay(emailItem.retryCount));
        emailQueue.push(emailItem);
        logger.info(`Requeued email for ${emailItem.to} (attempt ${emailItem.retryCount + 1}/${emailItem.maxRetries})`);
      } else {
        logger.error(`Max retries exceeded for email to ${emailItem.to}. Email will not be retried.`);
        // In production, you might want to store failed emails in a database for manual review
      }
    }
    
    // Small delay between processing emails
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  isProcessing = false;
  logger.info('Email queue processing completed');
}

/**
 * Send email with retry queue fallback
 * BE-035: Email service failure handling with retry queue
 */
async function sendEmailWithRetry(emailData) {
  try {
    // Try to send immediately
    return await sendEmail(emailData);
  } catch (error) {
    logger.warn(`Failed to send email immediately, queuing for retry: ${error.message}`);
    
    // Queue for retry
    queueEmail(emailData, 0, 3);
    
    // Return success to caller (email will be retried in background)
    return {
      success: true,
      provider: 'queued',
      message: 'Email queued for retry due to service failure'
    };
  }
}

/**
 * Get queue status
 */
function getQueueStatus() {
  return {
    queueLength: emailQueue.length,
    isProcessing,
    pendingEmails: emailQueue.map(item => ({
      to: item.to,
      subject: item.subject,
      retryCount: item.retryCount,
      maxRetries: item.maxRetries,
      nextRetryAt: item.nextRetryAt
    }))
  };
}

// Start processing queue periodically
setInterval(() => {
  if (emailQueue.length > 0 && !isProcessing) {
    processEmailQueue();
  }
}, 30000); // Check every 30 seconds

module.exports = {
  sendEmailWithRetry,
  queueEmail,
  processEmailQueue,
  getQueueStatus
};

