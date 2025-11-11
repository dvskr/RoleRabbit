/**
 * AI Agent Node
 * Executes AI Agent tasks within workflows
 */

const BaseNode = require('./baseNode');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    // Get job details from input
    const jobUrl = this.getValue(input, config.jobUrlPath || 'jobUrl');
    const jobTitle = this.getValue(input, config.jobTitlePath || 'jobTitle');
    const jobDescription = this.getValue(input, config.jobDescriptionPath || 'jobDescription');

    if (!jobUrl && !jobDescription) {
      throw new Error('Job URL or description required');
    }

    // Create AI Agent task
    const task = await prisma.aIAgentTask.create({
      data: {
        userId: context.userId,
        type: 'JOB_APPLICATION',
        status: 'QUEUED',
        input: {
          jobUrl,
          jobTitle,
          jobDescription,
          action: 'analyze'
        }
      }
    });

    // For now, return a mock analysis (in production, this would call the AI service)
    const analysis = {
      taskId: task.id,
      score: 8, // 1-10
      match: true,
      qualifications: {
        met: ['React', 'Node.js', 'TypeScript'],
        missing: ['AWS', 'Docker']
      },
      recommendation: 'Good match - apply immediately',
      salary: {
        estimated: '$120,000 - $150,000',
        match: true
      }
    };

    return analysis;
  }

  async chat(input, config, context) {
    const message = this.getValue(input, config.messagePath || 'message');
    const conversationId = this.getValue(input, config.conversationIdPath);

    // Create or get conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.aIAgentConversation.findUnique({
        where: { id: conversationId }
      });
    } else {
      conversation = await prisma.aIAgentConversation.create({
        data: {
          userId: context.userId,
          messages: [],
          isActive: true
        }
      });
    }

    // Mock response
    return {
      conversationId: conversation.id,
      response: `AI Agent response to: ${message}`,
      message
    };
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
