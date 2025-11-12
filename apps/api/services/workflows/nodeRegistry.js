/**
 * Node Registry
 * Manages all workflow node types and their executors
 */

const AIAgentNode = require('./nodes/aiAgentNode');
const AutoApplyNode = require('./nodes/autoApplyNode');
const {
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
} = require('./nodes/stubNodes');

class NodeRegistry {
  constructor() {
    this.nodeExecutors = new Map();
    this._registerDefaultNodes();
  }

  /**
   * Register all default node types
   */
  _registerDefaultNodes() {
    // Triggers (don't need executors, handled by workflow engine)
    this.register('TRIGGER_MANUAL', { execute: async () => ({}) });
    this.register('TRIGGER_SCHEDULE', { execute: async () => ({}) });
    this.register('TRIGGER_WEBHOOK', { execute: async () => ({}) });
    this.register('TRIGGER_EVENT', { execute: async () => ({}) });

    // AI Agents
    this.register('AI_AGENT_ANALYZE', new AIAgentNode('analyze'));
    this.register('AI_AGENT_CHAT', new AIAgentNode('chat'));

    // Auto Apply
    this.register('AUTO_APPLY_SINGLE', new AutoApplyNode('single'));
    this.register('AUTO_APPLY_BULK', new AutoApplyNode('bulk'));

    // Resume
    this.register('RESUME_GENERATE', new ResumeNode('generate'));
    this.register('RESUME_TAILOR', new ResumeNode('tailor'));

    // Cover Letter
    this.register('COVER_LETTER_GENERATE', new CoverLetterNode());

    // Job Tracker
    this.register('JOB_TRACKER_ADD', new JobTrackerNode('add'));
    this.register('JOB_TRACKER_UPDATE', new JobTrackerNode('update'));

    // Job Search
    this.register('JOB_SEARCH', new JobSearchNode());
    this.register('COMPANY_RESEARCH', new CompanyResearchNode());

    // Communication
    this.register('EMAIL_SEND', new EmailNode());
    this.register('NOTIFICATION_SEND', new EmailNode('notification'));
    this.register('WEBHOOK_CALL', new WebhookNode());
    this.register('HTTP_REQUEST', new WebhookNode('http'));

    // Logic
    this.register('CONDITION_IF', new ConditionNode('if'));
    this.register('CONDITION_SWITCH', new ConditionNode('switch'));
    this.register('LOOP_FOR_EACH', new LoopNode());

    // Timing
    this.register('WAIT_DELAY', new WaitNode('delay'));
    this.register('WAIT_UNTIL', new WaitNode('until'));

    // Data Manipulation
    this.register('MERGE_DATA', new DataNode('merge'));
    this.register('SPLIT_DATA', new DataNode('split'));
    this.register('TRANSFORM_DATA', new DataNode('transform'));
    this.register('FILTER_DATA', new DataNode('filter'));

    // Storage
    this.register('DATABASE_QUERY', new DataNode('query'));
    this.register('FILE_READ', new DataNode('fileRead'));
    this.register('FILE_WRITE', new DataNode('fileWrite'));
  }

  /**
   * Register a node executor
   */
  register(nodeType, executor) {
    this.nodeExecutors.set(nodeType, executor);
  }

  /**
   * Get node executor by type
   */
  getNodeExecutor(nodeType) {
    return this.nodeExecutors.get(nodeType);
  }

  /**
   * Get all registered node types
   */
  getAllNodeTypes() {
    return Array.from(this.nodeExecutors.keys());
  }

  /**
   * Get node metadata (for UI)
   */
  getNodeMetadata(nodeType) {
    const executor = this.nodeExecutors.get(nodeType);
    if (!executor || !executor.getMetadata) {
      return this._getDefaultMetadata(nodeType);
    }
    return executor.getMetadata();
  }

  /**
   * Get default metadata for a node type
   */
  _getDefaultMetadata(nodeType) {
    const category = nodeType.split('_')[0];

    const metadata = {
      type: nodeType,
      category,
      name: nodeType.split('_').map(w =>
        w.charAt(0) + w.slice(1).toLowerCase()
      ).join(' '),
      description: `Execute ${nodeType}`,
      icon: this._getDefaultIcon(category),
      color: this._getDefaultColor(category),
      inputs: [{ name: 'input', type: 'any' }],
      outputs: [{ name: 'output', type: 'any' }],
      config: []
    };

    return metadata;
  }

  /**
   * Get default icon for category
   */
  _getDefaultIcon(category) {
    const icons = {
      TRIGGER: 'zap',
      AI: 'sparkles',
      AUTO: 'zap',
      RESUME: 'file-text',
      COVER: 'file-text',
      JOB: 'briefcase',
      COMPANY: 'building',
      EMAIL: 'mail',
      NOTIFICATION: 'bell',
      WEBHOOK: 'webhook',
      HTTP: 'globe',
      CONDITION: 'git-branch',
      LOOP: 'repeat',
      WAIT: 'clock',
      MERGE: 'merge',
      SPLIT: 'split',
      TRANSFORM: 'wand',
      FILTER: 'filter',
      DATABASE: 'database',
      FILE: 'file'
    };

    return icons[category] || 'box';
  }

  /**
   * Get default color for category
   */
  _getDefaultColor(category) {
    const colors = {
      TRIGGER: '#22c55e',  // green
      AI: '#a855f7',       // purple
      AUTO: '#eab308',     // yellow
      RESUME: '#3b82f6',   // blue
      COVER: '#3b82f6',    // blue
      JOB: '#14b8a6',      // teal
      COMPANY: '#f97316',  // orange
      EMAIL: '#ef4444',    // red
      NOTIFICATION: '#f59e0b', // amber
      WEBHOOK: '#8b5cf6',  // violet
      HTTP: '#06b6d4',     // cyan
      CONDITION: '#ec4899', // pink
      LOOP: '#84cc16',     // lime
      WAIT: '#6366f1',     // indigo
      MERGE: '#10b981',    // emerald
      SPLIT: '#f43f5e',    // rose
      TRANSFORM: '#8b5cf6',// violet
      FILTER: '#06b6d4',   // cyan
      DATABASE: '#64748b', // slate
      FILE: '#78716c'      // stone
    };

    return colors[category] || '#6b7280';
  }
}

module.exports = NodeRegistry;
