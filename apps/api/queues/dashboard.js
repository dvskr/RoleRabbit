/**
 * Bull Board - Job Monitoring Dashboard
 * 
 * Web UI for monitoring BullMQ queues
 * Access at: http://localhost:3001/admin/queues
 */

const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { queues } = require('./index');

/**
 * Create Bull Board instance
 */
function setupBullBoard(app) {
  // Create Express adapter
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  // Create Bull Board with all queues
  const queueAdapters = Object.values(queues).map(queue => new BullMQAdapter(queue));

  createBullBoard({
    queues: queueAdapters,
    serverAdapter
  });

  // Mount Bull Board UI
  app.use('/admin/queues', serverAdapter.getRouter());

  console.log('📊 Bull Board dashboard available at: /admin/queues');

  return serverAdapter;
}

/**
 * Authentication middleware for Bull Board
 * Add this before mounting the dashboard in production
 */
function bullBoardAuth(req, res, next) {
  // Basic authentication
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Bull Board"');
    return res.status(401).send('Authentication required');
  }

  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const username = auth[0];
  const password = auth[1];

  // Check credentials (use environment variables in production)
  const validUsername = process.env.BULL_BOARD_USERNAME || 'admin';
  const validPassword = process.env.BULL_BOARD_PASSWORD || 'admin';

  if (username === validUsername && password === validPassword) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Bull Board"');
  return res.status(401).send('Invalid credentials');
}

/**
 * Setup Bull Board with authentication
 */
function setupSecureBullBoard(app) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const queueAdapters = Object.values(queues).map(queue => new BullMQAdapter(queue));

  createBullBoard({
    queues: queueAdapters,
    serverAdapter
  });

  // Add authentication middleware
  app.use('/admin/queues', bullBoardAuth, serverAdapter.getRouter());

  console.log('📊 Secure Bull Board dashboard available at: /admin/queues');
  console.log(`   Username: ${process.env.BULL_BOARD_USERNAME || 'admin'}`);
  console.log(`   Password: ${process.env.BULL_BOARD_PASSWORD || 'admin'}`);

  return serverAdapter;
}

module.exports = {
  setupBullBoard,
  setupSecureBullBoard,
  bullBoardAuth
};

