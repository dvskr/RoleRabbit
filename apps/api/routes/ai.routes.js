/**
 * AI Routes Module
 * 
 * Proxies AI requests to Python FastAPI backend
 */

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

/**
 * Generate internal JWT token for Python API
 */
function generateInternalToken() {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production';
  return jwt.sign(
    { sub: 'internal', role: 'internal' },
    secret,
    { expiresIn: '5m' }
  );
}

/**
 * Register all AI routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function aiRoutes(fastify, options) {
  // Proxy AI generate endpoint
  fastify.post('/api/ai/generate', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { prompt, context, model } = request.body;
      
      // Forward to Python API
      const response = await fetch(`${PYTHON_API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${generateInternalToken()}`
        },
        body: JSON.stringify({ prompt, context, model })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'AI service unavailable' }));
        logger.error('Python AI API error:', errorData);
        throw new Error(errorData.detail || 'AI generation failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('AI proxy error:', error);
      reply.status(500).send({ error: error.message || 'AI service unavailable' });
    }
  });

  // Proxy ATS score check
  fastify.post('/api/ai/ats-check', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { resume, jobDescription } = request.body;
      
      // Forward to Python API
      const response = await fetch(`${PYTHON_API_URL}/api/ai/ats-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${generateInternalToken()}`
        },
        body: JSON.stringify({ resume_text: resume, job_description: jobDescription })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'AI service unavailable' }));
        logger.error('Python AI API error:', errorData);
        throw new Error(errorData.detail || 'ATS check failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('ATS check error:', error);
      reply.status(500).send({ error: error.message || 'AI service unavailable' });
    }
  });

  // Proxy job analysis endpoint
  fastify.post('/api/ai/analyze-job', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { job_description } = request.body;
      
      // Forward to Python API
      const response = await fetch(`${PYTHON_API_URL}/api/ai/analyze-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${generateInternalToken()}`
        },
        body: JSON.stringify({ job_description })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'AI service unavailable' }));
        logger.error('Python AI API error:', errorData);
        throw new Error(errorData.detail || 'Job analysis failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Job analysis error:', error);
      reply.status(500).send({ error: error.message || 'AI service unavailable' });
    }
  });

  // Proxy resume analysis endpoint
  fastify.post('/api/ai/analyze-resume', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { resume_data, job_description } = request.body;
      
      // Forward to Python API
      const response = await fetch(`${PYTHON_API_URL}/api/ai/analyze-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${generateInternalToken()}`
        },
        body: JSON.stringify({ resume_data, job_description })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'AI service unavailable' }));
        logger.error('Python AI API error:', errorData);
        throw new Error(errorData.detail || 'Resume analysis failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Resume analysis error:', error);
      reply.status(500).send({ error: error.message || 'AI service unavailable' });
    }
  });
}

module.exports = aiRoutes;

