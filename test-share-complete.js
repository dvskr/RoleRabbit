/**
 * Complete Share Functionality Test
 * Tests all share options with dvskr.1729@gmail.com
 * 
 * Usage: 
 * 1. First, upload a file manually through the UI
 * 2. Get the file ID from the browser console or database
 * 3. Set FILE_ID below
 * 4. Get auth token from browser cookies
 * 5. Run: node test-share-complete.js
 */

const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_EMAIL = 'dvskr.1729@gmail.com';
const FILE_ID = process.env.FILE_ID || 'YOUR_FILE_ID_HERE'; // Replace with actual file ID
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''; // Get from browser cookies

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testShare(description, payload) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🧪 Test: ${description}`, 'blue');
  log(`${'='.repeat(60)}`, 'cyan');
  
  try {
    const response = await fetch(`${API_URL}/api/storage/files/${FILE_ID}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${AUTH_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ SUCCESS', 'green');
      log(`   Share ID: ${data.share?.id || 'N/A'}`, 'green');
      log(`   Permission: ${data.share?.permission || payload.permission}`, 'green');
      if (data.share?.shareLink) {
        log(`   Share Link: ${data.share.shareLink}`, 'green');
      }
      if (data.share?.expiresAt) {
        log(`   Expires At: ${new Date(data.share.expiresAt).toLocaleString()}`, 'green');
      }
      if (data.emailSent) {
        log(`   📧 Email sent to: ${TEST_EMAIL}`, 'green');
      }
      return { success: true, data };
    } else {
      log('❌ FAILED', 'red');
      log(`   Status: ${response.status}`, 'red');
      log(`   Error: ${data.error || data.message || JSON.stringify(data)}`, 'red');
      return { success: false, error: data };
    }
  } catch (error) {
    log('❌ ERROR', 'red');
    log(`   ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  log('\n🚀 Starting Complete Share Functionality Tests', 'cyan');
  log(`📧 Test Email: ${TEST_EMAIL}`, 'yellow');
  log(`📁 File ID: ${FILE_ID}`, 'yellow');
  log(`🌐 API URL: ${API_URL}`, 'yellow');

  if (FILE_ID === 'YOUR_FILE_ID_HERE') {
    log('\n⚠️  Please set FILE_ID in the script or as environment variable', 'yellow');
    log('   You can get the file ID by:', 'yellow');
    log('   1. Uploading a file through the UI', 'yellow');
    log('   2. Opening browser DevTools > Network tab', 'yellow');
    log('   3. Looking at the file list API response', 'yellow');
    return;
  }

  if (!AUTH_TOKEN) {
    log('\n⚠️  Please set AUTH_TOKEN in the script or as environment variable', 'yellow');
    log('   You can get the token by:', 'yellow');
    log('   1. Logging into the app', 'yellow');
    log('   2. Opening browser DevTools > Application > Cookies', 'yellow');
    log('   3. Copy the "token" cookie value', 'yellow');
    return;
  }

  const results = [];

  // Test 1: Basic share with view permission
  results.push(await testShare('Basic Share - View Permission', {
    userEmail: TEST_EMAIL,
    permission: 'view'
  }));

  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests

  // Test 2: Share with comment permission
  results.push(await testShare('Share with Comment Permission', {
    userEmail: TEST_EMAIL,
    permission: 'comment'
  }));

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Share with edit permission
  results.push(await testShare('Share with Edit Permission', {
    userEmail: TEST_EMAIL,
    permission: 'edit'
  }));

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 4: Share with admin permission
  results.push(await testShare('Share with Admin Permission', {
    userEmail: TEST_EMAIL,
    permission: 'admin'
  }));

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 5: Share with expiration date (7 days)
  const expiresAt7Days = new Date();
  expiresAt7Days.setDate(expiresAt7Days.getDate() + 7);
  results.push(await testShare('Share with Expiration (7 days)', {
    userEmail: TEST_EMAIL,
    permission: 'view',
    expiresAt: expiresAt7Days.toISOString()
  }));

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 6: Share with max downloads
  results.push(await testShare('Share with Max Downloads (5)', {
    userEmail: TEST_EMAIL,
    permission: 'view',
    maxDownloads: 5
  }));

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 7: Share with all options combined
  const expiresAt30Days = new Date();
  expiresAt30Days.setDate(expiresAt30Days.getDate() + 30);
  results.push(await testShare('Share with ALL Options (Edit + Expiration + Max Downloads)', {
    userEmail: TEST_EMAIL,
    permission: 'edit',
    expiresAt: expiresAt30Days.toISOString(),
    maxDownloads: 10
  }));

  // Summary
  log(`\n${'='.repeat(60)}`, 'cyan');
  log('📊 Test Summary', 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(`✅ Passed: ${passed}/${results.length}`, passed === results.length ? 'green' : 'yellow');
  if (failed > 0) {
    log(`❌ Failed: ${failed}/${results.length}`, 'red');
  }

  log('\n📧 Check your email inbox at:', 'yellow');
  log(`   ${TEST_EMAIL}`, 'yellow');
  log('   You should receive email notifications for successful shares.', 'yellow');

  log('\n✨ All tests completed!', 'cyan');
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Fatal Error: ${error.message}`, 'red');
  process.exit(1);
});

