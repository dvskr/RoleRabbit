/**
 * Load Testing Script for Templates API
 * Uses k6 for load and stress testing
 *
 * Installation:
 *   brew install k6  (macOS)
 *   choco install k6 (Windows)
 *   sudo apt install k6 (Linux)
 *
 * Run:
 *   k6 run load-tests/templates-load-test.js
 *
 * Run with options:
 *   k6 run --vus 100 --duration 5m load-tests/templates-load-test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const templateLoadTime = new Trend('template_load_time');
const filterResponseTime = new Trend('filter_response_time');
const favoriteResponseTime = new Trend('favorite_response_time');
const searchResponseTime = new Trend('search_response_time');
const apiErrors = new Counter('api_errors');

// Test configuration
export const options = {
  // Stages define the load pattern
  stages: [
    // Ramp-up
    { duration: '2m', target: 50 },   // Ramp up to 50 users over 2 minutes
    { duration: '5m', target: 50 },   // Stay at 50 users for 5 minutes
    { duration: '2m', target: 100 },  // Ramp up to 100 users over 2 minutes
    { duration: '5m', target: 100 },  // Stay at 100 users for 5 minutes
    { duration: '2m', target: 200 },  // Spike to 200 users
    { duration: '3m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],

  // Performance thresholds
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    http_req_failed: ['rate<0.01'], // Error rate < 1%
    errors: ['rate<0.05'], // Custom error rate < 5%
    template_load_time: ['p(95)<1000'], // 95% load in < 1s
    filter_response_time: ['p(95)<500'], // 95% filter in < 500ms
    favorite_response_time: ['p(95)<300'], // 95% favorite toggle < 300ms
    search_response_time: ['p(95)<800'], // 95% search < 800ms
  },

  // HTTP configuration
  noConnectionReuse: false,
  userAgent: 'K6LoadTest/1.0',
};

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const WEB_URL = __ENV.WEB_URL || 'http://localhost:3000';

// Test data
const categories = ['ATS', 'CREATIVE', 'MODERN', 'MINIMAL', 'EXECUTIVE', 'ACADEMIC'];
const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
const sortOptions = ['popular', 'newest', 'rating', 'name'];
const searchTerms = ['professional', 'modern', 'creative', 'resume', 'template'];

// Helper functions
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simulated user session
export default function () {
  group('User Session - Templates Feature', function () {

    // 1. Load Templates Page
    group('Load Templates Page', function () {
      const startTime = new Date();

      const params = {
        headers: {
          'Accept': 'application/json',
        },
      };

      const res = http.get(`${BASE_URL}/api/templates`, params);

      const duration = new Date() - startTime;
      templateLoadTime.add(duration);

      const success = check(res, {
        'templates loaded': (r) => r.status === 200,
        'has templates data': (r) => {
          const body = JSON.parse(r.body);
          return body.success && Array.isArray(body.data);
        },
        'response time OK': (r) => r.timings.duration < 1000,
      });

      if (!success) {
        errorRate.add(1);
        apiErrors.add(1);
      } else {
        errorRate.add(0);
      }
    });

    sleep(randomInt(1, 3));

    // 2. Filter Templates
    group('Apply Filters', function () {
      const category = randomItem(categories);
      const difficulty = randomItem(difficulties);
      const startTime = new Date();

      const res = http.get(
        `${BASE_URL}/api/templates?category=${category}&difficulty=${difficulty}`
      );

      const duration = new Date() - startTime;
      filterResponseTime.add(duration);

      check(res, {
        'filter applied': (r) => r.status === 200,
        'filtered results returned': (r) => {
          const body = JSON.parse(r.body);
          return body.success && Array.isArray(body.data);
        },
      });
    });

    sleep(randomInt(1, 2));

    // 3. Sort Templates
    group('Sort Templates', function () {
      const sortBy = randomItem(sortOptions);

      const res = http.get(`${BASE_URL}/api/templates?sortBy=${sortBy}`);

      check(res, {
        'sort applied': (r) => r.status === 200,
        'sorted results': (r) => r.status === 200,
      });
    });

    sleep(randomInt(1, 2));

    // 4. Search Templates
    group('Search Templates', function () {
      const searchTerm = randomItem(searchTerms);
      const startTime = new Date();

      const res = http.get(`${BASE_URL}/api/templates/search?q=${searchTerm}`);

      const duration = new Date() - startTime;
      searchResponseTime.add(duration);

      check(res, {
        'search executed': (r) => r.status === 200,
        'search results returned': (r) => {
          const body = JSON.parse(r.body);
          return body.success && Array.isArray(body.data);
        },
      });
    });

    sleep(randomInt(1, 3));

    // 5. Get Template Details
    group('View Template Details', function () {
      // First get a template ID
      const listRes = http.get(`${BASE_URL}/api/templates?limit=10`);

      if (listRes.status === 200) {
        const body = JSON.parse(listRes.body);

        if (body.data && body.data.length > 0) {
          const templateId = body.data[0].id;

          const detailsRes = http.get(`${BASE_URL}/api/templates/${templateId}`);

          check(detailsRes, {
            'template details loaded': (r) => r.status === 200,
            'has template data': (r) => {
              const detailBody = JSON.parse(r.body);
              return detailBody.success && detailBody.data;
            },
          });
        }
      }
    });

    sleep(randomInt(1, 2));

    // 6. Toggle Favorite (requires auth - simulate)
    group('Toggle Favorite', function () {
      // Get a template first
      const listRes = http.get(`${BASE_URL}/api/templates?limit=5`);

      if (listRes.status === 200) {
        const body = JSON.parse(listRes.body);

        if (body.data && body.data.length > 0) {
          const templateId = body.data[0].id;
          const startTime = new Date();

          // Note: This will fail without auth, but we're testing the endpoint
          const favoriteRes = http.post(
            `${BASE_URL}/api/templates/${templateId}/favorite`,
            null,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          const duration = new Date() - startTime;
          favoriteResponseTime.add(duration);

          check(favoriteRes, {
            'favorite endpoint responds': (r) => r.status === 200 || r.status === 401,
          });
        }
      }
    });

    sleep(randomInt(1, 2));

    // 7. Pagination
    group('Paginate Results', function () {
      const page = randomInt(1, 5);

      const res = http.get(`${BASE_URL}/api/templates?page=${page}&limit=12`);

      check(res, {
        'pagination works': (r) => r.status === 200,
        'has pagination info': (r) => {
          const body = JSON.parse(r.body);
          return body.pagination && body.pagination.page === page;
        },
      });
    });

    sleep(randomInt(1, 3));

    // 8. Get Stats
    group('Get Template Stats', function () {
      const res = http.get(`${BASE_URL}/api/templates/stats`);

      check(res, {
        'stats loaded': (r) => r.status === 200,
        'has stats data': (r) => {
          const body = JSON.parse(r.body);
          return body.success && body.data;
        },
      });
    });

    sleep(randomInt(2, 5));
  });
}

// Setup function - runs once per VU before main function
export function setup() {
  console.log('Starting load test...');
  console.log(`Target: ${BASE_URL}`);
  console.log('Load pattern: Ramp 50 -> 100 -> 200 users');

  // Verify API is accessible
  const res = http.get(`${BASE_URL}/api/templates`);

  if (res.status !== 200) {
    console.error('API not accessible! Status:', res.status);
    return { apiAvailable: false };
  }

  console.log('API is accessible. Starting test...');
  return { apiAvailable: true };
}

// Teardown function - runs once after all VUs complete
export function teardown(data) {
  if (!data.apiAvailable) {
    console.log('Test completed with API access issues');
    return;
  }

  console.log('Load test completed successfully');
}

// Handle test results
export function handleSummary(data) {
  return {
    'load-test-summary.json': JSON.stringify(data, null, 2),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// Helper for text summary
function textSummary(data, options) {
  const lines = [];

  lines.push(`
Load Test Summary
=================

Scenarios executed: ${data.root_group.name}
VUs used: ${data.metrics.vus?.values?.max || 'N/A'}
Duration: ${(data.state.testRunDurationMs / 1000).toFixed(2)}s
Iterations: ${data.metrics.iterations?.values?.count || 0}

HTTP Metrics:
-------------
Requests: ${data.metrics.http_reqs?.values?.count || 0}
Failed requests: ${data.metrics.http_req_failed?.values?.rate || 0}
Request duration (p95): ${data.metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms
Request duration (p99): ${data.metrics.http_req_duration?.values?.['p(99)']?.toFixed(2) || 'N/A'}ms

Custom Metrics:
--------------
Template load time (p95): ${data.metrics.template_load_time?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms
Filter response time (p95): ${data.metrics.filter_response_time?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms
Search response time (p95): ${data.metrics.search_response_time?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms
Error rate: ${((data.metrics.errors?.values?.rate || 0) * 100).toFixed(2)}%
API errors: ${data.metrics.api_errors?.values?.count || 0}
`);

  return lines.join('\n');
}
