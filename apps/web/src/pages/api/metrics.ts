/**
 * Prometheus Metrics Endpoint (Section 4.6)
 *
 * Exposes metrics in Prometheus format for scraping
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { metrics } from '../../lib/monitoring/metrics';
import { queueManager } from '../../lib/queue/queues';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  // Optional: Add authentication for metrics endpoint
  const authToken = req.headers.authorization;
  const expectedToken = process.env.METRICS_AUTH_TOKEN;

  if (expectedToken && authToken !== `Bearer ${expectedToken}`) {
    return res.status(401).send('Unauthorized');
  }

  try {
    // Update queue metrics before exposing
    await updateQueueMetrics();

    // Get metrics in Prometheus format
    const metricsText = await metrics.getMetrics();

    // Set content type for Prometheus
    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    res.status(200).send(metricsText);
  } catch (error) {
    console.error('Failed to generate metrics:', error);
    res.status(500).send('Internal server error');
  }
}

/**
 * Update queue metrics from current queue state
 */
async function updateQueueMetrics() {
  try {
    // Update deployment queue metrics
    const deploymentStats = await queueManager.getQueueStats('deployment');
    metrics.updateQueueLength('deployment', deploymentStats.waiting);
    metrics.deploymentQueueLength.set(deploymentStats.waiting);

    // Update PDF queue metrics
    const pdfStats = await queueManager.getQueueStats('pdf');
    metrics.updateQueueLength('pdf-generation', pdfStats.waiting);
    metrics.pdfQueueLength.set(pdfStats.waiting);

    // Update SSL queue metrics
    const sslStats = await queueManager.getQueueStats('ssl');
    metrics.updateQueueLength('ssl-provisioning', sslStats.waiting);

    // Update analytics queue metrics
    const analyticsStats = await queueManager.getQueueStats('analytics');
    metrics.updateQueueLength('analytics-aggregation', analyticsStats.waiting);
  } catch (error) {
    console.error('Failed to update queue metrics:', error);
  }
}
