const fastify = require('fastify')({
  bodyLimit: 10485760, // 10MB body limit for JSON requests
  requestTimeout: 30000, // 30 second request timeout
  keepAliveTimeout: 65000, // 65 seconds for keep-alive  
  connectionTimeout: 10000, // 10 second connection timeout
  logger: {
    level: 'info',
    serializers: {
      req: (req) => {
        // Suppress logging for frontend routes that shouldn't be on API server
        const frontendRoutes = ['/dashboard', '/login', '/register', '/profile'];
        const path = req.url?.split('?')[0];
        if (frontendRoutes.includes(path)) {
          // Return minimal info to suppress detailed logging
          return { method: req.method, url: '[Frontend Route - Not an API endpoint]' };
        }
        return {
          method: req.method,
          url: req.url,
          hostname: req.hostname,
          remoteAddress: req.ip,
          remotePort: req.socket?.remotePort
        };
      },
      res: (res) => {
        // Suppress 404 logging for frontend routes
        const frontendRoutes = ['/dashboard', '/login', '/register', '/profile'];
        const path = res.request?.url?.split('?')[0];
        if (frontendRoutes.includes(path) && res.statusCode === 404) {
          return { statusCode: '[Suppressed - Frontend Route]' };
        }
        return {
          statusCode: res.statusCode
        };
      }
    }
  }
});

// Load environment variables
require('dotenv').config();

// Custom logger
const logger = require('./utils/logger');

// Security utilities
const { sanitizeInput, getRateLimitConfig } = require('./utils/security');

// Validation utilities
const { 
  validateEmail, 
  validatePassword, 
  validateRequired, 
  validateLength,
  validateResumeData,
  validateJobApplication 
} = require('./utils/validation');

// Database connection
const { connectDB, disconnectDB } = require('./utils/db');

// Authentication
const { registerUser, authenticateUser, getUserById, resetUserPassword } = require('./auth');
const { createRefreshToken, verifyRefreshToken, deleteAllUserRefreshTokens } = require('./utils/refreshToken');
const { createSession, getUserSessions, deactivateAllUserSessions, deactivateSession } = require('./utils/sessionManager');
const { createPasswordResetToken, verifyPasswordResetToken } = require('./utils/passwordReset');

// Jobs utilities
const { 
  getJobsByUserId, 
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob 
} = require('./utils/jobs');

// Resumes utilities
const { 
  getResumesByUserId,
  getResumeById,
  createResume,
  updateResume,
  deleteResume
} = require('./utils/resumes');

// Emails utilities
const { 
  getEmailsByUserId,
  getEmailById,
  createEmail,
  updateEmail,
  deleteEmail,
  getEmailsByJobId
} = require('./utils/emails');

// Cover Letters utilities
const { 
  getCoverLettersByUserId,
  getCoverLetterById,
  createCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
  getCoverLettersByJobId
} = require('./utils/coverLetters');

// Portfolios utilities
const { 
  getPortfoliosByUserId,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio
} = require('./utils/portfolios');

// Cloud Files utilities
const { 
  getCloudFilesByUserId,
  getCloudFileById,
  createCloudFile,
  updateCloudFile,
  deleteCloudFile,
  getCloudFilesByFolder
} = require('./utils/cloudFiles');

// File Upload utilities
const { uploadSingle, uploadMultiple, deleteFile, getFilePath, fileExists } = require('./utils/fileUpload');

// Email service
const { sendEmail, sendWelcomeEmail, sendPasswordResetEmail, sendJobReminderEmail } = require('./utils/emailService');

// Resume export utilities
const { exportResume } = require('./utils/resumeExport');

// AI Agents utilities (from agentExecutor)
const { 
  executeAgentTask, 
  runActiveAgentsForUser,
  AGENT_TYPES, 
  getAgentTaskHistory
} = require('./utils/agentExecutor');

// Job Analytics utilities
const {
  getJobAnalytics,
  getApplicationTrends,
  getSuccessMetrics
} = require('./utils/jobAnalytics');

// WebSocket Server
const WebSocketServer = require('./utils/websocketServer');

// Health Check utilities
const {
  getHealthStatus,
  isHealthy
} = require('./utils/healthCheck');

// API Versioning utilities
const {
  getVersion,
  validateVersion,
  getVersionInfo
} = require('./utils/versioning');

// Sanitization utilities
const { sanitizationMiddleware } = require('./utils/sanitizer');

// Analytics utilities
const { 
  getAnalyticsByUserId,
  getAnalyticsById,
  createAnalytics,
  updateAnalytics,
  deleteAnalytics,
  getAnalyticsByType
} = require('./utils/analytics');

// Discussion utilities
const { 
  getDiscussionPosts,
  getDiscussionPostById,
  createDiscussionPost,
  updateDiscussionPost,
  deleteDiscussionPost,
  getCommentsByPostId,
  createComment,
  updateComment,
  deleteComment
} = require('./utils/discussions');

// AI Agents utilities (from aiAgents)
const {
  getAgentsByUserId,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  getAgentTasks,
  createAgentTask,
  updateAgentTask,
  getAgentStats
} = require('./utils/aiAgents');

// Register compression
fastify.register(require('@fastify/compress'), {
  global: true,
  encodings: ['gzip', 'deflate']
});

// Register security headers (helmet)
fastify.register(require('@fastify/helmet'), {
  contentSecurityPolicy: false
});

// Register CORS
fastify.register(require('@fastify/cors'), {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
});

// Register rate limiting globally
fastify.register(require('@fastify/rate-limit'), {
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  errorResponseBuilder: (request, context) => {
    return {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(context.ttl / 1000)
    };
  }
});

// Register cookie support for JWT tokens
fastify.register(require('@fastify/cookie'));

// Register JWT with secure secret
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || require('crypto').randomBytes(64).toString('hex')
});

// Authentication middleware - import for use in routes
const { authenticate } = require('./middleware/auth');

// Register multipart
fastify.register(require('@fastify/multipart'), {
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Hook to make cookie token available for jwtVerify (runs after cookies are parsed)
fastify.addHook('preHandler', async (request, reply) => {
  // If we have a cookie token but no Authorization header, set it so jwtVerify can use it
  const cookieToken = request.cookies?.auth_token;
  const authHeader = request.headers.authorization;
  
  if (cookieToken && !authHeader) {
    request.headers.authorization = `Bearer ${cookieToken}`;
    // Debug log (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Auth Hook] Set Authorization header from cookie for ${request.method} ${request.url}`);
    }
  } else if (!cookieToken && !authHeader) {
    // Debug log
    if (process.env.NODE_ENV !== 'production' && !request.url.includes('/health') && !request.url.includes('/api/status')) {
      console.log(`[Auth Hook] No auth token found for ${request.method} ${request.url}`);
    }
  }
});

// Add request body sanitization hook
fastify.addHook('preValidation', async (request, reply) => {
  // Sanitize request body if it exists
  if (request.body && typeof request.body === 'object') {
    request.body = sanitizeInput(request.body);
  }
  
  // Sanitize query parameters
  if (request.query && typeof request.query === 'object') {
    request.query = sanitizeInput(request.query);
  }
  
  // Apply additional sanitization
  sanitizationMiddleware()(request, reply);
});

// Health check
// Health check endpoint with detailed status
fastify.get('/health', async (request, reply) => {
  try {
    const healthStatus = await getHealthStatus();
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    reply.status(statusCode).send(healthStatus);
  } catch (error) {
    reply.status(503).send({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API status with versioning info
fastify.get('/api/status', async (request) => ({
  message: 'RoleReady Node.js API is running',
  version: getVersionInfo(),
  endpoints: {
    auth: '/api/auth/*',
    users: '/api/users/*',
    resumes: '/api/resumes/*',
    jobs: '/api/jobs/*',
    cloud: '/api/cloud/*',
    health: '/health'
  }
}));

// Register route modules
fastify.register(require('./routes/auth.routes'));
fastify.register(require('./routes/users.routes'));
fastify.register(require('./routes/resumes.routes'));
fastify.register(require('./routes/jobs.routes'));
fastify.register(require('./routes/emails.routes'));
fastify.register(require('./routes/coverLetters.routes'));
fastify.register(require('./routes/portfolios.routes'));
fastify.register(require('./routes/files.routes'));
fastify.register(require('./routes/analytics.routes'));
fastify.register(require('./routes/discussions.routes'));
fastify.register(require('./routes/agents.routes'));
fastify.register(require('./routes/ai.routes'));
fastify.register(require('./routes/dashboard.routes'));

// Register 2FA routes (using handlers from twoFactorAuth.routes.js)
const {
  generate2FASetup,
  enable2FAEndpoint,
  disable2FAEndpoint,
  verify2FAToken,
  get2FAStatus
} = require('./routes/twoFactorAuth.routes');

fastify.post('/api/auth/2fa/setup', {
  preHandler: authenticate
}, generate2FASetup);

fastify.post('/api/auth/2fa/enable', {
  preHandler: authenticate
}, enable2FAEndpoint);

fastify.post('/api/auth/2fa/disable', {
  preHandler: authenticate
}, disable2FAEndpoint);

fastify.post('/api/auth/2fa/verify', verify2FAToken);

fastify.get('/api/auth/2fa/status', {
  preHandler: authenticate
}, get2FAStatus);

// Global error handler
const { globalErrorHandler } = require('./utils/errorHandler');
fastify.setErrorHandler(globalErrorHandler);

// 404 Not Found handler - handles routes that don't exist
fastify.setNotFoundHandler(async (request, reply) => {
  const path = request.url.split('?')[0];
  
  // Silently handle known frontend routes that shouldn't be on API server
  const frontendRoutes = ['/dashboard', '/login', '/register', '/profile'];
  if (frontendRoutes.includes(path)) {
    // This is a Next.js route, not an API route - return 404 without logging
    return reply.status(404).send({
        success: false,
      error: 'Not Found',
      message: 'This is a frontend route. Access it via the Next.js server (http://localhost:3000) instead of the API server (http://localhost:3001).',
      path: request.url,
      hint: 'Frontend routes are served by Next.js on port 3000, not the API server on port 3001'
    });
  }
  
  // For other 404s, provide helpful error message
  return reply.status(404).send({
      success: false,
    error: 'Not Found',
    message: `API endpoint not found: ${request.method} ${request.url}`,
    availableEndpoints: {
      health: 'GET /health',
      status: 'GET /api/status',
      auth: '/api/auth/*',
      users: '/api/users/*',
      resumes: '/api/resumes/*',
      jobs: '/api/jobs/*',
      cloud: '/api/cloud/*'
    }
  });
});

// Start server
const start = async () => {
  try {
    // Connect to database first (with retry logic)
    let dbConnected = false;
    let retries = 0;
    const maxRetries = 5;
    
    while (!dbConnected && retries < maxRetries) {
      dbConnected = await connectDB();
      if (!dbConnected) {
        retries++;
        if (retries < maxRetries) {
          logger.warn(`Database connection failed, retrying... (${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        }
      }
    }
    
    if (!dbConnected) {
      logger.error('❌ Failed to connect to database after multiple attempts. Server will continue but database operations may fail.');
    }
    
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || 'localhost';
    
    await fastify.listen({ port, host });
    
    logger.info(`🚀 RoleReady Node.js API running on http://${host}:${port}`);
    logger.info(`📊 Health check: http://${host}:${port}/health`);
    logger.info(`📋 API status: http://${host}:${port}/api/status`);
  } catch (err) {
    logger.error('Failed to start server:', err);
    console.error('Server startup error:', err);
    // Don't exit immediately - try to log and recover
    process.exit(1);
  }
};

// Graceful shutdown
// Handle unhandled promise rejections (prevent crashes)
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Unhandled Rejection:', reason);
  // Log but don't crash - allow server to continue running
  // Only in development, we might want to see this more clearly
});

// Handle uncaught exceptions (prevent crashes)
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  console.error('Uncaught Exception:', error);
  // Graceful shutdown on uncaught exception
  shutdown('uncaughtException');
});

// Graceful shutdown handler
async function shutdown(signal) {
  logger.info(`🛑 Shutting down server (${signal})...`);
  try {
    await fastify.close();
    await disconnectDB();
    logger.info('✅ Server shut down gracefully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Graceful shutdown on signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle process warnings
process.on('warning', (warning) => {
  logger.warn('Process Warning:', warning);
});

start();
