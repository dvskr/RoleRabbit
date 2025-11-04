/**
 * Security Endpoints Test Script
 * Tests all authentication and security-related endpoints
 * 
 * Usage: node test-security-endpoints.js
 * 
 * Prerequisites:
 * - API server should be running
 * - Set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables
 * - Or modify the constants below
 */

const http = require('http');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'Test1234!';
const TEST_NEW_EMAIL = process.env.TEST_NEW_EMAIL || 'newemail@example.com';

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, cookies = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE_URL}${path}`);
    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...(cookieString && { 'Cookie': cookieString })
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
            cookies: parseCookies(res.headers['set-cookie'] || [])
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body,
            cookies: parseCookies(res.headers['set-cookie'] || [])
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

function parseCookies(cookieArray) {
  const cookies = {};
  cookieArray.forEach(cookie => {
    const [nameValue] = cookie.split(';');
    const [name, value] = nameValue.split('=');
    cookies[name.trim()] = value;
  });
  return cookies;
}

// Test helper
async function test(name, testFn) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    const result = await testFn();
    if (result.success) {
      results.passed.push(name);
      console.log(`✅ PASSED: ${name}`);
      if (result.data) {
        console.log(`   Response:`, JSON.stringify(result.data, null, 2).substring(0, 200));
      }
    } else {
      results.failed.push({ name, error: result.error });
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    results.failed.push({ name, error: error.message });
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

// Test cases
async function runTests() {
  console.log('🔒 Security Endpoints Test Suite');
  console.log('==================================');
  console.log(`API URL: ${API_BASE_URL}`);
  console.log(`Test User: ${TEST_USER_EMAIL}`);

  let authCookies = {};
  let authToken = '';

  // Test 1: Login
  await test('Login with valid credentials', async () => {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });

    if (response.status === 200 && response.data.success) {
      authCookies = { ...authCookies, ...response.cookies };
      authToken = response.data.token || response.cookies.auth_token;
      return { success: true, data: { user: response.data.user?.email } };
    }
    return { success: false, error: `Login failed: ${response.status}` };
  });

  // Test 2: Verify authentication
  await test('Verify authentication token', async () => {
    const response = await makeRequest('GET', '/api/auth/verify', null, authCookies);
    return {
      success: response.status === 200 && response.data.success,
      error: response.status !== 200 ? `Status: ${response.status}` : null
    };
  });

  // Test 3: Send OTP for password reset
  await test('Send OTP for password reset', async () => {
    const response = await makeRequest('POST', '/api/auth/send-otp', {
      purpose: 'password_reset'
    }, authCookies);

    if (response.status === 200 && response.data.success) {
      // In development, OTP might be in response
      return { success: true, data: { message: response.data.message } };
    }
    return { success: false, error: `Failed: ${response.status} - ${response.data.error}` };
  });

  // Test 4: Send OTP for email update
  await test('Send OTP for email update (current email)', async () => {
    const response = await makeRequest('POST', '/api/auth/send-otp', {
      purpose: 'email_update'
    }, authCookies);

    return {
      success: response.status === 200 && response.data.success,
      error: response.status !== 200 ? `Status: ${response.status}` : null
    };
  });

  // Test 5: Verify OTP for email update (Step 1: Verify current email)
  await test('Verify current email OTP (Step 1)', async () => {
    // First get OTP from database or logs (in production, would come from email)
    // For testing, we'll check if endpoint accepts valid format
    const response = await makeRequest('POST', '/api/auth/verify-otp-update-email', {
      otp: '123456', // This will fail, but tests endpoint structure
      newEmail: TEST_NEW_EMAIL,
      step: 'verify_current'
    }, authCookies);

    // We expect this to fail with invalid OTP, which confirms endpoint works
    return {
      success: response.status === 400 && response.data.error?.includes('OTP'),
      error: response.status === 200 ? 'Should fail with invalid OTP' : null
    };
  });

  // Test 6: Send OTP to new email
  await test('Send OTP to new email (Step 2)', async () => {
    // This requires Step 1 to be completed first, so will fail
    const response = await makeRequest('POST', '/api/auth/send-otp-to-new-email', {
      newEmail: TEST_NEW_EMAIL
    }, authCookies);

    // Expected to fail because current email not verified yet
    return {
      success: response.status === 400 && response.data.error?.includes('verify'),
      error: response.status === 200 ? 'Should require current email verification first' : null
    };
  });

  // Test 7: Change password (requires current password)
  await test('Change password endpoint exists', async () => {
    const response = await makeRequest('POST', '/api/auth/password/change', {
      currentPassword: 'WrongPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    }, authCookies);

    // Should fail with wrong password, confirming endpoint works
    return {
      success: response.status === 400 || response.status === 401,
      error: response.status === 200 ? 'Should fail with wrong password' : null
    };
  });

  // Test 8: Verify OTP reset password
  await test('Verify OTP and reset password endpoint', async () => {
    const response = await makeRequest('POST', '/api/auth/verify-otp-reset-password', {
      otp: '123456',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    }, authCookies);

    // Should fail with invalid OTP
    return {
      success: response.status === 400 && response.data.error?.includes('OTP'),
      error: response.status === 200 ? 'Should fail with invalid OTP' : null
    };
  });

  // Test 9: Session management
  await test('Get user sessions', async () => {
    const response = await makeRequest('GET', '/api/auth/sessions', null, authCookies);
    return {
      success: response.status === 200 && Array.isArray(response.data.sessions),
      error: response.status !== 200 ? `Status: ${response.status}` : null
    };
  });

  // Test 10: Logout
  await test('Logout', async () => {
    const response = await makeRequest('POST', '/api/auth/logout', null, authCookies);
    return {
      success: response.status === 200 && response.data.success,
      error: response.status !== 200 ? `Status: ${response.status}` : null
    };
  });

  // Test 11: Verify token invalidated after logout
  await test('Verify token invalidated after logout', async () => {
    const response = await makeRequest('GET', '/api/auth/verify', null, authCookies);
    return {
      success: response.status === 401 || response.status === 403,
      error: response.status === 200 ? 'Token should be invalid after logout' : null
    };
  });

  // Print summary
  console.log('\n\n📊 Test Summary');
  console.log('================');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);

  if (results.passed.length > 0) {
    console.log('\n✅ Passed Tests:');
    results.passed.forEach(name => console.log(`   - ${name}`));
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(({ name, error }) => {
      console.log(`   - ${name}: ${error}`);
    });
  }

  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

