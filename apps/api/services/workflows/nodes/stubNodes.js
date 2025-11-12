const BaseNode = require('./baseNode');
const aiAgentService = require('../../aiAgentService');
const { enqueueTask } = require('../../aiAgentQueue');
const logger = require('../../../utils/logger');

/**
 * Helper function to wait for task completion
 * Polls task status until it completes, fails, or times out
 */
async function waitForTaskCompletion(taskId, userId, timeoutMs = 300000) {
  const startTime = Date.now();
  const pollInterval = 1000; // Check every second

  while (Date.now() - startTime < timeoutMs) {
    const task = await aiAgentService.getTaskById(userId, taskId);

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (task.status === 'COMPLETED') {
      return task;
    }

    if (task.status === 'FAILED') {
      throw new Error(`Task failed: ${task.errorMessage || 'Unknown error'}`);
    }

    if (task.status === 'CANCELLED') {
      throw new Error('Task was cancelled');
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Task ${taskId} timed out after ${timeoutMs}ms`);
}

// Resume Node
class ResumeNode extends BaseNode {
  constructor(mode = 'generate') {
    super('RESUME', mode);
  }

  async execute(node, input, context) {
    try {
      const config = node.config || {};

      // Extract parameters from input or config
      const jobDescription = this.getValue(input, config.jobDescriptionPath || 'jobDescription');
      const jobTitle = this.getValue(input, config.jobTitlePath || 'jobTitle');
      const company = this.getValue(input, config.companyPath || 'company');
      const baseResumeId = this.getValue(input, config.baseResumeIdPath || 'baseResumeId');
      const tone = config.tone || 'professional';
      const length = config.length || 'medium';

      if (!jobDescription) {
        throw new Error('Job description is required for resume generation');
      }

      logger.info('Resume node executing', { userId: context.userId, jobTitle, company });

      // Create task using aiAgentService (includes usage limit check)
      const task = await aiAgentService.createTask(context.userId, {
        type: 'RESUME_GENERATION',
        jobTitle,
        company,
        jobDescription,
        baseResumeId,
        tone,
        length
      });

      logger.info('Resume generation task created', { taskId: task.id });

      // Task is automatically enqueued by createTask
      // Now wait for it to complete
      const completedTask = await waitForTaskCompletion(task.id, context.userId);

      logger.info('Resume generation completed', {
        taskId: task.id,
        atsScore: completedTask.atsScore
      });

      // Return actual results
      return {
        resumeId: task.id,
        taskId: task.id,
        generated: true,
        resumeData: completedTask.resultData,
        atsScore: completedTask.atsScore,
        atsBreakdown: completedTask.atsBreakdown,
        outputFiles: completedTask.outputFiles || []
      };
    } catch (error) {
      logger.error('Resume node execution failed', { error: error.message });
      throw error;
    }
  }
}

// Cover Letter Node
class CoverLetterNode extends BaseNode {
  constructor() {
    super('COVER_LETTER');
  }

  async execute(node, input, context) {
    try {
      const config = node.config || {};

      // Extract parameters from input or config
      const jobDescription = this.getValue(input, config.jobDescriptionPath || 'jobDescription');
      const jobTitle = this.getValue(input, config.jobTitlePath || 'jobTitle');
      const company = this.getValue(input, config.companyPath || 'company');
      const baseResumeId = this.getValue(input, config.baseResumeIdPath || 'baseResumeId');
      const tone = config.tone || 'professional';

      if (!jobDescription || !company) {
        throw new Error('Job description and company are required for cover letter generation');
      }

      logger.info('Cover letter node executing', { userId: context.userId, jobTitle, company });

      // Create task using aiAgentService
      const task = await aiAgentService.createTask(context.userId, {
        type: 'COVER_LETTER_GENERATION',
        jobTitle,
        company,
        jobDescription,
        baseResumeId,
        tone
      });

      logger.info('Cover letter generation task created', { taskId: task.id });

      // Wait for completion
      const completedTask = await waitForTaskCompletion(task.id, context.userId);

      logger.info('Cover letter generation completed', { taskId: task.id });

      // Return actual results
      return {
        coverLetterId: task.id,
        taskId: task.id,
        generated: true,
        coverLetterData: completedTask.resultData,
        outputFiles: completedTask.outputFiles || []
      };
    } catch (error) {
      logger.error('Cover letter node execution failed', { error: error.message });
      throw error;
    }
  }
}

// Job Tracker Node
class JobTrackerNode extends BaseNode {
  constructor(mode = 'add') { super('JOB_TRACKER', mode); }
  async execute(node, input) {
    return { trackerId: 'tracker_' + Date.now(), added: true };
  }
}

// Company Research Node
class CompanyResearchNode extends BaseNode {
  constructor() {
    super('COMPANY_RESEARCH');
  }

  async execute(node, input, context) {
    try {
      const config = node.config || {};

      // Extract parameters from input or config
      const company = this.getValue(input, config.companyPath || 'company');

      if (!company) {
        throw new Error('Company name is required for research');
      }

      logger.info('Company research node executing', { userId: context.userId, company });

      // Create task using aiAgentService
      const task = await aiAgentService.createTask(context.userId, {
        type: 'COMPANY_RESEARCH',
        company
      });

      logger.info('Company research task created', { taskId: task.id });

      // Wait for completion
      const completedTask = await waitForTaskCompletion(task.id, context.userId);

      logger.info('Company research completed', { taskId: task.id });

      // Return actual results
      return {
        taskId: task.id,
        company,
        researchData: completedTask.resultData,
        outputFiles: completedTask.outputFiles || []
      };
    } catch (error) {
      logger.error('Company research node execution failed', { error: error.message });
      throw error;
    }
  }
}

// Job Search Node
class JobSearchNode extends BaseNode {
  constructor(mode = 'search') { super('JOB_SEARCH', mode); }
  async execute(node, input) {
    return { jobs: [], count: 0 };
  }
}

// Email Node
class EmailNode extends BaseNode {
  constructor(mode = 'send') { super('EMAIL', mode); }
  async execute(node, input) {
    return { sent: true, messageId: 'msg_' + Date.now() };
  }
}

// Condition Node
class ConditionNode extends BaseNode {
  constructor(mode = 'if') { super('CONDITION', mode); }
  async execute(node, input) {
    const condition = node.config?.condition || {};
    const result = this._evaluate(condition, input);
    return { result, passedCondition: result };
  }
  _evaluate(condition, data) {
    const { field, operator, value } = condition;
    const fieldValue = this.getValue(data, field);
    if (operator === '>=') return fieldValue >= value;
    if (operator === '>') return fieldValue > value;
    if (operator === '==') return fieldValue == value;
    return true;
  }
}

// Loop Node
class LoopNode extends BaseNode {
  constructor() { super('LOOP'); }
  async execute(node, input) {
    return { items: input.items || [], count: (input.items || []).length };
  }
}

// Wait Node
class WaitNode extends BaseNode {
  constructor(mode = 'delay') { super('WAIT', mode); }
  async execute(node, input) {
    const delay = node.config?.delay || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    return { waited: delay };
  }
}

// Data Node
class DataNode extends BaseNode {
  constructor(mode = 'merge') { super('DATA', mode); }
  async execute(node, input) {
    return input;
  }
}

// Webhook Node
class WebhookNode extends BaseNode {
  constructor(mode = 'call') { super('WEBHOOK', mode); }
  async execute(node, input) {
    return { called: true, response: {} };
  }
}

module.exports = {
  ResumeNode,
  CoverLetterNode,
  CompanyResearchNode,
  JobTrackerNode,
  JobSearchNode,
  EmailNode,
  ConditionNode,
  LoopNode,
  WaitNode,
  DataNode,
  WebhookNode
};
