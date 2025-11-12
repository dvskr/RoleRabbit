/**
 * Quick Endpoint Verification Script
 * Verifies all security endpoints are registered and accessible
 */

const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:3001';

const endpoints = [
  { method: 'POST', path: '/api/auth/send-otp', requiresAuth: true, description: 'Send OTP to current email' },
  { method: 'POST', path: '/api/auth/send-otp-to-new-email', requiresAuth: true, description: 'Send OTP to new email' },
  { method: 'POST', path: '/api/auth/verify-otp-update-email', requiresAuth: true, description: 'Verify OTP and update email' },
  { method: 'POST', path: '/api/auth/verify-otp-reset-password', requiresAuth: true, description: 'Verify OTP and reset password' },
  { method: 'POST', path: '/api/auth/password/change', requiresAuth: true, description: 'Change password' },
  { method: 'GET', path: '/api/auth/verify', requiresAuth: true, description: 'Verify authentication' },
];

function checkEndpoint(method, path, requiresAuth) {
  return new Promise((resolve) => {
    const url = new URL(`${API_URL}${path}`);
    
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        // Endpoint exists if:
        // - 400: Bad request (endpoint exists, wrong params)
        // - 401: Unauthorized (endpoint exists, needs auth)
        // - 404: Not found (endpoint doesn't exist)
        const exists = res.statusCode !== 404;
        const needsAuth = res.statusCode === 401 && requiresAuth;
        
        resolve({
          exists,
          needsAuth,
          status: res.statusCode,
          correct: exists && (needsAuth || res.statusCode === 400)
        });
      });
    });

    req.on('error', () => {
      resolve({ exists: false, needsAuth: false, status: 0, correct: false });
    });

    if (method === 'POST') {
      req.write(JSON.stringify({}));
    }
    
    req.end();
  });
}

async function verifyAll() {
  console.log('🔍 Verifying Security Endpoints...\n');
  console.log(`API URL: ${API_URL}\n`);

  const results = [];

  for (const endpoint of endpoints) {
    const result = await checkEndpoint(endpoint.method, endpoint.path, endpoint.requiresAuth);
    results.push({ ...endpoint, ...result });
    
    const status = result.correct ? '✅' : result.exists ? '⚠️' : '❌';
    console.log(`${status} ${endpoint.method} ${endpoint.path}`);
    console.log(`   ${endpoint.description}`);
    if (result.status > 0) {
      console.log(`   Status: ${result.status} ${result.needsAuth ? '(Requires Auth ✓)' : ''}`);
    } else {
      console.log(`   Status: Not accessible`);
    }
    console.log('');
  }

  const allWorking = results.every(r => r.correct);
  const allExist = results.every(r => r.exists);

  console.log('\n📊 Summary:');
  console.log(`   Total Endpoints: ${endpoints.length}`);
  console.log(`   ✅ Working: ${results.filter(r => r.correct).length}`);
  console.log(`   ⚠️  Exist but need auth: ${results.filter(r => r.exists && !r.correct).length}`);
  console.log(`   ❌ Not found: ${results.filter(r => !r.exists).length}`);

  if (allWorking) {
    console.log('\n✅ All endpoints are registered and working!');
    console.log('   Ready for real-time testing through the UI.');
  } else if (allExist) {
    console.log('\n⚠️  All endpoints exist but require authentication.');
    console.log('   This is expected - test through the UI with logged-in user.');
  } else {
    console.log('\n❌ Some endpoints are missing. Check server logs.');
  }

  return allExist;
}

verifyAll().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

