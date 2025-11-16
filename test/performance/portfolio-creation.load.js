/**
 * Load Test: Portfolio Creation Endpoint (Section 5.6)
 *
 * Simulates 100 concurrent users creating portfolios
 * Target: Response time <2s p95
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const failureRate = new Rate('failed_requests');
const portfolioCreationTime = new Trend('portfolio_creation_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '2m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests should be below 2s
    'http_req_failed': ['rate<0.05'],    // Error rate should be below 5%
    'portfolio_creation_duration': ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test-token';

export default function () {
  const portfolioData = {
    title: `Test Portfolio ${__VU}-${__ITER}`,
    subtitle: `Test User ${__VU}`,
    description: 'A test portfolio for load testing',
    templateId: 'template-modern-1',
    subdomain: `test-${__VU}-${__ITER}-${Date.now()}`,
    settings: {
      theme: 'dark',
      primaryColor: '#3B82F6',
      fontFamily: 'Inter',
    },
  };

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  };

  // Create portfolio
  const startTime = Date.now();
  const response = http.post(
    `${BASE_URL}/api/portfolios`,
    JSON.stringify(portfolioData),
    params
  );
  const duration = Date.now() - startTime;

  // Record metrics
  portfolioCreationTime.add(duration);
  failureRate.add(response.status !== 201);

  // Validate response
  check(response, {
    'status is 201': (r) => r.status === 201,
    'response has portfolio ID': (r) => {
      const body = JSON.parse(r.body);
      return body.portfolio && body.portfolio.id;
    },
    'response time < 2000ms': () => duration < 2000,
  });

  // Think time
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

export function handleSummary(data) {
  return {
    'test/performance/results/portfolio-creation.json': JSON.stringify(data, null, 2),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, { indent, enableColors }) {
  const { metrics } = data;

  return `
${indent}Portfolio Creation Load Test Summary
${indent}====================================

${indent}Requests:
${indent}  Total: ${metrics.http_reqs.values.count}
${indent}  Failed: ${metrics.http_req_failed.values.rate * 100}%

${indent}Response Times:
${indent}  Min: ${metrics.http_req_duration.values.min.toFixed(2)}ms
${indent}  Max: ${metrics.http_req_duration.values.max.toFixed(2)}ms
${indent}  Avg: ${metrics.http_req_duration.values.avg.toFixed(2)}ms
${indent}  p95: ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
${indent}  p99: ${metrics.http_req_duration.values['p(99)'].toFixed(2)}ms

${indent}Portfolio Creation:
${indent}  Avg: ${metrics.portfolio_creation_duration.values.avg.toFixed(2)}ms
${indent}  p95: ${metrics.portfolio_creation_duration.values['p(95)'].toFixed(2)}ms

${indent}Virtual Users:
${indent}  Max: ${metrics.vus_max.values.value}
${indent}  Concurrent: ${metrics.vus.values.value}

${indent}Thresholds:
${indent}  p95 < 2000ms: ${metrics.http_req_duration.values['p(95)'] < 2000 ? '✓ PASS' : '✗ FAIL'}
${indent}  Error rate < 5%: ${metrics.http_req_failed.values.rate < 0.05 ? '✓ PASS' : '✗ FAIL'}
  `;
}
