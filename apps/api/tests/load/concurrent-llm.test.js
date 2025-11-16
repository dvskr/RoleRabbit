/**
 * Load Test: Concurrent LLM Operations
 * 
 * Tool: k6
 * Scenario: 50 concurrent ATS checks
 * Verify: Rate limiting works, no timeouts
 * 
 * Run with: k6 run apps/api/tests/load/concurrent-llm.test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const rateLimitHits = new Counter('rate_limit_hits');
const atsResponseTime = new Trend('ats_response_time');
const timeouts = new Counter('timeouts');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 25 },   // Ramp up to 25 users
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<60000'], // 95% should complete within 60s (LLM timeout)
    'errors': ['rate<0.05'],              // Error rate should be below 5%
    'timeouts': ['count<10'],             // Less than 10 timeouts total
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001';

const SAMPLE_RESUME_DATA = {
  contact: {
    name: 'John Doe',
    email: 'john@example.com',
  },
  summary: 'Software engineer with 5 years of experience',
  experience: [
    {
      company: 'Tech Corp',
      role: 'Senior Engineer',
      bullets: ['Built scalable systems', 'Led team of 5']
    }
  ],
  skills: {
    technical: ['JavaScript', 'React', 'Node.js']
  }
};

const SAMPLE_JOB_DESCRIPTION = `
Senior Software Engineer

Requirements:
- 5+ years of software development experience
- Strong knowledge of JavaScript, React, and Node.js
- Experience with cloud platforms (AWS, Azure, or GCP)
- Excellent problem-solving skills
- Strong communication abilities

Responsibilities:
- Design and develop scalable web applications
- Lead technical projects and mentor junior developers
- Collaborate with cross-functional teams
- Write clean, maintainable code
`;

export function setup() {
  return { token: 'test-jwt-token' };
}

export default function(data) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.token}`,
    },
    timeout: '65s', // Slightly longer than server timeout
  };

  // Test: ATS Score Check
  const atsPayload = JSON.stringify({
    resumeData: SAMPLE_RESUME_DATA,
    jobDescription: SAMPLE_JOB_DESCRIPTION,
  });

  const startTime = new Date().getTime();
  const atsResponse = http.post(
    `${BASE_URL}/api/editor-ai/ats-score`,
    atsPayload,
    params
  );
  const duration = new Date().getTime() - startTime;

  const atsSuccess = check(atsResponse, {
    'ATS status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'ATS response time < 60s': (r) => r.timings.duration < 60000,
    'ATS has valid response': (r) => {
      if (r.status === 200) {
        const body = JSON.parse(r.body);
        return body.success && body.data && typeof body.data.score === 'number';
      }
      return true; // Rate limited is acceptable
    },
  });

  // Track rate limiting
  if (atsResponse.status === 429) {
    rateLimitHits.add(1);
    console.log('Rate limit hit - this is expected behavior');
  }

  // Track timeouts
  if (duration >= 60000) {
    timeouts.add(1);
  }

  errorRate.add(!atsSuccess && atsResponse.status !== 429);
  atsResponseTime.add(atsResponse.timings.duration);

  // Log slow responses
  if (atsResponse.timings.duration > 30000) {
    console.log(`Slow ATS response: ${atsResponse.timings.duration}ms`);
  }

  // Simulate user think time
  sleep(2);
}

export function teardown(data) {
  console.log('LLM load test completed');
  console.log(`Rate limit hits: ${rateLimitHits.count}`);
  console.log(`Timeouts: ${timeouts.count}`);
}

 * Load Test: Concurrent LLM Operations
 * 
 * Tool: k6
 * Scenario: 50 concurrent ATS checks
 * Verify: Rate limiting works, no timeouts
 * 
 * Run with: k6 run apps/api/tests/load/concurrent-llm.test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const rateLimitHits = new Counter('rate_limit_hits');
const atsResponseTime = new Trend('ats_response_time');
const timeouts = new Counter('timeouts');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 25 },   // Ramp up to 25 users
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<60000'], // 95% should complete within 60s (LLM timeout)
    'errors': ['rate<0.05'],              // Error rate should be below 5%
    'timeouts': ['count<10'],             // Less than 10 timeouts total
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001';

const SAMPLE_RESUME_DATA = {
  contact: {
    name: 'John Doe',
    email: 'john@example.com',
  },
  summary: 'Software engineer with 5 years of experience',
  experience: [
    {
      company: 'Tech Corp',
      role: 'Senior Engineer',
      bullets: ['Built scalable systems', 'Led team of 5']
    }
  ],
  skills: {
    technical: ['JavaScript', 'React', 'Node.js']
  }
};

const SAMPLE_JOB_DESCRIPTION = `
Senior Software Engineer

Requirements:
- 5+ years of software development experience
- Strong knowledge of JavaScript, React, and Node.js
- Experience with cloud platforms (AWS, Azure, or GCP)
- Excellent problem-solving skills
- Strong communication abilities

Responsibilities:
- Design and develop scalable web applications
- Lead technical projects and mentor junior developers
- Collaborate with cross-functional teams
- Write clean, maintainable code
`;

export function setup() {
  return { token: 'test-jwt-token' };
}

export default function(data) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.token}`,
    },
    timeout: '65s', // Slightly longer than server timeout
  };

  // Test: ATS Score Check
  const atsPayload = JSON.stringify({
    resumeData: SAMPLE_RESUME_DATA,
    jobDescription: SAMPLE_JOB_DESCRIPTION,
  });

  const startTime = new Date().getTime();
  const atsResponse = http.post(
    `${BASE_URL}/api/editor-ai/ats-score`,
    atsPayload,
    params
  );
  const duration = new Date().getTime() - startTime;

  const atsSuccess = check(atsResponse, {
    'ATS status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'ATS response time < 60s': (r) => r.timings.duration < 60000,
    'ATS has valid response': (r) => {
      if (r.status === 200) {
        const body = JSON.parse(r.body);
        return body.success && body.data && typeof body.data.score === 'number';
      }
      return true; // Rate limited is acceptable
    },
  });

  // Track rate limiting
  if (atsResponse.status === 429) {
    rateLimitHits.add(1);
    console.log('Rate limit hit - this is expected behavior');
  }

  // Track timeouts
  if (duration >= 60000) {
    timeouts.add(1);
  }

  errorRate.add(!atsSuccess && atsResponse.status !== 429);
  atsResponseTime.add(atsResponse.timings.duration);

  // Log slow responses
  if (atsResponse.timings.duration > 30000) {
    console.log(`Slow ATS response: ${atsResponse.timings.duration}ms`);
  }

  // Simulate user think time
  sleep(2);
}

export function teardown(data) {
  console.log('LLM load test completed');
  console.log(`Rate limit hits: ${rateLimitHits.count}`);
  console.log(`Timeouts: ${timeouts.count}`);
}

