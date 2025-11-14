/**
 * OpenTelemetry Distributed Tracing Configuration
 * Provides end-to-end request tracing across all services
 */

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

// Resource identification
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'rolerabbit-api',
  [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.ENVIRONMENT || 'production',
  [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.HOSTNAME || 'unknown',
});

// Trace exporters
const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://jaeger:4318/v1/traces',
  headers: {},
});

// Alternative: Jaeger exporter
const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || 'http://jaeger:14268/api/traces',
  tags: [],
  serviceName: 'rolerabbit-api',
});

// Metric exporters
const prometheusExporter = new PrometheusExporter(
  {
    port: 9464,
    endpoint: '/metrics',
  },
  () => {
    console.log('Prometheus scrape endpoint: http://localhost:9464/metrics');
  }
);

const otlpMetricExporter = new OTLPMetricExporter({
  url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://jaeger:4318/v1/metrics',
});

// SDK configuration
const sdk = new NodeSDK({
  resource,
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: prometheusExporter,
    exportIntervalMillis: 10000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // HTTP instrumentation
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        ignoreIncomingPaths: ['/health', '/metrics'],
        requestHook: (span, request) => {
          span.setAttribute('custom.request.path', request.url);
        },
      },
      // Express instrumentation
      '@opentelemetry/instrumentation-express': {
        enabled: true,
      },
      // PostgreSQL instrumentation
      '@opentelemetry/instrumentation-pg': {
        enabled: true,
        enhancedDatabaseReporting: true,
      },
      // Redis instrumentation
      '@opentelemetry/instrumentation-redis': {
        enabled: true,
      },
      // DNS instrumentation
      '@opentelemetry/instrumentation-dns': {
        enabled: true,
        ignoreHostnames: ['localhost'],
      },
      // File system instrumentation
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Can be noisy
      },
    }),
  ],
});

// Start SDK
sdk.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('OpenTelemetry SDK shut down'))
    .catch((error) => console.error('Error shutting down OpenTelemetry SDK', error))
    .finally(() => process.exit(0));
});

// Export for custom instrumentation
const { trace, context, propagation } = require('@opentelemetry/api');

/**
 * Custom tracer for application-specific spans
 */
const tracer = trace.getTracer('rolerabbit-api', process.env.APP_VERSION || '1.0.0');

/**
 * Create a custom span
 */
function createSpan(name, attributes = {}) {
  return tracer.startSpan(name, {
    attributes: {
      ...attributes,
      'service.name': 'rolerabbit-api',
    },
  });
}

/**
 * Trace a function execution
 */
async function traceFunction(name, fn, attributes = {}) {
  const span = createSpan(name, attributes);

  try {
    const result = await fn();
    span.setStatus({ code: 1 }); // OK
    return result;
  } catch (error) {
    span.recordException(error);
    span.setStatus({
      code: 2, // ERROR
      message: error.message,
    });
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Trace middleware for Express
 */
function traceMiddleware() {
  return (req, res, next) => {
    const span = tracer.startSpan(`${req.method} ${req.route?.path || req.path}`, {
      attributes: {
        'http.method': req.method,
        'http.url': req.url,
        'http.target': req.path,
        'http.host': req.hostname,
        'http.scheme': req.protocol,
        'http.user_agent': req.get('user-agent'),
        'http.route': req.route?.path,
      },
    });

    // Inject trace context into response headers
    propagation.inject(context.active(), res.headers);

    // Track response
    res.on('finish', () => {
      span.setAttribute('http.status_code', res.statusCode);

      if (res.statusCode >= 400) {
        span.setStatus({
          code: 2,
          message: `HTTP ${res.statusCode}`,
        });
      }

      span.end();
    });

    next();
  };
}

/**
 * Trace database queries
 */
async function traceQuery(operation, query, params = []) {
  const span = createSpan(`db.${operation}`, {
    'db.system': 'postgresql',
    'db.operation': operation,
    'db.statement': query,
  });

  try {
    const result = await query(params);
    span.setAttribute('db.rows_affected', result.rowCount || 0);
    return result;
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: 2, message: error.message });
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Trace cache operations
 */
async function traceCache(operation, key, fn) {
  const span = createSpan(`cache.${operation}`, {
    'cache.system': 'redis',
    'cache.operation': operation,
    'cache.key': key,
  });

  try {
    const result = await fn();
    span.setAttribute('cache.hit', result !== null);
    return result;
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: 2, message: error.message });
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Trace external HTTP calls
 */
async function traceHttpCall(method, url, fn) {
  const span = createSpan(`http.${method.toLowerCase()}`, {
    'http.method': method,
    'http.url': url,
    'http.type': 'external',
  });

  try {
    const result = await fn();
    span.setAttribute('http.status_code', result.status || result.statusCode);
    return result;
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: 2, message: error.message });
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Add custom event to current span
 */
function addEvent(name, attributes = {}) {
  const currentSpan = trace.getSpan(context.active());
  if (currentSpan) {
    currentSpan.addEvent(name, attributes);
  }
}

/**
 * Add attribute to current span
 */
function setAttribute(key, value) {
  const currentSpan = trace.getSpan(context.active());
  if (currentSpan) {
    currentSpan.setAttribute(key, value);
  }
}

module.exports = {
  tracer,
  createSpan,
  traceFunction,
  traceMiddleware,
  traceQuery,
  traceCache,
  traceHttpCall,
  addEvent,
  setAttribute,
};
