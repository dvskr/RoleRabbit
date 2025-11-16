/**
 * Stress Test: Deployment Endpoint (Section 5.6)
 *
 * Queue 50 deployments simultaneously
 * Target: All complete successfully within 10 minutes
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

const deploymentsQueued = new Counter('deployments_queued');
const deploymentsCompleted = new Counter('deployments_completed');
const deploymentsFailed = new Counter('deployments_failed');
const failureRate = new Rate('failed_requests');

export const options = {
  scenarios: {
    deployment_stress: {
      executor: 'shared-iterations',
      vus: 50,               // 50 virtual users
      iterations: 50,        // 50 total iterations (1 per VU)
      maxDuration: '15m',    // Maximum 15 minutes
    },
  },
  thresholds: {
    'deployments_completed': ['count>=50'],      // All 50 should complete
    'deployment_duration': ['p(95)<600000'],     // 95% under 10 minutes
    'failed_requests': ['rate<0.05'],            // Less than 5% failure
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test-token';

// Portfolio IDs to deploy
const PORTFOLIO_IDS = Array.from({ length: 50 }, (_, i) => `portfolio-stress-${i + 1}`);

export function setup() {
  // Create 50 test portfolios before stress test
  console.log('Creating test portfolios...');

  const portfolios = [];

  for (let i = 0; i < 50; i++) {
    const portfolioData = {
      title: `Stress Test Portfolio ${i + 1}`,
      subtitle: 'Load Test',
      templateId: 'template-modern-1',
      subdomain: `stress-test-${i + 1}-${Date.now()}`,
    };

    const response = http.post(
      `${BASE_URL}/api/portfolios`,
      JSON.stringify(portfolioData),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
      }
    );

    if (response.status === 201) {
      const body = JSON.parse(response.body);
      portfolios.push(body.portfolio.id);
    }
  }

  console.log(`Created ${portfolios.length} test portfolios`);
  return { portfolioIds: portfolios };
}

export default function (data) {
  const portfolioId = data.portfolioIds[__VU - 1];

  if (!portfolioId) {
    console.error(`No portfolio ID for VU ${__VU}`);
    return;
  }

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  };

  // Queue deployment
  console.log(`VU ${__VU}: Queueing deployment for ${portfolioId}`);

  const deployStart = Date.now();
  const deployResponse = http.post(
    `${BASE_URL}/api/portfolios/${portfolioId}/deploy`,
    '{}',
    params
  );

  check(deployResponse, {
    'deployment queued': (r) => r.status === 202 || r.status === 200,
  });

  if (deployResponse.status === 202 || deployResponse.status === 200) {
    deploymentsQueued.add(1);

    const body = JSON.parse(deployResponse.body);
    const deploymentId = body.deploymentId;

    // Poll for deployment completion
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes / 5 seconds

    while (attempts < maxAttempts) {
      sleep(5); // Check every 5 seconds

      const statusResponse = http.get(
        `${BASE_URL}/api/portfolios/${portfolioId}/deployments/${deploymentId}`,
        params
      );

      if (statusResponse.status === 200) {
        const status = JSON.parse(statusResponse.body);

        if (status.status === 'completed') {
          const duration = Date.now() - deployStart;
          console.log(`VU ${__VU}: Deployment completed in ${(duration / 1000).toFixed(2)}s`);
          deploymentsCompleted.add(1);

          check(status, {
            'deployment successful': () => status.success === true,
            'completed within 10min': () => duration < 600000,
          });

          return;
        } else if (status.status === 'failed') {
          console.error(`VU ${__VU}: Deployment failed`);
          deploymentsFailed.add(1);
          failureRate.add(1);
          return;
        }
      }

      attempts++;
    }

    console.error(`VU ${__VU}: Deployment timed out after 10 minutes`);
    deploymentsFailed.add(1);
    failureRate.add(1);
  } else {
    console.error(`VU ${__VU}: Failed to queue deployment: ${deployResponse.status}`);
    failureRate.add(1);
  }
}

export function teardown(data) {
  // Clean up test portfolios
  console.log('Cleaning up test portfolios...');

  for (const portfolioId of data.portfolioIds) {
    http.del(
      `${BASE_URL}/api/portfolios/${portfolioId}`,
      null,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
      }
    );
  }

  console.log('Cleanup complete');
}

export function handleSummary(data) {
  const { metrics } = data;

  const summary = `
Deployment Stress Test Results
===============================

Deployments:
  Queued: ${metrics.deployments_queued?.values.count || 0}
  Completed: ${metrics.deployments_completed?.values.count || 0}
  Failed: ${metrics.deployments_failed?.values.count || 0}
  Success Rate: ${((metrics.deployments_completed?.values.count || 0) / 50 * 100).toFixed(2)}%

Time to Complete:
  All 50 deployments within 10 minutes: ${(metrics.deployments_completed?.values.count || 0) >= 50 ? 'YES ✓' : 'NO ✗'}

Bottlenecks Identified:
  - Check queue worker capacity if completion rate < 100%
  - Review database connection pool if high failure rate
  - Analyze deployment logs for specific errors
  `;

  console.log(summary);

  return {
    'test/performance/results/deployment-stress.json': JSON.stringify(data, null, 2),
    'test/performance/results/deployment-stress.txt': summary,
  };
}
