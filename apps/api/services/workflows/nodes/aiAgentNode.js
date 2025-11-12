/**
 * AI Agent Node
 * Executes AI Agent tasks within workflows
 */

const BaseNode = require('./baseNode');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const aiService = require('../../aiService');
const aiAgentService = require('../../aiAgentService');
const logger = require('../../../utils/logger');

class AIAgentNode extends BaseNode {
  constructor(mode = 'analyze') {
    super('AI_AGENT', mode);
    this.mode = mode; // 'analyze' or 'chat'
  }

  async execute(node, input, context) {
    const config = node.config || {};

    if (this.mode === 'analyze') {
      return await this.analyzeJob(input, config, context);
    } else {
      return await this.chat(input, config, context);
    }
  }

  async analyzeJob(input, config, context) {
    try {
      // Get job details from input
      const jobUrl = this.getValue(input, config.jobUrlPath || 'jobUrl');
      const jobTitle = this.getValue(input, config.jobTitlePath || 'jobTitle');
      const jobDescription = this.getValue(input, config.jobDescriptionPath || 'jobDescription');

      if (!jobUrl && !jobDescription) {
        throw new Error('Job URL or description required');
      }

      logger.info('AI Agent analyze node executing', {
        userId: context.userId,
        jobTitle,
        hasJobDescription: !!jobDescription
      });

      // Use AI service directly for analysis
      // This is a synchronous operation that doesn't need background processing
      const jdAnalysis = await aiService.analyzeJobDescription(jobDescription);

      // Extract key information
      const keywords = jdAnalysis.keywords || [];
      const requiredSkills = jdAnalysis.requiredSkills || [];
      const preferredSkills = jdAnalysis.preferredSkills || [];
      const experienceLevel = jdAnalysis.experienceLevel || 'Mid-Level';
      const salaryRange = jdAnalysis.salaryRange || null;

      // Calculate a match score (1-10) based on analysis
      // This is a simplified scoring - in production, you'd compare with user's resume
      const score = Math.min(10, Math.max(1, Math.round(keywords.length / 2 + 5)));
      const match = score >= (config.minScore || 7);

      logger.info('Job analysis completed', {
        score,
        match,
        keywordsFound: keywords.length
      });

      // Return real analysis results
      const analysis = {
        score,
        match,
        jobTitle,
        company: this.getValue(input, config.companyPath || 'company') || 'Unknown',
        qualifications: {
          required: requiredSkills,
          preferred: preferredSkills,
          experienceLevel
        },
        keywords,
        recommendation: match
          ? 'Good match - consider applying'
          : 'May not be the best fit - review requirements carefully',
        salary: salaryRange
          ? {
              estimated: salaryRange,
              match: true
            }
          : null,
        analysisDetails: jdAnalysis
      };

      return analysis;
    } catch (error) {
      logger.error('AI Agent analyze node failed', { error: error.message });
      throw error;
    }
  }

  async chat(input, config, context) {
    try {
      const message = this.getValue(input, config.messagePath || 'message');

      if (!message) {
        throw new Error('Message is required for chat');
      }

      logger.info('AI Agent chat node executing', {
        userId: context.userId,
        messageLength: message.length
      });

      // Use the real chat service
      const result = await aiAgentService.sendChatMessage(context.userId, message);

      logger.info('AI Agent chat completed', {
        userId: context.userId,
        responseLength: result.message.length
      });

      return {
        conversationId: result.conversation.id,
        response: result.message,
        message,
        suggestedActions: result.suggestedActions || []
      };
    } catch (error) {
      logger.error('AI Agent chat node failed', { error: error.message });
      throw error;
    }
  }

  getMetadata() {
    return {
      type: 'AI_AGENT',
      subtype: this.mode,
      name: this.mode === 'analyze' ? 'AI Job Analyzer' : 'AI Chat',
      description: this.mode === 'analyze'
        ? 'Analyze job posting and determine fit'
        : 'Chat with AI agent',
      icon: 'sparkles',
      color: '#a855f7',
      inputs: [
        { name: 'jobUrl', type: 'string', required: this.mode === 'analyze' },
        { name: 'jobDescription', type: 'string' },
        { name: 'message', type: 'string', required: this.mode === 'chat' }
      ],
      outputs: [
        { name: 'score', type: 'number' },
        { name: 'match', type: 'boolean' },
        { name: 'recommendation', type: 'string' }
      ],
      config: [
        { name: 'minScore', type: 'number', label: 'Minimum Score', default: 7 },
        { name: 'analyzeDepth', type: 'select', options: ['quick', 'detailed'], default: 'quick' }
      ]
    };
  }
}

module.exports = AIAgentNode;
