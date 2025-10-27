const fastify = require('fastify')({
  logger: {
    level: 'info'
  }
});

// Load environment variables
require('dotenv').config();

// Security utilities
const { sanitizeInput, getRateLimitConfig } = require('./utils/security');

// Database connection
const { connectDB, disconnectDB } = require('./utils/db');

// Authentication
const { registerUser, authenticateUser, getUserById } = require('./auth');

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

// Register CORS
fastify.register(require('@fastify/cors'), {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
fastify.register(require('@fastify/multipart'));

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
});

// Health check
fastify.get('/health', async () => ({
  status: 'ok',
  service: 'node-api',
  version: '1.0.0',
  timestamp: new Date().toISOString()
}));

// API status
fastify.get('/api/status', async () => ({
  message: 'RoleReady Node.js API is running',
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
    if (!email || !password || !name) {
      return reply.status(400).send({
        success: false,
        error: 'Email, password, and name are required'
      });
    }
    
    const user = await registerUser(email, password, name);
    
    // Generate JWT token
    const token = fastify.jwt.sign({ 
      userId: user.id, 
      email: user.email 
    });
    
    reply.send({
      success: true,
      token,
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
    
    // Generate JWT token
    const token = fastify.jwt.sign({ 
      userId: user.id, 
      email: user.email 
    });
    
    reply.send({
      success: true,
      token,
      user
    });
  } catch (error) {
    reply.status(401).send({
      success: false,
      error: error.message
    });
  }
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

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    }
  });
});

// Start server
const start = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || 'localhost';
    
    await fastify.listen({ port, host });
    
    console.log(`🚀 RoleReady Node.js API running on http://${host}:${port}`);
    console.log(`📊 Health check: http://${host}:${port}/health`);
    console.log(`📋 API status: http://${host}:${port}/api/status`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await fastify.close();
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server...');
  await fastify.close();
  await disconnectDB();
  process.exit(0);
});

start();
