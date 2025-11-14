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

// Template metrics
const templateRequestCounter = new client.Counter({
  name: 'rolerabbit_template_requests_total',
  help: 'Total template API requests',
  labelNames: ['endpoint', 'method', 'status']
});

const templateRequestDuration = new client.Histogram({
  name: 'rolerabbit_template_request_duration_seconds',
  help: 'Duration of template API requests',
  labelNames: ['endpoint', 'method'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

const templateUsageCounter = new client.Counter({
  name: 'rolerabbit_template_usage_total',
  help: 'Total template usage events by action',
  labelNames: ['action', 'templateId', 'category']
});

const templateFavoritesGauge = new client.Gauge({
  name: 'rolerabbit_template_favorites_count',
  help: 'Current number of favorites per template',
  labelNames: ['templateId']
});

const templateErrorCounter = new client.Counter({
  name: 'rolerabbit_template_errors_total',
  help: 'Total template API errors',
  labelNames: ['endpoint', 'error_type']
});

register.registerMetric(resumeParseDuration);
register.registerMetric(resumeParseFailures);
register.registerMetric(aiActionCounter);
register.registerMetric(aiActionLatency);
register.registerMetric(atsScoreCounter);
register.registerMetric(atsScoreGauge);
register.registerMetric(templateRequestCounter);
register.registerMetric(templateRequestDuration);
register.registerMetric(templateUsageCounter);
register.registerMetric(templateFavoritesGauge);
register.registerMetric(templateErrorCounter);

module.exports = {
  register,
  resumeParseDuration,
  resumeParseFailures,
  aiActionCounter,
  aiActionLatency,
  atsScoreCounter,
  atsScoreGauge,
  templateRequestCounter,
  templateRequestDuration,
  templateUsageCounter,
  templateFavoritesGauge,
  templateErrorCounter
};
