/**
 * Load Test: Portfolio List Endpoint (Section 5.6)
 *
 * Simulates 1000 concurrent users fetching portfolio list
 * Target: Response time <500ms p95
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const failureRate = new Rate('failed_requests');
const listFetchTime = new Trend('list_fetch_duration');

export const options = {
  stages: [
    { duration: '1m', target: 200 },   // Ramp up to 200 users
    { duration: '2m', target: 500 },   // Ramp up to 500 users
    { duration: '3m', target: 1000 },  // Ramp up to 1000 users
    { duration: '3m', target: 1000 },  // Stay at 1000 users
    { duration: '1m', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests should be below 500ms
    'http_req_failed': ['rate<0.01'],   // Error rate should be below 1%
    'list_fetch_duration': ['p(95)<500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test-token';

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  };

  // Fetch portfolio list
  const startTime = Date.now();
  const response = http.get(`${BASE_URL}/api/portfolios`, params);
  const duration = Date.now() - startTime;

  listFetchTime.add(duration);
  failureRate.add(response.status !== 200);

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response has portfolios array': (r) => {
      const body = JSON.parse(r.body);
      return Array.isArray(body.portfolios);
    },
    'response time < 500ms': () => duration < 500,
    'cache headers present': (r) => r.headers['Cache-Control'] !== undefined,
  });

  sleep(Math.random() * 2 + 0.5); // 0.5-2.5 seconds
}
