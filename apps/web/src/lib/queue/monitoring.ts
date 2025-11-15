/**
 * Queue Monitoring and Alerts (Section 4.4)
 *
 * Monitors job queues and sends alerts on failures
 */

import { queueManager } from './queues';
import { deploymentProcessor } from './deployment-processor';
import { pdfProcessor } from './pdf-processor';

/**
 * Alert channel type
 */
export type AlertChannel = 'email' | 'slack' | 'webhook';

/**
 * Alert configuration
 */
export interface AlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  email?: {
    to: string[];
    from: string;
  };
  slack?: {
    webhookUrl: string;
    channel?: string;
  };
  webhook?: {
    url: string;
    headers?: Record<string, string>;
  };
}

/**
 * Queue health status
 */
export interface QueueHealthStatus {
  queue: string;
  healthy: boolean;
  stats: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    total: number;
  };
  issues: string[];
}

/**
 * Job failure alert data
 */
export interface JobFailureAlert {
  jobId: string;
  jobName: string;
  queue: string;
  failedAt: Date;
  error: string;
  attemptsMade: number;
  data: any;
}

/**
 * Queue monitoring class
 */
export class QueueMonitor {
  private alertConfig: AlertConfig;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(config?: AlertConfig) {
    this.alertConfig = config || this.getDefaultAlertConfig();
    this.setupFailureListeners();
  }

  /**
   * Get default alert configuration
   */
  private getDefaultAlertConfig(): AlertConfig {
    return {
      enabled: process.env.QUEUE_ALERTS_ENABLED === 'true',
      channels: (process.env.ALERT_CHANNELS?.split(',') as AlertChannel[]) || ['email'],
      email: {
        to: process.env.ALERT_EMAIL_TO?.split(',') || [],
        from: process.env.ALERT_EMAIL_FROM || 'alerts@rolerabbit.com',
      },
      slack: {
        webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
        channel: process.env.SLACK_ALERT_CHANNEL || '#alerts',
      },
      webhook: {
        url: process.env.ALERT_WEBHOOK_URL || '',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    };
  }

  /**
   * Setup failure listeners for all queues
   */
  private setupFailureListeners(): void {
    if (!this.alertConfig.enabled) {
      return;
    }

    // Listen for deployment failures
    deploymentProcessor.getWorker().on('failed', async (job, error) => {
      if (job) {
        await this.sendFailureAlert({
          jobId: job.id || 'unknown',
          jobName: job.name,
          queue: 'deployment',
          failedAt: new Date(),
          error: error.message,
          attemptsMade: job.attemptsMade,
          data: job.data,
        });
      }
    });

    // Listen for PDF generation failures
    pdfProcessor.getWorker().on('failed', async (job, error) => {
      if (job) {
        await this.sendFailureAlert({
          jobId: job.id || 'unknown',
          jobName: job.name,
          queue: 'pdf-generation',
          failedAt: new Date(),
          error: error.message,
          attemptsMade: job.attemptsMade,
          data: job.data,
        });
      }
    });
  }

  /**
   * Send failure alert through configured channels
   */
  private async sendFailureAlert(alert: JobFailureAlert): Promise<void> {
    console.error('Job failure alert:', alert);

    const promises: Promise<void>[] = [];

    if (this.alertConfig.channels.includes('email')) {
      promises.push(this.sendEmailAlert(alert));
    }

    if (this.alertConfig.channels.includes('slack')) {
      promises.push(this.sendSlackAlert(alert));
    }

    if (this.alertConfig.channels.includes('webhook')) {
      promises.push(this.sendWebhookAlert(alert));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(alert: JobFailureAlert): Promise<void> {
    if (!this.alertConfig.email || this.alertConfig.email.to.length === 0) {
      return;
    }

    try {
      // In production, use email service (Resend, SendGrid, SES)
      /*
      import { Resend } from 'resend';
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: this.alertConfig.email.from,
        to: this.alertConfig.email.to,
        subject: `Job Failure: ${alert.queue} - ${alert.jobName}`,
        html: this.formatEmailAlert(alert),
      });
      */

      console.log('Email alert sent to:', this.alertConfig.email.to.join(', '));
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  /**
   * Format email alert HTML
   */
  private formatEmailAlert(alert: JobFailureAlert): string {
    return `
      <h2>Job Failure Alert</h2>
      <p><strong>Queue:</strong> ${alert.queue}</p>
      <p><strong>Job ID:</strong> ${alert.jobId}</p>
      <p><strong>Job Name:</strong> ${alert.jobName}</p>
      <p><strong>Failed At:</strong> ${alert.failedAt.toISOString()}</p>
      <p><strong>Attempts Made:</strong> ${alert.attemptsMade}</p>
      <p><strong>Error:</strong> ${alert.error}</p>
      <h3>Job Data:</h3>
      <pre>${JSON.stringify(alert.data, null, 2)}</pre>
    `;
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(alert: JobFailureAlert): Promise<void> {
    if (!this.alertConfig.slack?.webhookUrl) {
      return;
    }

    try {
      const response = await fetch(this.alertConfig.slack.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: this.alertConfig.slack.channel,
          username: 'RoleRabbit Alerts',
          icon_emoji: ':warning:',
          attachments: [
            {
              color: 'danger',
              title: `Job Failure: ${alert.queue}`,
              fields: [
                {
                  title: 'Job ID',
                  value: alert.jobId,
                  short: true,
                },
                {
                  title: 'Job Name',
                  value: alert.jobName,
                  short: true,
                },
                {
                  title: 'Failed At',
                  value: alert.failedAt.toISOString(),
                  short: true,
                },
                {
                  title: 'Attempts',
                  value: alert.attemptsMade.toString(),
                  short: true,
                },
                {
                  title: 'Error',
                  value: alert.error,
                  short: false,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.statusText}`);
      }

      console.log('Slack alert sent');
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(alert: JobFailureAlert): Promise<void> {
    if (!this.alertConfig.webhook?.url) {
      return;
    }

    try {
      const response = await fetch(this.alertConfig.webhook.url, {
        method: 'POST',
        headers: this.alertConfig.webhook.headers || {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'job.failed',
          timestamp: new Date().toISOString(),
          alert,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.statusText}`);
      }

      console.log('Webhook alert sent');
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  /**
   * Get health status for all queues
   */
  async getHealthStatus(): Promise<QueueHealthStatus[]> {
    const queueNames: Array<'deployment' | 'pdf' | 'ssl' | 'analytics'> = [
      'deployment',
      'pdf',
      'ssl',
      'analytics',
    ];

    const statuses: QueueHealthStatus[] = [];

    for (const queueName of queueNames) {
      const stats = await queueManager.getQueueStats(queueName);
      const issues: string[] = [];

      // Check for issues
      if (stats.failed > 100) {
        issues.push(`High failure count: ${stats.failed}`);
      }

      if (stats.waiting > 1000) {
        issues.push(`High waiting count: ${stats.waiting}`);
      }

      if (stats.active === 0 && stats.waiting > 0) {
        issues.push('No active workers processing waiting jobs');
      }

      statuses.push({
        queue: queueName,
        healthy: issues.length === 0,
        stats,
        issues,
      });
    }

    return statuses;
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks(intervalMs: number = 60000): void {
    if (this.healthCheckInterval) {
      return; // Already started
    }

    this.healthCheckInterval = setInterval(async () => {
      const statuses = await this.getHealthStatus();

      for (const status of statuses) {
        if (!status.healthy) {
          console.warn(`Queue ${status.queue} is unhealthy:`, status.issues);

          // Send alert if configured
          if (this.alertConfig.enabled) {
            await this.sendHealthAlert(status);
          }
        }
      }
    }, intervalMs);
  }

  /**
   * Stop periodic health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  /**
   * Send health alert
   */
  private async sendHealthAlert(status: QueueHealthStatus): Promise<void> {
    if (this.alertConfig.slack?.webhookUrl) {
      try {
        await fetch(this.alertConfig.slack.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: this.alertConfig.slack.channel,
            username: 'RoleRabbit Health Monitor',
            icon_emoji: ':warning:',
            text: `Queue \`${status.queue}\` is unhealthy`,
            attachments: [
              {
                color: 'warning',
                fields: [
                  {
                    title: 'Issues',
                    value: status.issues.join('\n'),
                    short: false,
                  },
                  {
                    title: 'Stats',
                    value: `Waiting: ${status.stats.waiting}\nActive: ${status.stats.active}\nFailed: ${status.stats.failed}`,
                    short: false,
                  },
                ],
              },
            ],
          }),
        });
      } catch (error) {
        console.error('Failed to send health alert:', error);
      }
    }
  }

  /**
   * Get queue metrics for monitoring dashboard
   */
  async getMetrics() {
    const statuses = await this.getHealthStatus();

    return {
      timestamp: new Date().toISOString(),
      queues: statuses.map((status) => ({
        name: status.queue,
        healthy: status.healthy,
        ...status.stats,
      })),
      overall: {
        healthy: statuses.every((s) => s.healthy),
        totalJobs: statuses.reduce((sum, s) => sum + s.stats.total, 0),
        totalFailed: statuses.reduce((sum, s) => sum + s.stats.failed, 0),
      },
    };
  }
}

/**
 * Export singleton instance
 */
export const queueMonitor = new QueueMonitor();

/**
 * Start monitoring by default
 */
if (process.env.NODE_ENV === 'production') {
  queueMonitor.startHealthChecks();
}
