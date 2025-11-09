const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const resumeParseDuration = new client.Histogram({
  name: 'rolerabbit_resume_parse_duration_seconds',
  help: 'Duration of resume parsing operations',
  labelNames: ['method', 'source'],
  buckets: [0.25, 0.5, 1, 2, 3, 5, 8, 13]
});

const resumeParseFailures = new client.Counter({
  name: 'rolerabbit_resume_parse_failures_total',
  help: 'Total number of resume parsing failures',
  labelNames: ['method', 'source', 'reason']
});

const aiActionCounter = new client.Counter({
  name: 'rolerabbit_ai_actions_total',
  help: 'Count of AI actions invoked',
  labelNames: ['action', 'tier']
});

const aiActionLatency = new client.Histogram({
  name: 'rolerabbit_ai_action_duration_seconds',
  help: 'Duration of AI actions including third-party calls',
  labelNames: ['action', 'model'],
  buckets: [0.5, 1, 2, 3, 5, 8, 13, 21]
});

const atsScoreCounter = new client.Counter({
  name: 'rolerabbit_ats_checks_total',
  help: 'Total ATS checks run',
  labelNames: ['result_bucket']
});

const atsScoreGauge = new client.Gauge({
  name: 'rolerabbit_last_ats_score',
  help: 'Most recent ATS score per user/resume/job hash',
  labelNames: ['userId', 'resumeId']
});

register.registerMetric(resumeParseDuration);
register.registerMetric(resumeParseFailures);
register.registerMetric(aiActionCounter);
register.registerMetric(aiActionLatency);
register.registerMetric(atsScoreCounter);
register.registerMetric(atsScoreGauge);

module.exports = {
  register,
  resumeParseDuration,
  resumeParseFailures,
  aiActionCounter,
  aiActionLatency,
  atsScoreCounter,
  atsScoreGauge
};
