/**
 * Test script for refactored server
 * Tests that all route modules are working correctly
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function testEndpoint(name, path, method = 'GET', body = null, expectedStatus = 200) {
  try {
    log(`\nTesting: ${name}`, 'blue');
    log(`  ${method} ${path}`, 'yellow');
    
    const result = await makeRequest(path, method, body);
    const passed = result.status === expectedStatus || (expectedStatus === 200 && result.status < 400);
    
    if (passed) {
      log(`  ✓ Status: ${result.status}`, 'green');
      if (result.body && typeof result.body === 'object') {
        log(`  ✓ Response: ${JSON.stringify(result.body).substring(0, 100)}...`, 'green');
      }
      return { name, status: 'PASS', result };
    } else {
      log(`  ✗ Status: ${result.status} (expected ${expectedStatus})`, 'red');
      if (result.body) {
        log(`  ✗ Response: ${JSON.stringify(result.body)}`, 'red');
      }
      return { name, status: 'FAIL', result, expected: expectedStatus };
    }
  } catch (error) {
    log(`  ✗ Error: ${error.message}`, 'red');
    return { name, status: 'ERROR', error: error.message };
  }
}

async function runTests() {
  log('\n🧪 Testing Refactored Server Routes\n', 'blue');
  log('=' .repeat(60), 'blue');

  const tests = [];

  // Health and Status endpoints
  tests.push(await testEndpoint('Health Check', '/health'));
  tests.push(await testEndpoint('API Status', '/api/status'));

  // Auth endpoints (should return 400/401 without auth)
  tests.push(await testEndpoint('Auth Verify (no token)', '/api/auth/verify', 'GET', null, 401));
  tests.push(await testEndpoint('Auth Sessions (no token)', '/api/auth/sessions', 'GET', null, 401));
  tests.push(await testEndpoint('User Profile (no token)', '/api/users/profile', 'GET', null, 401));

  // Resume endpoints (should return 401 without auth)
  tests.push(await testEndpoint('Resumes List (no token)', '/api/resumes', 'GET', null, 401));

  // Job endpoints (should return 401 without auth)
  tests.push(await testEndpoint('Jobs List (no token)', '/api/jobs', 'GET', null, 401));

  // Email endpoints (should return 401 without auth)
  tests.push(await testEndpoint('Emails List (no token)', '/api/emails', 'GET', null, 401));

  // Cover Letter endpoints (should return 401 without auth)
  tests.push(await testEndpoint('Cover Letters List (no token)', '/api/cover-letters', 'GET', null, 401));

  // Portfolio endpoints (should return 401 without auth)
  tests.push(await testEndpoint('Portfolios List (no token)', '/api/portfolios', 'GET', null, 401));

  // File endpoints (should return 401 without auth)
  tests.push(await testEndpoint('Files List (no token)', '/api/cloud-files', 'GET', null, 401));

  // Analytics endpoints (should return 401 without auth)
  tests.push(await testEndpoint('Analytics List (no token)', '/api/analytics', 'GET', null, 401));

  // Discussion endpoints (should return 401 without auth)
  tests.push(await testEndpoint('Discussions List (no token)', '/api/discussions', 'GET', null, 401));

  // Agent endpoints (should return 401 without auth)
  tests.push(await testEndpoint('Agents List (no token)', '/api/agents', 'GET', null, 401));

  // 2FA endpoints (public verify, protected setup)
  tests.push(await testEndpoint('2FA Verify (public)', '/api/auth/2fa/verify', 'POST', { email: 'test@test.com', twoFactorToken: '123456' }, 404));
  tests.push(await testEndpoint('2FA Setup (no token)', '/api/auth/2fa/setup', 'POST', null, 401));

  // Test 404 handler
  tests.push(await testEndpoint('Non-existent Route', '/api/nonexistent', 'GET', null, 404));

  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('\n📊 Test Summary', 'blue');
  log('='.repeat(60), 'blue');

  const passed = tests.filter(t => t.status === 'PASS').length;
  const failed = tests.filter(t => t.status === 'FAIL').length;
  const errors = tests.filter(t => t.status === 'ERROR').length;

  log(`\n✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`⚠️  Errors: ${errors}`, errors > 0 ? 'red' : 'green');
  log(`\nTotal: ${tests.length} tests`, 'blue');

  if (failed > 0 || errors > 0) {
    log('\nFailed Tests:', 'red');
    tests.filter(t => t.status !== 'PASS').forEach(test => {
      log(`  - ${test.name}`, 'red');
      if (test.error) {
        log(`    Error: ${test.error}`, 'red');
      }
      if (test.result) {
        log(`    Got: ${test.result.status}, Expected: ${test.expected || '200'}`, 'red');
      }
    });
    process.exit(1);
  } else {
    log('\n🎉 All tests passed! Refactored server is working correctly.', 'green');
    process.exit(0);
  }
}

// Wait a bit for server to start, then run tests
setTimeout(() => {
  runTests().catch(error => {
    log(`\n❌ Test runner error: ${error.message}`, 'red');
    process.exit(1);
  });
}, 2000);

