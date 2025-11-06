/**
 * Incremental test to find which field causes the error
 */

const API_BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = process.env.TEST_EMAIL || 'testresume@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestResume123!';

async function testIncremental() {
  console.log('🧪 Testing Resume Creation Incrementally...\n');
  
  let authCookies = '';
  
  try {
    // Login
    const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
      credentials: 'include'
    });
    
    if (!loginRes.ok) {
      console.error('Login failed');
      return;
    }
    
    const setCookieHeaders = loginRes.headers.getSetCookie();
    authCookies = setCookieHeaders ? setCookieHeaders.join('; ') : '';
    
    // Test 1: Basic fields only
    console.log('Test 1: Basic fields (name, email)...');
    let testData = {
      fileName: 'Test Incremental 1',
      data: {
        resumeData: {
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    };
    
    let res = await fetch(`${API_BASE_URL}/api/resumes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': authCookies },
      credentials: 'include',
      body: JSON.stringify(testData)
    });
    
    if (res.ok) {
      console.log('✅ Test 1 passed\n');
      
      // Test 2: Add skills array
      console.log('Test 2: Adding skills array...');
      testData.data.resumeData.skills = ['JavaScript', 'TypeScript'];
      res = await fetch(`${API_BASE_URL}/api/resumes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': authCookies },
        credentials: 'include',
        body: JSON.stringify(testData)
      });
      
      if (res.ok) {
        console.log('✅ Test 2 passed\n');
        
        // Test 3: Add experience array
        console.log('Test 3: Adding experience array...');
        testData.data.resumeData.experience = [{
          id: '1',
          company: 'Test Company',
          position: 'Engineer',
          period: '2020-01',
          endPeriod: '2024-12',
          location: 'SF',
          bullets: ['Did stuff']
        }];
        res = await fetch(`${API_BASE_URL}/api/resumes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cookie': authCookies },
          credentials: 'include',
          body: JSON.stringify(testData)
        });
        
        if (res.ok) {
          console.log('✅ Test 3 passed\n');
          console.log('✅ All incremental tests passed!');
        } else {
          const error = await res.json();
          console.error('❌ Test 3 FAILED:', error);
          console.log('   Issue is with experience array');
        }
      } else {
        const error = await res.json();
        console.error('❌ Test 2 FAILED:', error);
        console.log('   Issue is with skills array');
      }
    } else {
      const error = await res.json();
      console.error('❌ Test 1 FAILED:', error);
      console.log('   Issue is with basic fields');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testIncremental();

