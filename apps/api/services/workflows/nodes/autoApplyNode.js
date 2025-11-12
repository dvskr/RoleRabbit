const BaseNode = require('./baseNode');

class AutoApplyNode extends BaseNode {
  constructor(mode = 'single') {
    super('AUTO_APPLY', mode);
  }

  async execute(node, input, context) {
    const config = node.config || {};
    const jobUrl = this.getValue(input, 'jobUrl');

    return {
      applied: true,
      jobUrl,
      platform: 'LINKEDIN',
      status: 'SUBMITTED',
      applicationId: 'app_' + Date.now()
    };
  }

  getMetadata() {
    return {
      type: 'AUTO_APPLY',
      name: 'Auto Apply to Job',
      icon: 'zap',
      color: '#eab308'
    };
  }
}

module.exports = AutoApplyNode;
