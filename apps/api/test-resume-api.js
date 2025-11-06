/**
 * Test script to verify resume API endpoints
 * This will test if the API is working (without auth)
 */

const API_BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing Resume API Endpoints...\n');
  
  // Test 1: Check API status
  console.log('1️⃣ Testing API status endpoint...');
  try {
    const statusRes = await fetch(`${API_BASE_URL}/api/status`);
    const statusData = await statusRes.json();
    console.log('✅ API Status:', statusData.message);
  } catch (error) {
    console.error('❌ API Status failed:', error.message);
    console.log('   Make sure the API server is running on port 3001');
    return;
  }
  
  // Test 2: Try to get resumes (will fail without auth, but shows endpoint exists)
  console.log('\n2️⃣ Testing GET /api/resumes (will fail without auth)...');
  try {
    const resumesRes = await fetch(`${API_BASE_URL}/api/resumes`, {
      credentials: 'include'
    });
    const resumesData = await resumesRes.json();
    if (resumesRes.status === 401) {
      console.log('⚠️  Got 401 Unauthorized (expected without auth)');
      console.log('   Response:', resumesData);
    } else if (resumesRes.ok) {
      console.log('✅ Got resumes:', resumesData);
    } else {
      console.log('⚠️  Unexpected status:', resumesRes.status);
      console.log('   Response:', resumesData);
    }
  } catch (error) {
    console.error('❌ GET /api/resumes failed:', error.message);
  }
  
  console.log('\n📝 Next steps:');
  console.log('   1. Make sure you are logged in to the app');
  console.log('   2. Open browser console (F12)');
  console.log('   3. Enter data in resume editor');
  console.log('   4. Wait 5-7 seconds');
  console.log('   5. Check Network tab for POST /api/resumes calls');
  console.log('   6. Check console for log messages');
}

testAPI();

