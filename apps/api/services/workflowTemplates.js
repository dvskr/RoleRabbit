/**
 * Workflow Templates
 * Pre-built workflow templates for common use cases
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Template 1: AI-Powered Job Application
 * Analyzes job, tailors resume, generates cover letter, and applies
 */
const aiJobApplicationTemplate = {
  name: 'AI-Powered Job Application',
  description: 'Automatically analyze a job posting, tailor your resume, generate a cover letter, and submit the application.',
  icon: '🤖',
  color: '#8b5cf6',
  triggerType: 'MANUAL',
  isTemplate: true,
  templateCategory: 'Job Application',
  tags: ['ai', 'automation', 'job-application'],
  nodes: [
    {
      id: 'trigger-1',
      type: 'TRIGGER_MANUAL',
      position: { x: 100, y: 100 },
      config: {
        name: 'Start Application',
        description: 'Trigger this workflow manually with a job URL'
      }
    },
    {
      id: 'ai-analyze-1',
      type: 'AI_AGENT_ANALYZE',
      position: { x: 100, y: 200 },
      config: {
        name: 'Analyze Job Fit',
        jobUrlPath: 'jobUrl',
        minScore: 7
      }
    },
    {
      id: 'condition-1',
      type: 'CONDITION_IF',
      position: { x: 100, y: 300 },
      config: {
        name: 'Check Match Score',
        condition: {
          field: 'score',
          operator: '>=',
          value: 7
        }
      }
    },
    {
      id: 'resume-tailor-1',
      type: 'RESUME_TAILOR',
      position: { x: 100, y: 400 },
      config: {
        name: 'Tailor Resume',
        resumeIdPath: 'defaultResumeId',
        jobDescriptionPath: 'jobDescription'
      }
    },
    {
      id: 'cover-letter-1',
      type: 'COVER_LETTER_GENERATE',
      position: { x: 100, y: 500 },
      config: {
        name: 'Generate Cover Letter',
        jobUrlPath: 'jobUrl',
        resumeIdPath: 'resumeId'
      }
    },
    {
      id: 'auto-apply-1',
      type: 'AUTO_APPLY_SINGLE',
      position: { x: 100, y: 600 },
      config: {
        name: 'Submit Application',
        jobUrlPath: 'jobUrl',
        resumeIdPath: 'resumeId',
        coverLetterIdPath: 'coverLetterId'
      }
    },
    {
      id: 'job-tracker-1',
      type: 'JOB_TRACKER_ADD',
      position: { x: 100, y: 700 },
      config: {
        name: 'Add to Job Tracker',
        jobUrlPath: 'jobUrl',
        statusPath: 'status'
      }
    },
    {
      id: 'email-notification-1',
      type: 'EMAIL_SEND',
      position: { x: 300, y: 400 },
      config: {
        name: 'Send Rejection Email',
        to: '{{$userEmail}}',
        subject: 'Job Application Skipped - Low Match Score',
        body: 'Job {{jobTitle}} at {{company}} had a match score of {{score}}/10, which is below your threshold of 7.'
      }
    }
  ],
  connections: [
    { from: 'trigger-1', to: 'ai-analyze-1' },
    { from: 'ai-analyze-1', to: 'condition-1' },
    { from: 'condition-1', to: 'resume-tailor-1', condition: true },
    { from: 'condition-1', to: 'email-notification-1', condition: false },
    { from: 'resume-tailor-1', to: 'cover-letter-1' },
    { from: 'cover-letter-1', to: 'auto-apply-1' },
    { from: 'auto-apply-1', to: 'job-tracker-1' }
  ]
};

/**
 * Template 2: Bulk Job Application
 * Apply to multiple jobs from a CSV file
 */
const bulkJobApplicationTemplate = {
  name: 'Bulk Job Application',
  description: 'Upload a CSV of job URLs and automatically apply to all of them in sequence.',
  icon: '📊',
  color: '#3b82f6',
  triggerType: 'MANUAL',
  isTemplate: true,
  templateCategory: 'Job Application',
  tags: ['bulk', 'automation', 'job-application'],
  nodes: [
    {
      id: 'trigger-1',
      type: 'TRIGGER_MANUAL',
      position: { x: 100, y: 100 },
      config: {
        name: 'Start Bulk Apply',
        description: 'Upload CSV with job URLs'
      }
    },
    {
      id: 'loop-1',
      type: 'LOOP_FOR_EACH',
      position: { x: 100, y: 200 },
      config: {
        name: 'For Each Job',
        itemsPath: 'jobs'
      }
    },
    {
      id: 'wait-1',
      type: 'WAIT_DELAY',
      position: { x: 100, y: 300 },
      config: {
        name: 'Wait Between Applications',
        delay: 30000 // 30 seconds
      }
    },
    {
      id: 'auto-apply-1',
      type: 'AUTO_APPLY_SINGLE',
      position: { x: 100, y: 400 },
      config: {
        name: 'Submit Application',
        jobUrlPath: 'item.jobUrl'
      }
    },
    {
      id: 'job-tracker-1',
      type: 'JOB_TRACKER_ADD',
      position: { x: 100, y: 500 },
      config: {
        name: 'Track Application',
        jobUrlPath: 'item.jobUrl',
        status: 'SUBMITTED'
      }
    }
  ],
  connections: [
    { from: 'trigger-1', to: 'loop-1' },
    { from: 'loop-1', to: 'wait-1' },
    { from: 'wait-1', to: 'auto-apply-1' },
    { from: 'auto-apply-1', to: 'job-tracker-1' }
  ]
};

/**
 * Template 3: Daily Job Search & Auto Apply
 * Search for jobs daily and auto-apply to matching ones
 */
const dailyJobSearchTemplate = {
  name: 'Daily Job Search & Auto Apply',
  description: 'Automatically search for jobs daily, analyze them with AI, and apply to the best matches.',
  icon: '🔍',
  color: '#10b981',
  triggerType: 'SCHEDULE',
  triggerConfig: {
    cronExpression: '0 9 * * *', // 9 AM daily
    timezone: 'UTC'
  },
  isTemplate: true,
  templateCategory: 'Job Search',
  tags: ['scheduled', 'automation', 'job-search'],
  nodes: [
    {
      id: 'trigger-1',
      type: 'TRIGGER_SCHEDULE',
      position: { x: 100, y: 100 },
      config: {
        name: 'Daily Trigger',
        schedule: '0 9 * * *'
      }
    },
    {
      id: 'job-search-1',
      type: 'JOB_SEARCH',
      position: { x: 100, y: 200 },
      config: {
        name: 'Search LinkedIn',
        platform: 'LINKEDIN',
        keywords: '{{$jobKeywords}}',
        location: '{{$location}}',
        limit: 20
      }
    },
    {
      id: 'loop-1',
      type: 'LOOP_FOR_EACH',
      position: { x: 100, y: 300 },
      config: {
        name: 'For Each Job',
        itemsPath: 'jobs'
      }
    },
    {
      id: 'ai-analyze-1',
      type: 'AI_AGENT_ANALYZE',
      position: { x: 100, y: 400 },
      config: {
        name: 'Analyze Job Fit',
        jobUrlPath: 'item.jobUrl',
        minScore: 8
      }
    },
    {
      id: 'condition-1',
      type: 'CONDITION_IF',
      position: { x: 100, y: 500 },
      config: {
        name: 'Check High Match',
        condition: {
          field: 'score',
          operator: '>=',
          value: 8
        }
      }
    },
    {
      id: 'auto-apply-1',
      type: 'AUTO_APPLY_SINGLE',
      position: { x: 100, y: 600 },
      config: {
        name: 'Auto Apply',
        jobUrlPath: 'item.jobUrl'
      }
    },
    {
      id: 'wait-1',
      type: 'WAIT_DELAY',
      position: { x: 100, y: 700 },
      config: {
        name: 'Wait Between Applications',
        delay: 60000 // 1 minute
      }
    }
  ],
  connections: [
    { from: 'trigger-1', to: 'job-search-1' },
    { from: 'job-search-1', to: 'loop-1' },
    { from: 'loop-1', to: 'ai-analyze-1' },
    { from: 'ai-analyze-1', to: 'condition-1' },
    { from: 'condition-1', to: 'auto-apply-1', condition: true },
    { from: 'auto-apply-1', to: 'wait-1' }
  ]
};

/**
 * Template 4: Application Follow-up Tracker
 * Track applications and send follow-up emails after X days
 */
const applicationFollowUpTemplate = {
  name: 'Application Follow-Up Tracker',
  description: 'Automatically send follow-up emails for applications after 1 week of no response.',
  icon: '📧',
  color: '#f59e0b',
  triggerType: 'SCHEDULE',
  triggerConfig: {
    cronExpression: '0 10 * * 1', // Every Monday at 10 AM
    timezone: 'UTC'
  },
  isTemplate: true,
  templateCategory: 'Job Tracking',
  tags: ['follow-up', 'email', 'tracking'],
  nodes: [
    {
      id: 'trigger-1',
      type: 'TRIGGER_SCHEDULE',
      position: { x: 100, y: 100 },
      config: {
        name: 'Weekly Check',
        schedule: '0 10 * * 1'
      }
    },
    {
      id: 'job-tracker-query-1',
      type: 'DATABASE_QUERY',
      position: { x: 100, y: 200 },
      config: {
        name: 'Get Applications Needing Follow-up',
        query: 'SELECT * FROM job_applications WHERE status = "SUBMITTED" AND daysAgo > 7'
      }
    },
    {
      id: 'loop-1',
      type: 'LOOP_FOR_EACH',
      position: { x: 100, y: 300 },
      config: {
        name: 'For Each Application',
        itemsPath: 'applications'
      }
    },
    {
      id: 'email-1',
      type: 'EMAIL_SEND',
      position: { x: 100, y: 400 },
      config: {
        name: 'Send Follow-up Email',
        to: '{{item.companyEmail}}',
        subject: 'Following Up on {{item.jobTitle}} Application',
        body: 'Dear Hiring Manager,\n\nI wanted to follow up on my application for the {{item.jobTitle}} position...'
      }
    },
    {
      id: 'job-tracker-update-1',
      type: 'JOB_TRACKER_UPDATE',
      position: { x: 100, y: 500 },
      config: {
        name: 'Update Status',
        applicationId: '{{item.id}}',
        status: 'FOLLOWED_UP'
      }
    },
    {
      id: 'wait-1',
      type: 'WAIT_DELAY',
      position: { x: 100, y: 600 },
      config: {
        name: 'Wait Between Emails',
        delay: 120000 // 2 minutes
      }
    }
  ],
  connections: [
    { from: 'trigger-1', to: 'job-tracker-query-1' },
    { from: 'job-tracker-query-1', to: 'loop-1' },
    { from: 'loop-1', to: 'email-1' },
    { from: 'email-1', to: 'job-tracker-update-1' },
    { from: 'job-tracker-update-1', to: 'wait-1' }
  ]
};

/**
 * Template 5: Company Research Pipeline
 * Research companies and save reports before applying
 */
const companyResearchTemplate = {
  name: 'Company Research Pipeline',
  description: 'Automatically research companies, analyze culture fit, and save reports before applying.',
  icon: '🔬',
  color: '#ec4899',
  triggerType: 'MANUAL',
  isTemplate: true,
  templateCategory: 'Research',
  tags: ['research', 'company-analysis', 'ai'],
  nodes: [
    {
      id: 'trigger-1',
      type: 'TRIGGER_MANUAL',
      position: { x: 100, y: 100 },
      config: {
        name: 'Start Research',
        description: 'Provide company name or job URL'
      }
    },
    {
      id: 'company-research-1',
      type: 'COMPANY_RESEARCH',
      position: { x: 100, y: 200 },
      config: {
        name: 'Research Company',
        companyNamePath: 'companyName'
      }
    },
    {
      id: 'ai-chat-1',
      type: 'AI_AGENT_CHAT',
      position: { x: 100, y: 300 },
      config: {
        name: 'Analyze Culture Fit',
        message: 'Analyze if this company is a good culture fit based on: {{companyInfo}}'
      }
    },
    {
      id: 'file-write-1',
      type: 'FILE_WRITE',
      position: { x: 100, y: 400 },
      config: {
        name: 'Save Research Report',
        filename: '{{companyName}}_research.md',
        content: '# {{companyName}} Research\n\n{{companyInfo}}\n\n## Culture Fit Analysis\n{{cultureFitAnalysis}}'
      }
    },
    {
      id: 'notification-1',
      type: 'NOTIFICATION_SEND',
      position: { x: 100, y: 500 },
      config: {
        name: 'Notify User',
        title: 'Research Complete',
        message: 'Company research for {{companyName}} is ready!'
      }
    }
  ],
  connections: [
    { from: 'trigger-1', to: 'company-research-1' },
    { from: 'company-research-1', to: 'ai-chat-1' },
    { from: 'ai-chat-1', to: 'file-write-1' },
    { from: 'file-write-1', to: 'notification-1' }
  ]
};

/**
 * Seed workflow templates into database
 */
async function seedWorkflowTemplates() {
  try {
    logger.info('Seeding workflow templates...');

    const templates = [
      aiJobApplicationTemplate,
      bulkJobApplicationTemplate,
      dailyJobSearchTemplate,
      applicationFollowUpTemplate,
      companyResearchTemplate
    ];

    // Create a system user for templates if needed
    let systemUser = await prisma.user.findFirst({
      where: { email: 'system@rolerabbit.com' }
    });

    if (!systemUser) {
      logger.info('Creating system user for templates...');
      systemUser = await prisma.user.create({
        data: {
          email: 'system@rolerabbit.com',
          name: 'System',
          password: 'N/A', // System user doesn't need login
          emailVerified: true
        }
      });
    }

    for (const template of templates) {
      // Check if template already exists
      const existing = await prisma.workflow.findFirst({
        where: {
          name: template.name,
          isTemplate: true
        }
      });

      if (existing) {
        logger.info(`Template "${template.name}" already exists, skipping...`);
        continue;
      }

      // Create template
      await prisma.workflow.create({
        data: {
          ...template,
          userId: systemUser.id,
          status: 'ACTIVE'
        }
      });

      logger.info(`✅ Created template: ${template.name}`);
    }

    logger.info('✅ Workflow templates seeded successfully');
    return { success: true, count: templates.length };
  } catch (error) {
    logger.error('Failed to seed workflow templates', { error: error.message });
    throw error;
  }
}

/**
 * Get all templates grouped by category
 */
async function getTemplatesByCategory() {
  try {
    const templates = await prisma.workflow.findMany({
      where: { isTemplate: true },
      orderBy: { totalExecutions: 'desc' }
    });

    // Group by category
    const grouped = templates.reduce((acc, template) => {
      const category = template.templateCategory || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {});

    return grouped;
  } catch (error) {
    logger.error('Failed to get templates by category', { error: error.message });
    throw error;
  }
}

module.exports = {
  seedWorkflowTemplates,
  getTemplatesByCategory,
  templates: {
    aiJobApplicationTemplate,
    bulkJobApplicationTemplate,
    dailyJobSearchTemplate,
    applicationFollowUpTemplate,
    companyResearchTemplate
  }
};
