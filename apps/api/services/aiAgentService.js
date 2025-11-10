const { prisma } = require('../utils/db');
const logger = require('../utils/logger');
const { enqueueTask } = require('./aiAgentQueue');

/**
 * Get or create AI Agent settings for a user
 */
async function getOrCreateSettings(userId) {
  try {
    let settings = await prisma.aIAgentSettings.findUnique({
      where: { userId }
    });

    if (!settings) {
      settings = await prisma.aIAgentSettings.create({
        data: { userId }
      });
      logger.info('Created default AI agent settings', { userId });
    }

    return settings;
  } catch (error) {
    logger.error('Error getting/creating AI agent settings', { error: error.message, userId });
    throw error;
  }
}

/**
 * Update AI Agent settings
 */
async function updateSettings(userId, updates) {
  try {
    const settings = await prisma.aIAgentSettings.upsert({
      where: { userId },
      update: updates,
      create: { userId, ...updates }
    });

    logger.info('Updated AI agent settings', { userId });
    return settings;
  } catch (error) {
    logger.error('Error updating AI agent settings', { error: error.message, userId });
    throw error;
  }
}

/**
 * Toggle a capability on/off
 */
async function toggleCapability(userId, capability) {
  try {
    const settings = await getOrCreateSettings(userId);
    const capabilityField = `${capability}Enabled`;

    // Check if the capability field exists
    if (!(capabilityField in settings)) {
      throw new Error(`Invalid capability: ${capability}`);
    }

    const updated = await prisma.aIAgentSettings.update({
      where: { userId },
      data: {
        [capabilityField]: !settings[capabilityField]
      }
    });

    logger.info('Toggled capability', { userId, capability, newValue: updated[capabilityField] });
    return updated;
  } catch (error) {
    logger.error('Error toggling capability', { error: error.message, userId, capability });
    throw error;
  }
}

/**
 * Check usage limits for AI agents
 */
async function checkUsageLimits(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        aiAgentsRunsCount: true,
        aiAgentsRunsResetAt: true
      }
    });

    const limits = {
      FREE: 5,
      PRO: 50,
      PREMIUM: 999999
    };

    const monthlyLimit = limits[user.subscriptionTier] || limits.FREE;

    // Reset counter if needed
    const now = new Date();
    const resetDate = user.aiAgentsRunsResetAt ? new Date(user.aiAgentsRunsResetAt) : null;

    if (!resetDate || now > resetDate) {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      await prisma.user.update({
        where: { id: userId },
        data: {
          aiAgentsRunsCount: 0,
          aiAgentsRunsResetAt: nextMonth
        }
      });
      return { allowed: true, used: 0, limit: monthlyLimit };
    }

    // Check if limit exceeded
    if (user.aiAgentsRunsCount >= monthlyLimit) {
      const error = new Error(`Monthly AI agent task limit (${monthlyLimit}) exceeded. Upgrade your plan for more tasks.`);
      error.code = 'USAGE_LIMIT_EXCEEDED';
      throw error;
    }

    return {
      allowed: true,
      used: user.aiAgentsRunsCount,
      limit: monthlyLimit
    };
  } catch (error) {
    if (error.code === 'USAGE_LIMIT_EXCEEDED') {
      throw error;
    }
    logger.error('Error checking usage limits', { error: error.message, userId });
    throw error;
  }
}

/**
 * Increment usage counter
 */
async function incrementUsageCounter(userId) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        aiAgentsRunsCount: { increment: 1 }
      }
    });
  } catch (error) {
    logger.error('Error incrementing usage counter', { error: error.message, userId });
    // Don't throw - this shouldn't block task creation
  }
}

/**
 * Create a new AI agent task
 */
async function createTask(userId, taskData) {
  try {
    // Check usage limits
    await checkUsageLimits(userId);

    // Create the task
    const task = await prisma.aIAgentTask.create({
      data: {
        userId,
        type: taskData.type,
        jobTitle: taskData.jobTitle,
        company: taskData.company,
        jobUrl: taskData.jobUrl,
        jobDescription: taskData.jobDescription,
        baseResumeId: taskData.baseResumeId,
        tone: taskData.tone || 'professional',
        length: taskData.length || 'medium',
        totalSteps: 4, // Default: analyze, generate, score, save
        currentStep: 'Queued'
      }
    });

    // Increment usage counter
    await incrementUsageCounter(userId);

    // Enqueue the task for processing
    await enqueueTask(task);

    logger.info('Created AI agent task', { userId, taskId: task.id, type: task.type });
    return task;
  } catch (error) {
    if (error.code === 'USAGE_LIMIT_EXCEEDED') {
      throw error;
    }
    logger.error('Error creating task', { error: error.message, userId });
    throw error;
  }
}

/**
 * Get all tasks for a user
 */
async function getAllTasks(userId, filters = {}) {
  try {
    const { status, type, limit = 50, offset = 0 } = filters;

    const where = { userId };
    if (status) where.status = status;
    if (type) where.type = type;

    const tasks = await prisma.aIAgentTask.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return tasks;
  } catch (error) {
    logger.error('Error getting all tasks', { error: error.message, userId });
    throw error;
  }
}

/**
 * Get active tasks (in-progress)
 */
async function getActiveTasks(userId) {
  try {
    const tasks = await prisma.aIAgentTask.findMany({
      where: {
        userId,
        status: { in: ['QUEUED', 'IN_PROGRESS'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tasks;
  } catch (error) {
    logger.error('Error getting active tasks', { error: error.message, userId });
    throw error;
  }
}

/**
 * Get a specific task by ID
 */
async function getTaskById(userId, taskId) {
  try {
    const task = await prisma.aIAgentTask.findFirst({
      where: {
        id: taskId,
        userId
      }
    });

    return task;
  } catch (error) {
    logger.error('Error getting task by ID', { error: error.message, userId, taskId });
    throw error;
  }
}

/**
 * Update task progress
 */
async function updateTaskProgress(taskId, progress, currentStep) {
  try {
    const task = await prisma.aIAgentTask.update({
      where: { id: taskId },
      data: {
        progress,
        currentStep,
        ...(progress === 0 ? { startedAt: new Date(), status: 'IN_PROGRESS' } : {})
      }
    });

    return task;
  } catch (error) {
    logger.error('Error updating task progress', { error: error.message, taskId });
    throw error;
  }
}

/**
 * Update task status
 */
async function updateTaskStatus(taskId, status, additionalData = {}) {
  try {
    const updateData = {
      status,
      ...additionalData
    };

    if (status === 'IN_PROGRESS' && !additionalData.startedAt) {
      updateData.startedAt = new Date();
    }

    if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
      updateData.completedAt = new Date();
      if (status === 'COMPLETED') {
        updateData.progress = 100;
      }
    }

    const task = await prisma.aIAgentTask.update({
      where: { id: taskId },
      data: updateData
    });

    return task;
  } catch (error) {
    logger.error('Error updating task status', { error: error.message, taskId });
    throw error;
  }
}

/**
 * Cancel a task
 */
async function cancelTask(userId, taskId) {
  try {
    const task = await prisma.aIAgentTask.findFirst({
      where: { id: taskId, userId }
    });

    if (!task) {
      return null;
    }

    // Can only cancel queued or in-progress tasks
    if (!['QUEUED', 'IN_PROGRESS'].includes(task.status)) {
      throw new Error('Can only cancel queued or in-progress tasks');
    }

    const updated = await prisma.aIAgentTask.update({
      where: { id: taskId },
      data: {
        status: 'CANCELLED',
        completedAt: new Date()
      }
    });

    logger.info('Cancelled task', { userId, taskId });
    return updated;
  } catch (error) {
    logger.error('Error cancelling task', { error: error.message, userId, taskId });
    throw error;
  }
}

/**
 * Delete a task
 */
async function deleteTask(userId, taskId) {
  try {
    const task = await prisma.aIAgentTask.findFirst({
      where: { id: taskId, userId }
    });

    if (!task) {
      const error = new Error('Task not found');
      error.code = 'TASK_NOT_FOUND';
      throw error;
    }

    await prisma.aIAgentTask.delete({
      where: { id: taskId }
    });

    logger.info('Deleted task', { userId, taskId });
  } catch (error) {
    if (error.code === 'TASK_NOT_FOUND') {
      throw error;
    }
    logger.error('Error deleting task', { error: error.message, userId, taskId });
    throw error;
  }
}

/**
 * Save task results
 */
async function saveTaskResults(taskId, results) {
  try {
    const task = await prisma.aIAgentTask.update({
      where: { id: taskId },
      data: {
        resultData: results.data,
        atsScore: results.atsScore,
        atsBreakdown: results.atsBreakdown,
        outputFiles: results.outputFiles || []
      }
    });

    return task;
  } catch (error) {
    logger.error('Error saving task results', { error: error.message, taskId });
    throw error;
  }
}

/**
 * Get task history
 */
async function getHistory(userId, days = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await prisma.aIAgentHistory.findMany({
      where: {
        userId,
        completedAt: { gte: startDate }
      },
      orderBy: { completedAt: 'desc' }
    });

    return history;
  } catch (error) {
    logger.error('Error getting history', { error: error.message, userId });
    throw error;
  }
}

/**
 * Add history entry
 */
async function addHistoryEntry(userId, taskType, taskIds, summary, status, metadata = {}) {
  try {
    const entry = await prisma.aIAgentHistory.create({
      data: {
        userId,
        taskType,
        taskIds,
        summary,
        count: taskIds.length,
        status,
        metadata
      }
    });

    logger.info('Added history entry', { userId, taskType, count: taskIds.length });
    return entry;
  } catch (error) {
    logger.error('Error adding history entry', { error: error.message, userId });
    // Don't throw - history is not critical
  }
}

/**
 * Get metrics for a user
 */
async function getMetrics(userId, days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await prisma.aIAgentMetrics.findMany({
      where: {
        userId,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate aggregates
    const totals = metrics.reduce((acc, m) => {
      acc.resumesGenerated += m.resumesGenerated;
      acc.coverLettersCreated += m.coverLettersCreated;
      acc.applicationsSubmitted += m.applicationsSubmitted;
      acc.companiesResearched += m.companiesResearched;
      acc.emailsSent += m.emailsSent;
      acc.interviewPrepsCreated += m.interviewPrepsCreated;
      acc.tasksCompleted += m.tasksCompleted;
      acc.tasksFailed += m.tasksFailed;
      acc.aiTokensUsed += m.aiTokensUsed;
      acc.aiCostUsd += parseFloat(m.aiCostUsd);
      if (m.averageAtsScore) {
        acc.atsScores.push(m.averageAtsScore);
      }
      return acc;
    }, {
      resumesGenerated: 0,
      coverLettersCreated: 0,
      applicationsSubmitted: 0,
      companiesResearched: 0,
      emailsSent: 0,
      interviewPrepsCreated: 0,
      tasksCompleted: 0,
      tasksFailed: 0,
      aiTokensUsed: 0,
      aiCostUsd: 0,
      atsScores: []
    });

    // Calculate average ATS score
    const avgAtsScore = totals.atsScores.length > 0
      ? totals.atsScores.reduce((a, b) => a + b, 0) / totals.atsScores.length
      : null;

    // Calculate success rate
    const totalTasks = totals.tasksCompleted + totals.tasksFailed;
    const successRate = totalTasks > 0
      ? (totals.tasksCompleted / totalTasks) * 100
      : 100;

    return {
      daily: metrics,
      totals: {
        ...totals,
        avgAtsScore,
        successRate
      }
    };
  } catch (error) {
    logger.error('Error getting metrics', { error: error.message, userId });
    throw error;
  }
}

/**
 * Update metrics for a completed task
 */
async function updateMetrics(userId, taskType, taskData) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metricField = {
      RESUME_GENERATION: 'resumesGenerated',
      COVER_LETTER_GENERATION: 'coverLettersCreated',
      JOB_APPLICATION: 'applicationsSubmitted',
      COMPANY_RESEARCH: 'companiesResearched',
      COLD_EMAIL: 'emailsSent',
      INTERVIEW_PREP: 'interviewPrepsCreated'
    }[taskType];

    if (!metricField) {
      return; // Unknown task type
    }

    await prisma.aIAgentMetrics.upsert({
      where: {
        userId_date: {
          userId,
          date: today
        }
      },
      update: {
        [metricField]: { increment: 1 },
        tasksCompleted: { increment: 1 },
        ...(taskData.atsScore ? {
          averageAtsScore: taskData.atsScore // TODO: Calculate proper average
        } : {})
      },
      create: {
        userId,
        date: today,
        [metricField]: 1,
        tasksCompleted: 1,
        averageAtsScore: taskData.atsScore
      }
    });

    logger.debug('Updated metrics', { userId, taskType });
  } catch (error) {
    logger.error('Error updating metrics', { error: error.message, userId });
    // Don't throw - metrics are not critical
  }
}

/**
 * Get chat conversation history
 */
async function getChatHistory(userId) {
  try {
    let conversation = await prisma.aIAgentConversation.findFirst({
      where: {
        userId,
        isActive: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (!conversation) {
      conversation = await prisma.aIAgentConversation.create({
        data: {
          userId,
          messages: [{
            id: '1',
            sender: 'ai',
            message: "Hi! I'm your AI Job Application Assistant. I can help you automate your entire job search process - from tailoring resumes to researching companies. What would you like me to do?",
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
          }]
        }
      });
    }

    return conversation;
  } catch (error) {
    logger.error('Error getting chat history', { error: error.message, userId });
    throw error;
  }
}

/**
 * Create or update conversation
 */
async function createOrUpdateConversation(userId, messages) {
  try {
    const conversation = await prisma.aIAgentConversation.upsert({
      where: {
        userId_isActive: {
          userId,
          isActive: true
        }
      },
      update: {
        messages,
        updatedAt: new Date()
      },
      create: {
        userId,
        messages,
        isActive: true
      }
    });

    return conversation;
  } catch (error) {
    // Fallback: try to find and update
    try {
      const existing = await prisma.aIAgentConversation.findFirst({
        where: { userId, isActive: true }
      });

      if (existing) {
        return await prisma.aIAgentConversation.update({
          where: { id: existing.id },
          data: { messages, updatedAt: new Date() }
        });
      }

      // Create new
      return await prisma.aIAgentConversation.create({
        data: { userId, messages, isActive: true }
      });
    } catch (fallbackError) {
      logger.error('Error in conversation fallback', { error: fallbackError.message, userId });
      throw fallbackError;
    }
  }
}

/**
 * Send chat message (placeholder - will integrate with AI later)
 */
async function sendChatMessage(userId, message, conversationHistory = []) {
  try {
    // Get or create conversation
    const conversation = await getChatHistory(userId);
    const messages = Array.isArray(conversation.messages) ? conversation.messages : [];

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      message,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };

    // For now, return a placeholder response
    // TODO: Integrate with actual AI service (OpenAI, Anthropic, etc.)
    const aiMsg = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      message: "I understand you'd like help with that. Let me work on it for you. This feature is currently being enhanced with full AI capabilities!",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      suggestedActions: [
        { label: 'Generate resume for job', action: 'generate_resume' },
        { label: 'Research company', action: 'research_company' }
      ]
    };

    const updatedMessages = [...messages, userMsg, aiMsg];

    // Save conversation
    const updated = await createOrUpdateConversation(userId, updatedMessages);

    logger.info('Processed chat message', { userId });

    return {
      message: aiMsg.message,
      suggestedActions: aiMsg.suggestedActions,
      conversation: updated
    };
  } catch (error) {
    logger.error('Error sending chat message', { error: error.message, userId });
    throw error;
  }
}

module.exports = {
  getOrCreateSettings,
  updateSettings,
  toggleCapability,
  createTask,
  getAllTasks,
  getActiveTasks,
  getTaskById,
  updateTaskProgress,
  updateTaskStatus,
  cancelTask,
  deleteTask,
  saveTaskResults,
  getHistory,
  addHistoryEntry,
  getMetrics,
  updateMetrics,
  getChatHistory,
  createOrUpdateConversation,
  sendChatMessage,
  checkUsageLimits,
  incrementUsageCounter
};
