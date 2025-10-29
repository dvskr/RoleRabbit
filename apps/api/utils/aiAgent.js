/**
 * AI Agent Utility
 * Manages AI agent tasks and execution
 */

const { prisma } = require('./db');
const logger = require('./logger');

/**
 * Agent types
 */
const AGENT_TYPES = {
  JOB_DISCOVERY: 'JOB_DISCOVERY',
  RESUME_OPTIMIZATION: 'RESUME_OPTIMIZATION',
  COVER_LETTER_GENERATION: 'COVER_LETTER_GENERATION',
  INTERVIEW_PREP: 'INTERVIEW_PREP',
  NETWORKING: 'NETWORKING'
};

/**
 * Create agent task
 */
async function createAgentTask(userId, agentType, parameters) {
  try {
    const task = await prisma.aIAgentTask.create({
      data: {
        userId,
        agentType,
        taskType: agentType,
        parameters: JSON.stringify(parameters),
        status: 'PENDING',
        startedAt: new Date()
      }
    });
    
    logger.info(`Created agent task ${task.id} for user ${userId}`);
    
    return task;
  } catch (error) {
    logger.error('Failed to create agent task', error);
    throw error;
  }
}

/**
 * Get agent task
 */
async function getAgentTask(taskId) {
  try {
    return await prisma.aIAgentTask.findUnique({
      where: { id: taskId }
    });
  } catch (error) {
    logger.error('Failed to get agent task', error);
    return null;
  }
}

/**
 * Update task status
 */
async function updateTaskStatus(taskId, status, result = null, error = null) {
  try {
    const updateData = {
      status,
      completedAt: status === 'COMPLETED' || status === 'FAILED' ? new Date() : null
    };
    
    if (result) {
      updateData.result = JSON.stringify(result);
    }
    
    if (error) {
      updateData.error = error.message || String(error);
    }
    
    return await prisma.aIAgentTask.update({
      where: { id: taskId },
      data: updateData
    });
  } catch (error) {
    logger.error('Failed to update task status', error);
    throw error;
  }
}

/**
 * Get user's agent task history
 */
async function getUserAgentTasks(userId, limit = 20) {
  try {
    return await prisma.aIAgentTask.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  } catch (error) {
    logger.error('Failed to get user agent tasks', error);
    return [];
  }
}

/**
 * Get agent statistics
 */
async function getAgentStats(userId) {
  try {
    const tasks = await prisma.aIAgentTask.findMany({
      where: { userId }
    });
    
    const stats = {
      total: tasks.length,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      byType: {}
    };
    
    tasks.forEach(task => {
      stats[task.status.toLowerCase()] = (stats[task.status.toLowerCase()] || 0) + 1;
      stats.byType[task.agentType] = (stats.byType[task.agentType] || 0) + 1;
    });
    
    return stats;
  } catch (error) {
    logger.error('Failed to get agent stats', error);
    return null;
  }
}

module.exports = {
  AGENT_TYPES,
  createAgentTask,
  getAgentTask,
  updateTaskStatus,
  getUserAgentTasks,
  getAgentStats
};

