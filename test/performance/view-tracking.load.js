/**
 * Load Test: View Tracking Endpoint (Section 5.6)
 *
 * Simulates 10,000 concurrent views
 * Target: Response time <100ms p95
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const viewsTracked = new Counter('views_tracked');
const failureRate = new Rate('failed_requests');
const trackingTime = new Trend('tracking_duration');

export const options = {
  stages: [
    { duration: '1m', target: 1000 },    // Ramp up to 1000 users
    { duration: '2m', target: 5000 },    // Ramp up to 5000 users
    { duration: '2m', target: 10000 },   // Ramp up to 10000 users
    { duration: '3m', target: 10000 },   // Stay at 10000 users
    { duration: '1m', target: 0 },       // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<100'], // 95% of requests should be below 100ms
    'http_req_failed': ['rate<0.01'],   // Error rate should be below 1%
    'tracking_duration': ['p(95)<100'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const PORTFOLIO_IDS = [
  'portfolio-fullstack-1',
  'portfolio-designer-1',
  'portfolio-backend-1',
];

export default function () {
  // Random portfolio ID
  const portfolioId = PORTFOLIO_IDS[Math.floor(Math.random() * PORTFOLIO_IDS.length)];

  const viewData = {
    portfolioId,
    timestamp: new Date().toISOString(),
    userAgent: 'k6-load-test',
    referrer: Math.random() > 0.5 ? 'https://google.com' : 'https://linkedin.com',
    country: ['US', 'GB', 'CA', 'DE'][Math.floor(Math.random() * 4)],
  };

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Track view
  const startTime = Date.now();
  const response = http.post(
    `${BASE_URL}/api/portfolios/${portfolioId}/track-view`,
    JSON.stringify(viewData),
    params
  );
  const duration = Date.now() - startTime;

  trackingTime.add(duration);
  failureRate.add(response.status !== 200 && response.status !== 201);

  const success = check(response, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'response time < 100ms': () => duration < 100,
  });

  if (success) {
    viewsTracked.add(1);
  }

  // No sleep - simulate real high-traffic scenario
}

export function handleSummary(data) {
  const { metrics } = data;

  console.log(`
View Tracking Load Test Results
================================

Total Views Tracked: ${metrics.views_tracked.values.count}
Success Rate: ${(1 - metrics.failed_requests.values.rate) * 100}%
Avg Response Time: ${metrics.tracking_duration.values.avg.toFixed(2)}ms
p95 Response Time: ${metrics.tracking_duration.values['p(95)'].toFixed(2)}ms
p99 Response Time: ${metrics.tracking_duration.values['p(99)'].toFixed(2)}ms

Data Accuracy Verification:
- Check database for ${metrics.views_tracked.values.count} new view records
- Verify aggregated analytics match expected totals
  `);

  return {
    'test/performance/results/view-tracking.json': JSON.stringify(data, null, 2),
  };
}
