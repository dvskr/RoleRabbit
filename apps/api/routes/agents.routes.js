/**
 * AI Agent Routes Module
 * 
 * Handles all AI agent-related routes including:
 * - CRUD operations for agents
 * - Agent task management
 * - Agent execution
 */

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
} = require('../utils/aiAgents');
const { 
  executeAgentTask, 
  runActiveAgentsForUser,
  getAgentTaskHistory
} = require('../utils/agentExecutor');
const { authenticate } = require('../middleware/auth');

/**
 * Register all agent routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function agentRoutes(fastify, options) {
  // Get all agents for user
  fastify.get('/api/agents', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const agents = await getAgentsByUserId(userId);
      return { agents };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get agent statistics
  fastify.get('/api/agents/stats', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const stats = await getAgentStats(userId);
      return stats;
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get single agent by ID
  fastify.get('/api/agents/:id', {
    preHandler: authenticate
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

  // Create new agent
  fastify.post('/api/agents', {
    preHandler: authenticate
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

  // Update agent
  fastify.put('/api/agents/:id', {
    preHandler: authenticate
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

  // Delete agent
  fastify.delete('/api/agents/:id', {
    preHandler: authenticate
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

  // Get agent tasks
  fastify.get('/api/agents/:id/tasks', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.userId;
      
      // Verify agent ownership
      const agent = await getAgentById(id, userId);
      if (!agent) {
        return reply.status(404).send({ error: 'Agent not found' });
      }
      
      const tasks = await getAgentTaskHistory(id, parseInt(request.query.limit || 50));
      reply.send({ success: true, tasks });
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Create agent task
  fastify.post('/api/agents/:id/tasks', {
    preHandler: authenticate
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

  // Update agent task
  fastify.put('/api/tasks/:taskId', {
    preHandler: authenticate
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
  fastify.post('/api/agents/:id/execute', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { taskType, parameters } = request.body || {};
      const userId = request.user.userId;
      
      // Get agent and verify ownership
      const agent = await getAgentById(id, userId);
      if (!agent) {
        return reply.status(404).send({ error: 'Agent not found' });
      }
      
      // If taskType and parameters provided, execute specific task
      if (taskType && parameters) {
        const result = await executeAgentTask(id, taskType, userId, parameters);
        reply.send({
          success: true,
          result
        });
      } else {
        // If no taskType, return error
        reply.status(400).send({ 
          error: 'taskType and parameters are required' 
        });
      }
    } catch (error) {
      const logger = require('../utils/logger');
      logger.error('Agent execution error:', error);
      reply.status(500).send({ error: error.message });
    }
  });

  // Run all active agents for user
  fastify.post('/api/agents/run-all', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const result = await runActiveAgentsForUser(userId);
      return result;
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });
}

module.exports = agentRoutes;

