/**
 * AI Agents Utilities - Database operations for AI agents
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all AI agents for a user
 */
async function getAgentsByUserId(userId) {
  try {
    const agents = await prisma.aIAgent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    return agents;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
}

/**
 * Get agent by ID
 */
async function getAgentById(agentId, userId) {
  try {
    const agent = await prisma.aIAgent.findFirst({
      where: {
        id: agentId,
        userId
      },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });
    return agent;
  } catch (error) {
    console.error('Error fetching agent:', error);
    throw error;
  }
}

/**
 * Create a new AI agent
 */
async function createAgent(userId, agentData) {
  try {
    const agent = await prisma.aIAgent.create({
      data: {
        userId,
        name: agentData.name,
        description: agentData.description,
        type: agentData.type || 'manual',
        status: agentData.status || 'paused',
        config: agentData.config || {},
        enabled: agentData.enabled ?? true
      }
    });
    return agent;
  } catch (error) {
    console.error('Error creating agent:', error);
    throw error;
  }
}

/**
 * Update an AI agent
 */
async function updateAgent(agentId, userId, agentData) {
  try {
    const agent = await prisma.aIAgent.updateMany({
      where: {
        id: agentId,
        userId
      },
      data: {
        name: agentData.name,
        description: agentData.description,
        type: agentData.type,
        status: agentData.status,
        config: agentData.config,
        enabled: agentData.enabled,
        lastRun: agentData.lastRun ? new Date(agentData.lastRun) : undefined
      }
    });
    return agent;
  } catch (error) {
    console.error('Error updating agent:', error);
    throw error;
  }
}

/**
 * Delete an AI agent
 */
async function deleteAgent(agentId, userId) {
  try {
    await prisma.aIAgent.deleteMany({
      where: {
        id: agentId,
        userId
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting agent:', error);
    throw error;
  }
}

/**
 * Get agent tasks
 */
async function getAgentTasks(agentId, userId) {
  try {
    const tasks = await prisma.aIAgentTask.findMany({
      where: {
        agentId,
        userId
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

/**
 * Create agent task
 */
async function createAgentTask(userId, taskData) {
  try {
    const task = await prisma.aIAgentTask.create({
      data: {
        userId,
        agentId: taskData.agentId,
        type: taskData.type,
        status: taskData.status || 'pending',
        description: taskData.description,
        result: taskData.result,
        error: taskData.error
      }
    });
    return task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

/**
 * Update agent task
 */
async function updateAgentTask(taskId, userId, taskData) {
  try {
    const task = await prisma.aIAgentTask.updateMany({
      where: {
        id: taskId,
        userId
      },
      data: {
        status: taskData.status,
        result: taskData.result,
        error: taskData.error,
        completedAt: taskData.completedAt ? new Date(taskData.completedAt) : undefined
      }
    });
    return task;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

/**
 * Get agent statistics
 */
async function getAgentStats(userId) {
  try {
    const agents = await prisma.aIAgent.findMany({
      where: { userId },
      include: {
        tasks: true
      }
    });

    const total = agents.length;
    const active = agents.filter(a => a.status === 'active').length;
    const paused = agents.filter(a => a.status === 'paused').length;
    const stopped = agents.filter(a => a.status === 'stopped').length;

    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;

    agents.forEach(agent => {
      totalTasks += agent.tasks.length;
      completedTasks += agent.tasks.filter(t => t.status === 'completed').length;
      inProgressTasks += agent.tasks.filter(t => t.status === 'in_progress').length;
    });

    return {
      totalAgents: total,
      activeAgents: active,
      pausedAgents: paused,
      stoppedAgents: stopped,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks: totalTasks - completedTasks - inProgressTasks
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

module.exports = {
  getAgentsByUserId,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  getAgentTasks,
  createAgentTask,
  updateAgentTask,
  getAgentStats
};

