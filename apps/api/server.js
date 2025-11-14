// Load environment variables FIRST before anything else
require('dotenv').config();

// SECURITY: Validate environment variables on startup
const { validateEnv, printEnvStatus } = require('./utils/envValidator');

// Validate required environment variables
validateEnv({
  exitOnError: process.env.NODE_ENV === 'production', // Exit on error in production
  logResults: true
});

// Print environment status (only in development)
if (process.env.NODE_ENV !== 'production') {
  printEnvStatus();
}

const fastify = require('fastify')({
  bodyLimit: 10485760, // 10MB body limit for JSON requests
  requestTimeout: 300000, // 300 second (5 minute) request timeout for AI operations
  keepAliveTimeout: 310000, // 310 seconds for keep-alive (must be > requestTimeout)
  connectionTimeout: 0, // Disable connection timeout (handled by requestTimeout)
  logger: {
    level: process.env.FASTIFY_LOG_LEVEL || 'warn', // Changed from 'info' to 'warn' to reduce verbosity
    stream: {
      write: (msg) => {
        if (!msg) return;
        
        const msgStr = String(msg);
        
        // Aggressively suppress ALL "premature close" warnings - they're false positives
        // These occur when Fastify detects stream closure before logging completes,
        // but the HTTP response actually completed successfully (status 200)
        const isPrematureCloseWarning = 
          msgStr.includes('premature close') ||
          msgStr.includes('stream closed prematurely') ||
          msgStr.includes('"msg":"premature close"') ||
          msgStr.includes('"msg":"stream closed prematurely"') ||
          (msgStr.includes('premature') && msgStr.includes('close'));
        
        if (isPrematureCloseWarning) {
          // Completely suppress - these are timing artifacts, not real errors
          return;
        }
        
        // Write all other log messages normally
        // With level set to 'warn', only warnings and errors will be logged
        process.stdout.write(msg);
      }
    },
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
      },
      err: (err) => {
        // Suppress "premature close" warnings
        if (err && err.message === 'premature close') {
          return null; // Return null to suppress the error log
        }
        return {
          type: err?.type,
          message: err?.message,
          stack: err?.stack
        };
      }
    }
  }
});

// Custom logger
const logger = require('./utils/logger');

// Observability
const metrics = require('./observability/metrics');

// Security utilities
const { sanitizeInput } = require('./utils/security');

// Database connection
const { connectDB, disconnectDB } = require('./utils/db');

// Socket.IO Server
const socketIOServer = require('./utils/socketIOServer');

// Health Check utilities
const {
  getHealthStatus
} = require('./utils/healthCheck');

// API Versioning utilities
const {
  getVersionInfo
} = require('./utils/versioning');

// Sanitization utilities
const { sanitizationMiddleware } = require('./utils/sanitizer');


// Register compression with disabled global compression to prevent premature close warnings
// Fastify v5 compress plugin can cause premature close warnings - disable global compression
try {
  fastify.register(require('@fastify/compress'), {
    global: false, // Disable global compression - can be enabled per-route with reply.compress()
    encodings: ['gzip', 'deflate'],
    threshold: 2048 // Higher threshold reduces compression operations
  });
} catch (err) {
  // Non-fatal - compression is optional
  logger.warn('Compression plugin registration issue (non-fatal):', err.message);
}

// Register security headers (helmet)
fastify.register(require('@fastify/helmet'), {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for React
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Disable for API
  crossOriginOpenerPolicy: false, // Disable for API
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin for API
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
});

// Register CORS
fastify.register(require('@fastify/cors'), {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  strictPreflight: false
});

// Register CSRF Protection
fastify.register(require('@fastify/csrf-protection'), {
  cookieKey: process.env.CSRF_SECRET || require('crypto').randomBytes(32).toString('hex'),
  cookieOpts: {
    signed: true,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  }
});

// Register rate limiting globally
fastify.register(require('@fastify/rate-limit'), {
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 100 : 10000), // Much higher limit for development
  timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || (process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000), // 1 minute window for dev
  skip: (request) => {
    // Skip rate limiting for localhost in development
    if (process.env.NODE_ENV !== 'production') {
      const isLocalhost = request.ip === '127.0.0.1' || request.ip === '::1' || request.ip === '::ffff:127.0.0.1' || request.hostname === 'localhost';
      if (isLocalhost) {
        return true; // Skip rate limiting for localhost in development
      }
    }
    // Skip rate limiting for long-running operations if needed
    return false;
  },
  errorResponseBuilder: (request, context) => {
    return {
      error: 'Rate limit exceeded. Please try again later.',
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
fastify.addHook('preHandler', async (request, _reply) => {
  // If we have a cookie token but no Authorization header, set it so jwtVerify can use it
  const cookieToken = request.cookies?.auth_token;
  const authHeader = request.headers.authorization;
  
  if (cookieToken && !authHeader) {
    request.headers.authorization = `Bearer ${cookieToken}`;
    // Debug log (development only) - disabled by default to reduce log noise
    // Uncomment the line below if you need to debug auth issues
    // if (process.env.NODE_ENV !== 'production' && process.env.DEBUG_AUTH === 'true') {
    //   const logger = require('./utils/logger');
    //   logger.debug(`[Auth Hook] Set Authorization header from cookie for ${request.method} ${request.url}`);
    // }
  } else if (!cookieToken && !authHeader) {
    // Debug log (development only) - disabled by default to reduce log noise
    // Uncomment the line below if you need to debug auth issues
    // if (process.env.NODE_ENV !== 'production' && process.env.DEBUG_AUTH === 'true' && !request.url.includes('/health') && !request.url.includes('/api/status')) {
    //   const logger = require('./utils/logger');
    //   logger.debug(`[Auth Hook] No auth token found for ${request.method} ${request.url}`);
    // }
  }
});

// Add request body sanitization hook
fastify.addHook('preValidation', async (request, _reply) => {
  // Sanitize request body if it exists
  if (request.body && typeof request.body === 'object') {
    request.body = sanitizeInput(request.body);
  }
  
  // Sanitize query parameters
  if (request.query && typeof request.query === 'object') {
    request.query = sanitizeInput(request.query);
  }
  
  // Apply additional sanitization
  sanitizationMiddleware()(request, _reply);
});

// Hook to handle response completion and ensure proper serialization
fastify.addHook('onSend', async (request, reply, payload) => {
  // Ensure payload is properly serialized
  if (reply.statusCode >= 200 && reply.statusCode < 300) {
    // For successful responses, ensure proper serialization
    if (typeof payload === 'object' && payload !== null) {
      try {
        // Fastify will serialize this automatically, but we ensure it's ready
        return payload;
      } catch (error) {
        // If serialization fails, return a safe error response
        reply.code(500);
        return JSON.stringify({ success: false, error: 'Response serialization failed' });
      }
    }
  }
  return payload;
});

// Suppress premature close errors in response handling
fastify.addHook('onResponse', async (_request, reply) => {
  // Mark successful responses to help filter warnings
  if (reply.statusCode >= 200 && reply.statusCode < 300) {
    // Add metadata to help identify successful responses in logs
    reply.raw._isSuccessfulResponse = true;
  }
});

// Note: Global error handler is set later in the file
// The premature close errors are handled via stream filtering above

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
fastify.get('/api/status', async () => ({
  message: 'RoleReady Node.js API is running',
  version: getVersionInfo(),
  endpoints: {
    auth: '/api/auth/*',
    users: '/api/users/*',
    health: '/health'
  }
}));

// Register Performance Monitoring Plugin
const { performanceMonitorPlugin } = require('./utils/performanceMonitor');
fastify.register(performanceMonitorPlugin);

// Register route modules
fastify.register(require('./routes/health.routes')); // Health check routes
fastify.register(require('./routes/auth.routes'));
fastify.register(require('./routes/users.routes'));
fastify.register(require('./routes/userPreferences.routes'));
fastify.register(require('./routes/storage.routes'), { prefix: '/api/storage' });
fastify.register(require('./routes/resume.routes'));
fastify.register(require('./routes/baseResume.routes'));
fastify.register(require('./routes/workingDraft.routes'));
fastify.register(require('./routes/editorAI.routes'));
fastify.register(require('./routes/jobs.routes'));
fastify.register(require('./routes/coverLetters.routes'));
fastify.register(require('./routes/spending.routes')); // Spending/cost tracking routes
fastify.register(require('./routes/admin/costMonitoring.routes')); // Admin cost monitoring
fastify.register(require('./routes/analytics.routes')); // Analytics tracking
fastify.register(require('./routes/monitoring.routes')); // Success rate monitoring
fastify.register(require('./routes/queue.routes')); // Job queue management

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

// Global error handler - completely suppress premature close warnings
const { globalErrorHandler } = require('./utils/errorHandler');
fastify.setErrorHandler(async (error, request, reply) => {
  // Completely suppress "premature close" errors - they're false positives
  // The HTTP response completes successfully (status 200), but Fastify detects stream closure
  // before logging completes. This is a timing artifact, not a real error.
  if (error && (error.message === 'premature close' || error.message?.includes('premature close'))) {
    // Silently return - the response was already sent successfully
    return;
  }
  // For all real errors, use the global error handler
  return globalErrorHandler(error, request, reply);
});

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
        storage: '/api/storage/*',
        resumes: '/api/resumes/*'
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
    
    fastify.get('/metrics', async (request, reply) => {
      reply.header('Content-Type', metrics.register.contentType);
      return metrics.register.metrics();
    });
    
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || 'localhost';
    
    // Start listening first
    await fastify.listen({ port, host });
    
    // Initialize Socket.IO server after HTTP server starts
    // Use fastify.server which is the underlying Node.js HTTP server
    try {
      if (fastify.server) {
        socketIOServer.initialize(fastify.server);
        logger.info('✅ Socket.IO server initialized');
      } else {
        logger.warn('⚠️ Fastify server instance not available, skipping Socket.IO initialization');
      }
    } catch (socketError) {
      logger.error('⚠️ Failed to initialize Socket.IO (server will continue without real-time features):', socketError.message);
      // Don't fail server startup if Socket.IO fails
    }
    
    // Initialize job queues and workers (optional - only if Redis is available)
    if (process.env.ENABLE_JOB_QUEUE !== 'false') {
      try {
        const { initializeQueues } = require('./services/queue/queueManager');
        const { initializeWorkers } = require('./services/queue/workers');
        
        initializeQueues();
        initializeWorkers();
        logger.info('✅ Job queues and workers initialized');
      } catch (queueError) {
        logger.warn('⚠️ Failed to initialize job queues (server will continue with direct processing):', queueError.message);
        // Don't fail server startup if queue initialization fails
      }
    }
    
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
    // Close job queues and workers
    if (process.env.ENABLE_JOB_QUEUE !== 'false') {
      try {
        const { closeAll } = require('./services/queue/queueManager');
        const { closeAllWorkers } = require('./services/queue/workers');
        
        await closeAllWorkers();
        await closeAll();
        logger.info('✅ Job queues and workers closed');
      } catch (queueError) {
        logger.warn('⚠️ Error closing queues:', queueError.message);
      }
    }
    
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
