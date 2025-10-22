import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

// Register middleware
async function registerMiddleware() {
  // CORS - essential for frontend communication
  await server.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  });

  // Basic security headers
  server.addHook('onSend', async (request, reply, payload) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    return payload;
  });

  // JWT for authentication
  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    sign: { expiresIn: '15m' }
  });

  // Multipart for file uploads
  await server.register(multipart);
}

// Auth routes
async function registerAuthRoutes() {
  // Health check
  server.get('/health', async () => ({
    status: 'ok',
    service: 'node-api',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  }));

  // User management endpoints
  server.get('/api/users/profile', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const user = request.user as any;
    return { user };
  });

  // Resume management endpoints
  server.get('/api/resumes', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const user = request.user as any;
    // In production, fetch from database
    return { resumes: [] };
  });

  server.post('/api/resumes', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const user = request.user as any;
    const resumeData = request.body as any;
    
    // In production, save to database
    return { 
      success: true, 
      resume: { ...resumeData, id: Date.now().toString() }
    };
  });

  // Job tracking endpoints
  server.get('/api/jobs', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const user = request.user as any;
    // In production, fetch from database
    return { jobs: [] };
  });

  server.post('/api/jobs', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const user = request.user as any;
    const jobData = request.body as any;
    
    // In production, save to database
    return { 
      success: true, 
      job: { ...jobData, id: Date.now().toString() }
    };
  });

  // Cloud storage endpoints
  server.post('/api/cloud/save', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const user = request.user as any;
    const { resumeData, name } = request.body as any;
    
    // In production, save to cloud storage
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

  server.get('/api/cloud/list', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const user = request.user as any;
    
    // In production, fetch from cloud storage
    return { 
      success: true, 
      savedResumes: [] 
    };
  });

  // API status
  server.get('/api/status', async () => ({
    message: 'RoleReady Node.js API is running',
    endpoints: {
      users: '/api/users/*',
      resumes: '/api/resumes/*',
      jobs: '/api/jobs/*',
      cloud: '/api/cloud/*',
      health: '/health'
    }
  }));
}

// Error handler
server.setErrorHandler((error, request, reply) => {
  server.log.error(error);
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
    await registerMiddleware();
    await registerAuthRoutes();
    
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || 'localhost';
    
    await server.listen({ port, host });
    
    console.log(`🚀 RoleReady Node.js API running on http://${host}:${port}`);
    console.log(`📊 Health check: http://${host}:${port}/health`);
    console.log(`📋 API status: http://${host}:${port}/api/status`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server...');
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
});

start();
