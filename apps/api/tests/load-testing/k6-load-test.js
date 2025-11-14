/**
 * Load Testing Script using k6
 * Tests API endpoints under various load conditions
 * 
 * Installation: https://k6.io/docs/getting-started/installation/
 * Run: k6 run k6-load-test.js
 * 
 * Scenarios:
 * 1. Smoke Test - Verify system works with minimal load
 * 2. Load Test - Test normal expected load
 * 3. Stress Test - Find breaking point
 * 4. Spike Test - Test sudden traffic increase
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'your-test-jwt-token';

// Test scenarios
export const options = {
  scenarios: {
    // Scenario 1: Smoke Test (2 VUs for 1 minute)
    smoke: {
      executor: 'constant-vus',
      vus: 2,
      duration: '1m',
      tags: { test_type: 'smoke' },
      exec: 'smokeTest',
    },
    
    // Scenario 2: Load Test (Ramp up to 50 VUs over 5 minutes)
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },  // Ramp up to 10 users
        { duration: '5m', target: 50 },  // Ramp up to 50 users
        { duration: '5m', target: 50 },  // Stay at 50 users
        { duration: '2m', target: 0 },   // Ramp down to 0 users
      ],
      tags: { test_type: 'load' },
      exec: 'loadTest',
      startTime: '2m', // Start after smoke test
    },
    
    // Scenario 3: Stress Test (Find breaking point)
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up to 50
        { duration: '5m', target: 100 },  // Ramp up to 100
        { duration: '5m', target: 200 },  // Ramp up to 200
        { duration: '2m', target: 0 },    // Ramp down
      ],
      tags: { test_type: 'stress' },
      exec: 'stressTest',
      startTime: '16m', // Start after load test
    },
    
    // Scenario 4: Spike Test (Sudden traffic increase)
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 }, // Sudden spike
        { duration: '1m', target: 100 },  // Stay at spike
        { duration: '10s', target: 0 },   // Drop back
      ],
      tags: { test_type: 'spike' },
      exec: 'spikeTest',
      startTime: '30m', // Start after stress test
    },
  },
  
  thresholds: {
    // Error rate should be less than 1%
    'errors': ['rate<0.01'],
    
    // 95% of requests should be below 2000ms
    'http_req_duration': ['p(95)<2000'],
    
    // 99% of requests should be below 5000ms
    'http_req_duration{test_type:load}': ['p(99)<5000'],
    
    // API duration should be reasonable
    'api_duration': ['avg<1000', 'p(95)<2000'],
  },
};

// Helper function to make authenticated requests
function makeAuthRequest(method, url, body = null) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
    tags: { name: url },
  };
  
  const startTime = Date.now();
  let response;
  
  if (method === 'GET') {
    response = http.get(`${BASE_URL}${url}`, params);
  } else if (method === 'POST') {
    response = http.post(`${BASE_URL}${url}`, JSON.stringify(body), params);
  } else if (method === 'PUT') {
    response = http.put(`${BASE_URL}${url}`, JSON.stringify(body), params);
  } else if (method === 'DELETE') {
    response = http.del(`${BASE_URL}${url}`, null, params);
  }
  
  const duration = Date.now() - startTime;
  apiDuration.add(duration);
  
  return response;
}

// Smoke Test - Basic functionality check
export function smokeTest() {
  // Test 1: Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check has status field': (r) => JSON.parse(r.body).status === 'ok',
  }) || errorRate.add(1);
  
  // Test 2: API status
  const statusRes = http.get(`${BASE_URL}/api/status`);
  check(statusRes, {
    'status endpoint is 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(1);
}

// Load Test - Normal expected load
export function loadTest() {
  // Test 1: Get user profile (most common operation)
  const profileRes = makeAuthRequest('GET', '/api/users/profile');
  const profileCheck = check(profileRes, {
    'profile status is 200': (r) => r.status === 200,
    'profile has user data': (r) => JSON.parse(r.body).user !== undefined,
    'profile response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  if (profileCheck) {
    successfulRequests.add(1);
  } else {
    failedRequests.add(1);
    errorRate.add(1);
  }
  
  // Test 2: Get resumes list
  const resumesRes = makeAuthRequest('GET', '/api/base-resumes');
  check(resumesRes, {
    'resumes status is 200': (r) => r.status === 200,
    'resumes response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);
  
  // Test 3: Health check (lightweight)
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check is fast': (r) => r.timings.duration < 100,
  }) || errorRate.add(1);
  
  sleep(Math.random() * 3 + 2); // Random sleep 2-5 seconds
}

// Stress Test - Push system to limits
export function stressTest() {
  // Test with higher frequency, less sleep
  const profileRes = makeAuthRequest('GET', '/api/users/profile');
  check(profileRes, {
    'profile still works under stress': (r) => r.status === 200 || r.status === 429,
  }) || errorRate.add(1);
  
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check still responds': (r) => r.status === 200 || r.status === 503,
  }) || errorRate.add(1);
  
  sleep(Math.random() * 2 + 0.5); // Random sleep 0.5-2.5 seconds
}

// Spike Test - Sudden traffic increase
export function spikeTest() {
  // Simulate sudden burst of traffic
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'system handles spike': (r) => r.status === 200,
    'spike response time acceptable': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
  
  sleep(0.1); // Minimal sleep during spike
}

// Summary handler
export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = '\n\n';
  summary += `${indent}Load Test Summary\n`;
  summary += `${indent}${'='.repeat(60)}\n\n`;
  
  // Overall stats
  summary += `${indent}Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}Failed Requests: ${data.metrics.failed_requests?.values.count || 0}\n`;
  summary += `${indent}Error Rate: ${(data.metrics.errors?.values.rate * 100).toFixed(2)}%\n\n`;
  
  // Response times
  summary += `${indent}Response Times:\n`;
  summary += `${indent}  Average: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}  Median (p50): ${data.metrics.http_req_duration.values['p(50)'].toFixed(2)}ms\n`;
  summary += `${indent}  p95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}  p99: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  summary += `${indent}  Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n\n`;
  
  // Thresholds
  summary += `${indent}Thresholds:\n`;
  Object.keys(data.metrics).forEach(metric => {
    if (data.metrics[metric].thresholds) {
      Object.keys(data.metrics[metric].thresholds).forEach(threshold => {
        const passed = data.metrics[metric].thresholds[threshold].ok;
        const status = passed ? '✓ PASS' : '✗ FAIL';
        summary += `${indent}  ${status}: ${metric} ${threshold}\n`;
      });
    }
  });
  
  summary += `\n${indent}${'='.repeat(60)}\n`;
  
  return summary;
}

