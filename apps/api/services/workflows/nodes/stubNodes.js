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

// Interview Prep Node
class InterviewPrepNode extends BaseNode {
  constructor() {
    super('INTERVIEW_PREP');
  }

  async execute(node, input, context) {
    try {
      const config = node.config || {};

      // Extract parameters from input or config
      const jobDescription = this.getValue(input, config.jobDescriptionPath || 'jobDescription');
      const company = this.getValue(input, config.companyPath || 'company');
      const jobTitle = this.getValue(input, config.jobTitlePath || 'jobTitle');
      const baseResumeId = this.getValue(input, config.baseResumeIdPath || 'baseResumeId');

      if (!jobDescription) {
        throw new Error('Job description is required for interview prep');
      }

      logger.info('Interview prep node executing', {
        userId: context.userId,
        company,
        jobTitle
      });

      // Create task using aiAgentService
      const task = await aiAgentService.createTask(context.userId, {
        type: 'INTERVIEW_PREP',
        jobDescription,
        company,
        jobTitle,
        baseResumeId
      });

      logger.info('Interview prep task created', { taskId: task.id });

      // Wait for completion
      const completedTask = await waitForTaskCompletion(task.id, context.userId);

      logger.info('Interview prep completed', { taskId: task.id });

      // Return actual results
      return {
        taskId: task.id,
        prepMaterial: completedTask.resultData,
        questions: completedTask.resultData?.questions || [],
        answers: completedTask.resultData?.answers || [],
        tips: completedTask.resultData?.tips || [],
        outputFiles: completedTask.outputFiles || []
      };
    } catch (error) {
      logger.error('Interview prep node execution failed', { error: error.message });
      throw error;
    }
  }
}

// Bulk Resume Node
class BulkResumeNode extends BaseNode {
  constructor() {
    super('BULK_RESUME');
  }

  async execute(node, input, context) {
    try {
      const config = node.config || {};

      // Extract parameters - expects array of job descriptions
      const jobDescriptions = this.getValue(input, config.jobDescriptionsPath || 'jobDescriptions');
      const baseResumeId = this.getValue(input, config.baseResumeIdPath || 'baseResumeId');
      const tone = config.tone || 'professional';
      const length = config.length || 'medium';

      if (!Array.isArray(jobDescriptions) || jobDescriptions.length === 0) {
        throw new Error('Array of job descriptions is required for bulk resume generation');
      }

      logger.info('Bulk resume node executing', {
        userId: context.userId,
        count: jobDescriptions.length
      });

      // Check batch usage limits first
      await aiAgentService.checkBatchUsageLimits(context.userId, jobDescriptions.length);

      // Create a batch ID for tracking
      const batchId = `batch_${Date.now()}`;
      const tasks = [];

      // Create tasks for each job description
      for (const jd of jobDescriptions) {
        const task = await aiAgentService.createTask(
          context.userId,
          {
            type: 'RESUME_GENERATION',
            jobDescription: jd.description || jd,
            jobTitle: jd.title || '',
            company: jd.company || '',
            baseResumeId,
            tone,
            length,
            batchId
          },
          { skipUsageCheck: true } // Already checked batch limits
        );
        tasks.push(task);
      }

      // Increment usage counter for the batch
      await aiAgentService.incrementUsageCounter(context.userId, tasks.length);

      logger.info('Bulk resume tasks created', { batchId, count: tasks.length });

      // Wait for all tasks to complete
      const completedTasks = await Promise.all(
        tasks.map(task => waitForTaskCompletion(task.id, context.userId))
      );

      logger.info('Bulk resume generation completed', {
        batchId,
        completed: completedTasks.length
      });

      // Return results
      return {
        batchId,
        count: completedTasks.length,
        resumes: completedTasks.map(task => ({
          taskId: task.id,
          resumeData: task.resultData,
          atsScore: task.atsScore,
          atsBreakdown: task.atsBreakdown
        }))
      };
    } catch (error) {
      logger.error('Bulk resume node execution failed', { error: error.message });
      throw error;
    }
  }
}

// Cold Email Node
class ColdEmailNode extends BaseNode {
  constructor() {
    super('COLD_EMAIL');
  }

  async execute(node, input, context) {
    try {
      const config = node.config || {};

      // Extract parameters
      const recipientEmail = this.getValue(input, config.recipientEmailPath || 'recipientEmail');
      const recipientName = this.getValue(input, config.recipientNamePath || 'recipientName');
      const company = this.getValue(input, config.companyPath || 'company');
      const jobTitle = this.getValue(input, config.jobTitlePath || 'jobTitle');
      const baseResumeId = this.getValue(input, config.baseResumeIdPath || 'baseResumeId');
      const tone = config.tone || 'professional';
      const emailType = config.emailType || 'introduction'; // introduction, follow-up, inquiry

      if (!recipientEmail || !company) {
        throw new Error('Recipient email and company are required for cold email');
      }

      logger.info('Cold email node executing', {
        userId: context.userId,
        company,
        emailType
      });

      // Create task using aiAgentService
      const task = await aiAgentService.createTask(context.userId, {
        type: 'COLD_EMAIL',
        company,
        jobTitle,
        baseResumeId,
        tone
      });

      logger.info('Cold email task created', { taskId: task.id });

      // Wait for completion
      const completedTask = await waitForTaskCompletion(task.id, context.userId);

      logger.info('Cold email generation completed', { taskId: task.id });

      // Return actual results
      return {
        taskId: task.id,
        emailContent: completedTask.resultData,
        recipientEmail,
        recipientName,
        company,
        sent: false, // Not actually sent, just generated
        outputFiles: completedTask.outputFiles || []
      };
    } catch (error) {
      logger.error('Cold email node execution failed', { error: error.message });
      throw error;
    }
  }
}

// Bulk JD Processor Node
class BulkJDProcessorNode extends BaseNode {
  constructor() {
    super('BULK_JD_PROCESSOR');
  }

  async execute(node, input, context) {
    try {
      const config = node.config || {};

      // Extract parameters - expects array of job descriptions or URLs
      const jobDescriptions = this.getValue(input, config.jobDescriptionsPath || 'jobDescriptions');
      const action = config.action || 'analyze'; // analyze, generate_resume, full_application
      const baseResumeId = this.getValue(input, config.baseResumeIdPath || 'baseResumeId');

      if (!Array.isArray(jobDescriptions) || jobDescriptions.length === 0) {
        throw new Error('Array of job descriptions is required for bulk processing');
      }

      logger.info('Bulk JD processor node executing', {
        userId: context.userId,
        count: jobDescriptions.length,
        action
      });

      // Check batch usage limits
      await aiAgentService.checkBatchUsageLimits(context.userId, jobDescriptions.length);

      const batchId = `bulk_jd_${Date.now()}`;
      const tasks = [];

      // Create appropriate tasks based on action
      for (const jd of jobDescriptions) {
        let taskType;
        switch (action) {
          case 'generate_resume':
            taskType = 'RESUME_GENERATION';
            break;
          case 'full_application':
            taskType = 'JOB_APPLICATION';
            break;
          case 'analyze':
          default:
            taskType = 'JOB_APPLICATION';
            break;
        }

        const task = await aiAgentService.createTask(
          context.userId,
          {
            type: taskType,
            jobDescription: jd.description || jd,
            jobTitle: jd.title || '',
            company: jd.company || '',
            jobUrl: jd.url || '',
            baseResumeId,
            batchId
          },
          { skipUsageCheck: true }
        );
        tasks.push(task);
      }

      // Increment usage counter
      await aiAgentService.incrementUsageCounter(context.userId, tasks.length);

      logger.info('Bulk JD processing tasks created', { batchId, count: tasks.length });

      // Wait for all tasks to complete
      const completedTasks = await Promise.all(
        tasks.map(task => waitForTaskCompletion(task.id, context.userId))
      );

      logger.info('Bulk JD processing completed', {
        batchId,
        completed: completedTasks.length
      });

      // Return results
      return {
        batchId,
        action,
        count: completedTasks.length,
        results: completedTasks.map(task => ({
          taskId: task.id,
          resultData: task.resultData,
          status: task.status
        }))
      };
    } catch (error) {
      logger.error('Bulk JD processor node execution failed', { error: error.message });
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
  InterviewPrepNode,
  BulkResumeNode,
  ColdEmailNode,
  BulkJDProcessorNode,
  JobTrackerNode,
  JobSearchNode,
  EmailNode,
  ConditionNode,
  LoopNode,
  WaitNode,
  DataNode,
  WebhookNode
};
