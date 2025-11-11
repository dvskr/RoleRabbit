const BaseNode = require('./baseNode');

// Resume Node
class ResumeNode extends BaseNode {
  constructor(mode = 'generate') { super('RESUME', mode); }
  async execute(node, input) {
    return { resumeId: 'resume_' + Date.now(), generated: true };
  }
}

// Cover Letter Node
class CoverLetterNode extends BaseNode {
  constructor() { super('COVER_LETTER'); }
  async execute(node, input) {
    return { coverLetterId: 'cover_' + Date.now(), generated: true };
  }
}

// Job Tracker Node
class JobTrackerNode extends BaseNode {
  constructor(mode = 'add') { super('JOB_TRACKER', mode); }
  async execute(node, input) {
    return { trackerId: 'tracker_' + Date.now(), added: true };
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
  JobTrackerNode,
  JobSearchNode,
  EmailNode,
  ConditionNode,
  LoopNode,
  WaitNode,
  DataNode,
  WebhookNode
};
