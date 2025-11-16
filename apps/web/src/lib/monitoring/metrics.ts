/**
 * Prometheus Metrics Service (Section 4.6)
 *
 * Collects and exposes metrics for portfolio operations
 */

import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

/**
 * Metrics service class
 */
export class MetricsService {
  private static instance: MetricsService;
  public registry: Registry;

  // Portfolio metrics
  public portfolioCreationsTotal: Counter;
  public portfolioDeploymentsTotal: Counter;
  public portfolioBuildDuration: Histogram;
  public portfolioViewsTotal: Counter;
  public portfolioDeletesTotal: Counter;
  public portfolioUpdatesTotal: Counter;

  // Deployment metrics
  public deploymentSuccessTotal: Counter;
  public deploymentFailureTotal: Counter;
  public deploymentDurationSeconds: Histogram;
  public deploymentQueueLength: Gauge;

  // PDF generation metrics
  public pdfGenerationTotal: Counter;
  public pdfGenerationDuration: Histogram;
  public pdfQueueLength: Gauge;

  // API metrics
  public httpRequestsTotal: Counter;
  public httpRequestDuration: Histogram;
  public httpRequestsInFlight: Gauge;

  // Database metrics
  public databaseConnectionsActive: Gauge;
  public databaseConnectionsIdle: Gauge;
  public databaseQueryDuration: Histogram;
  public databaseQueryErrors: Counter;

  // Queue metrics
  public queueJobsCompleted: Counter;
  public queueJobsFailed: Counter;
  public queueJobDuration: Histogram;
  public queueJobsWaiting: Gauge;

  // Storage metrics
  public storageUploadsTotal: Counter;
  public storageUploadDuration: Histogram;
  public storageUploadSize: Histogram;

  // CDN metrics
  public cdnInvalidationsTotal: Counter;
  public cdnInvalidationDuration: Histogram;

  // DNS metrics
  public dnsRecordsCreated: Counter;
  public dnsRecordsDeleted: Counter;
  public dnsOperationDuration: Histogram;

  // SSL metrics
  public sslCertificatesProvisioned: Counter;
  public sslCertificatesRenewed: Counter;
  public sslProvisioningDuration: Histogram;

  // Error metrics
  public errorsTotal: Counter;

  private constructor() {
    this.registry = new Registry();

    // Collect default metrics (CPU, memory, etc.)
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'rolerabbit_',
      gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    });

    // Portfolio metrics
    this.portfolioCreationsTotal = new Counter({
      name: 'rolerabbit_portfolio_creations_total',
      help: 'Total number of portfolios created',
      labelNames: ['template', 'user_tier'],
      registers: [this.registry],
    });

    this.portfolioDeploymentsTotal = new Counter({
      name: 'rolerabbit_portfolio_deployments_total',
      help: 'Total number of portfolio deployments',
      labelNames: ['status', 'template'],
      registers: [this.registry],
    });

    this.portfolioBuildDuration = new Histogram({
      name: 'rolerabbit_portfolio_build_duration_seconds',
      help: 'Portfolio build duration in seconds',
      labelNames: ['template', 'status'],
      buckets: [1, 5, 10, 30, 60, 120, 300],
      registers: [this.registry],
    });

    this.portfolioViewsTotal = new Counter({
      name: 'rolerabbit_portfolio_views_total',
      help: 'Total number of portfolio views',
      labelNames: ['portfolio_id', 'subdomain'],
      registers: [this.registry],
    });

    this.portfolioDeletesTotal = new Counter({
      name: 'rolerabbit_portfolio_deletes_total',
      help: 'Total number of portfolios deleted',
      labelNames: ['reason'],
      registers: [this.registry],
    });

    this.portfolioUpdatesTotal = new Counter({
      name: 'rolerabbit_portfolio_updates_total',
      help: 'Total number of portfolio updates',
      labelNames: ['update_type'],
      registers: [this.registry],
    });

    // Deployment metrics
    this.deploymentSuccessTotal = new Counter({
      name: 'rolerabbit_deployment_success_total',
      help: 'Total number of successful deployments',
      labelNames: ['template'],
      registers: [this.registry],
    });

    this.deploymentFailureTotal = new Counter({
      name: 'rolerabbit_deployment_failure_total',
      help: 'Total number of failed deployments',
      labelNames: ['error_type', 'template'],
      registers: [this.registry],
    });

    this.deploymentDurationSeconds = new Histogram({
      name: 'rolerabbit_deployment_duration_seconds',
      help: 'Deployment duration in seconds',
      labelNames: ['status', 'template'],
      buckets: [10, 30, 60, 120, 300, 600],
      registers: [this.registry],
    });

    this.deploymentQueueLength = new Gauge({
      name: 'rolerabbit_deployment_queue_length',
      help: 'Number of deployments waiting in queue',
      registers: [this.registry],
    });

    // PDF generation metrics
    this.pdfGenerationTotal = new Counter({
      name: 'rolerabbit_pdf_generation_total',
      help: 'Total number of PDFs generated',
      labelNames: ['status', 'format'],
      registers: [this.registry],
    });

    this.pdfGenerationDuration = new Histogram({
      name: 'rolerabbit_pdf_generation_duration_seconds',
      help: 'PDF generation duration in seconds',
      labelNames: ['format'],
      buckets: [1, 2, 5, 10, 20, 30],
      registers: [this.registry],
    });

    this.pdfQueueLength = new Gauge({
      name: 'rolerabbit_pdf_queue_length',
      help: 'Number of PDF generation jobs waiting in queue',
      registers: [this.registry],
    });

    // API metrics
    this.httpRequestsTotal = new Counter({
      name: 'rolerabbit_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'rolerabbit_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.httpRequestsInFlight = new Gauge({
      name: 'rolerabbit_http_requests_in_flight',
      help: 'Number of HTTP requests currently being processed',
      registers: [this.registry],
    });

    // Database metrics
    this.databaseConnectionsActive = new Gauge({
      name: 'rolerabbit_database_connections_active',
      help: 'Number of active database connections',
      registers: [this.registry],
    });

    this.databaseConnectionsIdle = new Gauge({
      name: 'rolerabbit_database_connections_idle',
      help: 'Number of idle database connections',
      registers: [this.registry],
    });

    this.databaseQueryDuration = new Histogram({
      name: 'rolerabbit_database_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.registry],
    });

    this.databaseQueryErrors = new Counter({
      name: 'rolerabbit_database_query_errors_total',
      help: 'Total number of database query errors',
      labelNames: ['operation', 'error_type'],
      registers: [this.registry],
    });

    // Queue metrics
    this.queueJobsCompleted = new Counter({
      name: 'rolerabbit_queue_jobs_completed_total',
      help: 'Total number of completed queue jobs',
      labelNames: ['queue', 'job_name'],
      registers: [this.registry],
    });

    this.queueJobsFailed = new Counter({
      name: 'rolerabbit_queue_jobs_failed_total',
      help: 'Total number of failed queue jobs',
      labelNames: ['queue', 'job_name', 'error_type'],
      registers: [this.registry],
    });

    this.queueJobDuration = new Histogram({
      name: 'rolerabbit_queue_job_duration_seconds',
      help: 'Queue job duration in seconds',
      labelNames: ['queue', 'job_name'],
      buckets: [1, 5, 10, 30, 60, 120, 300],
      registers: [this.registry],
    });

    this.queueJobsWaiting = new Gauge({
      name: 'rolerabbit_queue_jobs_waiting',
      help: 'Number of jobs waiting in queue',
      labelNames: ['queue'],
      registers: [this.registry],
    });

    // Storage metrics
    this.storageUploadsTotal = new Counter({
      name: 'rolerabbit_storage_uploads_total',
      help: 'Total number of file uploads',
      labelNames: ['provider', 'file_type'],
      registers: [this.registry],
    });

    this.storageUploadDuration = new Histogram({
      name: 'rolerabbit_storage_upload_duration_seconds',
      help: 'Storage upload duration in seconds',
      labelNames: ['provider'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    this.storageUploadSize = new Histogram({
      name: 'rolerabbit_storage_upload_size_bytes',
      help: 'Storage upload size in bytes',
      labelNames: ['provider', 'file_type'],
      buckets: [1024, 10240, 102400, 1048576, 10485760, 104857600],
      registers: [this.registry],
    });

    // CDN metrics
    this.cdnInvalidationsTotal = new Counter({
      name: 'rolerabbit_cdn_invalidations_total',
      help: 'Total number of CDN cache invalidations',
      labelNames: ['provider', 'status'],
      registers: [this.registry],
    });

    this.cdnInvalidationDuration = new Histogram({
      name: 'rolerabbit_cdn_invalidation_duration_seconds',
      help: 'CDN invalidation duration in seconds',
      labelNames: ['provider'],
      buckets: [1, 5, 10, 30, 60, 120],
      registers: [this.registry],
    });

    // DNS metrics
    this.dnsRecordsCreated = new Counter({
      name: 'rolerabbit_dns_records_created_total',
      help: 'Total number of DNS records created',
      labelNames: ['provider', 'record_type'],
      registers: [this.registry],
    });

    this.dnsRecordsDeleted = new Counter({
      name: 'rolerabbit_dns_records_deleted_total',
      help: 'Total number of DNS records deleted',
      labelNames: ['provider', 'record_type'],
      registers: [this.registry],
    });

    this.dnsOperationDuration = new Histogram({
      name: 'rolerabbit_dns_operation_duration_seconds',
      help: 'DNS operation duration in seconds',
      labelNames: ['provider', 'operation'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    // SSL metrics
    this.sslCertificatesProvisioned = new Counter({
      name: 'rolerabbit_ssl_certificates_provisioned_total',
      help: 'Total number of SSL certificates provisioned',
      labelNames: ['provider'],
      registers: [this.registry],
    });

    this.sslCertificatesRenewed = new Counter({
      name: 'rolerabbit_ssl_certificates_renewed_total',
      help: 'Total number of SSL certificates renewed',
      labelNames: ['provider'],
      registers: [this.registry],
    });

    this.sslProvisioningDuration = new Histogram({
      name: 'rolerabbit_ssl_provisioning_duration_seconds',
      help: 'SSL certificate provisioning duration in seconds',
      labelNames: ['provider'],
      buckets: [10, 30, 60, 120, 300, 600],
      registers: [this.registry],
    });

    // Error metrics
    this.errorsTotal = new Counter({
      name: 'rolerabbit_errors_total',
      help: 'Total number of errors',
      labelNames: ['type', 'severity', 'component'],
      registers: [this.registry],
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  /**
   * Get metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Get metrics as JSON
   */
  async getMetricsJSON(): Promise<any> {
    return this.registry.getMetricsAsJSON();
  }

  /**
   * Reset all metrics (for testing)
   */
  resetMetrics(): void {
    this.registry.resetMetrics();
  }

  /**
   * Record portfolio creation
   */
  recordPortfolioCreation(template: string, userTier: string = 'free'): void {
    this.portfolioCreationsTotal.inc({ template, user_tier: userTier });
  }

  /**
   * Record portfolio deployment
   */
  recordPortfolioDeployment(status: 'success' | 'failure', template: string): void {
    this.portfolioDeploymentsTotal.inc({ status, template });

    if (status === 'success') {
      this.deploymentSuccessTotal.inc({ template });
    } else {
      this.deploymentFailureTotal.inc({ error_type: 'unknown', template });
    }
  }

  /**
   * Record portfolio build duration
   */
  recordPortfolioBuildDuration(durationSeconds: number, template: string, status: string): void {
    this.portfolioBuildDuration.observe({ template, status }, durationSeconds);
  }

  /**
   * Record portfolio view
   */
  recordPortfolioView(portfolioId: string, subdomain: string): void {
    this.portfolioViewsTotal.inc({ portfolio_id: portfolioId, subdomain });
  }

  /**
   * Record HTTP request
   */
  recordHttpRequest(method: string, route: string, statusCode: number, durationSeconds: number): void {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode.toString() },
      durationSeconds
    );
  }

  /**
   * Increment in-flight requests
   */
  incrementInFlightRequests(): void {
    this.httpRequestsInFlight.inc();
  }

  /**
   * Decrement in-flight requests
   */
  decrementInFlightRequests(): void {
    this.httpRequestsInFlight.dec();
  }

  /**
   * Update database connection metrics
   */
  updateDatabaseConnections(active: number, idle: number): void {
    this.databaseConnectionsActive.set(active);
    this.databaseConnectionsIdle.set(idle);
  }

  /**
   * Record database query
   */
  recordDatabaseQuery(operation: string, table: string, durationSeconds: number): void {
    this.databaseQueryDuration.observe({ operation, table }, durationSeconds);
  }

  /**
   * Record queue job completion
   */
  recordQueueJobCompletion(queue: string, jobName: string, durationSeconds: number): void {
    this.queueJobsCompleted.inc({ queue, job_name: jobName });
    this.queueJobDuration.observe({ queue, job_name: jobName }, durationSeconds);
  }

  /**
   * Record queue job failure
   */
  recordQueueJobFailure(queue: string, jobName: string, errorType: string): void {
    this.queueJobsFailed.inc({ queue, job_name: jobName, error_type: errorType });
  }

  /**
   * Update queue length
   */
  updateQueueLength(queue: string, length: number): void {
    this.queueJobsWaiting.set({ queue }, length);
  }

  /**
   * Record error
   */
  recordError(type: string, severity: 'low' | 'medium' | 'high' | 'critical', component: string): void {
    this.errorsTotal.inc({ type, severity, component });
  }
}

/**
 * Export singleton instance
 */
export const metrics = MetricsService.getInstance();
