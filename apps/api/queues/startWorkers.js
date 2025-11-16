/**
 * Start All Workers
 * 
 * Initializes and starts all background job workers
 */

const { startExportWorker } = require('./workers/exportWorker');
const { startAIWorker } = require('./workers/aiWorker');
const { startParseWorker } = require('./workers/parseWorker');
const { startEmbeddingWorker } = require('./workers/embeddingWorker');
const { scheduleCleanup } = require('./cleanup');

/**
 * Start all workers
 */
function startAllWorkers() {
  console.log('🚀 Starting all workers...\n');

  const workers = [];

  try {
    // Start export worker
    workers.push(startExportWorker());

    // Start AI worker
    workers.push(startAIWorker());

    // Start parse worker
    workers.push(startParseWorker());

    // Start embedding worker
    workers.push(startEmbeddingWorker());

    // Schedule cleanup
    scheduleCleanup();

    console.log('\n✅ All workers started successfully');
    console.log(`Active workers: ${workers.length}`);

    return workers;

  } catch (error) {
    console.error('❌ Failed to start workers:', error);
    throw error;
  }
}

/**
 * Run if called directly
 */
if (require.main === module) {
  startAllWorkers();

  // Keep process alive
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down...');
    const { shutdown } = require('./index');
    await shutdown();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down...');
    const { shutdown } = require('./index');
    await shutdown();
    process.exit(0);
  });
}

module.exports = {
  startAllWorkers
};

