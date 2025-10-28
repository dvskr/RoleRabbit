/**
 * Agent Executor - Runs AI agents and executes their tasks
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Execute an agent based on its type
 */
async function executeAgent(agent, userId) {
  try {
    console.log(`Executing agent: ${agent.name} (${agent.type})`);

    // Create a task record
    const task = await prisma.aIAgentTask.create({
      data: {
        userId,
        agentId: agent.id,
        type: agent.config?.type || 'general',
        status: 'in_progress',
        description: `Executing ${agent.name}`,
        result: null,
        error: null
      }
    });

    let result = null;
    let error = null;

    // Execute based on agent type
    switch (agent.config?.agentType || agent.type) {
      case 'job_discovery':
        result = await executeJobDiscoveryAgent(agent);
        break;
      case 'resume_optimization':
        result = await executeResumeOptimizationAgent(agent);
        break;
      case 'interview_prep':
        result = await executeInterviewPrepAgent(agent);
        break;
      case 'network_discovery':
        result = await executeNetworkDiscoveryAgent(agent);
        break;
      case 'application_followup':
        result = await executeApplicationFollowupAgent(agent);
        break;
      default:
        result = { message: 'Agent executed successfully', agentName: agent.name };
    }

    // Update task as completed
    await prisma.aIAgentTask.update({
      where: { id: task.id },
      data: {
        status: 'completed',
        result: JSON.stringify(result),
        completedAt: new Date()
      }
    });

    // Update agent last run time
    await prisma.aIAgent.update({
      where: { id: agent.id },
      data: {
        lastRun: new Date()
      }
    });

    console.log(`Agent ${agent.name} completed successfully`);
    return { success: true, result, taskId: task.id };

  } catch (err) {
    console.error(`Agent execution error: ${err.message}`);
    
    // Update task as failed
    if (task) {
      await prisma.aIAgentTask.update({
        where: { id: task.id },
        data: {
          status: 'failed',
          error: err.message
        }
      });
    }

    return { success: false, error: err.message };
  }
}

/**
 * Execute Job Discovery Agent
 */
async function executeJobDiscoveryAgent(agent) {
  const keywords = agent.config?.keywords || ['software engineer', 'developer'];
  
  // Mock job discovery (in production, this would call actual job APIs)
  const discoveredJobs = [
    {
      title: 'Senior Frontend Developer',
      company: 'Tech Corp',
      location: 'Remote',
      url: 'https://example.com/job/1',
      postedAt: new Date().toISOString(),
      matches: keywords
    },
    {
      title: 'Full Stack Engineer',
      company: 'Startup Inc',
      location: 'Hybrid',
      url: 'https://example.com/job/2',
      postedAt: new Date().toISOString(),
      matches: keywords
    }
  ];

  return {
    jobsFound: discoveredJobs.length,
    jobs: discoveredJobs,
    keywords,
    executedAt: new Date().toISOString()
  };
}

/**
 * Execute Resume Optimization Agent
 */
async function executeResumeOptimizationAgent(agent) {
  const targetScore = agent.config?.targetScore || 90;
  
  // Mock optimization (in production, this would analyze resume with AI)
  const optimizations = [
    'Added keywords from job descriptions',
    'Improved action verbs in work experience',
    'Enhanced summary with quantifiable metrics',
    'Optimized for ATS compatibility'
  ];

  return {
    currentScore: 75,
    targetScore,
    optimizationsApplied: optimizations,
    newScore: 88,
    executedAt: new Date().toISOString()
  };
}

/**
 * Execute Interview Prep Agent
 */
async function executeInterviewPrepAgent(agent) {
  const questionTypes = agent.config?.questionTypes || ['technical', 'behavioral'];
  const count = agent.config?.count || 10;
  
  // Mock interview questions (in production, this would use AI to generate)
  const questions = [
    { type: 'technical', question: 'Explain how React hooks work', difficulty: 'medium' },
    { type: 'behavioral', question: 'Tell me about a time you worked in a team', difficulty: 'easy' }
  ];

  return {
    questionsGenerated: count,
    questions,
    questionTypes,
    executedAt: new Date().toISOString()
  };
}

/**
 * Execute Network Discovery Agent
 */
async function executeNetworkDiscoveryAgent(agent) {
  // Mock network discovery (in production, would search LinkedIn, etc.)
  const contacts = [
    {
      name: 'John Doe',
      title: 'Software Engineer at Google',
      connection: '2nd degree',
      mutuals: 5
    }
  ];

  return {
    contactsFound: contacts.length,
    contacts,
    executedAt: new Date().toISOString()
  };
}

/**
 * Execute Application Follow-up Agent
 */
async function executeApplicationFollowupAgent(agent) {
  const followUpDays = agent.config?.followUpDays || 7;
  
  // Mock follow-up emails (in production, would check dates and send emails)
  const followUps = [
    {
      jobTitle: 'Frontend Developer',
      company: 'Tech Corp',
      appliedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      emailSent: true
    }
  ];

  return {
    followUpsNeeded: followUps.length,
    followUps,
    followUpDays,
    executedAt: new Date().toISOString()
  };
}

/**
 * Run all active agents for a user
 */
async function runActiveAgentsForUser(userId) {
  try {
    const agents = await prisma.aIAgent.findMany({
      where: {
        userId,
        status: 'active',
        enabled: true
      }
    });

    console.log(`Found ${agents.length} active agents for user ${userId}`);

    const results = await Promise.allSettled(
      agents.map(agent => executeAgent(agent, userId))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

    return {
      total: agents.length,
      successful,
      failed,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: 'Execution failed' })
    };
  } catch (error) {
    console.error('Error running active agents:', error);
    throw error;
  }
}

/**
 * Schedule automatic agent execution
 */
function scheduleAgentExecution() {
  // Run every hour
  setInterval(async () => {
    try {
      console.log('Running scheduled agent execution...');
      
      // Get all users with active agents
      const users = await prisma.aIAgent.findMany({
        where: {
          status: 'active',
          enabled: true
        },
        select: {
          userId: true
        },
        distinct: ['userId']
      });

      const userIds = [...new Set(users.map(u => u.userId))];
      
      for (const userId of userIds) {
        await runActiveAgentsForUser(userId);
      }

      console.log('Scheduled agent execution completed');
    } catch (error) {
      console.error('Error in scheduled execution:', error);
    }
  }, 60 * 60 * 1000); // Run every hour
}

// Start scheduling on module load if enabled
if (process.env.ENABLE_AGENT_SCHEDULER !== 'false') {
  scheduleAgentExecution();
}

module.exports = {
  executeAgent,
  runActiveAgentsForUser,
  scheduleAgentExecution
};

