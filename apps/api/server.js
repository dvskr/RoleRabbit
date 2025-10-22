const fastify = require('fastify')({
  logger: {
    level: 'info'
  }
});

// Register CORS
fastify.register(require('@fastify/cors'), {
  origin: 'http://localhost:3000',
  credentials: true
});

// Register JWT
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production'
});

// Register multipart
fastify.register(require('@fastify/multipart'));

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
    users: '/api/users/*',
    resumes: '/api/resumes/*',
    jobs: '/api/jobs/*',
    cloud: '/api/cloud/*',
    health: '/health'
  }
}));

// User profile endpoint
fastify.get('/api/users/profile', {
  preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}, async (request, reply) => {
  const user = request.user;
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
  return { resumes: [] };
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
  const resumeData = request.body;
  return { 
    success: true, 
    resume: { ...resumeData, id: Date.now().toString() }
  };
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
  return { jobs: [] };
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
  const jobData = request.body;
  return { 
    success: true, 
    job: { ...jobData, id: Date.now().toString() }
  };
});

// Cloud storage endpoints
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
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server...');
  await fastify.close();
  process.exit(0);
});

start();
