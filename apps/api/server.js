const fastify = require('fastify')({
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

// AI Agents utilities
const { 
  executeAgentTask, 
  AGENT_TYPES, 
  getAgentTaskHistory, 
  getAgentStats 
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

// AI Agents utilities
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

// 2FA Routes
const {
  generate2FASetup,
  enable2FAEndpoint,
  disable2FAEndpoint,
  verify2FAToken,
  get2FAStatus
} = require('./routes/twoFactorAuth.routes');

// Register compression
fastify.register(require('@fastify/compress'), {
  global: true,
  encodings: ['gzip', 'deflate']
});

// Register security headers (helmet)
fastify.register(require('@fastify/helmet'), {
  contentSecurityPolicy: false // Can be configured per app needs
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

// Register JWT with secure secret
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || require('crypto').randomBytes(64).toString('hex')
});

// Add JWT decorator for Bearer token support
fastify.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Register multipart
fastify.register(require('@fastify/multipart'), {
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
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

// Authentication endpoints
fastify.post('/api/auth/register', async (request, reply) => {
  try {
    const { email, password, name } = request.body;
    
    // Validate required fields
    const requiredValidation = validateRequired(['email', 'password', 'name'], request.body);
    if (!requiredValidation.isValid) {
      return reply.status(400).send({
        success: false,
        error: `Missing required fields: ${requiredValidation.missing.join(', ')}`
      });
    }
    
    // Validate email format
    if (!validateEmail(email)) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    // Validate password strength
    if (!validatePassword(password)) {
      return reply.status(400).send({
        success: false,
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
      });
    }
    
    // Validate name length
    const nameValidation = validateLength('Name', name, 1, 100);
    if (!nameValidation.isValid) {
      return reply.status(400).send({
        success: false,
        error: nameValidation.message
      });
    }
    
    const user = await registerUser(email, password, name);
    
    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }
    
    // Generate JWT access token (short-lived: 15 minutes)
    const accessToken = fastify.jwt.sign({ 
      userId: user.id, 
      email: user.email 
    }, { expiresIn: '15m' });
    
    // Create refresh token (long-lived: 7 days)
    const refreshToken = await createRefreshToken(user.id, 7);
    
    // Create session
    const ipAddress = request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    const userAgent = request.headers['user-agent'];
    const sessionId = await createSession(user.id, ipAddress, userAgent, 30);
    
    // Set access token in httpOnly cookie
    reply.setCookie('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });
    
    // Set refresh token in httpOnly cookie
    reply.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });
    
    // Set session ID in httpOnly cookie
    reply.setCookie('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/'
    });
    
    reply.send({
      success: true,
      user
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: error.message
    });
  }
});

fastify.post('/api/auth/login', async (request, reply) => {
  try {
    const { email, password } = request.body;
    
    // Validate required fields
    if (!email || !password) {
      return reply.status(400).send({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    const user = await authenticateUser(email, password);
    
    // Check if user has 2FA enabled - Task 6: 2FA Enforcement
    if (user.twoFactorEnabled) {
      // Return 2FA requirement instead of full login
      return reply.send({
        success: true,
        requires2FA: true,
        message: '2FA verification required',
        userId: user.id,
        email: user.email
      });
    }
    
    // Generate JWT access token (short-lived: 15 minutes)
    const accessToken = fastify.jwt.sign({ 
      userId: user.id, 
      email: user.email 
    }, { expiresIn: '15m' });
    
    // Create refresh token (long-lived: 7 days)
    const refreshToken = await createRefreshToken(user.id, 7);
    
    // Create session
    const ipAddress = request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    const userAgent = request.headers['user-agent'];
    const sessionId = await createSession(user.id, ipAddress, userAgent, 30);
    
    // Set access token in httpOnly cookie
    reply.setCookie('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });
    
    // Set refresh token in httpOnly cookie
    reply.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });
    
    // Set session ID in httpOnly cookie
    reply.setCookie('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/'
    });
    
    reply.send({
      success: true,
      user
    });
  } catch (error) {
    reply.status(401).send({
      success: false,
      error: error.message
    });
  }
});

// Refresh token endpoint - get new access token
fastify.post('/api/auth/refresh', async (request, reply) => {
  try {
    // Get refresh token from cookies
    const refreshToken = request.cookies.refresh_token;
    
    if (!refreshToken) {
      return reply.status(401).send({
        success: false,
        error: 'No refresh token provided'
      });
    }
    
    // Verify refresh token
    const result = await verifyRefreshToken(refreshToken);
    
    if (!result || !result.user) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid or expired refresh token'
      });
    }
    
    // Generate new access token
    const accessToken = fastify.jwt.sign({ 
      userId: result.user.id, 
      email: result.user.email 
    }, { expiresIn: '15m' });
    
    // Set new access token in httpOnly cookie
    reply.setCookie('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });
    
    reply.send({
      success: true,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    reply.status(401).send({
      success: false,
      error: error.message
    });
  }
});

// Logout endpoint - clears httpOnly cookies and refresh tokens
fastify.post('/api/auth/logout', async (request, reply) => {
  try {
    // Get tokens and session from cookies before clearing
    const refreshToken = request.cookies.refresh_token;
    const sessionId = request.cookies.session_id;
    
    // Delete the refresh tokens from database
    if (refreshToken) {
      const result = await verifyRefreshToken(refreshToken);
      if (result && result.userId) {
        await deleteAllUserRefreshTokens(result.userId);
      }
    }
    
    // Deactivate the session
    if (sessionId) {
      await deactivateSession(sessionId);
    }
  } catch (error) {
    logger.error('Error during logout cleanup:', error);
  }
  
  // Clear all auth-related cookies
  reply.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  reply.clearCookie('refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  reply.clearCookie('session_id', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  
  reply.send({
    success: true,
    message: 'Logged out successfully'
  });
});

// Verify token endpoint
fastify.get('/api/auth/verify', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ success: false, error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  const userId = request.user.userId;
  const user = await getUserById(userId);
  
  reply.send({
    success: true,
    user
  });
});

// Get user sessions endpoint
fastify.get('/api/auth/sessions', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ success: false, error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  const userId = request.user.userId;
  const sessions = await getUserSessions(userId);
  
  reply.send({
    success: true,
    sessions
  });
});

// ========================================
// 2FA ROUTES - Complete Implementation
// ========================================

// Generate 2FA setup (requires authentication)
fastify.post('/api/auth/2fa/setup', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, generate2FASetup);

// Enable 2FA (requires authentication)
fastify.post('/api/auth/2fa/enable', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, enable2FAEndpoint);

// Disable 2FA (requires authentication)
fastify.post('/api/auth/2fa/disable', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, disable2FAEndpoint);

// Verify 2FA token (public - for login)
fastify.post('/api/auth/2fa/verify', verify2FAToken);

// Get 2FA status (requires authentication)
fastify.get('/api/auth/2fa/status', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, get2FAStatus);

// Forgot password endpoint
fastify.post('/api/auth/forgot-password', async (request, reply) => {
  try {
    const { email } = request.body;
    
    if (!email) {
      return reply.status(400).send({
        success: false,
        error: 'Email is required'
      });
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return reply.send({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }
    
    // Create password reset token
    const resetToken = await createPasswordResetToken(user.id, 1); // 1 hour expiration
    
    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      // In production, don't reveal this error
      return reply.send({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }
    
    // For development mode only - log the reset link
    if (process.env.NODE_ENV !== 'production') {
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      logger.info('Password reset link:', resetLink);
    }
    
    reply.send({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      // Only include resetLink in development mode
      ...(process.env.NODE_ENV !== 'production' && { resetLink })
    });
  } catch (error) {
    logger.error('Error in forgot password:', error);
    reply.status(500).send({
      success: false,
      error: 'An error occurred while processing your request'
    });
  }
});

// Reset password endpoint
fastify.post('/api/auth/reset-password', async (request, reply) => {
  try {
    const { token, newPassword } = request.body;
    
    if (!token || !newPassword) {
      return reply.status(400).send({
        success: false,
        error: 'Token and new password are required'
      });
    }
    
    // Reset the password
    await resetUserPassword(token, newPassword);
    
    reply.send({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    logger.error('Error in reset password:', error);
    reply.status(400).send({
      success: false,
      error: error.message
    });
  }
});

// User profile endpoint
fastify.get('/api/users/profile', {
  preHandler: async (request, reply) => {
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        request.headers.authorization = `Bearer ${token}`;
      }
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  const userId = request.user.userId;
  const user = await getUserById(userId);
  
  if (!user) {
    reply.status(404).send({ error: 'User not found' });
    return;
  }
  
  return { user };
});

// Resume endpoints
fastify.get('/api/resumes', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const resumes = await getResumesByUserId(userId);
    return { resumes };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.post('/api/resumes', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const resumeData = request.body;
    
    // Validate resume data
    const validation = validateResumeData(resumeData);
    if (!validation.isValid) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid resume data',
        details: validation.errors
      });
    }
    
    const resume = await createResume(userId, resumeData);
    return { 
      success: true, 
      resume 
    };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.get('/api/resumes/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const resume = await getResumeById(id);
    
    if (!resume) {
      reply.status(404).send({ error: 'Resume not found' });
      return;
    }
    
    // Verify resume belongs to user
    if (resume.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    return { resume };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// Export resume endpoint
fastify.post('/api/resumes/:id/export', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const { format = 'pdf' } = request.body;
    
    const resume = await getResumeById(id);
    if (!resume) {
      return reply.status(404).send({ error: 'Resume not found' });
    }
    
    if (resume.userId !== request.user.userId) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    
    const resumeData = typeof resume.data === 'string' ? JSON.parse(resume.data) : resume.data;
    const exportResume = require('./utils/resumeExport');
    
    let exportedData;
    if (format === 'pdf') {
      exportedData = await exportResume.exportResume(resumeData, 'pdf');
      reply.type('application/pdf');
    } else if (format === 'docx') {
      exportedData = await exportResume.exportResume(resumeData, 'docx');
      reply.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    } else {
      return reply.status(400).send({ error: 'Invalid format. Use pdf or docx' });
    }
    
    reply.header('Content-Disposition', `attachment; filename="${resume.name || 'resume'}.${format}"`);
    reply.send(exportedData);
    
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.put('/api/resumes/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const updates = request.body;
    
    // Verify resume exists and belongs to user
    const existingResume = await getResumeById(id);
    if (!existingResume) {
      reply.status(404).send({ error: 'Resume not found' });
      return;
    }
    if (existingResume.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    const resume = await updateResume(id, updates);
    return { 
      success: true, 
      resume 
    };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.delete('/api/resumes/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    
    // Verify resume exists and belongs to user
    const existingResume = await getResumeById(id);
    if (!existingResume) {
      reply.status(404).send({ error: 'Resume not found' });
      return;
    }
    if (existingResume.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    await deleteResume(id);
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// Job tracking endpoints
fastify.get('/api/jobs', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const jobs = await getJobsByUserId(userId);
    return { jobs };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.post('/api/jobs', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const jobData = request.body;
    
    // Validate job application data
    const validation = validateJobApplication(jobData);
    if (!validation.isValid) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid job application data',
        details: validation.errors
      });
    }
    
    const job = await createJob(userId, jobData);
    return { 
      success: true, 
      job 
    };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.get('/api/jobs/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const job = await getJobById(id);
    
    if (!job) {
      reply.status(404).send({ error: 'Job not found' });
      return;
    }
    
    // Verify job belongs to user
    if (job.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    return { job };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// Job Analytics endpoint
fastify.post('/api/jobs/:id/analytics', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const { dateRange = 30 } = request.body;
    
    const job = await getJobById(id);
    
    if (!job || job.userId !== request.user.userId) {
      return reply.status(403).send({ error: 'Job not found or access denied' });
    }
    
    // Get analytics for this job
    const analytics = await getJobAnalytics(request.user.userId, parseInt(dateRange));
    
    reply.send({
      success: true,
      analytics
    });
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// General job analytics endpoint
fastify.get('/api/jobs/analytics/summary', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { days = 30 } = request.query;
    
    const metrics = await getSuccessMetrics(request.user.userId);
    
    reply.send({
      success: true,
      metrics
    });
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.put('/api/jobs/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const updates = request.body;
    
    // Verify job exists and belongs to user
    const existingJob = await getJobById(id);
    if (!existingJob) {
      reply.status(404).send({ error: 'Job not found' });
      return;
    }
    if (existingJob.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    const job = await updateJob(id, updates);
    return { 
      success: true, 
      job 
    };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.delete('/api/jobs/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    
    // Verify job exists and belongs to user
    const existingJob = await getJobById(id);
    if (!existingJob) {
      reply.status(404).send({ error: 'Job not found' });
      return;
    }
    if (existingJob.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    await deleteJob(id);
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// Email endpoints
fastify.get('/api/emails', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const jobId = request.query.jobId;
    
    const emails = jobId 
      ? await getEmailsByJobId(jobId)
      : await getEmailsByUserId(userId);
    
    return { emails };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.post('/api/emails', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const emailData = request.body;
    
    const email = await createEmail(userId, emailData);
    return { 
      success: true, 
      email 
    };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.get('/api/emails/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const email = await getEmailById(id);
    
    if (!email) {
      reply.status(404).send({ error: 'Email not found' });
      return;
    }
    
    // Verify email belongs to user
    if (email.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    return { email };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.put('/api/emails/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const updates = request.body;
    
    // Verify email exists and belongs to user
    const existingEmail = await getEmailById(id);
    if (!existingEmail) {
      reply.status(404).send({ error: 'Email not found' });
      return;
    }
    if (existingEmail.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    const email = await updateEmail(id, updates);
    return { 
      success: true, 
      email 
    };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.delete('/api/emails/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    
    // Verify email exists and belongs to user
    const existingEmail = await getEmailById(id);
    if (!existingEmail) {
      reply.status(404).send({ error: 'Email not found' });
      return;
    }
    if (existingEmail.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    await deleteEmail(id);
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// Cover Letter endpoints
fastify.get('/api/cover-letters', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const jobId = request.query.jobId;
    
    const coverLetters = jobId 
      ? await getCoverLettersByJobId(jobId)
      : await getCoverLettersByUserId(userId);
    
    return { coverLetters };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.post('/api/cover-letters', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const coverLetterData = request.body;
    
    const coverLetter = await createCoverLetter(userId, coverLetterData);
    return { 
      success: true, 
      coverLetter 
    };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.get('/api/cover-letters/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const coverLetter = await getCoverLetterById(id);
    
    if (!coverLetter) {
      reply.status(404).send({ error: 'Cover letter not found' });
      return;
    }
    
    // Verify cover letter belongs to user
    if (coverLetter.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    return { coverLetter };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.put('/api/cover-letters/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const updates = request.body;
    
    // Verify cover letter exists and belongs to user
    const existingCoverLetter = await getCoverLetterById(id);
    if (!existingCoverLetter) {
      reply.status(404).send({ error: 'Cover letter not found' });
      return;
    }
    if (existingCoverLetter.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    const coverLetter = await updateCoverLetter(id, updates);
    return { 
      success: true, 
      coverLetter 
    };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.delete('/api/cover-letters/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    
    // Verify cover letter exists and belongs to user
    const existingCoverLetter = await getCoverLetterById(id);
    if (!existingCoverLetter) {
      reply.status(404).send({ error: 'Cover letter not found' });
      return;
    }
    if (existingCoverLetter.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    await deleteCoverLetter(id);
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// Portfolio endpoints
fastify.get('/api/portfolios', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const portfolios = await getPortfoliosByUserId(userId);
    return { portfolios };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.post('/api/portfolios', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const portfolioData = request.body;
    
    const portfolio = await createPortfolio(userId, portfolioData);
    return { 
      success: true, 
      portfolio 
    };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.get('/api/portfolios/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const portfolio = await getPortfolioById(id);
    
    if (!portfolio) {
      reply.status(404).send({ error: 'Portfolio not found' });
      return;
    }
    
    // Verify portfolio belongs to user
    if (portfolio.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    return { portfolio };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.put('/api/portfolios/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const updates = request.body;
    
    // Verify portfolio exists and belongs to user
    const existingPortfolio = await getPortfolioById(id);
    if (!existingPortfolio) {
      reply.status(404).send({ error: 'Portfolio not found' });
      return;
    }
    if (existingPortfolio.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    const portfolio = await updatePortfolio(id, updates);
    return { 
      success: true, 
      portfolio 
    };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.delete('/api/portfolios/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    
    // Verify portfolio exists and belongs to user
    const existingPortfolio = await getPortfolioById(id);
    if (!existingPortfolio) {
      reply.status(404).send({ error: 'Portfolio not found' });
      return;
    }
    if (existingPortfolio.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    await deletePortfolio(id);
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// Cloud Files endpoints
fastify.get('/api/cloud-files', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const folder = request.query.folder;
    
    const files = folder 
      ? await getCloudFilesByFolder(userId, folder)
      : await getCloudFilesByUserId(userId);
    
    return { files };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.post('/api/cloud-files', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const fileData = request.body;
    
    const file = await createCloudFile(userId, fileData);
    return { 
      success: true, 
      file 
    };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.get('/api/cloud-files/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const file = await getCloudFileById(id);
    
    if (!file) {
      reply.status(404).send({ error: 'File not found' });
      return;
    }
    
    if (file.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    return { file };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.put('/api/cloud-files/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const updates = request.body;
    
    const existingFile = await getCloudFileById(id);
    if (!existingFile) {
      reply.status(404).send({ error: 'File not found' });
      return;
    }
    if (existingFile.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    const file = await updateCloudFile(id, updates);
    return { success: true, file };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.delete('/api/cloud-files/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    
    const existingFile = await getCloudFileById(id);
    if (!existingFile) {
      reply.status(404).send({ error: 'File not found' });
      return;
    }
    if (existingFile.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    await deleteCloudFile(id);
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// Cloud storage endpoints (legacy)
fastify.post('/api/cloud/save', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  const { resumeData, name } = request.body;
  return { 
    success: true, 
    savedResume: { 
      id: Date.now().toString(), 
      name, 
      data: resumeData,
      savedAt: new Date().toISOString()
    }
  };
});

fastify.get('/api/cloud/list', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  return { 
    success: true, 
    savedResumes: [] 
  };
});

// Analytics endpoints
fastify.get('/api/analytics', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const type = request.query.type;
    
    const analytics = type 
      ? await getAnalyticsByType(userId, type)
      : await getAnalyticsByUserId(userId);
    
    return { analytics };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.post('/api/analytics', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const analyticsData = request.body;
    
    const analytics = await createAnalytics(userId, analyticsData);
    return { success: true, analytics };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.get('/api/analytics/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const analytics = await getAnalyticsById(id);
    
    if (!analytics) {
      reply.status(404).send({ error: 'Analytics not found' });
      return;
    }
    
    if (analytics.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    return { analytics };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.put('/api/analytics/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const updates = request.body;
    
    const existingAnalytics = await getAnalyticsById(id);
    if (!existingAnalytics) {
      reply.status(404).send({ error: 'Analytics not found' });
      return;
    }
    if (existingAnalytics.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    const analytics = await updateAnalytics(id, updates);
    return { success: true, analytics };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.delete('/api/analytics/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    
    const existingAnalytics = await getAnalyticsById(id);
    if (!existingAnalytics) {
      reply.status(404).send({ error: 'Analytics not found' });
      return;
    }
    if (existingAnalytics.userId !== request.user.userId) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    
    await deleteAnalytics(id);
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// Discussion endpoints
fastify.get('/api/discussions', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const community = request.query.community;
    const posts = await getDiscussionPosts(community);
    return { posts };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.post('/api/discussions', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const postData = request.body;
    
    const post = await createDiscussionPost(userId, postData);
    return { success: true, post };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.get('/api/discussions/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const post = await getDiscussionPostById(id);
    
    if (!post) {
      reply.status(404).send({ error: 'Post not found' });
      return;
    }
    
    return { post };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.put('/api/discussions/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const updates = request.body;
    
    const existingPost = await getDiscussionPostById(id);
    if (!existingPost) {
      reply.status(404).send({ error: 'Post not found' });
      return;
    }
    
    const post = await updateDiscussionPost(id, updates);
    return { success: true, post };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.delete('/api/discussions/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    
    const existingPost = await getDiscussionPostById(id);
    if (!existingPost) {
      reply.status(404).send({ error: 'Post not found' });
      return;
    }
    
    await deleteDiscussionPost(id);
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// Comments endpoints
fastify.get('/api/discussions/:postId/comments', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { postId } = request.params;
    const comments = await getCommentsByPostId(postId);
    return { comments };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.post('/api/discussions/:postId/comments', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { postId } = request.params;
    const userId = request.user.userId;
    const commentData = request.body;
    
    const comment = await createComment(postId, userId, commentData);
    return { success: true, comment };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.put('/api/comments/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const updates = request.body;
    
    const comment = await updateComment(id, updates);
    return { success: true, comment };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.delete('/api/comments/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    await deleteComment(id);
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// AI Agents endpoints
fastify.get('/api/agents', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const agents = await getAgentsByUserId(userId);
    return { agents };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.get('/api/agents/stats', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const stats = await getAgentStats(userId);
    return stats;
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.get('/api/agents/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const userId = request.user.userId;
    const agent = await getAgentById(id, userId);
    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' });
    }
    return { agent };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.post('/api/agents', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const agentData = request.body;
    
    const agent = await createAgent(userId, agentData);
    return { success: true, agent };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.put('/api/agents/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const userId = request.user.userId;
    const updates = request.body;
    
    const result = await updateAgent(id, userId, updates);
    if (result.count === 0) {
      return reply.status(404).send({ error: 'Agent not found' });
    }
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.delete('/api/agents/:id', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const userId = request.user.userId;
    
    await deleteAgent(id, userId);
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.get('/api/agents/:id/tasks', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const userId = request.user.userId;
    const tasks = await getAgentTasks(id, userId);
    return { tasks };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.post('/api/agents/:id/tasks', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const userId = request.user.userId;
    const taskData = { ...request.body, agentId: id };
    
    const task = await createAgentTask(userId, taskData);
    return { success: true, task };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.put('/api/tasks/:taskId', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { taskId } = request.params;
    const userId = request.user.userId;
    const updates = request.body;
    
    const result = await updateAgentTask(taskId, userId, updates);
    if (result.count === 0) {
      return reply.status(404).send({ error: 'Task not found' });
    }
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// Execute agent endpoint
const { executeAgent, runActiveAgentsForUser } = require('./utils/agentExecutor');

fastify.post('/api/agents/:id/execute', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const userId = request.user.userId;
    
    const agent = await getAgentById(id, userId);
    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' });
    }
    
    const result = await executeAgent(agent, userId);
    return result;
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// AI Agent Task Execution endpoints
fastify.post('/api/agents/:id/execute', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const { taskType, parameters } = request.body;
    
    const agent = await prisma.agent.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!agent || agent.userId !== request.user.userId) {
      return reply.status(403).send({ error: 'Agent not found or access denied' });
    }
    
    const result = await executeAgentTask(id, taskType, request.user.userId, parameters);
    
    reply.send({
      success: true,
      result
    });
  } catch (error) {
    logger.error('Agent execution error:', error);
    reply.status(500).send({ error: error.message });
  }
});

fastify.get('/api/agents/:id/tasks', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    
    const agent = await prisma.agent.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!agent || agent.userId !== request.user.userId) {
      return reply.status(403).send({ error: 'Agent not found or access denied' });
    }
    
    const tasks = await getAgentTaskHistory(id, parseInt(request.query.limit || 50));
    reply.send({ success: true, tasks });
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// Run all active agents for user
fastify.post('/api/agents/run-all', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const result = await runActiveAgentsForUser(userId);
    return result;
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

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

// File upload endpoints
fastify.post('/api/files/upload', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const data = await request.file();
    
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'image/gif', 'text/plain'];
    
    if (!allowedTypes.includes(data.mimetype)) {
      return reply.status(400).send({ error: 'Invalid file type' });
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (data.file.bytesRead > maxSize) {
      return reply.status(400).send({ error: 'File too large (max 10MB)' });
    }
    
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `file-${uniqueSuffix}-${data.filename}`;
    
    // Save file data to cloud file
    const buffer = await data.toBuffer();
    const fileData = {
      name: filename,
      fileName: data.filename,
      type: data.fieldname || 'document',
      size: buffer.length,
      contentType: data.mimetype,
      data: buffer.toString('base64'),
      folder: request.body?.folder,
      tags: request.body?.tags,
      description: request.body?.description
    };
    
    const cloudFile = await createCloudFile(userId, fileData);
    
    return {
      success: true,
      file: cloudFile
    };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// Start server
const start = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || 'localhost';
    
    await fastify.listen({ port, host });
    
    logger.info(`🚀 RoleReady Node.js API running on http://${host}:${port}`);
    logger.info(`📊 Health check: http://${host}:${port}/health`);
    logger.info(`📋 API status: http://${host}:${port}/api/status`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Shutting down server...');
  await fastify.close();
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Shutting down server...');
  await fastify.close();
  await disconnectDB();
  process.exit(0);
});

start();
